// Agent Selector and Console State
let selectedAgentTaskId = null;
let isAgentRunning = false;

// Update task selector options inside the Agent panel
function updateAgentSelectors() {
  const container = document.getElementById('agent-task-selector');
  const deployBtn = document.getElementById('btn-deploy-agent');
  if (!container || !deployBtn) return;

  const pending = tasks.filter(t => t.status === 'pending');
  if (pending.length === 0) {
    container.innerHTML = `<p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 20px 0;">No pending tasks to analyze. Create one first!</p>`;
    deployBtn.disabled = true;
    selectedAgentTaskId = null;
    return;
  }

  container.innerHTML = pending.map(t => `
    <div class="agent-task-item ${t.id === selectedAgentTaskId ? 'selected' : ''}" onclick="selectAgentTask('${t.id}', this)">
      <span class="agent-task-category">${t.category}</span>
      <span class="agent-task-name">${t.title}</span>
    </div>
  `).join('');
}

// Select task handler
function selectAgentTask(id, element) {
  if (isAgentRunning) return;

  selectedAgentTaskId = id;
  
  // Update class lists
  document.querySelectorAll('.agent-task-item').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
  
  // Enable button
  const deployBtn = document.getElementById('btn-deploy-agent');
  if (deployBtn) deployBtn.disabled = false;
}

// Deploy Agent Routine
function deployAgentOnSelectedTask() {
  const task = tasks.find(t => t.id === selectedAgentTaskId);
  if (!task || isAgentRunning) return;

  // Set running state
  isAgentRunning = true;
  document.getElementById('btn-deploy-agent').disabled = true;
  
  // Update status UI
  const statusDot = document.getElementById('console-status-dot');
  const statusText = document.getElementById('console-status-text');
  statusDot.className = 'status-dot active';
  statusText.textContent = 'RUNNING';

  // Clear Terminal
  const termBody = document.getElementById('console-terminal-body');
  termBody.innerHTML = '';

  const steps = [
    { text: `[INIT] Booting DeadlineIQ Agent Engine v2.1.0...`, type: 'info', delay: 0 },
    { text: `[CONN] Connecting to local task intelligence nodes... Done.`, type: 'info', delay: 600 },
    { text: `[ANALYZE] Target: "${task.title}". Complexity: ${task.complexity}/5. Energy: ${task.energyCost}.`, type: 'ai', delay: 1200 },
    { text: `[ANALYZE] Parsing task details... Found: "${task.description || 'No description provided.'}"`, type: 'info', delay: 2000 },
    { text: `[PLAN] Formulating breakdown plan for execution...`, type: 'info', delay: 2800 },
    { text: `[PLAN] Sub-Task 1: Research core materials & references.`, type: 'action', delay: 3400 },
    { text: `[PLAN] Sub-Task 2: Draft structures & structured templates.`, type: 'action', delay: 4000 },
    { text: `[PLAN] Sub-Task 3: Compose final delivery outline & checklist.`, type: 'action', delay: 4600 },
    { text: `[EXEC] Running simulation sub-tasks...`, type: 'info', delay: 5400 },
    { text: `[EXEC] Sub-task 1 completed: Extracted reference guidelines.`, type: 'success', delay: 6200 },
    { text: `[EXEC] Sub-task 2 completed: Created draft slides/email body structure.`, type: 'success', delay: 7200 },
    { text: `[EXEC] Sub-task 3 completed: Finalized deliverable document text.`, type: 'success', delay: 8200 },
    { text: `[CALENDAR] Auto-scheduling 45 min focus block in your calendar for tomorrow...`, type: 'ai', delay: 9000 },
    { text: `[COMPLETE] Autonomous Agent task decomposition complete. Output generated.`, type: 'success', delay: 9800 }
  ];

  steps.forEach(step => {
    setTimeout(() => {
      printConsoleLine(step.text, step.type);
    }, step.delay);
  });

  // End of Execution Actions
  const totalDuration = steps[steps.length - 1].delay + 500;
  setTimeout(() => {
    // Reset running state
    isAgentRunning = false;
    document.getElementById('btn-deploy-agent').disabled = false;
    
    // Update console status
    statusDot.className = 'status-dot';
    statusText.textContent = 'COMPLETED';

    // Auto Schedule Focus block (Adds marker or message)
    if (typeof speakRecommendation === 'function') {
      speakRecommendation("Decomposition finished. Output files have been compiled for you.");
    }

    // Append Deliverable visual card to console
    const termBody = document.getElementById('console-terminal-body');
    const deliverableHTML = `
      <div class="deliverable-card">
        <div class="deliverable-header">
          <span class="deliverable-title"><i data-lucide="file-text" style="width: 14px; height: 14px; vertical-align: middle;"></i> Compiled Deliverable: ${task.title}</span>
          <button class="btn btn-primary" style="padding: 4px 10px; font-size: 11px;" onclick="viewDeliverableContent()">View Deliverable</button>
        </div>
        <div class="deliverable-body">${generateMockDeliverable(task).substring(0, 150)}...</div>
      </div>
    `;
    termBody.insertAdjacentHTML('beforeend', deliverableHTML);
    termBody.scrollTop = termBody.scrollHeight;
    
    safeCreateIcons();
  }, totalDuration);
}

