import React, { useMemo } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensors,
  useSensor,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import { STAGE_COLORS, STATUS_COLORS } from '../../lib/constants';

const DEFAULT_COLUMN_COLORS = [
  '#00c875', '#0086c0', '#fdab3d', '#a25ddc', '#e2445c', '#037f4c',
  '#579bfc', '#ff642e', '#cab641', '#9cd326',
];

function getColorMap(kanbanGroupKey) {
  if (kanbanGroupKey === 'stage') return STAGE_COLORS;
  if (kanbanGroupKey === 'status') return STATUS_COLORS;
  return {};
}

export default function KanbanView({ columns, items, kanbanGroupKey, onUpdateItem, users }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const colorMap = useMemo(() => getColorMap(kanbanGroupKey), [kanbanGroupKey]);

  const groupedItems = useMemo(() => {
    const groups = {};
    if (!items || !kanbanGroupKey) return groups;

    for (const item of items) {
      const groupValue = item[kanbanGroupKey] || 'unassigned';
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push(item);
    }

    return groups;
  }, [items, kanbanGroupKey]);

  const columnOrder = useMemo(() => {
    const knownKeys = Object.keys(colorMap);
    const allKeys = Object.keys(groupedItems);

    if (knownKeys.length > 0) {
      const ordered = knownKeys.filter((k) => allKeys.includes(k));
      const extra = allKeys.filter((k) => !knownKeys.includes(k));
      return [...ordered, ...extra];
    }

    return allKeys;
  }, [groupedItems, colorMap]);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || !onUpdateItem) return;

    const itemId = active.id;
    const targetColumnId = over.id;

    const item = items.find((i) => (i.id || i._id) === itemId);
    if (!item) return;

    const currentValue = item[kanbanGroupKey];

    if (currentValue !== targetColumnId && columnOrder.includes(targetColumnId)) {
      onUpdateItem(itemId, { [kanbanGroupKey]: targetColumnId });
    }
  }

  if (!kanbanGroupKey) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">No group key configured for Kanban view</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto p-6 min-h-[600px]">
        {columnOrder.map((groupValue, index) => {
          const color =
            colorMap[groupValue] ||
            DEFAULT_COLUMN_COLORS[index % DEFAULT_COLUMN_COLORS.length];

          return (
            <KanbanColumn
              key={groupValue}
              id={groupValue}
              title={groupValue}
              color={color}
              items={groupedItems[groupValue] || []}
              columns={columns}
              users={users}
            />
          );
        })}

        {columnOrder.length === 0 && (
          <div className="flex items-center justify-center w-full py-20">
            <p className="text-sm text-gray-400">No items to display</p>
          </div>
        )}
      </div>
    </DndContext>
  );
}
