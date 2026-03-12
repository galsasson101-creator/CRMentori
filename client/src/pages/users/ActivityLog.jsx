import React from 'react';
import {
  LogIn,
  HelpCircle,
  CreditCard,
  FileText,
  Mail,
  GitBranch,
  Activity,
} from 'lucide-react';
import { formatRelativeDate } from '../../lib/formatters.js';

const ACTIVITY_ICONS = {
  login: LogIn,
  support_ticket: HelpCircle,
  subscription_change: CreditCard,
  note: FileText,
  email_sent: Mail,
  deal_update: GitBranch,
};

const ACTIVITY_COLORS = {
  login: '#10B981',
  support_ticket: '#F59E0B',
  subscription_change: '#8B5CF6',
  note: '#3B82F6',
  email_sent: '#06B6D4',
  deal_update: '#EC4899',
};

export default function ActivityLog({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-6 text-center">No activity recorded yet.</p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200" />

      <div className="space-y-4">
        {activities.map((activity, idx) => {
          const Icon = ACTIVITY_ICONS[activity.type] || Activity;
          const color = ACTIVITY_COLORS[activity.type] || '#9CA3AF';

          return (
            <div key={activity.id || activity._id || idx} className="relative flex items-start gap-4 pl-0">
              {/* Icon dot */}
              <div
                className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon size={14} style={{ color }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm text-gray-800">
                  {activity.description || activity.message || 'Activity recorded'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatRelativeDate(activity.createdAt || activity.timestamp || activity.date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
