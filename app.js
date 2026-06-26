// State Variables
let tasks = [];
let habits = [];
let activeFilter = 'all';
let currentCategory = 'all';
let showMatrix = false;
let activePage = 'dashboard';

// Helper to generate local YYYY-MM-DDTHH:MM strings
function getLocalDateTimeString(offsetMs = 0) {
  const d = new Date(Date.now() + offsetMs);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
}

// Global safety wrapper for Lucide icons rendering with full offline inline SVG fallbacks
const ICON_MAP = {
  'zap': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
  'layout-dashboard': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>',
  'check-square': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
  'calendar': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
  'target': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
  'flame': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>',
  'cpu': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>',
  'clock': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
  'battery-charging': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2v12zm12 0h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2v12zm-8-9 4 3-4 3 4-3-4-3z"></path></svg>',
  'battery': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="11" x2="23" y2="13"></line></svg>',
  'battery-low': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="11" x2="23" y2="13"></line><line x1="5" y1="9" x2="5" y2="15"></line></svg>',
  'mic': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
  'shield-check': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 11 11 13 15 9"></polyline></svg>',
  'alert-circle': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
  'sparkles': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>',
  'plus': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
  'grid': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
  'list': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
  'trash-2': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
  'chevron-left': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
  'chevron-right': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
  'rotate-ccw': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>',
  'play': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
  'pause': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>',
  'skip-forward': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>',
  'waves': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C5.8 7 7 5.8 7 4.5S5.8 2 4.5 2 2 3.2 2 4.5V6zm0 13.5c0 1.3 1.2 2.5 2.5 2.5s2.5-1.2 2.5-2.5V18c-.6-.5-1.2-1-2.5-1-1.3 0-2.5 1.2-2.5 2.5zM22 6c-.6.5-1.2 1-2.5 1-1.3 0-2.5-1.2-2.5-2.5S18.2 2 19.5 2s2.5 1.2 2.5 2.5V6zm0 13.5c0 1.3-1.2 2.5-2.5 2.5s-2.5-1.2-2.5-2.5V18c.6-.5 1.2-1 2.5-1 1.3 0 2.5 1.2 2.5 2.5z"></path></svg>',
  'cloud-rain': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>',
  'radio': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>',
  'volume-1': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>',
  'terminal': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',
  'bot': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4m-4 3h.01M16 14h.01"></path></svg>',
  'arrow-right': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
  'info': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
  'alert-triangle': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
  'check': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  'tag': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
  'file-text': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></polyline><polyline points="10 9 9 9 8 9"></polyline></svg>',
  'copy': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
  'check-circle-2': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>',
  'play-circle': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>',
  'menu': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>',
  'x': '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
};

function safeCreateIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    try {
      lucide.createIcons();
      return;
    } catch (e) {
      console.warn("Lucide library failed execution, falling back to SVG mapping.", e);
    }
  }

  // Self-contained inline SVG icon replacement fallback
  document.querySelectorAll('[data-lucide]').forEach(el => {
    const iconName = el.getAttribute('data-lucide');
    const svgContent = ICON_MAP[iconName];
    if (svgContent) {
      // Create a wrapper or replace element directly
      const tempSpan = document.createElement('span');
      tempSpan.innerHTML = svgContent;
      const svgEl = tempSpan.firstChild;
      // Copy classes if any
      if (el.className) svgEl.setAttribute('class', el.className);
      // Copy style if any
      const styleAttr = el.getAttribute('style');
      if (styleAttr) svgEl.setAttribute('style', styleAttr);
      // Copy dataset attributes
      svgEl.setAttribute('data-lucide', iconName);
      
      el.parentNode.replaceChild(svgEl, el);
    }
  });
}

