<!-- Here’s what you should tell your frontend developer about the changes:
---
## **Backend API Changes for LinkedIn Job Comments & Status**
### 1. **Status Tracking**
- **Status is now tracked with user info.**
- Each status change (e.g., "engaged", "not_engaged") is recorded with:
  - The new status
  - The username of the person who made the change
  - The date/time of the change
- The current status is available as `currentStatus`.
- The full history is available as `statusHistory` (array).
### 2. **Comments**
- Comments are now stored as objects with:
  - `username` (who made the comment)
  - `comment` (the text)
  - `date` (when it was made)
- The comments array is available as `comments`.
### 3. **AE Comment for AI Remark Validation**
- There is a new field called `ae_comment` for the AE (Account Executive) to give feedback on whether the AI remark is correct or not.
---
## **How to Use the API**
### **PATCH `/api/jobs/:jobId`**
- To update status, comment, or AE comment, send a PATCH request with any of these fields:
  ```json
  {
    "status": "engaged",           // optional, one of the allowed statuses
    "username": "selectedUser",    // required when updating status or comment
    "comment": "My comment here",  // optional
    "ae_comment": "AI remark is correct" // optional
  }
  ```
- You can send any combination of these fields.
  - If you update status, include `username`.
  - If you add a comment, include `username` and `comment`.
  - If you want to give AE feedback, include `ae_comment`.
### **Response**
- The backend will update the job’s `currentStatus`, append to `statusHistory`, add to `comments`, and/or update `ae_comment` as appropriate.
---
## **Frontend UI Suggestions**
- At the top of the UI, provide a user selection dropdown (for username).
- When a user clicks "Engaged" or changes status, send the selected username and new status.
- When adding a comment, send the selected username and comment text.
- Provide a field for AE to enter feedback on the AI remark, and send it as `ae_comment`.
---
## **Data Structure Example (Job Object)**
```json
{
  "currentStatus": "engaged",
  "statusHistory": [
    { "status": "not_engaged", "username": "Alice", "date": "2024-06-10T12:00:00Z" },
    { "status": "engaged", "username": "Bob", "date": "2024-06-11T09:30:00Z" }
  ],
  "comments": [
    { "username": "Alice", "comment": "Looks good!", "date": "2024-06-10T12:05:00Z" }
  ],
  "ae_comment": "AI remark is correct"
}

How to Use
LinkedIn (apify) GET:
GET /api/apify/job?id=YOUR_JOB_ID (with auth token)
Upwork GET:
GET /api/upwork/job?id=YOUR_JOB_ID (with auth token)
```
---
**If you need the full request/response format or have any questions, let me know!**



Ran tool
Read file: routes/apify.js
Read file: routes/upwork.js
Read file: routes/authRoutes.js
Search files...
Read file: app.js
Here are all the routes defined in your project, along with their HTTP methods and usage context:

---

## 1. `routes/apify.js`

These routes are mounted under `/api` (see `app.js: app.use('/api', apify)`), so the full path is `/api/<route>`.

| Method | Path                                      | Middleware         | Controller Function                        | Usage/Description                                 |
|--------|-------------------------------------------|--------------------|--------------------------------------------|---------------------------------------------------|
| GET    | /apify                                   | -                  | fetchAndSaveJobs                          | Fetch jobs from Apify and save as raw JSON        |
| GET    | /apify/filtered                          | -                  | getFilteredJobs                           | Get filtered jobs                                 |
| GET    | /apify/score                             | -                  | scoreJobs                                 | Run AIML processing and return result             |
| GET    | /apify/scored                            | -                  | getScoredJobs                             | Get scored jobs as JSON                           |
| POST   | /save-jobs                               | authMiddleware     | uploadScoredJobsFromFile                  | Save jobs to MongoDB                              |
| GET    | /jobs-by-date                            | authMiddleware     | getJobsByDate                             | Get data from MongoDB                             |
| PATCH  | /jobs/:jobId                             | authMiddleware     | updateJobStatusAndComment                 | Update job status and comments in a user's batch  |
| GET    | /jobs-by-date/excel                      | authMiddleware     | exportJobsByDateToExcel                   | Export jobs-by-date data to Excel                 |
| GET    | /apify/job                               | authMiddleware     | getJobById                                | Get a specific job by id for the authenticated user|
| POST   | /jobs/:jobId/generate-proposal           | authMiddleware     | generateProposalForJob                    | Generate proposal for a job                       |
| PATCH  | /jobs/:jobId/proposal                    | authMiddleware     | updateProposalText                        | Update proposal text for a job                    |

