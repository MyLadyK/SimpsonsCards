const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Get user's card collection
router.get('/user', auth, async (req, res) => {
  console.log('DEBUG_BACKEND - Entrando en /cards/user para userId:', req.user.id);
  try {
    // Log de la tabla user_cards para este usuario
    const [userCards] = await db.query('SELECT * FROM user_cards WHERE user_id = ?', [req.user.id]);
    console.log('DEBUG_BACKEND - user_cards para user_id', req.user.id, ':', userCards);

    const sql = `SELECT c.*, uc.quantity FROM cards c INNER JOIN user_cards uc ON c.id = uc.card_id WHERE uc.user_id = ?`;
    console.log('DEBUG_BACKEND - Consulta SQL:', sql, 'userId:', req.user.id);
    const [cards] = await db.query(sql, [req.user.id]);
    console.log('DEBUG_BACKEND - Resultado crudo de MySQL:', cards);
    console.log('DEBUG_BACKEND /cards/user respuesta:', JSON.stringify(cards, null, 2));
    res.json(cards);
  } catch (error) {
    console.error('Error getting user cards:', error);
    res.status(500).json({ message: 'Error getting user cards', error: error.message });
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

    // Agrupar las cartas seleccionadas por id y contar cuántas veces sale cada una
    const cardCounts = {};
    for (const card of selectedCards) {
      cardCounts[card.id] = (cardCounts[card.id] || 0) + 1;
    }

    // Para cada carta única reclamada, incrementa quantity si ya existe, si no inserta nueva fila
    for (const cardIdStr of Object.keys(cardCounts)) {
      const cardId = parseInt(cardIdStr, 10);
      const cantidad = cardCounts[cardId];
      // ¿Ya existe?
      const [existing] = await db.query(
        'SELECT id, quantity FROM user_cards WHERE user_id = ? AND card_id = ?',
        [req.user.id, cardId]
      );
      if (existing.length > 0) {
        // Ya la tiene: suma la cantidad reclamada
        await db.query(
          'UPDATE user_cards SET quantity = quantity + ? WHERE id = ?',
          [cantidad, existing[0].id]
        );
      } else {
        // No la tiene: inserta nueva fila con la cantidad reclamada
        await db.query(
          'INSERT INTO user_cards (user_id, card_id, quantity, obtained_at) VALUES (?, ?, ?, ?)',
          [req.user.id, cardId, cantidad, now]
        );
      }
    }

    // Actualizar el last claim time
    await db.query(
      'UPDATE users SET last_cards_drawn = ? WHERE id = ?',
      [now, req.user.id]
    );

    // Log único para depuración
    console.log('DEBUG_BACKEND_UNICO', selectedCards.length, selectedCards.map(c => c.id));

    res.json({
      message: 'DEBUG SOLO 4',
      cards: selectedCards
    });
  } catch (error) {
    console.error('Error claiming cards:', error);
    res.status(500).json({ message: 'Error claiming cards', error: error.message });
  }
});

module.exports = router;
