const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class BaseRepository {
  constructor(filePath) {
    this.filePath = path.resolve(__dirname, '..', filePath);
    this._ensureFile();
  }

  _ensureFile() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  _readData() {
    const raw = fs.readFileSync(this.filePath, 'utf-8');
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  _writeData(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  getAll() {
    return this._readData();
  }

  getById(id) {
    const items = this._readData();
    return items.find(item => item.id === id) || null;
  }

  create(data) {
    const items = this._readData();
    const now = new Date().toISOString();
    const newItem = {
      id: uuidv4(),
      ...data,
      createdAt: now,
      updatedAt: now
    };
    items.push(newItem);
    this._writeData(items);
    return newItem;
  }

  update(id, data) {
    const items = this._readData();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      return null;
    }
    const now = new Date().toISOString();
    items[index] = {
      ...items[index],
      ...data,
      id: items[index].id,
      createdAt: items[index].createdAt,
      updatedAt: now
    };
    this._writeData(items);
    return items[index];
  }

  delete(id) {
    const items = this._readData();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }
    const removed = items.splice(index, 1)[0];
    this._writeData(items);
    return removed;
  }

  query(filterFn) {
    const items = this._readData();
    return items.filter(filterFn);
  }
}

module.exports = BaseRepository;
