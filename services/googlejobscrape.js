// const express = require('express');
// const axios = require('axios');
// const fs = require('fs').promises;
// const path = require('path');
// const crypto = require('crypto');

// const app = express();
// app.use(express.json());

// // Enhanced Configuration
// const CONFIG = {
//     API_KEY: process.env.SCRAPING_DOG_API_KEY,
//     BASE_URL: 'https://api.scrapingdog.com/google_jobs',
//     OUTPUT_FILE: path.join(__dirname, 'scraped_jobs.json'),
//     COUNTRY: 'us',
//     CHIPS: '',
//     LRAD: '',
//     UDS: '',
//     LTYPE: '',
//     MIN_TOKEN_LENGTH: 10,
//     REQUEST_TIMEOUT: 90000, // 90 seconds
//     RETRY_DELAY: 5000, // 5 seconds
//     MAX_RETRIES: 3,
//     RATE_LIMIT_DELAY: 3000, // 3 seconds between requests
//     MAX_PAGES_PER_QUERY: 5, // Limit pagination to avoid infinite loops
//     RANDOM_DELAY_MIN: 1000, // 1 second
//     RANDOM_DELAY_MAX: 2000 // 2 seconds
// };

// // Job search queries
// const JOB_QUERIES = [
//     'sqa remote since yesterday',
//     'mern remote since yesterday', 
//     'react remote since yesterday', 
//     'ai ml remote since yesterday',
//     'ai/ml remote since yesterday',
//     'native remote since yesterday',
//     'automation engineer remote since yesterday',
//     'Automation Testing remote since yesterday',
//     'Software Testing remote since yesterday',
//     'manual testing remote since yesterday'
// ];

// // Utility functions
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// const randomDelay = () => {
//     const min = CONFIG.RANDOM_DELAY_MIN;
//     const max = CONFIG.RANDOM_DELAY_MAX;
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// };

// const isValidNextToken = (token) => {
//     if (!token || typeof token !== 'string') return false;
//     return token.length > CONFIG.MIN_TOKEN_LENGTH && token !== 'e30=';
// };

// const isValidJob = (job) => {
//     if (typeof job === 'string') return false;
//     if (!job || typeof job !== 'object') return false;
//     return job.title || job.company_name;
// };

// // Deduplication hash functions
// const generateJobHash = (job) => {
//     const identifier = [
//         job.title?.toLowerCase().trim(),
//         job.company_name?.toLowerCase().trim(),
//         job.location?.toLowerCase().trim(),
//         job.description?.substring(0, 100)?.toLowerCase().trim()
//     ].filter(Boolean).join('|');
    
//     return crypto.createHash('md5').update(identifier).digest('hex');
// };

// const generateJobHashAlternative = (job) => {
//     const identifier = [
//         job.title?.toLowerCase().replace(/[^\w\s]/g, '').trim(),
//         job.company_name?.toLowerCase().trim()
//     ].filter(Boolean).join('|');
    
//     return crypto.createHash('md5').update(identifier).digest('hex');
// };

// const areJobsSimilar = (job1, job2) => {
//     const similarity = {
//         title: job1.title?.toLowerCase() === job2.title?.toLowerCase(),
//         company: job1.company_name?.toLowerCase() === job2.company_name?.toLowerCase(),
//     };
    
//     return similarity.title && similarity.company;
// };

// // Enhanced job information extraction
// const extractJobInfo = (job) => {
//     if (!isValidJob(job)) return null;
    
//     const extensions = job.extensions || [];
//     const detectedExtensions = job.detected_extensions || {};
    
//     const extractedInfo = {
//         // Basic job info
//         title: job.title || 'N/A',
//         company: job.company_name || 'N/A',
//         location: job.location || 'Remote',
//         via: job.via || 'N/A',
        
//         // Parsed extension info
//         posted_time: null,
//         hourly_rate: null,
//         salary_range: null,
//         job_type: null,
//         work_arrangement: null,
//         benefits: [],
        
//         // Additional extracted info
//         country: null,
//         experience_level: null,
//         contract_type: null,
        
//         // Original data
//         job_id: job.job_id,
//         share_link: job.share_link,
//         apply_options: job.apply_options || [],
//         description_preview: job.description ? job.description.substring(0, 200) + '...' : 'N/A',
        
//         // Deduplication hashes
//         primary_hash: generateJobHash(job),
//         secondary_hash: generateJobHashAlternative(job)
//     };
    
//     // Parse extensions for useful information
//     extensions.forEach(ext => {
//         const extLower = ext.toLowerCase();
        
//         // Time-based info (posted time)
//         if ((extLower.includes('hour') || extLower.includes('day') || extLower.includes('minute')) && extLower.includes('ago')) {
//             extractedInfo.posted_time = ext;
//         }
//         // Salary/hourly rate info
//         else if (extLower.includes('hour') && (extLower.includes('$') || /\d/.test(ext))) {
//             extractedInfo.hourly_rate = ext;
//         }
//         else if (extLower.includes('salary') || extLower.includes('year') || (extLower.includes('k') && /\d/.test(ext))) {
//             extractedInfo.salary_range = ext;
//         }
//         else if (/^\$?\d+[k-]?\$?\d*/.test(extLower) && !extLower.includes('hour')) {
//             extractedInfo.salary_range = ext;
//         }
//         // Work arrangement
//         else if (extLower.includes('remote') || extLower.includes('work from home')) {
//             extractedInfo.work_arrangement = 'Remote';
//         }
//         else if (extLower.includes('on-site') || extLower.includes('office')) {
//             extractedInfo.work_arrangement = 'On-site';
//         }
//         else if (extLower.includes('hybrid')) {
//             extractedInfo.work_arrangement = 'Hybrid';
//         }
//         // Job type
//         else if (extLower.includes('full-time')) {
//             extractedInfo.job_type = 'Full-time';
//         }
//         else if (extLower.includes('part-time')) {
//             extractedInfo.job_type = 'Part-time';
//         }
//         else if (extLower.includes('contract')) {
//             extractedInfo.contract_type = 'Contract';
//         }
//         else if (extLower.includes('freelance')) {
//             extractedInfo.contract_type = 'Freelance';
//         }
//         else if (extLower.includes('internship')) {
//             extractedInfo.contract_type = 'Internship';
//         }
//         // Experience level
//         else if (extLower.includes('senior')) {
//             extractedInfo.experience_level = 'Senior';
//         }
//         else if (extLower.includes('junior')) {
//             extractedInfo.experience_level = 'Junior';
//         }
//         else if (extLower.includes('lead') || extLower.includes('principal')) {
//             extractedInfo.experience_level = 'Lead/Principal';
//         }
//         else if (extLower.includes('entry') || extLower.includes('graduate')) {
//             extractedInfo.experience_level = 'Entry Level';
//         }
//     });
    
//     // Extract benefits from detected_extensions
//     if (detectedExtensions.health_insurance) extractedInfo.benefits.push('Health Insurance');
//     if (detectedExtensions.paid_time_off) extractedInfo.benefits.push('Paid Time Off');
//     if (detectedExtensions.dental_coverage) extractedInfo.benefits.push('Dental Coverage');
//     if (detectedExtensions.retirement_plan) extractedInfo.benefits.push('Retirement Plan');
//     if (detectedExtensions.vision_coverage) extractedInfo.benefits.push('Vision Coverage');
//     if (detectedExtensions.flexible_hours) extractedInfo.benefits.push('Flexible Hours');
    
