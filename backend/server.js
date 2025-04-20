// Main server configuration file
// This file sets up the Express server and configures all necessary middleware

// Import required modules
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

const app = express();

// Configure CORS with detailed settings
// This configuration allows requests from the frontend development server
const corsOptions = {
  origin: ['http://localhost:4200'], // Allow requests from Angular development server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers that can be used in requests
  exposedHeaders: ['Authorization'], // Headers that can be exposed to the client
  credentials: true, // Allow credentials (cookies, authorization headers)
  preflightContinue: false, // Handle preflight requests
  optionsSuccessStatus: 204 // Status code to return for successful OPTIONS requests
};

// Middleware setup
// Parse incoming JSON requests
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/assets', express.static(path.join(__dirname, 'public')));

// Middleware para manejar rutas de assets
app.get('/assets/*', (req, res) => {
  const filePath = path.join(__dirname, 'public', req.params[0]);
  console.log('Serving asset:', filePath);
  res.sendFile(filePath);
});

// Route configurations
// All API routes are prefixed with /api
const auth = require('./middleware/auth');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cards', auth, require('./routes/cards'));
app.use('/api/admin', auth, require('./routes/admin'));
app.use('/api/exchanges', auth, require('./routes/exchanges'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/dist/simpsons-cards'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'simpsons-cards', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
