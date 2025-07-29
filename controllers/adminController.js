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

    for (const batch of userBatch.batches) {
      for (const job of batch.jobs) {
        for (const entry of job.statusHistory) {
          const entryDate = new Date(entry.date);
          if (entryDate >= startDate && entryDate <= endDate) {
            const username = entry.username || 'Unknown';
            const status = entry.status;
            if (!userStatusCounts[username]) userStatusCounts[username] = {};
            userStatusCounts[username][status] = (userStatusCounts[username][status] || 0) + 1;
          }
        }
      }
    }

    const result = Object.entries(userStatusCounts).map(([username, statuses]) => ({
      username,
      statuses
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUpworkStatusHistory = async (req, res) => {
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

    const userBatch = await UpworkUserJobBatch.findOne();
    if (!userBatch) {
      return res.status(404).json({ message: 'No user batch found' });
    }

    const userStatusCounts = {};

    for (const batch of userBatch.batches) {
      for (const job of batch.jobs) {
        for (const entry of job.statusHistory) {
          const entryDate = new Date(entry.date);
          if (entryDate >= startDate && entryDate <= endDate) {
            const username = entry.username || 'Unknown';
            const status = entry.status;
            if (!userStatusCounts[username]) userStatusCounts[username] = {};
            userStatusCounts[username][status] = (userStatusCounts[username][status] || 0) + 1;
          }
        }
      }
    }

    const result = Object.entries(userStatusCounts).map(([username, statuses]) => ({
      username,
      statuses
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};