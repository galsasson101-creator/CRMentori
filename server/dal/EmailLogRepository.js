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

  async getFailed() {
    return await this._getCollection()
      .find({ status: 'failed' })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async getBounced() {
    return await this._getCollection()
      .find({ status: { $in: ['failed', 'bounced'] } })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async markAsBounced(emails) {
    const normalized = emails.map(e => e.trim().toLowerCase());
    const result = await this._getCollection().updateMany(
      { to: { $in: normalized } },
      { $set: { status: 'bounced', updatedAt: new Date().toISOString() } },
      { collation: { locale: 'en', strength: 2 } }
    );
    return { matched: result.matchedCount, updated: result.modifiedCount };
  }

  async getStats() {
    const col = this._getCollection();
    const [sent, failed, bounced, total] = await Promise.all([
      col.countDocuments({ status: 'sent' }),
      col.countDocuments({ status: 'failed' }),
      col.countDocuments({ status: 'bounced' }),
      col.countDocuments({}),
    ]);
    const openedCount = await col.countDocuments({ status: 'sent', openCount: { $gt: 0 } });
    const clickedCount = await col.countDocuments({ status: 'sent', clickCount: { $gt: 0 } });
    const openRate = sent > 0 ? Math.round((openedCount / sent) * 100) : 0;
    const clickRate = sent > 0 ? Math.round((clickedCount / sent) * 100) : 0;
    return { sent, failed, bounced, total, openRate, clickRate };
  }

  async getStatusByRecipient() {
    const logs = await this._getCollection()
      .find({}, { projection: { to: 1, status: 1, sentAt: 1, createdAt: 1 } })
      .sort({ sentAt: -1, createdAt: -1 })
      .toArray();

    // Keep the worst status per email (bounced > failed > sent)
    const statusPriority = { bounced: 3, failed: 2, sent: 1 };
    const map = {};
    for (const log of logs) {
      if (!log.to) continue;
      const key = log.to.toLowerCase();
      const existing = map[key];
      const priority = statusPriority[log.status] || 0;
      if (!existing || priority > (statusPriority[existing] || 0)) {
        map[key] = log.status;
      }
    }
    return map;
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
