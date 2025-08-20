const SubscriptionPlan = require('../models/SubscriptionPlan');
const Company = require('../models/Company');
const { default: mongoose } = require('mongoose');

// Create a new subscription plan
// const createPlan = async (req, res) => {
//   try {
//     const { name, displayName, description, price, duration, jobsQuota, features } = req.body;

//     // Validation
//     if (!name || !displayName || !description || price === undefined || !duration || !jobsQuota) {
//       return res.status(400).json({ 
//         error: 'Name, displayName, description, price, duration, and jobsQuota are required' 
//       });
//     }

//     // Check if plan name already exists
//     const existingPlan = await SubscriptionPlan.findOne({ name: name.toLowerCase() });
//     if (existingPlan) {
//       return res.status(400).json({ error: 'Plan name already exists' });
//     }

//     const planData = {
//       name: name.toLowerCase(),
//       displayName,
//       description,
//       price: parseFloat(price),
//       duration: parseInt(duration),
//       jobsQuota: parseInt(jobsQuota),
//       features: features || []
//     };

//     const plan = new SubscriptionPlan(planData);
//     await plan.save();

//     res.status(201).json({
//       message: 'Subscription plan created successfully',
//       plan
//     });

//   } catch (error) {
//     console.error('Create plan error:', error);
//     if (error.code === 11000) {
//       return res.status(400).json({ error: 'Plan name already exists' });
//     }
//     res.status(500).json({ 
//       error: 'Failed to create subscription plan', 
//       details: error.message 
//     });
//   }
// };
// const createPlan = async (req, res) => {
//   try {
//     const { name, displayName, description, price, duration, jobsQuota, features } = req.body;

//     // ✅ Enhanced validation
//     if (!name || !displayName || !description || price === undefined || !duration || !jobsQuota) {
//       return res.status(400).json({ 
//         error: 'Name, displayName, description, price, duration, and jobsQuota are required' 
//       });
//     }

//     // ✅ Additional validations
//     if (parseFloat(price) < 0) {
//       return res.status(400).json({ error: 'Price cannot be negative' });
//     }

//     if (parseInt(duration) < 1) {
//       return res.status(400).json({ error: 'Duration must be at least 1 day' });
//     }

//     if (parseInt(jobsQuota) < 1) {
//       return res.status(400).json({ error: 'Jobs quota must be at least 1' });
//     }

//     // Check if plan name already exists
//     const existingPlan = await SubscriptionPlan.findOne({ name: name.toLowerCase() });
//     if (existingPlan) {
//       return res.status(400).json({ error: 'Plan name already exists' });
//     }

//     const planData = {
//       name: name.toLowerCase().replace(/\s+/g, '_'),
//       displayName,
//       description,
//       price: parseFloat(price),
//       duration: parseInt(duration),
//       jobsQuota: parseInt(jobsQuota),
//       features: features || []
//     };

//     console.log('Creating plan with data:', planData); // Debug log

//     const plan = new SubscriptionPlan(planData);
//     await plan.save();

//     res.status(201).json({
//       message: 'Subscription plan created successfully',
//       plan
//     });

//   } catch (error) {
//     console.error('Create plan error:', error);
//     if (error.code === 11000) {
//       return res.status(400).json({ error: 'Plan name already exists' });
//     }
//     res.status(500).json({ 
//       error: 'Failed to create subscription plan', 
//       details: error.message 
//     });
//   }
// };

// // Get all subscription plans
// const getAllPlans = async (req, res) => {
//   try {
//     const { includeInactive = false } = req.query;
    
//     const query = includeInactive === 'true' ? {} : { isActive: true };
    
//     const plans = await SubscriptionPlan.find(query).sort({ sortOrder: 1, createdAt: 1 });

//     res.json({
//       plans,
//       total: plans.length
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       error: 'Failed to fetch subscription plans', 
//       details: error.message 
//     });
//   }
// };

