I'll analyze your backend codebase to create comprehensive documentation for your frontend developer. Let me start by examining the routes and controllers to understand all the endpoints.

Ran tool
Read file: server.js
Read file: app.js
Now let me examine each route file to understand all the endpoints:

Read file: routes/auth.js
Read file: routes/users.js
Ran tool
Read file: routes/users.js
Read file: routes/companies.js
Ran tool
Read file: routes/companyJobs.js
Ran tool
Read file: routes/companyJobs.js
Read file: routes/masterJobs.js
Ran tool
Read file: routes/masterJobs.js
Read file: routes/subscriptionPlans.js
Read file: routes/upwork.js
Read file: routes/linkedin.js
Read file: routes/admin.js
Read file: middleware/auth.js
Now let me check the package.json to understand the project dependencies and base URL:

Read file: package.json
Now I have a comprehensive understanding of your backend API. Let me create detailed documentation for your frontend developer.

# Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles
- `super_admin`: Full system access
- `company_admin`: Company-level administration
- `company_user`: Regular company user

---

## 1. Authentication Routes (`/api/auth`)

### Login
**POST** `/api/auth/login`
- **Description**: Authenticate user with email/username and password
- **Body**:
  ```json
  {
    "emailOrUsername": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "username": "username",
      "email": "user@example.com",
      "role": "company_admin",
      "company": {
        "id": "company-id",
        "name": "Company Name"
      }
    }
  }
  ```

### Company Registration
**POST** `/api/auth/company-signup`
- **Description**: Register a new company with admin user
- **Body**:
  ```json
  {
    "companyName": "Company Name",
    "companyDescription": "Company description",
    "adminUsername": "admin_username",
    "adminEmail": "admin@company.com",
    "adminPassword": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Company registered successfully",
    "company": {
      "id": "company-id",
      "name": "Company Name",
      "description": "Company description"
    },
    "admin": {
      "id": "admin-id",
      "username": "admin_username",
      "email": "admin@company.com"
    }
  }
  ```

### Forgot Password
**POST** `/api/auth/forgot-password`
- **Description**: Send password reset email
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "If the email exists, a password reset link has been sent"
  }
  ```

### Reset Password
**POST** `/api/auth/reset-password`
- **Description**: Reset password using token
- **Body**:
  ```json
  {
    "token": "reset-token-from-email",
    "newPassword": "newpassword123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password reset successfully"
  }
  ```

---

## 2. User Management Routes (`/api/users`)

### Get Company Users
**GET** `/api/users`
- **Description**: Get all users in the company (Company Admin & Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  [
    {
      "id": "user-id",
      "username": "username",
      "email": "user@example.com",
      "role": "company_user",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

### Get Single User
**GET** `/api/users/:id`
- **Description**: Get specific user details (Company Admin & Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": "user-id",
    "username": "username",
    "email": "user@example.com",
    "role": "company_user",
    "isActive": true,
    "company": {
      "id": "company-id",
      "name": "Company Name"
    }
  }
  ```

### Create User
**POST** `/api/users`
- **Description**: Create new user in company (Company Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "username": "newuser",
    "email": "newuser@company.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User created successfully",
    "user": {
      "id": "user-id",
      "username": "newuser",
      "email": "newuser@company.com",
      "role": "company_user"
    }
  }
  ```

### Update User
**PUT** `/api/users/:id`
- **Description**: Update user details (Company Admin, Super Admin, or self)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "username": "updated_username",
    "email": "updated@email.com",
    "isActive": true
  }
  ```
- **Response**:
  ```json
  {
    "message": "User updated successfully"
  }
  ```

### Delete User
**DELETE** `/api/users/:id`
- **Description**: Delete user (Company Admin & Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "User deleted successfully"
  }
  ```

### Change Own Password
**POST** `/api/users/change-password`
- **Description**: Change current user's password
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password changed successfully"
  }
  ```

### Change User Password (Admin)
**POST** `/api/users/:id/change-password`
- **Description**: Change another user's password (Company Admin & Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "newPassword": "newpassword123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User password updated successfully"
  }
  ```

### Hard Reset Password
**POST** `/api/users/:id/hard-reset-password`
- **Description**: Force reset user password (Company Admin & Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Password reset successfully",
    "temporaryPassword": "temp123"
  }
  ```

---

## 3. Company Management Routes (`/api/companies`)

