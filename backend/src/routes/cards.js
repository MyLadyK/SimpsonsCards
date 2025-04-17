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

    // Obtener todas las cartas de la base de datos
    const [allCards] = await db.query('SELECT * FROM cards');
    if (allCards.length === 0) {
      return res.status(404).json({ message: 'No hay cartas disponibles en la base de datos' });
    }

    // Seleccionar 4 cartas aleatorias (permitiendo repetidas)
    function getRandomCards(cards, n) {
      const result = [];
      for (let i = 0; i < n; i++) {
        const randomIndex = Math.floor(Math.random() * cards.length);
        result.push(cards[randomIndex]);
      }
      return result;
    }
    const selectedCards = getRandomCards(allCards, 4);

    // Insertar las cartas reclamadas en user_cards (permitiendo repetidas)
    const insertQueries = selectedCards.map(card => `(${req.user.id}, ${card.id})`).join(', ');
    await db.query(`INSERT INTO user_cards (user_id, card_id) VALUES ${insertQueries}`);

    // Actualizar el last claim time
    await db.query(
      'UPDATE users SET last_cards_drawn = ? WHERE id = ?',
      [new Date(), req.user.id]
    );

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

module.exports = router;
