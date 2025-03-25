const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/db');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if username exists
    const [users] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (users.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Get user
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Claim cards
router.post('/claim-cards', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get user information
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const now = new Date();

    // Check if user can claim cards
    if (user.last_cards_drawn && now < new Date(user.last_cards_drawn.getTime() + 24 * 60 * 60 * 1000)) {
      return res.status(429).json({ 
        message: 'You can only claim cards once per day',
        remainingTime: Math.ceil((24 * 60 * 60 - (now.getTime() - user.last_cards_drawn.getTime()) / 1000) / 60)
      });
    }

    // Get all available cards
    const [allCards] = await db.query('SELECT * FROM cards');
    
    // Get cards the user already has
    const [userCards] = await db.query(
      'SELECT card_id FROM user_cards WHERE user_id = ?',
      [userId]
    );

    // Filter out cards the user already has
    const availableCards = allCards.filter(card => 
      !userCards.some(userCard => userCard.card_id === card.id)
    );

    // Select 4 random cards from available cards
    const selectedCards = [];
    for (let i = 0; i < 4 && availableCards.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      selectedCards.push(availableCards[randomIndex]);
      availableCards.splice(randomIndex, 1);
    }

    // If no cards available
    if (selectedCards.length === 0) {
      return res.status(400).json({ message: 'No more cards available to claim' });
    }

    // Insert new cards into user_cards table
    const insertPromises = selectedCards.map(card =>
      db.query('INSERT INTO user_cards (user_id, card_id) VALUES (?, ?)', [userId, card.id])
    );

    await Promise.all(insertPromises);

    // Update user's last_cards_drawn timestamp
    await db.query(
      'UPDATE users SET last_cards_drawn = ?, cards_remaining_today = 4 WHERE id = ?',
      [now, userId]
    );

    // Return the selected cards
    res.json({
      cards: selectedCards,
      message: 'Cards claimed successfully'
    });

  } catch (error) {
    console.error('Error claiming cards:', error);
    res.status(500).json({ message: 'Error claiming cards' });
  }
});

module.exports = router;
