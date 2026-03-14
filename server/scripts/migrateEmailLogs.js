/**
 * One-time migration: move email logs from JSON file to MongoDB.
 * Run with: node server/scripts/migrateEmailLogs.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '..', 'data', 'emailLogs.json');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const collection = db.collection('crm_email_logs');

  // Check if already migrated
  const existing = await collection.countDocuments();
  if (existing > 0) {
    console.log(`Collection already has ${existing} documents. Skipping migration.`);
    await mongoose.disconnect();
    return;
  }

  // Read JSON file
  const raw = fs.readFileSync(JSON_PATH, 'utf-8');
  const logs = JSON.parse(raw);

  if (logs.length === 0) {
    console.log('No logs to migrate.');
    await mongoose.disconnect();
    return;
  }

  // Insert all
  const result = await collection.insertMany(logs);
  console.log(`Migrated ${result.insertedCount} email logs to MongoDB (crm_email_logs)`);

  // Create indexes
  await collection.createIndex({ id: 1 }, { unique: true });
  await collection.createIndex({ campaignId: 1 });
  await collection.createIndex({ to: 1 });
  await collection.createIndex({ sentAt: -1 });
  console.log('Created indexes');

  await mongoose.disconnect();
  console.log('Done!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
