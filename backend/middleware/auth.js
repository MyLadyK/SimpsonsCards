const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Header recibido:', authHeader);

    if (!authHeader) {
      console.log('Auth middleware - No authorization header');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Extract token (remove "Bearer " prefix if present)
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    console.log('Auth middleware - Token extraído:', token);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token decodificado:', decoded);

    // Get user ID from token (accept either userId or id)
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      console.error('Auth middleware - No user ID found in token:', decoded);
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    // Get user from token
    const user = await User.findById(userId);
    if (!user) {
      console.error('Auth middleware - User not found in database:', userId);
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    console.log('Auth middleware - User authenticated:', user);
    console.log('Auth middleware - Moving to next middleware');
    next();
  } catch (error) {
    console.error('Auth middleware - Error de autenticación:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