//     // Extract country from location
//     if (extractedInfo.location) {
//         const location = extractedInfo.location.toLowerCase();
//         if (location.includes('usa') || location.includes('united states') || location.includes('us') || /\b[A-Z]{2}\b/.test(job.location)) {
//             extractedInfo.country = 'United States';
//         } else if (location.includes('canada') || location.includes('ca')) {
//             extractedInfo.country = 'Canada';
//         } else if (location.includes('uk') || location.includes('united kingdom') || location.includes('britain')) {
//             extractedInfo.country = 'United Kingdom';
//         } else if (location.includes('australia') || location.includes('au')) {
//             extractedInfo.country = 'Australia';
//         } else if (location.includes('germany') || location.includes('deutschland')) {
//             extractedInfo.country = 'Germany';
//         } else if (location.includes('india') || location.includes('in')) {
//             extractedInfo.country = 'India';
//         }
//     }
    
//     return extractedInfo;
// };

// // Enhanced API fetch function with comprehensive error handling
// const fetchJobsFromAPI = async (query, nextPageToken = '', retryCount = 0) => {
//     try {
//         // Add random delay to avoid rate limiting patterns
//         const randomDelayMs = randomDelay();
//         await delay(randomDelayMs);
        
//         const params = new URLSearchParams({
//             api_key: CONFIG.API_KEY,
//             query: query,
//             country: CONFIG.COUNTRY,
//             chips: CONFIG.CHIPS,
//             lrad: CONFIG.LRAD,
//             uds: CONFIG.UDS,
//             ltype: CONFIG.LTYPE,
//             next_page_token: nextPageToken
//         });

//         const fullURL = `${CONFIG.BASE_URL}?${params.toString()}`;
        
//         console.log('\n' + '='.repeat(80));
//         console.log(`🔍 API CALL: "${query}"${nextPageToken ? ' (pagination)' : ' (page 1)'}`);
//         console.log(`🌐 URL: ${fullURL}`);
//         console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
//         console.log(`🎲 Random delay: ${randomDelayMs}ms`);
//         console.log('='.repeat(80));

//         const response = await axios.get(CONFIG.BASE_URL, {
//             params: Object.fromEntries(params),
//             timeout: CONFIG.REQUEST_TIMEOUT,
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//                 'Accept': 'application/json, text/plain, */*',
//                 'Accept-Encoding': 'gzip, deflate, br',
//                 'Accept-Language': 'en-US,en;q=0.9',
//                 'Cache-Control': 'no-cache',
//                 'Pragma': 'no-cache',
//                 'Sec-Fetch-Dest': 'empty',
//                 'Sec-Fetch-Mode': 'cors',
//                 'Sec-Fetch-Site': 'cross-site'
//             },
//             validateStatus: function (status) {
//                 return status >= 200 && status < 600; // Accept all status codes for proper error handling
//             }
//         });

//         console.log(`📊 Response Status: ${response.status}`);
//         console.log(`📊 Response Type: ${typeof response.data}`);
//         console.log(`📊 Response Size: ${JSON.stringify(response.data).length} bytes`);

//         // Handle different HTTP status codes
//         if (response.status === 400) {
//             console.log(`⚠️  400 Bad Request - Invalid query parameters`);
//             throw new Error(`Bad Request (400): Invalid parameters for "${query}"`);
//         }
        
//         if (response.status === 401) {
//             console.log(`⚠️  401 Unauthorized - Check API key`);
//             throw new Error(`Unauthorized (401): Invalid API key`);
//         }
        
//         if (response.status === 429) {
//             console.log(`⚠️  429 Rate Limited - Too many requests`);
//             throw new Error(`Rate Limited (429): API rate limit exceeded`);
//         }
        
//         if (response.status >= 500) {
//             console.log(`⚠️  ${response.status} Server Error - API server issue`);
//             throw new Error(`Server Error (${response.status}): API server problem`);
//         }

//         if (response.status === 200 && response.data) {
//             // Handle string responses (usually error messages)
//             if (typeof response.data === 'string') {
//                 console.log(`⚠️  String response (${response.data.length} chars): "${response.data.substring(0, 100)}..."`);
//                 return {
//                     success: true,
//                     data: { jobs_results: [] },
//                     query: query,
//                     nextToken: null,
//                     message: response.data
//                 };
//             }

//             // Handle valid JSON object responses
//             if (typeof response.data === 'object' && response.data !== null) {
//                 let jobsResults = response.data.jobs_results || [];
                
//                 // Filter out invalid jobs and string error messages
//                 const validJobs = jobsResults.filter(job => {
//                     if (typeof job === 'string') {
//                         console.log(`⚠️  Filtering string result: "${job.substring(0, 50)}..."`);
//                         return false;
//                     }
//                     return isValidJob(job);
//                 });
                
//                 const nextToken = response.data.scrapingdog_pagination?.next_page_token || null;
                
//                 console.log(`📋 Raw results: ${jobsResults.length}, Valid jobs: ${validJobs.length}`);
//                 console.log(`📄 Next page token: ${nextToken ? nextToken.substring(0, 20) + '...' : 'None'}`);
//                 console.log(`📄 Token valid: ${isValidNextToken(nextToken) ? 'Yes' : 'No'}`);
                
//                 return {
//                     success: true,
//                     data: { 
//                         jobs_results: validJobs,
//                         scrapingdog_pagination: response.data.scrapingdog_pagination 
//                     },
//                     query: query,
//                     nextToken: nextToken
//                 };
//             }
//         }

//         throw new Error(`Unexpected response: Status ${response.status}, Type: ${typeof response.data}`);

//     } catch (error) {
//         console.log(`❌ ERROR for "${query}": ${error.message}`);
//         console.log(`❌ Error Code: ${error.code || 'Unknown'}`);
//         console.log(`❌ Response Status: ${error.response?.status || 'None'}`);
//         console.log(`❌ Response Data: ${error.response?.data ? JSON.stringify(error.response.data).substring(0, 100) : 'None'}`);
        
//         // Enhanced retry logic with exponential backoff
//         if (retryCount < CONFIG.MAX_RETRIES) {
//             let retryDelay = CONFIG.RETRY_DELAY;
            
//             // Exponential backoff for rate limiting
//             if (error.response?.status === 429) {
//                 retryDelay = CONFIG.RETRY_DELAY * Math.pow(2, retryCount); // 5s, 10s, 20s
//                 console.log(`🔄 Rate limited, using exponential backoff: ${retryDelay}ms`);
//             }
//             // Longer delay for server errors
//             else if (error.response?.status >= 500) {
//                 retryDelay = CONFIG.RETRY_DELAY * 2;
//                 console.log(`🔄 Server error, using extended delay: ${retryDelay}ms`);
//             }
//             // Network errors
//             else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
//                 retryDelay = CONFIG.RETRY_DELAY * 1.5;
//                 console.log(`🔄 Network timeout, using moderate delay: ${retryDelay}ms`);
//             }
            
//             console.log(`🔄 Retrying "${query}" in ${retryDelay}ms (attempt ${retryCount + 1}/${CONFIG.MAX_RETRIES})`);
//             await delay(retryDelay);
//             return fetchJobsFromAPI(query, nextPageToken, retryCount + 1);
//         }

//         return {
//             success: false,
//             error: error.message,
//             query: query,
//             nextToken: null,
//             statusCode: error.response?.status,
//             errorCode: error.code
//         };
//     }
// };

