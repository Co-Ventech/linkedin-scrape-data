const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
// const { PythonShell } = require('python-shell');

const { spawn } = require('child_process');
// const path = require('path');


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
    const filePath = path.join(__dirname, '../data/scored_linkedin_jobs.json');

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
    // const { status, comment } = req.body;
    const { status, comment, username, ae_comment } = req.body;

    if (!status && !comment && ae_comment === undefined) {
      return res.status(400).json({ message: 'At least one of status, comment, or ae_comment is required.' });
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
    // if (status) jobToUpdate.status = status;
    if (status && username) {
      jobToUpdate.currentStatus = status;
      if (!Array.isArray(jobToUpdate.statusHistory)) jobToUpdate.statusHistory = [];
      jobToUpdate.statusHistory.push({
        status,
        username,
        date: new Date()
      });
    }
    
    // if (comment) {
    //   if (!Array.isArray(jobToUpdate.comments)) jobToUpdate.comments = [];
    //   jobToUpdate.comments.push(comment);
    // }
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
    return res.json({ message: 'Job updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};


// ... existing code ...

/**
 * GET /api/apify/job?id=xxx
 * Returns the latest job with the given id for the authenticated user.
 */
exports.getJobById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'Job id is required as query param.' });
    }
    const userJobBatch = await UserJobBatch.findOne({ userId });
    if (!userJobBatch || !userJobBatch.batches.length) {
      return res.status(404).json({ message: 'No job batches found for user.' });
    }
    // Search batches in reverse (latest first)
    for (let i = userJobBatch.batches.length - 1; i >= 0; i--) {
      const batch = userJobBatch.batches[i];
      const job = batch.jobs.find(j => j.id === id);
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
// ...existing code...

// exports.exportJobsByDateToExcel = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const userJobBatch = await UserJobBatch.findOne({ userId });

//     if (!userJobBatch || !userJobBatch.batches.length) {
//       return res.status(404).json({ message: 'No job batches found for user.' });
//     }

//     // Get the latest batch by timestamp
//     const latestBatch = userJobBatch.batches.reduce((latest, current) =>
//       !latest || new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest, null
//     );
//     if (!latestBatch || !latestBatch.jobs.length) {
//       return res.status(404).json({ message: 'No jobs found in the latest batch.' });
//     }

//     const jobs = latestBatch.jobs;

//     // Collect all unique keys from all jobs for dynamic columns
//     const allKeys = Array.from(
//       jobs.reduce((set, job) => {
//         Object.keys(job).forEach(key => set.add(key));
//         return set;
//       }, new Set())
//     );

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Latest Batch Jobs');

//     // Set columns dynamically
//     worksheet.columns = allKeys.map(key => ({
//       header: key,
//       key: key,
//       width: 25
//     }));

//     // Add job rows
//     jobs.forEach(job => {
//       // Flatten nested objects for Excel (e.g., statusHistory, comments)
//       const row = {};
//       allKeys.forEach(key => {
//         const value = job[key];
//         if (Array.isArray(value)) {
//           row[key] = JSON.stringify(value);
//         } else if (typeof value === 'object' && value !== null) {
//           row[key] = JSON.stringify(value);
//         } else {
//           row[key] = value;
//         }
//       });
//       worksheet.addRow(row);
//     });

//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', 'attachment; filename=latest_batch_jobs.xlsx');

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error generating Excel file.' });
//   }
// };

// exports.exportJobsByDateToExcel = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const userJobBatch = await UserJobBatch.findOne({ userId });

//     if (!userJobBatch || !userJobBatch.batches.length) {
//       return res.status(404).json({ message: 'No job batches found for user.' });
//     }

//     // Get the latest batch by timestamp
//     const latestBatch = userJobBatch.batches.reduce((latest, current) =>
//       !latest || new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest, null
//     );
//     if (!latestBatch || !latestBatch.jobs.length) {
//       return res.status(404).json({ message: 'No jobs found in the latest batch.' });
//     }

//     const jobs = latestBatch.jobs;

//     // Collect all unique keys from all jobs for dynamic columns
//     const allKeys = Array.from(
//       jobs.reduce((set, job) => {
//         Object.keys(job).forEach(key => set.add(key));
//         return set;
//       }, new Set())
//     );

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Latest Batch Jobs');

//     // Set columns dynamically
//     worksheet.columns = allKeys.map(key => ({
//       header: key,
//       key: key,
//       width: 25
//     }));

//     // Add job rows
//     jobs.forEach(job => {
//       // Flatten nested objects for Excel (e.g., statusHistory, comments)
//       const row = {};
//       allKeys.forEach(key => {
//         const value = job[key];
//         if (Array.isArray(value)) {
//           row[key] = JSON.stringify(value);
//         } else if (typeof value === 'object' && value !== null) {
//           row[key] = JSON.stringify(value);
//         } else {
//           row[key] = value;
//         }
//       });
//       worksheet.addRow(row);
//     });

//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', 'attachment; filename=latest_batch_jobs.xlsx');

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error generating Excel file.' });
//   }
// };


exports.exportJobsByDateToExcel = async (req, res) => {
  try {
    const userId = req.user._id;
    const userJobBatch = await UserJobBatch.findOne({ userId });
    if (!userJobBatch || !userJobBatch.batches.length) {
      return res.status(404).json({ message: 'No job batches found for user.' });
    }

    // Get the latest batch by timestamp
    const latestBatch = userJobBatch.batches.reduce((latest, current) =>
      !latest || new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest, null
    );
    if (!latestBatch || !latestBatch.jobs.length) {
      return res.status(404).json({ message: 'No jobs found in the latest batch.' });
    }

    const jobs = latestBatch.jobs;

    // Define columns as per your requirements
    const columns = [
      { header: 'ZoomInfo Contact ID', key: 'id', width: 20 },
      { header: 'Job Title', key: 'title', width: 30 },
      // { header: 'Management Level', key: 'employmentType', width: 20 },
      { header: 'Employment & Workplace', key: 'employmentAndWorkplace', width: 30 },

      { header: 'Job Start Date', key: 'postedDate', width: 20 },
      { header: 'Job Function', key: 'descriptionText', width: 40 },
      { header: 'LinkedIn Contact Profile URL', key: 'linkedinUrl', width: 40 },
      { header: 'Email Address', key: 'email', width: 30 }, // Not present in schema
      { header: 'City', key: 'city', width: 20 },
      { header: 'Country', key: 'company_country', width: 20 },
      { header: 'Company Name', key: 'company_name', width: 30 },
      { header: 'Website', key: 'company_website', width: 30 },
      { header: 'Employees', key: 'company_employeeCount', width: 15 },
      { header: 'Employee Range', key: 'employee_range', width: 15 }, // Not present, can be derived
      { header: 'Primary Industry', key: 'company_industry', width: 20 },
      { header: 'LinkedIn Company Profile URL', key: 'company_linkedinUrl', width: 40 },
      { header: 'Company City', key: 'company_city', width: 20 },
      { header: 'Company State', key: 'company_state', width: 20 }
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Jobs');

    worksheet.columns = columns;

    // Add job rows
    jobs.forEach(job => {
      const company = job.company || {};
      const location = (company.locations && company.locations[0]) || {};
      worksheet.addRow({
        id: job.id,
        title: job.title,
        // employmentType: job.employmentType,
        employmentAndWorkplace: `${job.employmentType || ''} - (${job.workplaceType || ''})`,

        postedDate: job.postedDate ? job.postedDate.toISOString().split('T')[0] : '',
        descriptionText: job.descriptionText,
        linkedinUrl: job.linkedinUrl,
        email: '', // Not present in schema
        city: location.city || '',  
        company_city: location.city || '',
        company_country: location.country || '',
        company_name: company.name || '',
        company_website: company.website || '',
        company_employeeCount: company.employeeCount || '',
        employee_range: '', // Not present, can be derived from employeeCount
        company_industry: (company.industries && company.industries[0]) || '',
        company_linkedinUrl: company.linkedinUrl || '',
        company_state: location.state || ''
        
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=custom_jobs.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating Excel file.' });
  }
};



// exports.generateProposalForJob = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { jobId } = req.params;
//     const { selectedCategory, isProduct } = req.body; // <-- get from frontend

//     // Find the latest batch with the job
//     const userJobBatch = await UserJobBatch.findOne({ userId });
//     if (!userJobBatch || !userJobBatch.batches.length) {
//       return res.status(404).json({ message: 'No job batches found for user.' });
//     }
//     let jobToUpdate = null;
//     for (let i = userJobBatch.batches.length - 1; i >= 0; i--) {
//       const batch = userJobBatch.batches[i];
//       const job = batch.jobs.find(j => j.id === jobId);
//       if (job) {
//         jobToUpdate = job;
//         break;
//       }
//     }
//     if (!jobToUpdate) {
//       return res.status(404).json({ message: 'Job not found for user.' });
//     }

//     // Call Python script to generate proposal
//     const jobData = JSON.stringify(jobToUpdate);
//     const options = {
//       mode: 'json',
//       pythonOptions: ['-u'],
//       scriptPath: './python',
//       args: [
//         '--type', 'linkedin',
//         '--job', jobData,
//         '--category', selectedCategory,
//         ...(isProduct ? ['--is_product'] : [])
//       ]
//     };

//     PythonShell.run('proposal_generator.py', options, async (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ message: 'Proposal generation failed.' });
//       }
//       const proposal = results && results[0] && results[0].proposal;
//       if (!proposal) {
//         return res.status(500).json({ message: 'No proposal generated.' });
//       }
//       jobToUpdate.proposal = proposal;
//       await userJobBatch.save();
//       res.json({ proposal, job: jobToUpdate });
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error.' });
//   }
// };

// exports.generateProposalForJob = async (req, res) => {
//   try {
//     console.log('--- Proposal Generation Started ---');
//     const userId = req.user._id;
//     const { jobId } = req.params;
//     const { selectedCategory, isProduct } = req.body;
//     console.log('User:', userId, 'Job ID:', jobId, 'Category:', selectedCategory, 'isProduct:', isProduct);

//     // Find the latest batch with the job
//     console.log('Finding user job batch...');
//     const userJobBatch = await UserJobBatch.findOne({ userId });
//     if (!userJobBatch || !userJobBatch.batches.length) {
//       console.log('No job batches found for user.');
//       return res.status(404).json({ message: 'No job batches found for user.' });
//     }
//     let jobToUpdate = null;
//     for (let i = userJobBatch.batches.length - 1; i >= 0; i--) {
//       const batch = userJobBatch.batches[i];
//       const job = batch.jobs.find(j => j.id === jobId);
//       if (job) {
//         jobToUpdate = job;
//         break;
//       }
//     }
//     if (!jobToUpdate) {
//       console.log('Job not found for user.');
//       return res.status(404).json({ message: 'Job not found for user.' });
//     }
//     console.log('Job found:', jobToUpdate.title);

//     // Call Python script to generate proposal
//     const jobData = JSON.stringify(jobToUpdate);
//     const options = {
//       mode: 'json',
//       pythonOptions: ['-u'],
//       scriptPath: './python',
//       args: [
//         '--type', 'linkedin',
//         '--job', jobData,
//         '--category', selectedCategory,
//         ...(isProduct ? ['--is_product'] : [])
//       ]
//     };

//     console.log('Calling Python script...');
//     PythonShell.run('proposal_generator.py', options, async (err, results) => {
//       if (err) {
//         console.error('Python error:', err);
//         return res.status(500).json({ message: 'Proposal generation failed.' });
//       }
//       console.log('Python script finished. Results:', results);
//       const proposal = results && results[0] && results[0].proposal;
//       if (!proposal) {
//         console.log('No proposal generated.');
//         return res.status(500).json({ message: 'No proposal generated.' });
//       }
//       jobToUpdate.proposal = proposal;
//       await userJobBatch.save();
//       console.log('Proposal saved to DB.');
//       res.json({ proposal, job: jobToUpdate });
//     });
//   } catch (err) {
//     console.error('Server error:', err);
//     res.status(500).json({ message: 'Server error.' });
//   }
// };


exports.generateProposalForJob = async (req, res) => {
  try {
    console.log('--- Proposal Generation Started ---');
    const userId = req.user._id;
    const { jobId } = req.params;
    const { selectedCategory, isProduct } = req.body;
    console.log('User:', userId, 'Job ID:', jobId, 'Category:', selectedCategory, 'isProduct:', isProduct);

    // Find the latest batch with the job
    console.log('Finding user job batch...');
    const userJobBatch = await UserJobBatch.findOne({ userId });
    if (!userJobBatch || !userJobBatch.batches.length) {
      console.log('No job batches found for user.');
      return res.status(404).json({ message: 'No job batches found for user.' });
    }
    let jobToUpdate = null;
    for (let i = userJobBatch.batches.length - 1; i >= 0; i--) {
      const batch = userJobBatch.batches[i];
      const job = batch.jobs.find(j => j.id === jobId);
      if (job) {
        jobToUpdate = job;
        break;
      }
    }
    if (!jobToUpdate) {
      console.log('Job not found for user.');
      return res.status(404).json({ message: 'Job not found for user.' });
    }
    console.log('Job found:', jobToUpdate.title);

    // Prepare arguments for Python script
    const jobData = JSON.stringify(jobToUpdate);
    const scriptPath = path.join(__dirname, '../python/proposal_generator.py');
    const args = [
      scriptPath,
      '--type', 'linkedin',
      '--job', jobData,
      '--category', selectedCategory,
    ];
    if (isProduct) args.push('--is_product');

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
          const result = JSON.parse(stdout);
          const proposal = result.proposal;
          jobToUpdate.proposal = proposal;
          await userJobBatch.save();
          console.log('Proposal saved to DB.');
          res.json({ proposal, job: jobToUpdate });
        } catch (err) {
          console.error('Error parsing Python output:', err);
          res.status(500).json({ message: 'Error parsing proposal output.' });
        }
      } else {
        console.error('Python script exited with code', code, stderr);
        res.status(500).json({ message: 'Proposal generation failed.', error: stderr });
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateProposalText = async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;
    const { proposal } = req.body;
    if (typeof proposal !== 'string') {
      return res.status(400).json({ message: 'Proposal text is required.' });
    }
    const userJobBatch = await UserLinkedinJobBatch.findOne({ userId });
    if (!userJobBatch || !userJobBatch.batches.length) {
      return res.status(404).json({ message: 'No job batches found for user.' });
    }
    let jobToUpdate = null;
    for (let i = userJobBatch.batches.length - 1; i >= 0; i--) {
      const batch = userJobBatch.batches[i];
      const job = batch.jobs.find(j => j.id === jobId);
      if (job) {
        jobToUpdate = job;
        break;
      }
    }
    if (!jobToUpdate) {
      return res.status(404).json({ message: 'Job not found for user.' });
    }
    jobToUpdate.proposal = proposal;
    await userJobBatch.save();
    res.json({ proposal, job: jobToUpdate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};