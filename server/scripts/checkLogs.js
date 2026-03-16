require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('crm_email_logs');

  const total = await col.countDocuments({});
  const sent = await col.countDocuments({ status: 'sent' });
  const failed = await col.countDocuments({ status: 'failed' });
  const bounced = await col.countDocuments({ status: 'bounced' });

  // Count by campaignId
  const byCampaign = await col.aggregate([
    { $group: { _id: '$campaignId', count: { $sum: 1 } } }
  ]).toArray();

  // Check for duplicates (same to + same campaignId)
  const dupes = await col.aggregate([
    { $group: { _id: { to: '$to', campaignId: '$campaignId' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]).toArray();

  const dupeTotal = await col.aggregate([
    { $group: { _id: { to: '$to', campaignId: '$campaignId' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $group: { _id: null, totalDupeGroups: { $sum: 1 }, totalExtraRows: { $sum: { $subtract: ['$count', 1] } } } }
  ]).toArray();

  console.log('Total:', total);
  console.log('Sent:', sent, '| Failed:', failed, '| Bounced:', bounced);
  console.log('\nBy campaignId:');
  byCampaign.forEach(r => console.log(`  ${r._id || '(no campaign)'}: ${r.count}`));
  console.log('\nDuplicate groups (same to+campaignId), top 10:');
  dupes.forEach(r => console.log(`  ${r._id.to} / ${r._id.campaignId}: ${r.count}x`));
  console.log('\nDuplicate summary:', dupeTotal[0] || 'none');

  await mongoose.disconnect();
})();
