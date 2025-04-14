// Admin routes
// This file handles all administrative operations for managing users and cards

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Card = require('../models/Card');
const db = require('../config/db');

// Apply authentication middleware to all admin routes
router.use(auth);

// User management routes
// GET /admin/users
// Returns a list of all users in the system
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// DELETE /admin/users/:id
// Deletes a user by their ID
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Card management routes
// GET /admin/cards
// Returns a list of all cards in the system
router.get('/cards', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM cards');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: 'Error fetching cards' });
  }
});

// POST /admin/cards
// Creates a new card in the system
router.post('/cards', async (req, res) => {
  try {
    const { name, character_name, image_url, description, rarity } = req.body;
    const [result] = await db.execute(
      'INSERT INTO cards (name, character_name, image_url, description, rarity) VALUES (?, ?, ?, ?, ?)',
      [name, character_name, image_url, description, rarity]
    );
    res.status(201).json({
      id: result.insertId,
      name,
      character_name,
      image_url,
      description,
      rarity
    });
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ message: 'Error creating card' });
  }
});

// PUT /admin/cards/:id
// Updates an existing card
router.put('/cards/:id', async (req, res) => {
  try {
    const cardId = req.params.id;
    const { name, character_name, image_url, description, rarity } = req.body;
    
    const [result] = await db.execute(
      'UPDATE cards SET name = ?, character_name = ?, image_url = ?, description = ?, rarity = ? WHERE id = ?',
      [name, character_name, image_url, description, rarity, cardId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json({ message: 'Card updated successfully' });
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ message: 'Error updating card' });
  }
});

// DELETE /admin/cards/:id
// Deletes a card by its ID
router.delete('/cards/:id', async (req, res) => {
  try {
    const cardId = req.params.id;
    const [result] = await db.execute('DELETE FROM cards WHERE id = ?', [cardId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ message: 'Error deleting card' });
  }
});

module.exports = router;