### Get All Companies
**GET** `/api/companies`
- **Description**: Get all companies (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  [
    {
      "id": "company-id",
      "name": "Company Name",
      "description": "Company description",
      "admin": {
        "id": "admin-id",
        "username": "admin_username",
        "email": "admin@company.com"
      }
    }
  ]
  ```

### Get Single Company
**GET** `/api/companies/:id`
- **Description**: Get specific company details
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": "company-id",
    "name": "Company Name",
    "description": "Company description",
    "admin": {
      "id": "admin-id",
      "username": "admin_username",
      "email": "admin@company.com"
    }
  }
  ```

### Create Company
**POST** `/api/companies`
- **Description**: Create new company with admin invitation (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "companyName": "New Company",
    "companyDescription": "Company description",
    "adminEmail": "admin@newcompany.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Company created successfully",
    "company": {
      "id": "company-id",
      "name": "New Company"
    },
    "temporaryPassword": "temp123"
  }
  ```

### Update Company
**PUT** `/api/companies/:id`
- **Description**: Update company details
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Updated Company Name",
    "description": "Updated description"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Company updated successfully"
  }
  ```

### Update Company Subscription
**PUT** `/api/companies/:companyId/subscription`
- **Description**: Update company subscription plan
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "subscriptionPlan": "premium",
    "jobsQuota": 1000,
    "subscriptionStatus": "active"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Subscription updated successfully"
  }
  ```

### Get Company Subscription
**GET** `/api/companies/:companyId/subscription`
- **Description**: Get company subscription details
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "subscriptionPlan": "premium",
    "jobsQuota": 1000,
    "jobsUsed": 250,
    "subscriptionStatus": "active"
  }
  ```

---

## 4. Company Jobs Routes (`/api/company-jobs`)

### Get Company Jobs
**GET** `/api/company-jobs`
- **Description**: Get all jobs for the company with filtering and pagination
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: Filter by job status
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search in job title/description
- **Response**:
  ```json
  {
    "jobs": [
      {
        "id": "job-id",
        "title": "Job Title",
        "description": "Job description",
        "currentStatus": "pending",
        "assignedTo": "user-id",
        "distributedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 10
  }
  ```

### Get User Jobs
**GET** `/api/company-jobs/user-jobs`
- **Description**: Get jobs assigned to current user
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "jobs": [
      {
        "id": "job-id",
        "title": "Job Title",
        "currentStatus": "in_progress"
      }
    ],
    "total": 25
  }
  ```

### Get Job Details
**GET** `/api/company-jobs/:jobId`
- **Description**: Get detailed information about a specific job
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": "job-id",
    "title": "Job Title",
    "description": "Job description",
    "currentStatus": "pending",
    "comments": [
      {
        "id": "comment-id",
        "text": "Comment text",
        "username": "username",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "proposal": {
      "text": "Proposal text",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Update Job Status
**PUT** `/api/company-jobs/:jobId/status`
- **Description**: Update job status
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "status": "in_progress",
    "comment": "Started working on this job"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Job status updated successfully"
  }
  ```

### Add Job Comment
**POST** `/api/company-jobs/:jobId/comments`
- **Description**: Add comment to job
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "text": "Comment text"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Comment added successfully"
  }
  ```

### Update Job Proposal
**PUT** `/api/company-jobs/:jobId/proposal`
- **Description**: Update job proposal text
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "proposalText": "Updated proposal text"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Proposal updated successfully"
  }
  ```

### Rate Job
**POST** `/api/company-jobs/:jobId/rate`
- **Description**: Rate/score a job
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "rating": 8,
    "notes": "Good job opportunity"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Job rated successfully"
  }
  ```

### Get Company Job Statistics
**GET** `/api/company-jobs/stats/overview`
- **Description**: Get job statistics for the company
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "statusBreakdown": {
      "pending": 50,
      "in_progress": 30,
      "completed": 20
    },
    "userActivity": [
      {
        "userId": "user-id",
        "username": "username",
        "statusChanges": 15,
        "lastActivity": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

---

## 5. Master Jobs Management Routes (`/api/jobadmin`)

### Upload Scored Jobs
**POST** `/api/jobadmin/upload`
- **Description**: Upload scored jobs from file (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Form data with file
- **Response**:
  ```json
  {
    "message": "Jobs uploaded successfully",
    "batchId": "batch-id",
    "jobCount": 150
  }
  ```

### Get Master Jobs
**GET** `/api/jobadmin`
- **Description**: Get master jobs with filtering (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: Filter by status
  - `page`: Page number
  - `limit`: Items per page
- **Response**:
  ```json
  {
    "jobs": [
      {
        "id": "job-id",
        "title": "Job Title",
        "score": 8.5,
        "status": "distributed"
      }
    ],
    "total": 1000,
    "page": 1
  }
  ```

### Get Job Batches
**GET** `/api/jobadmin/batches`
- **Description**: Get all job batches (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  [
    {
      "id": "batch-id",
      "name": "Batch Name",
      "jobCount": 150,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

### Get Batch Details
**GET** `/api/jobadmin/batches/:batchId`
- **Description**: Get detailed information about a batch (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": "batch-id",
    "name": "Batch Name",
    "jobCount": 150,
    "distributedJobs": 100,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
  ```

