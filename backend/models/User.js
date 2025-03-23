const bcrypt = require('bcryptjs');
const db = require('../config/db');

// User class for handling user operations
class User {
  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const [result] = await db.execute(
        'INSERT INTO users (username, password, cards_remaining_today, created_at) VALUES (?, ?, 4, NOW())',
        [userData.username, hashedPassword]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Username already exists');
      }
      throw error;
    }
  }

  static async findByUsername(username) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await db.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  }

  static async addToCollection(userId, cardId) {
    const [result] = await db.execute(
      'INSERT INTO user_cards (user_id, card_id, obtained_at) VALUES (?, ?, NOW())',
      [userId, cardId]
    );
    return result.affectedRows > 0;
  }

  static async getCollection(userId) {
    const [rows] = await db.execute(
      'SELECT c.* FROM cards c JOIN user_cards uc ON c.id = uc.card_id WHERE uc.user_id = ?',
      [userId]
    );
    return rows;
  }

  static async updateCardsRemaining(userId, remaining) {
    const [result] = await db.execute(
      'UPDATE users SET cards_remaining_today = ? WHERE id = ?',
      [remaining, userId]
    );
    return result.affectedRows > 0;
  }

  static async updateLastCardsDrawn(userId) {
    const [result] = await db.execute(
      'UPDATE users SET last_cards_drawn = NOW() WHERE id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  static async comparePassword(candidatePassword, userPassword) {
    return bcrypt.compare(candidatePassword, userPassword);
  }
}

module.exports = User;