---

## 2. `routes/upwork.js`

These routes are also mounted under `/api` (see `app.js: app.use('/api', upworkRoutes)`).

| Method | Path                                      | Middleware         | Controller Function                        | Usage/Description                                 |
|--------|-------------------------------------------|--------------------|--------------------------------------------|---------------------------------------------------|
| POST   | /upwork                                  | -                  | fetchAndSaveJobs                          | Fetch jobs from Upwork and save as raw JSON       |
| GET    | /upwork/filtered                         | -                  | filterUpworkJobs                          | Get filtered Upwork jobs                          |
| GET    | /upwork/score                            | -                  | scoreUpworkJobs                           | Run scoring on Upwork jobs                        |
| GET    | /upwork/scored                           | -                  | getUpworkFinalScores                      | Get scored Upwork jobs                            |
| POST   | /upwork/save-jobs                        | authMiddleware     | saveUpworkJobsBatchFromFile               | Save jobs (bulk insert/upsert)                    |
| GET    | /upwork/jobs-by-date                     | authMiddleware     | getJobsByDate                             | Get jobs by date                                  |
| PATCH  | /upwork/job/:jobId                       | authMiddleware     | editJobById                               | Edit job by jobId                                 |
| GET    | /upwork/job                              | authMiddleware     | getJobById                                | Get a specific Upwork job by id                   |
| POST   | /upwork/job/:jobId/generate-proposal     | authMiddleware     | generateProposalForJob                    | Generate proposal for a job                       |
| PATCH  | /upwork/job/:jobId/proposal              | authMiddleware     | updateProposalText                        | Update proposal text for a job                    |

---

## 3. `routes/authRoutes.js`

These routes are also mounted under `/api` (see `app.js: app.use('/api', authRoutes)`).

| Method | Path         | Middleware     | Controller Function | Usage/Description         |
|--------|--------------|---------------|---------------------|---------------------------|
| POST   | /signup      | -             | signup              | User signup               |
| POST   | /login       | -             | login               | User login                |
| GET    | /dashboard   | authMiddleware| dashboard           | User dashboard (protected)|

---

## Route Usage

- All routes are mounted under `/api` in `app.js`.
- The `authMiddleware` is used to protect certain routes, requiring authentication.
- Controller functions (e.g., `apifyController.fetchAndSaveJobs`) handle the business logic for each route.
- The routes are used for CRUD operations, data fetching, scoring, proposal generation, and exporting data, primarily for Apify and Upwork job data, as well as user authentication.

If you need details about what each controller function does, let me know! -->

# API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## LinkedIn/Apify Routes

### 1. **Fetch Jobs from LinkedIn**
```http
GET /linkedin
```
**Description:** Fetches jobs from LinkedIn using Apify and saves as raw JSON.

**Response:**
```json
{
  "message": "Jobs fetched and saved to JSON file",
  "count": 25
}
```

---

### 2. **Get Filtered LinkedIn Jobs**
```http
GET /linkedin/filtered
```
**Description:** Returns filtered jobs with selected fields.

**Response:**
```json
{
  "message": "Filtered jobs saved to data/filtered.json",
  "total_raw": 25,
  "total_unique": 23,
  "duplicates_removed": 2,
  "total_saved": 20
}
```

---

### 3. **Score LinkedIn Jobs**
```http
GET /linkedin/score
```
**Description:** Runs AIML processing and returns result.

**Response:**
```json
{
  "message": "Processing complete. Check data/scored_jobs_output.json"
}
```

---

### 4. **Get Scored LinkedIn Jobs**
```http
GET /linkedin/scored
```
**Description:** Returns scored jobs as JSON.

**Response:**
```json
[
  {
    "id": "4269612990",
    "title": "QA Engineer",
    "final_score": 0.54,
    "tier": "Yellow"
  }
]
```

---

