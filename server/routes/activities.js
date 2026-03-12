const express = require('express');
const router = express.Router();
const ActivityRepository = require('../dal/ActivityRepository');

const activityRepo = new ActivityRepository();

// GET / - list all activities
router.get('/', (req, res) => {
  const activities = activityRepo.getAll();
  res.json(activities);
});

// GET /:id - get single activity
router.get('/:id', (req, res, next) => {
  const activity = activityRepo.getById(req.params.id);
  if (!activity) {
    const err = new Error('Activity not found');
    err.statusCode = 404;
    err.error = 'Not Found';
    return next(err);
  }
  res.json(activity);
});

module.exports = router;
