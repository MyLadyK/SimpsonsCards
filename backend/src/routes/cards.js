const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Get user's card collection
router.get('/collection', auth, async (req, res) => {
  try {
    const [cards] = await db.query(
      `SELECT c.*, uc.obtained_at 
       FROM cards c 
       INNER JOIN user_cards uc ON c.id = uc.card_id 
       WHERE uc.user_id = ?`,
      [req.user.id]
    );
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collection' });
  }
});

// Draw cards (4 per day)
router.post('/draw', auth, async (req, res) => {
  try {
    // Check user's card drawing status
    const [users] = await db.query(
      'SELECT cards_remaining_today, last_cards_drawn FROM users WHERE id = ?',
      [req.user.id]
    );
    const user = users[0];

    // Reset daily cards if 24 hours have passed
    const now = new Date();
    const lastDrawn = user.last_cards_drawn ? new Date(user.last_cards_drawn) : null;
    if (!lastDrawn || (now - lastDrawn) >= 24 * 60 * 60 * 1000) {
      await db.query(
        'UPDATE users SET cards_remaining_today = 4 WHERE id = ?',
        [req.user.id]
      );
      user.cards_remaining_today = 4;
    }

    if (user.cards_remaining_today <= 0) {
      return res.status(400).json({ 
        message: 'No more cards available today',
        nextDrawTime: new Date(lastDrawn.getTime() + 24 * 60 * 60 * 1000)
      });
    }

    // Draw random cards
    const [cards] = await db.query(
      'SELECT * FROM cards ORDER BY RAND() LIMIT 4'
    );

    // Add cards to user's collection
    const values = cards.map(card => [req.user.id, card.id]);
    await db.query(
      'INSERT INTO user_cards (user_id, card_id) VALUES ?',
      [values]
    );

    // Update user's drawing status
    await db.query(
      'UPDATE users SET cards_remaining_today = cards_remaining_today - ?, last_cards_drawn = NOW() WHERE id = ?',
      [cards.length, req.user.id]
    );

    res.json({ 
      cards,
      remainingDraws: user.cards_remaining_today - cards.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error drawing cards' });
  }
});

// Get card drawing status
router.get('/draw-status', auth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT cards_remaining_today, last_cards_drawn FROM users WHERE id = ?',
      [req.user.id]
    );
    const user = users[0];

    // Check if 24 hours have passed since last draw
    const now = new Date();
    const lastDrawn = user.last_cards_drawn ? new Date(user.last_cards_drawn) : null;
    const canDrawAgain = !lastDrawn || (now - lastDrawn) >= 24 * 60 * 60 * 1000;

    res.json({
      remainingDraws: canDrawAgain ? 4 : user.cards_remaining_today,
      nextDrawTime: canDrawAgain ? now : new Date(lastDrawn.getTime() + 24 * 60 * 60 * 1000)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching draw status' });
  }
});

module.exports = router;
