const path = require('path');
const fs = require('fs');
const { fetchJobsFromApify } = require('../config/apifyService');
const { runAimlProcessing } = require('../services/aimlProcessService');
const UserJobBatch = require('../models/jobBatchSchema');
// const JobBatch = require('../models/jobBatchSchema'); // or your actual model

// Fetch jobs from Apify and save as raw JSON
exports.fetchAndSaveJobs = async (req, res) => {
  try {
    const input = {
      easyApply: false,
      employmentType: ["full-time", "part-time"],
      experienceLevel: ["executive", "director", "mid-senior", "associate"],
      jobTitles: ["Test Automation", "QA" , "SQA","Web Development", "AI/ML", "UI/UX"],
      locations: ["Saudi Arabia", "United Arab Emirates","United States","United Kingdom"],
      maxItems: 25,
      postedLimit: "24h",
      sortBy: "date",
      under10Applicants: false,
      workplaceType: ["remote"]
    };
    const jobs = await fetchJobsFromApify(input);
    const filePath = path.join(__dirname, '../data/apify_jobs_raw.json');
    fs.writeFileSync(filePath, JSON.stringify(jobs, null, 2), 'utf-8');
    console.log('Writing to:', filePath);
    console.log('File written!');
    res.json({ message: 'Jobs fetched and saved to JSON file', count: jobs.length });
  } catch (error) {
    console.error('Error fetching or saving jobs:', error);
    res.status(500).json({ message: 'Error fetching or saving jobs', error: error.message });
  }
};

// Return processed jobs as JSON
exports.getProcessedJobs = (req, res) => {
  try {
    const processedPath = path.join(__dirname, '../data/apify_jobs_processed.json');
    const jobs = JSON.parse(fs.readFileSync(processedPath, 'utf-8'));
    res.json(jobs);
  } catch (error) {
    console.error('Error reading processed jobs:', error);
    res.status(500).json({ message: 'Error reading processed jobs', error: error.message });
  }
};

// Run AIML processing and return result
exports.scoreJobs = async (req, res) => {
  try {
    const result = await runAimlProcessing();
    res.json({ message: result });
  } catch (error) {
    console.error('Scoring process failed:', error);
    res.status(500).json({ message: 'Scoring process failed', error: error.message });
  }
};


  // Serve scored jobs output as JSON
exports.getScoredJobs = (req, res) => {
  try {
    const scoredPath = path.join(__dirname, '../data/scored_jobs_output.json');
    const jobs = JSON.parse(fs.readFileSync(scoredPath, 'utf-8'));
    res.json(jobs);
  } catch (error) {
    console.error('Error reading scored jobs:', error);
    res.status(500).json({ message: 'Error reading scored jobs', error: error.message });
  }
};


