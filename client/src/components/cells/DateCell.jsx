import React from 'react';
import { formatDate } from '../../lib/formatters.js';

function getDateColorClass(value) {
  if (!value) return 'text-gray-500';
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'text-gray-500';

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return 'text-red-500';
  if (diffDays <= 3) return 'text-orange-500';
  return 'text-gray-500';
}

export default function DateCell({ value }) {
  const colorClass = getDateColorClass(value);

  return (
    <span className={`text-sm ${colorClass}`}>
      {formatDate(value)}
    </span>
  );
}
