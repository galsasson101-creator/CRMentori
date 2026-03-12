const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.resolve(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function writeJSON(filename, data) {
  fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Wrote ${data.length} records to data/${filename}`);
}

function randomDate(daysBack, daysForward = 0) {
  const now = Date.now();
  const start = now - daysBack * 86400000;
  const end = now + daysForward * 86400000;
  return new Date(start + Math.random() * (end - start)).toISOString();
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Users (20) ---
const userIds = Array.from({ length: 20 }, () => uuidv4());
const firstNames = ['Alice', 'Bob', 'Carlos', 'Diana', 'Elena', 'Frank', 'Grace', 'Henry', 'Isabella', 'James', 'Karen', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rachel', 'Samuel', 'Tara'];
const lastNames = ['Anderson', 'Brooks', 'Chen', 'Davis', 'Evans', 'Foster', 'Garcia', 'Harris', 'Ito', 'Johnson', 'Kim', 'Lopez', 'Martinez', 'Nguyen', 'O\'Brien', 'Patel', 'Quinn', 'Rivera', 'Smith', 'Torres'];
const tiers = ['free', 'starter', 'professional', 'enterprise'];
const userStatuses = ['active', 'active', 'active', 'inactive', 'churned', 'trial'];
const mrrByTier = { free: 0, starter: 49, professional: 149, enterprise: 499 };

const users = userIds.map((id, i) => {
  const tier = pick(tiers);
  const status = pick(userStatuses);
  const baseMrr = mrrByTier[tier];
  const mrr = status === 'active' ? baseMrr + Math.floor(Math.random() * 50) : 0;
  return {
    id,
    firstName: firstNames[i],
    lastName: lastNames[i],
    email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase().replace("'", '')}@example.com`,
    company: pick(['EduSpark', 'LearnFlow', 'BrightMind', 'SkillForge', 'CourseHero', 'TutorVerse', 'StudyLab', 'AcademyX']),
    tier,
    status,
    mrr,
    phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
    createdAt: randomDate(180),
    updatedAt: randomDate(30)
  };
});

// --- Deals (15) ---
const dealStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
const edtechCompanies = [
  'EduSpark Academy', 'LearnFlow Pro', 'BrightMind Solutions', 'SkillForge Inc',
  'CourseHero Platform', 'TutorVerse Global', 'StudyLab AI', 'AcademyX Digital',
  'MentorShip LMS', 'KnowledgeNest', 'ClassPilot', 'TeachStack',
  'Scholarity', 'CampusWave', 'LearningArc'
];

const deals = edtechCompanies.map((name, i) => {
  const stage = pick(dealStages);
  let group;
  if (stage === 'closed_won') group = 'closed_won';
  else if (stage === 'closed_lost') group = 'closed_lost';
  else group = 'pipeline';

  return {
    id: uuidv4(),
    name: `${name} - ${pick(['Annual License', 'Enterprise Plan', 'Pilot Program', 'Platform Upgrade', 'Content Suite'])}`,
    company: name,
    value: Math.floor(Math.random() * 90000) + 10000,
    stage,
    group,
    ownerId: pick(userIds),
    contactName: `${pick(firstNames)} ${pick(lastNames)}`,
    contactEmail: `deals+${i}@${name.toLowerCase().replace(/\s+/g, '')}.com`,
    probability: stage === 'closed_won' ? 100 : stage === 'closed_lost' ? 0 : Math.floor(Math.random() * 80) + 10,
    expectedCloseDate: randomDate(0, 90),
    notes: pick([
      'Strong interest in enterprise features',
      'Needs SSO integration',
      'Budget approved for Q2',
      'Waiting on legal review',
      'Champion is VP of Learning',
      'Competitive evaluation underway',
      'Renewal discussion started'
    ]),
    createdAt: randomDate(120),
    updatedAt: randomDate(14)
  };
});

// --- Tasks (25) ---
const taskStatuses = ['todo', 'in_progress', 'done', 'blocked'];
const priorities = ['low', 'medium', 'high', 'urgent'];
const taskTitles = [
  'Follow up with prospect', 'Send proposal document', 'Schedule demo call',
  'Review contract terms', 'Update CRM records', 'Prepare quarterly report',
  'Onboard new client', 'Set up training session', 'Create marketing email',
  'Analyze churn data', 'Build integration spec', 'Fix billing issue',
  'Research competitor', 'Draft case study', 'Plan webinar content',
  'Update pricing page', 'Review feature requests', 'Conduct user interview',
  'Prepare board deck', 'Audit security settings', 'Migrate legacy data',
  'Design onboarding flow', 'Test payment gateway', 'Write API docs',
  'Configure SSO for client'
];

