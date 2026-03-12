import React, { useState, useRef, useEffect } from 'react';
import { PRIORITY_COLORS, PRIORITY_OPTIONS } from '../../lib/constants.js';

function formatLabel(val) {
  if (!val) return '';
  return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PriorityCell({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const bgColor = PRIORITY_COLORS[value] || '#9CA3AF';

  return (
    <div ref={containerRef} className="relative inline-block">
      <span
        onClick={onChange ? () => setOpen((o) => !o) : undefined}
        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white leading-normal ${
          onChange ? 'cursor-pointer' : ''
        }`}
        style={{ backgroundColor: bgColor }}
      >
        {formatLabel(value)}
      </span>

      {open && onChange && (
        <div className="absolute z-50 mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px]">
          {PRIORITY_OPTIONS.map((priority) => (
            <button
              key={priority}
              onClick={() => {
                onChange(priority);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <span
                className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                style={{ backgroundColor: PRIORITY_COLORS[priority] }}
              />
              {formatLabel(priority)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
