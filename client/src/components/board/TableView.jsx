import React from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import TableGroup from './TableGroup';
import { DEFAULT_GROUP_COLORS } from '../../lib/constants';

export default function TableView({ columns, items, groups, groupByKey, onUpdateItem, users, onRowClick }) {
  if (groups && groups.length > 0 && groupByKey) {
    const grouped = {};
    for (const group of groups) {
      grouped[group.value || group.name || group] = [];
    }
    for (const item of items) {
      const key = item[groupByKey] || 'Ungrouped';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    }

    const groupEntries = Object.entries(grouped);

    return (
      <div className="overflow-x-auto">
        {groupEntries.map(([groupName, groupItems], index) => {
          const groupConfig = groups.find(
            (g) => (g.value || g.name || g) === groupName
          );
          const color =
            (groupConfig && groupConfig.color) ||
            DEFAULT_GROUP_COLORS[index % DEFAULT_GROUP_COLORS.length];

          return (
            <TableGroup
              key={groupName}
              group={groupName}
              columns={columns}
              items={groupItems}
              color={color}
              onUpdateItem={onUpdateItem}
              users={users}
              onRowClick={onRowClick}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <TableHeader columns={columns} />
        <tbody>
          {items && items.length > 0 ? (
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
                className="px-4 py-12 text-center text-sm text-gray-400"
              >
                No items to display
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
