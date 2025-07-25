require('dotenv').config(); // Load env variables

const app = require('./app');
const connectDB = require('./config/database');

// Import and initialize schedulers
require('./services/apifySchedulerService');
require('./services/upworkSchedulerService');

// Connect to MongoDB
connectDB();

// Use environment PORT or fallback to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}\n`);
});
