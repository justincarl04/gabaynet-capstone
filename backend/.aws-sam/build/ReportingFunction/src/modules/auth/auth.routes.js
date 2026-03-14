const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeRoles } = require('../../middlewares/auth.middleware');

// Controllers
const authController = require('./auth.controller');

// Routes
router.post('/register', authenticateToken, authorizeRoles('admin', 'super_admin'), authController.registerAccount);
router.post('/login', authController.login);

module.exports = router;