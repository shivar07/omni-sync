// LocalStorage keys for OmniSync platform
const STORAGE_KEY = 'omnisync_events_v2';
const CATEGORIES_KEY = 'omnisync_categories_v1';
const PENDING_KEY = 'omnisync_pending_v1';
const PENDING_CATS_KEY = 'omnisync_pending_cats_v1';
const IDEAS_KEY = 'omnisync_ideas_v1';
const APPLICATIONS_KEY = 'omnisync_applications_v1';
const MEETS_KEY = 'omnisync_meets_v1';
const GENERAL_MEETS_KEY = 'omnisync_general_meets_v1';
const DAILY_TODOS_KEY = 'omnisync_daily_todos_v1';

// Default initial categories with custom hex colors for Calendar
export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Workshop', color: '#8b5cf6' },
  { id: 'cat-2', name: 'Webinar', color: '#22d3ee' },
  { id: 'cat-3', name: 'Email Notice', color: '#f59e0b' },
  { id: 'cat-4', name: 'WhatsApp Event', color: '#10b981' },
  { id: 'cat-5', name: 'Meeting', color: '#3b82f6' },
  { id: 'cat-6', name: 'Google Meet (Personal)', color: '#00ac47' },
  { id: 'cat-7', name: 'Urgent', color: '#f43f5e' }
];

// Default Categories specifically for Pending Works & Applications
export const DEFAULT_PENDING_CATEGORIES = [
  { id: 'pcat-1', name: 'Hackathon Registration', color: '#f43f5e' },
  { id: 'pcat-2', name: 'Internship Application', color: '#3b82f6' },
  { id: 'pcat-3', name: 'Registration Pending', color: '#22d3ee' },
  { id: 'pcat-4', name: 'Errands / Shop', color: '#f59e0b' },
  { id: 'pcat-5', name: 'Document / Form Submission', color: '#8b5cf6' },
  { id: 'pcat-6', name: 'Project Task', color: '#10b981' },
  { id: 'pcat-7', name: 'Personal / Other', color: '#64748b' }
];

export const APPLICATION_CATEGORIES = [
  'Internship',
  'Full-Time Job',
  'Hackathon Submission',
  'Grant / Fellowship',
  'Course / Program',
  'Other'
];

export const APPLICATION_STATUSES = [
  'Submitted',
  'Under Review',
  'Interviewing',
  'Accepted',
  'Rejected'
];

export const MEET_PLATFORMS = [
  'Zoom',
  'Luma (lu.ma)',
  'MS Teams',
  'Unstop',
  'YouTube Live',
  'Discord',
  'Other'
];

export const INITIAL_EVENTS = [];

// Reference sample calendar events
export const SAMPLE_EVENTS = [
  {
    id: 'sample-1',
    title: 'AI & Web Development Workshop',
    category: 'Workshop',
    startDate: '2026-07-22T10:00',
    endDate: '2026-07-22T13:00',
    link: 'https://zoom.us/j/example-workshop-ai',
    notes: 'Received via WhatsApp from Dev Community group.\nTopics: Next.js 15, AI Agents.',
    reminder: '1 hour before',
    createdAt: new Date().toISOString()
  }
];

export const SAMPLE_PENDING_TASKS = [
  {
    id: 'ptask-1',
    title: 'Hackathon Registration Form Submission',
    category: 'Hackathon Registration',
    deadline: '2026-07-24T23:59',
    priority: 'High',
    status: 'Pending',
    link: 'https://hackathon-portal.com/register',
    notes: 'Fill team details, project idea abstract, and submit resume PDF.',
    syncToCalendar: true,
    createdAt: new Date().toISOString()
  }
];

export const SAMPLE_IDEAS = [
  {
    id: 'idea-1',
    title: 'Build Voice Automation Bot',
    content: 'Setup Web Speech API in browser. Trigger audio voice reminder 10 mins before workshop.',
    createdAt: new Date().toISOString()
  }
];

export const SAMPLE_APPLICATIONS = [
  {
    id: 'app-1',
    title: 'Google Software Engineering Intern 2026',
    category: 'Internship',
    status: 'Under Review',
    link: 'https://careers.google.com/jobs/results/sample-internship',
    notes: 'Submitted resume and portfolio link. Confirmation ID: #GOOG-8891.',
    appliedDate: new Date().toISOString()
  }
];

