const BaseRepository = require('./BaseRepository');

class CommsRepository extends BaseRepository {
  constructor() {
    super('data/comms.json');
  }

  findBySegment(tag) {
    return this.query(comm =>
      Array.isArray(comm.segmentTags) && comm.segmentTags.includes(tag)
    );
  }
}

module.exports = CommsRepository;
