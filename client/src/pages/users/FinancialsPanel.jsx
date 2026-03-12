import React from 'react';
import { SUBSCRIPTION_COLORS } from '../../lib/constants.js';
import { formatCurrency, formatDate, capitalize } from '../../lib/formatters.js';

export default function FinancialsPanel({ user }) {
  if (!user) return null;

  const status = user.subscriptionStatus || 'free';
  const statusColor = SUBSCRIPTION_COLORS[status] || '#c4c4c4';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6 sticky top-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Financials</h3>

      {/* MRR */}
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Monthly Recurring Revenue</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
          {user.mrr > 0 ? formatCurrency(user.mrr, 'ILS') : '--'}
        </p>
      </div>

      {/* LTV in months */}
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">LTV (Subscription Length)</p>
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-1">
          {user.ltvMonths > 0 ? `${user.ltvMonths} months` : '--'}
        </p>
      </div>

      {/* Total Paid */}
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Paid</p>
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-1">
          {user.totalPaid > 0 ? formatCurrency(user.totalPaid, 'ILS') : '--'}
        </p>
      </div>

      {/* Subscription Tier */}
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Subscription</p>
        <div className="flex items-center gap-2">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: statusColor }}
          >
            {capitalize(status)}
          </span>
          {user.tier && user.tier !== 'free' && (
            <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
              {user.tier}
            </span>
          )}
        </div>
      </div>

      {/* Next Billing */}
      {user.subscriptionStatus === 'active' && user.nextBillingDate && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Next Billing</p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatDate(user.nextBillingDate)}</p>
          {user.billingCycle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{capitalize(user.billingCycle)} cycle</p>
          )}
        </div>
      )}

      {/* Milestones */}
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Milestones</p>
        <div className="space-y-1.5">
          {user.convertedDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Subscribed</span>
              <span className="text-gray-700 dark:text-gray-300">{formatDate(user.convertedDate)}</span>
            </div>
          )}
          {user.churnedDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Cancelled</span>
              <span className="text-red-500">{formatDate(user.churnedDate)}</span>
            </div>
          )}
          {user.createdAt && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Account created</span>
              <span className="text-gray-700 dark:text-gray-300">{formatDate(user.createdAt)}</span>
            </div>
          )}
          {user.lastLoginAt && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Last login</span>
              <span className="text-gray-700 dark:text-gray-300">{formatDate(user.lastLoginAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Study Time */}
      {user.studyTime && Object.keys(user.studyTime).length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Recent Study Time</p>
          <div className="space-y-1">
            {Object.entries(user.studyTime)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 7)
              .map(([date, minutes]) => (
                <div key={date} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{formatDate(date)}</span>
                  <span className="text-gray-700 dark:text-gray-300">{minutes} min</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