exports.uploadScoredJobsFromFile = async (req, res) => {
  try {
    const userId = req.user._id;
    const filePath = path.join(__dirname, '../data/scored_jobs_output.json');

    // Read and parse the JSON file (which is an array)
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jobs = JSON.parse(fileContent);

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ message: 'Jobs array is empty or invalid in the file.' });
    }

    // Use today's date as the batch date
    const date = new Date().toISOString().split('T')[0];

    // Prepare the new batch
    const newBatch = {
      date,
      jobs,
      timestamp: new Date()
    };

    // Find or create UserJobBatch
    let userJobBatch = await UserJobBatch.findOne({ userId });

    if (userJobBatch) {
      userJobBatch.batches.push(newBatch);
      await userJobBatch.save();
    } else {
      userJobBatch = new UserJobBatch({
        userId,
        batches: [newBatch]
      });
      await userJobBatch.save();
    }

    return res.status(201).json({ message: 'Jobs batch uploaded from file successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Get jobs for a user by date or date range.
 * - No params: latest batch.
 * - date: jobs for that date.
 * - startDate/endDate: jobs for date range (inclusive).
 */
exports.getJobsByDate = async (req, res) => {
  try {
    const userId = req.user._id;
    let { date, startDate, endDate } = req.query;

    const userJobBatch = await UserJobBatch.findOne({ userId });

    if (!userJobBatch || !userJobBatch.batches.length) {
      return res.status(404).json({ message: 'No job batches found for user.' });
    }

    // No params: return latest batch
    if (!date && !startDate && !endDate) {
      const latestBatch = userJobBatch.batches.reduce((latest, current) =>
        !latest || new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest, null
      );
      if (!latestBatch) {
        return res.status(404).json({ message: 'No jobs found.' });
      }
      return res.json({ date: latestBatch.date, jobs: latestBatch.jobs });
    }

    // If only date is provided, treat as both start and end
    if (date) {
      startDate = endDate = date;
    }
    // If only one of startDate/endDate is provided, use it for both
    if (startDate && !endDate) endDate = startDate;
    if (endDate && !startDate) startDate = endDate;

    // Get all batches within the date range (inclusive)
    const batchesInRange = userJobBatch.batches.filter(b =>
      b.date >= startDate && b.date <= endDate
    );

    if (!batchesInRange.length) {
      return res.status(404).json({ message: 'No jobs found for this date range.' });
    }

    // Merge all jobs from all batches in the range
    const jobs = batchesInRange.flatMap(b => b.jobs);

    return res.json({ startDate, endDate, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};
// ... existing code ...
// Utility to safely access nested properties
function toSafe(obj, path, fallback = null) {
  try {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : fallback), obj);
  } catch {
    return fallback;
  }
}

// Required countries and codes (case-insensitive)
const requiredCountries = [
  "saudi arabia",
  "united arab emirates",
  "united states",
  "uk",
  "united kingdom"
];
const requiredCountryCodes = ["us", "uk", "ae", "sa"];

function isRequiredCountry(country) {
  if (!country) return false;
  const c = country.toLowerCase().trim();
  return (
    requiredCountries.includes(c) ||
    requiredCountryCodes.includes(c)
  );
}

exports.getFilteredJobs = (req, res) => {
  try {
    const rawPath = path.join(__dirname, '../data/apify_jobs_raw.json');
    const jobs = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

    // Remove duplicates by id
    const seenIds = new Set();
    const duplicateIds = [];
    const uniqueJobs = jobs.filter(job => {
      if (seenIds.has(job.id)) {
        duplicateIds.push(job.id);
        return false;
      }
      seenIds.add(job.id);
      return true;
    });

    // Filter jobs by all possible country fields
    const excludedByCountryJobs = [];
    const filtered = uniqueJobs.filter(job => {
      let countries = [];

      // company.locations[].parsed.country, company.locations[].country, company.locations[].parsed.countryCode
      const companyLocs = toSafe(job, 'company.locations', []);
      if (Array.isArray(companyLocs)) {
        companyLocs.forEach(loc => {
          if (toSafe(loc, 'parsed.country')) countries.push(toSafe(loc, 'parsed.country'));
          if (toSafe(loc, 'country')) countries.push(toSafe(loc, 'country'));
          if (toSafe(loc, 'parsed.countryCode')) countries.push(toSafe(loc, 'parsed.countryCode'));
        });
      }

      // location.parsed.country, location.country, location.parsed.countryCode
      if (toSafe(job, 'location.parsed.country')) countries.push(toSafe(job, 'location.parsed.country'));
      if (toSafe(job, 'location.country')) countries.push(toSafe(job, 'location.country'));
      if (toSafe(job, 'location.parsed.countryCode')) countries.push(toSafe(job, 'location.parsed.countryCode'));

      // If any country field matches, keep the job
      const match = countries.some(isRequiredCountry);
      if (!match) excludedByCountryJobs.push(job);
      return match;
    }).map(job => ({
      id: job.id,
      title: job.title,
      linkedinUrl: job.linkedinUrl,
      postedDate: job.postedDate,
      expireAt: job.expireAt,
      descriptionText: job.descriptionText,
      employmentType: job.employmentType,
      workplaceType: job.workplaceType,
      easyApplyUrl: job.easyApplyUrl,
      applicants: job.applicants,
      views: job.views,
      jobApplicationLimitReached: job.jobApplicationLimitReached,
      applyMethod: toSafe(job, 'applyMethod.companyApplyUrl'),
      salary: toSafe(job, 'salary.text'),
      company: {
        linkedinUrl: toSafe(job, 'company.linkedinUrl'),
        logo: toSafe(job, 'company.logo'),
        website: toSafe(job, 'company.website'),
        name: toSafe(job, 'company.name'),
        employeeCount: toSafe(job, 'company.employeeCount'),
        followerCount: toSafe(job, 'company.followerCount'),
        description: toSafe(job, 'company.description'),
        specialities: toSafe(job, 'company.specialities', []),
        industries: toSafe(job, 'company.industries', []),
        locations: (toSafe(job, 'company.locations', []) || []).map(loc => ({
          city: toSafe(loc, 'parsed.city'),
          state: toSafe(loc, 'parsed.state'),
          country: toSafe(loc, 'parsed.country')
        }))
      }
    }));

    // Save filtered data to file
    const outPath = path.join(__dirname, '../data/filtered.json');
    fs.writeFileSync(outPath, JSON.stringify(filtered, null, 2), 'utf-8');

    // Debug output (can be removed/commented after testing)
    console.log('Duplicate IDs removed:', duplicateIds);
    console.log('Jobs excluded by country (IDs):', excludedByCountryJobs.map(j => j.id));

    // Respond with summary only
    res.status(200).json({
      message: 'Filtered jobs saved to data/filtered.json',
      total_raw: jobs.length,
      total_unique: uniqueJobs.length,
      duplicates_removed: duplicateIds.length,
      duplicate_ids: duplicateIds, // for debug
      excluded_by_country: excludedByCountryJobs.length,
      excluded_by_country_ids: excludedByCountryJobs.map(j => j.id), // for debug
      total_saved: filtered.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error filtering jobs', error: error.message });
  }
};

// ... existing code ...

/**
 * Update status and comments for a job in a user's batch.
 * PATCH /api/jobs/:jobId
 * Body: { status: "new_status", comment: "Your comment" }
 */

exports.updateJobStatusAndComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;
    const { status, comment } = req.body;

    if (!status && !comment) {
      return res.status(400).json({ message: 'At least one of status or comment is required.' });
    }

    // Find the user's job batches
    const userJobBatch = await UserJobBatch.findOne({ userId });
    if (!userJobBatch) {
      return res.status(404).json({ message: 'No job batches found for user.' });
    }

    // Find the latest batch (by timestamp) that contains the job
    let latestBatchWithJob = null;
    let latestBatchIndex = -1;
    let jobToUpdate = null;

    userJobBatch.batches.forEach((batch, idx) => {
      const job = batch.jobs.find(j => j.id === jobId);
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
    if (status) jobToUpdate.status = status;
    if (comment) {
      if (!Array.isArray(jobToUpdate.comments)) jobToUpdate.comments = [];
      jobToUpdate.comments.push(comment);
    }

    // Save the updated userJobBatch
    await userJobBatch.save();
    return res.json({ message: 'Job updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};