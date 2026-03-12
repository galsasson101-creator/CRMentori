const express = require('express');
const router = express.Router();
const ContactRepository = require('../dal/ContactRepository');

const contactRepo = new ContactRepository();

// GET / - list all contacts
router.get('/', (req, res) => {
  const contacts = contactRepo.getAll();
  res.json(contacts);
});

// POST / - create contact
router.post('/', (req, res) => {
  const contact = contactRepo.create(req.body);
  res.status(201).json(contact);
});

// GET /:id - get single contact
router.get('/:id', (req, res, next) => {
  const contact = contactRepo.getById(req.params.id);
  if (!contact) {
    const err = new Error('Contact not found');
    err.statusCode = 404;
    err.error = 'Not Found';
    return next(err);
  }
  res.json(contact);
});

// PUT /:id - update contact
router.put('/:id', (req, res, next) => {
  const contact = contactRepo.update(req.params.id, req.body);
  if (!contact) {
    const err = new Error('Contact not found');
    err.statusCode = 404;
    err.error = 'Not Found';
    return next(err);
  }
  res.json(contact);
});

// DELETE /:id - delete contact
router.delete('/:id', (req, res, next) => {
  const removed = contactRepo.delete(req.params.id);
  if (!removed) {
    const err = new Error('Contact not found');
    err.statusCode = 404;
    err.error = 'Not Found';
    return next(err);
  }
  res.json({ message: 'Contact deleted', contact: removed });
});

module.exports = router;
