

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
// const authRoutes = require('./routes/authRoutes');
const linkedinRoutes = require('./routes/linkedin');
const upworkRoutes = require('./routes/upwork');
// const statusHistoryRoutes = require('./routes/admin');
const authRoutesnew = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const userRoutes = require('./routes/users');
const masterJobRoutes = require('./routes/masterJobs'); // Add this line
const subscriptionPlanRoutes = require('./routes/subscriptionPlans'); // Add this
const companyJobRoutes = require('./routes/companyJobs');
const companypipeline = require('./routes/pipeline');
const upworkSchedulerRoutes = require('./services/upworkSchedulerService');
const googleRoutes = require('./routes/google');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies


// app.use(express.static('public'));
app.use('/api/auth', authRoutesnew);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobadmin', masterJobRoutes); // Add this line
app.use('/api/subscriptions', subscriptionPlanRoutes); // Add this
app.use('/api/company-jobs', companyJobRoutes);
app.use('/api/upwork-scheduler', upworkSchedulerRoutes);
app.use('/api/company-pipeline', companypipeline);
app.use('/api/google', googleRoutes);
// app.use('/api', authRoutes);  // Your existing auth routes

app.use('/api', upworkRoutes);

app.use('/api', linkedinRoutes) ;
// app.use('/api', statusHistoryRoutes);

// app.use('/api', masterJobRoutes);

app.use(errorHandler);

 
module.exports = app;
