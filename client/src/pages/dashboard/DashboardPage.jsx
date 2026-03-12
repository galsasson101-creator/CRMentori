import React, { useCallback } from 'react';
import { DollarSign, Clock, BarChart3 } from 'lucide-react';
import useApi from '../../hooks/useApi.js';
import * as api from '../../lib/api.js';
import { formatCurrency, formatPercent } from '../../lib/formatters.js';
import LineChart from '../../components/charts/LineChart.jsx';
import BarChart from '../../components/charts/BarChart.jsx';

export default function DashboardPage() {
  const { data: kpis, loading: kpisLoading } = useApi(
    useCallback(() => api.get('/dashboard/kpis'), [])
  );
  const { data: mrrTrend, loading: mrrLoading } = useApi(
    useCallback(() => api.get('/dashboard/mrr-trend'), [])
  );
  const { data: breakdown, loading: breakdownLoading } = useApi(
    useCallback(() => api.get('/dashboard/user-breakdown'), [])
  );

  const isLoading = kpisLoading || mrrLoading || breakdownLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const k = kpis || {};
  const trendData = Array.isArray(mrrTrend) ? mrrTrend : [];
  const bd = breakdown || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <span className="text-sm text-gray-400">Real-time data from MongoDB</span>
      </div>

      {/* KPI Row 1 - Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Total MRR"
          value={formatCurrency(k.totalMrr, 'ILS')}
          accent="#00c875"
        />
        <KpiCard
          icon={BarChart3}
          label="Total Revenue"
          value={formatCurrency(k.totalRevenue, 'ILS')}
          accent="#3B82F6"
        />
        <KpiCard
          icon={Clock}
          label="Avg LTV"
          value={k.avgLtvMonths ? `${k.avgLtvMonths} months` : '--'}
          accent="#a25ddc"
        />
        <KpiCard
          icon={DollarSign}
          label="Avg Revenue / User"
          value={formatCurrency(k.avgRevenuePerUser, 'ILS')}
          accent="#F59E0B"
        />
      </div>

      {/* KPI Row 2 - Users */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MiniKpi label="Total Users" value={k.totalUsers} color="#6B7280" />
        <MiniKpi label="Active Subscribers" value={k.activeUsers} color="#00c875" />
        <MiniKpi label="Cancelled" value={k.cancelledUsers} color="#e2445c" />
        <MiniKpi label="Free Users" value={k.freeUsers} color="#0086c0" />
        <MiniKpi label="Conversion" value={`${k.conversionRate || 0}%`} color="#a25ddc" />
      </div>

      {/* MRR Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">MRR Trend</h3>
          <span className="text-xs text-gray-400">Last 6 months</span>
        </div>
        {trendData.length > 0 ? (
          <LineChart
            data={trendData}
            xKey="month"
            yKey="mrr"
            color="#00c875"
            height={280}
          />
        ) : (
          <EmptyChart />
        )}
      </div>

      {/* Popular Courses */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Popular Courses</h3>
        {bd.topCourses && bd.topCourses.length > 0 ? (
          <BarChart
            data={bd.topCourses}
            xKey="name"
            yKey="value"
            color="#3B82F6"
            height={300}
          />
        ) : (
          <EmptyChart />
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm group hover:shadow-md transition-shadow">
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accent}15` }}
        >
          <Icon size={20} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

function MiniKpi({ label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xl font-bold" style={{ color }}>{value ?? '--'}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[200px] text-gray-300 dark:text-gray-600 text-sm">
      No data available
    </div>
  );
}
