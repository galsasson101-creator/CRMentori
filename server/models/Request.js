const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    collection: 'requests',
  }
);

requestSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

module.exports = mongoose.model('Request', requestSchema);
