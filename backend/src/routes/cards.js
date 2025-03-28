const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware to check JWT token
const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user's card collection
router.get('/user', checkAuth, async (req, res) => {
  try {
    const [cards] = await db.query(
      `SELECT c.* 
       FROM cards c 
       INNER JOIN user_cards uc ON c.id = uc.card_id 
       WHERE uc.user_id = ?`,
      [req.user.id]
    );
    res.json(cards);
  } catch (error) {
    console.error('Error getting user cards:', error);
    res.status(500).json({ message: 'Error getting user cards' });
  }
});

// Claim cards (4 per 8 hours)
router.post('/claim-cards', checkAuth, async (req, res) => {
  try {
    // Get user information
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const now = new Date();

    // Check if user can claim cards
    if (user.last_cards_drawn && now < new Date(user.last_cards_drawn.getTime() + 8 * 60 * 60 * 1000)) {
      const remainingTime = Math.ceil((8 * 60 * 60 - (now.getTime() - user.last_cards_drawn.getTime()) / 1000) / 60);
      return res.status(429).json({ 
        message: 'You can only claim cards once every 8 hours',
        remainingTime: remainingTime
      });
    }

    // Randomly select 4 cards
    const [availableCards] = await db.query(
      `SELECT id, name, character_name, image, description, rarity 
       FROM cards 
       ORDER BY RAND() 
       LIMIT 4`
    );

    // Update user's last_cards_drawn timestamp
    await db.query(
      'UPDATE users SET last_cards_drawn = ? WHERE id = ?',
      [now, req.user.id]
    );

    // Add cards to user's collection
    const insertPromises = availableCards.map(card =>
      db.query(
        'INSERT INTO user_cards (user_id, card_id, obtained_at) VALUES (?, ?, NOW())',
        [req.user.id, card.id]
      )
    );

    await Promise.all(insertPromises);

    res.json({
      message: 'Cards claimed successfully',
      cards: availableCards
    });

  } catch (error) {
    console.error('Error claiming cards:', error);
    res.status(500).json({ message: 'Error claiming cards' });
  }
});

module.exports = router;
