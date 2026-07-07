const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables from the server/.env file
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function loadSchema() {
  let connection;
  try {
    // 1. Resolve and read CA Certificate
    const caPath = path.join(__dirname, 'ca.pem');
    if (!fs.existsSync(caPath)) {
      throw new Error(`CA Certificate file not found at: ${caPath}`);
    }
    const caCert = fs.readFileSync(caPath);

    // 2. Resolve and read schema.sql from the project root
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql file not found at: ${schemaPath}`);
    }
    const sqlText = fs.readFileSync(schemaPath, 'utf8');

    // Validate required environment variables (excluding DB_PORT which can default)
    const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingEnv = requiredEnv.filter(envVar => !process.env[envVar]);
    if (missingEnv.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
    }

    console.log(`Connecting to remote database at ${process.env.DB_HOST}...`);

    // 3. Connect to the database with SSL enabled
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        ca: caCert
      }
    });

    console.log('Database connection established successfully.');

    // 4. Parse the SQL schema into individual statements
    // We clean comment lines (starting with -- or #) to prevent syntax errors
    // and extract clean statements separated by ';'
    const lines = sqlText.split('\n');
    let processedSql = '';
    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('--') || trimmed.startsWith('#')) {
        continue;
      }
      processedSql += line + '\n';
    }

    const statements = processedSql
      .split(';')
      .map(st => st.trim())
      .filter(st => st.length > 0);

    console.log(`Parsed ${statements.length} SQL statements to execute.`);

    // 5. Execute each statement against the database and log progress
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      // Preview the first line or a snippet of the statement for cleaner output
      const preview = statement.split('\n')[0].substring(0, 80).trim();
      console.log(`[Statement ${i + 1}/${statements.length}] Executing: ${preview}...`);
      await connection.query(statement);
    }

    console.log('Schema loaded successfully');
  } catch (error) {
    console.error('Error: Failed to load schema.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed.');
      } catch (closeError) {
        console.error('Error closing database connection:', closeError.message);
      }
    }
  }
}

loadSchema();
