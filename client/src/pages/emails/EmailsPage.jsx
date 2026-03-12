import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Mail, Send, Plus, Play, Pause, Trash2, Edit3, Save, X, Search,
  CheckCircle2, XCircle, Zap, FileText, History, Settings, Users,
  Clock, MailCheck, MailX, RefreshCw, ChevronDown, ChevronUp, Eye,
  Calendar, Filter, UserCheck, RotateCcw, Palette, Image, Globe, Share2
} from 'lucide-react';
import useApi from '../../hooks/useApi.js';
import * as api from '../../lib/api.js';
import { formatDate, formatRelativeDate, capitalize } from '../../lib/formatters.js';
import Modal from '../../components/shared/Modal.jsx';
import EmptyState from '../../components/shared/EmptyState.jsx';
import { SUBSCRIPTION_COLORS } from '../../lib/constants.js';

// ── Tab config (4 tabs) ──
const TABS = [
  { id: 'campaigns', label: 'Campaigns', icon: Send },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const CRON_PRESETS = [
  { label: 'Daily 9am', value: '0 9 * * *' },
  { label: 'Mon 9am', value: '0 9 * * 1' },
  { label: '1st of month', value: '0 9 1 * *' },
  { label: 'Every hour', value: '0 * * * *' },
];

const STATUS_COLORS = {
  draft: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300' },
  active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  paused: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  sending: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

// ── Main Page ──
export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const { data: logs } = useApi(useCallback(() => api.get('/emails/logs'), []));
  const { data: campaigns } = useApi(useCallback(() => api.get('/emails/campaigns'), []));

  const totalSent = (logs || []).filter(l => l.status === 'sent').length;
  const totalFailed = (logs || []).filter(l => l.status === 'failed').length;
  const activeCampaigns = (campaigns || []).filter(c => c.status === 'active').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Email Campaigns</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Create, send, and schedule email campaigns to your users</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={MailCheck} label="Emails Sent" value={totalSent} accent="#00c875" />
        <KpiCard icon={MailX} label="Failed" value={totalFailed} accent="#e2445c" />
        <KpiCard icon={Zap} label="Active Campaigns" value={activeCampaigns} accent="#a25ddc" />
        <KpiCard icon={Send} label="Total Campaigns" value={(campaigns || []).length} accent="#0086c0" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1.5 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-navy-800 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'campaigns' && <CampaignsTab />}
      {activeTab === 'templates' && <TemplatesTab />}
      {activeTab === 'history' && <HistoryTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
}

// ── KPI Card ──
function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ backgroundColor: accent }} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
          <Icon size={20} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

