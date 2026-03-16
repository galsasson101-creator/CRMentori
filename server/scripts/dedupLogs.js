/**
 * Remove duplicate email logs (keep earliest per to+campaignId).
 * Usage:
 *   node server/scripts/dedupLogs.js --dry-run
 *   node server/scripts/dedupLogs.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const DRY_RUN = process.argv.includes('--dry-run');

(async () => {
  if (DRY_RUN) console.log('=== DRY RUN ===\n');

  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('crm_email_logs');

  const before = await col.countDocuments({});
  console.log(`Total logs before: ${before}`);

  // Use aggregation to find _ids to keep (earliest per to+campaignId)
  const keepers = await col.aggregate([
    { $sort: { createdAt: 1 } },
    { $group: { _id: { to: '$to', campaignId: '$campaignId' }, keepId: { $first: '$_id' } } },
  ]).toArray();

  const keepIds = new Set(keepers.map(k => k.keepId.toString()));
  console.log(`Unique (to+campaignId) groups: ${keepIds.size}`);
  console.log(`Duplicates to remove: ${before - keepIds.size}`);

  if (!DRY_RUN && before > keepIds.size) {
    // Get all _ids, then delete those not in keepIds
    const allDocs = await col.find({}, { projection: { _id: 1 } }).toArray();
    const deleteIds = allDocs.filter(d => !keepIds.has(d._id.toString())).map(d => d._id);

    const result = await col.deleteMany({ _id: { $in: deleteIds } });
    console.log(`Deleted: ${result.deletedCount}`);
  }

  const after = await col.countDocuments({});
  console.log(`Total logs after: ${after}`);

  await mongoose.disconnect();
  console.log('Done!');
})();
