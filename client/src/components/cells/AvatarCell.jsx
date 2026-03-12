import React from 'react';

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function colorFromName(name) {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
  ];
  const index = Math.abs(hashString(name)) % colors.length;
  return colors[index];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export default function AvatarCell({ value, users = [] }) {
  const user = users.find((u) => u.id === value || u._id === value);

  if (!user) {
    return <span className="text-sm text-gray-400">—</span>;
  }

  const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const firstName = user.firstName || (fullName ? fullName.split(/\s+/)[0] : '?');
  const bgColor = colorFromName(fullName || 'Unknown');

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        {getInitials(fullName)}
      </div>
      <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{firstName}</span>
    </div>
  );
}
