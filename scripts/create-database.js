// scripts/create-database.js
const { Client } = require('pg');
require('dotenv').config();

// Default database connection - connect to postgres database
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres' // Connect to default postgres database first
});

const dbName = process.env.DB_NAME || 'task_management';

async function createDatabase() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');
    
    // Check if database already exists
    const checkResult = await client.query(
      `SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1)`,
      [dbName]
    );
    
    const dbExists = checkResult.rows[0].exists;
    
    if (dbExists) {
      console.log(`Database "${dbName}" already exists`);
    } else {
      // Create the database
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database "${dbName}" created successfully`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

createDatabase();