// // Enhanced pagination handler with page limits and better logging
// const fetchAllPagesForQuery = async (query, nextPageToken = '', accumulatedJobs = [], pageCount = 0) => {
//     // Prevent infinite pagination loops
//     if (pageCount >= CONFIG.MAX_PAGES_PER_QUERY) {
//         console.log(`⚠️  Reached maximum pages limit (${CONFIG.MAX_PAGES_PER_QUERY}) for "${query}"`);
//         console.log(`📊 Final result: ${accumulatedJobs.length} jobs from ${pageCount} pages`);
//         return accumulatedJobs;
//     }
    
//     console.log(`\n🔄 Fetching: "${query}" - Page ${pageCount + 1}${pageCount === 0 ? ' (initial)' : ''}`);
    
//     const result = await fetchJobsFromAPI(query, nextPageToken);
    
//     if (!result.success) {
//         console.log(`❌ Failed: "${query}" - ${result.error}`);
//         console.log(`📊 Status: ${result.statusCode || 'Unknown'}, Code: ${result.errorCode || 'Unknown'}`);
//         return accumulatedJobs;
//     }

//     const currentJobs = result.data.jobs_results || [];
//     const allJobs = [...accumulatedJobs, ...currentJobs];
    
//     console.log(`📋 Page ${pageCount + 1} results: ${currentJobs.length} jobs`);
//     console.log(`📊 Cumulative total: ${allJobs.length} jobs`);

//     // Check for pagination - only continue if we have valid token and got results
//     if (isValidNextToken(result.nextToken) && currentJobs.length > 0) {
//         console.log(`📄 Next page available for "${query}" (token: ${result.nextToken.substring(0, 15)}...)`);
//         console.log(`⏳ Waiting ${CONFIG.RATE_LIMIT_DELAY}ms before next page request...`);
//         await delay(CONFIG.RATE_LIMIT_DELAY);
//         return await fetchAllPagesForQuery(query, result.nextToken, allJobs, pageCount + 1);
//     } else {
//         if (!result.nextToken) {
//             console.log(`🏁 No next page token for "${query}" - pagination complete`);
//         } else if (!isValidNextToken(result.nextToken)) {
//             console.log(`🏁 Invalid next page token for "${query}": "${result.nextToken}"`);
//         } else if (currentJobs.length === 0) {
//             console.log(`🏁 Empty results page for "${query}" - stopping pagination`);
//         }
//         console.log(`✅ Final result for "${query}": ${allJobs.length} total jobs from ${pageCount + 1} pages`);
//     }
    
//     return allJobs;
// };

// // Main processing function with comprehensive deduplication and statistics
// const processAllJobQueries = async () => {
//     const startTime = Date.now();
    
//     try {
//         console.log('\n' + '🚀 STARTING ENHANCED JOB SCRAPING WITH DEDUPLICATION 🚀'.center(100, '='));
//         console.log(`📊 Processing ${JOB_QUERIES.length} different queries`);
//         console.log(`⚙️  Configuration: ${CONFIG.REQUEST_TIMEOUT/1000}s timeout, ${CONFIG.MAX_RETRIES} retries, ${CONFIG.MAX_PAGES_PER_QUERY} max pages`);
//         console.log(`🔑 API Key: ${CONFIG.API_KEY.substring(0, 10)}...`);
        
//         const allResults = [];
        
//         // Process each query sequentially to avoid overwhelming the API
//         for (let i = 0; i < JOB_QUERIES.length; i++) {
//             const query = JOB_QUERIES[i];
//             console.log(`\n${'='.repeat(80)}`);
//             console.log(`📝 PROCESSING QUERY ${i + 1}/${JOB_QUERIES.length}: "${query}"`);
//             console.log(`${'='.repeat(80)}`);
            
//             const queryStartTime = Date.now();
//             const jobs = await fetchAllPagesForQuery(query);
//             const queryDuration = Date.now() - queryStartTime;
            
//             allResults.push({ 
//                 query, 
//                 jobs, 
//                 count: jobs.length,
//                 duration: queryDuration
//             });
            
//             console.log(`✅ Query "${query}" completed: ${jobs.length} jobs in ${queryDuration}ms`);
            
//             // Rate limiting between different queries
//             if (i < JOB_QUERIES.length - 1) {
//                 console.log(`⏳ Waiting ${CONFIG.RATE_LIMIT_DELAY}ms before next query...`);
//                 await delay(CONFIG.RATE_LIMIT_DELAY);
//             }
//         }
        
//         // COMPREHENSIVE DEDUPLICATION PROCESS
//         console.log(`\n${'='.repeat(80)}`);
//         console.log('🔄 STARTING COMPREHENSIVE DEDUPLICATION PROCESS');
//         console.log(`${'='.repeat(80)}`);
        
//         const seenPrimaryHashes = new Set();
//         const seenSecondaryHashes = new Set();
//         const uniqueJobs = [];
//         const duplicateJobs = [];
//         const duplicateStats = {
//             total_raw_jobs: 0,
//             primary_duplicates: 0,
//             secondary_duplicates: 0,
//             manual_duplicates: 0,
//             unique_jobs: 0,
//             duplicate_examples: []
//         };
        
//         // Process all jobs for deduplication
//         allResults.forEach((result) => {
//             duplicateStats.total_raw_jobs += result.jobs.length;
//             console.log(`\n🔍 Processing "${result.query}": ${result.jobs.length} jobs`);
            
//             result.jobs.forEach(job => {
//                 const primaryHash = generateJobHash(job);
//                 const secondaryHash = generateJobHashAlternative(job);
                
//                 let isDuplicate = false;
//                 let duplicateType = '';
                
//                 // Check primary hash (strict matching)
//                 if (seenPrimaryHashes.has(primaryHash)) {
//                     duplicateStats.primary_duplicates++;
//                     isDuplicate = true;
//                     duplicateType = 'primary';
//                 }
//                 // Check secondary hash (flexible matching)
//                 else if (seenSecondaryHashes.has(secondaryHash)) {
//                     duplicateStats.secondary_duplicates++;
//                     isDuplicate = true;
//                     duplicateType = 'secondary';
//                 }
//                 // Manual similarity check (additional safety)
//                 else {
//                     for (const existingJob of uniqueJobs) {
//                         if (areJobsSimilar(job, existingJob)) {
//                             duplicateStats.manual_duplicates++;
//                             isDuplicate = true;
//                             duplicateType = 'manual';
//                             break;
//                         }
//                     }
//                 }
                
//                 if (isDuplicate) {
//                     console.log(`🔄 ${duplicateType.toUpperCase()} duplicate: "${job.title}" at "${job.company_name}"`);
                    
//                     // Store example duplicates for analysis
//                     if (duplicateStats.duplicate_examples.length < 10) {
//                         duplicateStats.duplicate_examples.push({
//                             type: duplicateType,
//                             title: job.title,
//                             company: job.company_name,
//                             query: result.query
//                         });
//                     }
                    
//                     duplicateJobs.push({
//                         ...job,
//                         duplicate_type: duplicateType,
//                         source_query: result.query
//                     });
//                 } else {
//                     // Add to unique jobs
//                     seenPrimaryHashes.add(primaryHash);
//                     seenSecondaryHashes.add(secondaryHash);
                    
//                     uniqueJobs.push({
//                         ...job,
//                         source_query: result.query,
//                         scraped_at: new Date().toISOString(),
//                         primary_hash: primaryHash,
//                         secondary_hash: secondaryHash
//                     });
//                 }
//             });
//         });
        
//         duplicateStats.unique_jobs = uniqueJobs.length;
        
//         // Extract enhanced information from unique jobs
//         console.log(`\n${'='.repeat(80)}`);
//         console.log('📊 EXTRACTING ENHANCED INFORMATION FROM UNIQUE JOBS');
//         console.log(`${'='.repeat(80)}`);
        
