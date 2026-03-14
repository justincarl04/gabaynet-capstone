const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { loadSecrets } = require('./config/secrets');

const { getPool } = require('./config/db');
const logger = require('./utils/logger');

const app = express();

const authRoutes = require('./modules/auth/auth.routes');
const reportRoutes = require('./modules/reports/reports.routes');

const stream = {
    write: (message) => logger.info(message.trim()),
};

loadSecrets().catch((err) => {
    logger.error('Failed to load secrets: ', err);
    process.exit(1);
});

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('combined', { stream }));

app.get('/', (req, res) => {
    res.send('API is running.');
});

app.get('/health', async (req, res) => {
    const pool = getPool();
    const client = await pool.connect();
    try {
        await client.query('SELECT 1');
        res.json({ status: 'ok' });
    } catch (err) {
        console.error('Database connection failed: ', err); // DEBUG
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    } finally {
        client.release();
    }
})

app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${err.stack} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500).json({ message: err.userMessage || 'Internal Server Error' });
}); 

module.exports = app;