const BaseRepository = require('./BaseRepository');

class DealRepository extends BaseRepository {
  constructor() {
    super('data/deals.json');
  }

  findByStage(stage) {
    return this.query(deal => deal.stage === stage);
  }

  findByOwner(ownerId) {
    return this.query(deal => deal.ownerId === ownerId);
  }
}

module.exports = DealRepository;
