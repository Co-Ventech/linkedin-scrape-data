// // controllers/adminController.js
// // const User = require('../models/userModel'); // adjust path as needed
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

//     for (const batch of userBatch.batches) {
//       for (const job of batch.jobs) {
//         for (const entry of job.statusHistory) {
//           const entryDate = new Date(entry.date);
//           if (entryDate >= startDate && entryDate <= endDate) {
//             const username = entry.username || 'Unknown';
//             const status = entry.status;
//             if (!userStatusCounts[username]) userStatusCounts[username] = {};
//             userStatusCounts[username][status] = (userStatusCounts[username][status] || 0) + 1;
//           }
//         }
//       }
//     }

//     const result = Object.entries(userStatusCounts).map(([username, statuses]) => ({
//       username,
//       statuses
//     }));

//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.getUpworkStatusHistory = async (req, res) => {
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

//     const userBatch = await UpworkUserJobBatch.findOne();
//     if (!userBatch) {
//       return res.status(404).json({ message: 'No user batch found' });
//     }

//     const userStatusCounts = {};

//     for (const batch of userBatch.batches) {
//       for (const job of batch.jobs) {
//         for (const entry of job.statusHistory) {
//           const entryDate = new Date(entry.date);
//           if (entryDate >= startDate && entryDate <= endDate) {
//             const username = entry.username || 'Unknown';
//             const status = entry.status;
//             if (!userStatusCounts[username]) userStatusCounts[username] = {};
//             userStatusCounts[username][status] = (userStatusCounts[username][status] || 0) + 1;
//           }
//         }
//       }
//     }

//     const result = Object.entries(userStatusCounts).map(([username, statuses]) => ({
//       username,
//       statuses
//     }));

//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// controllers/adminController.js
// const User = require('../models/userModel'); // adjust path as needed
const UserLinkedinJobBatch = require('../models/jobBatchSchema');
const UpworkUserJobBatch = require('../models/upworkJobBatch');

exports.getLinkedinStatusHistory = async (req, res) => {
  try {
    let { date, start, end } = req.query;

    let startDate, endDate;

    if (date) {
      // Single day mode
      startDate = new Date(date);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    } else if (start && end) {
      // Range mode
      startDate = new Date(start);
      endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to today
      const today = new Date();
      startDate = new Date(today.toISOString().split('T')[0]);
      endDate = new Date(today.toISOString().split('T')[0]);
      endDate.setHours(23, 59, 59, 999);
    }

    const userBatch = await UserLinkedinJobBatch.findOne();
    if (!userBatch) {
      return res.status(404).json({ message: 'No user batch found' });
    }

    const userStatusCounts = {};
    const dailyStatusCounts = {};

    for (const batch of userBatch.batches) {
      for (const job of batch.jobs) {
        for (const entry of job.statusHistory) {
          const entryDate = new Date(entry.date);
          if (entryDate >= startDate && entryDate <= endDate) {
            const username = entry.username || 'Unknown';
            const status = entry.status;
            const dateKey = entryDate.toISOString().split('T')[0];
            
            // User-based counts (original functionality)
            if (!userStatusCounts[username]) userStatusCounts[username] = {};
            userStatusCounts[username][status] = (userStatusCounts[username][status] || 0) + 1;
            
            // Daily counts (new functionality)
            if (!dailyStatusCounts[dateKey]) {
              dailyStatusCounts[dateKey] = {
                date: dateKey,
                total_engagement: 0,
                not_engaged: 0,
                applied: 0,
                engaged: 0,
                interview: 0,
                offer: 0,
                rejected: 0,
                archived: 0
              };
            }
            dailyStatusCounts[dateKey][status] = (dailyStatusCounts[dateKey][status] || 0) + 1;
            
            // Calculate total_engagement (all statuses except not_engaged)
            if (status !== 'not_engaged') {
              dailyStatusCounts[dateKey].total_engagement += 1;
            }
          }
        }
      }
    }

    // Prepare original user-based result
    const userResult = Object.entries(userStatusCounts).map(([username, statuses]) => ({
      username,
      statuses
    }));

    // Prepare daily totals result, sorted by date
    const dailyTotals = Object.values(dailyStatusCounts).sort((a, b) => new Date(a.date) - new Date(b.date));
    const grandTotal = {
      total_engagement: 0,
      not_engaged: 0,
      applied: 0,
      engaged: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      archived: 0
    };
    for (const day of dailyTotals) {
      for (const key of Object.keys(grandTotal)) {
        grandTotal[key] += day[key] || 0;
      }
    }


    res.json({
      users: userResult,
      dailyTotals,
      grandTotal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Repeat the same logic for Upwork if needed:
exports.getUpworkStatusHistory = async (req, res) => {
  try {
    let { date, start, end } = req.query;

    let startDate, endDate;

    if (date) {
      startDate = new Date(date);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    } else if (start && end) {
      startDate = new Date(start);
      endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const today = new Date();
      startDate = new Date(today.toISOString().split('T')[0]);
      endDate = new Date(today.toISOString().split('T')[0]);
      endDate.setHours(23, 59, 59, 999);
    }

    const userBatch = await UpworkUserJobBatch.findOne();
    if (!userBatch) {
      return res.status(404).json({ message: 'No user batch found' });
    }

    const userStatusCounts = {};
    const dailyStatusCounts = {};

    for (const batch of userBatch.batches) {
      for (const job of batch.jobs) {
        for (const entry of job.statusHistory) {
          const entryDate = new Date(entry.date);
          if (entryDate >= startDate && entryDate <= endDate) {
            const username = entry.username || 'Unknown';
            const status = entry.status;
            const dateKey = entryDate.toISOString().split('T')[0];

            // User-based counts
            if (!userStatusCounts[username]) userStatusCounts[username] = {};
            userStatusCounts[username][status] = (userStatusCounts[username][status] || 0) + 1;

            // Daily counts
            if (!dailyStatusCounts[dateKey]) {
              dailyStatusCounts[dateKey] = {
                date: dateKey,
                total_engagement: 0,
                not_engaged: 0,
                applied: 0,
                engaged: 0,
                interview: 0,
                offer: 0,
                rejected: 0,
                archived: 0
              };
            }
            dailyStatusCounts[dateKey][status] = (dailyStatusCounts[dateKey][status] || 0) + 1;
            if (status !== 'not_engaged') {
              dailyStatusCounts[dateKey].total_engagement += 1;
            }
          }
        }
      }
    }

    const userResult = Object.entries(userStatusCounts).map(([username, statuses]) => ({
      username,
      statuses
    }));

    const dailyTotals = Object.values(dailyStatusCounts).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      users: userResult,
      dailyTotals
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};