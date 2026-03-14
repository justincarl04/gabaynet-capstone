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
router.patch('/:report_id/claim', authenticateToken, authorizeRoles('staff', 'admin', 'super_admin'), reportController.claimReport);
router.patch('/:report_id/resolve', authenticateToken, authorizeRoles('staff', 'admin', 'super_admin'), reportController.resolveReport);

module.exports = router;