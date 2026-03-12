import React, { useState, useCallback } from 'react';
import { Copy, Check, Mail, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import useApi from '../../hooks/useApi.js';
import * as api from '../../lib/api.js';
import { formatDate, capitalize } from '../../lib/formatters.js';

const STATUS_CONFIG = {
  open: { color: '#fdab3d', icon: AlertCircle, label: 'Open' },
  in_progress: { color: '#0086c0', icon: Loader2, label: 'In Progress' },
  resolved: { color: '#00c875', icon: CheckCircle2, label: 'Resolved' },
  closed: { color: '#c4c4c4', icon: Check, label: 'Closed' },
};

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (!text || text === '--') return null;

  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      title="Copy email"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

export default function CommsPage() {
  const { data, loading, error, refetch } = useApi(useCallback(() => api.get('/comms'), []));
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const requests = data || [];

  const filtered = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/comms/${id}`, { status: newStatus });
      refetch();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-red-500 text-sm font-medium">{error}</p>
      </div>
    );
  }

  const statusCounts = {};
  requests.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customer Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{requests.length} total requests</p>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATUS_OPTIONS.map(s => {
          const config = STATUS_CONFIG[s];
          const count = statusCounts[s] || 0;
          return (
            <button
              key={s}
              onClick={() => setFilter(filter === s ? 'all' : s)}
              className={`bg-white dark:bg-gray-800 rounded-lg border p-3 text-center transition-all ${
                filter === s ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <p className="text-2xl font-bold" style={{ color: config.color }}>{count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{config.label}</p>
            </button>
          );
        })}
      </div>

      {/* Requests list */}
      <div className="space-y-3">
        {filtered.map(req => {
          const config = STATUS_CONFIG[req.status] || STATUS_CONFIG.open;
          const StatusIcon = config.icon;
          const isExpanded = expandedId === req.id;

          return (
            <div
              key={req.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              {/* Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : req.id)}
                className="flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: config.color }}
                >
                  <StatusIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{req.fromUserName}</span>
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: config.color }}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2" dir="auto">{req.body}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(req.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 p-4 space-y-4">
                  {/* Full message */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Message</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3" dir="auto">
                      {req.body}
                    </p>
                  </div>

                  {/* Contact info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                      <div className="flex items-center">
                        <a
                          href={`mailto:${req.email}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                          onClick={e => e.stopPropagation()}
                        >
                          <Mail size={14} />
                          {req.email}
                        </a>
                        <CopyButton text={req.email} />
                      </div>
                    </div>
                    {req.phone && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{req.phone}</span>
                          <CopyButton text={req.phone} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status change */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Update Status</label>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map(s => {
                        const sc = STATUS_CONFIG[s];
                        const isActive = req.status === s;
                        return (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(req.id, s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              isActive
                                ? 'text-white shadow-sm'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            style={isActive ? { backgroundColor: sc.color } : {}}
                          >
                            {sc.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>Created: {formatDate(req.createdAt)}</span>
                    {req.updatedAt !== req.createdAt && (
                      <span>Updated: {formatDate(req.updatedAt)}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No requests found
          </div>
        )}
      </div>
    </div>
  );
}
