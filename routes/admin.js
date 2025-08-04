// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Only allow admin users (add your own admin check middleware if needed)
router.get('/linkedin/status-history', authMiddleware, adminController.getLinkedinStatusHistory);
router.get('/upwork/status-history', authMiddleware, adminController.getUpworkStatusHistory);
// ... existing code ...
router.get('/combined/status-history', authMiddleware, adminController.getCombinedStatusHistory);
// ... existing code ...
// router.post('/cleanup-old-data', authMiddleware, adminController.cleanupOldData);


module.exports = router;