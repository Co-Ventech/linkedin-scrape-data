const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  createPlan,
  getAllPlans,
  getPlan,
  updatePlan,
  deletePlan,
  getSubscriptionStats
} = require('../controllers/subscriptionPlanController');

const router = express.Router();

// Subscription Plan Management Routes
router.post('/plans', authenticateToken, requireRole(['super_admin']), createPlan);
router.get('/plans', authenticateToken, getAllPlans);
router.get('/plans/stats', authenticateToken, requireRole(['super_admin']), getSubscriptionStats); // ✅ Moved under /plans
router.get('/plans/:identifier', authenticateToken, getPlan);
router.put('/plans/:id', authenticateToken, requireRole(['super_admin']), updatePlan);
router.delete('/plans/:id', authenticateToken, requireRole(['super_admin']), deletePlan);

// General Subscription Stats (for dashboard)
router.get('/stats', authenticateToken, requireRole(['super_admin']), getSubscriptionStats);

module.exports = router;
