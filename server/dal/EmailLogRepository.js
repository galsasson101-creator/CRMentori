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
    return all.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)).slice(0, limit);
  }
}

module.exports = new EmailLogRepository();
