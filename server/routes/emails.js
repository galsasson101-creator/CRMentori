const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const emailService = require('../services/emailService');
const emailLogRepo = require('../dal/EmailLogRepository');
const campaignRepo = require('../dal/CampaignRepository');
const templateRepo = require('../dal/EmailTemplateRepository');
const { executeCampaign, scheduleCampaign, removeSchedule } = require('../services/campaignRunner');
const { wrapInBrandedTemplate, injectTracking, wrapAllLinks } = require('../templates/brandedEmail');
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
    const emailLogId = uuidv4();
    let trackedHtml = wrapAllLinks(html, emailLogId);
    trackedHtml = injectTracking(trackedHtml, emailLogId);

    const result = await emailService.sendEmail({ to, subject, html: trackedHtml, text });

    res.json({ ...result, emailLogId });

    // Persist to MongoDB
    await emailLogRepo.create({
      id: emailLogId, to, subject, type: 'manual', status: 'sent',
      sentAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Email send error:', err.message);
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
    const results = [];
    for (const recipient of recipients) {
      const to = typeof recipient === 'string' ? recipient : recipient.email;
      const emailLogId = uuidv4();
      let trackedHtml = wrapAllLinks(html, emailLogId);
      trackedHtml = injectTracking(trackedHtml, emailLogId);
      try {
        await emailService.sendEmail({ to, subject, html: trackedHtml, text });
        results.push({ to, subject, status: 'sent', emailLogId });
      } catch (err) {
        results.push({ to, subject, status: 'failed', error: err.message, emailLogId });
      }
    }

    res.json({ sent: results.filter(r => r.status === 'sent').length, failed: results.filter(r => r.status === 'failed').length, results });

    // Persist to MongoDB
    for (const r of results) {
      await emailLogRepo.create({
        id: r.emailLogId, to: r.to, subject: r.subject, type: 'bulk',
        status: r.status, error: r.error || undefined,
        sentAt: r.status === 'sent' ? new Date().toISOString() : undefined,
      });
    }
  } catch (err) {
    next(err);
  }
});

// ── Email Logs ──
router.get('/logs', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const logs = await emailLogRepo.getRecentWithTracking(limit);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

// ── Bounced / Failed Logs ──
router.get('/logs/bounced', async (req, res, next) => {
  try {
    const logs = await emailLogRepo.getBounced();
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

// ── Global email stats (KPIs) ──
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await emailLogRepo.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// ── Email status per recipient (for users table) ──
router.get('/logs/status-by-email', async (req, res, next) => {
  try {
    const map = await emailLogRepo.getStatusByRecipient();
    res.json(map);
  } catch (err) {
    next(err);
  }
});

// ── Mark emails as bounced ──
router.post('/logs/bounced', async (req, res, next) => {
  try {
    const { emails } = req.body;
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'emails array is required' });
    }
    const result = await emailLogRepo.markAsBounced(emails);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── Auto-scan inbox for bounced NDRs ──
router.post('/logs/scan-bounces', async (req, res, next) => {
  try {
    const bouncedEmails = await emailService.fetchBouncedEmails();
    if (bouncedEmails.length === 0) {
      return res.json({ found: 0, updated: 0, emails: [] });
    }
    const result = await emailLogRepo.markAsBounced(bouncedEmails);
    res.json({ found: bouncedEmails.length, ...result, emails: bouncedEmails });
  } catch (err) {
    next(err);
  }
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

// ── Welcome Email Preview ──
router.get('/preview-welcome', (req, res) => {
  const { buildWelcomeHtml } = require('../services/welcomeEmail');
  const settings = brandSettingsRepo.get();
  const name = req.query.name || 'ישראל ישראלי';
  const html = buildWelcomeHtml(name, settings);
  res.send(html);
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

// ── Campaign stats ──
router.get('/campaigns/:id/stats', async (req, res, next) => {
  try {
    const campaign = campaignRepo.getById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const logs = await emailLogRepo.getByCampaignIdWithTracking(req.params.id);
    const totalSent = logs.filter(l => l.status === 'sent').length;
    const uniqueOpens = logs.filter(l => (l.opens || []).length > 0).length;
    const totalOpens = logs.reduce((sum, l) => sum + (l.openCount || 0), 0);
    const uniqueClicks = logs.filter(l => (l.clicks || []).length > 0).length;
    const totalClicks = logs.reduce((sum, l) => sum + (l.clickCount || 0), 0);
    const openRate = totalSent > 0 ? Math.round((uniqueOpens / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? Math.round((uniqueClicks / totalSent) * 100) : 0;

    res.json({ totalSent, uniqueOpens, totalOpens, uniqueClicks, totalClicks, openRate, clickRate });
  } catch (err) {
    next(err);
  }
});

// ── Campaign logs (per-campaign history) ──
router.get('/campaigns/:id/logs', async (req, res, next) => {
  try {
    const campaign = campaignRepo.getById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    const logs = await emailLogRepo.getByCampaignIdWithTracking(req.params.id);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

// ── Run campaign manually ──
router.post('/campaigns/:id/run', async (req, res, next) => {
  try {
    const campaign = campaignRepo.getById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    try {
      const result = await executeCampaign(campaign);

      res.json({ message: `Campaign "${campaign.name}" sent: ${result.sent} sent, ${result.failed} failed` });

      // Persist logs to MongoDB
      for (const r of result.results) {
        await emailLogRepo.create({
          id: r.emailLogId, to: r.to, subject: r.subject,
          campaignId: campaign.id, campaignName: campaign.name,
          type: 'campaign', status: r.status, error: r.error || undefined,
          sentAt: r.status === 'sent' ? new Date().toISOString() : undefined,
        });
      }
      campaignRepo.update(campaign.id, {
        status: 'completed',
        lastRun: new Date().toISOString(),
        totalSent: (campaign.totalSent || 0) + result.sent,
      });
      console.log(`Campaign "${campaign.name}" completed: ${result.sent} sent, ${result.failed} failed`);
    } catch (err) {
      console.error(`Campaign "${campaign.name}" failed:`, err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: `Campaign failed: ${err.message}` });
      }
      try { campaignRepo.update(campaign.id, { status: 'failed' }); } catch {}
    }
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
