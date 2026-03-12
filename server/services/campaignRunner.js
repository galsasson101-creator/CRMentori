const cron = require('node-cron');
const campaignRepo = require('../dal/CampaignRepository');
const emailLogRepo = require('../dal/EmailLogRepository');
const emailService = require('./emailService');
const UserRepository = require('../dal/UserRepository');
const { wrapInBrandedTemplate } = require('../templates/brandedEmail');

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
    return campaign.recipientEmails.map(email => ({ email, name: '' }));
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
  if (recipients.length === 0) return { sent: 0, failed: 0 };

  const brandedHtml = wrapInBrandedTemplate(campaign.htmlBody || '');

  const results = await emailService.sendBulkEmails(recipients, {
    subject: campaign.subject,
    html: brandedHtml,
    text: campaign.textBody,
  });

  for (const result of results) {
    emailLogRepo.create({
      ...result,
      campaignId: campaign.id,
      campaignName: campaign.name,
      type: 'campaign',
    });
  }

  const sentCount = results.filter(r => r.status === 'sent').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  campaignRepo.update(campaign.id, {
    lastRun: new Date().toISOString(),
    totalSent: (campaign.totalSent || 0) + sentCount,
  });

  return { sent: sentCount, failed: failedCount };
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

  const job = cron.schedule(campaign.cronExpression, () => {
    console.log(`Running scheduled campaign: ${campaign.name}`);
    executeCampaign(campaign).catch(err => {
      console.error(`Campaign "${campaign.name}" failed:`, err.message);
    });
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
