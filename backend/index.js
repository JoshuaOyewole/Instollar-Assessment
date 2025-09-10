const express = require('express');
const cors = require('cors');
const helmet = require("helmet");
const bodyParser = require("body-parser");
require('dotenv').config();

// Database connection
require('./database/db');

//Routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const matchRoutes = require('./routes/matches');
const userRoutes = require('./routes/users');
const applicationRoutes = require('./routes/applications');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} Listening: http://localhost:${PORT}`);
});
