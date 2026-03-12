const BaseRepository = require('./BaseRepository');

class EmailTemplateRepository extends BaseRepository {
  constructor() {
    super('data/emailTemplates.json');
  }

  getByName(name) {
    return this.query(t => t.name === name)[0] || null;
  }
}

module.exports = new EmailTemplateRepository();
