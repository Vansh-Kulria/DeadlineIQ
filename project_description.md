# DeadlineIQ - Project Description

## 1. Problem Statement Selected
Modern students, professionals, and developers face extreme cognitive overload when managing multiple concurrent deadlines. Traditional task managers are static, requiring manual effort to organize, calculate urgency, and plan schedules. This causes "decision paralysis" and procrastination. Key challenges include:
- **Cognitive Load of Prioritization**: Users struggle to mathematically weigh deadline proximity, task complexity, and energy levels to figure out *what* to work on *next*.
- **Lack of Structured Milestones**: Breaking down a long-term goal into daily or weekly roadmap checklists is time-consuming and hard to plan manually.
- **Friction in Task Creation**: Manually clicking through date pickers, category dropdowns, and form fields creates a barrier to capturing tasks.
- **Isolated Workflows**: Focus timers, habit trackers, collaboration workspaces, and task lists are usually scattered across different apps, breaking focus.

---

## 2. Solution Overview
**DeadlineIQ** is an all-in-one, highly responsive, glassmorphic productivity dashboard designed to eliminate cognitive friction. It acts as an intelligent companion that handles prioritization, schedule mapping, and goal structuring. 

By utilizing Google Cloud and Firebase services, DeadlineIQ offers an offline-first, real-time synchronized environment. Users can write naturally (NLP), track habits, build custom weekly or daily milestone goals, enter a gamified Focus Arena (Pomodoro), and coordinate with teams—all within a single, visually stunning, dark-mode glassmorphic interface.

---

## 3. Key Features
1. **Dynamic Task Queue (Tasks Page)**: Combines filters (All, Active, Completed, Critical) and automatic categorization.
2. **Quick AI Task Commander (NLP)**: Allows users to type natural commands like *"add task Revise chemistry tomorrow at 4 PM"* or *"Finish report tomorrow at 5pm"* to instantly create parsed tasks.
3. **Overdue Warning System**: Highlights overdue tasks with a red gradient glow, borders, and an `AlertTriangle` warning badge.
4. **Expandable Task Cards**: Click a task to expand details: descriptions, estimated effort, priority score, and deadline risk.
5. **Interactive Subtask Checklist**: Includes a subtask checklist with a progress bar and completion percentage indicator.
6. **AI Prioritization Analytics Sidebar**: Displays diagnostic scores, total focus complexity index, and recommends optimal focus block durations.
7. **Eisenhower Decision Matrix Grid**: Toggles between a standard list and a 4-quadrant grid (Do, Plan, Delegate, Eliminate) to help categorize tasks.
8. **Manual Goal Planner (Weekly/Daily Tracking)**: Allows users to create long-term goals and manually structure them into Weekly or Daily milestone sections with checklist tasks.
9. **Interactive Progress Bars**: Computes and updates overall goal progress dynamically as tasks are checked off.
10. **Habit Streak & Routine Tracker**: A 7-day checklist with interactive dots showing streak counts and visual amber fire tags.
11. **Focus Arena (Pomodoro Workspace)**: Custom Pomodoro timer with skip/reset controls and pre-defined focus sessions.
12. **Ambient Sound Mixer**: Built-in sound mixer with volume controls for Rain, Coffee Shop, White Noise, and keyboard sounds to enhance concentration.
13. **Today's AI-Generated Schedule**: A vertical hourly timeline on the Dashboard mapping pending tasks to recommended focus blocks (e.g. Deep Work, Focus Sprint).
14. **AI Coach Suggestions**: Alerts displaying productivity recommendations, deadline warnings, and energy-level alerts.
15. **Collaboration Workspace**: Dashboard widget showing co-authors, recent team actions, and meeting summaries.
16. **Interactive Calendar View**: Full calendar rendering deadlines with month-navigation and quick-add pre-fill clicks.
17. **Energy Level Indicator**: A sidebar widget that calculates the user's focus capability based on the time of day (e.g. Peak Focus, Post-Lunch Dip).
18. **Voice Command Feedback (Web Speech Synthesizer)**: The companion speaks status updates and recommendations aloud (e.g. *"Schedule optimized. Your highest priority target is..."*).
19. **Glassmorphic UI Design**: Dark-mode palette (`#0a0b10`), clean gradients, Outfit typography, and glowing borders.
20. **Responsive Mobile Drawers**: Fully responsive sidebar navigation drawer for all screens.

---

## 4. Technologies Used
- **Frontend Framework**: React 19 (using modern hooks and state management)
- **Build Tool**: Vite 8 & Rolldown (for high-speed module compilation)
- **Styling**: Vanilla CSS (CSS Variables system for themes and glassmorphic styling)
- **Icons**: Lucide React (vector iconography)
- **Linting**: Oxlint (ultra-fast linter)

---

## 5. Google Technologies Utilized
- **Google Cloud Platform (GCP)**: Deploys and manages the cloud infrastructure hosting the application and data.
- **Firebase Hosting**: Google Cloud's globally distributed CDN serves the production app bundle over HTTPS with sub-second response times.
- **Cloud Firestore**: A real-time NoSQL document database. We configured persistent local cache (`persistentLocalCache` and `persistentMultipleTabManager`) to support offline-first data access, meaning data is saved locally and synced to the cloud once online.
- **Firebase Authentication (Google Sign-In)**: Integrates Google Auth OAuth2 flow so users can log in securely using their Google accounts.
- **Google Fonts**: Embeds the premium *Outfit* (headings and body) and *JetBrains Mono* (monospaced codes/subtitles) typefaces.