// Initial Seed Data (in case LocalStorage is empty)
const SEED_TASKS = [
  {
    id: 'task-1',
    title: 'Prep Chemistry Lab Report',
    description: 'Summarize equations, clean up graph data, and write introduction paragraphs.',
    category: 'study',
    energyCost: 'high',
    deadline: getLocalDateTimeString(4 * 60 * 60 * 1000), // 4 hours from now
    complexity: 4,
    status: 'pending'
  },
  {
    id: 'task-2',
    title: 'Pay Electricity Bill',
    description: 'Avoid late fee. Verify meter reading invoice before transferring.',
    category: 'finance',
    energyCost: 'low',
    deadline: getLocalDateTimeString(18 * 60 * 60 * 1000), // 18 hours from now
    complexity: 1,
    status: 'pending'
  },
  {
    id: 'task-3',
    title: 'Review System Redesign Specs',
    description: 'Examine API schemas, write feedback on caching layers, and outline draft comments.',
    category: 'work',
    energyCost: 'high',
    deadline: getLocalDateTimeString(72 * 60 * 60 * 1000), // 3 days from now
    complexity: 5,
    status: 'pending'
  },
  {
    id: 'task-4',
    title: 'Clean Coding Workspace',
    description: 'Organize cables, clean keyboard, wipe down dual displays.',
    category: 'personal',
    energyCost: 'low',
    deadline: getLocalDateTimeString(30 * 60 * 60 * 1000), // 30 hours from now
    complexity: 2,
    status: 'pending'
  }
];

const SEED_HABITS = [
  {
    id: 'habit-1',
    name: 'Hydrate 3L Water',
    streak: 3,
    history: [] // Holds date strings of completed days
  },
  {
    id: 'habit-2',
    name: 'Review Daily Inbox',
    streak: 5,
    history: []
  }
];

// Sidebar Toggle Helper for Mobile
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');
}
window.toggleSidebar = toggleSidebar;

// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  safeCreateIcons();
  
  // Bind mobile menu toggle events
  const toggleBtn = document.getElementById('menu-toggle-btn');
  const closeBtn = document.getElementById('sidebar-close-btn');
  const overlay = document.getElementById('sidebar-overlay');
  if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);
  if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);
  if (overlay) overlay.addEventListener('click', toggleSidebar);
  
  // Start ticks
  updateDashboardTickers();
  setInterval(updateDashboardTickers, 1000);
  setInterval(updateEnergyLevel, 30000); // every 30s
  
  renderTasks();
  renderHabits();
  updateStats();
  
  // Trigger initial UI setup
  updateEnergyLevel();
});

// Load state from localStorage
function loadData() {
  const savedTasks = localStorage.getItem('deadlineiq_tasks');
  const savedHabits = localStorage.getItem('deadlineiq_habits');
  
  if (savedTasks) {
    // Load and migrate old UTC dates to local YYYY-MM-DDTHH:MM strings
    tasks = JSON.parse(savedTasks).map(t => {
      if (t.deadline && (t.deadline.includes('Z') || t.deadline.length > 16)) {
        const d = new Date(t.deadline);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        t.deadline = `${y}-${m}-${day}T${h}:${min}`;
      }
      return t;
    });
    saveTasks();
  } else {
    tasks = [...SEED_TASKS];
    saveTasks();
  }
  
  if (savedHabits) {
    habits = JSON.parse(savedHabits);
  } else {
    // Populate seed habits history with past 3-5 days to show streak visual
    const today = new Date();
    habits = SEED_HABITS.map(h => {
      const history = [];
      for (let i = 1; i <= h.streak; i++) {
        const pastDate = new Date();
        pastDate.setDate(today.getDate() - i);
        history.push(pastDate.toISOString().slice(0, 10));
      }
      h.history = history;
      return h;
    });
    saveHabits();
  }
}

// Save helpers
function saveTasks() {
  localStorage.setItem('deadlineiq_tasks', JSON.stringify(tasks));
}
function saveHabits() {
  localStorage.setItem('deadlineiq_habits', JSON.stringify(habits));
}

