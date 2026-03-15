import React, { useCallback, useState } from 'react';
import { DollarSign, Clock, BarChart3, Users, UserCheck, UserX, UserPlus, TrendingUp } from 'lucide-react';
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
      {/* Welcome banner with photo */}
      <WelcomeBanner />

      {/* Revenue KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} label="Total MRR" value={formatCurrency(k.totalMrr, 'ILS')} accent="#00c875" />
        <KpiCard icon={BarChart3} label="Total Revenue" value={formatCurrency(k.totalRevenue, 'ILS')} accent="#3B82F6" />
        <KpiCard icon={Clock} label="Avg LTV" value={k.avgLtvMonths ? `${k.avgLtvMonths} months` : '--'} accent="#a25ddc" />
        <KpiCard icon={DollarSign} label="Avg Revenue / User" value={formatCurrency(k.avgRevenuePerUser, 'ILS')} accent="#F59E0B" />
      </div>

      {/* User counts row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        <MiniKpi label="Total Users" value={k.totalUsers} color="#6B7280" icon={Users} />
        <MiniKpi label="Active Subscribers" value={k.activeUsers} color="#00c875" icon={UserCheck} />
        <MiniKpi label="Cancelled" value={k.cancelledUsers} color="#e2445c" icon={UserX} />
        <MiniKpi label="Free Users" value={k.freeUsers} color="#0086c0" icon={UserPlus} />
        <MiniKpi label="Conversion" value={`${k.conversionRate || 0}%`} color="#a25ddc" icon={TrendingUp} />
      </div>

      {/* MRR Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">MRR Trend</h3>
          <span className="text-xs text-gray-400">Last 6 months</span>
        </div>
        {trendData.length > 0 ? (
          <LineChart data={trendData} xKey="month" yKey="mrr" color="#00c875" height={280} />
        ) : (
          <EmptyChart />
        )}
      </div>

      {/* Popular Courses */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Popular Courses</h3>
        {bd.topCourses && bd.topCourses.length > 0 ? (
          <BarChart data={bd.topCourses} xKey="name" yKey="value" color="#3B82F6" height={300} />
        ) : (
          <EmptyChart />
        )}
      </div>
    </div>
  );
}

function WelcomeBanner() {
  const [imgErrors, setImgErrors] = useState({});

  const margotImages = [
    { src: '/margot 1.png', alt: 'Margot 1' },
    { src: '/margot 2.png', alt: 'Margot 2' },
    { src: '/margot 3.png', alt: 'Margot 3' },
    { src: '/margot 4.png', alt: 'Margot 4' },
    { src: '/margot 5.png', alt: 'Margot 5' },
    { src: '/margot 6.png', alt: 'Margot 6' },
  ];

  // Each Margot has her own tilted orbital plane + speed + radius
  const orbits = [
    { duration: 10, delay: 0, radius: 100, tiltX: 75, tiltZ: 0 },
    { duration: 12, delay: -3, radius: 105, tiltX: 55, tiltZ: 70 },
    { duration: 13, delay: -3.5, radius: 95, tiltX: 65, tiltZ: 140 },
    { duration: 11, delay: -8, radius: 110, tiltX: 50, tiltZ: -50 },
    { duration: 12.5, delay: -5, radius: 108, tiltX: 60, tiltZ: 105 },
    { duration: 9.5, delay: -4, radius: 98, tiltX: 70, tiltZ: -25 },
  ];

  const handleImgError = (key) => setImgErrors((prev) => ({ ...prev, [key]: true }));

  return (
    <div className="bg-gradient-to-r from-navy-800 to-navy-600 rounded-2xl py-10 px-6 flex flex-col items-center text-center shadow-sm">
      <style>{`
        @keyframes orbit3d {
          from { transform: rotateY(0deg) translateX(var(--orbit-radius)) rotateY(0deg); }
          to   { transform: rotateY(360deg) translateX(var(--orbit-radius)) rotateY(-360deg); }
        }
      `}</style>
      {/* Atom container with 3D perspective */}
      <div style={{ perspective: 800 }}>
        <div className="relative" style={{ width: 260, height: 260, transformStyle: 'preserve-3d' }}>
          {/* Nucleus: Gal & Tom — sits at z=0 */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateZ(0px)' }}>
            {!imgErrors.team ? (
              <img
                src="/team.jpg"
                alt="Gal & Tom"
                className="w-36 h-36 rounded-full object-cover"
                onError={() => handleImgError('team')}
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-white/80">G&T</span>
              </div>
            )}
          </div>
          {/* Electrons: each Margot orbits on her own tilted plane */}
          {margotImages.map((img, i) =>
            !imgErrors[`margot${i}`] ? (
              <div
                key={img.src}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `rotateX(${orbits[i].tiltX}deg) rotateZ(${orbits[i].tiltZ}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <div
                  className="absolute"
                  style={{
                    '--orbit-radius': `${orbits[i].radius}px`,
                    animation: `orbit3d ${orbits[i].duration}s linear ${orbits[i].delay}s infinite`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-16 h-16 rounded-full object-cover"
                    style={{ transform: `rotateZ(${-orbits[i].tiltZ}deg) rotateX(${-orbits[i].tiltX}deg)` }}
                    onError={() => handleImgError(`margot${i}`)}
                  />
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>
      <h1 className="text-2xl font-bold text-white mt-4">Welcome back, Gal & Tom</h1>
      <p className="text-sm text-blue-200/70 mt-1">CRMentori Dashboard</p>
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

function MiniKpi({ label, value, color, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center shadow-sm hover:shadow-md transition-shadow">
      {Icon && (
        <div className="flex justify-center mb-1">
          <Icon size={16} style={{ color }} />
        </div>
      )}
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