//         const extractedJobs = [];
//         const extractionStats = {
//             successful_extractions: 0,
//             failed_extractions: 0,
//             jobs_with_salary: 0,
//             jobs_with_benefits: 0,
//             remote_jobs: 0,
//             onsite_jobs: 0,
//             hybrid_jobs: 0
//         };
        
//         uniqueJobs.forEach(job => {
//             const extractedInfo = extractJobInfo(job);
//             if (extractedInfo) {
//                 extractionStats.successful_extractions++;
                
//                 // Count specific attributes
//                 if (extractedInfo.salary_range || extractedInfo.hourly_rate) {
//                     extractionStats.jobs_with_salary++;
//                 }
//                 if (extractedInfo.benefits && extractedInfo.benefits.length > 0) {
//                     extractionStats.jobs_with_benefits++;
//                 }
                
//                 // Count work arrangements
//                 if (extractedInfo.work_arrangement === 'Remote') {
//                     extractionStats.remote_jobs++;
//                 } else if (extractedInfo.work_arrangement === 'On-site') {
//                     extractionStats.onsite_jobs++;
//                 } else if (extractedInfo.work_arrangement === 'Hybrid') {
//                     extractionStats.hybrid_jobs++;
//                 }
                
//                 extractedJobs.push({
//                     ...extractedInfo,
//                     source_query: job.source_query,
//                     scraped_at: job.scraped_at
//                 });
//             } else {
//                 extractionStats.failed_extractions++;
//             }
//         });

//         // Compile final comprehensive results
//         const processingTime = Date.now() - startTime;
        
//         const finalResult = {
//             scraping_metadata: {
//                 total_unique_jobs: uniqueJobs.length,
//                 total_extracted_jobs: extractedJobs.length,
//                 total_duplicates_removed: duplicateStats.primary_duplicates + duplicateStats.secondary_duplicates + duplicateStats.manual_duplicates,
//                 queries_processed: JOB_QUERIES.length,
//                 scraped_at: new Date().toISOString(),
//                 processing_time_ms: processingTime,
//                 processing_time_formatted: `${Math.floor(processingTime / 60000)}m ${Math.floor((processingTime % 60000) / 1000)}s`,
//                 deduplication_stats: duplicateStats,
//                 extraction_stats: extractionStats,
//                 queries_breakdown: allResults.map(r => ({
//                     query: r.query,
//                     raw_jobs_found: r.count,
//                     processing_time_ms: r.duration
//                 })),
//                 configuration: {
//                     max_pages_per_query: CONFIG.MAX_PAGES_PER_QUERY,
//                     rate_limit_delay: CONFIG.RATE_LIMIT_DELAY,
//                     request_timeout: CONFIG.REQUEST_TIMEOUT,
//                     max_retries: CONFIG.MAX_RETRIES
//                 },
//                 queries: JOB_QUERIES
//             },
//             unique_raw_jobs: uniqueJobs,
//             extracted_unique_jobs: extractedJobs,
//             duplicate_jobs: duplicateJobs
//         };

//         // Save comprehensive results to file
//         await fs.writeFile(
//             CONFIG.OUTPUT_FILE, 
//             JSON.stringify(finalResult, null, 2),
//             'utf8'
//         );

//         // Print comprehensive summary
//         console.log(`\n${'🎉 SCRAPING COMPLETED SUCCESSFULLY! 🎉'.center(100, '=')}`);
//         console.log(`\n📊 COMPREHENSIVE RESULTS SUMMARY:`);
//         console.log(`   📋 Total raw jobs scraped: ${duplicateStats.total_raw_jobs}`);
//         console.log(`   🔄 Duplicates removed: ${duplicateStats.primary_duplicates + duplicateStats.secondary_duplicates + duplicateStats.manual_duplicates}`);
//         console.log(`   ✅ Unique jobs retained: ${uniqueJobs.length}`);
//         console.log(`   📊 Successfully extracted: ${extractedJobs.length}`);
//         console.log(`   💰 Jobs with salary info: ${extractionStats.jobs_with_salary}`);
//         console.log(`   🎁 Jobs with benefits: ${extractionStats.jobs_with_benefits}`);
//         console.log(`   🏠 Remote jobs: ${extractionStats.remote_jobs}`);
//         console.log(`   🏢 On-site jobs: ${extractionStats.onsite_jobs}`);
//         console.log(`   🔄 Hybrid jobs: ${extractionStats.hybrid_jobs}`);
//         console.log(`   ⏱️  Total processing time: ${Math.floor(processingTime / 60000)}m ${Math.floor((processingTime % 60000) / 1000)}s`);
//         console.log(`   💾 Results saved to: ${CONFIG.OUTPUT_FILE}`);
        
//         return finalResult;

//     } catch (error) {
//         console.error('\n💥 CRITICAL ERROR IN PROCESSING:', error);
//         console.error('Stack trace:', error.stack);
//         throw error;
//     }
// };

// // API Endpoints

// // Main scraping endpoint with full data
// app.get('/scrape-jobs', async (req, res) => {
//     try {
//         console.log('\n🌐 Received request for full job scraping');
//         const result = await processAllJobQueries();
        
//         res.json({
//             success: true,
//             message: 'Enhanced job scraping with deduplication completed successfully',
//             timestamp: new Date().toISOString(),
//             data: result
//         });
//     } catch (error) {
//         console.error('🔥 Full scraping endpoint error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error occurred during comprehensive job scraping',
//             error: error.message,
//             timestamp: new Date().toISOString()
//         });
//     }
// });

// // Clean endpoint - only unique extracted jobs
// app.get('/scrape-jobs-clean', async (req, res) => {
//     try {
//         console.log('\n🌐 Received request for clean job scraping');
//         const result = await processAllJobQueries();
        
//         res.json({
//             success: true,
//             message: 'Clean unique job scraping completed successfully',
//             timestamp: new Date().toISOString(),
//             metadata: result.scraping_metadata,
//             jobs: result.extracted_unique_jobs
//         });
//     } catch (error) {
//         console.error('🔥 Clean scraping endpoint error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error occurred during clean job scraping',
//             error: error.message,
//             timestamp: new Date().toISOString()
//         });
//     }
// });

// // Statistics endpoint
// app.get('/scrape-stats', async (req, res) => {
//     try {
//         console.log('\n🌐 Received request for scraping statistics');
//         const result = await processAllJobQueries();
        
//         res.json({
//             success: true,
//             message: 'Job scraping statistics generated successfully',
//             timestamp: new Date().toISOString(),
//             statistics: {
//                 scraping_metadata: result.scraping_metadata,
//                 query_performance: result.scraping_metadata.queries_breakdown,
//                 deduplication_summary: result.scraping_metadata.deduplication_stats,
//                 extraction_summary: result.scraping_metadata.extraction_stats
//             }
//         });
//     } catch (error) {
//         console.error('🔥 Statistics endpoint error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error occurred during statistics generation',
//             error: error.message,
//             timestamp: new Date().toISOString()
//         });
//     }
// });

// // Test single query endpoint for debugging
// app.get('/test-query/:query', async (req, res) => {
//     try {
//         const query = decodeURIComponent(req.params.query);
//         console.log(`\n🧪 Testing single query: "${query}"`);
        
//         const jobs = await fetchAllPagesForQuery(query);
        
