import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Flame, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  Info, 
  Tag, 
  Clock, 
  Users, 
  MessageSquare, 
  AlertTriangle 
} from 'lucide-react';

export default function Dashboard() {
  const { 
    tasks, 
    habits, 
    runAIPrioritization, 
    aiInsights, 
    aiPrioritized, 
    setActivePage 
  } = useApp();

  const [savedCount, setSavedCount] = useState(0);
  const [habitStreak, setHabitStreak] = useState('0d');
  const [urgentCount, setUrgentCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);

  const [efficiencyScore, setEfficiencyScore] = useState(0);
  const [efficiencyDesc, setEfficiencyDesc] = useState('');
  const [gaugeOffset, setGaugeOffset] = useState(377);

  // 1. Calculate statistics
  useEffect(() => {
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

    setSavedCount(completed);
    setUrgentCount(urgent);
    setMissedCount(missed);

    // Streak
    let avgStreak = 0;
    if (habits.length > 0) {
      const sum = habits.reduce((acc, h) => acc + h.streak, 0);
      avgStreak = Math.round(sum / habits.length);
    }
    setHabitStreak(`${avgStreak}d`);

    // Efficiency Score
    const totalRelevant = completed + missed + urgent;
    let score = 0;
    if (totalRelevant > 0) {
      score = Math.round((completed / totalRelevant) * 100);
    } else if (tasks.length > 0) {
      score = Math.round((completed / tasks.length) * 100);
    }
    setEfficiencyScore(score);

    // Circular ring offset
    const radius = 60;
    const circumference = 2 * Math.PI * radius; // ~376.99
    const offset = circumference - (score / 100) * circumference;
    setGaugeOffset(offset);

    // Efficiency Description
    if (score >= 80) {
      setEfficiencyDesc('elite');
    } else if (score >= 50) {
      setEfficiencyDesc('moderate');
    } else {
      setEfficiencyDesc('critical');
    }
  }, [tasks, habits]);

  // 2. Nearest Deadlines list
  const [nearestDeadlines, setNearestDeadlines] = useState([]);

  useEffect(() => {
    const pending = tasks.filter(t => t.status === 'pending');
    pending.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    setNearestDeadlines(pending.slice(0, 3));
  }, [tasks]);

  const getDeadlineTimeText = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff < 0) return { text: 'Overdue', cls: 'time-critical' };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 3) {
      return { text: `${hours}h remaining`, cls: 'time-critical' };
    } else if (hours < 24) {
      return { text: `${hours}h remaining`, cls: 'time-warning' };
    } else {
      return { text: `${Math.round(hours / 24)}d left`, cls: 'time-safe' };
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const sortedPending = [...pendingTasks].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

  // Dynamic AI schedule generation helpers
  const parseEstimatedTime = (timeStr) => {
    if (!timeStr) return 45; // default 45 mins
    const hourMatch = timeStr.match(/(\d+)\s*h/);
    const minMatch = timeStr.match(/(\d+)\s*m/);
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const mins = minMatch ? parseInt(minMatch[1]) : 0;
    return (hours * 60) + mins || 45;
  };

  const formatTime = (minutesFromStart) => {
    const startHour = 9; // 09:00 AM
    const totalMinutes = startHour * 60 + minutesFromStart;
    const hour24 = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
  };

  const generateAISchedule = () => {
    if (pendingTasks.length === 0) return [];

    const blocks = [];
    let currentMinutes = 0;
    
    for (let i = 0; i < sortedPending.length; i++) {
      const task = sortedPending[i];
      const taskMinutes = parseEstimatedTime(task.estimatedTime);
      
      // Keep it achievable: limit to 7 hours of scheduled timeline
      if (currentMinutes + taskMinutes > 420) {
        break;
      }
      
      // Insert a lunch break if we cross 12:30 PM (210 minutes from 09:00 AM)
      if (currentMinutes >= 210 && !blocks.some(b => b.label === 'Lunch Break')) {
        blocks.push({
          time: formatTime(currentMinutes),
          label: 'Lunch Break',
          task: 'Recharge & Hydrate',
          duration: '45m',
          priority: 'None',
          isBreak: true
        });
        currentMinutes += 45;
      }

      // If a task is very long, split it to keep it achievable
      if (taskMinutes > 90) {
        const parts = Math.ceil(taskMinutes / 90);
        for (let p = 1; p <= parts; p++) {
          const chunkDuration = p === parts ? (taskMinutes % 90 || 90) : 90;
          
          blocks.push({
            time: formatTime(currentMinutes),
            label: `Deep Work: ${task.title} (Part ${p}/${parts})`,
            task: task.description || 'Focus on main objectives.',
            duration: `${chunkDuration}m`,
            priority: task.priorityLevel || 'Medium',
            isBreak: false
          });
          currentMinutes += chunkDuration;

          if (p < parts || i < sortedPending.length - 1) {
            blocks.push({
              time: formatTime(currentMinutes),
              label: 'Rest & Stretch',
              task: 'Step away from screen',
              duration: '15m',
              priority: 'None',
              isBreak: true
            });
            currentMinutes += 15;
          }
        }
      } else {
        blocks.push({
          time: formatTime(currentMinutes),
          label: `Focus Session: ${task.title}`,
          task: task.description || 'Focus on completing objectives.',
          duration: `${taskMinutes}m`,
          priority: task.priorityLevel || 'Medium',
          isBreak: false
        });
        currentMinutes += taskMinutes;

        if (i < sortedPending.length - 1) {
          blocks.push({
            time: formatTime(currentMinutes),
            label: 'Short Break',
            task: 'Hydrate & rest your eyes',
            duration: '10m',
            priority: 'None',
            isBreak: true
          });
          currentMinutes += 10;
        }
      }
    }

    // Daily wrap-up
    blocks.push({
      time: formatTime(currentMinutes),
      label: 'Daily Review & Wrap-up',
      task: 'Review achievements & plan tomorrow',
      duration: '15m',
      priority: 'Low',
      isBreak: true
    });

    return blocks;
  };

  const timelineBlocks = generateAISchedule();

  // Dynamic Coach Suggestions
  const coachSuggestions = [];
  if (sortedPending.length > 0) {
    const topTask = sortedPending[0];
    if ((topTask.missRisk || 0) > 50) {
      coachSuggestions.push({
        type: 'critical',
        text: `Urgent Hazard: "${topTask.title}" has a ${topTask.missRisk}% risk of missing its deadline. Prioritize this immediately.`
      });
    }
    coachSuggestions.push({
      type: 'tip',
      text: `Move complex tasks like "${topTask.title}" to the 09:00 AM Deep Work block to leverage peak cognitive window.`
    });
  } else {
    coachSuggestions.push({
      type: 'info',
      text: "All clear! You don't have any pending tasks. Click 'Optimize Priority' or add tasks to receive coaching insights."
    });
  }
  coachSuggestions.push({
    type: 'productivity',
    text: "Productivity Pattern: You complete 40% more tasks when utilizing binaural beats in Focus Mode."
  });

  return (
    <section id="dashboard-page" className="page-container active">
      <div className="dashboard-grid">
        
        {/* Left Side Dashboard */}
        <div className="dashboard-left">
          {/* Status Info Cards */}
          <div className="status-row">
            <div className="status-card glass-panel">
              <div className="status-icon status-purple">
                <ShieldCheck size={20} />
              </div>
              <div className="status-info">
                <h3 id="stat-saved-count">{savedCount}</h3>
                <p>Saved Tasks</p>
              </div>
            </div>
            <div className="status-card glass-panel">
              <div className="status-icon status-teal">
                <Flame size={20} />
              </div>
              <div className="status-info">
                <h3 id="stat-habit-streak">{habitStreak}</h3>
                <p>Habit Streak</p>
              </div>
            </div>
            <div className="status-card glass-panel">
              <div className="status-icon status-rose">
                <AlertCircle size={20} />
              </div>
              <div className="status-info">
                <h3 id="stat-urgent-count">{urgentCount}</h3>
                <p>Urgent Deadlines</p>
              </div>
            </div>
          </div>

          {/* Section title & run priority optimizer */}
          <div className="section-title-row">
            <h2>
              <Sparkles size={18} style={{ color: 'var(--accent-purple)', fill: 'var(--accent-purple)' }} /> 
              Today's AI-Generated Schedule
            </h2>
            <button className="btn btn-primary" onClick={runAIPrioritization}>
              <Zap size={16} /> Optimize Priority
            </button>
          </div>

          {/* AI-Generated Schedule Timeline */}
          <div className="glass-panel ai-schedule-timeline" style={{ marginBottom: '24px', padding: timelineBlocks.length === 0 ? '40px 24px' : '24px' }}>
            {timelineBlocks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                  <Sparkles size={36} style={{ color: 'var(--accent-purple)', filter: 'drop-shadow(0 4px 10px rgba(139, 92, 246, 0.4))' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Your day is clear!</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', margin: '8px auto 0 auto', maxWidth: '340px', lineHeight: 1.6 }}>
                  No pending tasks found. Use the NLP Commander in the Task Brain to add tasks and automatically construct your custom AI daily schedule.
                </p>
              </div>
            ) : (
              <div className="timeline-container">
                {timelineBlocks.map((block, idx) => (
                  <div 
                    className={`timeline-block ${block.isBreak ? 'timeline-break' : ''}`} 
                    key={idx}
                    style={block.isBreak ? { opacity: 0.85 } : {}}
                  >
                    <div className="timeline-time">
                      <Clock size={14} style={{ marginRight: '6px', color: block.isBreak ? 'var(--text-muted)' : 'var(--accent-purple)' }} />
                      <span>{block.time}</span>
                    </div>
                    <div className="timeline-connector">
                      <div 
                        className="timeline-dot" 
                        style={block.isBreak ? { background: 'var(--text-muted)', width: '8px', height: '8px', boxShadow: 'none' } : {}}
                      ></div>
                      {idx < timelineBlocks.length - 1 && <div className="timeline-line"></div>}
                    </div>
                    <div 
                      className="timeline-content" 
                      style={block.isBreak ? { background: 'rgba(255, 255, 255, 0.015)', border: '1px dashed rgba(255,255,255,0.06)' } : {}}
                    >
                      <div className="timeline-header">
                        <span 
                          className="timeline-label" 
                          style={block.isBreak ? { color: 'var(--text-secondary)', fontWeight: 500 } : {}}
                        >
                          {block.label}
                        </span>
                        <span className="timeline-duration" style={block.isBreak ? { background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' } : {}}>
                          {block.duration}
                        </span>
                      </div>
                      <p className="timeline-task" style={block.isBreak ? { color: 'var(--text-muted)', fontStyle: 'italic' } : {}}>{block.task}</p>
                      {!block.isBreak && block.priority !== 'Low' && block.priority !== 'None' && (
                        <span className={`priority-tag-badge priority-${block.priority.toLowerCase()}`}>
                          {block.priority}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Coach Panel */}
          <div className="section-title-row" style={{ marginTop: '0px' }}>
            <h2>
              <Sparkles size={18} style={{ color: 'var(--accent-teal)', fill: 'var(--accent-teal)' }} /> 
              AI Coach & Scheduler Suggestions
            </h2>
          </div>
          <div className="glass-panel coach-suggestions-panel" style={{ padding: '16px' }}>
            {coachSuggestions.map((sug, idx) => (
              <div className={`coach-suggestion-item ${sug.type}-suggestion`} key={idx} style={{ display: 'flex', gap: '10px', marginBottom: idx < coachSuggestions.length - 1 ? '12px' : '0' }}>
                <div className="suggestion-icon" style={{ marginTop: '2px' }}>
                  {sug.type === 'critical' && <AlertTriangle size={16} style={{ color: 'var(--accent-rose)' }} />}
                  {sug.type === 'tip' && <Zap size={16} style={{ color: 'var(--accent-purple)' }} />}
                  {sug.type === 'productivity' && <ShieldCheck size={16} style={{ color: 'var(--accent-teal)' }} />}
                  {sug.type === 'info' && <Info size={16} style={{ color: 'var(--text-muted)' }} />}
                </div>
                <p style={{ fontSize: '13px', lineHeight: '1.4', margin: '0', color: 'var(--text-primary)' }}>{sug.text}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Right Side Dashboard */}
        <div className="dashboard-right">
          {/* Productivity Gauge */}
          <div className="glass-panel" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Rescue Efficiency Score</h3>
            <div className="productivity-score-ring">
              <svg width="140" height="140">
                <defs>
                  <linearGradient id="cyanPurpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-teal)" />
                    <stop offset="100%" stopColor="var(--accent-purple)" />
                  </linearGradient>
                </defs>
                <circle className="ring-bg" cx="70" cy="70" r="60"></circle>
                <circle 
                  className="ring-fill" 
                  id="efficiency-gauge-fill" 
                  cx="70" 
                  cy="70" 
                  r="60" 
                  stroke="url(#cyanPurpleGradient)"
                  strokeDasharray="377" 
                  strokeDashoffset={gaugeOffset}
                ></circle>
              </svg>
              <div className="ring-text">
                <div className="ring-number" id="efficiency-score-text">{efficiencyScore}%</div>
                <div className="ring-label">Efficiency</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '15px' }} id="efficiency-desc">
              {efficiencyDesc === 'elite' && (
                <span><span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Elite Rescue Level!</span> You are mastering your time limits.</span>
              )}
              {efficiencyDesc === 'moderate' && (
                <span><span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>Moderate Alert.</span> Schedule pending critical items.</span>
              )}
              {efficiencyDesc === 'critical' && (
                <span><span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>Rescue Critical.</span> Deadlines are slipping, use AI planner!</span>
              )}
            </p>
          </div>

          {/* Nearest Deadlines Widget with Priority and Delay Risk Badges */}
          <div className="glass-panel" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '14px', fontWeight: 600 }}>Nearest Deadlines</h3>
            <div className="deadline-list" id="dashboard-deadline-list">
              {nearestDeadlines.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No tasks scheduled yet</p>
              ) : (
                nearestDeadlines.map(t => {
                  const info = getDeadlineTimeText(t.deadline);
                  return (
                    <div className="deadline-item" key={t.id} onClick={() => setActivePage('tasks')} style={{ cursor: 'pointer', padding: '12px 10px' }}>
                      <div className="deadline-meta" style={{ flex: '1', minWidth: '0' }}>
                        <span className="deadline-name" style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{t.title}</span>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className="deadline-tag"><Tag size={10} style={{ marginRight: '2px' }} /> {t.category}</span>
                          {t.priorityScore && (
                            <span className="score-pill">Score: {t.priorityScore}</span>
                          )}
                          {t.missRisk && (
                            <span className={`risk-pill risk-${t.missRisk > 60 ? 'high' : t.missRisk > 30 ? 'medium' : 'low'}`}>
                              Risk: {t.missRisk}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="deadline-time" style={{ marginLeft: '10px', flexShrink: 0 }}>
                        <span className={`time-left ${info.cls}`}>{info.text}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Collaboration Workspace Card */}
          <div className="glass-panel collaboration-card">
            <h3 style={{ fontSize: '15px', marginBottom: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} style={{ color: 'var(--accent-purple)' }} />
              Collaboration Workspace
            </h3>
            
            <div className="collab-project-line" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="collab-project-title" style={{ fontSize: '13px', fontWeight: 600 }}>Active Project: Alpha Redesign</span>
              <span className="members-badge" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>3 members</span>
            </div>

            <div className="collab-updates" style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 6px 0', letterSpacing: '0.05em' }}>Co-Author Updates</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-primary)' }}><b>Vansh Kulria</b> completed API Schema</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>10m ago</span>
                </div>
                <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-primary)' }}><b>Sarah Chen</b> added comments to caching</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>1h ago</span>
                </div>
              </div>
            </div>

            <div className="ai-meeting-summary-box" style={{ borderLeft: '2px solid var(--accent-purple)', paddingLeft: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <MessageSquare size={12} style={{ color: 'var(--accent-purple)' }} />
                <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-purple)', margin: '0', letterSpacing: '0.05em', fontWeight: 600 }}>AI Meeting Summary</h4>
              </div>
              <p style={{ fontSize: '11px', margin: '0', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Discussed frontend state & db sync. Action: integrate real-time priority scores (0-100) and delay risks. Next checkpoint in 1 hour.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