export const SAMPLE_MEETS = [
  {
    id: 'meet-1',
    title: 'Important Personal Mentor Sync',
    link: 'https://meet.google.com/abc-defg-hij',
    startDate: '2026-07-22T16:00',
    endDate: '2026-07-22T17:00',
    notes: 'Discuss career roadmap, project architecture, and code review.',
    isImportant: true,
    createdAt: new Date().toISOString()
  }
];

export const SAMPLE_GENERAL_MEETS = [
  {
    id: 'gmeet-1',
    title: 'AI Product Launch Keynote',
    platform: 'Luma (lu.ma)',
    startDate: '2026-07-25T18:00',
    endDate: '2026-07-25T19:30',
    link: 'https://lu.ma/example-ai-launch',
    isLinkPending: false,
    notes: 'Registration confirmed via Luma. Join link sent 10 mins before.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gmeet-2',
    title: 'Web3 & Community Dev Sync',
    platform: 'Zoom',
    startDate: '2026-07-26T20:00',
    endDate: '2026-07-26T21:00',
    link: '',
    isLinkPending: true,
    notes: 'Link will be emailed by organizers on the date of event.',
    createdAt: new Date().toISOString()
  }
];

// Load categories from localStorage
export const getStoredCategories = () => {
  try {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (!data) {
      saveStoredCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading categories:', error);
    return DEFAULT_CATEGORIES;
  }
};

export const saveStoredCategories = (categories) => {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories:', error);
  }
};