// Page Routing Controller
function showPage(pageId) {
  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-page') === pageId) {
      item.classList.add('active');
    }
  });

  // Switch display section
  document.querySelectorAll('.page-container').forEach(page => {
    page.classList.remove('active');
  });
  
  const targetPage = document.getElementById(`${pageId}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Update header text
  const titleMap = {
    'dashboard': 'Dashboard',
    'tasks': 'Task Brain & Prioritization',
    'calendar': 'Deadline Calendar',
    'focus': 'Focus Arena',
    'habits': 'Habit Streaks & Goals',
    'agent': 'AI Autonomous Agent'
  };
  document.getElementById('page-title-display').textContent = titleMap[pageId] || 'DeadlineIQ';

  // Trigger sub-module updates
  if (pageId === 'calendar' && typeof renderCalendar === 'function') {
    renderCalendar();
  }
  if (pageId === 'agent' && typeof updateAgentSelectors === 'function') {
    updateAgentSelectors();
  }
  if (pageId === 'tasks') {
    renderTasks();
  }
  
  // On mobile, close sidebar after navigation
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar && sidebar.classList.contains('active')) {
    sidebar.classList.remove('active');
  }
  if (overlay && overlay.classList.contains('active')) {
    overlay.classList.remove('active');
  }
}

// Stats & Efficiency Scores
function updateStats() {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending');
  const now = new Date();
  
  // Urgent: pending and due in <= 24 hours
  const urgent = pending.filter(t => {
    const deadlineDiff = new Date(t.deadline) - now;
    return deadlineDiff > 0 && deadlineDiff <= 24 * 60 * 60 * 1000;
  }).length;
  
  // Missed: pending and past deadline
  const missed = pending.filter(t => new Date(t.deadline) < now).length;

  // Update DOM stats
  document.getElementById('stat-saved-count').textContent = completed;
  document.getElementById('stat-urgent-count').textContent = urgent;
  
  // Calculate average habit streak
  let avgStreak = 0;
  if (habits.length > 0) {
    const sum = habits.reduce((acc, h) => acc + h.streak, 0);
    avgStreak = Math.round(sum / habits.length);
  }
  document.getElementById('stat-habit-streak').textContent = `${avgStreak}d`;

  // Efficiency gauge calculation
  const totalRelevant = completed + missed + urgent;
  let score = 0;
  if (totalRelevant > 0) {
    score = Math.round((completed / totalRelevant) * 100);
  } else if (tasks.length > 0) {
    score = Math.round((completed / tasks.length) * 100);
  }

  // Set ring offset
  const circleFill = document.getElementById('efficiency-gauge-fill');
  const scoreText = document.getElementById('efficiency-score-text');
  const scoreDesc = document.getElementById('efficiency-desc');
  
  if (circleFill && scoreText) {
    scoreText.textContent = `${score}%`;
    const radius = 60;
    const circumference = 2 * Math.PI * radius; // ~376.99
    const offset = circumference - (score / 100) * circumference;
    circleFill.style.strokeDashoffset = offset;
  }

  // Update description text based on score
  if (score >= 80) {
    scoreDesc.innerHTML = '🔥 <span style="color: var(--accent-emerald)">Elite Rescue Level!</span> You are mastering your time limits.';
  } else if (score >= 50) {
    scoreDesc.innerHTML = '⚡ <span style="color: var(--accent-amber)">Moderate Alert.</span> Schedule pending critical items.';
  } else {
    scoreDesc.innerHTML = '🚨 <span style="color: var(--accent-rose)">Rescue Critical.</span> Deadlines are slipping, use AI planner!';
  }
}

// Global System Timer Countdown (Header) & Tick update
function updateDashboardTickers() {
  const pending = tasks.filter(t => t.status === 'pending');
  const now = new Date();
  
  // Find nearest pending task
  let nearestTask = null;
  let minDiff = Infinity;
  
  pending.forEach(t => {
    const diff = new Date(t.deadline) - now;
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nearestTask = t;
    }
  });

  const ticker = document.getElementById('closest-deadline-ticker');
  const countdownText = document.getElementById('countdown-text');
  
  if (nearestTask) {
    const hours = Math.floor(minDiff / (1000 * 60 * 60));
    const mins = Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((minDiff % (1000 * 60)) / 1000);
    
    let timeStr = '';
    if (hours > 24) {
      timeStr = `${Math.floor(hours/24)}d ${hours%24}h`;
    } else {
      timeStr = `${hours}h ${mins}m ${secs}s`;
    }
    
    countdownText.textContent = `${nearestTask.title.slice(0, 15)}... in ${timeStr}`;
    
    // Style check
    ticker.className = 'header-countdown';
    if (minDiff <= 3 * 60 * 60 * 1000) { // < 3 hours is extreme critical
      ticker.classList.add('time-critical');
    } else if (minDiff <= 24 * 60 * 60 * 1000) { // < 24 hours warning
      ticker.classList.add('time-warning');
    } else {
      ticker.classList.add('time-safe');
    }
  } else {
    countdownText.textContent = 'No pending deadlines';
    ticker.className = 'header-countdown time-safe';
  }

  // Render dashboard specific nearest list
  const dashList = document.getElementById('dashboard-deadline-list');
  if (dashList && activePage === 'dashboard') {
    renderDashboardDeadlineList(dashList);
  }
}

// Simulated Energy levels based on hour of the day
function updateEnergyLevel() {
  const hr = new Date().getHours();
  let energy = 85; // Default focus energy
  let text = 'Peak Focus';
  
  if (hr >= 6 && hr < 11) {
    energy = 95;
    text = 'Prime Morning Peak';
  } else if (hr >= 11 && hr < 14) {
    energy = 80;
    text = 'Midday Focus';
  } else if (hr >= 14 && hr < 17) {
    energy = 60;
    text = 'Post-Lunch Dip';
  } else if (hr >= 17 && hr < 21) {
    energy = 85;
    text = 'Evening Hyper-focus';
  } else {
    energy = 50;
    text = 'Night Recovery';
  }
  
  const badge = document.getElementById('energy-badge');
  if (badge) {
    badge.querySelector('span').textContent = `Energy: ${energy}% (${text})`;
    const icon = badge.querySelector('i, svg');
    if (icon) {
      if (energy >= 85) {
        icon.setAttribute('data-lucide', 'battery-charging');
      } else if (energy >= 60) {
        icon.setAttribute('data-lucide', 'battery');
      } else {
        icon.setAttribute('data-lucide', 'battery-low');
      }
    }
    safeCreateIcons();
  }
}

// Renders the mini deadline panel on the dashboard
function renderDashboardDeadlineList(container) {
  const pending = tasks.filter(t => t.status === 'pending');
  const now = new Date();
  
  // Sort by deadline
  pending.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  
  const subset = pending.slice(0, 3);
  if (subset.length === 0) {
    container.innerHTML = `<p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 20px 0;">All clear! No deadlines pending.</p>`;
    return;
  }

  container.innerHTML = subset.map(t => {
    const diff = new Date(t.deadline) - now;
    let badgeClass = 'time-safe';
    let timeStr = 'Safe';
    
    if (diff < 0) {
      badgeClass = 'time-critical';
      timeStr = 'Overdue';
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 3) {
        badgeClass = 'time-critical';
        timeStr = `${hours}h remaining`;
      } else if (hours < 24) {
        badgeClass = 'time-warning';
        timeStr = `${hours}h remaining`;
      } else {
        timeStr = `${Math.round(hours / 24)}d left`;
      }
    }

    return `
      <div class="deadline-item">
        <div class="deadline-meta">
          <span class="deadline-name">${t.title}</span>
          <span class="deadline-tag"><i data-lucide="tag" style="width: 12px; height: 12px;"></i> ${t.category}</span>
        </div>
        <div class="deadline-time">
          <span class="time-left ${badgeClass}">${timeStr}</span>
        </div>
      </div>
    `;
  }).join('');
  
  safeCreateIcons();
}

