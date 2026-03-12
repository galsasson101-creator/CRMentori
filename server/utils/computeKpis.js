/**
 * Compute dashboard KPIs from deals and users data.
 */
function computeKpis(deals, users) {
  const totalDeals = deals.length;

  const activeUsers = users.filter(u => u.status === 'active').length;

  const totalMrr = users
    .filter(u => u.status === 'active')
    .reduce((sum, u) => sum + (u.mrr || 0), 0);

  const avgDealValue = totalDeals > 0
    ? Math.round(deals.reduce((sum, d) => sum + (d.value || 0), 0) / totalDeals)
    : 0;

  const closedWon = deals.filter(d => d.stage === 'closed_won').length;
  const closedTotal = deals.filter(d => d.stage === 'closed_won' || d.stage === 'closed_lost').length;
  const conversionRate = closedTotal > 0
    ? Math.round((closedWon / closedTotal) * 10000) / 100
    : 0;

  const churned = users.filter(u => u.status === 'churned').length;
  const totalUsers = users.length;
  const churnRate = totalUsers > 0
    ? Math.round((churned / totalUsers) * 10000) / 100
    : 0;

  return {
    totalDeals,
    totalMrr,
    activeUsers,
    avgDealValue,
    conversionRate,
    churnRate
  };
}

/**
 * Compute MRR trend for the last 6 months based on user createdAt and MRR.
 */
function computeMrrTrend(users) {
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toISOString().slice(0, 7); // YYYY-MM
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const mrr = users
      .filter(u => {
        const created = new Date(u.createdAt);
        return created <= endOfMonth && u.status === 'active';
      })
      .reduce((sum, u) => sum + (u.mrr || 0), 0);

    months.push({ month: monthLabel, mrr });
  }

  return months;
}

/**
 * Compute pipeline summary grouped by stage.
 */
function computePipelineSummary(deals) {
  const stageMap = {};

  deals.forEach(deal => {
    const stage = deal.stage || 'unknown';
    if (!stageMap[stage]) {
      stageMap[stage] = { stage, count: 0, totalValue: 0 };
    }
    stageMap[stage].count += 1;
    stageMap[stage].totalValue += deal.value || 0;
  });

  const stages = Object.values(stageMap);
  return { stages };
}

module.exports = {
  computeKpis,
  computeMrrTrend,
  computePipelineSummary
};
