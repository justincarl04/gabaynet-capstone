const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeRoles } = require('../../middlewares/auth.middleware');

// Controllers
const reportController = require('./reports.controller');

// Routes
router.post('/new', reportController.newReport);

module.exports = router;