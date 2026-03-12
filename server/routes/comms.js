const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Request = require('../models/Request');
const User = require('../models/User');

// GET / - list all customer requests enriched with user email
router.get('/', async (req, res, next) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 }).lean();

    // Collect all user IDs to fetch emails
    const { ObjectId } = require('mongodb');
    const userIds = requests
      .map(r => r.fromUserId)
      .filter(Boolean)
      .map(id => {
        try { return new ObjectId(id); } catch { return null; }
      })
      .filter(Boolean);

    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = {};
    for (const u of users) {
      userMap[u._id.toString()] = { email: u.email, phone: u.phone, name: u.name };
    }

    const enriched = requests.map(r => {
      const uid = r.fromUserId ? r.fromUserId.toString() : '';
      const user = userMap[uid] || {};
      return {
        id: r._id.toString(),
        fromUserId: uid,
        fromUserName: r.fromUserName || user.name || '--',
        email: user.email || '--',
        phone: user.phone || '',
        body: r.body || '',
        status: r.status || 'open',
        priority: r.priority || 'normal',
        assignedTo: r.assignedTo || null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// PUT /:id - update request status
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!updated) {
      const err = new Error('Request not found');
      err.statusCode = 404;
      err.error = 'Not Found';
      return next(err);
    }
    res.json({ id: updated._id.toString(), ...updated });
  } catch (err) {
    next(err);
  }
});

// GET /:id - get single request
router.get('/:id', async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).lean();
    if (!request) {
      const err = new Error('Request not found');
      err.statusCode = 404;
      err.error = 'Not Found';
      return next(err);
    }
    res.json({ id: request._id.toString(), ...request });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
