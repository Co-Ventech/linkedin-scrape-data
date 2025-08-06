

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const linkedinRoutes = require('./routes/linkedin');
const upworkRoutes = require('./routes/upwork');
const statusHistoryRoutes = require('./routes/admin');


const app = express();

// Middleware
app.use(cors({
    origin: '*'
}));
app.use(express.json());


app.use('/api', authRoutes);  // Your existing auth routes

app.use('/api', upworkRoutes);

app.use('/api', linkedinRoutes) ;
app.use('/api', statusHistoryRoutes);

app.use(errorHandler);


module.exports = app;
