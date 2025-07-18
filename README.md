Read file: routes/upwork.js
Read file: routes/apify.js
Here’s a concise documentation for your **Upwork** and **Apify (LinkedIn)** API routes, with a summary of the procedure and endpoint purposes. This will help frontend developers understand how to interact with your backend.

---

# Upwork & LinkedIn (Apify) API Documentation

---

## **Upwork API Endpoints**

| Method | Endpoint                        | Description                                                                 | Auth Required |
|--------|---------------------------------|-----------------------------------------------------------------------------|--------------|
| POST   | `/api/upwork`                   | Fetch jobs from Upwork and save as raw JSON                                 | No           |
| GET    | `/api/upwork/filtered`          | Filter, deduplicate, and save jobs to filtered file                         | No           |
| GET    | `/api/upwork/score`             | Run scoring and AI remarks on filtered jobs                                 | No           |
| GET    | `/api/upwork/scored`            | Get scored jobs as JSON                                                     | No           |
| POST   | `/api/upwork/save-jobs`         | Save jobs from file to DB for authenticated user (batch append)             | Yes          |
| GET    | `/api/upwork/jobs-by-date`      | Get jobs for user by date or date range, or latest batch                    | Yes          |
| PATCH  | `/api/upwork/job/:jobId`        | Edit a job by jobId in the latest batch                                     | Yes          |

---

## **LinkedIn (Apify) API Endpoints**

| Method | Endpoint                        | Description                                                                 | Auth Required |
|--------|---------------------------------|-----------------------------------------------------------------------------|--------------|
| GET    | `/api/apify`                    | Fetch jobs from Apify and save as raw JSON                                  | No           |
| GET    | `/api/apify/filtered`           | Get filtered jobs with only selected fields                                 | No           |
| GET    | `/api/apify/score`              | Run AIML processing and return result                                       | No           |
| GET    | `/api/apify/scored`             | Get scored jobs as JSON                                                     | No           |
| POST   | `/api/save-jobs`                | Save scored jobs from file to DB for authenticated user (batch append)      | Yes          |
| GET    | `/api/jobs-by-date`             | Get jobs for user by date or date range, or latest batch                    | Yes          |
| PATCH  | `/api/jobs/:jobId`              | Update job status and comments in a user's batch                            | Yes          |

---

## **API Procedure Overview**

1. **Fetch Jobs**  
   - Upwork: `POST /api/upwork`  
   - LinkedIn: `GET /api/apify`  
   → Triggers job scraping and saves raw jobs to a JSON file.

2. **Filter & Score Jobs**  
   - Upwork:  
     - `GET /api/upwork/filtered` (filter/deduplicate)
     - `GET /api/upwork/score` (score and add AI remarks)
   - LinkedIn:  
     - `GET /api/apify/filtered` (filter)
     - `GET /api/apify/score` (score and add AI remarks)

3. **Get Scored Jobs**  
   - Upwork: `GET /api/upwork/scored`  
   - LinkedIn: `GET /api/apify/scored`  
   → Returns the scored jobs as JSON.

4. **Save Jobs to Database (Batch)**  
   - Upwork: `POST /api/upwork/save-jobs`  
   - LinkedIn: `POST /api/save-jobs`  
   → Saves jobs from file to MongoDB, appending a new batch for the authenticated user.

5. **Get Jobs by Date**  
   - Upwork: `GET /api/upwork/jobs-by-date`  
   - LinkedIn: `GET /api/jobs-by-date`  
   → Fetches jobs for a user by date, date range, or latest batch.

6. **Edit/Update a Job**  
   - Upwork: `PATCH /api/upwork/job/:jobId`  
   - LinkedIn: `PATCH /api/jobs/:jobId`  
   → Updates job fields (status, comments, etc.) in the latest batch for the user.

---

## **Frontend Developer Notes**

- **Authentication:**  
  - Endpoints marked "Auth Required" need a valid JWT token in the `Authorization` header.
- **Batching:**  
  - When saving jobs, each API call creates a new batch for the user.
- **Editing:**  
  - PATCH endpoints update a job in the most recent batch for the user.
- **Date Filtering:**  
  - Use query params like `?date=YYYY-MM-DD` or `?start=YYYY-MM-DD&end=YYYY-MM-DD` for date-based queries.

---

**Let me know if you want more details on request/response formats for any endpoint!**