const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Simple connection check
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully to database:', process.env.DB_NAME);
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
})();

module.exports = pool;
