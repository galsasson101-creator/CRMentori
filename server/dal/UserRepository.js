const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

class UserRepository {
  // Get raw db reference for collections without models
  _db() {
    return mongoose.connection.client.db('users');
  }

  // Convert string id to ObjectId for raw collection queries
  _oid(id) {
    try { return new ObjectId(id); } catch { return id; }
  }

  async getAll() {
    const [users, subscriptions, payments] = await Promise.all([
      User.find().lean(),
      Subscription.find().lean(),
      this._db().collection('payments').find().toArray(),
    ]);

    // Index subscriptions by userId (keep latest per user)
    const subMap = {};
    for (const sub of subscriptions) {
      const uid = sub.userId ? sub.userId.toString() : '';
      if (!uid) continue;
      if (!subMap[uid] || new Date(sub.createdAt) > new Date(subMap[uid].createdAt)) {
        subMap[uid] = sub;
      }
    }

    // Sum payments by userId
    const payMap = {};
    for (const p of payments) {
      const uid = p.userId ? p.userId.toString() : '';
      if (!uid) continue;
      if (!payMap[uid]) payMap[uid] = { total: 0, count: 0 };
      payMap[uid].total += p.amount || 0;
      payMap[uid].count++;
    }

    return users.map(u => {
      const uid = u._id.toString();
      return this._enrich(u, subMap[uid], payMap[uid]);
    });
  }

  async getById(id) {
    const user = await User.findById(id).lean();
    if (!user) return null;

    const uid = id.toString();
    const oid = this._oid(uid);
    const db = this._db();

    // Collections use mixed types for userId (ObjectId or string), query both
    const uidQuery = { $or: [{ userId: oid }, { userId: uid }] };

    const [sub, allSubs, payments, topicProgress, answers, learningPlans, usageLimits, notes, teachingProgress] = await Promise.all([
      Subscription.findOne({ $or: [{ userId: oid }, { userId: uid }] }).sort({ createdAt: -1 }).lean(),
      Subscription.find({ $or: [{ userId: oid }, { userId: uid }] }).sort({ createdAt: -1 }).lean(),
      db.collection('payments').find(uidQuery).toArray(),
      db.collection('user_topic_progress').find(uidQuery).toArray(),
      db.collection('user-answers').find(uidQuery).toArray(),
      db.collection('learning-plans').find(uidQuery).toArray(),
      db.collection('users-limits').findOne(uidQuery),
      db.collection('user-notes').find(uidQuery).toArray(),
      db.collection('teaching-progress').find(uidQuery).toArray(),
    ]);

    const payInfo = { total: 0, count: 0 };
    for (const p of payments) {
      payInfo.total += p.amount || 0;
      payInfo.count++;
    }

    const enriched = this._enrich(user, sub, payInfo);

    // Payment history
    enriched.paymentHistory = payments.map(p => ({
      id: p._id.toString(),
      amount: p.amount,
      planName: p.planName,
      type: p.type,
      status: p.status,
      completedAt: p.completedAt,
      availableUntil: p.availableUntil,
    }));

    // Subscription history
    enriched.subscriptionHistory = allSubs.map(s => ({
      id: s._id.toString(),
      planName: s.planName,
      planType: s.planType,
      amount: s.amount,
      planPrice: s.planPrice,
      isActive: s.isActive,
      status: s.status,
      createdAt: s.createdAt,
      cancelledAt: s.cancelledAt,
      lastPayment: s.lastPayment,
      cardSuffix: s.cardSuffix,
      cardBrand: s.cardBrand,
      payerPhone: s.payerPhone,
      payerEmail: s.payerEmail,
      fullName: s.fullName,
    }));

    // Topic progress: per course stats
    const courseProgress = {};
    for (const tp of topicProgress) {
      const course = tp.course || 'unknown';
      if (!courseProgress[course]) courseProgress[course] = { total: 0, done: 0 };
      courseProgress[course].total++;
      if (tp.status === 'done') courseProgress[course].done++;
    }
    enriched.courseProgress = Object.entries(courseProgress).map(([course, stats]) => ({
      course,
      topicsCompleted: stats.done,
      topicsTotal: stats.total,
      percentage: stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0,
    }));

    // Answers: per course stats
    const answerStats = {};
    let totalAnswers = 0;
    let totalCorrect = 0;
    for (const a of answers) {
      const course = a.course || 'unknown';
      if (!answerStats[course]) answerStats[course] = { total: 0, correct: 0 };
      const courseAnswers = a.answers || [];
      for (const ans of courseAnswers) {
        answerStats[course].total++;
        totalAnswers++;
        if (ans.isCorrect) {
          answerStats[course].correct++;
          totalCorrect++;
        }
      }
    }
    enriched.answerStats = {
      totalAnswers,
      totalCorrect,
      accuracy: totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0,
      byCourse: Object.entries(answerStats).map(([course, stats]) => ({
        course,
        totalAnswers: stats.total,
        correct: stats.correct,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      })),
    };

    // Learning plans
    enriched.learningPlans = learningPlans.map(lp => ({
      id: lp._id.toString(),
      courseName: lp.plan?.courseName || lp.courseName,
      totalDays: lp.plan?.totalDays,
      dailyStudyTime: lp.plan?.dailyStudyTime,
      testDate: lp.plan?.testDate,
      createdAt: lp.updatedAt || lp.createdAt,
    }));

    // AI usage
    if (usageLimits && usageLimits.usage) {
      enriched.aiUsage = {
        humanitiesQuestions: usageLimits.usage.open_ai_q_humanities || 0,
        buddyQuestions: usageLimits.usage.buddy_q || 0,
        videoAiHumanities: usageLimits.usage.video_ai_q_humanities || 0,
        videoAiMath: usageLimits.usage.video_ai_q_math || 0,
        podcastListens: usageLimits.usage.podcast_listen || 0,
        totalAiInteractions:
          (usageLimits.usage.open_ai_q_humanities || 0) +
          (usageLimits.usage.buddy_q || 0) +
          (usageLimits.usage.video_ai_q_humanities || 0) +
          (usageLimits.usage.video_ai_q_math || 0),
      };
    }

    // Notes count
    enriched.notesCount = notes.length;

    // Teaching progress (AI teacher sessions)
    enriched.aiTeacherSessions = teachingProgress.length;

    return enriched;
  }

