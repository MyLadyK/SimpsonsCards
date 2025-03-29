const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Aplicar el middleware de autenticación a todas las rutas
router.use(auth);

// GET all cards
router.get('/', async (req, res) => {
    try {
        const cards = await Card.find();
        res.json(cards);
    } catch (err) {
        console.error('Error getting all cards:', err);
        res.status(500).send(err);
    }
});

// GET single card
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

// POST new card
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

// PUT update card
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

// DELETE card
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

// POST claim cards
router.post('/claim-cards', async (req, res) => {
    try {
        console.log('Endpoint /claim-cards invocado. User recibido:', req.user);
        
        if (!req.user) {
            console.error('No user found in request');
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Verificar si el usuario tiene cartas disponibles
        const user = await User.findById(req.user.id);
        if (!user) {
            console.error('User not found in database:', req.user.id);
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        // Obtener cartas disponibles (cartas que no tiene el usuario)
        const [rows] = await Card.findAvailableCards(user.id);
        const availableCards = rows;

        if (!availableCards || availableCards.length === 0) {
            console.log('No available cards found');
            return res.status(404).json({ message: 'No hay cartas disponibles' });
        }

        // Agregar cartas al usuario
        const cardsAdded = [];
        for (const card of availableCards) {
            const success = await User.addToCollection(user.id, card.id);
            if (success) {
                cardsAdded.push(card);
            }
        }

        // Actualizar el número de cartas restantes
        await User.updateCardsRemaining(user.id, user.cards_remaining_today - cardsAdded.length);
        await User.updateLastCardsDrawn(user.id);

        console.log('Cards claimed successfully:', cardsAdded);
        
        res.json({
            message: 'Cartas reclamadas exitosamente',
            cards: cardsAdded,
            remainingCards: user.cards_remaining_today - cardsAdded.length
        });

    } catch (error) {
        console.error('Error en claim-cards:', error);
        res.status(500).json({ message: 'Error interno al reclamar cartas' });
    }
});

module.exports = router;
