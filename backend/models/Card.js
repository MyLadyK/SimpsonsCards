/**
 * Card model representing a collectible card
 * Handles card operations and database interactions
 * @module models/Card
 */
const db = require('../config/db');

/**
 * Card class representing a collectible card
 * @class
 */
class Card {
  /**
   * Constructor for Card class
   * @param {number} id - Card ID
   * @param {string} name - Card name
   * @param {string} image - Card image URL
   * @param {number} rarity - Card rarity level
   * @param {number} userId - User ID who owns the card
   */
  constructor(id, name, image, rarity, userId) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.rarity = rarity;
    this.userId = userId;
  }

  /**
   * Finds all cards
   * @static
   * @async
   * @returns {Promise<Card[]>} Array of all cards
   * @throws {Error} If database query fails
   */
  static async find() {
    try {
      const [rows] = await db.execute('SELECT * FROM cards');
      return rows;
    } catch (error) {
      console.error('Error finding cards:', error);
      throw error;
    }
  }

  /**
   * Finds a card by ID
   * @static
   * @async
   * @param {number} id - Card ID to find
   * @returns {Promise<Card|null>} Found card or null if not found
   * @throws {Error} If database query fails
   */
  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM cards WHERE id = ?', [id]);
      if (rows.length === 0) return null;
      const row = rows[0];
      return new Card(row.id, row.name, row.image, row.rarity, null);
    } catch (error) {
      console.error('Error finding card:', error);
      throw error;
    }
  }

  /**
   * Finds available cards that can be claimed
   * @static
   * @async
   * @param {number} userId - User ID to find available cards for
   * @returns {Promise<Card[]>} Array of available cards
   * @throws {Error} If database query fails
   */
  static async findAvailableCards(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT c.* FROM cards c LEFT JOIN user_cards uc ON c.id = uc.card_id AND uc.user_id = ? WHERE uc.user_id IS NULL',
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error finding available cards:', error);
      throw error;
    }
  }

  /**
   * Deletes a card by ID
   * @static
   * @async
   * @param {number} id - Card ID to delete
   * @returns {Promise<boolean>} True if card was deleted, false otherwise
   * @throws {Error} If database query fails
   */
  static async findByIdAndDelete(id) {
    try {
      const [result] = await db.execute('DELETE FROM cards WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }

  /**
   * Updates an existing card by ID
   * @static
   * @async
   * @param {number} id - Card ID to update
   * @param {Object} data - Card data to update
   * @returns {Promise<boolean>} True if card was updated, false otherwise
   * @throws {Error} If database query fails
   */
  static async findByIdAndUpdate(id, data) {
    try {
      const [result] = await db.execute(
        'UPDATE cards SET ? WHERE id = ?',
        [data, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  }

  /**
   * Creates a new card
   * @static
   * @async
   * @param {Object} data - Card data to create
   * @returns {Promise<Card>} Created card
   * @throws {Error} If database query fails
   */
  static async create(data) {
    try {
      const [result] = await db.execute(
        'INSERT INTO cards SET ?',
        [data]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  }

  /**
   * Finds cards by rarity
   * @static
   * @async
   * @param {number} rarity - Card rarity level to find
   * @returns {Promise<Card[]>} Array of cards with specified rarity
   * @throws {Error} If database query fails
   */
  static async findByRarity(rarity) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM cards WHERE rarity = ?',
        [rarity]
      );
      return rows;
    } catch (error) {
      console.error('Error finding cards by rarity:', error);
      throw error;
    }
  }

  /**
   * Finds cards by character name
   * @static
   * @async
   * @param {string} name - Card character name to find
   * @returns {Promise<Card[]>} Array of cards with specified character name
   * @throws {Error} If database query fails
   */
  static async findByCharacterName(name) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM cards WHERE character_name LIKE ?',
        [`%${name}%`]
      );
      return rows;
    } catch (error) {
      console.error('Error finding cards by character name:', error);
      throw error;
    }
  }

  /**
   * Updates an existing card
   * @async
   * @throws {Error} If database query fails
   */
  async update() {
    try {
      await db.execute(
        'UPDATE cards SET name = ?, image = ?, rarity = ? WHERE id = ?',
        [this.name, this.image, this.rarity, this.id]
      );
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  }

  /**
   * Deletes a card
   * @async
   * @throws {Error} If database query fails
   */
  async delete() {
    try {
      await db.execute('DELETE FROM cards WHERE id = ?', [this.id]);
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }

  /**
   * Adds a card to a user's collection
   * @async
   * @param {number} userId - User ID to add card to
   * @throws {Error} If database query fails
   */
  async addToUser(userId) {
    try {
      // Cambia a lógica segura: si ya existe, haz UPDATE; si no, INSERT con quantity
      const [existing] = await db.query(
        'SELECT id, quantity FROM user_cards WHERE user_id = ? AND card_id = ?',
        [userId, this.id]
      );
      if (existing.length > 0) {
        await db.query(
          'UPDATE user_cards SET quantity = quantity + 1 WHERE id = ?',
          [existing[0].id]
        );
      } else {
        await db.query(
          'INSERT INTO user_cards (user_id, card_id, quantity, obtained_at) VALUES (?, ?, 1, NOW())',
          [userId, this.id]
        );
      }
    } catch (error) {
      console.error('Error adding card to user:', error);
      throw error;
    }
  }

  /**
   * Removes a card from a user's collection
   * @async
   * @param {number} userId - User ID to remove card from
   * @throws {Error} If database query fails
   */
  async removeFromUser(userId) {
    try {
      await db.execute(
        'DELETE FROM user_cards WHERE user_id = ? AND card_id = ?',
        [userId, this.id]
      );
    } catch (error) {
      console.error('Error removing card from user:', error);
      throw error;
    }
  }
}

/**
 * Exports the Card class
 * @module models/Card
 */
module.exports = Card;
