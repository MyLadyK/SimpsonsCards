const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Logs detallados de headers
    console.log('Auth middleware - Headers recibidos:', {
      allHeaders: req.headers,
      authorization: req.headers.authorization
    });

    // Get token from header
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Authorization header recibido:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware - Error: Header Authorization no válido.');
      return res.status(401).json({ message: 'Authorization header required' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    console.log('Auth middleware - Token extraído:', token);

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth middleware - Token decodificado:', decoded);

      // Get user ID from token
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
      console.error('Auth middleware - Error verificando el token:', error);
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Auth middleware - Error de autenticación:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
