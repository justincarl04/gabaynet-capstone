const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeRoles } = require('../../middlewares/auth.middleware');

// Controllers
const reportController = require('./reports.controller');

// Public Routes
router.post('/new', reportController.newReport);

router.get('/', reportController.getAllReports);
router.get('/:report_id', reportController.getReportById);

// Protected Routes


module.exports = router;