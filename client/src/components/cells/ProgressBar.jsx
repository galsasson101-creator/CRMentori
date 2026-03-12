import React from 'react';

export default function ProgressBar({ value = 0 }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(to right, #3B82F6, #10B981)`,
          }}
        />
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium w-9 text-right flex-shrink-0">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}
