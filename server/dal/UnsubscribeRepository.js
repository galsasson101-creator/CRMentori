const BaseRepository = require('./BaseRepository');

class UnsubscribeRepository extends BaseRepository {
  constructor() {
    super('data/unsubscribes.json');
  }

  isUnsubscribed(email) {
    const items = this._readData();
    return items.some(item => item.email === email.toLowerCase());
  }

  addEmail(email) {
    const lower = email.toLowerCase();
    if (this.isUnsubscribed(lower)) return null;
    return this.create({ email: lower });
  }

  getUnsubscribedEmails() {
    return this._readData().map(item => item.email);
  }
}

module.exports = new UnsubscribeRepository();
