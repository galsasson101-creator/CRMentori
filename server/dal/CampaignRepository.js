const BaseRepository = require('./BaseRepository');

class CampaignRepository extends BaseRepository {
  constructor() {
    super('data/campaigns.json');
  }

  getActive() {
    return this.query(c => c.status === 'active' && c.enabled);
  }

  getScheduled() {
    return this.query(c => c.scheduleType === 'scheduled' && c.status === 'active');
  }

  getByStatus(status) {
    return this.query(c => c.status === status);
  }
}

module.exports = new CampaignRepository();
