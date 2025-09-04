const Company = require('../models/Company');
const SubscriptionPlan = require('../models/SubscriptionPlan');

const updateSubscription = async (req, res) => {
    try {
      const { companyId } = req.params;
      const { subscriptionPlan, subscriptionStatus, jobsQuota, customEndDate } = req.body;
  
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
  
      // Check permissions
      if (req.user.role === 'company_admin' && req.user.company._id.toString() !== companyId) {
        return res.status(403).json({ error: 'You can only update your own company subscription' });
      }
  
      const updateData = {};
  
      // ✅ Fixed subscription plan validation
      if (subscriptionPlan && subscriptionPlan !== company.subscriptionPlan) {
        // Check if plan exists (either by name or as a custom plan)
        const plan = await SubscriptionPlan.findOne({ 
          name: subscriptionPlan.toLowerCase(),
          isActive: true 
        });
        
        // Allow the plan even if not found in SubscriptionPlan collection
        // This supports custom plans assigned by super admin
        updateData.subscriptionPlan = subscriptionPlan.toLowerCase();
        
        if (plan) {
          updateData.jobsQuota = plan.jobsQuota;
          
          if (subscriptionStatus === 'active') {
            updateData.subscriptionStartDate = new Date();
            updateData.subscriptionEndDate = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
          }
        }
      }
  
      if (subscriptionStatus) {
        updateData.subscriptionStatus = subscriptionStatus;
        
        if (subscriptionStatus === 'active' && !updateData.subscriptionStartDate) {
          updateData.subscriptionStartDate = new Date();
        }
      }
  
      if (jobsQuota !== undefined) {
        updateData.jobsQuota = parseInt(jobsQuota);
      }
  
      if (customEndDate) {
        updateData.subscriptionEndDate = new Date(customEndDate);
      }
  
      const updatedCompany = await Company.findByIdAndUpdate(
        companyId,
        updateData,
        { new: true, runValidators: true }
      ).populate('admin', 'username email');
  
      res.json({
        message: 'Subscription updated successfully',
        company: updatedCompany
      });
  
    } catch (error) {
      console.error('Subscription update error:', error);
      res.status(500).json({ 
        error: 'Failed to update subscription', 
        details: error.message 
      });
    }
  };
// Get subscription details
const getSubscription = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Check permissions
    if (req.user.role !== 'super_admin' && req.user.company._id.toString() !== companyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const company = await Company.findById(companyId)
      .select('subscriptionPlan subscriptionStatus subscriptionStartDate subscriptionEndDate jobsQuota jobsUsed lastJobSync')
      .populate('admin', 'username email');
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get plan details
    const plan = await SubscriptionPlan.findOne({ name: company.subscriptionPlan });

    // Calculate days remaining
    let daysRemaining = null;
    if (company.subscriptionEndDate) {
      const diffTime = new Date(company.subscriptionEndDate) - new Date();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    res.json({
      subscription: {
        plan: company.subscriptionPlan,
        planDetails: plan,
        status: company.subscriptionStatus,
        startDate: company.subscriptionStartDate,
        endDate: company.subscriptionEndDate,
        daysRemaining,
        jobsQuota: company.jobsQuota,
        jobsUsed: company.jobsUsed,
        jobsRemaining: company.jobsQuota - company.jobsUsed,
        usagePercentage: Math.round((company.jobsUsed / company.jobsQuota) * 100),
        lastJobSync: company.lastJobSync
      }
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch subscription details', 
      details: error.message 
    });
  }
};

module.exports = {
  updateSubscription,
  getSubscription
};
