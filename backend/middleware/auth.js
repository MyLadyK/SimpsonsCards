/**
 * Authentication middleware module
 * Provides middleware functions for protecting routes
 * Uses JWT for authentication
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Validates JWT token and attaches user data to request
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next middleware function
 * @throws {Error} If token is invalid or missing
 */
module.exports = async (req, res, next) => {
  try {
    // Detailed logs of the request
    console.log('\n=== Auth Middleware ===');
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    console.log('Request Headers:', req.headers);
    
    // Specific logs for the Authorization header
    console.log('=== Authorization Header Details ===');
    console.log('Raw Authorization Header:', req.headers.authorization);
    
    if (!req.headers.authorization) {
      console.log('Error: No Authorization header found');
      return res.status(401).json({ message: 'No authorization header' });
    }

    // Logs for header validation
    console.log('=== Header Validation ===');
    if (!req.headers.authorization.startsWith('Bearer ')) {
      console.log('Error: Invalid Authorization header format');
      return res.status(401).json({ message: 'Invalid authorization header format' });
    }

    // Extract and validate the token
    const token = req.headers.authorization.split(' ')[1];
    console.log('=== Token Details ===');
    console.log('Extracted Token:', token);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('=== Decoded Token ===');
      console.log('Decoded Token Payload:', decoded);

      // Get and validate the user ID
      const userId = decoded.userId || decoded.id;
      if (!userId) {
        console.log('Error: No user ID found in token');
        return res.status(400).json({ message: 'Invalid token payload' });
      }

      // Search and validate the user
      const user = await User.findById(userId);
      if (!user) {
        console.log('Error: User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }

      // Attach user to the request
      req.user = user;
      console.log('=== User Authentication Success ===');
      console.log('Authenticated User:', user);
      console.log('Moving to next middleware...');
      next();

    } catch (error) {
      console.error('=== Token Verification Error ===');
      console.error('Error Details:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

  } catch (error) {
    console.error('=== Authentication Error ===');
    console.error('Error Details:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};
