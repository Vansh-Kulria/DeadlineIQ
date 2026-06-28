import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

const AppContext = createContext();

// Paste your Google AI Studio / Gemini API Key here to enable real AI generation
const GEMINI_API_KEY = ""; 


// Helper to generate local YYYY-MM-DDTHH:MM strings
export function getLocalDateTimeString(offsetMs = 0) {
  const d = new Date(Date.now() + offsetMs);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:${min}`;
}

const SEED_TASKS = [
  {
    id: 'task-1',
    title: 'Prep Chemistry Lab Report',
    description: 'Summarize equations, clean up graph data, and write introduction paragraphs.',
    category: 'study',
    energyCost: 'high',
    deadline: getLocalDateTimeString(4 * 60 * 60 * 1000), // 4 hours from now
    complexity: 4,
    status: 'pending',
    estimatedTime: '3h 0m',
    subtasks: [
      { id: 'sub-1-1', title: 'Summarize key equations', completed: true },
      { id: 'sub-1-2', title: 'Clean up graph data & plots', completed: false },
      { id: 'sub-1-3', title: 'Write introduction paragraphs', completed: false }
    ],
    priorityScore: 88,
    priorityLevel: 'Critical',
    missRisk: 75
  },
  {
    id: 'task-2',
    title: 'Pay Electricity Bill',
    description: 'Avoid late fee. Verify meter reading invoice before transferring.',
    category: 'finance',
    energyCost: 'low',
    deadline: getLocalDateTimeString(18 * 60 * 60 * 1000), // 18 hours from now
    complexity: 1,
    status: 'pending',
    estimatedTime: '0h 45m',
    subtasks: [
      { id: 'sub-2-1', title: 'Verify meter reading invoice', completed: false },
      { id: 'sub-2-2', title: 'Transfer fund payment securely', completed: false }
    ],
    priorityScore: 48,
    priorityLevel: 'Medium',
    missRisk: 20
  },
  {
    id: 'task-3',
    title: 'Review System Redesign Specs',
    description: 'Examine API schemas, write feedback on caching layers, and outline draft comments.',
    category: 'work',
    energyCost: 'high',
    deadline: getLocalDateTimeString(72 * 60 * 60 * 1000), // 3 days from now
    complexity: 5,
    status: 'pending',
    estimatedTime: '3h 45m',
    subtasks: [
      { id: 'sub-3-1', title: 'Examine API endpoint schemas', completed: false },
      { id: 'sub-3-2', title: 'Write feedback on caching layers', completed: false },
      { id: 'sub-3-3', title: 'Outline draft comments for team', completed: false }
    ],
    priorityScore: 65,
    priorityLevel: 'High',
    missRisk: 30
  },
  {
    id: 'task-4',
    title: 'Clean Coding Workspace',
    description: 'Organize cables, clean keyboard, wipe down dual displays.',
    category: 'personal',
    energyCost: 'low',
    deadline: getLocalDateTimeString(30 * 60 * 60 * 1000), // 30 hours from now
    complexity: 2,
    status: 'pending',
    estimatedTime: '1h 30m',
    subtasks: [
      { id: 'sub-4-1', title: 'Organize desktop cables', completed: true },
      { id: 'sub-4-2', title: 'Clean mechanical keyboard', completed: false },
      { id: 'sub-4-3', title: 'Wipe down dual displays', completed: false }
    ],
    priorityScore: 35,
    priorityLevel: 'Low',
    missRisk: 15
  }
];

const SEED_HABITS = [
  {
    id: 'habit-1',
    name: 'Hydrate 3L Water',
    streak: 3,
    history: []
  },
  {
    id: 'habit-2',
    name: 'Review Daily Inbox',
    streak: 5,
    history: []
  }
];

const SEED_GOALS = [
  {
    id: 'goal-1',
    title: 'Learn Machine Learning',
    progress: 60,
    weeks: [
      {
        name: 'Week 1: Core Prerequisites',
        tasks: [
          { id: 'gt-1', title: 'Python Basics Revision', completed: true },
          { id: 'gt-2', title: 'NumPy Arrays & Math Operations', completed: true },
          { id: 'gt-3', title: 'Pandas Data Analysis Toolkit', completed: false }
        ]
      },
      {
        name: 'Week 2: Supervised Learning Models',
        tasks: [
          { id: 'gt-4', title: 'Linear Regression implementation', completed: false },
          { id: 'gt-5', title: 'Classification with Decision Trees', completed: false }
        ]
      }
    ]
  }
];

// Helper to calculate task priority and deadline miss risk
export const calculatePriority = (task) => {
  const now = new Date();
  const deadlineDiff = new Date(task.deadline) - now;
  const hoursRemaining = deadlineDiff / (1000 * 60 * 60);

  let timeFactor = 0;
  if (hoursRemaining <= 0) {
    timeFactor = 100;
  } else {
    // scale factor based on deadline: closer deadline = higher score
    timeFactor = Math.max(0, 100 - (hoursRemaining / 1.5));
  }

  const complexityFactor = (task.complexity || 3) * 20;
  const energyMap = { high: 100, medium: 60, low: 30 };
  const energyFactor = energyMap[task.energyCost] || 50;

  // priorityScore out of 100
  const priorityScore = Math.round((timeFactor * 0.6) + (complexityFactor * 0.25) + (energyFactor * 0.15));

  let priorityLevel = 'Low';
  if (priorityScore >= 80) priorityLevel = 'Critical';
  else if (priorityScore >= 60) priorityLevel = 'High';
  else if (priorityScore >= 40) priorityLevel = 'Medium';

  // missRisk: Urgency index based on complexity-based estimated hours vs remaining time
  const estHours = (task.complexity || 3) * 0.75;
  let missRisk = 15;
  if (hoursRemaining <= 0) {
    missRisk = 100;
  } else {
    const ratio = estHours / hoursRemaining;
    missRisk = Math.min(99, Math.round(Math.max(10, ratio * 50 + (task.complexity || 3) * 5)));
  }

  return {
    priorityScore,
    priorityLevel,
    missRisk
  };
};

// Smart dynamic roadmap generator
export const generateSmartRoadmap = (title) => {
  const clean = title.toLowerCase().trim();
  let weeks = [];
  const titleCap = title.charAt(0).toUpperCase() + title.slice(1);

  if (clean.includes('react') || clean.includes('native') || clean.includes('frontend') || clean.includes('web dev') || clean.includes('javascript') || clean.includes('code') || clean.includes('programming') || clean.includes('website') || clean.includes('html') || clean.includes('css')) {
    weeks = [
      {
        name: 'Week 1: Setup & Environment Configurations',
        tasks: [
          { id: `gt-${Date.now()}-1`, title: 'Initialize repository, configure prettier/eslint and linters', completed: false },
          { id: `gt-${Date.now()}-2`, title: 'Sketch component hierarchy tree and draft primary views', completed: false },
          { id: `gt-${Date.now()}-3`, title: 'Write local states, custom event listeners, and hooks', completed: false },
          { id: `gt-${Date.now()}-4`, title: 'Configure CSS variables, styling layouts, and media queries', completed: false }
        ]
      },
      {
        name: 'Week 2: Global State & API Orchestration',
        tasks: [
          { id: `gt-${Date.now()}-5`, title: 'Set up Global Context provider and action dispatcher hooks', completed: false },
          { id: `gt-${Date.now()}-6`, title: 'Integrate API authentication services and tokens', completed: false },
          { id: `gt-${Date.now()}-7`, title: 'Orchestrate API requests, loader widgets and error flags', completed: false }
        ]
      },
      {
        name: 'Week 3: Accessibility Auditing & Testing',
        tasks: [
          { id: `gt-${Date.now()}-8`, title: 'Write unit tests for state actions and core logic components', completed: false },
          { id: `gt-${Date.now()}-9`, title: 'Audit Accessibility guidelines, tab indexing and contrast ratios', completed: false },
          { id: `gt-${Date.now()}-10`, title: 'Benchmark execution delays and resolve component rendering lag', completed: false }
        ]
      },
      {
        name: 'Week 4: Continuous Delivery & Release',
        tasks: [
          { id: `gt-${Date.now()}-11`, title: 'Configure deployment workflows via GitHub Actions', completed: false },
          { id: `gt-${Date.now()}-12`, title: 'Compile assets and push static content to host systems', completed: false },
          { id: `gt-${Date.now()}-13`, title: 'Publish clean README setup guide and wiki documentation', completed: false }
        ]
      }
    ];
  } else if (clean.includes('ml') || clean.includes('machine learning') || clean.includes('ai') || clean.includes('data science') || clean.includes('python') || clean.includes('deep learning')) {
    weeks = [
      {
        name: 'Week 1: Prerequisites & Data Wrangling',
        tasks: [
          { id: `gt-${Date.now()}-1`, title: 'Revise linear algebra concepts, math tools, and probabilities', completed: false },
          { id: `gt-${Date.now()}-2`, title: 'Import raw datasets, run descriptive statistics, and plot variables', completed: false },
          { id: `gt-${Date.now()}-3`, title: 'Wrangle missing properties, perform feature scale transforms', completed: false }
        ]
      },
      {
        name: 'Week 2: Classic Supervised Training',
        tasks: [
          { id: `gt-${Date.now()}-4`, title: 'Train baseline Regression, Random Forest, and SVM models', completed: false },
          { id: `gt-${Date.now()}-5`, title: 'Analyze accuracy distributions via confusion matrices & ROC-AUC curves', completed: false },
          { id: `gt-${Date.now()}-6`, title: 'Run automated parameter tuning grids to identify optimal configs', completed: false }
        ]
      },
      {
        name: 'Week 3: Deep Learning Frameworks',
        tasks: [
          { id: `gt-${Date.now()}-7`, title: 'Build Neural Networks architectures using PyTorch/TensorFlow', completed: false },
          { id: `gt-${Date.now()}-8`, title: 'Draft custom SGD loops, gradient steps, and loss metrics', completed: false },
          { id: `gt-${Date.now()}-9`, title: 'Configure regularization, dropout layers, and serialize checkpoints', completed: false }
        ]
      },
      {
        name: 'Week 4: Model Serving & REST APIs',
        tasks: [
          { id: `gt-${Date.now()}-10`, title: 'Export trained model artifacts to portable ONNX files', completed: false },
          { id: `gt-${Date.now()}-11`, title: 'Construct inference API endpoints using FastAPI handlers', completed: false },
          { id: `gt-${Date.now()}-12`, title: 'Dockerize model services and host on cloud container systems', completed: false }
        ]
      }
    ];
  } else if (clean.includes('fit') || clean.includes('weight') || clean.includes('gym') || clean.includes('workout') || clean.includes('run') || clean.includes('marathon') || clean.includes('cardio') || clean.includes('exercise')) {
    weeks = [
      {
        name: 'Week 1: Assessment & Target Calculation',
        tasks: [
          { id: `gt-${Date.now()}-1`, title: 'Establish weight, bodyfat, active energy and caloric baseline logs', completed: false },
          { id: `gt-${Date.now()}-2`, title: 'Draft weekly training routines with 3 active slots and 2 rest days', completed: false },
          { id: `gt-${Date.now()}-3`, title: 'Calculate daily target macronutrients and organize meal prep schedules', completed: false }
        ]
      },
      {
        name: 'Week 2: Strength Foundations & Cardio Base',
        tasks: [
          { id: `gt-${Date.now()}-4`, title: 'Execute three cardiovascular workouts focusing on aerobic base', completed: false },
          { id: `gt-${Date.now()}-5`, title: 'Perform two functional resistance sessions using correct form', completed: false },
          { id: `gt-${Date.now()}-6`, title: 'Maintain daily target hydration of 3 liters of water', completed: false }
        ]
      },
      {
        name: 'Week 3: Progressive Resistance Load',
        tasks: [
          { id: `gt-${Date.now()}-7`, title: 'Increase resistance weights or mileage by 10% (progressive overload)', completed: false },
          { id: `gt-${Date.now()}-8`, title: 'Record training forms via video for safety assessment audits', completed: false },
          { id: `gt-${Date.now()}-9`, title: 'Incorporate active recovery sessions (stretching/yoga)', completed: false }
        ]
      },
      {
        name: 'Week 4: Assessment & Next Training Plan',
        tasks: [
          { id: `gt-${Date.now()}-10`, title: 'Perform physical measurement checkups to trace changes', completed: false },
          { id: `gt-${Date.now()}-11`, title: 'Review workout logs and cross-examine consistency ratings', completed: false },
          { id: `gt-${Date.now()}-12`, title: 'Calibrate parameters to define the next training cycle rules', completed: false }
        ]
      }
    ];
  } else if (clean.includes('guitar') || clean.includes('piano') || clean.includes('music') || clean.includes('sing') || clean.includes('instrument')) {
    weeks = [
      {
        name: 'Week 1: Instrument Fundamentals',
        tasks: [
          { id: `gt-${Date.now()}-1`, title: 'Learn key tuning configurations, hand posture, and note structures', completed: false },
          { id: `gt-${Date.now()}-2`, title: 'Execute basic muscle/finger movement drills for 15m daily', completed: false },
          { id: `gt-${Date.now()}-3`, title: 'Memorize first three fundamental chords/notes', completed: false }
        ]
      },
      {
        name: 'Week 2: Rhythmic Transitions',
        tasks: [
          { id: `gt-${Date.now()}-4`, title: 'Practice chord changes cleanly with a slow metronome tempo', completed: false },
          { id: `gt-${Date.now()}-5`, title: 'Learn two common strumming or note-playing rhythm guides', completed: false },
          { id: `gt-${Date.now()}-6`, title: 'Record a short playing audio to verify tempo compliance', completed: false }
        ]
      },
      {
        name: 'Week 3: First Song Breakdown',
        tasks: [
          { id: `gt-${Date.now()}-7`, title: 'Deconstruct a simple beginner song chord sequence', completed: false },
          { id: `gt-${Date.now()}-8`, title: 'Practice transition loops in song structures repeatedly', completed: false },
          { id: `gt-${Date.now()}-9`, title: 'Play through full song structure at 75% metronome speed', completed: false }
        ]
      },
      {
        name: 'Week 4: Performance Review',
        tasks: [
          { id: `gt-${Date.now()}-10`, title: 'Execute full song at normal speed along with track', completed: false },
          { id: `gt-${Date.now()}-11`, title: 'Revise major scale outlines to build solo skills', completed: false },
          { id: `gt-${Date.now()}-12`, title: 'Record final performance video to capture progress milestones', completed: false }
        ]
      }
    ];
  } else if (clean.includes('spanish') || clean.includes('french') || clean.includes('japanese') || clean.includes('german') || clean.includes('language') || clean.includes('speak')) {
    weeks = [
      {
        name: 'Week 1: Alphabet & Basic Phrases',
        tasks: [
          { id: `gt-${Date.now()}-1`, title: 'Learn phonetic structures and pronunciation key systems', completed: false },
          { id: `gt-${Date.now()}-2`, title: 'Memorize top 50 essential vocabulary words and greetings', completed: false },
          { id: `gt-${Date.now()}-3`, title: 'Practice basic conversational introductions out loud', completed: false }
        ]
      },
      {
        name: 'Week 2: Core Sentence Structure',
        tasks: [
          { id: `gt-${Date.now()}-4`, title: 'Study standard sentence structures and order rules', completed: false },
          { id: `gt-${Date.now()}-5`, title: 'Conjugate top 10 most frequent action verbs', completed: false },
          { id: `gt-${Date.now()}-6`, title: 'Write down 15 basic sentences describing daily schedules', completed: false }
        ]
      },
      {
        name: 'Week 3: Conversational Comprehension',
        tasks: [
          { id: `gt-${Date.now()}-7`, title: 'Listen to a basic conversational audio segment at 0.8x speed', completed: false },
          { id: `gt-${Date.now()}-8`, title: 'Translate simple written paragraphs using reference resources', completed: false },
          { id: `gt-${Date.now()}-9`, title: 'Drill flashcard sets for everyday noun terms (100 words)', completed: false }
        ]
      },
      {
        name: 'Week 4: Speaking Consistency',
        tasks: [
          { id: `gt-${Date.now()}-10`, title: 'Perform a 5-minute continuous monologue in target language', completed: false },
          { id: `gt-${Date.now()}-11`, title: 'Compile basic grammar charts and note common verb tables', completed: false },
          { id: `gt-${Date.now()}-12`, title: 'Record conversational voice files to verify flow progress', completed: false }
        ]
      }
    ];
  } else if (clean.includes('book') || clean.includes('write') || clean.includes('novel') || clean.includes('story') || clean.includes('article') || clean.includes('draft')) {
    weeks = [
      {
        name: 'Week 1: Theme & Characterization',
        tasks: [
          { id: `gt-${Date.now()}-1`, title: 'Draft primary premises, main themes, and audience notes', completed: false },
          { id: `gt-${Date.now()}-2`, title: 'Establish comprehensive profiles for main characters (motivation, conflict)', completed: false },
          { id: `gt-${Date.now()}-3`, title: 'Define settings, structural rules, and primary conflict setups', completed: false }
        ]
      },
      {
        name: 'Week 2: Structural Outlining',
        tasks: [
          { id: `gt-${Date.now()}-4`, title: 'Structure plot points along standard three-act guidelines', completed: false },
          { id: `gt-${Date.now()}-5`, title: 'Draft chapter-by-chapter timeline bullet items', completed: false },
          { id: `gt-${Date.now()}-6`, title: 'Draft initial hook scene and introductory paragraphs', completed: false }
        ]
      },
      {
        name: 'Week 3: Drafting Phase',
        tasks: [
          { id: `gt-${Date.now()}-7`, title: 'Write first three chapters focusing entirely on narrative flow', completed: false },
          { id: `gt-${Date.now()}-8`, title: 'Track daily word count outputs (target 500 words daily)', completed: false },
          { id: `gt-${Date.now()}-9`, title: 'Develop midpoint turning points and character twist scenes', completed: false }
        ]
      },
      {
        name: 'Week 4: Review & Revisions',
        tasks: [
          { id: `gt-${Date.now()}-10`, title: 'Read draft files aloud to verify pacing and dialogue naturalness', completed: false },
          { id: `gt-${Date.now()}-11`, title: 'Fix structural pacing problems and rewrite weak paragraphs', completed: false },
          { id: `gt-${Date.now()}-12`, title: 'Format draft file assets and forward to peer reviewers', completed: false }
        ]
      }
    ];
  } else {
    // Dynamic fallback that uses the title itself to customize tasks!
    weeks = [
      {
        name: 'Week 1: Definition & Scoping',
        tasks: [
          { id: `gt-${Date.now()}-1`, title: `Outline core requirements for "${titleCap}"`, completed: false },
          { id: `gt-${Date.now()}-2`, title: `Research references and gather essential assets for "${titleCap}"`, completed: false },
          { id: `gt-${Date.now()}-3`, title: `Draft preliminary constraints and targets for "${titleCap}"`, completed: false }
        ]
      },
      {
        name: 'Week 2: Structural Setup & Skeleton',
        tasks: [
          { id: `gt-${Date.now()}-4`, title: `Setup baseline configurations for "${titleCap}"`, completed: false },
          { id: `gt-${Date.now()}-5`, title: `Establish structural skeleton of "${titleCap}"`, completed: false },
          { id: `gt-${Date.now()}-6`, title: `Verify preliminary setup functions conform to parameters`, completed: false }
        ]
      },
      {
        name: 'Week 3: Core Execution & Implementation',
        tasks: [
          { id: `gt-${Date.now()}-7`, title: `Implement primary mechanisms of "${titleCap}"`, completed: false },
          { id: `gt-${Date.now()}-8`, title: `Refactor core logic components to streamline flow`, completed: false },
          { id: `gt-${Date.now()}-9`, title: `Conduct intermediate evaluation checks against goals`, completed: false }
        ]
      },
      {
        name: 'Week 4: Optimization & Deployment',
        tasks: [
          { id: `gt-${Date.now()}-10`, title: `Audit performance metrics and execute error tests`, completed: false },
          { id: `gt-${Date.now()}-11`, title: `Write usage guides and wiki documents for "${titleCap}"`, completed: false },
          { id: `gt-${Date.now()}-12`, title: `Launch completed version of "${titleCap}" and log completion`, completed: false }
        ]
      }
    ];
  }

  return {
    id: `goal-${Date.now()}`,
    title: titleCap,
    progress: 0,
    weeks
  };
};

export const AppProvider = ({ children }) => {
  // Routing & UI
  const [activePage, setActivePage] = useState('dashboard');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showMatrix, setShowMatrix] = useState(false);

  // Authentication State
  const [user, setUser] = useState(null);
  const [localMode, setLocalMode] = useState(() => localStorage.getItem('deadlineiq_local_mode') === '1');
  const [authLoading, setAuthLoading] = useState(true);

  // Syncing state
  const [syncStatus, setSyncStatus] = useState('local'); // 'syncing' | 'synced' | 'offline' | 'local'

  // Data State
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);

  // AI Priorities Analytics state
  const [aiInsights, setAiInsights] = useState(null);
  const [aiPrioritized, setAiPrioritized] = useState(false);

  // Pomodoro Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerDuration, setTimerDuration] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('work'); // 'work' | 'break'

  // Soundscape Web Audio API refs
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef({ binaural: null, rain: null, noise: null });
  const gainNodesRef = useRef({ binaural: null, rain: null, noise: null });
  
  const [activeSounds, setActiveSounds] = useState({ binaural: false, rain: false, noise: false });
  const [soundVolumes, setSoundVolumes] = useState({ binaural: 0.5, rain: 0.4, noise: 0.3 });

  // TTS Speech HUD state
  const [speechBubbleText, setSpeechBubbleText] = useState('');
  const [speechBubbleActive, setSpeechBubbleActive] = useState(false);
  const bubbleTimeoutRef = useRef(null);

  // Firebase Sync Unsubscribe Ref
  const unsubscribeSyncRef = useRef(null);
  const cloudSaveTimeoutRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Data Bootstrap
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Load local cached values
    const savedTasks = localStorage.getItem('deadlineiq_tasks');
    const savedHabits = localStorage.getItem('deadlineiq_habits');
    const savedGoals = localStorage.getItem('deadlineiq_goals');

    let initialTasks = [];
    if (savedTasks) {
      initialTasks = JSON.parse(savedTasks).map(t => {
        // Migrate old UTC dates
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
    } else {
      initialTasks = [...SEED_TASKS];
    }
    setTasks(initialTasks);

    let initialHabits = [];
    if (savedHabits) {
      initialHabits = JSON.parse(savedHabits);
    } else {
      // Seed streak history
      const today = new Date();
      initialHabits = SEED_HABITS.map(h => {
        const history = [];
        for (let i = 1; i <= h.streak; i++) {
          const pastDate = new Date();
          pastDate.setDate(today.getDate() - i);
          history.push(pastDate.toISOString().slice(0, 10));
        }
        h.history = history;
        return h;
      });
    }
    setHabits(initialHabits);

    let initialGoals = [];
    if (savedGoals) {
      initialGoals = JSON.parse(savedGoals);
    } else {
      initialGoals = [...SEED_GOALS];
    }
    setGoals(initialGoals);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Auth state change listener
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      if (firebaseUser && !localMode) {
        // Init sync
        startFirebaseSync(firebaseUser.uid);
      } else {
        // Stop sync if any
        stopFirebaseSync();
        setSyncStatus('local');
      }
    });

    return () => {
      unsubAuth();
      stopFirebaseSync();
    };
  }, [localMode]);

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Real-Time Firebase Sync Engine
  // ─────────────────────────────────────────────────────────────────────────
  const startFirebaseSync = (uid) => {
    if (unsubscribeSyncRef.current) unsubscribeSyncRef.current();

    setSyncStatus('syncing');
    const docRef = doc(db, 'users', uid, 'data', 'appState');

    unsubscribeSyncRef.current = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
          localStorage.setItem('deadlineiq_tasks', JSON.stringify(data.tasks));
        }
        if (Array.isArray(data.habits)) {
          setHabits(data.habits);
          localStorage.setItem('deadlineiq_habits', JSON.stringify(data.habits));
        }
        if (Array.isArray(data.goals)) {
          setGoals(data.goals);
          localStorage.setItem('deadlineiq_goals', JSON.stringify(data.goals));
        }
        setSyncStatus('synced');
      } else {
        // First sign in: push local cached data up
        setTasks(prevTasks => {
          setHabits(prevHabits => {
            setGoals(prevGoals => {
              triggerCloudSave(prevTasks, prevHabits, prevGoals, uid, true);
              return prevGoals;
            });
            return prevHabits;
          });
          return prevTasks;
        });
      }
    }, (error) => {
      console.error('[DeadlineIQ] Sync listener error:', error);
      setSyncStatus('offline');
    });
  };

  const stopFirebaseSync = () => {
    if (unsubscribeSyncRef.current) {
      unsubscribeSyncRef.current();
      unsubscribeSyncRef.current = null;
    }
  };

  const triggerCloudSave = (currentTasks, currentHabits, currentGoals = goals, uid = user?.uid, immediate = false) => {
    // Write locally immediately
    localStorage.setItem('deadlineiq_tasks', JSON.stringify(currentTasks));
    localStorage.setItem('deadlineiq_habits', JSON.stringify(currentHabits));
    localStorage.setItem('deadlineiq_goals', JSON.stringify(currentGoals));

    if (!uid || localMode) {
      setSyncStatus('local');
      return;
    }

    if (cloudSaveTimeoutRef.current) clearTimeout(cloudSaveTimeoutRef.current);
    setSyncStatus('syncing');

    const saveAction = async () => {
      try {
        const docRef = doc(db, 'users', uid, 'data', 'appState');
        await setDoc(docRef, {
          tasks: currentTasks,
          habits: currentHabits,
          goals: currentGoals,
          lastUpdated: serverTimestamp(),
          _meta: {
            appVersion: '2.1-react',
            device: navigator.userAgent.slice(0, 100),
            savedAt: new Date().toISOString()
          }
        });
        setSyncStatus('synced');
      } catch (err) {
        console.error('[DeadlineIQ] Cloud write failed:', err);
        setSyncStatus('offline');
      }
    };

    if (immediate) {
      saveAction();
    } else {
      cloudSaveTimeoutRef.current = setTimeout(saveAction, 600);
    }
  };

  // Helper function to update state and save
  const updateTasksAndSave = (updater) => {
    setTasks(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      triggerCloudSave(updated, habits, goals);
      return updated;
    });
  };

  const updateHabitsAndSave = (updater) => {
    setHabits(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      triggerCloudSave(tasks, updated, goals);
      return updated;
    });
  };

  const updateGoalsAndSave = (updater) => {
    setGoals(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      triggerCloudSave(tasks, habits, updated);
      return updated;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Core User Actions
  // ─────────────────────────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    setSyncStatus('syncing');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('[DeadlineIQ] Sign-in failed:', error);
      setSyncStatus('local');
      throw error;
    }
  };

  const signOutUser = async () => {
    stopFirebaseSync();
    await signOut(auth);
    setUser(null);
    setLocalMode(false);
    localStorage.removeItem('deadlineiq_local_mode');
    setSyncStatus('local');
  };

  const useLocalModeHandler = () => {
    localStorage.setItem('deadlineiq_local_mode', '1');
    setLocalMode(true);
    setSyncStatus('local');
  };

  const switchToCloudModeHandler = () => {
    localStorage.removeItem('deadlineiq_local_mode');
    setLocalMode(false);
  };

  // Tasks actions
  const addTask = (task) => {
    // Auto-categorize based on title keyword scanning
    let category = task.category;
    if (!category || category === 'work') {
      const titleLower = task.title.toLowerCase();
      if (titleLower.includes('bill') || titleLower.includes('pay') || titleLower.includes('money') || titleLower.includes('finance')) {
        category = 'finance';
      } else if (titleLower.includes('study') || titleLower.includes('exam') || titleLower.includes('book') || titleLower.includes('read') || titleLower.includes('learn') || titleLower.includes('prep')) {
        category = 'study';
      } else if (titleLower.includes('clean') || titleLower.includes('wash') || titleLower.includes('buy') || titleLower.includes('groceries') || titleLower.includes('personal') || titleLower.includes('room')) {
        category = 'personal';
      } else {
        category = 'work';
      }
    }

    // Generate 3-5 subtask checklist automatically
    let subtasks = [];
    if (category === 'study') {
      subtasks = [
        { id: `sub-${Date.now()}-1`, title: 'Review core concepts and definitions', completed: false },
        { id: `sub-${Date.now()}-2`, title: 'Draft outline of key takeaways', completed: false },
        { id: `sub-${Date.now()}-3`, title: 'Verify final calculations/citations', completed: false }
      ];
    } else if (category === 'finance') {
      subtasks = [
        { id: `sub-${Date.now()}-1`, title: 'Verify billing statements/invoices', completed: false },
        { id: `sub-${Date.now()}-2`, title: 'Confirm payment method credentials', completed: false },
        { id: `sub-${Date.now()}-3`, title: 'Initiate transfer & save receipt', completed: false }
      ];
    } else if (category === 'personal') {
      subtasks = [
        { id: `sub-${Date.now()}-1`, title: 'Gather necessary materials/supplies', completed: false },
        { id: `sub-${Date.now()}-2`, title: 'Execute primary steps of task', completed: false },
        { id: `sub-${Date.now()}-3`, title: 'Tidy up workspace and log completion', completed: false }
      ];
    } else { // work
      subtasks = [
        { id: `sub-${Date.now()}-1`, title: 'Analyze task specifications', completed: false },
        { id: `sub-${Date.now()}-2`, title: 'Execute core implementation', completed: false },
        { id: `sub-${Date.now()}-3`, title: 'Review for quality assurance', completed: false },
        { id: `sub-${Date.now()}-4`, title: 'Commit and notify team members', completed: false }
      ];
    }

    // Compute estimatedTime (complexity * 45 minutes)
    const complexity = task.complexity || 3;
    const totalMinutes = complexity * 45;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const estimatedTime = `${hours}h ${minutes}m`;

    const initialMetrics = calculatePriority({
      ...task,
      category,
      complexity
    });

    const newTask = {
      id: `task-${Date.now()}`,
      status: 'pending',
      category,
      subtasks,
      estimatedTime,
      ...initialMetrics,
      ...task
    };
    updateTasksAndSave(prev => [...prev, newTask]);
    speakRecommendation(`Target saved. ${task.title} added to queue.`);
  };

  const deleteTask = (id) => {
    updateTasksAndSave(prev => prev.filter(t => t.id !== id));
  };

  const toggleTask = (id) => {
    updateTasksAndSave(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
        if (nextStatus === 'completed') playCompletionChime();
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const toggleSubtask = (taskId, subtaskId) => {
    updateTasksAndSave(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = (t.subtasks || []).map(st => {
          if (st.id === subtaskId) {
            return { ...st, completed: !st.completed };
          }
          return st;
        });
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));
  };

  // Goals actions
  const addGoal = (title, type = 'weekly') => {
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      type,
      progress: 0,
      weeks: []
    };
    updateGoalsAndSave(prev => [...prev, newGoal]);
    speakRecommendation(`Goal "${title}" created with ${type} tracking. You can now add sections.`);
  };

  const deleteGoal = (goalId) => {
    updateGoalsAndSave(prev => prev.filter(g => g.id !== goalId));
  };

  const deleteMilestoneTask = (goalId, weekName, taskId) => {
    updateGoalsAndSave(prev => prev.map(g => {
      if (g.id === goalId) {
        const updatedWeeks = g.weeks.map(w => {
          if (w.name === weekName) {
            return {
              ...w,
              tasks: w.tasks.filter(t => t.id !== taskId)
            };
          }
          return w;
        });

        // Recalculate progress percentage
        const allTasks = updatedWeeks.flatMap(w => w.tasks);
        const completedCount = allTasks.filter(t => t.completed).length;
        const progress = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

        return { ...g, weeks: updatedWeeks, progress };
      }
      return g;
    }));
  };

  const addMilestone = (goalId, name) => {
    updateGoalsAndSave(prev => prev.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          weeks: [...(g.weeks || []), { name, tasks: [] }]
        };
      }
      return g;
    }));
  };

  const deleteMilestone = (goalId, weekName) => {
    updateGoalsAndSave(prev => prev.map(g => {
      if (g.id === goalId) {
        const updatedWeeks = g.weeks.filter(w => w.name !== weekName);
        const allTasks = updatedWeeks.flatMap(w => w.tasks);
        const completedCount = allTasks.filter(t => t.completed).length;
        const progress = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;
        return { ...g, weeks: updatedWeeks, progress };
      }
      return g;
    }));
  };

  const addMilestoneTask = (goalId, weekName, taskTitle) => {
    updateGoalsAndSave(prev => prev.map(g => {
      if (g.id === goalId) {
        const updatedWeeks = g.weeks.map(w => {
          if (w.name === weekName) {
            return {
              ...w,
              tasks: [...w.tasks, { id: `gt-${Date.now()}`, title: taskTitle, completed: false }]
            };
          }
          return w;
        });

        // Recalculate progress percentage
        const allTasks = updatedWeeks.flatMap(w => w.tasks);
        const completedCount = allTasks.filter(t => t.completed).length;
        const progress = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

        return { ...g, weeks: updatedWeeks, progress };
      }
      return g;
    }));
  };

  const toggleGoalTask = (goalId, taskId) => {
    updateGoalsAndSave(prev => prev.map(g => {
      if (g.id === goalId) {
        const updatedWeeks = g.weeks.map(w => {
          const updatedTasks = w.tasks.map(t => {
            if (t.id === taskId) {
              return { ...t, completed: !t.completed };
            }
            return t;
          });
          return { ...w, tasks: updatedTasks };
        });

        // Recalculate goal progress percentage
        const allTasks = updatedWeeks.flatMap(w => w.tasks);
        const completedCount = allTasks.filter(t => t.completed).length;
        const progress = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

        return { ...g, weeks: updatedWeeks, progress };
      }
      return g;
    }));
  };

  // Habits actions
  const addHabit = (name) => {
    const newHabit = {
      id: `habit-${Date.now()}`,
      name,
      streak: 0,
      history: []
    };
    updateHabitsAndSave(prev => [...prev, newHabit]);
  };

  const toggleHabitDay = (habitId, dateStr) => {
    updateHabitsAndSave(prev => prev.map(h => {
      if (h.id === habitId) {
        const history = [...h.history];
        const idx = history.indexOf(dateStr);
        if (idx === -1) history.push(dateStr);
        else history.splice(idx, 1);

        const updatedHabit = { ...h, history };
        recalculateHabitStreak(updatedHabit);
        return updatedHabit;
      }
      return h;
    }));
  };

  const recalculateHabitStreak = (habit) => {
    let streak = 0;
    const checkDate = new Date();

    while (true) {
      const checkStr = checkDate.toISOString().slice(0, 10);
      if (habit.history.includes(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
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
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Pomodoro Timer Execution Loop
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let interval = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerMode, timerDuration]);

  // Sync tab title with timer countdown
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.title = timerRunning ? `[${timeStr}] DeadlineIQ` : 'DeadlineIQ';
  }, [timeLeft, timerRunning]);

  // Periodic recalculation loop for priorities and delay risks (runs every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => {
        let changed = false;
        const updated = prevTasks.map(t => {
          if (t.status === 'pending') {
            const calc = calculatePriority(t);
            if (
              calc.priorityScore !== t.priorityScore ||
              calc.priorityLevel !== t.priorityLevel ||
              calc.missRisk !== t.missRisk
            ) {
              changed = true;
              return { ...t, ...calc };
            }
          }
          return t;
        });
        if (changed) {
          localStorage.setItem('deadlineiq_tasks', JSON.stringify(updated));
          triggerCloudSave(updated, habits, goals);
          return updated;
        }
        return prevTasks;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [habits, goals]);

  const toggleTimer = () => {
    initAudio();
    setTimerRunning(prev => !prev);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    if (timerMode === 'work') {
      setTimeLeft(25 * 60);
      setTimerDuration(25 * 60);
    } else {
      setTimeLeft(5 * 60);
      setTimerDuration(5 * 60);
    }
  };

  const skipTimer = () => {
    handleTimerEnd(true);
  };

  const handleTimerEnd = (skipped = false) => {
    setTimerRunning(false);
    if (!skipped) {
      playCompletionChime();
    }

    if (timerMode === 'work') {
      setTimerMode('break');
      setTimeLeft(5 * 60);
      setTimerDuration(5 * 60);
      speakRecommendation("Focus session complete. Take a five minute break, stretch your body.");
    } else {
      setTimerMode('work');
      setTimeLeft(25 * 60);
      setTimerDuration(25 * 60);
      speakRecommendation("Break complete. Back to deep focus mode.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 6. Web Audio Synthesizer (Ambient Engine)
  // ─────────────────────────────────────────────────────────────────────────
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playCompletionChime = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.connect(gain);
    gain.connect(ctx.destination);

    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, index) => {
      osc.frequency.setValueAtTime(freq, now + index * 0.12);
    });

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.start(now);
    osc.stop(now + 0.85);
  };

  const toggleSound = (soundId) => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (activeSounds[soundId]) {
      // Stop
      const nodes = audioNodesRef.current[soundId];
      if (nodes) {
        if (Array.isArray(nodes)) {
          nodes.forEach(n => { try { n.stop(); } catch(e) {} });
        } else {
          try { nodes.stop(); } catch(e) {}
        }
      }
      audioNodesRef.current[soundId] = null;
      gainNodesRef.current[soundId] = null;
      setActiveSounds(prev => ({ ...prev, [soundId]: false }));
    } else {
      // Start
      const gainNode = ctx.createGain();
      gainNode.gain.value = soundVolumes[soundId];
      gainNode.connect(ctx.destination);
      gainNodesRef.current[soundId] = gainNode;

      let sourceNode = null;
      if (soundId === 'noise') {
        sourceNode = startWhiteNoise(ctx, gainNode);
      } else if (soundId === 'binaural') {
        sourceNode = startBinauralBeats(ctx, gainNode);
      } else if (soundId === 'rain') {
        sourceNode = startRainAmbient(ctx, gainNode);
      }

      audioNodesRef.current[soundId] = sourceNode;
      setActiveSounds(prev => ({ ...prev, [soundId]: true }));
    }
  };

  const adjustVolume = (soundId, value) => {
    const vol = parseFloat(value);
    setSoundVolumes(prev => ({ ...prev, [soundId]: vol }));
    if (gainNodesRef.current[soundId]) {
      gainNodesRef.current[soundId].gain.setValueAtTime(vol, audioCtxRef.current ? audioCtxRef.current.currentTime : 0);
    }
  };

  // Synthesizer helper implementations
  const startWhiteNoise = (ctx, destination) => {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.connect(destination);
    whiteNoise.start();
    return whiteNoise;
  };

  const startBinauralBeats = (ctx, destination) => {
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.value = 200;
    oscR.type = 'sine';
    oscR.frequency.value = 210;

    const merger = ctx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);
    merger.connect(destination);

    oscL.start();
    oscR.start();
    return [oscL, oscR];
  };

  const startRainAmbient = (ctx, destination) => {
    const bufferSize = 3 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const rumblingFilter = ctx.createBiquadFilter();
    rumblingFilter.type = 'lowpass';
    rumblingFilter.frequency.value = 450;

    const dropletFilter = ctx.createBiquadFilter();
    dropletFilter.type = 'bandpass';
    dropletFilter.frequency.value = 1400;
    dropletFilter.Q.value = 1.0;

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.8;
    const dropletGain = ctx.createGain();
    dropletGain.gain.value = 0.2;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 120;

    noiseSource.connect(rumblingFilter);
    rumblingFilter.connect(rumbleGain);
    rumbleGain.connect(destination);

    noiseSource.connect(dropletFilter);
    dropletFilter.connect(dropletGain);
    dropletGain.connect(destination);

    lfo.connect(lfoGain);
    lfoGain.connect(dropletFilter.frequency);

    noiseSource.start();
    lfo.start();
    return [noiseSource, lfo];
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 7. TTS AI Dialog Bubble Helper
  // ─────────────────────────────────────────────────────────────────────────
  const speakRecommendation = (message) => {
    setSpeechBubbleText(message);
    setSpeechBubbleActive(true);

    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    bubbleTimeoutRef.current = setTimeout(() => {
      setSpeechBubbleActive(false);
    }, 6000);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
      const premiumVoice = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')) || englishVoices[0];
      if (premiumVoice) {
        utterance.voice = premiumVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 8. Natural Language Commander (NLP Parser)
  // ─────────────────────────────────────────────────────────────────────────
  const parseVoiceCommand = (cmdText) => {
    const cmd = cmdText.toLowerCase().trim();

    // NAVIGATION
    if (cmd.includes('go to') || cmd.includes('show') || cmd.includes('open')) {
      let page = '';
      if (cmd.includes('dashboard')) page = 'dashboard';
      else if (cmd.includes('task') || cmd.includes('todo')) page = 'tasks';
      else if (cmd.includes('calendar')) page = 'calendar';
      else if (cmd.includes('focus') || cmd.includes('timer') || cmd.includes('pomodoro')) page = 'focus';
      else if (cmd.includes('habit') || cmd.includes('routine')) page = 'habits';
      else if (cmd.includes('agent') || cmd.includes('console')) page = 'agent';

      if (page) {
        setActivePage(page);
        speakRecommendation(`Navigating to ${page} panel.`);
        return;
      }
    }

    // TIMER COMMANDS
    if (cmd === 'start timer' || cmd === 'start focus' || cmd === 'resume timer' || cmd === 'focus') {
      if (!timerRunning) {
        setTimerRunning(true);
        speakRecommendation("Focus timer activated. Starting a 25-minute deep focus block.");
      } else {
        speakRecommendation("Timer is already running.");
      }
      return;
    }
    if (cmd === 'pause timer' || cmd === 'pause focus' || cmd === 'stop timer') {
      if (timerRunning) {
        setTimerRunning(false);
        speakRecommendation("Timer paused.");
      } else {
        speakRecommendation("Timer is already paused.");
      }
      return;
    }
    if (cmd === 'reset timer') {
      resetTimer();
      speakRecommendation("Timer reset to starting state.");
      return;
    }
    if (cmd === 'skip timer' || cmd === 'skip session') {
      skipTimer();
      speakRecommendation("Skipped current focus block.");
      return;
    }

    // OPTIMIZE PRIORITIES
    if (cmd === 'prioritize' || cmd === 'optimize' || cmd === 'run optimization' || cmd.includes('optimize priority')) {
      runAIPrioritization();
      return;
    }

    // TASK ADDITION (NATURAL LANGUAGE)
    if (cmd.startsWith('add task') || cmd.startsWith('remind me to') || cmd.startsWith('new task')) {
      let rawTitle = '';
      if (cmd.startsWith('add task')) rawTitle = cmdText.slice(8).trim();
      else if (cmd.startsWith('remind me to')) rawTitle = cmdText.slice(12).trim();
      else rawTitle = cmdText.slice(8).trim();

      const deadlineKeywords = ['by', 'due at', 'due on', 'deadline', 'before'];
      let title = rawTitle;
      let deadlineStr = '';

      for (const keyword of deadlineKeywords) {
        const idx = title.toLowerCase().lastIndexOf(' ' + keyword + ' ');
        if (idx !== -1) {
          deadlineStr = title.slice(idx + keyword.length + 2).trim();
          title = title.slice(0, idx).trim();
          break;
        }
      }

      if (!deadlineStr) {
        for (const keyword of [' tomorrow', ' tonight', ' today']) {
          const idx = title.toLowerCase().lastIndexOf(keyword);
          if (idx !== -1) {
            deadlineStr = title.slice(idx).trim();
            title = title.slice(0, idx).trim();
            break;
          }
        }
      }

      title = title.charAt(0).toUpperCase() + title.slice(1);
      const dateObj = parseNLPDate(deadlineStr || 'tomorrow at 5pm');
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      const h = String(dateObj.getHours()).padStart(2, '0');
      const min = String(dateObj.getMinutes()).padStart(2, '0');
      const localDateTime = `${y}-${m}-${d}T${h}:${min}`;

      addTask({
        title,
        description: 'Added via AI Voice Commander HUD.',
        category: 'work',
        energyCost: 'medium',
        deadline: localDateTime,
        complexity: 3
      });
      return;
    }

    speakRecommendation(`Command not recognized: "${cmdText}". Try saying: "go to tasks", "start timer", "prioritize", or "add task Buy groceries by tomorrow 4 PM".`);
  };

  const parseNLPDate = (str) => {
    const clean = str.toLowerCase().trim();
    const date = new Date();

    if (clean.includes('tonight')) {
      date.setHours(20, 0, 0, 0);
      return date;
    }

    if (clean.includes('tomorrow')) {
      date.setDate(date.getDate() + 1);
      const timeMatch = clean.match(/(\d+)(?::(\d+))?\s*(am|pm)/);
      if (timeMatch) {
        let hrs = parseInt(timeMatch[1], 10);
        const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const isPm = timeMatch[3] === 'pm';
        if (isPm && hrs < 12) hrs += 12;
        if (!isPm && hrs === 12) hrs = 0;
        date.setHours(hrs, mins, 0, 0);
      } else {
        date.setHours(17, 0, 0, 0);
      }
      return date;
    }

    const hrMatch = clean.match(/in\s+(\d+)\s+hour/);
    if (hrMatch) {
      const hrs = parseInt(hrMatch[1], 10);
      date.setHours(date.getHours() + hrs);
      return date;
    }

    const dayMatch = clean.match(/in\s+(\d+)\s+day/);
    if (dayMatch) {
      const days = parseInt(dayMatch[1], 10);
      date.setDate(date.getDate() + days);
      date.setHours(12, 0, 0, 0);
      return date;
    }

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < 7; i++) {
      if (clean.includes(daysOfWeek[i])) {
        const currentDay = date.getDay();
        let daysOffset = i - currentDay;
        if (daysOffset <= 0) daysOffset += 7;
        date.setDate(date.getDate() + daysOffset);

        const timeMatch = clean.match(/(\d+)(?::(\d+))?\s*(am|pm)/);
        if (timeMatch) {
          let hrs = parseInt(timeMatch[1], 10);
          const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
          const isPm = timeMatch[3] === 'pm';
          if (isPm && hrs < 12) hrs += 12;
          if (!isPm && hrs === 12) hrs = 0;
          date.setHours(hrs, mins, 0, 0);
        } else {
          date.setHours(9, 0, 0, 0);
        }
        return date;
      }
    }

    date.setDate(date.getDate() + 1);
    return date;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // 9. AI Prioritizer Recommendation Logic
  // ─────────────────────────────────────────────────────────────────────────
  const runAIPrioritization = () => {
    const pending = tasks.filter(t => t.status === 'pending');
    if (pending.length === 0) {
      alert("Add some pending tasks first!");
      return;
    }

    const now = new Date();
    const evaluated = pending.map(t => {
      const deadlineDiff = new Date(t.deadline) - now;
      const hoursRemaining = deadlineDiff / (1000 * 60 * 60);

      let timeFactor = 0;
      if (hoursRemaining <= 0) {
        timeFactor = 100;
      } else {
        timeFactor = Math.max(0, 100 - (hoursRemaining / 1.5));
      }

      const complexityFactor = t.complexity * 20;
      const energyMap = { high: 100, medium: 60, low: 30 };
      const energyFactor = energyMap[t.energyCost] || 50;

      const rps = Math.round((timeFactor * 0.6) + (complexityFactor * 0.25) + (energyFactor * 0.15));
      return { ...t, rps, hoursRemaining };
    });

    evaluated.sort((a, b) => b.rps - a.rps);
    const completed = tasks.filter(t => t.status === 'completed');
    const sortedTasks = [...evaluated, ...completed];

    setTasks(sortedTasks);
    triggerCloudSave(sortedTasks, habits);

    const topTask = evaluated[0];
    const totalComplexity = evaluated.reduce((acc, t) => acc + t.complexity, 0);
    const nextMinutes = Math.min(90, Math.max(25, totalComplexity * 10));

    setAiInsights({
      topTask,
      totalComplexity,
      nextMinutes,
      evaluatedTop: evaluated.slice(0, 3)
    });
    setAiPrioritized(true);

    speakRecommendation(`Schedule optimized. Your highest priority target is ${topTask.title}. Let's focus on completing it first.`);
  };

  return (
    <AppContext.Provider value={{
      activePage, setActivePage,
      activeFilter, setActiveFilter,
      showMatrix, setShowMatrix,
      user, localMode, authLoading, syncStatus,
      tasks, habits, goals,
      aiInsights, aiPrioritized,
      timeLeft, timerDuration, timerRunning, timerMode,
      activeSounds, soundVolumes,
      speechBubbleText, speechBubbleActive, setSpeechBubbleActive,
      signInWithGoogle, signOutUser, useLocalMode: useLocalModeHandler, switchToCloudMode: switchToCloudModeHandler,
      addTask, deleteTask, toggleTask, toggleSubtask,
      addHabit, toggleHabitDay,
      addGoal, deleteGoal, addMilestone, deleteMilestone, addMilestoneTask, deleteMilestoneTask, toggleGoalTask,
      toggleTimer, resetTimer, skipTimer,
      toggleSound, adjustVolume,
      parseVoiceCommand, runAIPrioritization
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
