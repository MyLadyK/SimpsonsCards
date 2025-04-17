/**
 * Cards API routes
 * Handles card-related operations
 * @module routes/cards
 */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Card = require('../models/Card');
const User = require('../models/User');
const db = require('../config/db');

/**
 * @swagger
 * components:
 *   schemas:
 *     Card:
 *       type: object
 *       required:
 *         - name
 *         - image
 *         - rarity
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the card
 *         name:
 *           type: string
 *           description: The name of the card
 *         image:
 *           type: string
 *           description: URL of the card image
 *         rarity:
 *           type: integer
 *           description: Rarity level of the card
 *         userId:
 *           type: integer
 *           description: ID of the user who owns the card
 */

/**
 * @swagger
 * /cards:
 *   get:
 *     summary: Get all cards
 *     description: Returns all cards in the database
 *     responses:
 *       200:
 *         description: Array of cards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Card'
 */
router.get('/', async (req, res) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (err) {
    console.error('Error getting all cards:', err);
    res.status(500).send(err);
  }
});

// GET /cards/user - Get all cards of the authenticated user
router.get('/user', async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const cards = await user.getCollection();
    res.json(cards || []);
  } catch (error) {
    console.error('Error al obtener las cartas del usuario:', error);
    res.status(500).json({ message: 'Error interno al obtener cartas' });
  }
});

/**
 * @swagger
 * /cards/{id}:
 *   get:
 *     summary: Get card by ID
 *     description: Returns a card by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Card ID
 *     responses:
 *       200:
 *         description: Card object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       404:
 *         description: Card not found
 */
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).send('Card not found');
    res.json(card);
  } catch (err) {
    console.error('Error getting single card:', err);
    res.status(500).send(err);
  }
});

/**
 * @swagger
 * /cards:
 *   post:
 *     summary: Create a new card
 *     description: Creates a new card in the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Card'
 *     responses:
 *       201:
 *         description: Card created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       400:
 *         description: Invalid input
 */
router.post('/', async (req, res) => {
  try {
    const card = new Card(req.body);
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    console.error('Error creating new card:', err);
    res.status(400).send(err);
  }
});

/**
 * @swagger
 * /cards/{id}:
 *   put:
 *     summary: Update a card
 *     description: Updates an existing card
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Card ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Card'
 *     responses:
 *       200:
 *         description: Card updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       404:
 *         description: Card not found
 */
router.put('/:id', async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!card) return res.status(404).send('Card not found');
    res.json(card);
  } catch (err) {
    console.error('Error updating card:', err);
    res.status(400).send(err);
  }
});

/**
 * @swagger
 * /cards/{id}:
 *   delete:
 *     summary: Delete a card
 *     description: Deletes a card by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Card ID
 *     responses:
 *       200:
 *         description: Card deleted
 *       404:
 *         description: Card not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).send('Card not found');
    res.json({ message: 'Card deleted successfully' });
  } catch (err) {
    console.error('Error deleting card:', err);
    res.status(500).send(err);
  }
});

// Seleccionar 4 cartas aleatorias (permitiendo repetidas)
function getRandomCards(cards, n) {
  const result = [];
  for (let i = 0; i < n; i++) {
    const randomIndex = Math.floor(Math.random() * cards.length);
    result.push(cards[randomIndex]);
  }
  return result;
}

// POST /cards/claim-cards - Claim 4 random cards for the user
router.post('/claim-cards', auth, async (req, res) => {
  try {
    // Buscar usuario por id
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Obtener todas las cartas de la base de datos
    const [allCards] = await db.query('SELECT * FROM cards');
    if (!allCards || allCards.length === 0) {
      return res.status(404).json({ message: 'No hay cartas disponibles en la base de datos' });
    }
    const selectedCards = getRandomCards(allCards, 4);
    // Insertar las cartas reclamadas en user_cards (permitiendo repetidas)
    const insertQueries = selectedCards.map(card => `(${req.user.id}, ${card.id})`).join(', ');
    await db.query(`INSERT INTO user_cards (user_id, card_id) VALUES ${insertQueries}`);
    // Actualizar el last claim time
    await db.query('UPDATE users SET last_cards_drawn = ? WHERE id = ?', [new Date(), req.user.id]);
    // Log único para depuración
    console.log('DEBUG_BACKEND_UNICO', selectedCards.length, selectedCards.map(c => c.id));
    res.json({
      message: 'DEBUG SOLO 4',
      cards: selectedCards
    });
  } catch (error) {
    console.error('Error claiming cards:', error);
    res.status(500).json({ message: 'Error claiming cards' });
  }
});

// POST claim cards
// Allows users to claim new cards
router.post('/claim-cards', auth, async (req, res) => {
  try {
    console.log('Endpoint /claim-cards invocado. User recibido:', req.user);
    
    if (!req.user) {
      console.error('No user found in request');
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!users || users.length === 0) {
      console.error('User not found in database:', req.user.id);
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Get available cards (excluding those already owned by the user)
    const [availableCards] = await db.query('SELECT * FROM cards WHERE id NOT IN (SELECT card_id FROM user_cards WHERE user_id = ?)', [req.user.id]);

    if (!availableCards || availableCards.length === 0) {
      console.log('No available cards found');
      return res.status(404).json({ message: 'No hay cartas disponibles' });
    }

    // Add cards to user's collection
    const cardsAdded = [];
    for (const card of availableCards) {
      const [result] = await db.query('INSERT INTO user_cards (user_id, card_id) VALUES (?, ?)', [req.user.id, card.id]);
      if (result.affectedRows > 0) {
        cardsAdded.push(card);
      }
    }

    // Update user's last claim time
    await db.query('UPDATE users SET last_cards_drawn = ? WHERE id = ?', [new Date(), req.user.id]);

    console.log('Cards claimed successfully:', cardsAdded);
    
    res.json({
      message: 'Cartas reclamadas exitosamente',
      cards: cardsAdded,
      remainingCards: availableCards.length - cardsAdded.length
    });

  } catch (error) {
    console.error('Error en claim-cards:', error);
    res.status(500).json({ message: 'Error interno al reclamar cartas' });
  }
});

module.exports = router;
