const db = require('../config/db');

class Card {
  static async find() {
    const [rows] = await db.execute('SELECT * FROM cards');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM cards WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAvailableCards(userId) {
    const [rows] = await db.execute(
      'SELECT c.* FROM cards c LEFT JOIN user_cards uc ON c.id = uc.card_id AND uc.user_id = ? WHERE uc.user_id IS NULL',
      [userId]
    );
    return rows;
  }

  static async findByIdAndDelete(id) {
    const [result] = await db.execute('DELETE FROM cards WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findByIdAndUpdate(id, data) {
    const [result] = await db.execute(
      'UPDATE cards SET ? WHERE id = ?',
      [data, id]
    );
    return result.affectedRows > 0;
  }

  static async create(data) {
    const [result] = await db.execute(
      'INSERT INTO cards SET ?',
      [data]
    );
    return result.insertId;
  }

  static async findByRarity(rarity) {
    const [rows] = await db.execute(
      'SELECT * FROM cards WHERE rarity = ?',
      [rarity]
    );
    return rows;
  }

  static async findByCharacterName(name) {
    const [rows] = await db.execute(
      'SELECT * FROM cards WHERE character_name LIKE ?',
      [`%${name}%`]
    );
    return rows;
  }
}

module.exports = Card;
