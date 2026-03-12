import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import BoardView from '../../components/board/BoardView.jsx';
import Modal from '../../components/shared/Modal.jsx';
import useBoardData from '../../hooks/useBoardData.js';
import useApi from '../../hooks/useApi.js';
import * as api from '../../lib/api.js';
import { STAGE_COLORS } from '../../lib/constants.js';
import { pipelineColumns } from './pipelineColumns.js';
import DealDetailPanel from './DealDetailPanel.jsx';

const INITIAL_DEAL = {
  name: '',
  ownerId: '',
  stage: 'lead',
  closeProbability: 20,
  estimatedValue: 0,
  expectedCloseDate: '',
  tags: [],
  notes: '',
  group: 'pipeline',
};

export default function PipelinesPage() {
  const { items, groups, loading, error, refetch, updateItem } = useBoardData('/deals', 'group');
  const { data: users } = useApi(useCallback(() => api.get('/users'), []));

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...INITIAL_DEAL });
  const [submitting, setSubmitting] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/deals', formData);
      setModalOpen(false);
      setFormData({ ...INITIAL_DEAL });
      refetch();
    } catch (err) {
      console.error('Failed to create deal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateItem = useCallback(
    async (id, data) => {
      try {
        await api.put(`/deals/${id}`, data);
        refetch();
      } catch (err) {
        console.error('Failed to update deal:', err);
      }
    },
    [refetch]
  );

  const handleDealUpdate = useCallback(
    async (updatedDeal) => {
      try {
        const id = updatedDeal.id || updatedDeal._id;
        await api.put(`/deals/${id}`, updatedDeal);
        setSelectedDeal(null);
        refetch();
      } catch (err) {
        console.error('Failed to update deal:', err);
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
          New Deal
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <BoardView
          title="Pipelines"
          columns={pipelineColumns}
          items={items}
          groups={groups}
          groupByKey="group"
          kanbanGroupKey="stage"
          onUpdateItem={handleUpdateItem}
          users={userList}
          loading={loading}
          error={error}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Deal">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deal Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter deal name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label>
            <select
              value={formData.ownerId}
              onChange={(e) => handleChange('ownerId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select owner...</option>
              {userList.map((u) => (
                <option key={u.id || u._id} value={u.id || u._id}>
                  {u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stage</label>
            <select
              value={formData.stage}
              onChange={(e) => handleChange('stage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {Object.keys(STAGE_COLORS).map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Close %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.closeProbability}
                onChange={(e) => handleChange('closeProbability', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Est. Value</label>
              <input
                type="number"
                min="0"
                value={formData.estimatedValue}
                onChange={(e) => handleChange('estimatedValue', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Close Date</label>
            <input
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={(formData.tags || []).join(', ')}
              onChange={(e) =>
                handleChange(
                  'tags',
                  e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="e.g. enterprise, Q1"
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
              {submitting ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </Modal>

      <DealDetailPanel
        deal={selectedDeal}
        isOpen={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onUpdate={handleDealUpdate}
        users={userList}
      />
    </div>
  );
}
