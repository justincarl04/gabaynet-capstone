const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running.');
});

// The "Health Check" Route
app.get('/api/test-db', async (req, res) => {
  try {
    // We ask the DB for the current time
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      success: true,
      message: "Backend is connected to Database!",
      timestamp: result.rows[0].now
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: err.message
    });
  }
});

module.exports = app;