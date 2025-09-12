// const { cleanupOldBatches } = require('../utils/dataCleanup');

// const UserLinkedinJobBatch = require('../models/jobBatchSchema');
// const UpworkUserJobBatch = require('../models/upworkJobBatch');

// exports.getLinkedinStatusHistory = async (req, res) => {
//   try {
//     let { date, start, end } = req.query;

//     let startDate, endDate;

//     if (date) {
//       // Single day mode
//       startDate = new Date(date);
//       endDate = new Date(date);
//       endDate.setHours(23, 59, 59, 999);
//     } else if (start && end) {
//       // Range mode
//       startDate = new Date(start);
//       endDate = new Date(end);
//       endDate.setHours(23, 59, 59, 999);
//     } else {
//       // Default to today
//       const today = new Date();
//       startDate = new Date(today.toISOString().split('T')[0]);
//       endDate = new Date(today.toISOString().split('T')[0]);
//       endDate.setHours(23, 59, 59, 999);
//     }

//     const userBatch = await UserLinkedinJobBatch.findOne();
//     if (!userBatch) {
//       return res.status(404).json({ message: 'No user batch found' });
//     }

//     const userStatusCounts = {};
//     const dailyStatusCounts = {};

//     for (const batch of userBatch.batches) {
//       for (const job of batch.jobs) {
//         for (const entry of job.statusHistory) {
//           const entryDate = new Date(entry.date);
//           if (entryDate >= startDate && entryDate <= endDate) {
//             const username = entry.username || 'Unknown';
//             const status = entry.status;
//             const dateKey = entryDate.toISOString().split('T')[0];
            
//             // User-based counts (original functionality)
//             if (!userStatusCounts[username]) userStatusCounts[username] = {};
//             userStatusCounts[username][status] = (userStatusCounts[username][status] || 0) + 1;
            
//             // Daily counts (new functionality)
//             if (!dailyStatusCounts[dateKey]) {
//               dailyStatusCounts[dateKey] = {
//                 date: dateKey,
//                 total_engagement: 0,
//                 not_engaged: 0,
//                 applied: 0,
//                 engaged: 0,
//                 interview: 0,
//                 offer: 0,
//                 rejected: 0,
//                 archived: 0
//               };
//             }
//             dailyStatusCounts[dateKey][status] = (dailyStatusCounts[dateKey][status] || 0) + 1;
            
//             // Calculate total_engagement (all statuses except not_engaged)
//             if (status !== 'not_engaged') {
//               dailyStatusCounts[dateKey].total_engagement += 1;
//             }
//           }
//         }
//       }
//     }

//     // Prepare original user-based result
//     const userResult = Object.entries(userStatusCounts).map(([username, statuses]) => ({
//       username,
//       statuses
//     }));

//     // Prepare daily totals result, sorted by date
//     const dailyTotals = Object.values(dailyStatusCounts).sort((a, b) => new Date(a.date) - new Date(b.date));
//     const grandTotal = {
//       total_engagement: 0,
//       not_engaged: 0,
//       applied: 0,
//       engaged: 0,
//       interview: 0,
//       offer: 0,
//       rejected: 0,
//       archived: 0
//     };
//     for (const day of dailyTotals) {
//       for (const key of Object.keys(grandTotal)) {
//         grandTotal[key] += day[key] || 0;
//       }
//     }


//     res.json({
//       users: userResult,
//       dailyTotals,
//       grandTotal
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Repeat the same logic for Upwork if needed:
// exports.getUpworkStatusHistory = async (req, res) => {
//   try {
//     let { date, start, end } = req.query;

//     let startDate, endDate;

//     if (date) {
//       startDate = new Date(date);
//       endDate = new Date(date);
//       endDate.setHours(23, 59, 59, 999);
//     } else if (start && end) {
//       startDate = new Date(start);
//       endDate = new Date(end);
//       endDate.setHours(23, 59, 59, 999);
//     } else {
//       const today = new Date();
//       startDate = new Date(today.toISOString().split('T')[0]);
//       endDate = new Date(today.toISOString().split('T')[0]);
//       endDate.setHours(23, 59, 59, 999);
//     }