### Delete Batch
**DELETE** `/api/jobadmin/batches/:batchId`
- **Description**: Delete a job batch (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Batch deleted successfully"
  }
  ```

### Distribute Jobs from Batch
**POST** `/api/jobadmin/distribute/batch/:batchId`
- **Description**: Distribute jobs from specific batch to all active companies (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Jobs distributed successfully",
    "distributedCount": 100
  }
  ```

### Distribute Jobs to Specific Companies
**POST** `/api/jobadmin/distribute/batch/:batchId/companies`
- **Description**: Distribute jobs from batch to specific companies (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "companyIds": ["company-id-1", "company-id-2"]
  }
  ```
- **Response**:
  ```json
  {
    "message": "Jobs distributed successfully",
    "distributedCount": 50
  }
  ```

### Distribute All Undistributed Jobs
**POST** `/api/jobadmin/distribute/all`
- **Description**: Distribute all undistributed jobs to all active companies (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "All jobs distributed successfully",
    "distributedCount": 200
  }
  ```

### Distribute to Specific Companies
**POST** `/api/jobadmin/distribute/companies`
- **Description**: Distribute all undistributed jobs to specific companies (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "companyIds": ["company-id-1", "company-id-2"]
  }
  ```
- **Response**:
  ```json
  {
    "message": "Jobs distributed successfully",
    "distributedCount": 75
  }
  ```

### Get Distribution Statistics
**GET** `/api/jobadmin/distribute/stats`
- **Description**: Get job distribution statistics (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "totalJobs": 1000,
    "distributedJobs": 800,
    "undistributedJobs": 200,
    "activeCompanies": 5,
    "distributionHistory": [
      {
        "date": "2024-01-01",
        "jobsDistributed": 100
      }
    ]
  }
  ```

### Get Job Details
**GET** `/api/jobadmin/jobs/:jobId/details`
- **Description**: Get detailed information about a master job (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "job": {
      "id": "job-id",
      "title": "Job Title",
      "score": 8.5
    },
    "distributionInfo": [
      {
        "status": "pending",
        "count": 5,
        "companies": [
          {
            "name": "Company Name",
            "status": "pending"
          }
        ]
      }
    ],
    "totalDistributed": 10
  }
  ```

---

## 6. Subscription Plans Routes (`/api/subscriptions`)

### Create Subscription Plan
**POST** `/api/subscriptions/plans`
- **Description**: Create new subscription plan (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Premium Plan",
    "identifier": "premium",
    "price": 99.99,
    "jobsQuota": 1000,
    "features": ["feature1", "feature2"]
  }
  ```
- **Response**:
  ```json
  {
    "message": "Plan created successfully",
    "plan": {
      "id": "plan-id",
      "name": "Premium Plan"
    }
  }
  ```

### Get All Plans
**GET** `/api/subscriptions/plans`
- **Description**: Get all subscription plans
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  [
    {
      "id": "plan-id",
      "name": "Premium Plan",
      "identifier": "premium",
      "price": 99.99,
      "jobsQuota": 1000
    }
  ]
  ```

### Get Single Plan
**GET** `/api/subscriptions/plans/:identifier`
- **Description**: Get specific subscription plan
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": "plan-id",
    "name": "Premium Plan",
    "identifier": "premium",
    "price": 99.99,
    "jobsQuota": 1000,
    "features": ["feature1", "feature2"]
  }
  ```

