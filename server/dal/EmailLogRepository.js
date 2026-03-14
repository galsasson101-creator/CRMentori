const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

class EmailLogRepository {
  _getCollection() {
    return mongoose.connection.db.collection('crm_email_logs');
  }

  _getTrackingCollection() {
    return mongoose.connection.db.collection('crm_email_tracking');
  }

  async create(data) {
    const now = new Date().toISOString();
    const doc = {
      id: data.id || uuidv4(),
      ...data,
      opens: data.opens || [],
      openCount: data.openCount || 0,
      clicks: data.clicks || [],
      clickCount: data.clickCount || 0,
      createdAt: data.createdAt || now,
      updatedAt: now,
    };
    await this._getCollection().insertOne(doc);
    return doc;
  }

  async getAll() {
    return await this._getCollection().find({}).toArray();
  }

  async getById(id) {
    return await this._getCollection().findOne({ id });
  }

  async getByRecipient(email) {
    return await this._getCollection().find({ to: email }).toArray();
  }

  async getByAutomation(automationId) {
    return await this._getCollection().find({ automationId }).toArray();
  }

  async getRecent(limit = 50) {
    return await this._getCollection()
      .find({})
      .sort({ sentAt: -1, createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  async getByCampaignId(campaignId) {
    return await this._getCollection().find({ campaignId }).toArray();
  }

  async update(id, data) {
    const now = new Date().toISOString();
    const result = await this._getCollection().findOneAndUpdate(
      { id },
      { $set: { ...data, updatedAt: now } },
      { returnDocument: 'after' }
    );
    return result;
  }

  async delete(id) {
    const result = await this._getCollection().deleteOne({ id });
    return result.deletedCount > 0;
  }

  /**
   * Merge tracking events from crm_email_tracking (written by limudy/Render)
   * into the email log documents.
   */
  async syncTrackingForLogs(logs) {
    if (!logs || logs.length === 0) return logs;

    const ids = logs.map(l => l.id);
    const trackingEvents = await this._getTrackingCollection()
      .find({ emailLogId: { $in: ids } })
      .toArray();

    if (trackingEvents.length === 0) return logs;

    // Group events by emailLogId
    const eventsByLog = {};
    for (const event of trackingEvents) {
      if (!eventsByLog[event.emailLogId]) eventsByLog[event.emailLogId] = [];
      eventsByLog[event.emailLogId].push(event);
    }

    // Merge into logs and update MongoDB
    for (const log of logs) {
      const events = eventsByLog[log.id];
      if (!events) continue;

      let changed = false;
      if (!log.opens) log.opens = [];
      if (!log.clicks) log.clicks = [];

      for (const event of events) {
        const eventTime = new Date(event.timestamp).toISOString();
        if (event.type === 'open') {
          if (!log.opens.includes(eventTime)) {
            log.opens.push(eventTime);
            changed = true;
          }
        } else if (event.type === 'click') {
          const exists = log.clicks.some(c => c.url === event.url && c.timestamp === eventTime);
          if (!exists) {
            log.clicks.push({ url: event.url, timestamp: eventTime });
            changed = true;
          }
        }
      }

      if (changed) {
        log.openCount = log.opens.length;
        log.clickCount = log.clicks.length;
        log.updatedAt = new Date().toISOString();
        await this._getCollection().updateOne(
          { id: log.id },
          { $set: { opens: log.opens, openCount: log.openCount, clicks: log.clicks, clickCount: log.clickCount, updatedAt: log.updatedAt } }
        );
      }
    }

    return logs;
  }

  async getRecentWithTracking(limit = 50) {
    const logs = await this.getRecent(limit);
    return await this.syncTrackingForLogs(logs);
  }

  async getByCampaignIdWithTracking(campaignId) {
    const logs = await this.getByCampaignId(campaignId);
    return await this.syncTrackingForLogs(logs);
  }
}

module.exports = new EmailLogRepository();