### 5. **Save LinkedIn Jobs to Database**
```http
POST /linkedin/save-jobs
```
**Description:** Saves scored jobs from file to MongoDB for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Jobs batch uploaded from file successfully.",
  "userId": "user_id",
  "totalBatches": 1
}
```

---

### 6. **Get LinkedIn Jobs by Date**
```http
GET /linkedin/jobs-by-date
```
**Description:** Get jobs for user by date or date range, or latest batch.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `date` (optional): Specific date in YYYY-MM-DD format
- `start` (optional): Start date for range in YYYY-MM-DD format
- `end` (optional): End date for range in YYYY-MM-DD format

**Examples:**
```bash
# Get latest batch
GET /linkedin/jobs-by-date

# Get jobs for specific date
GET /linkedin/jobs-by-date?date=2024-06-07

# Get jobs for date range
GET /linkedin/jobs-by-date?start=2024-06-01&end=2024-06-07
```

**Response:**
```json
{
  "date": "2024-06-07",
  "jobs": [
    {
      "id": "4269612990",
      "title": "QA Engineer",
      "currentStatus": "not_engaged"
    }
  ]
}
```

---

### 7. **Update LinkedIn Job**
```http
PATCH /linkedin/job/:jobId
```
**Description:** Update job status, comments, AE score, AE pitched, or estimated budget.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `jobId`: LinkedIn job ID

**Request Body:**
```json
{
  "status": "applied",
  "username": "John Doe",
  "comment": "Applied via LinkedIn",
  "ae_comment": "Good fit for our services",
  "ae_score": 85,
  "ae_pitched": "Pitched to client on 2024-06-07",
  "estimated_budget": 5000
}
```

**Notes:**
- `status` and `username` are required together
- `comment` and `username` are required together
- `ae_score` and `username` are required together
- `ae_comment`, `ae_pitched`, `estimated_budget` can be updated independently

**Response:**
```json
{
  "message": "Job updated successfully."
}
```

---

### 8. **Get LinkedIn Job by ID**
```http
GET /linkedin/job
```
**Description:** Get a specific job by ID for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `id`: LinkedIn job ID

**Example:**
```bash
GET /linkedin/job?id=4269612990
```

**Response:**
```json
{
  "id": "4269612990",
  "title": "QA Engineer",
  "currentStatus": "applied",
  "ae_score": [
    {
      "value": 85,
      "username": "John Doe",
      "date": "2024-06-07T10:30:00.000Z"
    }
  ]
}
```

---

### 9. **Generate LinkedIn Proposal**
```http
POST /linkedin/job/:jobId/generate-proposal
```
**Description:** Generate proposal for a LinkedIn job.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `jobId`: LinkedIn job ID

**Request Body:**
```json
{
  "selectedCategory": "qa-testing"
}
```

**Response:**
```json
{
  "proposal": "Generated proposal text...",
  "job": { ... }
}
```

---

### 10. **Update LinkedIn Proposal**
```http
PATCH /linkedin/job/:jobId/proposal
```
**Description:** Update proposal text for a LinkedIn job.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `jobId`: LinkedIn job ID

**Request Body:**
```json
{
  "proposal": "Updated proposal text"
}
```

**Response:**
```json
{
  "proposal": "Updated proposal text",
  "job": { ... }
}
```

---

### 11. **Export LinkedIn Jobs to Excel**
```http
GET /linkedin/jobs-by-date/excel
```
**Description:** Export jobs-by-date data to Excel file.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:** Excel file download

---

## Upwork Routes

### 1. **Fetch Jobs from Upwork**
```http
GET /upwork
```
**Description:** Fetches jobs from Upwork and saves as raw JSON.

**Query Parameters (optional):**
- `age`: Age filter (default: 24)
- `category`: Array of categories (default: ["qa-testing", "ai-machine-learning", ...])
- `limit`: Number of jobs to fetch (default: 100)
- `location`: Array of locations (default: ["United States", "United Kingdom", ...])
- `sort`: Sort order (default: "newest")

**Example:**
```bash
GET /upwork?limit=50&category=qa-testing
```

**Response:**
```json
{
  "message": "Upwork jobs fetched and saved to JSON file",
  "count": 50
}
```

---

### 2. **Get Filtered Upwork Jobs**
```http
GET /upwork/filtered
```
**Description:** Filter, deduplicate, and save jobs to filtered file.

**Response:**
```json
{
  "message": "Filtered jobs saved to data/filtered_upwork.json",
  "total_raw": 50,
  "total_unique": 48,
  "duplicates_removed": 2,
  "total_saved": 45
}
```

---

### 3. **Score Upwork Jobs**
```http
GET /upwork/score
```
**Description:** Run scoring and AI remarks on filtered jobs.

**Response:**
```json
{
  "message": "Upwork jobs scored successfully",
  "output": "path/to/output/file"
}
```

---

### 4. **Get Scored Upwork Jobs**
```http
GET /upwork/scored
```
**Description:** Get scored jobs as JSON.

**Response:**
```json
[
  {
    "jobId": "~0123456789abcdef",
    "title": "QA Engineer",
    "final_weighted_score": 0.75,
    "tier": "Green"
  }
]
```

---

### 5. **Save Upwork Jobs to Database**
```http
POST /upwork/save-jobs
```
**Description:** Save jobs from file to DB for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Jobs batch uploaded from file successfully.",
  "userId": "user_id",
  "totalBatches": 1
}
```

