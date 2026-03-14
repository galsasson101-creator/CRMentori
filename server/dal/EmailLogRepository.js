const BaseRepository = require('./BaseRepository');

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
}

module.exports = new EmailLogRepository();
