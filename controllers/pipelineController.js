// controllers/pipelineController.js
const CompanyPipeline = require('../models/CompanyPipeline');
const Company = require('../models/Company');
const CompanyJob = require('../models/CompanyJob');

// Get company's current pipeline
const getCompanyPipeline = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    
    let pipeline = await CompanyPipeline.findOne({ companyId });
    
    if (!pipeline) {
      // Create default pipeline if none exists
      pipeline = await CompanyPipeline.createDefaultPipeline(
        companyId, 
        req.user._id
      );
    }
    
    res.json({
      pipeline,
      isCustom: pipeline.useCustomPipeline
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
};

// Update company pipeline
const updateCompanyPipeline = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    const { 
      name, 
      description, 
      statusStages, 
      settings, 
      useCustomPipeline 
    } = req.body;

    // Validate status stages
    if (statusStages && statusStages.length > 0) {
      const stageNames = statusStages.map(stage => stage.name);
      const uniqueNames = new Set(stageNames);
      
      if (stageNames.length !== uniqueNames.size) {
        return res.status(400).json({ 
          error: 'Duplicate stage names are not allowed' 
        });
      }

      // Validate transitions
      for (const stage of statusStages) {
        if (stage.allowedTransitionsFrom) {
          const invalidTransitions = stage.allowedTransitionsFrom.filter(
            from => !stageNames.includes(from)
          );
          if (invalidTransitions.length > 0) {
            return res.status(400).json({
              error: `Invalid transition references: ${invalidTransitions.join(', ')}`
            });
          }
        }
      }
    }

    const pipeline = await CompanyPipeline.findOneAndUpdate(
      { companyId },
      {
        name,
        description,
        statusStages,
        settings,
        useCustomPipeline,
        lastModifiedBy: req.user._id
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Pipeline updated successfully',
      pipeline
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pipeline' });
  }
};

// Get available status transitions for a job
const getAvailableTransitions = async (req, res) => {
  try {
    const { jobId } = req.params;
    const companyId = req.user.company._id;

    const job = await CompanyJob.findOne({ _id: jobId, companyId });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const pipeline = await CompanyPipeline.findOne({ companyId });
    if (!pipeline || !pipeline.useCustomPipeline) {
      // Return default transitions
      return res.json({
        currentStatus: job.currentStatus,
        availableTransitions: getDefaultTransitions(job.currentStatus)
      });
    }

    // Find current stage
    const currentStage = pipeline.statusStages.find(
      stage => stage.name === job.currentStatus
    );

    if (!currentStage) {
      return res.status(400).json({ 
        error: 'Current job status not found in pipeline' 
      });
    }

    // Get allowed transitions
    const availableTransitions = pipeline.statusStages.filter(stage => 
      currentStage.allowedTransitionsTo.includes(stage.name) ||
      pipeline.settings.allowSkipStages
    );

    res.json({
      currentStatus: job.currentStatus,
      currentStage,
      availableTransitions,
      settings: pipeline.settings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get transitions' });
  }
};

// Pipeline analytics
const getPipelineAnalytics = async (req, res) => {
  try {
    const companyId = req.user.company._id;
    const { startDate, endDate } = req.query;

    const pipeline = await CompanyPipeline.findOne({ companyId });
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.distributedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Status distribution
    const statusDistribution = await CompanyJob.aggregate([
      { $match: { companyId, ...dateFilter } },
      { $group: { _id: '$currentStatus', count: { $sum: 1 } } }
    ]);

    // Stage transition analysis
    const transitionAnalysis = await CompanyJob.aggregate([
      { $match: { companyId, ...dateFilter } },
      { $unwind: '$statusHistory' },
      {
        $group: {
          _id: {
            from: '$statusHistory.previousStatus',
            to: '$statusHistory.status'
          },
          count: { $sum: 1 },
          avgDuration: { $avg: '$statusHistory.stageDuration' }
        }
      }
    ]);

    // Stage conversion rates
    const conversionRates = {};
    pipeline.statusStages.forEach(stage => {
      const totalInStage = statusDistribution.find(s => s._id === stage.name)?.count || 0;
      const transitionsOut = transitionAnalysis
        .filter(t => t._id.from === stage.name)
        .reduce((sum, t) => sum + t.count, 0);
      
      conversionRates[stage.name] = {
        total: totalInStage,
        transitionsOut,
        rate: totalInStage > 0 ? (transitionsOut / totalInStage) : 0
      };
    });

    res.json({
      statusDistribution,
      transitionAnalysis,
      conversionRates,
      pipeline: {
        name: pipeline.name,
        totalStages: pipeline.statusStages.length,
        isCustom: pipeline.useCustomPipeline
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};

module.exports = {
  getCompanyPipeline,
  updateCompanyPipeline,
  getAvailableTransitions,
  getPipelineAnalytics
};
