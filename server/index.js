require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connection');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const dealsRouter = require('./routes/deals');
const usersRouter = require('./routes/users');
const contactsRouter = require('./routes/contacts');
const tasksRouter = require('./routes/tasks');
const commsRouter = require('./routes/comms');
const activitiesRouter = require('./routes/activities');
const dashboardRouter = require('./routes/dashboard');
const emailsRouter = require('./routes/emails');
const { initScheduledCampaigns } = require('./services/campaignRunner');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use('/api/deals', dealsRouter);
app.use('/api/users', usersRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/comms', commsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/emails', emailsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`MENTORI CRM server running on http://localhost:${PORT}`);
    try {
      initScheduledCampaigns();
    } catch (err) {
      console.log('Email campaigns: SMTP not configured yet, skipping scheduler init');
    }
  });
});

module.exports = app;
