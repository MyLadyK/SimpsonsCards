const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Utility for rarity order
const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
function rarityValue(rarity) {
  return rarityOrder.indexOf(rarity);
}

// Create an exchange offer
// POST /api/exchanges
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId, minRarity } = req.body;
    // Verify the card belongs to the user
    const [rows] = await db.execute(
      'SELECT * FROM user_cards WHERE id = ? AND user_id = ?',
      [cardId, userId]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Card not owned by user' });
    }
    await db.execute(
      'INSERT INTO exchange_offers (user_id, card_id, min_rarity, status) VALUES (?, ?, ?, ?)',
      [userId, cardId, minRarity, 'open']
    );
    res.status(201).json({ message: 'Exchange offer created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating exchange offer' });
  }
});

// List all open exchange offers
// GET /api/exchanges
router.get('/', async (req, res) => {
  try {
    const [offers] = await db.execute(
      `SELECT eo.*, uc.card_id AS card_base_id, c.name, c.character_name, c.image_url, c.rarity, u.username
       FROM exchange_offers eo
       JOIN user_cards uc ON eo.card_id = uc.id
       JOIN cards c ON uc.card_id = c.id
       JOIN users u ON eo.user_id = u.id
       WHERE eo.status = 'open'`
    );
    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching exchange offers' });
  }
});

// Request an exchange
// POST /api/exchanges/:id/request
router.post('/:id/request', async (req, res) => {
  try {
    const userId = req.user.id;
    const exchangeOfferId = req.params.id;
    const { offeredCardId } = req.body;
    // Get the exchange offer
    const [offers] = await db.execute('SELECT * FROM exchange_offers WHERE id = ? AND status = ?', [exchangeOfferId, 'open']);
    if (offers.length === 0) {
      return res.status(404).json({ message: 'Exchange offer not found' });
    }
    const offer = offers[0];
    if (offer.user_id === userId) {
      return res.status(400).json({ message: 'Cannot request your own offer' });
    }
    // Verify the offered card belongs to the user
    const [userCards] = await db.execute('SELECT * FROM user_cards WHERE id = ? AND user_id = ?', [offeredCardId, userId]);
    if (userCards.length === 0) {
      return res.status(400).json({ message: 'Card not owned by user' });
    }
    // Check rarity
    const [cardRows] = await db.execute('SELECT c.rarity FROM user_cards uc JOIN cards c ON uc.card_id = c.id WHERE uc.id = ?', [offeredCardId]);
    if (cardRows.length === 0) {
      return res.status(400).json({ message: 'Card not found' });
    }
    const offeredRarity = cardRows[0].rarity;
    if (rarityValue(offeredRarity) < rarityValue(offer.min_rarity)) {
      return res.status(400).json({ message: 'Offered card does not meet minimum rarity' });
    }
    // Create the exchange request
    await db.execute(
      'INSERT INTO exchange_requests (exchange_offer_id, user_id, offered_card_id, status) VALUES (?, ?, ?, ?)',
      [exchangeOfferId, userId, offeredCardId, 'pending']
    );
    res.status(201).json({ message: 'Exchange request created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error requesting exchange' });
  }
});

