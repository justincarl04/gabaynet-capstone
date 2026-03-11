const express = require('express');
const router = express.Router();

// Middlewares
const { authenticateToken, authorizeRoles } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');

// Controllers
const reportController = require('./reports.controller');

// Public Routes
router.post('/new', upload.single('file'), reportController.newReport);

router.get('/', reportController.getAllReports);
router.get('/:report_id', reportController.getReportById);

// Protected Routes


module.exports = router;