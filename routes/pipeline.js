// routes/pipeline.js
const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getCompanyPipeline,
  updateCompanyPipeline,
  getAvailableTransitions,
  getPipelineAnalytics
} = require('../controllers/pipelineController');

const router = express.Router();

// Get company pipeline
router.get('/', authenticateToken, requireRole(['company_admin', 'company_user']), getCompanyPipeline);

// Update pipeline (admin only)
router.put('/', authenticateToken, requireRole(['company_admin']), updateCompanyPipeline);

// Get available transitions for a job
router.get('/jobs/:jobId/transitions', authenticateToken, requireRole(['company_admin', 'company_user']), getAvailableTransitions);

// Pipeline analytics
router.get('/analytics', authenticateToken, requireRole(['company_admin']), getPipelineAnalytics);

module.exports = router;
