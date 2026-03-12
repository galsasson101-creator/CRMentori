import React from 'react';
import TextCell from '../cells/TextCell';
import StatusBadge from '../cells/StatusBadge';
import ProgressBar from '../cells/ProgressBar';
import AvatarCell from '../cells/AvatarCell';
import CurrencyCell from '../cells/CurrencyCell';
import DateCell from '../cells/DateCell';
import PriorityCell from '../cells/PriorityCell';
import TagsCell from '../cells/TagsCell';
import ToggleCell from '../cells/ToggleCell';

function renderCell(column, item, onUpdate, users) {
  const value = item[column.key];

  const handleChange = (newValue) => {
    if (onUpdate) {
      onUpdate(item.id || item._id, { [column.key]: newValue });
    }
  };

  switch (column.type) {
    case 'text':
      return (
        <TextCell
          value={value}
          onSave={onUpdate ? handleChange : undefined}
        />
      );
    case 'status':
      return (
        <StatusBadge
          value={value}
          colorMap={column.colorMap || {}}
          onChange={onUpdate ? handleChange : undefined}
        />
      );
    case 'progress':
      return <ProgressBar value={value} />;
    case 'avatar':
      return <AvatarCell value={value} users={users || []} />;
    case 'currency':
      return <CurrencyCell value={value} currency={column.currency} />;
    case 'date':
      return <DateCell value={value} />;
    case 'priority':
      return (
        <PriorityCell
          value={value}
          onChange={onUpdate ? handleChange : undefined}
        />
      );
    case 'tags':
      return <TagsCell value={value} />;
    case 'toggle':
      return (
        <ToggleCell
          value={value}
          onChange={onUpdate ? handleChange : undefined}
        />
      );
    default:
      return (
        <span className="text-sm text-gray-700 dark:text-gray-300 truncate block">
          {value != null ? String(value) : '—'}
        </span>
      );
  }
}

export default function TableRow({ item, columns, onUpdate, users, onRowClick }) {
  return (
    <tr
      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 cursor-pointer"
      onClick={() => onRowClick && onRowClick(item)}
    >
      {columns.map((col) => (
        <td
          key={col.key}
          className="px-4 py-3"
          style={{ width: col.width || 'auto' }}
        >
          {renderCell(col, item, onUpdate, users)}
        </td>
      ))}
    </tr>
  );
}
