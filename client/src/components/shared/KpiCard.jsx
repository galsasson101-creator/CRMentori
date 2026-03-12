import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KpiCard({ icon: Icon, label, value, trend }) {
  const trendIsPositive = trend && trend > 0;
  const trendIsNegative = trend && trend < 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {trend != null && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium mb-1 ${
              trendIsPositive
                ? 'text-success'
                : trendIsNegative
                ? 'text-danger'
                : 'text-gray-400'
            }`}
          >
            {trendIsPositive && <TrendingUp size={14} />}
            {trendIsNegative && <TrendingDown size={14} />}
            {trendIsPositive ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
    </div>
  );
}