//         res.json({
//             success: true,
//             message: `Test query completed for: "${query}"`,
//             timestamp: new Date().toISOString(),
//             query: query,
//             jobs_found: jobs.length,
//             jobs: jobs
//         });
//     } catch (error) {
//         console.error(`🔥 Test query error for "${req.params.query}":`, error);
//         res.status(500).json({
//             success: false,
//             message: 'Error occurred during test query',
//             query: req.params.query,
//             error: error.message,
//             timestamp: new Date().toISOString()
//         });
//     }
// });

// // Health check endpoint
// app.get('/health', (req, res) => {
//     res.json({ 
//         status: 'OK', 
//         message: 'Enhanced Job Scraper with comprehensive deduplication and extraction',
//         version: '2.0.0',
//         features: [
//             'Multi-level deduplication',
//             'Comprehensive information extraction', 
//             'Enhanced error handling',
//             'Pagination support',
//             'Rate limiting protection',
//             'Detailed logging and statistics'
//         ],
//         configuration: {
//             total_queries: JOB_QUERIES.length,
//             max_pages_per_query: CONFIG.MAX_PAGES_PER_QUERY,
//             request_timeout: `${CONFIG.REQUEST_TIMEOUT/1000}s`,
//             max_retries: CONFIG.MAX_RETRIES,
//             rate_limit_delay: `${CONFIG.RATE_LIMIT_DELAY}ms`
//         },
//         timestamp: new Date().toISOString()
//     });
// });

// // Utility function for centered text
// String.prototype.center = function(width, padding = ' ') {
//     const totalPadding = width - this.length;
//     const leftPadding = Math.floor(totalPadding / 2);
//     const rightPadding = totalPadding - leftPadding;
//     return padding.repeat(leftPadding) + this + padding.repeat(rightPadding);
// };

// // Start the enhanced server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log('\n' + '🚀 ENHANCED JOB SCRAPER SERVER STARTED 🚀'.center(100, '='));
//     console.log(`📊 Server running on port: ${PORT}`);
//     console.log(`📊 Total job queries configured: ${JOB_QUERIES.length}`);
//     console.log(`📊 Maximum pages per query: ${CONFIG.MAX_PAGES_PER_QUERY}`);
//     console.log(`📊 Request timeout: ${CONFIG.REQUEST_TIMEOUT/1000} seconds`);
//     console.log(`📊 Rate limiting delay: ${CONFIG.RATE_LIMIT_DELAY}ms`);
    
//     console.log(`\n📡 Available Endpoints:`);
//     console.log(`   🔥 GET /scrape-jobs           - Full comprehensive scraping`);
//     console.log(`   ✨ GET /scrape-jobs-clean     - Clean unique jobs only`);
//     console.log(`   📊 GET /scrape-stats          - Detailed statistics`);
//     console.log(`   🧪 GET /test-query/:query     - Test single query`);
//     console.log(`   ❤️  GET /health               - Health check`);
    
//     console.log(`\n🔧 Enhanced Features:`);
//     console.log(`   ✅ Multi-level duplicate detection (3 algorithms)`);
//     console.log(`   ✅ Comprehensive information extraction`);
//     console.log(`   ✅ Enhanced error handling with exponential backoff`);
//     console.log(`   ✅ Intelligent pagination with safety limits`);
//     console.log(`   ✅ Rate limiting and random delays`);
//     console.log(`   ✅ Detailed logging and performance metrics`);
//     console.log(`   ✅ Multiple response formats (full/clean/stats)`);
    
//     console.log(`\n🎯 Query List:`);
//     JOB_QUERIES.forEach((query, index) => {
//         console.log(`   ${index + 1}. "${query}"`);
//     });
    
//     console.log('\n' + '='.repeat(100));
//     console.log('🌟 Server ready to process job scraping requests! 🌟'.center(100));
//     console.log('='.repeat(100));
// });

// module.exports = app;


// // const axios = require('axios');

// // // Complete API Keys list (with duplicates removed automatically)
// // const API_KEYS = [
// //     '643f9f3b575aa419c1d7218a',
// //     '6421e6a0c1f5f352e3f0f386', 
// //     '66cd81240388ac60968d6b4c',
// //     '648a5995f781eb467a28ddc1', // Appears twice in your list
// //     '67c0b380bd375d7bb8171f90',
// //     '61a6e562fc52fe763tr516e4653', // This looks malformed (contains 'tr')
// //     '65f5666036d2ad374ab32048',
// //     '65f53ea37a9f47303bf6d368',
// //     '67f3f2a0e495cdffb22ae91b',
// //     '67c0d2bd51ef27c8fe654941',
// //     '68a52eba6cd6f18dcca57bd2', // Appears twice in your list
// //     '65722a4470252e7175782766',
// //     '67e15d91aa2395acfbb705b5',
// //     '6686860957b0cb18a4596e24',
// //     '68b85a6dd8a6124ad5827ce1',
// //     '669b9b7b677c5b61ffca8bcd',
// //     '6746c4f6dfbccc0cb181718c',
// //     '65b27bd80ff088077baa70cb',
// //     '60d64e6d203da4515bf8e50f',
// //     '66bf67cfffd578198598cfbf', // Appears twice in your list
// //     '64c4aee1b3192c4b3fd9bb67'
// // ];

// // // Remove duplicates and clean API keys
// // const CLEAN_API_KEYS = [...new Set(API_KEYS)].filter(key => 
// //     key.length === 24 && /^[a-f0-9]+$/i.test(key) // Valid format check
// // );

// // console.log(`📊 Original keys: ${API_KEYS.length}, Clean unique keys: ${CLEAN_API_KEYS.length}`);

// // // Enhanced test configuration
// // const TEST_CONFIG = {
// //     BASE_URL: 'https://api.scrapingdog.com/google_jobs',
// //     TEST_QUERY: 'software engineer remote',
// //     COUNTRY: 'us',
// //     TIMEOUT: 25000, // 25 seconds
// //     DELAY_BETWEEN_TESTS: 2000, // 2 seconds
// //     BATCH_SIZE: 5, // Test 5 keys at once
// //     MAX_CONCURRENT: 3 // Maximum concurrent requests
// // };

// // // Function to test a single API key with detailed analysis
// // const testSingleApiKey = async (apiKey, index, total) => {
// //     try {
// //         console.log(`\n🔑 [${index + 1}/${total}] Testing: ${apiKey}`);
// //         console.log('⏳ Making request...');
        
// //         const startTime = Date.now();
        
// //         const response = await axios.get(TEST_CONFIG.BASE_URL, {
// //             params: {
// //                 api_key: apiKey,
// //                 query: TEST_CONFIG.TEST_QUERY,
// //                 country: TEST_CONFIG.COUNTRY,
// //                 chips: '',
// //                 lrad: '',
// //                 uds: '',
// //                 ltype: '',
// //                 next_page_token: ''
// //             },
// //             timeout: TEST_CONFIG.TIMEOUT,
// //             headers: {
// //                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
// //                 'Accept': 'application/json'
// //             },
// //             validateStatus: function (status) {
// //                 return status >= 200 && status < 600; // Accept all status codes
// //             }
// //         });
        
// //         const responseTime = Date.now() - startTime;
        
// //         // Detailed response analysis
// //         let result = {
// //             apiKey: apiKey,
// //             index: index + 1,
// //             status: 'SUCCESS',
// //             httpStatus: response.status,
// //             isValid: false,
// //             jobCount: 0,
// //             responseTime: responseTime,
// //             responseType: typeof response.data,
// //             message: '',
// //             hasNextPage: false,
// //             errorType: null,
// //             quota: null,
// //             rateLimit: null
// //         };
        
// //         // Analyze different response scenarios
// //         if (response.status === 200) {
// //             if (typeof response.data === 'object' && response.data.jobs_results) {
// //                 const jobsResults = response.data.jobs_results || [];
                