const tasks = taskTitles.map((title, i) => ({
  id: uuidv4(),
  title,
  description: `Task details for: ${title}. Priority action item requiring attention.`,
  status: pick(taskStatuses),
  priority: pick(priorities),
  assigneeId: pick(userIds),
  dueDate: randomDate(0, 30),
  createdAt: randomDate(60),
  updatedAt: randomDate(7)
}));

// --- Contacts (15) ---
const contactCompanies = [
  'Stanford Online', 'MIT OpenCourseWare', 'Pearson Education', 'McGraw-Hill',
  'Blackboard Inc', 'Canvas LMS', 'Google Education', 'Microsoft Learn',
  'Udemy Business', 'Coursera Enterprise', 'LinkedIn Learning', 'Pluralsight',
  'Khan Academy', 'Duolingo', 'Chegg Inc'
];

const contacts = contactCompanies.map((company, i) => ({
  id: uuidv4(),
  firstName: pick(firstNames),
  lastName: pick(lastNames),
  email: `contact${i + 1}@${company.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
  phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
  company,
  role: pick(['CTO', 'VP of Engineering', 'Director of Learning', 'Product Manager', 'Head of Partnerships', 'Chief Academic Officer', 'Dean of Digital']),
  notes: pick(['Key decision maker', 'Technical evaluator', 'Budget holder', 'Internal champion', 'Referred by partner']),
  createdAt: randomDate(200),
  updatedAt: randomDate(14)
}));

// --- Activities (40) ---
const activityTypes = ['call', 'email', 'meeting', 'note', 'demo', 'task_completed', 'deal_updated', 'login'];
const activityDescriptions = {
  call: ['Called to discuss renewal', 'Discovery call completed', 'Follow-up call on pricing', 'Cold call - left voicemail'],
  email: ['Sent proposal via email', 'Follow-up email sent', 'Responded to support query', 'Sent onboarding guide'],
  meeting: ['Quarterly business review', 'Product demo meeting', 'Strategy alignment session', 'Kick-off meeting held'],
  note: ['Added internal notes on account', 'Logged feedback from user', 'Documented feature request', 'Captured requirements'],
  demo: ['Live product demo delivered', 'Recorded demo sent', 'Custom demo for enterprise', 'Demo rescheduled'],
  task_completed: ['Completed onboarding checklist', 'Finished contract review', 'Resolved billing issue', 'Closed support ticket'],
  deal_updated: ['Moved deal to negotiation', 'Updated deal value', 'Changed deal stage', 'Added deal notes'],
  login: ['User logged in', 'Admin session started', 'Mobile login detected', 'API token refreshed']
};

const activities = Array.from({ length: 40 }, (_, i) => {
  const type = pick(activityTypes);
  return {
    id: uuidv4(),
    userId: pick(userIds),
    type,
    description: pick(activityDescriptions[type]),
    metadata: {},
    timestamp: randomDate(90),
    createdAt: randomDate(90),
    updatedAt: randomDate(7)
  };
});

// --- Comms (20) ---
const comms = Array.from({ length: 20 }, (_, i) => {
  const linkedUser = users[i % users.length];
  const lastContacted = Math.random() > 0.3 ? randomDate(60) : null;
  return {
    id: uuidv4(),
    userId: linkedUser.id,
    userName: `${linkedUser.firstName} ${linkedUser.lastName}`,
    email: linkedUser.email,
    channel: pick(['email', 'sms', 'in-app', 'push']),
    marketingOptIn: Math.random() > 0.3,
    emailVerified: Math.random() > 0.2,
    unsubscribed: Math.random() > 0.85,
    bounced: Math.random() > 0.9,
    engagementScore: Math.floor(Math.random() * 100),
    lastContacted,
    lastOpenedEmail: Math.random() > 0.4 ? randomDate(30) : null,
    segmentTags: [],
    createdAt: randomDate(180),
    updatedAt: randomDate(7)
  };
});

// Write all files
writeJSON('users.json', users);
writeJSON('deals.json', deals);
writeJSON('tasks.json', tasks);
writeJSON('contacts.json', contacts);
writeJSON('activities.json', activities);
writeJSON('comms.json', comms);

console.log('\nSeed data generation complete!');