// Get a specific plan by ID or name
const getPlan = async (req, res) => {
  try {
    const { identifier } = req.params; // Can be ID or name

    let plan;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      plan = await SubscriptionPlan.findById(identifier);
    } else {
      plan = await SubscriptionPlan.findOne({ name: identifier.toLowerCase() });
    }

    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    res.json(plan);

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch subscription plan', 
      details: error.message 
    });
  }
};

// // Update a subscription plan
// const updatePlan = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body };

//     // Remove name from update data (name cannot be changed)
//     delete updateData.name;

//     const plan = await SubscriptionPlan.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!plan) {
//       return res.status(404).json({ error: 'Subscription plan not found' });
//     }

//     res.json({
//       message: 'Subscription plan updated successfully',
//       plan
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       error: 'Failed to update subscription plan', 
//       details: error.message 
//     });
//   }
// };

// // Delete/Deactivate a subscription plan
// const deletePlan = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Check if any companies are using this plan
//     const companiesUsingPlan = await Company.countDocuments({ 
//       subscriptionPlan: id,
//       subscriptionStatus: { $in: ['active', 'trial'] }
//     });

//     if (companiesUsingPlan > 0) {
//       return res.status(400).json({ 
//         error: `Cannot delete plan. ${companiesUsingPlan} companies are currently using this plan.`,
//         companiesCount: companiesUsingPlan
//       });
//     }

//     // Soft delete by setting isActive to false
//     const plan = await SubscriptionPlan.findByIdAndUpdate(
//       id,
//       { isActive: false },
//       { new: true }
//     );

//     if (!plan) {
//       return res.status(404).json({ error: 'Subscription plan not found' });
//     }

//     res.json({
//       message: 'Subscription plan deactivated successfully',
//       plan
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       error: 'Failed to delete subscription plan', 
//       details: error.message 
//     });
//   }
// };

// // Get subscription statistics
// const getSubscriptionStats = async (req, res) => {
//   try {
//     const stats = await Company.aggregate([
//       {
//         $group: {
//           _id: '$subscriptionPlan',
//           count: { $sum: 1 },
//           totalRevenue: { 
//             $sum: { 
//               $cond: [
//                 { $eq: ['$subscriptionStatus', 'active'] },
//                 { $multiply: ['$jobsQuota', 0.1] }, // Assuming $0.1 per job
//                 0
//               ]
//             }
//           }
//         }
//       },
//       {
//         $lookup: {
//           from: 'subscriptionplans',
//           localField: '_id',
//           foreignField: 'name',
//           as: 'planDetails'
//         }
//       },
//       {
//         $project: {
//           planName: '$_id',
//           count: 1,
//           totalRevenue: 1,
//           planDetails: { $arrayElemAt: ['$planDetails', 0] }
//         }
//       }
//     ]);

//     const totalCompanies = await Company.countDocuments();
//     const activeSubscriptions = await Company.countDocuments({ subscriptionStatus: 'active' });
//     const trialSubscriptions = await Company.countDocuments({ subscriptionStatus: 'trial' });

//     res.json({
//       totalCompanies,
//       activeSubscriptions,
//       trialSubscriptions,
//       planStats: stats,
//       monthlyRevenue: stats.reduce((sum, stat) => sum + stat.totalRevenue, 0)
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       error: 'Failed to fetch subscription statistics', 
//       details: error.message 
//     });
//   }
// };

const createPlan = async (req, res) => {
  try {
    const { name, displayName, description, price, duration, jobsQuota, features } = req.body;

    if (!name || !displayName || !description || price === undefined || !duration || !jobsQuota) {
      return res.status(400).json({ 
        error: 'Name, displayName, description, price, duration, and jobsQuota are required' 
      });
    }

    // ✅ Check if plan name already exists (case-insensitive)
    const existingPlan = await SubscriptionPlan.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (existingPlan) {
      return res.status(400).json({ error: 'Plan name already exists' });
    }

    const planData = {
      name: name.toLowerCase().replace(/\s+/g, '_'),
      displayName,
      description,
      price: parseFloat(price),
      duration: parseInt(duration),
      jobsQuota: parseInt(jobsQuota),
      features: features || []
    };

    const plan = new SubscriptionPlan(planData);
    await plan.save();

    res.status(201).json({
      message: 'Subscription plan created successfully',
      plan
    });

  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ 
      error: 'Failed to create subscription plan', 
      details: error.message 
    });
  }
};

