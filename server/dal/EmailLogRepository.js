const BaseRepository = require('./BaseRepository');
const mongoose = require('mongoose');

class EmailLogRepository extends BaseRepository {
  constructor() {
    super('data/emailLogs.json');
  }

  getByRecipient(email) {
    return this.query(log => log.to === email);
  }

  getByAutomation(automationId) {
    return this.query(log => log.automationId === automationId);
  }

  getRecent(limit = 50) {
    const all = this.getAll();
    return all.sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt)).slice(0, limit);
  }

  getByCampaignId(campaignId) {
    return this.query(log => log.campaignId === campaignId);
  }

  // Kept for backward compatibility (local JSON recording)
  recordOpen(emailLogId) {
    const items = this._readData();
    const index = items.findIndex(item => item.id === emailLogId);
    if (index === -1) return null;
    if (!items[index].opens) items[index].opens = [];
    items[index].opens.push(new Date().toISOString());
    items[index].openCount = items[index].opens.length;
    items[index].updatedAt = new Date().toISOString();
    this._writeData(items);
    return items[index];
  }

  recordClick(emailLogId, url) {
    const items = this._readData();
    const index = items.findIndex(item => item.id === emailLogId);
    if (index === -1) return null;
    if (!items[index].clicks) items[index].clicks = [];
    items[index].clicks.push({ url, timestamp: new Date().toISOString() });
    items[index].clickCount = items[index].clicks.length;
    items[index].updatedAt = new Date().toISOString();
    this._writeData(items);
    return items[index];
  }

  /**
   * Sync tracking data from MongoDB (crm_email_tracking collection)
   * into local email log entries. Called on-demand when stats are needed.
   */
  async syncTrackingFromMongo(emailLogIds) {
    try {
      const db = mongoose.connection.db;
      if (!db) return;

      const trackingEvents = await db.collection('crm_email_tracking')
        .find({ emailLogId: { $in: emailLogIds } })
        .toArray();

      if (trackingEvents.length === 0) return;

      const items = this._readData();
      let changed = false;

      for (const event of trackingEvents) {
        const index = items.findIndex(item => item.id === event.emailLogId);
        if (index === -1) continue;

        const log = items[index];
        const eventTime = new Date(event.timestamp).toISOString();

        if (event.type === 'open') {
          if (!log.opens) log.opens = [];
          // Avoid duplicates by checking if this exact timestamp already exists
          if (!log.opens.includes(eventTime)) {
            log.opens.push(eventTime);
            log.openCount = log.opens.length;
            changed = true;
          }
        } else if (event.type === 'click') {
          if (!log.clicks) log.clicks = [];
          const alreadyExists = log.clicks.some(
            c => c.url === event.url && c.timestamp === eventTime
          );
          if (!alreadyExists) {
            log.clicks.push({ url: event.url, timestamp: eventTime });
            log.clickCount = log.clicks.length;
            changed = true;
          }
        }

        if (changed) {
          log.updatedAt = new Date().toISOString();
        }
      }

      if (changed) {
        this._writeData(items);
      }
    } catch (err) {
      console.error('Error syncing tracking from MongoDB:', err.message);
    }
  }

  /**
   * Get campaign logs with fresh tracking data from MongoDB.
   */
  async getByCampaignIdWithTracking(campaignId) {
    const logs = this.getByCampaignId(campaignId);
    if (logs.length > 0) {
      const ids = logs.map(l => l.id);
      await this.syncTrackingFromMongo(ids);
      // Re-read after sync
      return this.getByCampaignId(campaignId);
    }
    return logs;
  }

  /**
   * Get recent logs with fresh tracking data from MongoDB.
   */
  async getRecentWithTracking(limit = 50) {
    const logs = this.getRecent(limit);
    if (logs.length > 0) {
      const ids = logs.map(l => l.id);
      await this.syncTrackingFromMongo(ids);
      return this.getRecent(limit);
    }
    return logs;
  }
}

module.exports = new EmailLogRepository();