---

### 6. **Get Upwork Jobs by Date**
```http
GET /upwork/jobs-by-date
```
**Description:** Get jobs for user by date or date range, or latest batch.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `date` (optional): Specific date in YYYY-MM-DD format
- `start` (optional): Start date for range in YYYY-MM-DD format
- `end` (optional): End date for range in YYYY-MM-DD format

**Examples:**
```bash
# Get latest batch
GET /upwork/jobs-by-date

# Get jobs for specific date
GET /upwork/jobs-by-date?date=2024-06-07

# Get jobs for date range
GET /upwork/jobs-by-date?start=2024-06-01&end=2024-06-07
```

**Response:**
```json
{
  "message": "Jobs fetched from the most recent batch",
  "count": 45,
  "jobs": [
    {
      "jobId": "~0123456789abcdef",
      "title": "QA Engineer",
      "currentStatus": "not_engaged"
    }
  ],
  "batchDate": "2024-06-07",
  "batchTimestamp": "2024-06-07T00:00:00.000Z"
}
```

---

### 7. **Update Upwork Job**
```http
PATCH /upwork/job/:jobId
```
**Description:** Update job status, comments, AE score, AE pitched, or estimated budget.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `jobId`: Upwork job ID

**Request Body:**
```json
{
  "status": "applied",
  "username": "John Doe",
  "comment": "Applied via Upwork",
  "ae_comment": "Good fit for our services",
  "ae_score": 85,
  "ae_pitched": "Pitched to client on 2024-06-07",
  "estimated_budget": 5000
}
```

**Notes:**
- `status` and `username` are required together
- `comment` and `username` are required together
- `ae_score` and `username` are required together
- `ae_comment`, `ae_pitched`, `estimated_budget` can be updated independently

**Response:**
```json
{
  "message": "Upwork job updated successfully."
}
```

---

### 8. **Get Upwork Job by ID**
```http
GET /upwork/job
```
**Description:** Get a specific Upwork job by ID for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `id`: Upwork job ID

**Example:**
```bash
GET /upwork/job?id=~0123456789abcdef
```

**Response:**
```json
{
  "jobId": "~0123456789abcdef",
  "title": "QA Engineer",
  "currentStatus": "applied",
  "ae_score": [
    {
      "value": 85,
      "username": "John Doe",
      "date": "2024-06-07T10:30:00.000Z"
    }
  ]
}
```

---

### 9. **Generate Upwork Proposal**
```http
POST /upwork/job/:jobId/generate-proposal
```
**Description:** Generate proposal for an Upwork job.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `jobId`: Upwork job ID

**Request Body:**
```json
{
  "selectedCategory": "qa-testing"
}
```

**Response:**
```json
{
  "proposal": "Generated proposal text...",
  "job": { ... }
}
```

---

### 10. **Update Upwork Proposal**
```http
PATCH /upwork/job/:jobId/proposal
```
**Description:** Update proposal text for an Upwork job.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `jobId`: Upwork job ID

