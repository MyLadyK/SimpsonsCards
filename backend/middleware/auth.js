const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization');
    console.log('✅ Token recibido:', token);

    if (!token) {
      console.log('❌ No se encontró el token en el header');
      console.log('Request headers:', req.headers);
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const tokenWithoutBearer = token.split(' ')[1]; // Elimina "Bearer "
    console.log('🔍 Token sin "Bearer":', tokenWithoutBearer);

    // Verify token
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    console.log('🔑 Token decodificado:', decoded);

    if (!decoded.userId) {
      console.error('❌ userId no está en el token');
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    // Asegurarse de que userId sea un número
    const userId = parseInt(decoded.userId, 10);
    if (isNaN(userId)) {
      console.error('❌ userId no es un número válido');
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Get user from token
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found in database');
      console.log('User ID:', userId);
      return res.status(401).json({ message: 'User not found' });
    }

    // Asignar userId directamente a req.user
    req.user = { 
      userId: userId,
      username: user.username
    };

    console.log('✅ Usuario autenticado:', req.user);
    console.log('✅ req.user.userId:', req.user.userId);
    console.log('Request user:', req.user);
    next();
  } catch (error) {
    console.error('❌ Error en el middleware de autenticación:', error);
    console.error('Error stack:', error.stack);
    res.status(401).json({ message: 'Token no válido' });
  }
};
