require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SimpsonsCards API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
