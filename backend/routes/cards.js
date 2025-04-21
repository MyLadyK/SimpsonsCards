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
      return res.status(401).json({ message: 'User not authenticated' });
    }
    // Direct SQL query to return cards with quantity and user_card_id fields
    const [cards] = await db.query(
      `SELECT c.*, uc.quantity, uc.id AS user_card_id FROM cards c INNER JOIN user_cards uc ON c.id = uc.card_id WHERE uc.user_id = ?`,
      [req.user.id]
    );
    res.json(cards || []);
  } catch (error) {
    console.error('Error getting user cards:', error);
    res.status(500).json({ message: 'Internal error getting cards' });
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

// Select 4 random cards (allowing duplicates)
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
    // Find user by ID
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Get all cards from the database
    const [allCards] = await db.query('SELECT * FROM cards');
    if (!allCards || allCards.length === 0) {
      return res.status(404).json({ message: 'No cards available in the database' });
    }
    const selectedCards = getRandomCards(allCards, 4);
    // Group selected cards by ID and count how many times each one appears
    const cardCounts = {};
    for (const card of selectedCards) {
      cardCounts[card.id] = (cardCounts[card.id] || 0) + 1;
    }
    // For each unique claimed card, increment quantity if it already exists, otherwise insert a new row
    for (const cardIdStr of Object.keys(cardCounts)) {
      const cardId = parseInt(cardIdStr, 10);
      const cantidad = cardCounts[cardId];
      // Does it already exist?
      const [existing] = await db.query(
        'SELECT id, quantity FROM user_cards WHERE user_id = ? AND card_id = ?',
        [req.user.id, cardId]
      );
      if (existing.length > 0) {
        // It already exists: add the claimed quantity
        await db.query(
          'UPDATE user_cards SET quantity = quantity + ? WHERE id = ?',
          [cantidad, existing[0].id]
        );
      } else {
        // It does not exist: insert a new row with the claimed quantity
        await db.query(
          'INSERT INTO user_cards (user_id, card_id, quantity, obtained_at) VALUES (?, ?, ?, ?)',
          [req.user.id, cardId, cantidad, new Date()]
        );
      }
    }
    // Update the last claim time
    await db.query('UPDATE users SET last_cards_drawn = ? WHERE id = ?', [new Date(), req.user.id]);
    // Single log for debugging
    console.log('DEBUG_BACKEND_UNICO', selectedCards.length, selectedCards.map(c => c.id));
    res.json({
      message: 'DEBUG ONLY 4',
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
    console.log('Endpoint /claim-cards invoked. User received:', req.user);
    
    if (!req.user) {
      console.error('No user found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!users || users.length === 0) {
      console.error('User not found in database:', req.user.id);
      return res.status(401).json({ message: 'User not found' });
    }

    // Get available cards (excluding those already owned by the user)
    const [availableCards] = await db.query('SELECT * FROM cards WHERE id NOT IN (SELECT card_id FROM user_cards WHERE user_id = ?)', [req.user.id]);

    if (!availableCards || availableCards.length === 0) {
      console.log('No available cards found');
      return res.status(404).json({ message: 'No cards available' });
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
      message: 'Cards claimed successfully',
      cards: cardsAdded,
      remainingCards: availableCards.length - cardsAdded.length
    });

  } catch (error) {
    console.error('Error in claim-cards:', error);
    res.status(500).json({ message: 'Internal error claiming cards' });
  }
});

module.exports = router;
