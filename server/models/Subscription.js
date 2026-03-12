const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    collection: 'subscriptions',
  }
);

subscriptionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
