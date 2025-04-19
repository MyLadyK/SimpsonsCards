/**
 * User model representing a system user
 * Handles user authentication and card collection management
 * @module models/User
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');

/**
 * User class representing a system user
 * @class
 */
class User {
  /**
   * Finds all users
   * @static
   * @async
   * @returns {Promise<User[]>} Array of all users
   * @throws {Error} If database query fails
   */
  static async find() {
    try {
      const [rows] = await db.execute('SELECT * FROM users');
      return rows.map(row => new User(
        row.id,
        row.username,
        row.password,
        row.role,
        row.cards_remaining_today,
        row.last_cards_drawn
      ));
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  }

  /**
   * Finds a user by ID
   * @static
   * @async
   * @param {number} id - User ID to find
   * @returns {Promise<User|null>} Found user or null if not found
   * @throws {Error} If database query fails
   */
  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
      if (rows.length === 0) return null;
      const row = rows[0];
      return new User(
        row.id,
        row.username,
        row.password,
        row.role,
        row.cards_remaining_today,
        row.last_cards_drawn
      );
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  /**
   * Finds a user by username
   * @static
   * @async
   * @param {string} username - Username to find
   * @returns {Promise<User|null>} Found user or null if not found
   * @throws {Error} If database query fails
   */
  static async findByUsername(username) {
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
      if (rows.length === 0) return null;
      const row = rows[0];
      return new User(
        row.id,
        row.username,
        row.password,
        row.role,
        row.cards_remaining_today,
        row.last_cards_drawn
      );
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  /**
   * Creates a new user
   * @static
   * @async
   * @param {Object} userData - User data to create
   * @param {string} userData.username - User's username
   * @param {string} userData.password - User's password
   * @returns {Promise<User>} Created user
   * @throws {Error} If database query fails
   */
  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const [result] = await db.execute(
        'INSERT INTO users (username, password, cards_remaining_today, created_at) VALUES (?, ?, 4, NOW())',
        [userData.username, hashedPassword]
      );
      return new User(
        result.insertId,
        userData.username,
        hashedPassword,
        'user',
        4,
        new Date()
      );
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Username already exists');
      }
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Updates user's password
   * @async
   * @param {string} newPassword - New password to set
   * @throws {Error} If database query fails
   */
  async updatePassword(newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.execute(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedPassword, this.id]
      );
      this.password = hashedPassword;
    } catch (error) {
      console.error('Error updating user password:', error);
      throw error;
    }
  }

  /**
   * Adds a card to user's collection
   * @async
   * @param {number} cardId - ID of the card to add
   * @returns {Promise<boolean>} True if card was added, false otherwise
   * @throws {Error} If database query fails
   */
  async addToCollection(cardId) {
    try {
      // Cambia a lógica segura: si ya existe, haz UPDATE; si no, INSERT con quantity
      const [existing] = await db.query(
        'SELECT id, quantity FROM user_cards WHERE user_id = ? AND card_id = ?',
        [this.id, cardId]
      );
      if (existing.length > 0) {
        await db.query(
          'UPDATE user_cards SET quantity = quantity + 1 WHERE id = ?',
          [existing[0].id]
        );
      } else {
        await db.query(
          'INSERT INTO user_cards (user_id, card_id, quantity, obtained_at) VALUES (?, ?, 1, NOW())',
          [this.id, cardId]
        );
      }
      return true;
    } catch (error) {
      console.error('Error adding card to collection:', error);
      throw error;
    }
  }

  /**
   * Gets user's card collection
   * @async
   * @returns {Promise<Card[]>} Array of user's cards
   * @throws {Error} If database query fails
   */
  async getCollection() {
    try {
      const [rows] = await db.execute(
        'SELECT c.* FROM cards c JOIN user_cards uc ON c.id = uc.card_id WHERE uc.user_id = ?',
        [this.id]
      );
      return rows;
    } catch (error) {
      console.error('Error getting user cards:', error);
      throw error;
    }
  }

  /**
   * Updates remaining cards for today
   * @async
   * @param {number} remaining - New count of remaining cards
   * @returns {Promise<boolean>} True if update was successful, false otherwise
   * @throws {Error} If database query fails
   */
  async updateCardsRemaining(remaining) {
    try {
      const [result] = await db.execute(
        'UPDATE users SET cards_remaining_today = ? WHERE id = ?',
        [remaining, this.id]
      );
      this.cardsRemainingToday = remaining;
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating remaining cards:', error);
      throw error;
    }
  }

  /**
   * Updates last cards drawn timestamp
   * @async
   * @returns {Promise<boolean>} True if update was successful, false otherwise
   * @throws {Error} If database query fails
   */
  async updateLastCardsDrawn() {
    try {
      const [result] = await db.execute(
        'UPDATE users SET last_cards_drawn = NOW() WHERE id = ?',
        [this.id]
      );
      this.lastCardsDrawn = new Date();
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating last cards drawn:', error);
      throw error;
    }
  }

  /**
   * Compares a password with the user's password
   * @async
   * @param {string} candidatePassword - Password to compare
   * @returns {Promise<boolean>} True if passwords match, false otherwise
   * @throws {Error} If database query fails
   */
  async comparePassword(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      throw error;
    }
  }

  constructor(id, username, password, role, cardsRemainingToday, lastCardsDrawn) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.role = role || 'user';
    this.cardsRemainingToday = cardsRemainingToday || 3;
    this.lastCardsDrawn = lastCardsDrawn || new Date();
  }
}

/**
 * Exports the User class
 * @module models/User
 */
module.exports = User;