  async search(query) {
    const regex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }]
    }).lean();

    const [subscriptions, payments] = await Promise.all([
      Subscription.find().lean(),
      this._db().collection('payments').find().toArray(),
    ]);

    const subMap = {};
    for (const sub of subscriptions) {
      const uid = sub.userId ? sub.userId.toString() : '';
      if (!uid) continue;
      if (!subMap[uid] || new Date(sub.createdAt) > new Date(subMap[uid].createdAt)) {
        subMap[uid] = sub;
      }
    }

    const payMap = {};
    for (const p of payments) {
      const uid = p.userId ? p.userId.toString() : '';
      if (!uid) continue;
      if (!payMap[uid]) payMap[uid] = { total: 0, count: 0 };
      payMap[uid].total += p.amount || 0;
      payMap[uid].count++;
    }

    return users.map(u => {
      const uid = u._id.toString();
      return this._enrich(u, subMap[uid], payMap[uid]);
    });
  }

  async findByStatus(status) {
    const all = await this.getAll();
    return all.filter(u => u.subscriptionStatus === status);
  }

  async findByCourse(course) {
    const users = await User.find({ courses: course }).lean();

    const [subscriptions, payments] = await Promise.all([
      Subscription.find().lean(),
      this._db().collection('payments').find().toArray(),
    ]);

    const subMap = {};
    for (const sub of subscriptions) {
      const uid = sub.userId ? sub.userId.toString() : '';
      if (!uid) continue;
      if (!subMap[uid] || new Date(sub.createdAt) > new Date(subMap[uid].createdAt)) {
        subMap[uid] = sub;
      }
    }

    const payMap = {};
    for (const p of payments) {
      const uid = p.userId ? p.userId.toString() : '';
      if (!uid) continue;
      if (!payMap[uid]) payMap[uid] = { total: 0, count: 0 };
      payMap[uid].total += p.amount || 0;
      payMap[uid].count++;
    }

    return users.map(u => {
      const uid = u._id.toString();
      return this._enrich(u, subMap[uid], payMap[uid]);
    });
  }

  // Enrich a user doc with subscription + payment derived CRM fields
  _enrich(user, sub, payInfo) {
    const id = user._id.toString();
    const { _id, __v, password, ...rest } = user;

    let tier = 'free';
    let subscriptionStatus = 'free';
    let mrr = 0;
    let nextBillingDate = null;
    let billingCycle = null;
    let convertedDate = null;
    let churnedDate = null;

    if (sub) {
      const planType = (sub.planType || '').toUpperCase();
      if (planType === 'PRO') tier = 'pro';
      else if (planType === 'BASIC') tier = 'basic';
      else tier = 'basic';

      if (sub.cancelledAt) {
        subscriptionStatus = 'cancelled';
        churnedDate = sub.cancelledAt;
      } else if (sub.isActive) {
        subscriptionStatus = 'active';
      } else {
        subscriptionStatus = 'cancelled';
      }

      // Default to 79 ILS for subscribers without specific payment info
      const monthlyRate = sub.amount || sub.planPrice || 79;

      if (subscriptionStatus === 'active') {
        mrr = monthlyRate;
      }

      if (subscriptionStatus === 'active' && sub.lastPayment) {
        const last = new Date(sub.lastPayment);
        nextBillingDate = new Date(last.getFullYear(), last.getMonth() + 1, last.getDate()).toISOString();
      }

      billingCycle = 'monthly';
      convertedDate = sub.completedAt || sub.createdAt;
    }

    // LTV = number of months subscribed
    // Total Paid = (months * monthly rate) + one-time payments
    const paymentsTotal = payInfo ? payInfo.total : 0;
    let ltvMonths = 0;
    let subscriptionTotal = 0;

    if (sub && convertedDate) {
      const start = new Date(convertedDate);
      const end = churnedDate ? new Date(churnedDate) : new Date();
      ltvMonths = Math.max(1, Math.round(
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth()) +
        (end.getDate() >= start.getDate() ? 0 : -1)
      ) + 1);
      const subMonthlyRate = sub.amount || sub.planPrice || 79;
      subscriptionTotal = ltvMonths * subMonthlyRate;
    }

    const totalPaid = subscriptionTotal + paymentsTotal;

    // Extract account creation time from MongoDB ObjectId
    const createdAt = rest.createdAt || (ObjectId.isValid(id) ? new ObjectId(id).getTimestamp().toISOString() : null);

    // Use phone from user doc, or fall back to payerPhone from subscription
    const phone = rest.phone || (sub && sub.payerPhone) || null;

    return {
      id,
      ...rest,
      phone,
      createdAt,
      tier,
      subscriptionStatus,
      mrr,
      ltvMonths,
      totalPaid,
      nextBillingDate,
      billingCycle,
      convertedDate,
      churnedDate,
      courses: rest.courses || [],
      tags: rest.courses || [],
    };
  }
}

module.exports = UserRepository;