// Renders main task list
function renderTasks() {
  const container = document.getElementById('main-task-list');
  if (!container) return;

  const now = new Date();
  let filtered = [...tasks];

  // Filter logic
  if (activeFilter === 'active') {
    filtered = filtered.filter(t => t.status === 'pending');
  } else if (activeFilter === 'completed') {
    filtered = filtered.filter(t => t.status === 'completed');
  } else if (activeFilter === 'urgent') {
    filtered = filtered.filter(t => {
      const diff = new Date(t.deadline) - now;
      return t.status === 'pending' && diff > 0 && diff <= 24 * 60 * 60 * 1000;
    });
  }

  // Render Eisenhower Matrix or Regular List
  if (showMatrix) {
    document.getElementById('eisenhower-grid').style.display = 'grid';
    container.style.display = 'none';
    renderEisenhowerMatrix();
    return;
  } else {
    document.getElementById('eisenhower-grid').style.display = 'none';
    container.style.display = 'flex';
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        <i data-lucide="check-circle-2" style="width: 48px; height: 48px; margin-bottom: 12px; stroke-width: 1;"></i>
        <p>No tasks found matching this criteria.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(t => {
    const isOverdue = t.status === 'pending' && new Date(t.deadline) < now;
    const dateFormatted = new Date(t.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    return `
      <div class="task-card ${t.status === 'completed' ? 'completed' : ''}" data-id="${t.id}">
        <div class="task-card-left">
          <div class="custom-checkbox ${t.status === 'completed' ? 'checked' : ''}" onclick="toggleTask('${t.id}')"></div>
          <div class="task-card-details">
            <span class="task-card-title">${t.title}</span>
            <div class="task-card-meta">
              <span style="color: ${isOverdue ? 'var(--accent-rose)' : 'var(--text-secondary)'}; font-weight: ${isOverdue ? '600' : '400'}">
                <i data-lucide="clock" style="width: 12px; height: 12px;"></i> 
                ${isOverdue ? 'OVERDUE: ' : ''}${dateFormatted}
              </span>
              <span>•</span>
              <span class="task-energy-badge badge-${t.energyCost}">${t.energyCost} Energy</span>
              <span>•</span>
              <span style="text-transform: uppercase;">${t.category}</span>
            </div>
          </div>
        </div>
        <div class="task-card-right">
          <div class="task-card-actions">
            <button class="btn btn-secondary btn-icon" onclick="deleteTask('${t.id}')" title="Delete Task">
              <i data-lucide="trash-2" style="width: 16px; height: 16px; color: var(--accent-rose)"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  safeCreateIcons();
}

// Renders Eisenhower Matrix Quadrants
function renderEisenhowerMatrix() {
  const quads = {
    do: document.getElementById('quad-content-do'),
    plan: document.getElementById('quad-content-plan'),
    delegate: document.getElementById('quad-content-delegate'),
    eliminate: document.getElementById('quad-content-eliminate')
  };

  // Clear previous
  Object.values(quads).forEach(el => el.innerHTML = '');

  const counts = { do: 0, plan: 0, delegate: 0, eliminate: 0 };
  const now = new Date();

  tasks.forEach(t => {
    // Determine Urgency: <= 36 hours
    const isUrgent = (new Date(t.deadline) - now) <= 36 * 60 * 60 * 1000;
    // Determine Importance: Complexity >= 3 or Study/Work/Finance categories
    const isImportant = t.complexity >= 3 || ['work', 'study', 'finance'].includes(t.category);

    let quadKey = 'eliminate';
    if (isUrgent && isImportant) quadKey = 'do';
    else if (!isUrgent && isImportant) quadKey = 'plan';
    else if (isUrgent && !isImportant) quadKey = 'delegate';

    if (t.status === 'pending') {
      counts[quadKey]++;
      
      const itemEl = document.createElement('div');
      itemEl.className = 'quad-item';
      itemEl.innerHTML = `
        <span>${t.title}</span>
        <i data-lucide="arrow-right" style="width: 12px; height: 12px; color: var(--text-muted);"></i>
      `;
      itemEl.addEventListener('click', () => {
        // Switch to detail view or prompt action
        showPage('tasks');
        setTaskFilter('all', document.querySelector('.task-filters button'));
        toggleEisenhowerMatrix(document.querySelector('[onclick*="toggleEisenhowerMatrix"]'));
      });
      quads[quadKey].appendChild(itemEl);
    }
  });

  // Update counts in header
  Object.keys(counts).forEach(key => {
    document.getElementById(`count-quad-${key}`).textContent = counts[key];
    if (counts[key] === 0) {
      quads[key].innerHTML = `<p style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 15px 0;">All clear</p>`;
    }
  });

  safeCreateIcons();
}

// Tasks Actions
function toggleTask(id) {
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index].status = tasks[index].status === 'completed' ? 'pending' : 'completed';
    saveTasks();
    renderTasks();
    updateStats();
    updateDashboardTickers();
    
    // Play subtle audio alert if completed
    if (tasks[index].status === 'completed' && typeof playCompletionChime === 'function') {
      playCompletionChime();
    }
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  updateStats();
  updateDashboardTickers();
  
  if (typeof updateAgentSelectors === 'function') {
    updateAgentSelectors();
  }
}