// Load pending categories from localStorage
export const getStoredPendingCategories = () => {
  try {
    const data = localStorage.getItem(PENDING_CATS_KEY);
    if (!data) {
      saveStoredPendingCategories(DEFAULT_PENDING_CATEGORIES);
      return DEFAULT_PENDING_CATEGORIES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading pending categories:', error);
    return DEFAULT_PENDING_CATEGORIES;
  }
};

export const saveStoredPendingCategories = (categories) => {
  try {
    localStorage.setItem(PENDING_CATS_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving pending categories:', error);
  }
};

// Load Ideas from localStorage
export const getStoredIdeas = () => {
  try {
    const data = localStorage.getItem(IDEAS_KEY);
    if (!data) {
      saveStoredIdeas([]);
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading ideas:', error);
    return [];
  }
};

export const saveStoredIdeas = (ideas) => {
  try {
    localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
  } catch (error) {
    console.error('Error saving ideas:', error);
  }
};

// Load Google Meets from localStorage
export const getStoredGoogleMeets = () => {
  try {
    const data = localStorage.getItem(MEETS_KEY);
    if (!data) {
      saveStoredGoogleMeets([]);
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading google meets:', error);
    return [];
  }
};

export const saveStoredGoogleMeets = (meets) => {
  try {
    localStorage.setItem(MEETS_KEY, JSON.stringify(meets));
  } catch (error) {
    console.error('Error saving google meets:', error);
  }
};

// Load General Meets from localStorage
export const getStoredGeneralMeets = () => {
  try {
    const data = localStorage.getItem(GENERAL_MEETS_KEY);
    if (!data) {
      saveStoredGeneralMeets([]);
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading general meets:', error);
    return [];
  }
};

export const saveStoredGeneralMeets = (meets) => {
  try {
    localStorage.setItem(GENERAL_MEETS_KEY, JSON.stringify(meets));
  } catch (error) {
    console.error('Error saving general meets:', error);
  }
};

// Load Applications Applied from localStorage
export const getStoredApplications = () => {
  try {
    const data = localStorage.getItem(APPLICATIONS_KEY);
    if (!data) {
      saveStoredApplications([]);
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading applications:', error);
    return [];
  }
};

export const saveStoredApplications = (apps) => {
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
  } catch (error) {
    console.error('Error saving applications:', error);
  }
};

// Load pending tasks from localStorage
export const getStoredPendingTasks = () => {
  try {
    const data = localStorage.getItem(PENDING_KEY);
    if (!data) {
      saveStoredPendingTasks([]);
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading pending tasks:', error);
    return [];
  }
};

export const saveStoredPendingTasks = (tasks) => {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving pending tasks:', error);
  }
};

// Calculate deadline status helper
export const getDeadlineStatus = (deadlineStr, isCompleted = false) => {
  if (isCompleted) return { label: 'Completed', type: 'completed', color: '#10b981' };
  if (!deadlineStr) return { label: 'No Deadline', type: 'none', color: '#64748b' };

  const now = new Date();
  const deadline = new Date(deadlineStr);
  const diffHours = (deadline - now) / (1000 * 60 * 60);

  if (diffHours < 0) {
    return { label: 'Overdue!', type: 'overdue', color: '#f43f5e' };
  } else if (diffHours <= 24) {
    return { label: 'Due Today / < 24h', type: 'today', color: '#f59e0b' };
  } else if (diffHours <= 72) {
    return { label: `Due in ${Math.ceil(diffHours / 24)} Days`, type: 'urgent', color: '#22d3ee' };
  } else {
    return { label: `Due in ${Math.ceil(diffHours / 24)} Days`, type: 'normal', color: '#3b82f6' };
  }
};

// Load events from LocalStorage or initialize with empty array []
export const getStoredEvents = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      saveStoredEvents([]);
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading events from localStorage:', error);
    return [];
  }
};

export const saveStoredEvents = (events) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving events to localStorage:', error);
  }
};

// Generate formatted TXT schedule output
export const generateTxtSchedule = (events, pendingTasks = [], ideas = [], applications = [], meets = [], generalMeets = []) => {
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  let txt = `=================================================================\n`;
  let titleHeader = `       OMNISYNC PERSONAL SCHEDULE & MEETS BACKUP LOG            `;
  txt += `${titleHeader}\n`;
  txt += `Generated on: ${dateStr}\n`;
  txt += `Events: ${events.length} | Pending: ${pendingTasks.length} | Ideas: ${ideas.length} | Apps: ${applications.length} | Google Meets: ${meets.length} | General Meets: ${generalMeets.length}\n`;
  txt += `=================================================================\n\n`;

  // Section 1: General Meets & Webinars (Zoom, Luma, etc.)
  txt += `>>> GENERAL MEETS & WEBINARS (${generalMeets.length} Recorded)\n`;
  txt += `-----------------------------------------------------------------\n`;
  if (generalMeets.length === 0) {
    txt += `No general meets recorded.\n\n`;
  } else {
    generalMeets.forEach((gm, idx) => {
      const start = new Date(gm.startDate).toLocaleString();
      txt += `[GM-${idx + 1}] ${gm.title.toUpperCase()} [PLATFORM: ${gm.platform || 'General'}]\n`;
      txt += `   Date & Time : ${start}\n`;
      txt += `   Meet Link   : ${gm.isLinkPending ? 'Link Pending (To be released on date)' : (gm.link || 'None')}\n`;
      txt += `   Notes       : ${gm.notes ? gm.notes.replace(/\n/g, ' ') : 'None'}\n\n`;
    });
  }

  // Section 2: Important Google Meets
  txt += `>>> IMPORTANT GOOGLE MEETS (${meets.length} Recorded)\n`;
  txt += `-----------------------------------------------------------------\n`;
  if (meets.length === 0) {
    txt += `No Google Meets recorded.\n\n`;
  } else {
    meets.forEach((m, idx) => {
      const start = new Date(m.startDate).toLocaleString();
      txt += `[M-${idx + 1}] ${m.title.toUpperCase()}\n`;
      txt += `   Date & Time : ${start}\n`;
      txt += `   Meet Link   : ${m.link || 'None'}\n`;
      txt += `   Notes       : ${m.notes ? m.notes.replace(/\n/g, ' ') : 'None'}\n\n`;
    });
  }

  // Section 3: Applications Applied Tracker
  txt += `>>> APPLICATIONS APPLIED TRACKER (${applications.length} Recorded)\n`;
  txt += `-----------------------------------------------------------------\n`;
  if (applications.length === 0) {
    txt += `No applications recorded.\n\n`;
  } else {
    applications.forEach((appItem, idx) => {
      txt += `[A-${idx + 1}] ${appItem.title.toUpperCase()} [STATUS: ${appItem.status || 'Submitted'}]\n`;
      txt += `   Category    : ${appItem.category || 'Internship'}\n`;
      txt += `   Portal Link : ${appItem.link || 'None'}\n`;
      txt += `   Notes       : ${appItem.notes ? appItem.notes.replace(/\n/g, ' ') : 'None'}\n\n`;
    });
  }

  // Section 4: Ideas Vault
  txt += `>>> IDEAS VAULT (${ideas.length} Recorded)\n`;
  txt += `-----------------------------------------------------------------\n`;
  if (ideas.length === 0) {
    txt += `No ideas recorded.\n\n`;
  } else {
    ideas.forEach((idItem, idx) => {
      txt += `[I-${idx + 1}] ${idItem.title.toUpperCase()}\n`;
      txt += `   Content :\n${idItem.content ? idItem.content.split('\n').map(l => `      | ${l}`).join('\n') : '      | No text content'}\n\n`;
    });
  }

  // Section 5: Pending Tasks
  txt += `>>> PENDING TASKS & APPLICATIONS VAULT (${pendingTasks.filter(t => t.status !== 'Completed').length} Pending)\n`;
  txt += `-----------------------------------------------------------------\n`;
  if (pendingTasks.length === 0) {
    txt += `No pending tasks or applications recorded.\n\n`;
  } else {
    pendingTasks.forEach((pt, idx) => {
      const deadlineFormatted = pt.deadline ? new Date(pt.deadline).toLocaleString() : 'No deadline set';
      txt += `[P-${idx + 1}] ${pt.title.toUpperCase()} [${pt.status.toUpperCase()}]\n`;
      txt += `   Category : ${pt.category}\n`;
      txt += `   Deadline : ${deadlineFormatted}\n`;
      txt += `   Link     : ${pt.link || 'None'}\n`;
      txt += `   Notes    : ${pt.notes ? pt.notes.replace(/\n/g, ' ') : 'None'}\n\n`;
    });
  }

  // Section 6: Calendar Events
  txt += `>>> CALENDAR SCHEDULE EVENTS (${events.length} Scheduled)\n`;
  txt += `-----------------------------------------------------------------\n`;
  if (events.length === 0) {
    txt += `No calendar events currently scheduled.\n\n`;
  } else {
    const sorted = [...events].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    sorted.forEach((evt, idx) => {
      const start = new Date(evt.startDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      txt += `[E-${idx + 1}] ${evt.title.toUpperCase()}\n`;
      txt += `   Type/Cat : ${evt.category || 'General'}\n`;
      txt += `   Date/Time: ${start}\n`;
      txt += `   Link     : ${evt.link || 'None'}\n`;
      txt += `   Notes    : ${evt.notes ? evt.notes.replace(/\n/g, ' ') : 'None'}\n\n`;
    });
  }

  txt += `=================================================================\n`;
  txt += `End of Backup File - OmniSync Local Storage Engine\n`;
  txt += `=================================================================\n`;

  return txt;
};

// Download TXT file helper
export const downloadTxtFile = (content, filename = `OmniSync_Schedule_${new Date().toISOString().split('T')[0]}.txt`) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Parse imported TXT/JSON file back into JSON array
export const parseImportedFile = (fileText) => {
  try {
    if (fileText.trim().startsWith('[') || fileText.trim().startsWith('{')) {
      const parsed = JSON.parse(fileText);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    return null;
  } catch (err) {
    console.error('Failed to parse file:', err);
    return null;
  }
};

// Load Daily Todos from localStorage
export const getStoredDailyTodos = () => {
  try {
    const data = localStorage.getItem(DAILY_TODOS_KEY);
    if (!data) {
      const initialTodos = [
        {
          id: 'todo-sample-1',
          title: 'Welcome to Daily Planner! Add your first task below',
          date: new Date().toISOString().split('T')[0],
          status: 'Pending',
          priority: 'Medium',
          category: 'Personal',
          createdAt: new Date().toISOString()
        }
      ];
      saveStoredDailyTodos(initialTodos);
      return initialTodos;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading daily todos:', error);
    return [];
  }
};

export const saveStoredDailyTodos = (todos) => {
  try {
    localStorage.setItem(DAILY_TODOS_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('Error saving daily todos:', error);
  }
};

export const SAMPLE_DAILY_TODOS = [
  {
    id: 'todo-sample-1',
    title: 'Explore OmniSync Dashboard Features',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    priority: 'High',
    category: 'Work',
    createdAt: new Date().toISOString()
  },
  {
    id: 'todo-sample-2',
    title: 'Review and plan tomorrow\'s agenda',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    priority: 'Medium',
    category: 'Personal',
    createdAt: new Date().toISOString()
  },
  {
    id: 'todo-sample-3',
    title: 'Add a new custom task to this worklist',
    date: new Date().toISOString().split('T')[0],
    status: 'Completed',
    priority: 'Low',
    category: 'General',
    createdAt: new Date().toISOString()
  }
];
