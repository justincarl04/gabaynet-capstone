const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

const authRoutes = require('./modules/auth/auth.routes');
const reportRoutes = require('./modules/reports/reports.routes');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running.');
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

module.exports = app;