// ── Campaigns Tab (Unified) ──
function CampaignsTab() {
  const { data, loading, refetch } = useApi(useCallback(() => api.get('/emails/campaigns'), []));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const campaigns = data || [];

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    await api.del(`/emails/campaigns/${id}`);
    refetch();
  };

  const handleRun = async (id) => {
    try {
      await api.post(`/emails/campaigns/${id}/run`);
      alert('Campaign is being sent! Check the History tab for results.');
      refetch();
    } catch (err) {
      alert('Failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handlePause = async (id) => {
    await api.post(`/emails/campaigns/${id}/pause`);
    refetch();
  };

  const handleResume = async (id) => {
    await api.post(`/emails/campaigns/${id}/resume`);
    refetch();
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {showForm && (
        <CampaignForm
          campaign={editing}
          onSave={() => { setShowForm(false); setEditing(null); refetch(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {campaigns.length === 0 && !showForm ? (
        <EmptyState icon={Send} title="No campaigns yet" subtitle="Create your first campaign to send emails to your users." />
      ) : (
        <div className="space-y-3">
          {campaigns.map(campaign => {
            const statusStyle = STATUS_COLORS[campaign.status] || STATUS_COLORS.draft;
            const isScheduled = campaign.scheduleType === 'scheduled';

            return (
              <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      campaign.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' :
                      campaign.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {isScheduled
                        ? <Calendar size={18} className={campaign.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'} />
                        : <Send size={18} className={campaign.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{campaign.name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          {capitalize(campaign.status)}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          isScheduled ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}>
                          {isScheduled ? 'Recurring' : 'One-time'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Subject: <span className="text-gray-800 dark:text-gray-200">{campaign.subject}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {isScheduled && campaign.cronExpression && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {campaign.cronExpression}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {campaign.recipientMode === 'manual'
                            ? `${(campaign.recipientIds || []).length} users`
                            : campaign.recipientFilter === 'all' ? 'All users'
                            : campaign.recipientFilter === 'tier' ? `Tier: ${campaign.recipientTier}`
                            : campaign.recipientFilter === 'status' ? `Status: ${campaign.recipientStatus}`
                            : 'Custom emails'}
                        </span>
                        {campaign.totalSent > 0 && (
                          <span className="flex items-center gap-1">
                            <MailCheck size={12} /> {campaign.totalSent} sent
                          </span>
                        )}
                        {campaign.lastRun && (
                          <span>Last: {formatRelativeDate(campaign.lastRun)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {campaign.status !== 'completed' && (
                      <ActionButton icon={Play} title="Run now" color="blue" onClick={() => handleRun(campaign.id)} />
                    )}
                    {campaign.status === 'active' && isScheduled && (
                      <ActionButton icon={Pause} title="Pause" color="yellow" onClick={() => handlePause(campaign.id)} />
                    )}
                    {campaign.status === 'paused' && (
                      <ActionButton icon={Play} title="Resume" color="green" onClick={() => handleResume(campaign.id)} />
                    )}
                    <ActionButton icon={Edit3} title="Edit" color="blue" onClick={() => { setEditing(campaign); setShowForm(true); }} />
                    <ActionButton icon={Trash2} title="Delete" color="red" onClick={() => handleDelete(campaign.id)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon: Icon, title, color, onClick }) {
  const colors = {
    blue: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600',
    red: 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600',
    green: 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600',
    yellow: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600',
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg text-gray-400 transition-colors ${colors[color] || ''}`}
    >
      <Icon size={16} />
    </button>
  );
}

// ── Campaign Form (single form with sections) ──
function CampaignForm({ campaign, onSave, onCancel }) {
  const { data: usersData, loading: usersLoading } = useApi(useCallback(() => api.get('/users'), []));
  const { data: templates } = useApi(useCallback(() => api.get('/emails/templates'), []));

  const [form, setForm] = useState(campaign || {
    name: '', subject: '', htmlBody: '',
    recipientMode: 'filter',
    recipientFilter: 'all', recipientTier: '', recipientStatus: '',
    recipientEmails: '',
    recipientIds: [],
    scheduleType: 'now',
    cronExpression: '',
  });
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  // Manual user selection state
  const [userSearch, setUserSearch] = useState('');
  const [userTierFilter, setUserTierFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState(new Set(campaign?.recipientIds || []));

  const users = usersData || [];
  const templateList = templates || [];

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (!u.email) return false;
      const searchStr = `${u.name || ''} ${u.email || ''}`.toLowerCase();
      if (userSearch && !searchStr.includes(userSearch.toLowerCase())) return false;
      if (userTierFilter !== 'all' && u.tier !== userTierFilter) return false;
      if (userStatusFilter !== 'all' && u.subscriptionStatus !== userStatusFilter) return false;
      return true;
    });
  }, [users, userSearch, userTierFilter, userStatusFilter]);

  // Count recipients for badge
  const recipientCount = useMemo(() => {
    if (form.recipientMode === 'manual') return selectedUsers.size;
    if (form.recipientFilter === 'all') return users.filter(u => u.email).length;
    if (form.recipientFilter === 'tier' && form.recipientTier) return users.filter(u => u.email && u.tier === form.recipientTier).length;
    if (form.recipientFilter === 'status' && form.recipientStatus) return users.filter(u => u.email && u.subscriptionStatus === form.recipientStatus).length;
    if (form.recipientFilter === 'custom') {
      const emails = typeof form.recipientEmails === 'string'
        ? form.recipientEmails.split(',').filter(e => e.trim())
        : (form.recipientEmails || []);
      return emails.length;
    }
    return 0;
  }, [form.recipientMode, form.recipientFilter, form.recipientTier, form.recipientStatus, form.recipientEmails, selectedUsers, users]);

  const toggleAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id || u._id)));
    }
  };

  const toggleUser = (id) => {
    const next = new Set(selectedUsers);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedUsers(next);
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    if (!templateId) return;
    const tmpl = templateList.find(t => t.id === templateId);
    if (tmpl) {
      setForm(f => ({ ...f, subject: tmpl.subject, htmlBody: tmpl.html }));
    }
  };

  const handlePreview = async () => {
    try {
      const res = await api.post('/emails/preview-branded', {
        html: form.htmlBody.replace(/\{\{name\}\}/g, 'John Doe'),
      });
      setPreviewHtml(res.html);
      setShowPreview(true);
    } catch {
      // Fallback to non-branded preview
      setPreviewHtml(form.htmlBody.replace(/\{\{name\}\}/g, 'John Doe'));
      setShowPreview(true);
    }
  };

  const handleSubmit = async (submitType) => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        recipientIds: form.recipientMode === 'manual' ? Array.from(selectedUsers) : [],
        recipientEmails: form.recipientFilter === 'custom' && typeof form.recipientEmails === 'string'
          ? form.recipientEmails.split(',').map(e => e.trim()).filter(Boolean)
          : form.recipientEmails || [],
      };

      if (submitType === 'send-now') {
        payload.scheduleType = 'now';
      } else if (submitType === 'activate') {
        payload.scheduleType = 'scheduled';
      } else {
        // draft
        payload.status = 'draft';
        payload.scheduleType = payload.scheduleType || 'now';
      }

      if (campaign?.id) {
        await api.put(`/emails/campaigns/${campaign.id}`, payload);
      } else {
        await api.post('/emails/campaigns', payload);
      }
      onSave();
    } catch (err) {
      alert('Error: ' + (err.message || 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6 mb-6 space-y-6 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {campaign ? 'Edit' : 'New'} Campaign
        </h3>
        <button type="button" onClick={onCancel} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <X size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Section 1: Details */}
      <div className="space-y-4">
        <SectionHeader icon={Mail} title="Details" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Campaign Name">
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Weekly Newsletter" className={inputClass} />
          </FormField>
          <FormField label="Email Subject">
            <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Use {{name}} for personalization" className={inputClass} />
          </FormField>
        </div>

        {/* Template selector */}
        {templateList.length > 0 && (
          <FormField label="Load from Template">
            <select value={selectedTemplate} onChange={e => handleTemplateSelect(e.target.value)} className={inputClass}>
              <option value="">-- Choose template --</option>
              {templateList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </FormField>
        )}

        <FormField label={
          <div className="flex items-center justify-between w-full">
            <span>Email Body <span className="text-gray-400 font-normal">(HTML, use {'{{name}}'} to personalize)</span></span>
            {form.htmlBody && (
              <button type="button" onClick={handlePreview}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium">
                <Eye size={12} /> Preview Branded
              </button>
            )}
          </div>
        }>
          <textarea rows={10} value={form.htmlBody} onChange={e => setForm(f => ({ ...f, htmlBody: e.target.value }))}
            placeholder={'<h1>Hello {{name}}</h1>\n<p>We have exciting news for you...</p>'}
            className={`${inputClass} font-mono resize-y`} />
        </FormField>
      </div>

      {/* Section 2: Recipients */}
      <div className="space-y-4">
        <SectionHeader icon={Users} title="Recipients" badge={recipientCount > 0 ? `${recipientCount} recipients` : null} />

        <div className="flex gap-2">
          <button type="button"
            onClick={() => setForm(f => ({ ...f, recipientMode: 'filter' }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              form.recipientMode === 'filter'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Filter size={14} /> Use Filters
          </button>
          <button type="button"
            onClick={() => setForm(f => ({ ...f, recipientMode: 'manual' }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              form.recipientMode === 'manual'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <UserCheck size={14} /> Select Users
          </button>
        </div>

        {form.recipientMode === 'filter' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Filter Type">
              <select value={form.recipientFilter} onChange={e => setForm(f => ({ ...f, recipientFilter: e.target.value }))} className={inputClass}>
                <option value="all">All users with email</option>
                <option value="tier">By tier</option>
                <option value="status">By subscription status</option>
                <option value="custom">Custom email list</option>
              </select>
            </FormField>
            {form.recipientFilter === 'tier' && (
              <FormField label="Tier">
                <select value={form.recipientTier || ''} onChange={e => setForm(f => ({ ...f, recipientTier: e.target.value }))} className={inputClass}>
                  <option value="">-- Select tier --</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                </select>
              </FormField>
            )}
            {form.recipientFilter === 'status' && (
              <FormField label="Status">
                <select value={form.recipientStatus || ''} onChange={e => setForm(f => ({ ...f, recipientStatus: e.target.value }))} className={inputClass}>
                  <option value="">-- Select status --</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="free">Free</option>
                </select>
              </FormField>
            )}
            {form.recipientFilter === 'custom' && (
              <FormField label="Emails (comma-separated)">
                <input value={typeof form.recipientEmails === 'string' ? form.recipientEmails : (form.recipientEmails || []).join(', ')}
                  onChange={e => setForm(f => ({ ...f, recipientEmails: e.target.value }))}
                  placeholder="a@example.com, b@example.com" className={inputClass} />
              </FormField>
            )}
          </div>
        ) : (
          /* Manual user selection table */
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[180px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search users..." className="w-full pl-8 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none" />
                </div>
                <select value={userTierFilter} onChange={e => setUserTierFilter(e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg text-xs text-gray-900 dark:text-gray-100 outline-none">
                  <option value="all">All Tiers</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                </select>
                <select value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)}
                  className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg text-xs text-gray-900 dark:text-gray-100 outline-none">
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="free">Free</option>
                </select>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {selectedUsers.size} selected
                </span>
              </div>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[320px]">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left w-10">
                        <input type="checkbox"
                          checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                          onChange={toggleAllUsers}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tier</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredUsers.map(user => {
                      const id = user.id || user._id;
                      const name = user.name || '--';
                      const status = user.subscriptionStatus || 'free';
                      const statusColor = SUBSCRIPTION_COLORS[status] || '#c4c4c4';
                      const isSelected = selectedUsers.has(id);

                      return (
                        <tr key={id} onClick={() => toggleUser(id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/60 dark:bg-blue-900/20' : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/50'
                          }`}>
                          <td className="px-3 py-2">
                            <input type="checkbox" checked={isSelected} onChange={() => toggleUser(id)}
                              onClick={e => e.stopPropagation()} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                                style={{ backgroundColor: statusColor }}>
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">{user.email}</td>
                          <td className="px-3 py-2">
                            <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                              {user.tier || '--'}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: statusColor }}>
                              {capitalize(status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-400 text-sm">No users with email found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">{filteredUsers.length} users shown</span>
              <button type="button" onClick={toggleAllUsers}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                {selectedUsers.size === filteredUsers.length ? 'Deselect all' : `Select all ${filteredUsers.length}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Schedule */}
      <div className="space-y-4">
        <SectionHeader icon={Clock} title="Schedule" />

        <div className="flex gap-2">
          <button type="button"
            onClick={() => setForm(f => ({ ...f, scheduleType: 'now' }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              form.scheduleType === 'now'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Send size={14} /> Send Now
          </button>
          <button type="button"
            onClick={() => setForm(f => ({ ...f, scheduleType: 'scheduled' }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              form.scheduleType === 'scheduled'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Calendar size={14} /> Schedule Recurring
          </button>
        </div>

        {form.scheduleType === 'scheduled' && (
          <FormField label="Cron Schedule">
            <input value={form.cronExpression} onChange={e => setForm(f => ({ ...f, cronExpression: e.target.value }))}
              placeholder="0 9 * * *" className={inputClass} />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {CRON_PRESETS.map(p => (
                <button key={p.value} type="button" onClick={() => setForm(f => ({ ...f, cronExpression: p.value }))}
                  className="px-2 py-0.5 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  {p.label}
                </button>
              ))}
            </div>
          </FormField>
        )}
      </div>

      {/* Section 4: Actions */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        {campaign?.id ? (
          <button type="button" onClick={() => handleSubmit('save')} disabled={saving || !form.name || !form.subject || !form.htmlBody}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        ) : (
          <>
            <button type="button" onClick={() => handleSubmit('draft')} disabled={saving || !form.name || !form.subject || !form.htmlBody}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
              <Save size={16} /> Save Draft
            </button>
            {form.scheduleType === 'now' ? (
              <button type="button" onClick={() => handleSubmit('send-now')}
                disabled={saving || !form.name || !form.subject || !form.htmlBody || recipientCount === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
                <Send size={16} /> {saving ? 'Sending...' : `Send Now to ${recipientCount} recipients`}
              </button>
            ) : (
              <button type="button" onClick={() => handleSubmit('activate')}
                disabled={saving || !form.name || !form.subject || !form.htmlBody || !form.cronExpression}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
                <Play size={16} /> {saving ? 'Activating...' : 'Activate Schedule'}
              </button>
            )}
          </>
        )}
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Branded Email Preview" width="max-w-3xl">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-900 overflow-hidden">
          <iframe
            srcDoc={previewHtml}
            title="Email Preview"
            className="w-full border-0"
            style={{ height: '600px' }}
            sandbox=""
          />
        </div>
      </Modal>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, badge }) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-gray-700">
      <Icon size={16} className="text-blue-500" />
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
      {badge && (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Templates Tab ──
function TemplatesTab() {
  const { data, loading, refetch } = useApi(useCallback(() => api.get('/emails/templates'), []));
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);

  const templates = data || [];

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    await api.del(`/emails/templates/${id}`);
    refetch();
  };

  if (loading) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> New Template
        </button>
      </div>

      {showForm && (
        <TemplateForm
          template={editing}
          onSave={() => { setShowForm(false); setEditing(null); refetch(); }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {templates.length === 0 && !showForm ? (
        <EmptyState icon={FileText} title="No templates yet" subtitle="Save reusable email templates for faster campaign creation." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div
                className="h-32 bg-gray-50 dark:bg-gray-900 p-3 overflow-hidden text-xs text-gray-400 font-mono cursor-pointer border-b border-gray-200 dark:border-gray-700"
                onClick={() => setPreviewHtml(t.html)}
              >
                <div className="opacity-60" dangerouslySetInnerHTML={{ __html: t.html.slice(0, 300) }} />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{t.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Subject: {t.subject}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDate(t.createdAt)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setPreviewHtml(t.html)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition-colors"><Eye size={14} /></button>
                    <button onClick={() => { setEditing(t); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition-colors"><Edit3 size={14} /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!previewHtml} onClose={() => setPreviewHtml(null)} title="Template Preview" width="max-w-2xl">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 max-h-[500px] overflow-y-auto">
          <div dangerouslySetInnerHTML={{ __html: (previewHtml || '').replace(/\{\{name\}\}/g, 'John Doe') }} />
        </div>
      </Modal>
    </div>
  );
}

function TemplateForm({ template, onSave, onCancel }) {
  const [form, setForm] = useState(template || { name: '', subject: '', html: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (template?.id) {
        await api.put(`/emails/templates/${template.id}`, form);
      } else {
        await api.post('/emails/templates', form);
      }
      onSave();
    } catch (err) {
      alert('Error: ' + (err.message || 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6 mb-6 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{template ? 'Edit' : 'New'} Template</h3>
        <button type="button" onClick={onCancel} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Template Name">
          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Welcome Email" className={inputClass} />
        </FormField>
        <FormField label="Subject">
          <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Email subject line" className={inputClass} />
        </FormField>
      </div>
      <FormField label="HTML Body">
        <textarea rows={10} required value={form.html} onChange={e => setForm(f => ({ ...f, html: e.target.value }))}
          className={`${inputClass} font-mono resize-y`} placeholder={'<h1>Hello {{name}}</h1>\n<p>Welcome to Mentori!</p>'} />
      </FormField>
      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Template'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── History Tab ──
function HistoryTab() {
  const { data, loading, refetch } = useApi(useCallback(() => api.get('/emails/logs'), []));
  const [filter, setFilter] = useState('all');
  const logs = data || [];

  const filtered = filter === 'all' ? logs : logs.filter(l => l.status === filter);

  const sentCount = logs.filter(l => l.status === 'sent').length;
  const failedCount = logs.filter(l => l.status === 'failed').length;

  if (loading) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">{logs.length} total</p>
          <div className="flex gap-1">
            {[
              { value: 'all', label: `All (${logs.length})` },
              { value: 'sent', label: `Sent (${sentCount})` },
              { value: 'failed', label: `Failed (${failedCount})` },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={refetch} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={History} title="No emails sent yet" subtitle="Send your first campaign to see the history here." />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recipient</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{log.to}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{log.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                      {log.campaignName || log.automationName || '--'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.type === 'campaign' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                        log.type === 'automation' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                        log.type === 'bulk' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {log.type === 'campaign' ? 'Campaign' : capitalize(log.type || 'manual')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {log.status === 'sent'
                        ? <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400"><CheckCircle2 size={14} /> Sent</span>
                        : <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400"><XCircle size={14} /> Failed</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatRelativeDate(log.sentAt || log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Settings Tab ──
function SettingsTab() {
  const { data: smtpData, loading: smtpLoading, refetch: smtpRefetch } = useApi(useCallback(() => api.get('/emails/status'), []));
  const { data: brandData, loading: brandLoading } = useApi(useCallback(() => api.get('/emails/brand-settings'), []));

  const [form, setForm] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const debounceRef = useRef(null);

  // Initialize form when brand data loads
  useEffect(() => {
    if (brandData && !form) {
      setForm({ ...brandData });
    }
  }, [brandData, form]);

  // Debounced preview update
  useEffect(() => {
    if (!form) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const sampleHtml = `<h2 style="margin:0 0 16px 0;font-size:22px;font-weight:700;">Welcome to ${form.companyName || 'Mentori'}!</h2>
<p style="margin:0 0 12px 0;">This is a preview of your branded email template. All your campaigns will use this design.</p>
<p style="margin:0 0 20px 0;">You can customize the colors, logo, footer text, and social links using the settings panel.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:${form.primaryColor || '#0086c0'};border-radius:8px;padding:12px 24px;"><a href="#" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;font-family:'Inter',Arial,sans-serif;">Sample Button</a></td></tr></table>`;
        const res = await api.post('/emails/preview-branded', { html: sampleHtml, settings: form });
        setPreviewHtml(res.html);
      } catch { /* ignore preview errors */ }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [form]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await api.put('/emails/brand-settings', form);
      setSaveMsg('Settings saved!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Failed to save.');
    }
    setSaving(false);
  };

  const handleReset = async () => {
    try {
      const res = await api.get('/emails/brand-settings');
      const defaults = {
        primaryColor: '#0086c0', headerBgColor: '#1c1f3e', footerBgColor: '#f4f5f7',
        bodyBgColor: '#f4f5f7', contentBgColor: '#ffffff', textColor: '#1c1f3e', mutedTextColor: '#6b7280',
        logoUrl: '', logoAltText: 'Mentori', logoWidth: 140,
        companyName: 'Mentori', websiteUrl: 'https://mentori.app',
        footerText: '', copyrightText: '',
        socialFacebook: '', socialTwitter: '', socialLinkedin: '', socialInstagram: '',
        id: res.id, createdAt: res.createdAt,
      };
      setForm(defaults);
      await api.put('/emails/brand-settings', defaults);
      setSaveMsg('Reset to defaults!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch { /* ignore */ }
  };

  if (smtpLoading || brandLoading) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const cardClass = 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Left column — Settings forms */}
      <div className="space-y-6">
        {/* Email Service Connection */}
        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              smtpData?.connected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <Mail size={20} className={smtpData?.connected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Microsoft Graph API</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sending as info@mentori.app</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            {smtpData?.connected
              ? <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium"><CheckCircle2 size={18} /> Connected — {smtpData.provider}</div>
              : <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium"><XCircle size={18} /> Not connected</div>
            }
          </div>
          {!smtpData?.connected && smtpData?.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-800 dark:text-red-300 mb-4">
              <p className="font-medium mb-1">Error Details:</p>
              <p className="text-xs font-mono break-all">{smtpData.error}</p>
            </div>
          )}
          <button onClick={smtpRefetch} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-medium transition-colors">
            <RefreshCw size={14} /> Test Connection
          </button>
        </div>

        {form && (
          <>
            {/* Brand Colors */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-4">
                <Palette size={18} className="text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Brand Colors</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['primaryColor', 'Primary / Accent'],
                  ['headerBgColor', 'Header Background'],
                  ['footerBgColor', 'Footer Background'],
                  ['bodyBgColor', 'Body Background'],
                  ['contentBgColor', 'Content Background'],
                  ['textColor', 'Text Color'],
                  ['mutedTextColor', 'Muted Text'],
                ].map(([field, label]) => (
                  <FormField key={field} label={label}>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form[field] || '#000000'}
                        onChange={e => updateField(field, e.target.value)}
                        className="w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={form[field] || ''}
                        onChange={e => updateField(field, e.target.value)}
                        className={inputClass}
                        placeholder="#000000"
                      />
                    </div>
                  </FormField>
                ))}
              </div>
            </div>

            {/* Logo */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-4">
                <Image size={18} className="text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Logo</h3>
              </div>
              <div className="space-y-4">
                <FormField label="Logo Image URL">
                  <input type="text" value={form.logoUrl || ''} onChange={e => updateField('logoUrl', e.target.value)} className={inputClass} placeholder="https://example.com/logo.png (leave empty for text logo)" />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Alt Text">
                    <input type="text" value={form.logoAltText || ''} onChange={e => updateField('logoAltText', e.target.value)} className={inputClass} />
                  </FormField>
                  <FormField label="Width (px)">
                    <input type="number" value={form.logoWidth || 140} onChange={e => updateField('logoWidth', parseInt(e.target.value, 10) || 140)} className={inputClass} />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Company & Footer */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-4">
                <Globe size={18} className="text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Company & Footer</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Company Name">
                    <input type="text" value={form.companyName || ''} onChange={e => updateField('companyName', e.target.value)} className={inputClass} />
                  </FormField>
                  <FormField label="Website URL">
                    <input type="text" value={form.websiteUrl || ''} onChange={e => updateField('websiteUrl', e.target.value)} className={inputClass} />
                  </FormField>
                </div>
                <FormField label="Footer Text (optional extra line)">
                  <input type="text" value={form.footerText || ''} onChange={e => updateField('footerText', e.target.value)} className={inputClass} placeholder="e.g. 123 Main Street, City, Country" />
                </FormField>
                <FormField label="Copyright Text (leave empty for default)">
                  <input type="text" value={form.copyrightText || ''} onChange={e => updateField('copyrightText', e.target.value)} className={inputClass} placeholder={`© ${new Date().getFullYear()} ${form.companyName || 'Mentori'}. All rights reserved.`} />
                </FormField>
              </div>
            </div>

            {/* Social Media */}
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-4">
                <Share2 size={18} className="text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Social Media</h3>
              </div>
              <div className="space-y-4">
                {[
                  ['socialFacebook', 'Facebook URL'],
                  ['socialTwitter', 'Twitter / X URL'],
                  ['socialLinkedin', 'LinkedIn URL'],
                  ['socialInstagram', 'Instagram URL'],
                ].map(([field, label]) => (
                  <FormField key={field} label={label}>
                    <input type="text" value={form[field] || ''} onChange={e => updateField(field, e.target.value)} className={inputClass} placeholder="https://" />
                  </FormField>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                <Save size={14} /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
              <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors">
                <RotateCcw size={14} /> Reset to Defaults
              </button>
              {saveMsg && <span className="text-sm font-medium text-green-600 dark:text-green-400">{saveMsg}</span>}
            </div>
          </>
        )}
      </div>

      {/* Right column — Live Preview */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Eye size={18} className="text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Live Preview</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden" style={{ height: '700px' }}>
          {previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              title="Email Preview"
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400 dark:text-gray-500">Loading preview...</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared helpers ──
const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
