// Admin routes
// This file handles all administrative operations for managing users and cards

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Card = require('../models/Card');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
  console.log('DELETE /api/admin/users/:id', req.params.id); 
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

// Normaliza el nombre del personaje para el directorio
function normalizeCharacterDir(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/ /g, '_')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quita tildes
}

// Configuración de multer para almacenamiento dinámico
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const character = req.body.character_name;
    const dir = normalizeCharacterDir(character);
    // Ruta ABSOLUTA al directorio assets del frontend
    const dest = path.join(__dirname, '../../frontend/simpsons-cards/src/assets', dir);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname.replace(/\s/g, '_'));
  }
});
const upload = multer({ storage });

// POST /admin/cards
// Creates a new card in the system (con imagen)
router.post('/cards', upload.single('image'), async (req, res) => {
  try {
    const { name, character_name, description, rarity } = req.body;
    let image_url = req.body.image_url || '';
    let dir = '';
    if (req.file) {
      dir = normalizeCharacterDir(character_name);
      console.log('Dir normalizado:', dir);
      image_url = `/assets/${dir}/${req.file.filename}`;
    }
    // LOG para depuración
    console.log('Valores recibidos:', { name, character_name, image_url, description, rarity });
    const safe = v => v === undefined ? null : v;
    const [result] = await db.execute(
      'INSERT INTO cards (name, character_name, image_url, description, rarity) VALUES (?, ?, ?, ?, ?)',
      [
        safe(name),
        safe(character_name),
        safe(image_url),
        safe(description),
        safe(rarity)
      ]
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