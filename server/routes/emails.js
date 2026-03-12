const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');
const emailLogRepo = require('../dal/EmailLogRepository');
const campaignRepo = require('../dal/CampaignRepository');
const templateRepo = require('../dal/EmailTemplateRepository');
const { executeCampaign, scheduleCampaign, removeSchedule } = require('../services/campaignRunner');
const { wrapInBrandedTemplate } = require('../templates/brandedEmail');
const brandSettingsRepo = require('../dal/BrandSettingsRepository');

// ── Brand Settings ──
router.get('/brand-settings', (req, res) => {
  res.json(brandSettingsRepo.get());
});

router.put('/brand-settings', (req, res) => {
  const saved = brandSettingsRepo.save(req.body);
  res.json(saved);
});

// ── SMTP Status ──
router.get('/status', async (req, res, next) => {
  try {
    const result = await emailService.verifyConnection();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── Send single email ──
router.post('/send', async (req, res, next) => {
  try {
    const { to, subject, html, text } = req.body;
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'to, subject, and html are required' });
    }
    const result = await emailService.sendEmail({ to, subject, html, text });
    emailLogRepo.create({ ...result, type: 'manual', status: 'sent' });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── Send bulk email ──
router.post('/send-bulk', async (req, res, next) => {
  try {
    const { recipients, subject, html, text } = req.body;
    if (!recipients || !subject || !html) {
      return res.status(400).json({ error: 'recipients, subject, and html are required' });
    }
    const results = await emailService.sendBulkEmails(recipients, { subject, html, text });
    for (const result of results) {
      emailLogRepo.create({ ...result, type: 'bulk' });
    }
    res.json({ sent: results.filter(r => r.status === 'sent').length, failed: results.filter(r => r.status === 'failed').length, results });
  } catch (err) {
    next(err);
  }
});

// ── Email Logs ──
router.get('/logs', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  res.json(emailLogRepo.getRecent(limit));
});

// ── Templates CRUD ──
router.get('/templates', (req, res) => {
  res.json(templateRepo.getAll());
});

router.get('/templates/:id', (req, res) => {
  const template = templateRepo.getById(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json(template);
});

router.post('/templates', (req, res) => {
  const { name, subject, html } = req.body;
  if (!name || !subject || !html) {
    return res.status(400).json({ error: 'name, subject, and html are required' });
  }
  const template = templateRepo.create(req.body);
  res.status(201).json(template);
});

router.put('/templates/:id', (req, res) => {
  const template = templateRepo.update(req.params.id, req.body);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json(template);
});

router.delete('/templates/:id', (req, res) => {
  const deleted = templateRepo.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Template not found' });
  res.status(204).end();
});

// ── Branded Email Preview ──
router.post('/preview-branded', (req, res) => {
  const { html, settings } = req.body;
  if (!html) {
    return res.status(400).json({ error: 'html is required' });
  }
  const branded = wrapInBrandedTemplate(html, settings || null);
  res.json({ html: branded });
});

// ── Campaigns CRUD ──
router.get('/campaigns', (req, res) => {
  res.json(campaignRepo.getAll());
});

router.get('/campaigns/:id', (req, res) => {
  const campaign = campaignRepo.getById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  res.json(campaign);
});

router.post('/campaigns', async (req, res, next) => {
  try {
    const { name, subject, htmlBody } = req.body;
    if (!name || !subject || !htmlBody) {
      return res.status(400).json({ error: 'name, subject, and htmlBody are required' });
    }

    const scheduleType = req.body.scheduleType || 'now';
    let status = 'draft';
    if (scheduleType === 'now') status = 'active';
    else if (scheduleType === 'scheduled') status = 'active';

    const campaign = campaignRepo.create({
      ...req.body,
      scheduleType,
      status,
      enabled: req.body.enabled !== false,
      totalSent: 0,
    });

    if (scheduleType === 'now') {
      // Execute in background — don't block the HTTP response
      executeCampaign(campaign)
        .then(result => {
          campaignRepo.update(campaign.id, {
            status: 'completed',
            lastRun: new Date().toISOString(),
          });
          console.log(`Campaign "${campaign.name}" completed: ${result.sent} sent, ${result.failed} failed`);
        })
        .catch(err => {
          campaignRepo.update(campaign.id, { status: 'failed' });
          console.error(`Campaign "${campaign.name}" failed:`, err.message);
        });
      return res.status(201).json({ ...campaign, status: 'sending' });
    }

    if (scheduleType === 'scheduled') {
      scheduleCampaign(campaign);
    }

    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
});

router.put('/campaigns/:id', (req, res) => {
  const campaign = campaignRepo.update(req.params.id, req.body);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  // Re-schedule if it's a scheduled campaign
  if (campaign.scheduleType === 'scheduled' && campaign.status === 'active') {
    scheduleCampaign(campaign);
  } else {
    removeSchedule(campaign.id);
  }
  res.json(campaign);
});

router.delete('/campaigns/:id', (req, res) => {
  removeSchedule(req.params.id);
  const deleted = campaignRepo.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Campaign not found' });
  res.status(204).end();
});

// ── Run campaign manually ──
router.post('/campaigns/:id/run', async (req, res, next) => {
  try {
    const campaign = campaignRepo.getById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    campaignRepo.update(campaign.id, { status: 'sending' });
    // Execute in background — don't block the HTTP response
    executeCampaign(campaign)
      .then(result => {
        campaignRepo.update(campaign.id, {
          status: 'completed',
          lastRun: new Date().toISOString(),
        });
        console.log(`Campaign "${campaign.name}" completed: ${result.sent} sent, ${result.failed} failed`);
      })
      .catch(err => {
        campaignRepo.update(campaign.id, { status: 'failed' });
        console.error(`Campaign "${campaign.name}" failed:`, err.message);
      });
    res.json({ message: `Campaign "${campaign.name}" is being sent` });
  } catch (err) {
    next(err);
  }
});

// ── Pause / Resume campaign ──
router.post('/campaigns/:id/pause', (req, res) => {
  const campaign = campaignRepo.getById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  removeSchedule(campaign.id);
  const updated = campaignRepo.update(campaign.id, { status: 'paused', enabled: false });
  res.json(updated);
});

router.post('/campaigns/:id/resume', (req, res) => {
  const campaign = campaignRepo.getById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  const updated = campaignRepo.update(campaign.id, { status: 'active', enabled: true });
  if (updated.scheduleType === 'scheduled') {
    scheduleCampaign(updated);
  }
  res.json(updated);
});

module.exports = router;
