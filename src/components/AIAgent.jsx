import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PlayCircle, Terminal, FileText } from 'lucide-react';

export default function AIAgent({ setDeliverableModalOpen, setDeliverableContent, setDeliverableTitle }) {
  const { tasks, speakRecommendation } = useApp();
  
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [consoleStatus, setConsoleStatus] = useState('OFFLINE'); // 'OFFLINE' | 'RUNNING' | 'COMPLETED'
  const [consoleLines, setConsoleLines] = useState([
    { text: 'System ready. Select a task in the left panel to initialize.', type: 'info' }
  ]);
  const [showDeliverableCard, setShowDeliverableCard] = useState(false);
  
  const consoleBodyRef = useRef(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (consoleBodyRef.current) {
      consoleBodyRef.current.scrollTop = consoleBodyRef.current.scrollHeight;
    }
  }, [consoleLines, showDeliverableCard]);

  const pendingTasks = tasks.filter(t => t.status === 'pending');

  const selectTask = (id) => {
    if (isAgentRunning) return;
    setSelectedTaskId(id);
  };

  const deployAgent = () => {
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task || isAgentRunning) return;

    setIsAgentRunning(true);
    setConsoleStatus('RUNNING');
    setConsoleLines([]);
    setShowDeliverableCard(false);

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
        setConsoleLines(prev => [...prev, { text: step.text, type: step.type }]);
      }, step.delay);
    });

    const totalDuration = steps[steps.length - 1].delay + 500;
    setTimeout(() => {
      setIsAgentRunning(false);
      setConsoleStatus('COMPLETED');
      setShowDeliverableCard(true);
      speakRecommendation("Decomposition finished. Output files have been compiled for you.");
    }, totalDuration);
  };

  const handleViewDeliverable = () => {
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    const content = generateMockDeliverable(task);
    setDeliverableTitle(`Compiled Output: ${task.title}`);
    setDeliverableContent(content);
    setDeliverableModalOpen(true);
  };

  const generateMockDeliverable = (task) => {
    const title = task.title;
    const category = task.category;
    const desc = task.description || 'No description details provided.';

    if (category === 'study') {
      return `# DECOMPOSITION DRAFT: ${title.toUpperCase()}
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
      return `# SPECIFICATION SHEET: ${title.toUpperCase()}
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
      return `# FINANCIAL CHECKLIST: ${title.toUpperCase()}
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
      return `# PERSONAL ROUTINE OUTLINE: ${title.toUpperCase()}
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
  };

  const getMockPreviewText = () => {
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return '';
    return `${generateMockDeliverable(task).substring(0, 150)}...`;
  };

  return (
    <section id="agent-page" className="page-container active">
      <div className="agent-layout">
        
        {/* Left: Deploy Control */}
        <div className="agent-control-panel glass-panel">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '10px' }}>Select Target Task</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Select a task to deploy the DeadlineIQ Autonomous Agent. The agent will run a simulated execution breakdown, generate outlines or content, and save the schedule blocks.
          </p>
          <div className="agent-selector-list" id="agent-task-selector">
            {pendingTasks.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                No pending tasks to analyze. Create one first!
              </p>
            ) : (
              pendingTasks.map(t => (
                <div 
                  className={`agent-task-item ${t.id === selectedTaskId ? 'selected' : ''}`} 
                  key={t.id}
                  onClick={() => selectTask(t.id)}
                >
                  <span className="agent-task-category">{t.category}</span>
                  <span className="agent-task-name">{t.title}</span>
                </div>
              ))
            )}
          </div>
          <button 
            className="btn btn-primary" 
            id="btn-deploy-agent" 
            onClick={deployAgent}
            disabled={!selectedTaskId || isAgentRunning}
          >
            <PlayCircle size={16} /> Deploy Agent
          </button>
        </div>

        {/* Right: AI CLI Console */}
        <div className="agent-console-panel">
          <div className="console-header">
            <div className="console-title">
              <Terminal size={14} style={{ marginRight: '6px' }} />
              <span>DEADLINE_IQ_AGENT://TERMINAL_CLI</span>
            </div>
            <div className="console-status">
              <div className={`status-dot ${consoleStatus === 'RUNNING' ? 'active' : ''}`}></div>
              <span id="console-status-text">{consoleStatus}</span>
            </div>
          </div>
          <div className="console-body" id="console-terminal-body" ref={consoleBodyRef}>
            {consoleLines.map((line, idx) => (
              <div className={`console-line ${line.type}`} key={idx}>
                &gt; {line.text}
              </div>
            ))}
            
            {showDeliverableCard && (
              <div className="deliverable-card">
                <div className="deliverable-header">
                  <span className="deliverable-title">
                    <FileText size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> 
                    Compiled Deliverable: {tasks.find(t => t.id === selectedTaskId)?.title}
                  </span>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '4px 10px', fontSize: '11px' }} 
                    onClick={handleViewDeliverable}
                  >
                    View Deliverable
                  </button>
                </div>
                <div className="deliverable-body">{getMockPreviewText()}</div>
              </div>
            )}

            <div className="console-line console-cursor-line">
              <span className="console-cursor"></span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
