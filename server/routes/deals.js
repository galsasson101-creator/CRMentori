const express = require('express');
const router = express.Router();
const DealRepository = require('../dal/DealRepository');

const dealRepo = new DealRepository();

// GET / - list all deals, optional ?stage=&owner= query filters
router.get('/', (req, res) => {
  let deals = dealRepo.getAll();
  const { stage, owner } = req.query;

  if (stage) {
    deals = deals.filter(d => d.stage === stage);
  }
  if (owner) {
    deals = deals.filter(d => d.ownerId === owner);
  }

  res.json(deals);
});

// POST / - create deal
router.post('/', (req, res) => {
  const deal = dealRepo.create(req.body);
  res.status(201).json(deal);
});

// GET /:id - get single deal
router.get('/:id', (req, res, next) => {
  const deal = dealRepo.getById(req.params.id);
  if (!deal) {
    const err = new Error('Deal not found');
    err.statusCode = 404;
    err.error = 'Not Found';
    return next(err);
  }
  res.json(deal);
});

// PUT /:id - update deal
router.put('/:id', (req, res, next) => {
  const deal = dealRepo.update(req.params.id, req.body);
  if (!deal) {
    const err = new Error('Deal not found');
    err.statusCode = 404;
    err.error = 'Not Found';
    return next(err);
  }
  res.json(deal);
});

// DELETE /:id - delete deal
router.delete('/:id', (req, res, next) => {
  const removed = dealRepo.delete(req.params.id);
  if (!removed) {
    const err = new Error('Deal not found');
    err.statusCode = 404;
    err.error = 'Not Found';
    return next(err);
  }
  res.json({ message: 'Deal deleted', deal: removed });
});

// PATCH /:id/stage - update just the stage field
router.patch('/:id/stage', (req, res, next) => {
  const { stage } = req.body;
  if (!stage) {
    const err = new Error('Stage is required');
    err.statusCode = 400;
    err.error = 'Bad Request';
    return next(err);
  }

  let group;
  if (stage === 'closed_won') {
    group = 'closed_won';
  } else if (stage === 'closed_lost') {
    group = 'closed_lost';
  } else {
    group = 'pipeline';
  }

  const deal = dealRepo.update(req.params.id, { stage, group });
  if (!deal) {
    const err = new Error('Deal not found');
    err.statusCode = 404;
    err.error = 'Not Found';
    return next(err);
  }
  res.json(deal);
});

module.exports = router;
