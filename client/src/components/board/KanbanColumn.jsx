import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ id, title, color, items, columns, users }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const itemIds = items.map((item) => item.id || item._id);

  return (
    <div
      className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl flex-shrink-0 w-72 flex flex-col transition-colors ${
        isOver ? 'ring-2 ring-blue-300 bg-blue-50/30 dark:bg-blue-900/20' : ''
      }`}
      style={{ minHeight: '500px' }}
    >
      <div className="p-3">
        <div
          className="h-1.5 rounded-full mb-3"
          style={{ backgroundColor: color || '#3B82F6' }}
        />
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">
            {title ? title.replace(/_/g, ' ') : 'Unknown'}
          </h3>
          <span className="text-xs font-medium text-gray-500 bg-white dark:bg-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5 shadow-sm">
            {items.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 px-3 pb-3 flex flex-col gap-2 overflow-y-auto"
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <KanbanCard
              key={item.id || item._id}
              item={item}
              columns={columns}
              users={users}
              color={color}
            />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="flex-1 flex items-center justify-center min-h-[100px]">
            <p className="text-xs text-gray-400">No items</p>
          </div>
        )}
      </div>
    </div>
  );
}