//     const userBatch = await UpworkUserJobBatch.findOne();
//     if (!userBatch) {
//       return res.status(404).json({ message: 'No user batch found' });
//     }

//     const userStatusCounts = {};
//     const dailyStatusCounts = {};

//     for (const batch of userBatch.batches) {
//       for (const job of batch.jobs) {
//         for (const entry of job.statusHistory) {
//           const entryDate = new Date(entry.date);
//           if (entryDate >= startDate && entryDate <= endDate) {
//             const username = entry.username || 'Unknown';
//             const status = entry.status;
//             const dateKey = entryDate.toISOString().split('T')[0];

//             // User-based counts
//             if (!userStatusCounts[username]) userStatusCounts[username] = {};
//             userStatusCounts[username][status] = (userStatusCounts[username][status] || 0) + 1;

//             // Daily counts
//             if (!dailyStatusCounts[dateKey]) {
//               dailyStatusCounts[dateKey] = {
//                 date: dateKey,
//                 total_engagement: 0,
//                 not_engaged: 0,
//                 applied: 0,
//                 engaged: 0,
//                 interview: 0,
//                 offer: 0,
//                 rejected: 0,
//                 archived: 0
//               };
//             }
//             dailyStatusCounts[dateKey][status] = (dailyStatusCounts[dateKey][status] || 0) + 1;
//             if (status !== 'not_engaged') {
//               dailyStatusCounts[dateKey].total_engagement += 1;
//             }
//           }
//         }
//       }
//     }

//     const userResult = Object.entries(userStatusCounts).map(([username, statuses]) => ({
//       username,
//       statuses
//     }));

//     const dailyTotals = Object.values(dailyStatusCounts).sort((a, b) => new Date(a.date) - new Date(b.date));

//     res.json({
//       users: userResult,
//       dailyTotals
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Helper function to process status history for any platform
// const processStatusHistory = (userBatch, startDate, endDate) => {
//   const userStatusCounts = {};
//   const dailyStatusCounts = {};

//   if (!userBatch) return { userStatusCounts, dailyStatusCounts };

//   for (const batch of userBatch.batches) {
//     for (const job of batch.jobs) {
//       for (const entry of job.statusHistory) {
//         const entryDate = new Date(entry.date);
//         if (entryDate >= startDate && entryDate <= endDate) {
//           const username = entry.username || 'Unknown';
//           const status = entry.status;
//           const dateKey = entryDate.toISOString().split('T')[0];
          
//           // User-based counts
//           if (!userStatusCounts[username]) userStatusCounts[username] = {};
//           userStatusCounts[username][status] = (userStatusCounts[username][status] || 0) + 1;
          
//           // Daily counts
//           if (!dailyStatusCounts[dateKey]) {
//             dailyStatusCounts[dateKey] = {
//               date: dateKey,
//               total_engagement: 0,
//               not_engaged: 0,
//               applied: 0,
//               engaged: 0,
//               interview: 0,
//               offer: 0,
//               rejected: 0,
//               archived: 0
//             };
//           }
//           dailyStatusCounts[dateKey][status] = (dailyStatusCounts[dateKey][status] || 0) + 1;
          
//           if (status !== 'not_engaged') {
//             dailyStatusCounts[dateKey].total_engagement += 1;
//           }
//         }
//       }
//     }
//   }

//   return { userStatusCounts, dailyStatusCounts };
// };
// exports.getCombinedStatusHistory = async (req, res) => {
//   try {
//     let { date, start, end } = req.query;

//     let startDate, endDate;

//     if (date) {
//       startDate = new Date(date);
//       endDate = new Date(date);
//       endDate.setHours(23, 59, 59, 999);
//     } else if (start && end) {
//       startDate = new Date(start);
//       endDate = new Date(end);
//       endDate.setHours(23, 59, 59, 999);
//     } else {
//       const today = new Date();
//       startDate = new Date(today.toISOString().split('T')[0]);
//       endDate = new Date(today.toISOString().split('T')[0]);
//       endDate.setHours(23, 59, 59, 999);
//     }

