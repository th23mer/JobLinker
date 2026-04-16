const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

async function createDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres' // Connect to default postgres database first
  });

  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    
    // Create database
    await client.query('CREATE DATABASE project_db;');
    console.log('✅ Database "project_db" created successfully');
    
    client.release();
  } catch (err) {
    if (err.code === '42P04') {
      console.log('✅ Database "project_db" already exists');
    } else {
      console.error('❌ Error creating database:', err.message);
      throw err;
    }
  } finally {
    await pool.end();
  }
}

createDatabase();
