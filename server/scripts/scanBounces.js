/**
 * Scan Outlook inbox for bounced emails and update CRM data.
 *
 * Usage:
 *   node server/scripts/scanBounces.js --dry-run   # preview without changes
 *   node server/scripts/scanBounces.js              # run for real
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { fetchBouncedEmails } = require('../services/emailService');

const CAMPAIGNS_PATH = path.join(__dirname, '..', 'data', 'campaigns.json');
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  if (DRY_RUN) console.log('=== DRY RUN MODE — no changes will be made ===\n');

  // 1. Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;
  const collection = db.collection('crm_email_logs');

  // 2. Scan Outlook inbox for bounced emails
  console.log('\nScanning Outlook inbox for NDR messages...');
  const bouncedEmails = await fetchBouncedEmails();
  console.log(`Found ${bouncedEmails.length} bounced email addresses`);

  if (bouncedEmails.length === 0) {
    console.log('No bounced emails found. Exiting.');
    await mongoose.disconnect();
    return;
  }

  // Show samples
  console.log('\nSample bounced addresses (first 10):');
  bouncedEmails.slice(0, 10).forEach(e => console.log(`  - ${e}`));

  // 3. Build a Set for fast case-insensitive lookup
  const bouncedSet = new Set(bouncedEmails.map(e => e.toLowerCase()));

  // 4. Fetch all campaign logs with status 'sent'
  const sentLogs = await collection.find({ status: 'sent' }).toArray();
  console.log(`\nFound ${sentLogs.length} email logs with status 'sent'`);

  // 5. In-memory case-insensitive matching for campaign logs
  const campaignMatched = [];
  const nonCampaignMatched = [];

  for (const log of sentLogs) {
    if (!log.to) continue;
    const lower = log.to.toLowerCase();
    if (bouncedSet.has(lower)) {
      if (log.campaignId) {
        campaignMatched.push(log);
      } else {
        nonCampaignMatched.push(log);
      }
    }
  }

  console.log(`\nMatched ${campaignMatched.length} campaign logs as bounced`);
  console.log(`Matched ${nonCampaignMatched.length} non-campaign logs as bounced`);

  const allMatched = [...campaignMatched, ...nonCampaignMatched];

  // Show samples of matched
  if (campaignMatched.length > 0) {
    console.log('\nSample matched campaign logs (first 5):');
    campaignMatched.slice(0, 5).forEach(l =>
      console.log(`  - ${l.to} (campaign: ${l.campaignId}, id: ${l.id})`)
    );
  }

  // 6. Update matched logs to status 'bounced' by id
  if (!DRY_RUN && allMatched.length > 0) {
    const ids = allMatched.map(l => l.id);
    const result = await collection.updateMany(
      { id: { $in: ids } },
      { $set: { status: 'bounced', updatedAt: new Date().toISOString() } }
    );
    console.log(`\nUpdated ${result.modifiedCount} logs to 'bounced' in MongoDB`);
  } else if (DRY_RUN) {
    console.log(`\n[DRY RUN] Would update ${allMatched.length} logs to 'bounced'`);
  }

  // 7. Update campaigns.json with totalBounced
  const campaigns = JSON.parse(fs.readFileSync(CAMPAIGNS_PATH, 'utf-8'));
  let campaignsUpdated = false;

  // Count bounced per campaign
  const bouncedByCampaign = {};
  for (const log of campaignMatched) {
    bouncedByCampaign[log.campaignId] = (bouncedByCampaign[log.campaignId] || 0) + 1;
  }

  for (const campaign of campaigns) {
    const bounced = bouncedByCampaign[campaign.id] || 0;
    if (bounced > 0) {
      console.log(`\nCampaign "${campaign.name}" (${campaign.id}):`);
      console.log(`  totalSent (attempted): ${campaign.totalSent}`);
      console.log(`  totalBounced: ${bounced}`);
      campaign.totalBounced = bounced;
      campaignsUpdated = true;
    }
  }

  if (!DRY_RUN && campaignsUpdated) {
    fs.writeFileSync(CAMPAIGNS_PATH, JSON.stringify(campaigns, null, 2) + '\n');
    console.log('\nUpdated campaigns.json');
  } else if (DRY_RUN && campaignsUpdated) {
    console.log('\n[DRY RUN] Would update campaigns.json');
  }

  // 8. Summary report
  console.log('\n=== SUMMARY ===');
  console.log(`Bounced addresses found in inbox: ${bouncedEmails.length}`);
  console.log(`Campaign logs matched as bounced: ${campaignMatched.length}`);
  console.log(`Non-campaign logs matched as bounced: ${nonCampaignMatched.length}`);
  console.log(`Total logs updated: ${allMatched.length}`);
  if (DRY_RUN) console.log('\n(No changes made — run without --dry-run to apply)');

  await mongoose.disconnect();
  console.log('\nDone!');
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
