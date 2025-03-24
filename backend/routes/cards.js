const express = require('express');
const router = express.Router();
const Card = require('../models/Card');

// GET all cards
router.get('/', async (req, res) => {
    try {
        const cards = await Card.find();
        res.json(cards);
    } catch (err) {
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
        res.status(500).send(err);
    }
});

module.exports = router;