//     // Fetch both batches
//     const linkedinBatch = await UserLinkedinJobBatch.findOne();
//     const upworkBatch = await UpworkUserJobBatch.findOne();

//     // Process both
//     const { userStatusCounts: linkedinUsers, dailyStatusCounts: linkedinDaily } = processStatusHistory(linkedinBatch, startDate, endDate);
//     const { userStatusCounts: upworkUsers, dailyStatusCounts: upworkDaily } = processStatusHistory(upworkBatch, startDate, endDate);

//     // Combine user results by username (not by platform)
//     const combinedUsers = {};
    
//     // Process LinkedIn users
//     Object.entries(linkedinUsers).forEach(([username, statuses]) => {
//       if (!combinedUsers[username]) {
//         combinedUsers[username] = { username, statuses: {} };
//       }
//       Object.entries(statuses).forEach(([status, count]) => {
//         combinedUsers[username].statuses[status] = (combinedUsers[username].statuses[status] || 0) + count;
//       });
//     });

//     // Process Upwork users
//     Object.entries(upworkUsers).forEach(([username, statuses]) => {
//       if (!combinedUsers[username]) {
//         combinedUsers[username] = { username, statuses: {} };
//       }
//       Object.entries(statuses).forEach(([status, count]) => {
//         combinedUsers[username].statuses[status] = (combinedUsers[username].statuses[status] || 0) + count;
//       });
//     });

//     // Convert to array format
//     const users = Object.values(combinedUsers);

//     // Combine daily totals (sum both platforms for each date)
//     const allDates = new Set([...Object.keys(linkedinDaily), ...Object.keys(upworkDaily)]);
//     const dailyTotals = Array.from(allDates).sort().map(dateKey => {
//       const linkedinData = linkedinDaily[dateKey] || {
//         total_engagement: 0,
//         not_engaged: 0,
//         applied: 0,
//         engaged: 0,
//         interview: 0,
//         offer: 0,
//         rejected: 0,
//         archived: 0
//       };
      
//       const upworkData = upworkDaily[dateKey] || {
//         total_engagement: 0,
//         not_engaged: 0,
//         applied: 0,
//         engaged: 0,
//         interview: 0,
//         offer: 0,
//         rejected: 0,
//         archived: 0
//       };

//       return {
//         date: dateKey,
//         total_engagement: linkedinData.total_engagement + upworkData.total_engagement,
//         not_engaged: linkedinData.not_engaged + upworkData.not_engaged,
//         applied: linkedinData.applied + upworkData.applied,
//         engaged: linkedinData.engaged + upworkData.engaged,
//         interview: linkedinData.interview + upworkData.interview,
//         offer: linkedinData.offer + upworkData.offer,
//         rejected: linkedinData.rejected + upworkData.rejected,
//         archived: linkedinData.archived + upworkData.archived
//       };
//     });

//     res.json({
//       users,
//       dailyTotals
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // ... existing code ...
// // Combined status history for both LinkedIn and Upwork
// exports.getCombinedStatusHistory = async (req, res) => {
//   try {
//     let { date, start, end } = req.query;

//     let startDate, endDate;

//     if (date) {
//       startDate = new Date(date);
//       endDate = new Date(date);
//       endDate.setHours(23, 59, 59, 999);
//     } else if (start && end) {
//       startDate = new Date(start);
//       endDate = new Date(end);
//       endDate.setHours(23, 59, 59, 999);
//     } else {
//       const today = new Date();
//       startDate = new Date(today.toISOString().split('T')[0]);
//       endDate = new Date(today.toISOString().split('T')[0]);
//       endDate.setHours(23, 59, 59, 999);
//     }

//     // Fetch both batches
//     const linkedinBatch = await UserLinkedinJobBatch.findOne();
//     const upworkBatch = await UpworkUserJobBatch.findOne();

