export const STAGE_COLORS = {
  lead: '#c4c4c4',
  qualified: '#00c875',
  proposal: '#0086c0',
  negotiation: '#fdab3d',
  closed_won: '#00c875',
  closed_lost: '#e2445c',
};

export const PRIORITY_COLORS = {
  critical: '#e2445c',
  high: '#fdab3d',
  medium: '#0086c0',
  low: '#c4c4c4',
};

export const STATUS_COLORS = {
  todo: '#c4c4c4',
  in_progress: '#0086c0',
  stuck: '#e2445c',
  done: '#00c875',
};

export const SUBSCRIPTION_COLORS = {
  trialing: '#a25ddc',
  active: '#00c875',
  past_due: '#fdab3d',
  churned: '#e2445c',
  cancelled: '#e2445c',
  free: '#0086c0',
};

export const PRIORITY_OPTIONS = ['critical', 'high', 'medium', 'low'];

export const DEFAULT_GROUP_COLORS = [
  '#00c875',
  '#0086c0',
  '#fdab3d',
  '#a25ddc',
  '#e2445c',
  '#037f4c',
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { id: 'users', label: 'Users', icon: 'Users', path: '/users' },
  { id: 'tasks', label: 'Tasks', icon: 'CheckSquare', path: '/tasks' },
  { id: 'comms', label: 'Requests', icon: 'Mail', path: '/comms' },
  { id: 'emails', label: 'Email Automation', icon: 'Zap', path: '/emails' },
];
