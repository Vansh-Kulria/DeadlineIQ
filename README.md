# DeadlineIQ ⚡

> An intelligent, offline-first, glassmorphic productivity workspace built on Google Cloud. It combines natural language task parsing, dynamic AI prioritization, milestone goal tracking, focus arenas, and real-time collaboration.

[![Live Demo](https://img.shields.io/badge/demo-live-success.svg)](https://deadlineiq-dd5fb.web.app)
[![Google Cloud](https://img.shields.io/badge/GCP-utilizing-blue.svg)](https://cloud.google.com)
[![Firebase](https://img.shields.io/badge/Firebase-backed-orange.svg)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Table of Contents
1. [Problem Statement](#-problem-statement)
2. [Solution Overview](#-solution-overview)
3. [Key Features](#-key-features)
4. [System Architecture](#-system-architecture)
5. [Tech Stack](#-tech-stack)
6. [Google Technologies Utilized](#-google-technologies-utilized)
7. [Project Structure](#-project-structure)
8. [Local Development](#-local-development)
9. [Deployment to Google Cloud](#-deployment-to-google-cloud)

---

## 🎯 Problem Statement
Modern students, professionals, and developers face extreme cognitive overload when managing multiple concurrent deadlines. Traditional task managers are static, requiring manual effort to organize, calculate urgency, and plan schedules. This causes "decision paralysis" and procrastination. Key challenges include:
- **Cognitive Load of Prioritization**: Users struggle to mathematically weigh deadline proximity, task complexity, and energy levels to figure out *what* to work on *next*.
- **Lack of Structured Milestones**: Breaking down a long-term goal into daily or weekly roadmap checklists is time-consuming and hard to plan manually.
- **Friction in Task Creation**: Manually clicking through date pickers, category dropdowns, and form fields creates a barrier to capturing tasks.
- **Isolated Workflows**: Focus timers, habit trackers, collaboration workspaces, and task lists are usually scattered across different apps, breaking focus.

---

## 💡 Solution Overview
**DeadlineIQ** is an all-in-one, highly responsive, glassmorphic productivity dashboard designed to eliminate cognitive friction. It acts as an intelligent companion that handles prioritization, schedule mapping, and goal structuring. 

By utilizing Google Cloud and Firebase services, DeadlineIQ offers an offline-first, real-time synchronized environment. Users can write naturally (NLP), track habits, build custom weekly or daily milestone goals, enter a gamified Focus Arena (Pomodoro), and coordinate with teams—all within a single, visually stunning, dark-mode glassmorphic interface.

---

## ✨ Key Features

### 📅 Smart Dashboard & Schedule
- **Today's AI-Generated Schedule**: A vertical hourly timeline on the Dashboard mapping pending tasks to recommended focus blocks (e.g. Deep Work, Focus Sprint).
- **AI Coach Suggestions**: Alerts displaying productivity recommendations, deadline warnings, and energy-level alerts.
- **Collaboration Workspace**: Dashboard widget showing co-authors, recent team actions, and meeting summaries.
- **Interactive Calendar View**: Full calendar rendering deadlines with month-navigation and quick-add pre-fill clicks.

### 📝 Task Manager & AI Prioritization
- **Dynamic Task Queue (Tasks Page)**: Combines filters (All, Active, Completed, Critical) and automatic categorization.
- **Quick AI Task Commander (NLP)**: Allows users to type natural commands like *"add task Revise chemistry tomorrow at 4 PM"* to instantly create parsed tasks.
- **Overdue Warning System**: Highlights overdue tasks with a red gradient glow, borders, and an `AlertTriangle` warning badge.
- **Expandable Task Cards**: Click a task to expand details: descriptions, estimated effort, priority score, and deadline risk.
- **Interactive Subtask Checklist**: Includes a subtask checklist with a progress bar and completion percentage indicator.
- **AI Prioritization Analytics Sidebar**: Displays diagnostic scores, total focus complexity index, and recommends optimal focus block durations.
- **Eisenhower Decision Matrix Grid**: Toggles between a standard list and a 4-quadrant grid (Do, Plan, Delegate, Eliminate) to help categorize tasks.

### 🏆 Goals & Habit Routines
- **Manual Goal Planner (Weekly/Daily Tracking)**: Allows users to create long-term goals and manually structure them into Weekly or Daily milestone sections with checklist tasks.
- **Interactive Progress Bars**: Computes and updates overall goal progress dynamically as tasks are checked off.
- **Habit Streak & Routine Tracker**: A 7-day checklist with interactive dots showing streak counts and visual amber fire tags.

### 🧠 Focus Arena
- **Focus Arena (Pomodoro Workspace)**: Custom Pomodoro timer with skip/reset controls and pre-defined focus sessions.
- **Ambient Sound Mixer**: Built-in sound mixer with volume controls for Rain, Coffee Shop, White Noise, and keyboard sounds to enhance concentration.
- **Energy Level Indicator**: A sidebar widget that calculates the user's focus capability based on the time of day (e.g. Peak Focus, Post-Lunch Dip).
- **Voice Command Feedback (Web Speech Synthesizer)**: The companion speaks status updates and recommendations aloud (e.g. *"Schedule optimized. Your highest priority target is..."*).

---

## 🛠 Tech Stack
- **Frontend Framework**: React 19 (using modern hooks and state management)
- **Build Tool**: Vite 8 & Rolldown (for high-speed module compilation)
- **Styling**: Vanilla CSS (CSS Variables system for themes and glassmorphic styling)
- **Icons**: Lucide React (vector iconography)
- **Linting**: Oxlint (ultra-fast linter)

---

## ☁️ Google Technologies Utilized
- **Google Cloud Platform (GCP)**: Deploys and manages the cloud infrastructure hosting the application and data.
- **Firebase Hosting**: Google Cloud's globally distributed CDN serves the production app bundle over HTTPS with sub-second response times.
- **Cloud Firestore**: A real-time NoSQL document database. We configured persistent local cache (`persistentLocalCache` and `persistentMultipleTabManager`) to support offline-first data access, meaning data is saved locally and synced to the cloud once online.
- **Firebase Authentication (Google Sign-In)**: Integrates Google Auth OAuth2 flow so users can log in securely using their Google accounts.
- **Google Fonts**: Embeds the premium *Outfit* (headings and body) and *JetBrains Mono* (monospaced codes/subtitles) typefaces.

---

## 📁 Project Structure
```bash
DeadlineIQ/
├── public/                 # Static public assets (icons, ambient audio files)
├── src/
│   ├── assets/             # Images and local styles
│   ├── components/         # React dashboard widgets & pages
│   │   ├── AIAgent.jsx          # AI Insights Panel
│   │   ├── CalendarView.jsx     # Month calendar view
│   │   ├── Dashboard.jsx        # Dashboard grid, schedule, and team feed
│   │   ├── FocusArena.jsx       # Pomodoro timer & sound mixer
│   │   ├── HabitsRoutine.jsx    # Habit Streaks & Goal Planner
│   │   ├── Header.jsx           # Global navbar status header
│   │   ├── LoginOverlay.jsx     # Google sign-in wall
│   │   ├── Modals.jsx           # Quick-add task & habit modals
│   │   ├── Sidebar.jsx          # Collapsible navigation drawer
│   │   └── TaskBrain.jsx        # Task lists, NLP commander, and analytics
│   ├── context/
│   │   └── AppContext.jsx       # Global application state, Firestore integration, and voice synth
│   ├── App.jsx             # Main layout, routing, and loading overlay
│   ├── firebase.js         # Firebase config credentials & initialization
│   ├── index.css           # Glassmorphic core design system
│   └── main.jsx            # DOM mounting
├── index.html              # HTML shell
├── package.json            # Node project configuration
├── vite.config.js          # Vite configurations
├── firebase.json           # Firebase Hosting deploy settings
└── .firebaserc             # Firebase target project mapping
```

---

## 💻 Local Development

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- [npm](https://www.npmjs.com) (or yarn/pnpm)

### Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd DeadlineIQ
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run local development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal).

4. **Verify lint rules**:
   ```bash
   npm run lint
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🚀 Deployment to Google Cloud

DeadlineIQ is deployed on **Google Cloud** infrastructure via **Firebase Hosting**.

### How to Deploy
1. Make sure you have the Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```
2. Authenticate the CLI with your Google Account:
   ```bash
   firebase login
   ```
3. Compile the production bundle:
   ```bash
   npm run build
   ```
4. Deploy the application:
   ```bash
   firebase deploy --only hosting
   ```
   Once finished, your live app link will be shown in the console output!
