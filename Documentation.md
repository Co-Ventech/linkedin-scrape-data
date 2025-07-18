
Here is a detailed API documentation for your endpoints, including HTTP methods, required/requested data, authentication, and cURL examples for each. This will help anyone understand how to use your API.

---

## **Auth Endpoints (`/api/auth`)**

### 1. **Signup**
- **Endpoint:** `/api/auth/signup`
- **Method:** `POST`
- **Body:** JSON
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Auth:** No
- **cURL:**
  ```sh
  curl -X POST http://localhost:3000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","email":"test@example.com","password":"yourpassword"}'
  ```

---

### 2. **Login**
- **Endpoint:** `/api/auth/login`
- **Method:** `POST`
- **Body:** JSON
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Auth:** No
- **cURL:**
  ```sh
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"yourpassword"}'
  ```

---

### 3. **Dashboard**
- **Endpoint:** `/api/auth/dashboard`
- **Method:** `GET`
- **Auth:** Yes (Bearer token)
- **Body:** None
- **cURL:**
  ```sh
  curl -X GET http://localhost:3000/api/auth/dashboard \
    -H "Authorization: Bearer <your_token>"
  ```

---

## **Job/Apify Endpoints (`/api`)**

### 4. **Fetch Jobs from Apify**
- **Endpoint:** `/api/apify`
- **Method:** `GET`
- **Auth:** No
- **Body:** None
- **cURL:**
  ```sh
  curl -X GET http://localhost:3000/api/apify
  ```

---

### 5. **Run AIML Scoring**
- **Endpoint:** `/api/apify/score`
- **Method:** `GET`
- **Auth:** No
- **Body:** None
- **cURL:**
  ```sh
  curl -X GET http://localhost:3000/api/apify/score
  ```

---

### 6. **Get Scored Jobs**
- **Endpoint:** `/api/apify/scored`
- **Method:** `GET`
- **Auth:** No
- **Body:** None
- **cURL:**
  ```sh
  curl -X GET http://localhost:3000/api/apify/scored
  ```

---

### 7. **Get Filtered Jobs**
- **Endpoint:** `/api/apify/filtered`
- **Method:** `GET`
- **Auth:** No
- **Body:** None
- **cURL:**
  ```sh
  curl -X GET http://localhost:3000/api/apify/filtered
  ```

---

### 8. **Upload Scored Jobs to MongoDB**
- **Endpoint:** `/api/save-jobs`
- **Method:** `POST`
- **Auth:** Yes (Bearer token)
- **Body:** None (reads from server-side file, not from request body)
- **cURL:**
  ```sh
  curl -X POST http://localhost:3000/api/save-jobs \
    -H "Authorization: Bearer <your_token>"
  ```

---

### 9. **Get Jobs by Date or Date Range**
- **Endpoint:** `/api/jobs-by-date`
- **Method:** `GET`
- **Auth:** Yes (Bearer token)
- **Query Params (optional):**
  - `date=YYYY-MM-DD` (get jobs for a specific date)
  - `startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` (get jobs for a date range)
- **Body:** None
- **cURL (latest batch):**
  ```sh
  curl -X GET http://localhost:3000/api/jobs-by-date \
    -H "Authorization: Bearer <your_token>"
  ```
- **cURL (specific date):**
  ```sh
  curl -X GET "http://localhost:3000/api/jobs-by-date?date=2024-06-01" \
    -H "Authorization: Bearer <your_token>"
  ```
- **cURL (date range):**
  ```sh
  curl -X GET "http://localhost:3000/api/jobs-by-date?startDate=2024-06-01&endDate=2024-06-10" \
    -H "Authorization: Bearer <your_token>"
  ```

---

### 10. **Update Job Status and Comments**
- **Endpoint:** `/api/jobs/:jobId`
- **Method:** `PATCH`
- **Auth:** Yes (Bearer token)
- **Body:** JSON (at least one of `status` or `comment` is required)
  ```json
  {
    "status": "applied",      // optional, one of: not_engaged, applied, engaged, interview, offer, rejected, archived
    "comment": "Your comment" // optional
  }
  ```
- **cURL:**
  ```sh
  curl -X PATCH http://localhost:3000/api/jobs/<jobId> \
    -H "Authorization: Bearer <your_token>" \
    -H "Content-Type: application/json" \
    -d '{"status":"applied","comment":"Applied via company website"}'
  ```

---

## **Summary Table**

| Endpoint                       | Method | Auth | Body/Params         | Description                        |
|---------------------------------|--------|------|---------------------|------------------------------------|
| /api/auth/signup                | POST   | No   | JSON                | Register new user                  |
| /api/auth/login                 | POST   | No   | JSON                | Login user                         |
| /api/auth/dashboard             | GET    | Yes  | None                | Get user dashboard                 |
| /api/apify                      | GET    | No   | None                | Fetch jobs from Apify              |
| /api/apify/score                | GET    | No   | None                | Run AIML scoring                   |
| /api/apify/scored               | GET    | No   | None                | Get scored jobs                    |
| /api/apify/filtered             | GET    | No   | None                | Get filtered jobs                  |
| /api/save-jobs                  | POST   | Yes  | None                | Upload scored jobs to MongoDB      |
| /api/jobs-by-date               | GET    | Yes  | Query params        | Get jobs by date/range             |
| /api/jobs/:jobId                | PATCH  | Yes  | JSON                | Update job status/comments         |

---




---

# Upwork API Endpoints – Functionality Overview

---

## 1. **Filter and Deduplicate Upwork Jobs**
**Endpoint:** `GET /api/upwork/filter`  
**Functionality:**  
- Reads raw Upwork jobs from a file.
- Normalizes and deduplicates jobs by jobId.
- Filters jobs by allowed countries (supports both country names and ISO codes, including "Europe" logic).
- Saves the filtered jobs to a new file.
- Returns a summary with counts of total, unique, duplicates removed, excluded by country, and total saved.

---

## 2. **Score Upwork Jobs and Add AI Remarks**
**Endpoint:** `GET /api/upwork/score`  
**Functionality:**  
- Runs a Python script to score filtered jobs using business KPIs.
- Adds AI-generated remarks to each job.
- Saves the scored jobs to a new file.
- Returns a status message and output file path.

---

## 3. **Get Final Scored Upwork Jobs**
**Endpoint:** `GET /api/upwork/final-score`  
**Functionality:**  
- Returns the full list of scored and AI-annotated jobs as a JSON array.

---

## 4. **Save Upwork Jobs to MongoDB (Bulk Save)**
**Endpoint:** `POST /api/upwork/jobs`  
**Functionality:**  
- Accepts an array (or single object) of jobs in the request body.
- Saves or updates each job in MongoDB by jobId.
- Returns a message and the count of jobs processed.

---

---

## 5. **Get Upwork Jobs by Date**
**Endpoint:** `GET /api/upwork/jobs/by-date?date=YYYY-MM-DD`  
**Functionality:**  
- Retrieves all jobs created on a specific date from MongoDB.
- Returns an array of job objects for that date.

---

## 6. **Edit a Job by jobId**
**Endpoint:** `PUT /api/upwork/jobs/:jobId`  
**Functionality:**  
- Updates a job in MongoDB by its jobId.
- Accepts fields to update in the request body.
- Returns the updated job object.

---


**All endpoints return JSON responses.  
Authentication is required for batch operations to associate jobs with the correct user.  
Filtering, scoring, and batch saving are designed to support business analytics and AI-driven workflows.**

---

Let me know if you want this in a different format or with more/less detail!

