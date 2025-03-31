require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

const app = express();

// Configuración detallada de CORS
const corsOptions = {
  origin: ['http://localhost:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
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

// Aplicar el middleware de autenticación a todas las rutas EXCEPTO /assets/*
const auth = require('./middleware/auth');
app.use((req, res, next) => {
  if (req.path.startsWith('/assets/')) {
    return next();
  }
  auth(req, res, next);
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/cards', require('./routes/cards'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/dist/simpsons-cards'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'simpsons-cards', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
