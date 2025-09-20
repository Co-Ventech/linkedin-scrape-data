// // routes/pipeline.js
// const express = require('express');
// const { authenticateToken, requireRole } = require('../middleware/auth');
// const {
//   getCompanyPipeline,
//   updateCompanyPipeline,
//   getAvailableTransitions,
//   getPipelineAnalytics
// } = require('../controllers/pipelineController');

// const router = express.Router();

// // Get company pipeline
// router.get('/', authenticateToken, requireRole(['company_admin', 'company_user']), getCompanyPipeline);

// // Update pipeline (admin only)
// router.put('/', authenticateToken, requireRole(['company_admin']), updateCompanyPipeline);

// // Get available transitions for a job
// router.get('/jobs/:jobId/transitions', authenticateToken, requireRole(['company_admin', 'company_user']), getAvailableTransitions);

// // Pipeline analytics
// router.get('/analytics', authenticateToken, requireRole(['company_admin']), getPipelineAnalytics);

// module.exports = router;
// const express = require('express');
// const { authenticateToken, requireRole } = require('../middleware/auth');
// const {
//   getCompanyPipeline,
//   updateCompanyPipeline,
//   getAvailableTransitions,
//   getPipelineAnalytics
// } = require('../controllers/pipelineController');

// const router = express.Router();

// // Get company pipeline (company users) or any company pipeline (super admin)
// router.get('/', authenticateToken, requireRole(['company_admin', 'company_user', 'super_admin']), getCompanyPipeline);

// // Get specific company pipeline (super admin only)
// router.get('/company/:companyId', authenticateToken, requireRole(['super_admin']), getCompanyPipeline);

// // Update pipeline (company admin for own company, super admin for any company)
// router.put('/', authenticateToken, requireRole(['company_admin', 'super_admin']), updateCompanyPipeline);

// // Update specific company pipeline (super admin only)
// router.put('/company/:companyId', authenticateToken, requireRole(['super_admin']), updateCompanyPipeline);

// // Get available transitions for a job
// router.get('/jobs/:jobId/transitions', authenticateToken, requireRole(['company_admin', 'company_user', 'super_admin']), getAvailableTransitions);

// // Pipeline analytics
// router.get('/analytics', authenticateToken, requireRole(['company_admin', 'super_admin']), getPipelineAnalytics);

// // Pipeline analytics for specific company (super admin only)
// router.get('/analytics/company/:companyId', authenticateToken, requireRole(['super_admin']), getPipelineAnalytics);

// module.exports = router;

const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getCompanyPipeline,
  updateCompanyPipeline,
  getAvailableTransitions,
  getPipelineAnalytics,
  getCompanyStatusStages
} = require('../controllers/pipelineController');

const router = express.Router();

// Get company pipeline (company users) or any company pipeline (super admin)
router.get('/', authenticateToken, requireRole(['company_admin', 'company_user', 'super_admin']), getCompanyPipeline);

// Get specific company pipeline (super admin only)
router.get('/company/:companyId', authenticateToken, requireRole(['super_admin']), getCompanyPipeline);

// Get company status stages (for validation)
router.get('/status-stages', authenticateToken, requireRole(['company_admin', 'company_user', 'super_admin']), getCompanyStatusStages);

// Update pipeline (company admin for own company, super admin for any company)
router.put('/', authenticateToken, requireRole(['company_admin', 'super_admin']), updateCompanyPipeline);

// Update specific company pipeline (super admin only)
router.put('/company/:companyId', authenticateToken, requireRole(['super_admin']), updateCompanyPipeline);

// Get available transitions for a job
router.get('/jobs/:jobId/transitions', authenticateToken, requireRole(['company_admin', 'company_user', 'super_admin']), getAvailableTransitions);

// Pipeline analytics
router.get('/analytics', authenticateToken, requireRole(['company_admin', 'super_admin']), getPipelineAnalytics);

// Pipeline analytics for specific company (super admin only)
router.get('/analytics/company/:companyId', authenticateToken, requireRole(['super_admin']), getPipelineAnalytics);

module.exports = router;