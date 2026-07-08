const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  port: process.env.DB_PORT || 3306,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, '..', 'ca.pem')),
    rejectUnauthorized: true
  }
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
