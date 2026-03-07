const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const helmet = require('helmet');

const app = express();

const reportRoutes = require('./modules/reports/reports.routes');

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running.');
});

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok' });
    } catch (err) {
        console.error('Database connection failed: ', err); // DEBUG
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
})

app.use('/api/reports', reportRoutes);

module.exports = app;