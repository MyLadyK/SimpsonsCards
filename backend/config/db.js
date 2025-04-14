/**
 * Database configuration module
 * Provides a connection pool to the MySQL database
 * Uses environment variables for configuration with fallbacks
 */
const mysql = require('mysql2');

/**
 * Creates and exports a MySQL connection pool
 * @module db
 */
const pool = mysql.createPool({
  /**
   * Database connection configuration
   * Uses environment variables with default values
   */
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'springfield_shuffle',
  /**
   * Pool configuration settings
   */
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Tests the database connection
 * Logs success or error message
 * @private
 */
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
  connection.release();
});

/**
 * Exports the promise-based pool
 * @returns {PromisePool} Promise-based MySQL connection pool
 */
module.exports = pool.promise();
