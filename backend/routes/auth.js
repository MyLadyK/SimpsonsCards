// Authentication routes
// This file handles all user authentication endpoints

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register new user
// POST /auth/register
// Creates a new user account with username and password
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      username,
      password: hashedPassword
    });

    // Create token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Registration successful - Token created:', token);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error in /auth/register:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
// POST /auth/login
// Authenticates user and returns JWT token
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found in DB:', user);

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful - Token created:', token);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error in /auth/login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user info
// GET /auth/user
// Returns user information for authenticated requests
router.get('/user', auth, async (req, res) => {
  try {
    console.log('Request to /auth/user - Token payload:', req.user);

    if (!req.user || !req.user.id) {
      console.error('Error: req.user.id is not defined');
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    console.log('Searching for user with ID:', req.user.id);

    const user = await User.findById(req.user.id);

    if (!user) {
      console.log('User not found in DB');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user);

    res.json({
      id: user.id,
      username: user.username
    });
  } catch (error) {
    console.error('Error in /auth/user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