// Get all subscription plans
// const getAllPlans = async (req, res) => {
//   try {
//     const { includeInactive = false } = req.query;
    
//     const query = includeInactive === 'true' ? {} : { isActive: true };
    
//     const plans = await SubscriptionPlan.find(query).sort({ sortOrder: 1, createdAt: 1 });

//     res.json({
//       plans,
//       total: plans.length
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       error: 'Failed to fetch subscription plans', 
//       details: error.message 
//     });
//   }
// };
const getAllPlans = async (req, res) => {
  try {
    const { includeInactive = false, includeCustom = true } = req.query;
    
    let query = {};
    
    // Include inactive plans if requested
    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    const plans = await SubscriptionPlan.find(query)
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    // ✅ Also get companies with custom subscription plans
    if (includeCustom === 'true') {
      const customPlans = await Company.aggregate([
        {
          $group: {
            _id: '$subscriptionPlan',
            count: { $sum: 1 }
          }
        },
        {
          $match: {
            _id: { $nin: plans.map(p => p.name) } // Only get plans not in SubscriptionPlan collection
          }
        }
      ]);

      // Add custom plans to response
      customPlans.forEach(customPlan => {
        plans.push({
          _id: customPlan._id,
          name: customPlan._id,
          displayName: customPlan._id.toUpperCase() + ' (Custom)',
          description: 'Custom subscription plan',
          price: 0,
          duration: 30,
          jobsQuota: 1000,
          features: ['Custom features'],
          isActive: true,
          isCustom: true,
          usageCount: customPlan.count
        });
      });
    }

    res.json({
      plans,
      total: plans.length
    });

  } catch (error) {
    console.error('Get all plans error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch subscription plans', 
      details: error.message 
    });
  }
};

// Update a subscription plan
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove name from update data if it exists
    if (updateData.name) {
      const existingPlan = await SubscriptionPlan.findOne({ 
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: id }
      });
      if (existingPlan) {
        return res.status(400).json({ error: 'Plan name already exists' });
      }
      updateData.name = updateData.name.toLowerCase().replace(/\s+/g, '_');
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    res.json({
      message: 'Subscription plan updated successfully',
      plan
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update subscription plan', 
      details: error.message 
    });
  }
};

// Delete/Deactivate a subscription plan
const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any companies are using this plan
    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    const companiesUsingPlan = await Company.countDocuments({ 
      subscriptionPlan: plan.name,
      subscriptionStatus: { $in: ['active', 'trial'] }
    });

    if (companiesUsingPlan > 0) {
      return res.status(400).json({ 
        error: `Cannot delete plan. ${companiesUsingPlan} companies are currently using this plan.`,
        companiesCount: companiesUsingPlan
      });
    }

    // Soft delete by setting isActive to false
    plan.isActive = false;
    await plan.save();

    res.json({
      message: 'Subscription plan deactivated successfully',
      plan
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to delete subscription plan', 
      details: error.message 
    });
  }
};

// Get subscription statistics
const getSubscriptionStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeSubscriptions = await Company.countDocuments({ subscriptionStatus: 'active' });
    const trialSubscriptions = await Company.countDocuments({ subscriptionStatus: 'trial' });

    const planStats = await Company.aggregate([
      {
        $group: {
          _id: '$subscriptionPlan',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalCompanies,
      activeSubscriptions,
      trialSubscriptions,
      planStats,
      monthlyRevenue: 0 // Calculate based on your pricing
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch subscription statistics', 
      details: error.message 
    });
  }
};
module.exports = {
  createPlan,
  getAllPlans,
  getPlan,
  updatePlan,
  deletePlan,
  getSubscriptionStats
};