// //                 // Count valid jobs (filter out string error messages)
// //                 const validJobs = jobsResults.filter(job => 
// //                     typeof job === 'object' && job !== null && (job.title || job.company_name)
// //                 );
                
// //                 result.jobCount = validJobs.length;
// //                 result.isValid = true;
// //                 result.message = `✅ Found ${validJobs.length} valid jobs`;
// //                 result.hasNextPage = response.data.scrapingdog_pagination?.next_page_token ? true : false;
                
// //                 if (validJobs.length === 0 && jobsResults.length > 0) {
// //                     result.message += ` (${jobsResults.length} total results, all filtered out)`;
// //                 }
                
// //             } else if (typeof response.data === 'string') {
// //                 result.message = `⚠️ String response: ${response.data.substring(0, 80)}...`;
// //                 result.isValid = response.data.toLowerCase().includes('no jobs');
// //             } else {
// //                 result.message = `⚠️ Unexpected format: ${typeof response.data}`;
// //             }
            
// //         } else if (response.status === 401) {
// //             result.message = '❌ Unauthorized - Invalid API key';
// //             result.errorType = 'INVALID_KEY';
            
// //         } else if (response.status === 429) {
// //             result.message = '❌ Rate Limited - Too many requests';
// //             result.errorType = 'RATE_LIMIT';
            
// //         } else if (response.status === 402) {
// //             result.message = '❌ Payment Required - Quota exceeded';
// //             result.errorType = 'QUOTA_EXCEEDED';
            
// //         } else if (response.status >= 500) {
// //             result.message = `❌ Server Error (${response.status})`;
// //             result.errorType = 'SERVER_ERROR';
            
// //         } else {
// //             result.message = `❌ HTTP ${response.status}: ${response.statusText}`;
// //             result.errorType = 'HTTP_ERROR';
// //         }
        
// //         console.log(`   ${result.message} (${responseTime}ms)`);
// //         return result;
        
// //     } catch (error) {
// //         const errorResult = {
// //             apiKey: apiKey,
// //             index: index + 1,
// //             status: 'ERROR',
// //             httpStatus: error.response?.status || null,
// //             isValid: false,
// //             jobCount: 0,
// //             responseTime: null,
// //             responseType: null,
// //             message: '',
// //             hasNextPage: false,
// //             errorType: null,
// //             quota: null,
// //             rateLimit: null
// //         };
        
// //         if (error.code === 'ECONNABORTED') {
// //             errorResult.message = '⏱️ Timeout - Request took too long';
// //             errorResult.errorType = 'TIMEOUT';
// //         } else if (error.response?.status === 401) {
// //             errorResult.message = '❌ Unauthorized - Invalid API key';
// //             errorResult.errorType = 'INVALID_KEY';
// //         } else if (error.response?.status === 429) {
// //             errorResult.message = '❌ Rate Limited';
// //             errorResult.errorType = 'RATE_LIMIT';
// //         } else if (error.response?.status === 402) {
// //             errorResult.message = '❌ Quota exceeded';
// //             errorResult.errorType = 'QUOTA_EXCEEDED';
// //         } else {
// //             errorResult.message = `❌ ${error.message}`;
// //             errorResult.errorType = 'NETWORK_ERROR';
// //         }
        
// //         console.log(`   ${errorResult.message}`);
// //         return errorResult;
// //     }
// // };

// // // Enhanced function to test all API keys with progress tracking
// // const testAllApiKeys = async () => {
// //     console.log('\n' + '🚀 ENHANCED SCRAPINGDOG API KEY TESTER 🚀'.center(80, '='));
// //     console.log(`📊 Total API keys to test: ${CLEAN_API_KEYS.length}`);
// //     console.log(`🔍 Removed duplicates: ${API_KEYS.length - CLEAN_API_KEYS.length}`);
// //     console.log(`🎯 Test query: "${TEST_CONFIG.TEST_QUERY}"`);
// //     console.log(`🌍 Country: ${TEST_CONFIG.COUNTRY}`);
// //     console.log(`⏱️  Timeout per request: ${TEST_CONFIG.TIMEOUT/1000}s`);
// //     console.log(`⏳ Delay between tests: ${TEST_CONFIG.DELAY_BETWEEN_TESTS}ms`);
// //     console.log('='.repeat(80));
    
// //     const results = [];
// //     const startTime = Date.now();
    
// //     // Test each API key with progress indication
// //     for (let i = 0; i < CLEAN_API_KEYS.length; i++) {
// //         const apiKey = CLEAN_API_KEYS[i];
// //         const result = await testSingleApiKey(apiKey, i, CLEAN_API_KEYS.length);
// //         results.push(result);
        
// //         // Progress indicator
// //         const progress = Math.round(((i + 1) / CLEAN_API_KEYS.length) * 100);
// //         console.log(`📊 Progress: ${progress}% (${i + 1}/${CLEAN_API_KEYS.length})`);
        
// //         // Add delay between tests to avoid overwhelming the API
// //         if (i < CLEAN_API_KEYS.length - 1) {
// //             console.log(`⏳ Waiting ${TEST_CONFIG.DELAY_BETWEEN_TESTS}ms...`);
// //             await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.DELAY_BETWEEN_TESTS));
// //         }
// //     }
    
// //     const totalTime = Date.now() - startTime;
    
// //     // Comprehensive analysis
// //     console.log('\n' + '🎉 TESTING COMPLETED - COMPREHENSIVE ANALYSIS'.center(80, '='));
    
// //     const workingKeys = results.filter(r => r.isValid && r.jobCount > 0);
// //     const invalidKeys = results.filter(r => r.errorType === 'INVALID_KEY');
// //     const rateLimitedKeys = results.filter(r => r.errorType === 'RATE_LIMIT');
// //     const quotaExceededKeys = results.filter(r => r.errorType === 'QUOTA_EXCEEDED');
// //     const timeoutKeys = results.filter(r => r.errorType === 'TIMEOUT');
// //     const serverErrorKeys = results.filter(r => r.errorType === 'SERVER_ERROR');
// //     const networkErrorKeys = results.filter(r => r.errorType === 'NETWORK_ERROR');
    
// //     console.log(`\n📈 SUMMARY STATISTICS:`);
// //     console.log(`   ✅ Working keys: ${workingKeys.length}/${CLEAN_API_KEYS.length} (${Math.round(workingKeys.length/CLEAN_API_KEYS.length*100)}%)`);
// //     console.log(`   ❌ Invalid keys: ${invalidKeys.length}`);
// //     console.log(`   🚫 Rate limited: ${rateLimitedKeys.length}`);
// //     console.log(`   💳 Quota exceeded: ${quotaExceededKeys.length}`);
// //     console.log(`   ⏱️  Timeouts: ${timeoutKeys.length}`);
// //     console.log(`   🖥️  Server errors: ${serverErrorKeys.length}`);
// //     console.log(`   🌐 Network errors: ${networkErrorKeys.length}`);
// //     console.log(`   ⏱️  Total test time: ${Math.round(totalTime/1000)}s`);
// //     console.log(`   📊 Average time per key: ${Math.round(totalTime/CLEAN_API_KEYS.length)}ms`);
    
// //     // Top performing keys
// //     if (workingKeys.length > 0) {
// //         const sortedKeys = workingKeys.sort((a, b) => b.jobCount - a.jobCount || a.responseTime - b.responseTime);
        
