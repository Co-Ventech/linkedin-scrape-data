
const fs = require('fs');
const path = require('path');
// const { fetchUpworkJobs } = require('../services/upworkService');
const { fetchUpworkJobs, filterAndDeduplicateUpworkJobs } = require('../services/upworkService');

// const UpworkJob = require('../models/upworkJobSchema');

// Save jobs (bulk insert or upsert)
// exports.saveUpworkJobs = async (req, res) => {
//   try {
//     const jobs = req.body;
//     if (!Array.isArray(jobs)) {
//       return res.status(400).json({ message: 'Input should be an array of jobs' });
//     }
//     // Upsert each job by jobId
//     const bulkOps = jobs.map(job => ({
//       updateOne: {
//         filter: { jobId: job.jobId },
//         update: { $set: job },
//         upsert: true
//       }
//     }));
//     await UpworkJob.bulkWrite(bulkOps);
//     res.json({ message: 'Jobs saved/updated successfully', count: jobs.length });
//   } catch (error) {
//     res.status(500).json({ message: 'Error saving jobs', error: error.message });
//   }
// };

// exports.saveUpworkJobs = async (req, res) => {
//   try {
//     let jobs = req.body;
//     // If a single object, wrap in array
//     if (!Array.isArray(jobs)) {
//       if (typeof jobs === 'object' && jobs !== null) {
//         jobs = [jobs];
//       } else {
//         return res.status(400).json({ message: 'Input should be an array of jobs or a job object' });
//       }
//     }
//     // Upsert each job by jobId
//     const bulkOps = jobs.map(job => ({
//       updateOne: {
//         filter: { jobId: job.jobId },
//         update: { $set: job },
//         upsert: true
//       }
//     }));
//     await UpworkJob.bulkWrite(bulkOps);
//     res.json({ message: 'Jobs saved/updated successfully', count: jobs.length });
//   } catch (error) {
//     res.status(500).json({ message: 'Error saving jobs', error: error.message });
//   }
// };

// const UpworkJob = require('../models/upworkJobSchema');

// exports.saveUpworkJobsFromFile = async (req, res) => {
//   try {
//     const filePath = path.join(__dirname, '../data/final_jobs_upwork.json');
//     const fileContent = fs.readFileSync(filePath, 'utf-8');
//     let jobs = JSON.parse(fileContent);

//     if (!Array.isArray(jobs) || jobs.length === 0) {
//       return res.status(400).json({ message: 'Jobs array is empty or invalid in the file.' });
//     }

//     // Upsert each job by jobId
//     const bulkOps = jobs.map(job => ({
//       updateOne: {
//         filter: { jobId: job.jobId },
//         update: { $set: job },
//         upsert: true
//       }
//     }));
//     await UpworkJob.bulkWrite(bulkOps);

//     res.json({ message: 'Jobs saved/updated successfully from file', count: jobs.length });
//   } catch (error) {
//     res.status(500).json({ message: 'Error saving jobs from file', error: error.message });
//   }
// };
// controllers/upworkJobBatchController.js
// const fs = require('fs');
// const path = require('path');
const UpworkUserJobBatch = require('../models/upworkJobBatch');

exports.saveUpworkJobsBatchFromFile = async (req, res) => {
  try {
    const userId = req.user._id; // Provided by JWT auth middleware
    const filePath = path.join(__dirname, '../data/final_jobs_upwork.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    let jobs = JSON.parse(fileContent);

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ message: 'Jobs array is empty or invalid in the file.' });
    }

    // Prepare batch
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const newBatch = {
      timestamp: now,
      date,
      jobs
    };

    // Find or create the user's batch document
    let userJobBatch = await UpworkUserJobBatch.findOne({ userId });

    if (userJobBatch) {
      userJobBatch.batches.push(newBatch);
      await userJobBatch.save();
    } else {
      userJobBatch = new UpworkUserJobBatch({
        userId,
        batches: [newBatch]
      });
      await userJobBatch.save();
    }

    res.status(201).json({
      message: 'Jobs batch uploaded from file successfully.',
      userId: userJobBatch.userId,
      batch: newBatch,
      totalBatches: userJobBatch.batches.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving jobs batch from file', error: error.message });
  }
};

