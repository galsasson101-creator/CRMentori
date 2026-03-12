import React, { useMemo } from 'react';
import PieChart from '../../components/charts/PieChart.jsx';
import { capitalize } from '../../lib/formatters.js';

const CHANNEL_COLORS = ['#0086c0', '#00c875', '#a25ddc', '#c4c4c4', '#fdab3d'];

export default function SegmentPanel({ comms = [] }) {
  const segmentCounts = useMemo(() => {
    const counts = {};
    comms.forEach((c) => {
      const tags = c.segmentTags || [];
      tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [comms]);

  const channelDistribution = useMemo(() => {
    const counts = {};
    comms.forEach((c) => {
      const channel = c.preferredChannel || 'none';
      counts[channel] = (counts[channel] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: capitalize(name), value }));
  }, [comms]);

  return (
    <div className="p-5 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Segment Analytics</h3>

      {/* Segment Tag Counts */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Contacts per Segment
        </h4>
        {segmentCounts.length > 0 ? (
          <div className="space-y-2">
            {segmentCounts.map(({ name, count }) => {
              const maxCount = segmentCounts[0]?.count || 1;
              const pct = (count / maxCount) * 100;

              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm text-gray-700">{name}</span>
                    <span className="text-xs font-medium text-gray-500">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No segments found</p>
        )}
      </div>

      {/* Channel Distribution */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Channel Distribution
        </h4>
        {channelDistribution.length > 0 ? (
          <PieChart
            data={channelDistribution}
            dataKey="value"
            nameKey="name"
            colors={CHANNEL_COLORS}
            height={220}
          />
        ) : (
          <p className="text-sm text-gray-400">No channel data</p>
        )}
      </div>

      {/* Summary Stats */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Summary
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{comms.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Contacts</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{segmentCounts.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Segments</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-gray-900">
              {comms.filter((c) => c.emailVerified).length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Verified Emails</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-gray-900">
              {comms.filter((c) => c.marketingOptIn).length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Marketing Opt-in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
