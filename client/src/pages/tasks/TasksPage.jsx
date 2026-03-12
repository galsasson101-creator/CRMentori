import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import BoardView from '../../components/board/BoardView.jsx';
import Modal from '../../components/shared/Modal.jsx';
import useBoardData from '../../hooks/useBoardData.js';
import useApi from '../../hooks/useApi.js';
import * as api from '../../lib/api.js';
import { STATUS_COLORS, PRIORITY_OPTIONS } from '../../lib/constants.js';
import { taskColumns } from './taskColumns.js';
import TaskDetailPanel from './TaskDetailPanel.jsx';

const INITIAL_TASK = {
  name: '',
  assigneeId: '',
  priority: 'medium',
  status: 'todo',
  dueDate: '',
  description: '',
  relatedDealId: '',
};

export default function TasksPage() {
  const { items, groups, loading, error, refetch } = useBoardData('/tasks', 'status');
  const { data: users } = useApi(useCallback(() => api.get('/users'), []));

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...INITIAL_TASK });
  const [submitting, setSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/tasks', formData);
      setModalOpen(false);
      setFormData({ ...INITIAL_TASK });
      refetch();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateItem = useCallback(
    async (id, data) => {
      try {
        await api.put(`/tasks/${id}`, data);
        refetch();
      } catch (err) {
        console.error('Failed to update task:', err);
      }
    },
    [refetch]
  );

  const handleTaskUpdate = useCallback(
    async (updatedTask) => {
      try {
        const id = updatedTask.id || updatedTask._id;
        await api.put(`/tasks/${id}`, updatedTask);
        setSelectedTask(null);
        refetch();
      } catch (err) {
        console.error('Failed to update task:', err);
      }
    },
    [refetch]
  );

  const userList = users || [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <div />
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <BoardView
          title="Tasks"
          columns={taskColumns}
          items={items}
          groups={groups}
          groupByKey="status"
          kanbanGroupKey="status"
          onUpdateItem={handleUpdateItem}
          users={userList}
          loading={loading}
          error={error}
          onRowClick={(task) => setSelectedTask(task)}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter task name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
            <select
              value={formData.assigneeId}
              onChange={(e) => handleChange('assigneeId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select assignee...</option>
              <option value="tom">Tom</option>
              <option value="gal">Gal</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {Object.keys(STATUS_COLORS).map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Describe the task..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      <TaskDetailPanel
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleTaskUpdate}
        users={userList}
      />
    </div>
  );
}
