import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Flame, AlertCircle, Sparkles, Zap, Info, Tag } from 'lucide-react';

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
      setEfficiencyDesc('🔥 Elite Rescue Level! You are mastering your time limits.');
    } else if (score >= 50) {
      setEfficiencyDesc('⚡ Moderate Alert. Schedule pending critical items.');
    } else {
      setEfficiencyDesc('🚨 Rescue Critical. Deadlines are slipping, use AI planner!');
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
            <h2><Sparkles size={18} style={{ color: 'var(--accent-purple)', fill: 'var(--accent-purple)' }} /> AI Focus Planner Recommendations</h2>
            <button className="btn btn-primary" onClick={runAIPrioritization}>
              <Zap size={16} /> Optimize Priority
            </button>
          </div>

          {/* AI Recommendation Box */}
          <div className="glass-panel ai-insights-box" id="ai-insights-container">
            {aiPrioritized && aiInsights ? (
              <>
                <div className="ai-insight-item" style={{ borderLeft: '2px solid var(--accent-rose)', paddingLeft: '10px' }}>
                  <AlertCircle size={16} style={{ color: 'var(--accent-rose)' }} />
                  <p>
                    <b>CRITICAL FOCUS ALERT:</b> We recommend immediately starting on <span>{aiInsights.topTask.title}</span>. It is {aiInsights.topTask.hoursRemaining < 0 ? 'overdue' : `due in ${Math.round(aiInsights.topTask.hoursRemaining)} hours`} and requires <span>{aiInsights.topTask.energyCost} energy</span>.
                  </p>
                </div>
                <div className="ai-insight-item">
                  <ShieldCheck size={16} style={{ color: 'var(--accent-teal)' }} />
                  <p>
                    <b>Rescue Plan Configured:</b> Tasks have been reordered based on Rescue Urgency Index. Total complexity score is <b>{aiInsights.totalComplexity}</b>. Work through them from top to bottom.
                  </p>
                </div>
              </>
            ) : (
              <div className="ai-insight-item">
                <Info size={16} />
                <p>Welcome to <span>DeadlineIQ</span>. Add your upcoming commitments, work assignments, or tasks, then click <b>Optimize Priority</b> to let the AI calculate your personalized Rescue Schedule.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Dashboard */}
        <div className="dashboard-right">
          {/* Productivity Gauge */}
          <div className="glass-panel" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Rescue Efficiency Score</h3>
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
              {efficiencyDesc.startsWith('🔥') && (
                <span>🔥 <span style={{ color: 'var(--accent-emerald)' }}>Elite Rescue Level!</span> You are mastering your time limits.</span>
              )}
              {efficiencyDesc.startsWith('⚡') && (
                <span>⚡ <span style={{ color: 'var(--accent-amber)' }}>Moderate Alert.</span> Schedule pending critical items.</span>
              )}
              {efficiencyDesc.startsWith('🚨') && (
                <span>🚨 <span style={{ color: 'var(--accent-rose)' }}>Rescue Critical.</span> Deadlines are slipping, use AI planner!</span>
              )}
            </p>
          </div>

          {/* Nearest Deadlines Widget */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>Nearest Deadlines</h3>
            <div className="deadline-list" id="dashboard-deadline-list">
              {nearestDeadlines.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No tasks scheduled yet</p>
              ) : (
                nearestDeadlines.map(t => {
                  const info = getDeadlineTimeText(t.deadline);
                  return (
                    <div className="deadline-item" key={t.id} onClick={() => setActivePage('tasks')} style={{ cursor: 'pointer' }}>
                      <div className="deadline-meta">
                        <span className="deadline-name">{t.title}</span>
                        <span className="deadline-tag"><Tag size={12} style={{ marginRight: '4px' }} /> {t.category}</span>
                      </div>
                      <div className="deadline-time">
                        <span className={`time-left ${info.cls}`}>{info.text}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
