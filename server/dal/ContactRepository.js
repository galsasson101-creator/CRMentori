const BaseRepository = require('./BaseRepository');

class ContactRepository extends BaseRepository {
  constructor() {
    super('data/contacts.json');
  }
}

module.exports = ContactRepository;