// Accept an exchange request
// POST /api/exchanges/:offerId/accept/:requestId
router.post('/:offerId/accept/:requestId', async (req, res) => {
  const offerId = req.params.offerId;
  const requestId = req.params.requestId;
  const userId = req.user.id;
  const dbPool = db;
  let connection;
  try {
    connection = await dbPool.getConnection();
    // Get the offer
    const [offers] = await connection.execute('SELECT * FROM exchange_offers WHERE id = ?', [offerId]);
    if (offers.length === 0) return res.status(404).json({ message: 'Offer not found' });
    const offer = offers[0];
    if (offer.user_id !== userId) return res.status(403).json({ message: 'Not your offer' });
    if (offer.status !== 'open') return res.status(400).json({ message: 'Offer is not open' });
    // Get the request
    const [requests] = await connection.execute('SELECT * FROM exchange_requests WHERE id = ? AND exchange_offer_id = ?', [requestId, offerId]);
    if (requests.length === 0) return res.status(404).json({ message: 'Request not found' });
    const request = requests[0];
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request is not pending' });
    // Check both users still own their cards
    const [offerCard] = await connection.execute('SELECT * FROM user_cards WHERE id = ? AND user_id = ?', [offer.card_id, offer.user_id]);
    const [requestCard] = await connection.execute('SELECT * FROM user_cards WHERE id = ? AND user_id = ?', [request.offered_card_id, request.user_id]);
    if (offerCard.length === 0 || requestCard.length === 0) {
      return res.status(400).json({ message: 'One of the cards is no longer available' });
    }
    // Exchange card ownership (transaction)
    await connection.beginTransaction();
    await connection.execute('UPDATE user_cards SET user_id = ? WHERE id = ?', [request.user_id, offer.card_id]);
    await connection.execute('UPDATE user_cards SET user_id = ? WHERE id = ?', [offer.user_id, request.offered_card_id]);
    await connection.execute('UPDATE exchange_offers SET status = ? WHERE id = ?', ['completed', offerId]);
    await connection.execute('UPDATE exchange_requests SET status = ? WHERE id = ?', ['accepted', requestId]);
    await connection.execute('UPDATE exchange_requests SET status = ? WHERE exchange_offer_id = ? AND id != ?', ['rejected', offerId, requestId]);
    await connection.commit();
    res.json({ message: 'Exchange completed' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error completing exchange' });
  } finally {
    if (connection) connection.release();
  }
});

// Cancel an exchange offer
// POST /api/exchanges/:id/cancel
router.post('/:id/cancel', async (req, res) => {
  try {
    const userId = req.user.id;
    const offerId = req.params.id;
    const [offers] = await db.execute('SELECT * FROM exchange_offers WHERE id = ?', [offerId]);
    if (offers.length === 0) return res.status(404).json({ message: 'Offer not found' });
    if (offers[0].user_id !== userId) return res.status(403).json({ message: 'Not your offer' });
    if (offers[0].status !== 'open') return res.status(400).json({ message: 'Offer is not open' });
    await db.execute('UPDATE exchange_offers SET status = ? WHERE id = ?', ['cancelled', offerId]);
    await db.execute('UPDATE exchange_requests SET status = ? WHERE exchange_offer_id = ?', ['rejected', offerId]);
    res.json({ message: 'Offer cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error cancelling offer' });
  }
});

// Get all exchange requests made by the authenticated user
// GET /api/exchanges/requests/mine
router.get('/requests/mine', async (req, res) => {
  try {
    const userId = req.user.id;
    const [requests] = await db.execute(
      `SELECT er.*, eo.card_id AS offer_card_id, c.name AS card_name, c.character_name, c.image_url, c.rarity, eo.user_id AS offer_owner_id, eo.min_rarity
       FROM exchange_requests er
       JOIN exchange_offers eo ON er.exchange_offer_id = eo.id
       JOIN user_cards uc ON er.offered_card_id = uc.id
       JOIN cards c ON uc.card_id = c.id
       WHERE er.user_id = ?
       ORDER BY er.created_at DESC`,
      [userId]
    );
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user exchange requests' });
  }
});

// Get all exchange requests for a specific offer
// GET /api/exchanges/:offerId/requests
router.get('/:offerId/requests', async (req, res) => {
  try {
    const userId = req.user.id;
    const offerId = req.params.offerId;
    // Verify the user owns the offer
    const [offers] = await db.execute('SELECT * FROM exchange_offers WHERE id = ?', [offerId]);
    if (offers.length === 0) return res.status(404).json({ message: 'Offer not found' });
    if (offers[0].user_id !== userId) return res.status(403).json({ message: 'Not your offer' });
    // Get all requests for the offer
    const [requests] = await db.execute(
      `SELECT er.*, uc.user_id AS requester_id, c.name AS card_name, c.character_name, c.image_url, c.rarity
       FROM exchange_requests er
       JOIN user_cards uc ON er.offered_card_id = uc.id
       JOIN cards c ON uc.card_id = c.id
       WHERE er.exchange_offer_id = ?
       ORDER BY er.created_at DESC`,
      [offerId]
    );
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching requests for offer' });
  }
});

module.exports = router;