// //         console.log(`\n🏆 TOP 5 PERFORMING API KEYS:`);
// //         sortedKeys.slice(0, 5).forEach((key, index) => {
// //             console.log(`   ${index + 1}. ${key.apiKey}`);
// //             console.log(`      Jobs: ${key.jobCount}, Time: ${key.responseTime}ms${key.hasNextPage ? ', Has Next Page ➡️' : ''}`);
// //         });
        
// //         const bestKey = sortedKeys;
// //         console.log(`\n🎯 RECOMMENDED API KEY: ${bestKey.apiKey}`);
// //         console.log(`   Performance: ${bestKey.jobCount} jobs in ${bestKey.responseTime}ms`);
        
// //         // Save working keys to file
// //         const workingKeysData = {
// //             timestamp: new Date().toISOString(),
// //             total_tested: CLEAN_API_KEYS.length,
// //             working_count: workingKeys.length,
// //             recommended_key: bestKey.apiKey,
// //             working_keys: workingKeys.map(k => ({
// //                 api_key: k.apiKey,
// //                 job_count: k.jobCount,
// //                 response_time: k.responseTime,
// //                 has_next_page: k.hasNextPage
// //             }))
// //         };
        
// //         const fs = require('fs').promises;
// //         await fs.writeFile('working_api_keys.json', JSON.stringify(workingKeysData, null, 2));
// //         console.log(`💾 Working keys saved to: working_api_keys.json`);
        
// //         return bestKey.apiKey;
        
// //     } else {
// //         console.log('\n💥 NO WORKING API KEYS FOUND!');
// //         console.log('🔧 Suggestions:');
// //         console.log('   - Check if keys are correctly formatted');
// //         console.log('   - Verify account status and quotas');
// //         console.log('   - Try testing with different delays');
// //         return null;
// //     }
// // };

// // // Quick function to get first working key (for automation)
// // const getFirstWorkingApiKey = async () => {
// //     console.log('🔍 Quick scan for working API key...');
    
// //     for (let i = 0; i < CLEAN_API_KEYS.length; i++) {
// //         const apiKey = CLEAN_API_KEYS[i];
// //         console.log(`⚡ Testing ${i + 1}/${CLEAN_API_KEYS.length}: ${apiKey.substring(0, 8)}...`);
        
// //         try {
// //             const response = await axios.get(TEST_CONFIG.BASE_URL, {
// //                 params: {
// //                     api_key: apiKey,
// //                     query: 'test',
// //                     country: 'us'
// //                 },
// //                 timeout: 10000
// //             });
            
// //             if (response.status === 200 && response.data?.jobs_results) {
// //                 const validJobs = response.data.jobs_results.filter(job => 
// //                     typeof job === 'object' && (job.title || job.company_name)
// //                 );
                
// //                 if (validJobs.length > 0) {
// //                     console.log(`✅ Found working key: ${apiKey} (${validJobs.length} jobs)`);
// //                     return apiKey;
// //                 }
// //             }
// //         } catch (error) {
// //             console.log(`❌ ${apiKey.substring(0, 8)}...: ${error.response?.status || error.code}`);
// //         }
        
// //         // Small delay
// //         await new Promise(resolve => setTimeout(resolve, 1000));
// //     }
    
// //     console.log('💥 No working keys found in quick scan');
// //     return null;
// // };

// // // Express endpoint for batch testing
// // const createBatchApiTesterEndpoint = (app) => {
// //     app.get('/test-api-keys-batch', async (req, res) => {
// //         try {
// //             console.log('\n🌐 Received batch API key testing request');
            
// //             const results = [];
// //             const startTime = Date.now();
            
// //             for (let i = 0; i < CLEAN_API_KEYS.length; i++) {
// //                 const result = await testSingleApiKey(CLEAN_API_KEYS[i], i, CLEAN_API_KEYS.length);
// //                 results.push(result);
                
// //                 // Small delay
// //                 await new Promise(resolve => setTimeout(resolve, 1000));
// //             }
            
// //             const workingKeys = results.filter(r => r.isValid && r.jobCount > 0);
// //             const bestKey = workingKeys.length > 0 ? 
// //                 workingKeys.reduce((best, current) => 
// //                     current.jobCount > best.jobCount ? current : best
// //                 ) : null;
            
// //             res.json({
// //                 success: true,
// //                 message: 'Batch API key testing completed',
// //                 timestamp: new Date().toISOString(),
// //                 processing_time_ms: Date.now() - startTime,
// //                 summary: {
// //                     total_keys_tested: CLEAN_API_KEYS.length,
// //                     duplicates_removed: API_KEYS.length - CLEAN_API_KEYS.length,
// //                     working_keys: workingKeys.length,
// //                     invalid_keys: results.filter(r => r.errorType === 'INVALID_KEY').length,
// //                     rate_limited: results.filter(r => r.errorType === 'RATE_LIMIT').length,
// //                     quota_exceeded: results.filter(r => r.errorType === 'QUOTA_EXCEEDED').length,
// //                     best_api_key: bestKey ? bestKey.apiKey : null,
// //                     best_key_stats: bestKey ? {
// //                         job_count: bestKey.jobCount,
// //                         response_time: bestKey.responseTime,
// //                         has_next_page: bestKey.hasNextPage
// //                     } : null
// //                 },
// //                 working_keys: workingKeys.map(k => ({
// //                     api_key: k.apiKey,
// //                     job_count: k.jobCount,
// //                     response_time: k.responseTime,
// //                     has_next_page: k.hasNextPage
// //                 })),
// //                 detailed_results: results
// //             });
            
// //         } catch (error) {
// //             console.error('🔥 Batch API testing error:', error);
// //             res.status(500).json({
// //                 success: false,
// //                 message: 'Error during batch API key testing',
// //                 error: error.message,
// //                 timestamp: new Date().toISOString()
// //             });
// //         }
// //     });
// // };

// // // Utility for centered text
// // String.prototype.center = function(width, padding = ' ') {
// //     const totalPadding = width - this.length;
// //     const leftPadding = Math.floor(totalPadding / 2);
// //     const rightPadding = totalPadding - leftPadding;
// //     return padding.repeat(leftPadding) + this + padding.repeat(rightPadding);
// // };

// // // Export functions
// // module.exports = {
// //     testSingleApiKey,
// //     testAllApiKeys,
// //     getFirstWorkingApiKey,
// //     createBatchApiTesterEndpoint,
// //     API_KEYS: CLEAN_API_KEYS,
// //     ORIGINAL_COUNT: API_KEYS.length,
// //     CLEAN_COUNT: CLEAN_API_KEYS.length
// // };

// // // Run directly if this file is executed
// // if (require.main === module) {
// //     console.log('🔧 Detected duplicates and malformed keys:');
// //     console.log(`   Original count: ${API_KEYS.length}`);
// //     console.log(`   Clean count: ${CLEAN_API_KEYS.length}`);
// //     console.log(`   Removed: ${API_KEYS.length - CLEAN_API_KEYS.length}`);
    
// //     testAllApiKeys().then(bestKey => {
// //         if (bestKey) {
// //             console.log(`\n🎯 COPY THIS FOR YOUR SCRAPER: ${bestKey}`);
// //         }
// //         process.exit(0);
// //     }).catch(error => {
// //         console.error('💥 Fatal error:', error);
// //         process.exit(1);
// //     });
// // }
// // const axios = require('axios');

// // // Function to check remaining credits for a single API key
// // const checkScrapingDogCredits = async (apiKey) => {
// //     try {
// //         console.log(`🔍 Checking credits for: ${apiKey.substring(0, 8)}...`);
        
