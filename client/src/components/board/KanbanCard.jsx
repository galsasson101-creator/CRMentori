import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AvatarCell from '../cells/AvatarCell';
import CurrencyCell from '../cells/CurrencyCell';
import DateCell from '../cells/DateCell';
import PriorityCell from '../cells/PriorityCell';
import TagsCell from '../cells/TagsCell';
import ProgressBar from '../cells/ProgressBar';

function renderCompactCell(column, value, users) {
  switch (column.type) {
    case 'avatar':
      return <AvatarCell value={value} users={users || []} />;
    case 'currency':
      return <CurrencyCell value={value} compact />;
    case 'date':
      return <DateCell value={value} />;
    case 'priority':
      return <PriorityCell value={value} />;
    case 'tags':
      return <TagsCell value={value} />;
    case 'progress':
      return <ProgressBar value={value} />;
    default:
      return (
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {value != null ? String(value) : '\u2014'}
        </span>
      );
  }
}

export default function KanbanCard({ item, columns, users, color }) {
  const itemId = item.id || item._id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderLeftColor: color || '#3B82F6',
  };

  const titleColumn = columns.find((c) => c.type === 'text');
  const title = titleColumn ? item[titleColumn.key] : itemId;

  const detailColumns = columns
    .filter((c) => c.key !== (titleColumn && titleColumn.key) && c.type !== 'toggle')
    .slice(0, 3);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-2">{title || 'Untitled'}</p>

      {detailColumns.map((col) => {
        const value = item[col.key];
        if (value == null && col.type !== 'avatar') return null;

        return (
          <div key={col.key} className="flex items-center justify-between gap-2 mt-1.5">
            <span className="text-[11px] text-gray-400 uppercase flex-shrink-0">
              {col.label}
            </span>
            <div className="flex-1 flex justify-end min-w-0">
              {renderCompactCell(col, value, users)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
