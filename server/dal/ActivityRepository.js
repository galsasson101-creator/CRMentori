const BaseRepository = require('./BaseRepository');

class ActivityRepository extends BaseRepository {
  constructor() {
    super('data/activities.json');
  }

  findByUser(userId) {
    const items = this.query(activity => activity.userId === userId);
    return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

module.exports = ActivityRepository;
