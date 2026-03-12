const express = require('express');
const router = express.Router();
const TaskRepository = require('../dal/TaskRepository');

const taskRepo = new TaskRepository();

// GET / - list all, ?status=&assignee= filters
router.get('/', (req, res) => {
  let tasks = taskRepo.getAll();
  const { status, assignee } = req.query;

  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }
  if (assignee) {
    tasks = tasks.filter(t => t.assigneeId === assignee);
  }

  res.json(tasks);
});

// POST / - create task
router.post('/', (req, res) => {
  const task = taskRepo.create(req.body);
  res.status(201).json(task);
});

// GET /:id - get single task
router.get('/:id', (req, res, next) => {
  const task = taskRepo.getById(req.params.id);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    err.error = 'Not Found';
    return next(err);
  }
  res.json(task);
});

// PUT /:id - update task
router.put('/:id', (req, res, next) => {
  const task = taskRepo.update(req.params.id, req.body);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    err.error = 'Not Found';
    return next(err);
  }
  res.json(task);
});

// DELETE /:id - delete task
router.delete('/:id', (req, res, next) => {
  const removed = taskRepo.delete(req.params.id);
  if (!removed) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    err.error = 'Not Found';
    return next(err);
  }
  res.json({ message: 'Task deleted', task: removed });
});

// PATCH /:id/status - update just the status
router.patch('/:id/status', (req, res, next) => {
  const { status } = req.body;
  if (!status) {
    const err = new Error('Status is required');
    err.statusCode = 400;
    err.error = 'Bad Request';
    return next(err);
  }
  const task = taskRepo.update(req.params.id, { status });
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    err.error = 'Not Found';
    return next(err);
  }
  res.json(task);
});

module.exports = router;
