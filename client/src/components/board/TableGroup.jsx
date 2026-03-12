import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

export default function TableGroup({ group, columns, items, color, onUpdateItem, users, onRowClick }) {
  const [collapsed, setCollapsed] = useState(false);

  const bgTint = color ? `${color}12` : '#00c87512';

  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-t-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        style={{
          borderLeft: `4px solid ${color || '#00c875'}`,
          backgroundColor: bgTint,
        }}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        )}
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{group}</span>
        <span className="text-xs font-medium text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5 shadow-sm">
          {items.length}
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: collapsed ? '0px' : `${items.length * 60 + 50}px`,
          opacity: collapsed ? 0 : 1,
        }}
      >
        <table className="w-full border-collapse">
          <TableHeader columns={columns} />
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <TableRow
                  key={item.id || item._id}
                  item={item}
                  columns={columns}
                  onUpdate={onUpdateItem}
                  users={users}
                  onRowClick={onRowClick}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-sm text-gray-400"
                >
                  No items in this group
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