### Update Plan
**PUT** `/api/subscriptions/plans/:id`
- **Description**: Update subscription plan (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Updated Premium Plan",
    "price": 149.99
  }
  ```
- **Response**:
  ```json
  {
    "message": "Plan updated successfully"
  }
  ```

### Delete Plan
**DELETE** `/api/subscriptions/plans/:id`
- **Description**: Delete subscription plan (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Plan deleted successfully"
  }
  ```

### Get Subscription Statistics
**GET** `/api/subscriptions/stats`
- **Description**: Get subscription statistics (Super Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "totalSubscriptions": 25,
    "activeSubscriptions": 20,
    "revenue": 2500.00,
    "planBreakdown": {
      "basic": 10,
      "premium": 15
    }
  }
  ```

---

## 7. Upwork Integration Routes (`/api/upwork`)

### Fetch Upwork Jobs
**GET** `/api/upwork`
- **Description**: Fetch jobs from Upwork and save as raw JSON
- **Response**:
  ```json
  {
    "message": "Jobs fetched successfully",
    "count": 150
  }
  ```

### Get Filtered Upwork Jobs
**GET** `/api/upwork/filtered`
- **Description**: Get filtered and deduplicated Upwork jobs
- **Response**:
  ```json
  {
    "jobs": [
      {
        "id": "job-id",
        "title": "Job Title",
        "description": "Job description"
      }
    ]
  }
  ```

### Score Upwork Jobs
**GET** `/api/upwork/score`
- **Description**: Run scoring and AI remarks on filtered jobs
- **Response**:
  ```json
  {
    "message": "Jobs scored successfully",
    "scoredCount": 100
  }
  ```

### Get Scored Upwork Jobs
**GET** `/api/upwork/scored`
- **Description**: Get scored jobs as JSON
- **Response**:
  ```json
  {
    "jobs": [
      {
        "id": "job-id",
        "title": "Job Title",
        "score": 8.5,
        "aiRemarks": "Good opportunity"
      }
    ]
  }
  ```

### Save Upwork Jobs
**POST** `/api/upwork/save-jobs`
- **Description**: Save jobs from file to DB for authenticated user
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Jobs saved successfully",
    "savedCount": 100
  }
  ```

### Get Upwork Jobs by Date
**GET** `/api/upwork/jobs-by-date`
- **Description**: Get jobs for user by date or date range
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `date`: Specific date (YYYY-MM-DD)
  - `startDate`: Start date for range
  - `endDate`: End date for range
- **Response**:
  ```json
  {
    "jobs": [
      {
        "id": "job-id",
        "title": "Job Title",
        "currentStatus": "pending"
      }
    ],
    "total": 50
  }
  ```

### Edit Upwork Job
**PATCH** `/api/upwork/job/:jobId`
- **Description**: Edit a job by jobId in the latest batch
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "currentStatus": "in_progress",
    "comments": "Updated comment"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Job updated successfully"
  }
  ```

### Get Upwork Job by ID
**GET** `/api/upwork/job`
- **Description**: Get a specific Upwork job by ID
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `jobId`: Job ID
- **Response**:
  ```json
  {
    "id": "job-id",
    "title": "Job Title",
    "description": "Job description",
    "currentStatus": "pending"
  }
  ```

### Generate Proposal for Upwork Job
**POST** `/api/upwork/job/:jobId/generate-proposal`
- **Description**: Generate AI proposal for Upwork job
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Proposal generated successfully",
    "proposal": "Generated proposal text"
  }
  ```

### Update Upwork Job Proposal
**PATCH** `/api/upwork/job/:jobId/proposal`
- **Description**: Update proposal text for Upwork job
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "proposalText": "Updated proposal text"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Proposal updated successfully"
  }
  ```

---

## 8. LinkedIn Integration Routes (`/api/linkedin`)

### Fetch LinkedIn Jobs
**GET** `/api/linkedin`
- **Description**: Fetch jobs from Apify and save as raw JSON
- **Response**:
  ```json
  {
    "message": "Jobs fetched successfully",
    "count": 200
  }
  ```

### Get Filtered LinkedIn Jobs
**GET** `/api/linkedin/filtered`
- **Description**: Return filtered jobs with only selected fields
- **Response**:
  ```json
  {
    "jobs": [
      {
        "id": "job-id",
        "title": "Job Title",
        "company": "Company Name"
      }
    ]
  }
  ```

### Score LinkedIn Jobs
**GET** `/api/linkedin/score`
- **Description**: Run AIML processing and return result
- **Response**:
  ```json
  {
    "message": "Jobs scored successfully",
    "scoredCount": 150
  }
  ```

### Get Scored LinkedIn Jobs
**GET** `/api/linkedin/scored`
- **Description**: Get scored jobs as JSON
- **Response**:
  ```json
  {
    "jobs": [
      {
        "id": "job-id",
        "title": "Job Title",
        "score": 8.5,
        "aiRemarks": "Good opportunity"
      }
    ]
  }
  ```

### Save LinkedIn Jobs
**POST** `/api/linkedin/save-jobs`
- **Description**: Save scored jobs from file to DB for authenticated user
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Jobs saved successfully",
    "savedCount": 150
  }
  ```

