const express = require('express');
const router = express.Router();
const emailLogRepo = require('../dal/EmailLogRepository');

// 1x1 transparent GIF (43 bytes)
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

// GET /api/tracking/pixel/:emailLogId — open tracking
router.get('/pixel/:emailLogId', (req, res) => {
  const { emailLogId } = req.params;

  // Fire-and-forget: record the open
  try { emailLogRepo.recordOpen(emailLogId); } catch (e) { /* ignore */ }

  res.set({
    'Content-Type': 'image/gif',
    'Content-Length': TRANSPARENT_GIF.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  res.end(TRANSPARENT_GIF);
});

// GET /api/tracking/click/:emailLogId — click tracking + redirect
router.get('/click/:emailLogId', (req, res) => {
  const { emailLogId } = req.params;
  const { url } = req.query;

  // Validate URL to prevent open redirect
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return res.status(400).send('Invalid URL');
  }

  // Record the click
  try { emailLogRepo.recordClick(emailLogId, url); } catch (e) { /* ignore */ }

  res.redirect(302, url);
});

module.exports = router;
