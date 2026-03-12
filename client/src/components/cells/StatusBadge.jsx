import React, { useState, useRef, useEffect } from 'react';

function formatLabel(val) {
  if (!val) return '';
  return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ value, colorMap = {}, onChange }) {
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

  const bgColor = colorMap[value] || '#9CA3AF';

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
        <div className="absolute z-50 mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[140px]">
          {Object.entries(colorMap).map(([key, color]) => (
            <button
              key={key}
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <span
                className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              {formatLabel(key)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