// Print single line in console terminal
function printConsoleLine(text, type) {
  const termBody = document.getElementById('console-terminal-body');
  if (!termBody) return;

  // Remove cursor line if exists
  const oldCursor = termBody.querySelector('.console-cursor-line');
  if (oldCursor) oldCursor.remove();

  const lineEl = document.createElement('div');
  lineEl.className = `console-line ${type}`;
  lineEl.textContent = `> ${text}`;
  
  termBody.appendChild(lineEl);

  // Re-append cursor at bottom
  const cursorEl = document.createElement('div');
  cursorEl.className = 'console-line console-cursor-line';
  cursorEl.innerHTML = '<span class="console-cursor"></span>';
  termBody.appendChild(cursorEl);

  termBody.scrollTop = termBody.scrollHeight;
}

// Inspect / View Modal deliverable content
let generatedOutputText = '';

function viewDeliverableContent() {
  const task = tasks.find(t => t.id === selectedAgentTaskId);
  if (!task) return;

  generatedOutputText = generateMockDeliverable(task);
  
  document.getElementById('deliverable-modal-title').textContent = `Compiled Output: ${task.title}`;
  document.getElementById('deliverable-modal-body').textContent = generatedOutputText;
  
  document.getElementById('deliverable-modal').classList.add('active');
}

function closeDeliverableModal() {
  document.getElementById('deliverable-modal').classList.remove('active');
}

function copyDeliverableToClipboard() {
  if (generatedOutputText) {
    navigator.clipboard.writeText(generatedOutputText).then(() => {
      alert('AI Output copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }
}

// AI Mock content deliverable generator based on task specs
function generateMockDeliverable(task) {
  const title = task.title;
  const category = task.category;
  const desc = task.description || 'No description details provided.';

  let deliverable = '';

  if (category === 'study') {
    deliverable = `# DECOMPOSITION DRAFT: ${title.toUpperCase()}
[Study & Exam Preparation Outline]

## 1. Core Summary Sheets
- Define crucial terminologies matching task description: "${desc.slice(0, 50)}..."
- Extract formulas and primary index variables.
- Match complexity scale: ${task.complexity}/5 level study points.

## 2. Structured Revision Schedule
- Focus Interval: 45 min focus, 10 min recall review.
- Active recall session: Self-test using three custom flashcard topics.
- Energy Requirement: Matches a ${task.energyCost} energy window.

## 3. Top Mock Questions
Q1. Describe the primary mechanism behind this study field.
Q2. Explain the critical difference between these variables.
Q3. Outline a case study demonstrating this concept.

## References & Reading Material
- Lecture Notes, Ch. 2-5
- Online Research Database references.`;
  } else if (category === 'work') {
    deliverable = `# SPECIFICATION SHEET: ${title.toUpperCase()}
[Work Deliverable Outline & Specification]

## 1. Project Objective
Decompose and achieve target goals outlined: "${desc}"

## 2. API Design & Action Item Breakdown
- Setup local testing endpoints.
- Map structural models and database entity schemas.
- Complete linting rules and code unit coverage testing (Target: >85%).

## 3. Meeting Agenda & Pitch Outline
- Summary: Highlight how this solves target pain-points.
- Milestones:
  - Phase 1: Prototype validation (Complexity: ${task.complexity}/5)
  - Phase 2: Staging deployment & Stress testing
  - Phase 3: Launch

## Draft Email to Team
Subject: Status update - regarding: ${title}

Hi Team,
I have compiled the initial specification and outline for ${title}. We will schedule a focus session tomorrow to refine the code models and complete the base integrations.

Let me know if you have any early feedback.

Best regards,
Productivity Agent`;
  } else if (category === 'finance') {
    deliverable = `# FINANCIAL CHECKLIST: ${title.toUpperCase()}
[Finance & Commitments Planner]

## 1. Verification Points
- Confirm balance availability on transaction account.
- Review invoice line items matching: "${desc.slice(0, 40)}..."
- Complexity Level: ${task.complexity}/5 Verification requirement.

## 2. Execution Steps
- [ ] Connect securely to banking dashboard.
- [ ] Fill transaction fields and double-check account routes.
- [ ] Transfer and save PDF receipt to archive folder.
- [ ] Log expenditure in personal budget spreadsheet.

## 3. Prevention & Habit Plan
- Set up automatic bank transfer if recurring to prevent overdue fines.
- Configure SMS alert notifications.`;
  } else {
    // personal or other
    deliverable = `# PERSONAL ROUTINE OUTLINE: ${title.toUpperCase()}
[Goal checklist & Action items]

## 1. Primary Goals
- Action item breakdown of: "${desc}"
- Priority Index: Level ${task.complexity}/5.

## 2. Process Flow
- Step 1: Prep workspace environment (Low energy setup).
- Step 2: Focus block execution (Clean clutter, execute core goal).
- Step 3: Verify and log completed streak.

## 3. Reflection Notes
- Identify what caused delays in completing this routine previously.
- Implement a 5-minute visual review habit to build consistent momentum.`;
  }

  return deliverable;
}
