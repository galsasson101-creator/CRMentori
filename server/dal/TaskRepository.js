const BaseRepository = require('./BaseRepository');

class TaskRepository extends BaseRepository {
  constructor() {
    super('data/tasks.json');
  }

  findByStatus(status) {
    return this.query(task => task.status === status);
  }

  findByAssignee(assigneeId) {
    return this.query(task => task.assigneeId === assigneeId);
  }
}

module.exports = TaskRepository;