// Get jobs by date (ts_create)
// exports.getJobsByDate = async (req, res) => {
//   try {
//     const { date } = req.query;
//     if (!date) return res.status(400).json({ message: 'Date query param required (YYYY-MM-DD)' });
//     const start = new Date(date);
//     const end = new Date(date);
//     end.setDate(end.getDate() + 1);

//     const jobs = await UpworkJob.find({
//       ts_create: { $gte: start, $lt: end }
//     });
//     res.json(jobs);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching jobs by date', error: error.message });
//   }
// };
/**
 * GET /api/upwork/jobs-by-date
 * Query params:
 *   - date (YYYY-MM-DD): fetch jobs for this date only
 *   - start (YYYY-MM-DD): fetch jobs from this date onward
 *   - end (YYYY-MM-DD): fetch jobs up to this date (inclusive)
 * If no params, returns jobs from the most recent batch.
 */
exports.getJobsByDate = async (req, res) => {
  try {
    const userId = req.user._id; // Provided by auth middleware
    const { date, start, end } = req.query;

    // Find the user's batches
    const userBatches = await UpworkUserJobBatch.findOne({ userId });
    if (!userBatches || !userBatches.batches.length) {
      return res.status(404).json({ message: 'No jobs found for this user.' });
    }

    let filteredBatches = [];

    if (date) {
      filteredBatches = userBatches.batches.filter(batch => batch.date === date);
    } else if (start && end) {
      filteredBatches = userBatches.batches.filter(batch => batch.date >= start && batch.date <= end);
    } else if (start) {
      filteredBatches = userBatches.batches.filter(batch => batch.date >= start);
    } else {
      // No params: return the most recent batch
      const lastBatch = userBatches.batches.reduce((latest, batch) =>
        !latest || new Date(batch.timestamp) > new Date(latest.timestamp) ? batch : latest
      , null);
      if (!lastBatch) {
        return res.status(404).json({ message: 'No batches found for this user.' });
      }
      return res.json({
        message: 'Jobs fetched from the most recent batch',
        count: lastBatch.jobs.length,
        jobs: lastBatch.jobs,
        batchDate: lastBatch.date,
        batchTimestamp: lastBatch.timestamp
      });
    }

    // Flatten jobs from all matching batches
    const jobs = filteredBatches.flatMap(batch => batch.jobs);

    res.json({
      message: 'Jobs fetched successfully',
      count: jobs.length,
      jobs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs by date', error: error.message });
  }
};

// Edit job by jobId
// exports.editJobByJobId = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const update = req.body;
//     const job = await UpworkJob.findOneAndUpdate({ jobId }, update, { new: true });
//     if (!job) return res.status(404).json({ message: 'Job not found' });
//     res.json(job);
//   } catch (error) {
//     res.status(500).json({ message: 'Error editing job', error: error.message });
//   }
// };

/**
 * PATCH /api/upwork/job/:jobId
 * Body: { ...fields to update... }
 * Edits the job with the given jobId in any batch for the authenticated user.
 */
// exports.editJobById = async (req, res) => {
//   try {
//     const userId = req.user._id; // Provided by auth middleware
//     const { jobId } = req.params;
//     const updateFields = req.body;

//     // Find the user's batches
//     const userBatches = await UpworkUserJobBatch.findOne({ userId });
//     if (!userBatches) {
//       return res.status(404).json({ message: 'No jobs found for this user.' });
//     }

//     let jobFound = false;
//     // Loop through batches and jobs to find and update the job
//     for (const batch of userBatches.batches) {
//       const job = batch.jobs.find(j => j.jobId === jobId);
//       if (job) {
//         Object.assign(job, updateFields);
//         jobFound = true;
//         break;
//       }
//     }

//     if (!jobFound) {
//       return res.status(404).json({ message: 'Job not found for this user.' });
//     }

//     await userBatches.save();
//     res.json({ message: 'Job updated successfully.' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating job', error: error.message });
//   }
// };
// exports.editJobById = async (req, res) => {
//   try {
//     const userId = req.user._id; // Provided by auth middleware
//     const { jobId } = req.params;
//     const updateFields = req.body;

//     // Find the user's batches
//     const userBatches = await UpworkUserJobBatch.findOne({ userId });
//     if (!userBatches || !userBatches.batches.length) {
//       return res.status(404).json({ message: 'No batches found for user.' });
//     }

//     // Search batches in reverse (latest first)
//     let jobFound = false;
//     for (let i = userBatches.batches.length - 1; i >= 0; i--) {
//       const batch = userBatches.batches[i];
//       const jobIndex = batch.jobs.findIndex(job => job.jobId === jobId);
//       if (jobIndex !== -1) {
//         // Update the job fields
//         Object.assign(batch.jobs[jobIndex], updateFields);
//         jobFound = true;
//         break; // Only update the most recent batch
//       }
//     }

//     if (!jobFound) {
//       return res.status(404).json({ message: 'Job not found in any batch.' });
//     }

//     await userBatches.save();
//     res.json({ message: 'Job updated successfully.' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating job', error: error.message });
//   }
// };
// exports.editJobById = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { jobId } = req.params;
//     const { status, comment, username, ae_comment } = req.body;

//     if (!status && !comment && ae_comment === undefined) {
//       return res.status(400).json({ message: 'At least one of status, comment, or ae_comment is required.' });
//     }

//     // Find the user's job batches
//     const userJobBatch = await UpworkUserJobBatch.findOne({ userId });
//     if (!userJobBatch) {
//       return res.status(404).json({ message: 'No job batches found for user.' });
//     }

//     // Find the latest batch (by timestamp) that contains the job
//     let latestBatchWithJob = null;
//     let jobToUpdate = null;

//     userJobBatch.batches.forEach((batch) => {
//       const job = batch.jobs.find(j => j.id === jobId);
//       if (job) {
//         if (
//           !latestBatchWithJob ||
//           new Date(batch.timestamp) > new Date(latestBatchWithJob.timestamp)
//         ) {
//           latestBatchWithJob = batch;
//           jobToUpdate = job;
//         }
//       }
//     });

//     if (!jobToUpdate) {
//       return res.status(404).json({ message: 'Job not found for user.' });
//     }

//     // Update status and/or comment
//     if (status && username) {
//       jobToUpdate.currentStatus = status;
//       if (!Array.isArray(jobToUpdate.statusHistory)) jobToUpdate.statusHistory = [];
//       jobToUpdate.statusHistory.push({
//         status,
//         username,
//         date: new Date()
//       });
//     }

//     if (comment && username) {
//       if (!Array.isArray(jobToUpdate.comments)) jobToUpdate.comments = [];
//       jobToUpdate.comments.push({
//         username,
//         comment,
//         date: new Date()
//       });
//     }

//     if (ae_comment !== undefined) {
//       jobToUpdate.ae_comment = ae_comment;
//     }

//     await userJobBatch.save();
//     return res.json({ message: 'Upwork job updated successfully.' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error.' });
//   }
// };

exports.editJobById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;
    const { status, comment, username, ae_comment } = req.body;

    if (!status && !comment && ae_comment === undefined) {
      return res.status(400).json({ message: 'At least one of status, comment, or ae_comment is required.' });
    }

    // Find the user's job batches
    const userJobBatch = await UpworkUserJobBatch.findOne({ userId });
    if (!userJobBatch) {
      return res.status(404).json({ message: 'No job batches found for user.' });
    }

    // Find the latest batch (by timestamp) that contains the job
    let latestBatchWithJob = null;
    let latestBatchIndex = -1;
    let jobToUpdate = null;

    userJobBatch.batches.forEach((batch, idx) => {
      const job = batch.jobs.find(j => j.jobId === jobId);
      if (job) {
        if (
          !latestBatchWithJob ||
          new Date(batch.timestamp) > new Date(latestBatchWithJob.timestamp)
        ) {
          latestBatchWithJob = batch;
          latestBatchIndex = idx;
          jobToUpdate = job;
        }
      }
    });

    if (!jobToUpdate) {
      return res.status(404).json({ message: 'Job not found for user.' });
    }

    // Update status and/or comment
    if (status && username) {
      jobToUpdate.currentStatus = status;
      if (!Array.isArray(jobToUpdate.statusHistory)) jobToUpdate.statusHistory = [];
      jobToUpdate.statusHistory.push({
        status,
        username,
        date: new Date()
      });
    }

    if (comment && username) {
      if (!Array.isArray(jobToUpdate.comments)) jobToUpdate.comments = [];
      jobToUpdate.comments.push({
        username,
        comment,
        date: new Date()
      });
    }

    if (ae_comment !== undefined) {
      jobToUpdate.ae_comment = ae_comment;
    }

    // Save the updated userJobBatch
    await userJobBatch.save();
    return res.json({ message: 'Upwork job updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};


exports.fetchAndSaveJobs = async (req, res) => {
    try {
        const input = req.body; // Accepts JSON input from POST
        const { items, count } = await fetchUpworkJobs(input);
        res.json({
            message: 'Upwork jobs fetched and saved to JSON file',
            count,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching or saving jobs', error: error.message });
    }
};



// ... existing exports ...

exports.filterUpworkJobs = (req, res) => {
  try {
    const result = filterAndDeduplicateUpworkJobs();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error filtering jobs', error: error.message });
  }
};


const { exec } = require('child_process');
// const path = require('path');

exports.scoreUpworkJobs = (req, res) => {
    const inputPath = path.join(__dirname, '../data/filtered_upwork.json');
    const outputPath = path.join(__dirname, '../data/final_jobs_upwork.json');
    const scriptPath = path.join(__dirname, '../python/upwork.py');

    exec(`python "${scriptPath}" "${inputPath}" "${outputPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error('Error running upwork.py:', error, stderr);
            return res.status(500).json({ message: 'Error scoring jobs', error: stderr || error.message });
        }
        res.json({
            message: 'Upwork jobs scored successfully',
            output: outputPath,
            python_stdout: stdout
        });
    });
};

// const fs = require('fs');

exports.getUpworkFinalScores = (req, res) => {
    const outputPath = path.join(__dirname, '../data/final_jobs_upwork.json');
    try {
        if (!fs.existsSync(outputPath)) {
            return res.status(404).json({ message: 'Upwork score file not found. Please run the scoring process first.' });
        }
        const data = fs.readFileSync(outputPath, 'utf-8');
        const jobs = JSON.parse(data);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error reading upwork score file', error: error.message });
    }
};


// ... existing code ...

/**
 * GET /api/upwork/job?id=xxx
 * Returns the latest upwork job with the given jobId for the authenticated user.
 */
exports.getJobById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'Job id is required as query param.' });
    }
    const userJobBatch = await UpworkUserJobBatch.findOne({ userId });
    if (!userJobBatch || !userJobBatch.batches.length) {
      return res.status(404).json({ message: 'No job batches found for user.' });
    }
    // Search batches in reverse (latest first)
    for (let i = userJobBatch.batches.length - 1; i >= 0; i--) {
      const batch = userJobBatch.batches[i];
      const job = batch.jobs.find(j => j.jobId === id);
      if (job) {
        return res.json(job);
      }
    }
    return res.status(404).json({ message: 'Job not found for user.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};