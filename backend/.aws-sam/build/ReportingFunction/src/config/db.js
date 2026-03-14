const { Pool } = require('pg');

let pool = null;

function createPool() {
  if (pool) {
    return pool;
  }

  if (!process.env.DB_PASS) {
    throw new Error('Database password not set. Call loadSecrets() before creating DB pool.');
  }

  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  async function verify() {
    let client;
    try {
      client = await pool.connect();
      const res = await client.query('SELECT NOW()');
      console.log('✅ Database connected successfully at:', res.rows[0].now);
    } catch (err) {
      console.error('❌ Database connection error:', err.stack);
    } finally {
      if (client) client.release();
    }
  }
  verify().catch(err => console.error('Error verifying DB connection:', err));

  return pool;
}

function getPool() {
  if (!pool) {
    createPool();
  }
  return pool;
}

module.exports = {
  getPool,
};