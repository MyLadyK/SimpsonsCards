const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);

    if (!authHeader) {
      console.log('No authorization header');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Extract token (remove "Bearer " prefix if present)
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    console.log('Token extracted:', token);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);

    if (!decoded.userId) {
      console.error('userId not found in token');
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    // Get user from token
    const user = await User.findByUsername(decoded.username);
    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    console.log('User authenticated:', req.user);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
