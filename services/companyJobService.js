// const MasterJob = require('../models/MasterJob');
// const CompanyJob = require('../models/CompanyJob');
// const Company = require('../models/Company');
// const JobCustomization = require('../models/JobCustomization');

// class CompanyJobService {
  
//   // Get jobs for a company (with subscription check)
//   async getCompanyJobs(companyId, filters = {}) {
//     try {
//       // Check company subscription
//       const company = await Company.findById(companyId);
//       if (!company || !company.isActive) {
//         throw new Error('Company not found or inactive');
//       }

//       if (company.subscriptionStatus !== 'active') {
//         throw new Error('Company subscription is not active');
//       }

//       if (company.subscriptionEndDate && company.subscriptionEndDate < new Date()) {
//         throw new Error('Company subscription has expired');
//       }

//       // Build query for CompanyJob
//       const query = { companyId };
      
//       if (filters.status) {
//         query.currentStatus = filters.status;
//       }
      
//       if (filters.platform) {
//         query.platform = filters.platform;
//       }

//       // Get company jobs with pagination
//       const page = filters.page || 1;
//       const limit = Math.min(filters.limit || 50, 100); // Max 100 per page
//       const skip = (page - 1) * limit;

//       const companyJobs = await CompanyJob.find(query)
//         .populate('masterJobId', 'title description companyName location postedDate platform skills tier final_score')
//         .sort({ distributedAt: -1 })
//         .skip(skip)
//         .limit(limit);

//       // Get total count
//       const total = await CompanyJob.countDocuments(query);

//       return {
//         jobs: companyJobs,
//         pagination: {
//           page,
//           limit,
//           total,
//           pages: Math.ceil(total / limit)
//         }
//       };

//     } catch (error) {
//       throw new Error(`Failed to get company jobs: ${error.message}`);
//     }
//   }

//   // Get single job details for company
//   async getCompanyJob(companyId, companyJobId) {
//     try {
//       const companyJob = await CompanyJob.findOne({
//         _id: companyJobId,
//         companyId
//       }).populate('masterJobId');

//       if (!companyJob) {
//         throw new Error('Job not found for this company');
//       }

//       return companyJob;
//     } catch (error) {
//       throw new Error(`Failed to get company job: ${error.message}`);
//     }
//   }

//   // Update company-specific job data
//   async updateCompanyJob(companyId, companyJobId, updateData) {
//     try {
//       // Validate company subscription first
//       await this.validateCompanySubscription(companyId);

//       // Only allow updating company-specific fields
//       const allowedFields = [
//         'currentStatus',
//         'comments',
//         'proposal',
//         'applicationDate',
//         'responseDate',
//         'companyScore',
//         'customFields',
//         'isBookmarked',
//         'viewedBy'
//       ];

//       const filteredUpdate = {};
//       allowedFields.forEach(field => {
//         if (updateData[field] !== undefined) {
//           filteredUpdate[field] = updateData[field];
//         }
//       });

//       // Add status history if status is being updated
//       if (updateData.currentStatus) {
//         filteredUpdate.$push = {
//           statusHistory: {
//             status: updateData.currentStatus,
//             username: updateData.username || 'system',
//             date: new Date(),
//             notes: updateData.notes || ''
//           }
//         };
//       }

//       const updatedJob = await CompanyJob.findOneAndUpdate(
//         { _id: companyJobId, companyId },
//         { 
//           ...filteredUpdate,
//           lastUpdated: new Date()
//         },
//         { new: true }
//       ).populate('masterJobId');

//       if (!updatedJob) {
//         throw new Error('Job not found for this company');
//       }

//       return updatedJob;
//     } catch (error) {
//       throw new Error(`Failed to update company job: ${error.message}`);
//     }
//   }

//   // Add comment to job
//   async addJobComment(companyId, companyJobId, commentData) {
//     try {
//       await this.validateCompanySubscription(companyId);

//       const companyJob = await CompanyJob.findOneAndUpdate(
//         { _id: companyJobId, companyId },
//         {
//           $push: {
//             comments: {
//               username: commentData.username,
//               comment: commentData.comment,
//               isPrivate: commentData.isPrivate || false,
//               date: new Date()
//             }
//           },
//           lastUpdated: new Date()
//         },
//         { new: true }
//       ).populate('masterJobId');

//       if (!companyJob) {
//         throw new Error('Job not found for this company');
//       }

//       return companyJob;
//     } catch (error) {
//       throw new Error(`Failed to add comment: ${error.message}`);
//     }
//   }

//   // Rate/score a job
//   async rateJob(companyId, companyJobId, ratingData) {
//     try {
//       await this.validateCompanySubscription(companyId);

//       const companyJob = await CompanyJob.findOneAndUpdate(
//         { _id: companyJobId, companyId },
//         {
//           $push: {
//             companyScore: {
//               value: ratingData.value,
//               username: ratingData.username,
//               notes: ratingData.notes || '',
//               date: new Date()
//             }
//           },
//           lastUpdated: new Date()
//         },
//         { new: true }
//       ).populate('masterJobId');

//       if (!companyJob) {
//         throw new Error('Job not found for this company');
//       }

//       return companyJob;
//     } catch (error) {
//       throw new Error(`Failed to rate job: ${error.message}`);
//     }
//   }

//   // Validate company subscription
//   async validateCompanySubscription(companyId) {
//     const company = await Company.findById(companyId);
//     if (!company || !company.isActive) {
//       throw new Error('Company not found or inactive');
//     }

//     if (company.subscriptionStatus !== 'active') {
//       throw new Error('Company subscription is not active');
//     }

//     if (company.subscriptionEndDate && company.subscriptionEndDate < new Date()) {
//       throw new Error('Company subscription has expired');
//     }
//   }

//   // Get company job statistics
//   async getCompanyJobStats(companyId) {
//     try {
//       await this.validateCompanySubscription(companyId);

//       const stats = await CompanyJob.aggregate([
//         { $match: { companyId: companyId } },
//         {
//           $group: {
//             _id: '$currentStatus',
//             count: { $sum: 1 }
//           }
//         }
//       ]);

//       const totalJobs = await CompanyJob.countDocuments({ companyId });
//       const totalComments = await CompanyJob.aggregate([
//         { $match: { companyId: companyId } },
//         { $unwind: '$comments' },
//         { $count: 'total' }
//       ]);

//       return {
//         totalJobs,
//         statusBreakdown: stats,
//         totalComments: totalComments[0]?.total || 0
//       };
//     } catch (error) {
//       throw new Error(`Failed to get company stats: ${error.message}`);
//     }
//   }
// }

// module.exports = new CompanyJobService();