function setTaskFilter(filter, btn) {
  activeFilter = filter;
  document.querySelectorAll('.task-filters .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

function toggleEisenhowerMatrix(btn) {
  showMatrix = !showMatrix;
  if (showMatrix) {
    btn.classList.add('active');
    btn.innerHTML = `<i data-lucide="list"></i> List View`;
  } else {
    btn.classList.remove('active');
    btn.innerHTML = `<i data-lucide="grid"></i> Eisenhower Grid`;
  }
  renderTasks();
  lucide.createIcons();
}

// Modals triggers
function openTaskModal() {
  document.getElementById('task-modal').classList.add('active');
  // Pre-fill local date-time to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  document.getElementById('task-deadline-input').value = tomorrow.toISOString().slice(0, 16);
}

function closeTaskModal() {
  document.getElementById('task-modal').classList.remove('active');
}

function submitTaskModal() {
  const title = document.getElementById('task-title-input').value.trim();
  const desc = document.getElementById('task-desc-input').value.trim();
  const category = document.getElementById('task-category-input').value;
  const energy = document.getElementById('task-energy-input').value;
  const deadline = document.getElementById('task-deadline-input').value;
  const complexity = parseInt(document.getElementById('task-complexity-input').value, 10);

  if (!title) {
    alert('Please enter a title');
    return;
  }

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    description: desc,
    category,
    energyCost: energy,
    deadline,
    complexity,
    status: 'pending'
  };

  tasks.push(newTask);
  saveTasks();
  closeTaskModal();
  
  // Clear inputs
  document.getElementById('task-title-input').value = '';
  document.getElementById('task-desc-input').value = '';
  
  // Refresh views
  renderTasks();
  updateStats();
  updateDashboardTickers();
  
  if (typeof updateAgentSelectors === 'function') {
    updateAgentSelectors();
  }
  
  if (typeof renderCalendar === 'function') {
    renderCalendar();
  }

  // Voice greeting confirmation
  if (typeof speakRecommendation === 'function') {
    speakRecommendation(`Target saved. ${title} added to queue.`);
  }
}

// AI Prioritizer Optimizer
function runAIPrioritization() {
  const pending = tasks.filter(t => t.status === 'pending');
  if (pending.length === 0) {
    alert("Add some pending tasks first!");
    return;
  }

  const now = new Date();

  // Sort logic (RPS calculation)
  const evaluated = pending.map(t => {
    const deadlineDiff = new Date(t.deadline) - now;
    const hoursRemaining = deadlineDiff / (1000 * 60 * 60);

    // Time Factor: closer deadline = higher factor
    let timeFactor = 0;
    if (hoursRemaining <= 0) {
      timeFactor = 100; // Overdue
    } else {
      timeFactor = Math.max(0, 100 - (hoursRemaining / 1.5)); // Drops off quickly
    }

    // Complexity Factor
    const complexityFactor = t.complexity * 20; // max 100

    // Energy Factor
    const energyMap = { high: 100, medium: 60, low: 30 };
    const energyFactor = energyMap[t.energyCost] || 50;

    // Rescue Priority Score
    const rps = Math.round((timeFactor * 0.6) + (complexityFactor * 0.25) + (energyFactor * 0.15));

    return { ...t, rps, hoursRemaining };
  });

  // Sort descending
  evaluated.sort((a, b) => b.rps - a.rps);

  // Re-map tasks array so pending items match the sorted sequence
  const completed = tasks.filter(t => t.status === 'completed');
  tasks = [...evaluated, ...completed];
  saveTasks();

  // Update render
  renderTasks();
  
  // Build AI Insights text
  const topTask = evaluated[0];
  const container = document.getElementById('ai-insights-container');
  const reasoningBody = document.getElementById('ai-task-reasoning-body');
  
  const textTitle = topTask.title;
  const timeText = topTask.hoursRemaining < 0 
    ? 'overdue' 
    : `due in ${Math.round(topTask.hoursRemaining)} hours`;

  const insightHTML = `
    <div class="ai-insight-item" style="border-left: 2px solid var(--accent-rose); padding-left: 10px;">
      <i data-lucide="alert-triangle" style="color: var(--accent-rose);"></i>
      <p><b>CRITICAL FOCUS ALERT:</b> We recommend immediately starting on <span>${textTitle}</span>. It is ${timeText} and requires <span>${topTask.energyCost} energy</span>.</p>
    </div>
    <div class="ai-insight-item">
      <i data-lucide="check" style="color: var(--accent-teal);"></i>
      <p><b>Rescue Plan Configured:</b> Tasks have been reordered based on Rescue Urgency Index. Total complexity score is <b>${evaluated.reduce((acc, t) => acc + t.complexity, 0)}</b>. Work through them from top to bottom.</p>
    </div>
  `;
  
  container.innerHTML = insightHTML;

  // Render reasoning panel
  const totalComplexity = evaluated.reduce((acc, t) => acc + t.complexity, 0);
  const nextMinutes = Math.min(90, Math.max(25, totalComplexity * 10));
  
  document.getElementById('ai-complexity-total').textContent = `${totalComplexity} / ${tasks.length * 5}`;
  document.getElementById('ai-next-duration').textContent = `${nextMinutes} min block`;
  
  reasoningBody.innerHTML = `
    <p><b>AI Prioritization Algorithm Diagnostic:</b></p>
    <ul style="margin-left: 20px; margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
      ${evaluated.slice(0, 3).map((t, idx) => `
        <li>
          <b>#${idx+1} ${t.title}:</b> Rescue Urgency Index: <span style="color: var(--accent-purple); font-weight:600;">${t.rps}</span>. 
          Complexity factor is ${t.complexity}/5. Energy matches energy constraints.
        </li>
      `).join('')}
    </ul>
    <p style="margin-top: 15px; font-size: 13px; color: var(--text-muted);">
      Calculations weight deadline proximity at 60%, mental/physical complexity at 25%, and matching energy profiles at 15%.
    </p>
  `;

  // Trigger TTS voice warning
  if (typeof speakRecommendation === 'function') {
    speakRecommendation(`Schedule optimized. Your highest priority target is ${textTitle}. Let's focus on completing it first.`);
  }

  safeCreateIcons();
}

// Habits Tracking Logic
function renderHabits() {
  const container = document.getElementById('habits-list-container');
  if (!container) return;

  if (habits.length === 0) {
    container.innerHTML = `<p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 40px 0; grid-column: 1 / -1;">No habits tracked yet. Click Add Habit to start.</p>`;
    return;
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIndex = new Date().getDay();

  container.innerHTML = habits.map(h => {
    // Generate completion status for last 7 days (ending today)
    let historyDaysHTML = '';
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6); // past 7 days

    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(startOfWeek.getDate() + i);
      const curStr = current.toISOString().slice(0, 10);
      const isCompleted = h.history.includes(curStr);
      const dayName = daysOfWeek[current.getDay()];
      const isFuture = current > new Date();

      historyDaysHTML += `
        <div class="habit-day">
          <span class="habit-day-label">${dayName}</span>
          <div class="habit-day-dot ${isCompleted ? 'completed' : ''} ${isFuture ? 'future' : ''}" 
               onclick="${isFuture ? '' : `toggleHabitDay('${h.id}', '${curStr}')`}">
            ${isCompleted ? '✓' : ''}
          </div>
        </div>
      `;
    }

    return `
      <div class="habit-card glass-panel">
        <div class="habit-header">
          <span class="habit-title">${h.name}</span>
          <span class="habit-streak"><i data-lucide="zap" style="width: 12px; height: 12px; fill: var(--accent-amber);"></i> ${h.streak} Day Streak</span>
        </div>
        <div class="habit-history">
          ${historyDaysHTML}
        </div>
      </div>
    `;
  }).join('');

  safeCreateIcons();
}