**Request Body:**
```json
{
  "proposal": "Updated proposal text"
}
```

**Response:**
```json
{
  "proposal": "Updated proposal text",
  "job": { ... }
}
```

---

## Authentication Routes

### 1. **User Signup**
```http
POST /signup
```
**Description:** Register a new user.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here"
}
```

---

### 2. **User Login**
```http
POST /login
```
**Description:** Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here"
}
```

---

### 3. **User Dashboard**
```http
GET /dashboard
```
**Description:** Get user dashboard information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Welcome to dashboard",
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

---

## Common Response Formats

### Success Response
```json
{
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Validation Error
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limits

- No specific rate limits implemented
- Consider implementing rate limiting for production use

---

## Notes

1. **Date Formats**: All dates should be in `YYYY-MM-DD` format
2. **Job IDs**: 
   - LinkedIn jobs use numeric IDs (e.g., "4269612990")
   - Upwork jobs use string IDs (e.g., "~0123456789abcdef")
3. **Authentication**: Most endpoints require JWT token in Authorization header
4. **File Operations**: Some endpoints read/write files in the `data/` directory
5. **Batch Operations**: Jobs are stored in batches with timestamps for versioning



Absolutely! Here’s clear API documentation for your frontend developers for both the LinkedIn and Upwork proposal generation endpoints.

---
<!-- 
# :page_facing_up: API Documentation: Proposal Generation

## 1. LinkedIn Proposal Generation

### Endpoint
POST /api/apify/jobs/:jobId/generate-proposal

### Description
Generates an AI-powered proposal for a specific LinkedIn job.
The proposal is generated using OpenAI and pre-defined templates, and is saved to the job’s proposal field in the database.

### Request Parameters
- Path Parameter:
  - jobId (string): The ID of the LinkedIn job.

- Headers:
  - Authorization: Bearer token (JWT)
  - Content-Type: application/json

- Body (JSON):

json
  {
    "selectedCategory": "AI/ML",      // For services: e.g., "AI/ML", "QA", etc. For products: "Recruitinn", "SkillBuilder", "CoVental"
    "isProduct": false                // true if a product is selected, false if a service is selected
  }
  

### Response (Success)
json
{
  "proposal": "Generated proposal text here...",
  "job": { /* full job object with updated proposal field */ }
}

### Response (Error)
json
{
  "message": "No reference messages found for category: ...",
  // or
  "message": "Proposal generation failed.",
  "error": "..."
}

### Frontend Usage
- When the user clicks "Generate Proposal" on a LinkedIn job card:
  - Send a POST request to this endpoint with the correct selectedCategory and isProduct values.
  - Display the returned proposal in the UI (e.g., in a textarea for editing).

---

## 2. Upwork Proposal Generation

### Endpoint
POST /api/upwork/job/:jobId/generate-proposal

### Description
Generates an AI-powered proposal for a specific Upwork job.
The proposal is generated using OpenAI and pre-defined templates, and is saved to the job’s proposal field in the database.

### Request Parameters
- Path Parameter:
  - jobId (string): The ID of the Upwork job.

- Headers:
  - Authorization: Bearer token (JWT)
  - Content-Type: application/json

- Body (JSON):

json
  {
    "selectedCategory": "Software Development" // Must match a category in the Upwork templates
  }
  

### Response (Success)
json
{
  "proposal": "Generated proposal text here...",
  "job": { /* full job object with updated proposal field */ }
}

### Response (Error)
json
{
  "message": "No reference template found for selected category: ...",
  // or
  "message": "Proposal generation failed.",
  "error": "..."
}

### Frontend Usage
- When the user clicks "Generate Proposal" on an Upwork job card:
  - Send a POST request to this endpoint with the correct selectedCategory.
  - Display the returned proposal in the UI (e.g., in a textarea for editing).

---

## General Notes for Frontend Developers

- Authorization:
  All endpoints require a valid JWT token in the Authorization header.

- Category Values:
  - For LinkedIn:
    - If the user selects a service (e.g., "AI/ML", "QA"), send isProduct: false.
    - If the user selects a product (e.g., "Recruitinn", "SkillBuilder", "CoVental"), send isProduct: true.
  - For Upwork:
    - Send the selected category as selectedCategory.

- Error Handling:
  - If you receive a message like "No reference messages found for category: ...", check that the category matches exactly (case and spelling) with the backend template.

- Editing Proposals:
  - After generation, the proposal is saved in the database and returned in the response.
  - If the user edits the proposal, use the PATCH endpoint (not covered here, but available) to update the proposal in the database.

---

## Example: LinkedIn Proposal Generation (JavaScript/Fetch)
js
fetch('/api/apify/jobs/4274819365/generate-proposal', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    selectedCategory: 'AI/ML',
    isProduct: false
  })
})
.then(res => res.json())
.then(data => {
  // data.proposal contains the generated proposal
});

---

## Example: Upwork Proposal Generation (JavaScript/Fetch)
js
fetch('/api/upwork/job/1945890654193887293/generate-proposal', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    selectedCategory: 'Software Development'
  })
})
.then(res => res.json())
.then(data => {
  // data.proposal contains the generated proposal
});

---

If you need documentation for the PATCH (edit proposal) endpoint or want a Postman collection, let me know!


2. List of Services and Products for LinkedIn
A. Products (for isProduct: true)
These are found under linkedin.products in your email_templates.json:
"Recruitinn"
"SkillBuilder"
"CoVental"
B. Services (for isProduct: false)
These are found under linkedin.services in your email_templates.json:
"AI/ML"
"QA"
"SoftwareDevelopment"
"MobileAppDevelopment"
"UI/UX"
"DevOps"
"CloudDevOps"
"VAPT"
"Cybersecurity"
"DataEngineering"
Note:
Some services (like "QA", "SoftwareDevelopment", etc.) may have subcategories.
If you want to support subcategories, check your template for nested keys.



3. List of Categories for Upwork
These are found under upwork in your email_templates.json:
"AI/ML"
"QA"
"Software Development"
"Mobile App Development"
"UI/UX"
"DevOps"
"Cloud DevOps"
"VAPT"
"Cybersecurity"
"Data Engineering"
(Use the exact spelling/case as in the template!) -->


I'll help you write updated documentation for the proposal generation endpoints. Let me first examine the current codebase to understand the implementation and then provide comprehensive updated documentation.

Search files...
Now let me search for the proposal generation endpoints specifically:

Ran tool
Let me examine the actual implementation of the proposal generation functions:

Read file: controllers/apifyController.js
Ran tool
Read file: controllers/apifyController.js
Read file: controllers/upworkController.js
Now let me check the routes to understand the exact endpoint paths:

Read file: routes/apify.js
Read file: routes/upwork.js
Now let me check the email templates to understand the available categories:

Read file: python/templates/email_templates.json
Read file: python/templates/email_templates.json
Now let me check the server.js to understand the base routes:

Read file: server.js
Read file: app.js
Based on my analysis of the codebase, I can now provide you with comprehensive updated documentation for the proposal generation endpoints. Here's the updated documentation:

# 📄 Updated API Documentation: Proposal Generation

## Overview
This documentation covers the AI-powered proposal generation endpoints for both LinkedIn and Upwork jobs. The system uses OpenAI and pre-defined templates to generate personalized proposals based on job descriptions and selected categories.

---

## 🔗 LinkedIn Proposal Generation

### Endpoint
```
POST /api/linkedin/job/:jobId/generate-proposal
```

### Description
Generates an AI-powered proposal for a specific LinkedIn job using OpenAI and pre-defined templates. The proposal is automatically saved to the job's proposal field in the database.

### Authentication
- **Required**: JWT Bearer token in Authorization header
- **Header**: `Authorization: Bearer <your_jwt_token>`

### Request Parameters

#### Path Parameters
- `jobId` (string, required): The unique ID of the LinkedIn job

#### Request Body (JSON)
```json
{
  "selectedCategory": "AI/ML",      // Required: Service or product category
  "isProduct": false                // Required: true for products, false for services
}
```

#### Available Categories

**Services** (`isProduct: false`):
- `"AI/ML"`
- `"QA"`
- `"SoftwareDevelopment"`
- `"MobileAppDevelopment"`
- `"UI/UX"`
- `"DevOps"`
- `"CloudDevOps"`
- `"VAPT"`
- `"Cybersecurity"`
- `"DataEngineering"`

**Products** (`isProduct: true`):
- `"Recruitinn"`
- `"SkillBuilder"`
- `"CoVental"`

### Response

#### Success Response (200)
```json
{
  "proposal": "Generated proposal text here...",
  "job": {
    "id": "job_id",
    "title": "Job Title",
    "proposal": "Generated proposal text here...",
    // ... other job fields
  }
}
```

#### Error Responses

**404 - Job Not Found**
```json
{
  "message": "Job not found for user."
}
```

**404 - No Job Batches**
```json
{
  "message": "No job batches found for user."
}
```

**500 - Generation Failed**
```json
{
  "message": "Proposal generation failed.",
  "error": "Detailed error message"
}
```

---

## 🔗 Upwork Proposal Generation

### Endpoint
```
POST /api/upwork/job/:jobId/generate-proposal
```

### Description
Generates an AI-powered proposal for a specific Upwork job using OpenAI and pre-defined templates. The proposal is automatically saved to the job's proposal field in the database.

### Authentication
- **Required**: JWT Bearer token in Authorization header
- **Header**: `Authorization: Bearer <your_jwt_token>`

### Request Parameters

#### Path Parameters
- `jobId` (string, required): The unique ID of the Upwork job

#### Request Body (JSON)
```json
{
  "selectedCategory": "Software Development"  // Required: Must match exact category name
}
```

#### Available Categories
- `"AI/ML"`
- `"QA"`
- `"Software Development"`
- `"Mobile App Development"`
- `"UI/UX"`
- `"DevOps"`
- `"Cloud DevOps"`
- `"VAPT"`
- `"Cybersecurity"`
- `"Data Engineering"`

**Note**: Use exact spelling and case as shown above.

### Response

#### Success Response (200)
```json
{
  "proposal": "Generated proposal text here...",
  "job": {
    "jobId": "job_id",
    "title": "Job Title",
    "proposal": "Generated proposal text here...",
    // ... other job fields
  }
}
```

#### Error Responses

**404 - Job Not Found**
```json
{
  "message": "Job not found for user."
}
```

**404 - No Job Batches**
```json
{
  "message": "No job batches found for user."
}
```

**500 - Generation Failed**
```json
{
  "message": "Proposal generation failed.",
  "error": "Detailed error message"
}
```

---

## 🔧 Proposal Editing Endpoints

### LinkedIn Proposal Update
```
PATCH /api/linkedin/job/:jobId/proposal
```

### Upwork Proposal Update
```
PATCH /api/upwork/job/:jobId/proposal
```

#### Request Body
```json
{
  "proposal": "Updated proposal text here..."
}
```

---

## 🎯 Best Practices

### 1. Error Handling
- Always check for authentication errors (401)
- Handle network errors gracefully
- Provide user-friendly error messages

### 2. User Experience
- Show loading states during generation
- Allow users to edit generated proposals
- Save draft proposals automatically

### 3. Category Selection
- **LinkedIn**: Use exact category names and set `isProduct` correctly
- **Upwork**: Use exact category names (case-sensitive)

### 4. Rate Limiting
- Implement client-side rate limiting
- Show appropriate messages for rate limit errors

---

## 🔍 Troubleshooting

### Common Issues

1. **"Job not found for user"**
   - Ensure the job exists in the user's latest batch
   - Verify the jobId is correct

2. **"No job batches found for user"**
   - User needs to save jobs to database first
   - Check if user is authenticated

3. **"Proposal generation failed"**
   - Check Python script dependencies
   - Verify OpenAI API key is configured
   - Check server logs for detailed error

4. **Category not found errors**
   - Verify exact category spelling and case
   - Check available categories in documentation

### Debug Steps
1. Check browser network tab for request/response
2. Verify JWT token is valid and not expired
3. Check server logs for Python script errors
4. Ensure all required environment variables are set

---

## �� Notes

- Proposals are automatically saved to the database upon generation
- The system uses Python scripts for AI processing
- Templates are stored in `python/templates/email_templates.json`
- Both endpoints require valid JWT authentication
- Job IDs must exist in the user's latest job batch

For additional support or questions about implementation, please refer to the server logs or contact the development team.