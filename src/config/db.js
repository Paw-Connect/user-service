// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Configuration for both development and production
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool settings - increased timeouts for cloud databases
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Changed from 2000 to 10000ms
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool,
};