function toggleHabitDay(habitId, dateStr) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  const index = habit.history.indexOf(dateStr);
  if (index === -1) {
    // Complete day
    habit.history.push(dateStr);
  } else {
    // Remove completion
    habit.history.splice(index, 1);
  }

  // Recalculate streak
  recalculateHabitStreak(habit);
  saveHabits();
  renderHabits();
  updateStats();
}

function recalculateHabitStreak(habit) {
  let streak = 0;
  const checkDate = new Date();
  
  // Walk backwards from today, checking completions
  while (true) {
    const checkStr = checkDate.toISOString().slice(0, 10);
    if (habit.history.includes(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If we miss today, we check if we completed yesterday (streak might still be alive)
      if (checkStr === new Date().toISOString().slice(0, 10)) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = checkDate.toISOString().slice(0, 10);
        if (habit.history.includes(yesterdayStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }
  habit.streak = streak;
}

// Habit Modal Triggers
function openHabitModal() {
  document.getElementById('habit-modal').classList.add('active');
}
function closeHabitModal() {
  document.getElementById('habit-modal').classList.remove('active');
}
function submitHabitModal() {
  const name = document.getElementById('habit-name-input').value.trim();
  if (!name) {
    alert('Please enter habit name');
    return;
  }

  const newHabit = {
    id: `habit-${Date.now()}`,
    name,
    streak: 0,
    history: []
  };

  habits.push(newHabit);
  saveHabits();
  closeHabitModal();
  document.getElementById('habit-name-input').value = '';
  renderHabits();
  updateStats();
}
