const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const campaignRepo = require('../dal/CampaignRepository');
const emailLogRepo = require('../dal/EmailLogRepository');
const emailService = require('./emailService');
const UserRepository = require('../dal/UserRepository');
const { wrapInBrandedTemplate, injectTracking, wrapAllLinks } = require('../templates/brandedEmail');

const userRepo = new UserRepository();

async function resolveRecipients(campaign) {
  if (campaign.recipientMode === 'manual' && campaign.recipientIds?.length > 0) {
    const allUsers = await userRepo.getAll();
    const idSet = new Set(campaign.recipientIds);
    return allUsers.filter(u => u.email && idSet.has(u.id));
  }

  // Filter mode
  const filter = campaign.recipientFilter || 'all';

  if (filter === 'custom' && campaign.recipientEmails?.length > 0) {
    const emails = typeof campaign.recipientEmails === 'string'
      ? campaign.recipientEmails.split(',').map(e => e.trim()).filter(Boolean)
      : campaign.recipientEmails;
    return emails.map(email => ({ email, name: '' }));
  }

  const allUsers = await userRepo.getAll();
  const withEmail = allUsers.filter(u => u.email);

  if (filter === 'all') return withEmail;
  if (filter === 'tier' && campaign.recipientTier) {
    return withEmail.filter(u => u.tier === campaign.recipientTier);
  }
  if (filter === 'status' && campaign.recipientStatus) {
    return withEmail.filter(u => u.subscriptionStatus === campaign.recipientStatus);
  }

  return withEmail;
}

async function executeCampaign(campaign) {
  const recipients = await resolveRecipients(campaign);
  if (recipients.length === 0) return { sent: 0, failed: 0, results: [] };

  const brandedHtml = wrapInBrandedTemplate(campaign.htmlBody || '');
  const results = [];

  for (const recipient of recipients) {
    const to = recipient.email;
    // Generate tracking ID upfront (no file write — avoids nodemon restart)
    const emailLogId = uuidv4();

    // Inject tracking pixel and wrap links
    let trackedHtml = wrapAllLinks(brandedHtml, emailLogId);
    trackedHtml = injectTracking(trackedHtml, emailLogId);

    try {
      await emailService.sendEmail({
        to,
        subject: campaign.subject,
        html: trackedHtml,
        text: campaign.textBody,
      });
      results.push({ to, subject: campaign.subject, status: 'sent', emailLogId });
    } catch (err) {
      results.push({ to, subject: campaign.subject, status: 'failed', error: err.message, emailLogId });
    }
  }

  const sentCount = results.filter(r => r.status === 'sent').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  // Return results — caller handles persistence (after response is sent)
  return { sent: sentCount, failed: failedCount, results };
}

const scheduledJobs = new Map();

function scheduleCampaign(campaign) {
  if (scheduledJobs.has(campaign.id)) {
    scheduledJobs.get(campaign.id).stop();
  }

  if (!campaign.enabled || campaign.scheduleType !== 'scheduled' || !campaign.cronExpression) {
    return;
  }

  if (campaign.status !== 'active') return;

  if (!cron.validate(campaign.cronExpression)) {
    console.warn(`Invalid cron expression for campaign "${campaign.name}": ${campaign.cronExpression}`);
    return;
  }

  const job = cron.schedule(campaign.cronExpression, async () => {
    console.log(`Running scheduled campaign: ${campaign.name}`);
    try {
      const result = await executeCampaign(campaign);
      // Persist email logs for tracking
      for (const r of result.results) {
        emailLogRepo.create({
          id: r.emailLogId, to: r.to, subject: r.subject,
          campaignId: campaign.id, campaignName: campaign.name,
          type: 'campaign', status: r.status, error: r.error || undefined,
          sentAt: r.status === 'sent' ? new Date().toISOString() : undefined,
          opens: [], openCount: 0, clicks: [], clickCount: 0,
        });
      }
      campaignRepo.update(campaign.id, {
        lastRun: new Date().toISOString(),
        totalSent: (campaign.totalSent || 0) + result.sent,
      });
      console.log(`Scheduled campaign "${campaign.name}": ${result.sent} sent, ${result.failed} failed`);
    } catch (err) {
      console.error(`Campaign "${campaign.name}" failed:`, err.message);
    }
  });

  scheduledJobs.set(campaign.id, job);
}

function initScheduledCampaigns() {
  const campaigns = campaignRepo.getScheduled();
  for (const campaign of campaigns) {
    scheduleCampaign(campaign);
  }
  console.log(`Initialized ${campaigns.length} scheduled email campaigns`);
}

function removeSchedule(campaignId) {
  if (scheduledJobs.has(campaignId)) {
    scheduledJobs.get(campaignId).stop();
    scheduledJobs.delete(campaignId);
  }
}

module.exports = {
  executeCampaign,
  scheduleCampaign,
  initScheduledCampaigns,
  removeSchedule,
};
