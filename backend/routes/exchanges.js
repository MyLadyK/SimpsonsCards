const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Utils para rareza en orden
const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
function rarityValue(rarity) {
  return rarityOrder.indexOf(rarity);
}

// Crear una oferta de intercambio
// POST /api/exchanges
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { card_id, min_rarity } = req.body;
    // Verifica que la carta pertenece al usuario
    const [rows] = await db.execute(
      'SELECT * FROM user_cards WHERE id = ? AND user_id = ?',
      [card_id, userId]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Card not owned by user' });
    }
    await db.execute(
      'INSERT INTO exchange_offers (user_id, card_id, min_rarity, status) VALUES (?, ?, ?, ?)',
      [userId, card_id, min_rarity, 'open']
    );
    res.status(201).json({ message: 'Exchange offer created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating exchange offer' });
  }
});

// Listar todas las ofertas abiertas
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

// Solicitar un intercambio
// POST /api/exchanges/:id/request
router.post('/:id/request', async (req, res) => {
  try {
    const userId = req.user.id;
    const exchangeOfferId = req.params.id;
    const { offered_card_id } = req.body;
    // Obtener la oferta
    const [offers] = await db.execute('SELECT * FROM exchange_offers WHERE id = ? AND status = ?', [exchangeOfferId, 'open']);
    if (offers.length === 0) {
      return res.status(404).json({ message: 'Exchange offer not found' });
    }
    const offer = offers[0];
    if (offer.user_id === userId) {
      return res.status(400).json({ message: 'Cannot request your own offer' });
    }
    // Verifica que la carta ofrecida pertenece al usuario
    const [userCards] = await db.execute('SELECT * FROM user_cards WHERE id = ? AND user_id = ?', [offered_card_id, userId]);
    if (userCards.length === 0) {
      return res.status(400).json({ message: 'Card not owned by user' });
    }
    // Comprobar rareza
    const [cardRows] = await db.execute('SELECT c.rarity FROM user_cards uc JOIN cards c ON uc.card_id = c.id WHERE uc.id = ?', [offered_card_id]);
    if (cardRows.length === 0) {
      return res.status(400).json({ message: 'Card not found' });
    }
    const offeredRarity = cardRows[0].rarity;
    if (rarityValue(offeredRarity) < rarityValue(offer.min_rarity)) {
      return res.status(400).json({ message: 'Offered card does not meet minimum rarity' });
    }
    // Crear la solicitud
    await db.execute(
      'INSERT INTO exchange_requests (exchange_offer_id, user_id, offered_card_id, status) VALUES (?, ?, ?, ?)',
      [exchangeOfferId, userId, offered_card_id, 'pending']
    );
    res.status(201).json({ message: 'Exchange request created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error requesting exchange' });
  }
});

// Aceptar una solicitud de intercambio
// POST /api/exchanges/:offerId/accept/:requestId
router.post('/:offerId/accept/:requestId', async (req, res) => {
  const offerId = req.params.offerId;
  const requestId = req.params.requestId;
  const userId = req.user.id;
  try {
    // Obtener la oferta
    const [offers] = await db.execute('SELECT * FROM exchange_offers WHERE id = ?', [offerId]);
    if (offers.length === 0) return res.status(404).json({ message: 'Offer not found' });
    const offer = offers[0];
    if (offer.user_id !== userId) return res.status(403).json({ message: 'Not your offer' });
    if (offer.status !== 'open') return res.status(400).json({ message: 'Offer is not open' });
    // Obtener la solicitud
    const [requests] = await db.execute('SELECT * FROM exchange_requests WHERE id = ? AND exchange_offer_id = ?', [requestId, offerId]);
    if (requests.length === 0) return res.status(404).json({ message: 'Request not found' });
    const request = requests[0];
    if (request.status !== 'pending') return res.status(400).json({ message: 'Request is not pending' });
    // Verifica que ambos usuarios aún tienen sus cartas
    const [offerCard] = await db.execute('SELECT * FROM user_cards WHERE id = ? AND user_id = ?', [offer.card_id, offer.user_id]);
    const [requestCard] = await db.execute('SELECT * FROM user_cards WHERE id = ? AND user_id = ?', [request.offered_card_id, request.user_id]);
    if (offerCard.length === 0 || requestCard.length === 0) {
      return res.status(400).json({ message: 'One of the cards is no longer available' });
    }
    // Intercambiar la propiedad de las cartas (transacción)
    await db.beginTransaction();
    await db.execute('UPDATE user_cards SET user_id = ? WHERE id = ?', [request.user_id, offer.card_id]);
    await db.execute('UPDATE user_cards SET user_id = ? WHERE id = ?', [offer.user_id, request.offered_card_id]);
    await db.execute('UPDATE exchange_offers SET status = ? WHERE id = ?', ['completed', offerId]);
    await db.execute('UPDATE exchange_requests SET status = ? WHERE id = ?', ['accepted', requestId]);
    await db.execute('UPDATE exchange_requests SET status = ? WHERE exchange_offer_id = ? AND id != ?', ['rejected', offerId, requestId]);
    await db.commit();
    res.json({ message: 'Exchange completed' });
  } catch (err) {
    await db.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error completing exchange' });
  }
});

// Cancelar una oferta
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

// Obtener todas las solicitudes hechas por el usuario autenticado
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

// Obtener todas las solicitudes para una oferta específica
// GET /api/exchanges/:offerId/requests
router.get('/:offerId/requests', async (req, res) => {
  try {
    const userId = req.user.id;
    const offerId = req.params.offerId;
    // Verifica que el usuario es dueño de la oferta
    const [offers] = await db.execute('SELECT * FROM exchange_offers WHERE id = ?', [offerId]);
    if (offers.length === 0) return res.status(404).json({ message: 'Offer not found' });
    if (offers[0].user_id !== userId) return res.status(403).json({ message: 'Not your offer' });
    // Trae todas las solicitudes para la oferta
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
