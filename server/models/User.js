const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    googleId: String,
    password: String,
    phone: String,
    new: Boolean,
    free: Boolean,
    emailVerified: Boolean,
    videoWatched: mongoose.Schema.Types.Mixed,
    personalQ: mongoose.Schema.Types.Mixed,
    courses: [String],
    paidCourses: [String],
    answers: mongoose.Schema.Types.Mixed,
    termsAccepted: mongoose.Schema.Types.Mixed,
    termsAcceptedAt: String,
    marketingConsent: Boolean,
    marketingConsentAt: String,
    englishSelections: mongoose.Schema.Types.Mixed,
    mathSelections: mongoose.Schema.Types.Mixed,
    lastTab: mongoose.Schema.Types.Mixed,
    idSubscription: String,
    subscriptionUpdatedAt: String,
    subscriptionCancelledAt: String,
    typeOf: String,
    paidCoursesUpdatedAt: String,
    lastLoginAt: String,
    studyTime: mongoose.Schema.Types.Mixed,
  },
  {
    strict: false, // Allow extra fields not defined in schema
    collection: 'users',
  }
);

// Map _id to id in JSON output so the client keeps working
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

module.exports = mongoose.model('User', userSchema);
