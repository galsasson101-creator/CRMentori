const express = require('express');
const router = express.Router();
const UserRepository = require('../dal/UserRepository');
const ActivityRepository = require('../dal/ActivityRepository');

const userRepo = new UserRepository();
const activityRepo = new ActivityRepository();

// GET / - list all, ?status=&course=&search= filters
router.get('/', async (req, res, next) => {
  try {
    let users;
    const { status, course, search } = req.query;

    if (search) {
      users = await userRepo.search(search);
    } else if (course) {
      users = await userRepo.findByCourse(course);
    } else if (status) {
      users = await userRepo.findByStatus(status);
    } else {
      users = await userRepo.getAll();
    }

    res.json(users);
  } catch (err) {
    next(err);
  }
});

// POST / - create user
router.post('/', async (req, res, next) => {
  try {
    const user = await userRepo.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// GET /:id - get user
router.get('/:id', async (req, res, next) => {
  try {
    const user = await userRepo.getById(req.params.id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.error = 'Not Found';
      return next(err);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /:id - update user
router.put('/:id', async (req, res, next) => {
  try {
    const user = await userRepo.update(req.params.id, req.body);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.error = 'Not Found';
      return next(err);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /:id/activities - get activities for user
router.get('/:id/activities', async (req, res, next) => {
  try {
    const user = await userRepo.getById(req.params.id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.error = 'Not Found';
      return next(err);
    }
    const activities = activityRepo.findByUser(req.params.id);
    res.json(activities);
  } catch (err) {
    next(err);
  }
});

// POST /:id/activities - create activity for user
router.post('/:id/activities', async (req, res, next) => {
  try {
    const user = await userRepo.getById(req.params.id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.error = 'Not Found';
      return next(err);
    }
    const activity = activityRepo.create({
      ...req.body,
      userId: req.params.id,
      timestamp: req.body.timestamp || new Date().toISOString()
    });
    res.status(201).json(activity);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