### Get LinkedIn Jobs by Date
**GET** `/api/linkedin/jobs-by-date`
- **Description**: Get jobs for user by date or date range
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `date`: Specific date (YYYY-MM-DD)
  - `startDate`: Start date for range
  - `endDate`: End date for range
- **Response**:
  ```json
  {
    "jobs": [
      {
        "id": "job-id",
        "title": "Job Title",
        "currentStatus": "pending"
      }
    ],
    "total": 75
  }
  ```

### Export LinkedIn Jobs to Excel
**GET** `/api/linkedin/jobs-by-date/excel`
- **Description**: Export jobs-by-date data to Excel
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Excel file download

### Update LinkedIn Job Status
**PATCH** `/api/linkedin/job/:jobId`
- **Description**: Update job status and comments in a user's batch
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "currentStatus": "in_progress",
    "comments": "Updated comment"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Job updated successfully"
  }
  ```

### Get LinkedIn Job by ID
**GET** `/api/linkedin/job`
- **Description**: Get a specific LinkedIn job by ID
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `jobId`: Job ID
- **Response**:
  ```json
  {
    "id": "job-id",
    "title": "Job Title",
    "description": "Job description",
    "currentStatus": "pending"
  }
  ```

### Generate Proposal for LinkedIn Job
**POST** `/api/linkedin/job/:jobId/generate-proposal`
- **Description**: Generate AI proposal for LinkedIn job
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Proposal generated successfully",
    "proposal": "Generated proposal text"
  }
  ```

### Update LinkedIn Job Proposal
**PATCH** `/api/linkedin/job/:jobId/proposal`
- **Description**: Update proposal text for LinkedIn job
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "proposalText": "Updated proposal text"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Proposal updated successfully"
  }
  ```

---

## 9. Admin Routes (`/api/admin`)

### Get LinkedIn Status History
**GET** `/api/linkedin/status-history`
- **Description**: Get LinkedIn job processing status history
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  [
    {
      "id": "history-id",
      "status": "completed",
      "jobCount": 150,
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

### Get Upwork Status History
**GET** `/api/upwork/status-history`
- **Description**: Get Upwork job processing status history
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  [
    {
      "id": "history-id",
      "status": "completed",
      "jobCount": 100,
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

### Get Combined Status History
**GET** `/api/combined/status-history`
- **Description**: Get combined status history for both LinkedIn and Upwork
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  [
    {
      "platform": "linkedin",
      "status": "completed",
      "jobCount": 150,
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "platform": "upwork",
      "status": "completed",
      "jobCount": 100,
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Server error message"
}
```

---

## Frontend Integration Tips

1. **Authentication Flow**:
   - Store JWT token in localStorage or secure cookie
   - Include token in Authorization header for all protected requests
   - Handle token expiration by redirecting to login

2. **Error Handling**:
   - Implement global error handling for API responses
   - Show user-friendly error messages
   - Handle network errors gracefully

3. **Loading States**:
   - Show loading indicators during API calls
   - Implement skeleton loading for better UX

4. **Pagination**:
   - Use the pagination parameters provided by the API
   - Implement infinite scroll or pagination controls

5. **Real-time Updates**:
   - Consider implementing WebSocket connections for real-time job updates
   - Use polling for status updates if WebSocket is not available

6. **File Uploads**:
   - Use FormData for file uploads
   - Show upload progress indicators
   - Handle upload errors appropriately

This documentation provides a comprehensive overview of all your backend API endpoints. Your frontend developer can use this to build a complete frontend application that integrates seamlessly with your backend services.