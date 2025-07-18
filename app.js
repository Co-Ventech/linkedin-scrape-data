

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const apify = require('./routes/apify');
// const { startApifyScheduler } = require('./services/apifySchedulerService');
// const apifySchedulerRoutes = require('./routes/apifyScheduler');
const upworkRoutes = require('./routes/upwork');



const app = express();

// Middleware
app.use(cors());
app.use(express.json());



// Start the Apify scheduler
// startApifyScheduler();

// Use the scheduler route
// app.use('/api', apifySchedulerRoutes);

// ... rest of your app.js code (other routes, server listen, etc.) ...

app.use('/api', authRoutes);  // Your existing auth routes


app.use('/api', upworkRoutes);

app.use('/api', apify) ;

// added comment for review

// Error handling
app.use(errorHandler);


module.exports = app;
