
const fs = require('fs');
const path = require('path');
// const { PythonShell } = require('python-shell');
const UpworkUserJobBatch = require('../models/upworkJobBatch');
const CompanyJob = require('../models/CompanyJob');
const { cleanupOldBatches } = require('../utils/dataCleanup');
const { spawn } = require('child_process');
// const Job = require('../models/upworkJobBatch'); // Ensure the Job model is imported


// const { fetchUpworkJobs } = require('../services/upworkService');

const { fetchUpworkJobs, filterAndDeduplicateUpworkJobs } = require('../services/upworkService');


exports.saveUpworkJobsBatchFromFile = async (req, res) => {
  try {
    const userId = req.user._id;
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

    // Clean up old batches (older than 7 days)
    const cleanupResult = await cleanupOldBatches(UpworkUserJobBatch, 7);
    
    if (!cleanupResult.success) {
      console.warn('Data cleanup failed:', cleanupResult.error);
    }

    res.status(201).json({
      message: 'Jobs batch uploaded from file successfully.',
      userId: userJobBatch.userId,
      // batch: newBatch, 
      totalBatches: userJobBatch.batches.length,
      cleanupResult: cleanupResult.success ? {
        batchesRemoved: cleanupResult.totalBatchesRemoved,
        usersProcessed: cleanupResult.totalUsersProcessed
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving jobs batch from file', error: error.message });
  }
};


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

exports.editJobById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;
    const { status, comment, username, ae_comment, ae_score, ae_pitched, estimated_budget } = req.body;

    if (!status && !comment && ae_comment === undefined && ae_score === undefined && ae_pitched === undefined && estimated_budget === undefined) {
      return res.status(400).json({ message: 'At least one field is required.' });
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


    // --- AE Score with username ---
    if (ae_score !== undefined && username) {
      if (!Array.isArray(jobToUpdate.ae_score)) jobToUpdate.ae_score = [];
      jobToUpdate.ae_score.push({
        value: ae_score,
        username,
        date: new Date()
      });
    }

    // --- AE Pitched ---
    if (ae_pitched !== undefined) {
      jobToUpdate.ae_pitched = ae_pitched;
    }

    // --- Estimated Budget ---
    if (estimated_budget !== undefined) {
      jobToUpdate.estimated_budget = estimated_budget;
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
      // For GET request, use query parameters instead of body
      const queryInput = req.query;
      
      // Use default input if no query params
      const input = (!queryInput || Object.keys(queryInput).length === 0) ? {
          age: 24,
          category: [
              "qa-testing",
              "ai-machine-learning",
              "web-development",
              "mobile-development",
              "other-software-development",
              "desktop-application-development",
              "ecommerce-development",
              "web-mobile-software-dev"
          ],
          contract_to_hire: false,
          dev_dataset_clear: true,
          dev_no_strip: false,
          fixed: true,
          hourly: true,
          "includes.attachments": false,
          "includes.history": false,
          limit: 100,
          location: [
              "United States",
              "United Kingdom",
              "Saudia Arabia",
              "United Arab Emirates",
              "Europe"
          ],
          no_hires: false,
          payment_verified: false,
          previous_clients: false,
          sort: "newest",
          tier: ["2", "3", "1"]
      } : queryInput;
      
      const { items, count } = await fetchUpworkJobs(input);
      res.json({
          message: 'Upwork jobs fetched and saved to JSON file',
          count,
      });
  } catch (error) {
      res.status(500).json({ message: 'Error fetching or saving jobs', error: error.message });
  }
};

// 
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


// In upworkController.js
exports.generateProposalForJob = async (req, res) => {
   try {
    console.log('--- Generating Proposal for Job ---');

    const { jobId } = req.params;
    const username = req.user.username; // Now reliably available
    const { selectedCategory } = req.body;

    // Safe company check (req.user.company is now populated)
    if (!req.user.company || !req.user.company._id) {
      return res.status(400).json({ message: 'Company ID is missing for the user.' });
    }
    const companyId = req.user.company._id;

    console.log('User:', username, 'Job ID:', jobId, 'Category:', selectedCategory);

    // Find the job and populate masterJobId for full details (including title)
    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId
    }).populate('masterJobId'); // Populate to get title, description, etc. from MasterJob

    if (!job) {
      return res.status(404).json({ message: 'Job not found for the given jobId and companyId.' });
    }

    // Now job.masterJobId should have the populated data
    const jobTitle = job.masterJobId ? job.masterJobId.title : 'Untitled'; // Fallback if not populated
    console.log('Job found:', jobTitle);

    // Prepare arguments for Python script (use populated job)
    const jobData = JSON.stringify(job); // Now includes masterJobId fields
    const scriptPath = path.join(__dirname, '../python/proposal_generator.py');
    const args = [
      scriptPath,
      '--type', 'upwork',
      '--job', jobData,
      '--category', selectedCategory
    ];
    console.log('Spawning Python process...');
    const py = spawn('python', args);

    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('PYTHON STDOUT:', data.toString());
    });

    py.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('PYTHON STDERR:', data.toString());
    });

   py.on('close', async (code) => {
  if (code === 0) {
    try {
      if (!stdout.trim()) {
        throw new Error('Python script produced empty output.');
      }
      const result = JSON.parse(stdout);
      if (result.error) {
        throw new Error(`Python script error: ${result.error}`);
      }
      const proposal = result.proposal;

      // Update the job with the generated proposal
      job.proposal = proposal;
      await job.save();

      console.log('Proposal saved to DB.');
      res.json({ proposal, job });
    } catch (err) {
      console.error('Error parsing Python output:', err);
      res.status(500).json({ message: 'Error parsing proposal output.', details: err.message });
    }
  } else {
    console.error('Python script exited with code', code, stderr);
    res.status(500).json({ message: 'Proposal generation failed.', error: stderr });
  }
});
  } catch (error) {
    console.error('Error generating proposal:', error);
    res.status(500).json({
      message: 'Failed to generate proposal.',
      error: error.message,
    });
  }
};

exports.updateProposalText = async (req, res) => {
  try {
    const username = req.user.username; // For logging/reference
    const { jobId } = req.params;
    const { proposal } = req.body;

    if (typeof proposal !== 'string' || proposal.trim() === '') {
      return res.status(400).json({ message: 'Proposal text is required and must not be empty.' });
    }

    // Safe company check (req.user.company is populated via middleware)
    if (!req.user.company || !req.user.company._id) {
      return res.status(400).json({ message: 'Company ID is missing for the user.' });
    }
    const companyId = req.user.company._id;

    console.log('User:', username, 'Updating proposal for Job ID:', jobId);

    // Find the job and populate masterJobId (for full details, if needed in response)
    const job = await CompanyJob.findOne({
      _id: jobId,
      companyId
    }).populate('masterJobId'); // Optional: Populate for title/description in response

    if (!job) {
      return res.status(404).json({ message: 'Job not found for the given jobId and companyId.' });
    }

    // Update the proposal
    job.proposal = proposal.trim();
    await job.save();

    console.log(`Proposal updated for job ${jobId} by user ${req.user._id}`);
    res.json({ 
      message: 'Proposal updated successfully', 
      proposal, 
      job 
    });
  } catch (err) {
    console.error('Error updating proposal:', err);
    res.status(500).json({ message: 'Server error.', details: err.message });
  }
};
