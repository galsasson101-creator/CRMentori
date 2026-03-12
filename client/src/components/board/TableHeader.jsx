import React from 'react';

export default function TableHeader({ columns }) {
  return (
    <thead>
      <tr>
        {columns.map((col) => (
          <th
            key={col.key}
            className="sticky top-0 bg-gray-50 dark:bg-gray-800 text-left text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold px-4 py-3 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap"
            style={{ width: col.width || 'auto', minWidth: col.minWidth || 0 }}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}