//     // Process both
//     const { userStatusCounts: linkedinUsers, dailyStatusCounts: linkedinDaily } = processStatusHistory(linkedinBatch, startDate, endDate);
//     const { userStatusCounts: upworkUsers, dailyStatusCounts: upworkDaily } = processStatusHistory(upworkBatch, startDate, endDate);

//     // Combine user results by username (not by platform)
//     const combinedUsers = {};
    
//     // Process LinkedIn users
//     Object.entries(linkedinUsers).forEach(([username, statuses]) => {
//       if (!combinedUsers[username]) {
//         combinedUsers[username] = { username, statuses: {} };
//       }
//       Object.entries(statuses).forEach(([status, count]) => {
//         combinedUsers[username].statuses[status] = (combinedUsers[username].statuses[status] || 0) + count;
//       });
//     });

//     // Process Upwork users
//     Object.entries(upworkUsers).forEach(([username, statuses]) => {
//       if (!combinedUsers[username]) {
//         combinedUsers[username] = { username, statuses: {} };
//       }
//       Object.entries(statuses).forEach(([status, count]) => {
//         combinedUsers[username].statuses[status] = (combinedUsers[username].statuses[status] || 0) + count;
//       });
//     });

//     // Convert to array format
//     const users = Object.values(combinedUsers);

//     // Combine daily totals (sum both platforms for each date)
//     const allDates = new Set([...Object.keys(linkedinDaily), ...Object.keys(upworkDaily)]);
//     const dailyTotals = Array.from(allDates).sort().map(dateKey => {
//       const linkedinData = linkedinDaily[dateKey] || {
//         total_engagement: 0,
//         not_engaged: 0,
//         applied: 0,
//         engaged: 0,
//         interview: 0,
//         offer: 0,
//         rejected: 0,
//         archived: 0
//       };
      
//       const upworkData = upworkDaily[dateKey] || {
//         total_engagement: 0,
//         not_engaged: 0,
//         applied: 0,
//         engaged: 0,
//         interview: 0,
//         offer: 0,
//         rejected: 0,
//         archived: 0
//       };

//       return {
//         date: dateKey,
//         total_engagement: linkedinData.total_engagement + upworkData.total_engagement,
//         not_engaged: linkedinData.not_engaged + upworkData.not_engaged,
//         applied: linkedinData.applied + upworkData.applied,
//         engaged: linkedinData.engaged + upworkData.engaged,
//         interview: linkedinData.interview + upworkData.interview,
//         offer: linkedinData.offer + upworkData.offer,
//         rejected: linkedinData.rejected + upworkData.rejected,
//         archived: linkedinData.archived + upworkData.archived
//       };
//     });

//     res.json({
//       users,
//       dailyTotals
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // ... existing code ...

// // ... existing code ...
// // Manual cleanup endpoint
// exports.cleanupOldData = async (req, res) => {
//   try {
//     const { daysOld = 7, platform } = req.body; // platform: 'linkedin', 'upwork', or 'all'
    
//     if (!platform || !['linkedin', 'upwork', 'all'].includes(platform)) {
//       return res.status(400).json({ 
//         message: 'Platform parameter is required. Must be "linkedin", "upwork", or "all"' 
//       });
//     }
    
//     let results = {};
    
//     if (platform === 'linkedin' || platform === 'all') {
//       console.log('Starting LinkedIn data cleanup...');
//       results.linkedin = await cleanupOldBatches(UserLinkedinJobBatch, daysOld);
//     }
    
//     if (platform === 'upwork' || platform === 'all') {
//       console.log('Starting Upwork data cleanup...');
//       results.upwork = await cleanupOldBatches(UpworkUserJobBatch, daysOld);
//     }
    
//     res.json({
//       message: 'Data cleanup completed',
//       daysOld,
//       platform,
//       results
//     });
//   } catch (error) {
//     console.error('Error during cleanup:', error);
//     res.status(500).json({ message: 'Error during cleanup', error: error.message });
//   }
// };

// // ... existing code ...