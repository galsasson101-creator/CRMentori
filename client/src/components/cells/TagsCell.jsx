import React from 'react';

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

const PASTEL_COLORS = [
  { bg: '#DBEAFE', text: '#1E40AF' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#EDE9FE', text: '#5B21B6' },
  { bg: '#CFFAFE', text: '#155E75' },
  { bg: '#FEE2E2', text: '#991B1B' },
  { bg: '#F3E8FF', text: '#6B21A8' },
  { bg: '#ECFCCB', text: '#3F6212' },
  { bg: '#FFE4E6', text: '#9F1239' },
];

function colorForTag(tag) {
  const index = Math.abs(hashString(tag)) % PASTEL_COLORS.length;
  return PASTEL_COLORS[index];
}

export default function TagsCell({ value = [] }) {
  if (!Array.isArray(value) || value.length === 0) {
    return <span className="text-sm text-gray-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {value.map((tag) => {
        const color = colorForTag(tag);
        return (
          <span
            key={tag}
            className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
}