// //         const response = await axios.get('https://api.scrapingdog.com/account', {
// //             params: {
// //                 api_key: apiKey
// //             },
// //             timeout: 10000
// //         });
        
// //         if (response.status === 200 && response.data) {
// //             return {
// //                 apiKey: apiKey,
// //                 status: 'SUCCESS',
// //                 data: response.data,
// //                 isValid: true
// //             };
// //         } else {
// //             return {
// //                 apiKey: apiKey,
// //                 status: 'ERROR',
// //                 error: `HTTP ${response.status}`,
// //                 isValid: false
// //             };
// //         }
        
// //     } catch (error) {
// //         return {
// //             apiKey: apiKey,
// //             status: 'ERROR',
// //             error: error.response?.status === 401 ? 'Invalid API Key' : error.message,
// //             isValid: false
// //         };
// //     }
// // };

// // // Function to check credits for multiple API keys
// // const checkAllCredits = async (apiKeys) => {
// //     console.log('🚀 SCRAPINGDOG CREDITS CHECKER');
// //     console.log('=' .repeat(50));
// //     console.log(`📊 Checking ${apiKeys.length} API keys for remaining credits`);
// //     console.log('=' .repeat(50));
    
// //     const results = [];
    
// //     for (let i = 0; i < apiKeys.length; i++) {
// //         const apiKey = apiKeys[i];
// //         const result = await checkScrapingDogCredits(apiKey);
// //         results.push(result);
        
// //         if (result.isValid) {
// //             console.log(`✅ ${apiKey.substring(0, 8)}...: Credits data retrieved`);
// //             console.log(`   Data:`, JSON.stringify(result.data, null, 2));
// //         } else {
// //             console.log(`❌ ${apiKey.substring(0, 8)}...: ${result.error}`);
// //         }
        
// //         // Small delay between requests
// //         if (i < apiKeys.length - 1) {
// //             await new Promise(resolve => setTimeout(resolve, 1000));
// //         }
// //     }
    
// //     // Summary
// //     const validKeys = results.filter(r => r.isValid);
// //     const invalidKeys = results.filter(r => !r.isValid);
    
// //     console.log('\n' + '📈 CREDITS SUMMARY' + '\n' + '=' .repeat(50));
// //     console.log(`✅ Valid API keys: ${validKeys.length}`);
// //     console.log(`❌ Invalid API keys: ${invalidKeys.length}`);
    
// //     if (validKeys.length > 0) {
// //         console.log('\n📊 DETAILED CREDITS INFO:');
// //         validKeys.forEach((result, index) => {
// //             console.log(`\n${index + 1}. API Key: ${result.apiKey}`);
// //             console.log(`   Credits Info:`, result.data);
// //         });
// //     }
    
// //     return results;
// // };

// // // Your API keys
// // const API_KEYS = [
// //     '643f9f3b575aa419c1d7218a',
// //     '6421e6a0c1f5f352e3f0f386', 
// //     '66cd81240388ac60968d6b4c',
// //     '648a5995f781eb467a28ddc1',
// //     '67c0b380bd375d7bb8171f90',
// //     '65f5666036d2ad374ab32048',
// //     '65f53ea37a9f47303bf6d368',
// //     '67f3f2a0e495cdffb22ae91b',
// //     '67c0d2bd51ef27c8fe654941',
// //     '68a52eba6cd6f18dcca57bd2',
// //     '65722a4470252e7175782766',
// //     '67e15d91aa2395acfbb705b5',
// //     '6686860957b0cb18a4596e24',
// //     '68b85a6dd8a6124ad5827ce1',
// //     '669b9b7b677c5b61ffca8bcd',
// //     '6746c4f6dfbccc0cb181718c',
// //     '65b27bd80ff088077baa70cb',
// //     '60d64e6d203da4515bf8e50f',
// //     '66bf67cfffd578198598cfbf',
// //     '64c4aee1b3192c4b3fd9bb67'
// // ];

// // // Express endpoint for credits checking
// // const createCreditsCheckEndpoint = (app) => {
// //     app.get('/check-credits', async (req, res) => {
// //         try {
// //             console.log('\n🌐 Received credits check request');
            
// //             const results = await checkAllCredits(API_KEYS);
// //             const validKeys = results.filter(r => r.isValid);
            
// //             res.json({
// //                 success: true,
// //                 message: 'Credits check completed',
// //                 timestamp: new Date().toISOString(),
// //                 summary: {
// //                     total_keys_checked: API_KEYS.length,
// //                     valid_keys: validKeys.length,
// //                     invalid_keys: results.length - validKeys.length
// //                 },
// //                 credits_data: validKeys.map(r => ({
// //                     api_key: r.apiKey.substring(0, 8) + '...',
// //                     credits_info: r.data
// //                 })),
// //                 all_results: results
// //             });
            
// //         } catch (error) {
// //             console.error('🔥 Credits check error:', error);
// //             res.status(500).json({
// //                 success: false,
// //                 message: 'Error during credits check',
// //                 error: error.message,
// //                 timestamp: new Date().toISOString()
// //             });
// //         }
// //     });
    
// //     // Single key credits check
// //     app.get('/check-credits/:apiKey', async (req, res) => {
// //         try {
// //             const apiKey = req.params.apiKey;
// //             console.log(`\n🌐 Checking single API key: ${apiKey.substring(0, 8)}...`);
            
// //             const result = await checkScrapingDogCredits(apiKey);
            
// //             res.json({
// //                 success: result.isValid,
// //                 message: result.isValid ? 'Credits retrieved successfully' : 'Failed to retrieve credits',
// //                 timestamp: new Date().toISOString(),
// //                 api_key: apiKey.substring(0, 8) + '...',
// //                 credits_data: result.isValid ? result.data : null,
// //                 error: result.isValid ? null : result.error
// //             });
            
// //         } catch (error) {
// //             res.status(500).json({
// //                 success: false,
// //                 message: 'Error during single key credits check',
// //                 error: error.message,
// //                 timestamp: new Date().toISOString()
// //             });
// //         }
// //     });
// // };

// // // Quick function to get API key with most credits
// // const getBestApiKeyByCredits = async (apiKeys) => {
// //     console.log('🎯 Finding API key with most credits...');
    
// //     const results = await checkAllCredits(apiKeys);
// //     const validKeys = results.filter(r => r.isValid);
    
// //     if (validKeys.length === 0) {
// //         console.log('💥 No valid API keys found!');
// //         return null;
// //     }
    
// //     // Sort by credits (assuming the response contains credits info)
// //     const bestKey = validKeys.reduce((best, current) => {
// //         // You might need to adjust this based on actual response structure
// //         const bestCredits = best.data.remaining_credits || best.data.credits || 0;
// //         const currentCredits = current.data.remaining_credits || current.data.credits || 0;
// //         return currentCredits > bestCredits ? current : best;
// //     });
    
// //     console.log(`🏆 Best API key: ${bestKey.apiKey} with ${bestKey.data.remaining_credits || bestKey.data.credits || 'unknown'} credits`);
// //     return bestKey.apiKey;
// // };

// // // Export functions
// // module.exports = {
// //     checkScrapingDogCredits,
// //     checkAllCredits,
// //     createCreditsCheckEndpoint,
// //     getBestApiKeyByCredits,
// //     API_KEYS
// // };

// // // Run directly if executed
// // if (require.main === module) {
// //     checkAllCredits(API_KEYS).then(() => {
// //         console.log('\n🎯 Credits check completed!');
// //         process.exit(0);
// //     }).catch(error => {
// //         console.error('💥 Fatal error:', error);
// //         process.exit(1);
// //     });
// // }
