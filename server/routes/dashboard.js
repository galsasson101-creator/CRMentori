const express = require('express');
const router = express.Router();
const UserRepository = require('../dal/UserRepository');

const userRepo = new UserRepository();

// GET /kpis - return key performance indicators
router.get('/kpis', async (req, res, next) => {
  try {
    const users = await userRepo.getAll();

    const activeUsers = users.filter(u => u.subscriptionStatus === 'active').length;
    const cancelledUsers = users.filter(u => u.subscriptionStatus === 'cancelled').length;
    const paidUsers = activeUsers + cancelledUsers;
    const freeUsers = users.filter(u => u.subscriptionStatus === 'free').length;
    const totalMrr = users.reduce((sum, u) => sum + (u.mrr || 0), 0);

    // Average LTV in months for paying users
    const payingWithLtv = users.filter(u => u.ltvMonths > 0);
    const avgLtvMonths = payingWithLtv.length > 0
      ? Math.round((payingWithLtv.reduce((sum, u) => sum + u.ltvMonths, 0) / payingWithLtv.length) * 10) / 10
      : 0;

    // Average revenue per paying user
    const totalRevenue = users.reduce((sum, u) => sum + (u.totalPaid || 0), 0);
    const avgRevenuePerUser = paidUsers > 0
      ? Math.round(totalRevenue / paidUsers)
      : 0;

    const conversionRate = users.length > 0
      ? Math.round((paidUsers / users.length) * 10000) / 100
      : 0;

    const churnRate = paidUsers > 0
      ? Math.round((cancelledUsers / paidUsers) * 10000) / 100
      : 0;

    res.json({
      totalMrr,
      activeUsers,
      totalUsers: users.length,
      freeUsers,
      cancelledUsers,
      paidUsers,
      conversionRate,
      churnRate,
      avgLtvMonths,
      avgRevenuePerUser,
      totalRevenue,
    });
  } catch (err) {
    next(err);
  }
});

// GET /mrr-trend - return MRR trend for last 6 months
router.get('/mrr-trend', async (req, res, next) => {
  try {
    const users = await userRepo.getAll();
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toISOString().slice(0, 7);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const mrr = users
        .filter(u => {
          if (u.subscriptionStatus !== 'active') return false;
          const converted = u.convertedDate ? new Date(u.convertedDate) : null;
          return converted && converted <= endOfMonth;
        })
        .reduce((sum, u) => sum + (u.mrr || 0), 0);

      months.push({ month: monthLabel, mrr });
    }

    res.json(months);
  } catch (err) {
    next(err);
  }
});

// GET /user-breakdown - return user status breakdown for charts
router.get('/user-breakdown', async (req, res, next) => {
  try {
    const users = await userRepo.getAll();

    const statusBreakdown = [
      { name: 'Active', value: users.filter(u => u.subscriptionStatus === 'active').length },
      { name: 'Cancelled', value: users.filter(u => u.subscriptionStatus === 'cancelled').length },
      { name: 'Free', value: users.filter(u => u.subscriptionStatus === 'free').length },
    ];

    const tierBreakdown = [
      { name: 'Pro', value: users.filter(u => u.tier === 'pro').length },
      { name: 'Basic', value: users.filter(u => u.tier === 'basic').length },
      { name: 'Free', value: users.filter(u => u.tier === 'free').length },
    ];

    // Top courses
    const courseCounts = {};
    users.forEach(u => {
      (u.courses || []).forEach(c => {
        courseCounts[c] = (courseCounts[c] || 0) + 1;
      });
    });
    const topCourses = Object.entries(courseCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    res.json({ statusBreakdown, tierBreakdown, topCourses });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
