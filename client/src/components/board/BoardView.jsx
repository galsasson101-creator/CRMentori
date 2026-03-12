import React, { useState } from 'react';
import TabNav from '../shared/TabNav';
import TableView from './TableView';
import KanbanView from './KanbanView';

const TABS = ['Table', 'Kanban'];

export default function BoardView({
  title,
  columns,
  items,
  groups,
  groupByKey,
  loading,
  error,
  onUpdateItem,
  onDeleteItem,
  kanbanGroupKey,
  users,
  onRowClick,
}) {
  const [activeTab, setActiveTab] = useState('Table');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <p className="text-red-500 text-sm font-medium">{error}</p>
          <p className="text-gray-400 text-xs mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  const itemCount = items ? items.length : 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-full px-2.5 py-0.5">
            {itemCount}
          </span>
        </div>
        <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'Table' ? (
          <TableView
            columns={columns || []}
            items={items || []}
            groups={groups}
            groupByKey={groupByKey}
            onUpdateItem={onUpdateItem}
            users={users}
            onRowClick={onRowClick}
          />
        ) : (
          <KanbanView
            columns={columns || []}
            items={items || []}
            kanbanGroupKey={kanbanGroupKey}
            onUpdateItem={onUpdateItem}
            users={users}
          />
        )}
      </div>
    </div>
  );
}
