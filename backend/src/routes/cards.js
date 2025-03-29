const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Get user's card collection
router.get('/user', auth, async (req, res) => {
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

// Claim cards
router.post('/claim-cards', auth, async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const now = new Date();

    // Get available cards (excluding those already owned by the user)
    const [availableCards] = await db.query(
      `SELECT c.* 
       FROM cards c 
       LEFT JOIN user_cards uc ON c.id = uc.card_id AND uc.user_id = ?
       WHERE uc.user_id IS NULL 
       LIMIT 4`,
      [req.user.id]
    );

    if (availableCards.length === 0) {
      return res.status(404).json({ message: 'No available cards to claim' });
    }

    // Insert the claimed cards into user_cards
    const cardIds = availableCards.map(card => card.id);
    const insertQueries = cardIds.map(id => `(${req.user.id}, ${id})`).join(', ');
    await db.query(`INSERT INTO user_cards (user_id, card_id) VALUES ${insertQueries}`);

    // Update the last claim time
    await db.query(
      'UPDATE users SET last_cards_drawn = ? WHERE id = ?',
      [now, req.user.id]
    );

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
