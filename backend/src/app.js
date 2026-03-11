const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const pool = require('./config/db');
const logger = require('./utils/logger');

const app = express();

const authRoutes = require('./modules/auth/auth.routes');
const reportRoutes = require('./modules/reports/reports.routes');

const stream = {
    write: (message) => logger.info(message.trim()),
};

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(morgan('combined', { stream }));

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
app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${err.stack} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500).json({ message: err.userMessage || 'Internal Server Error' });
}); 

module.exports = app;