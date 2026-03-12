export const taskColumns = [
  { key: "name", label: "Task", type: "text", width: 280 },
  { key: "assigneeId", label: "Assignee", type: "avatar", width: 140 },
  { key: "priority", label: "Priority", type: "priority", width: 120 },
  { key: "status", label: "Status", type: "status", width: 130,
    colorMap: { todo: '#c4c4c4', in_progress: '#0086c0', stuck: '#e2445c', done: '#00c875' }
  },
  { key: "dueDate", label: "Due Date", type: "date", width: 130 },
  { key: "description", label: "Description", type: "text", width: 240 },
];
