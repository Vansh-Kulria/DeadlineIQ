import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Zap, Target, Award, Trash2, X } from 'lucide-react';

export default function HabitsRoutine({ setHabitModalOpen }) {
  const { 
    habits, 
    toggleHabitDay, 
    deleteHabit,
    goals, 
    addGoal, 
    deleteGoal,
    addMilestone,
    deleteMilestone,
    addMilestoneTask,
    deleteMilestoneTask,
    toggleGoalTask 
  } = useApp();

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalType, setNewGoalType] = useState('weekly');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [milestoneInputs, setMilestoneInputs] = useState({});
  const [taskInputs, setTaskInputs] = useState({});

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper to render the 7-day checklist (ending today)
  const getHistoryDays = (habit) => {
    const historyDays = [];
    const today = new Date();
    
    // Walk back 6 days + today = 7 days
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - 6);

    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(startOfWeek.getDate() + i);
      
      const curStr = current.toISOString().slice(0, 10);
      const isCompleted = habit.history.includes(curStr);
      const dayName = daysOfWeek[current.getDay()];
      
      const checkToday = new Date();
      checkToday.setHours(0,0,0,0);
      const cellMidnight = new Date(current);
      cellMidnight.setHours(0,0,0,0);
      const isFuture = cellMidnight > checkToday;
      const isToday = curStr === todayStr;

      historyDays.push({
        dateStr: curStr,
        dayName,
        isCompleted,
        isFuture,
        isToday
      });
    }

    return historyDays;
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    addGoal(newGoalTitle.trim(), newGoalType);
    setNewGoalTitle('');
    setNewGoalType('weekly');
    setShowGoalForm(false);
  };

  const handleMilestoneInputChange = (goalId, val) => {
    setMilestoneInputs(prev => ({ ...prev, [goalId]: val }));
  };

  const handleAddMilestoneSubmit = (e, goalId) => {
    e.preventDefault();
    const val = milestoneInputs[goalId];
    if (!val || !val.trim()) return;
    addMilestone(goalId, val.trim());
    setMilestoneInputs(prev => ({ ...prev, [goalId]: '' }));
  };

  const handleTaskInputChange = (goalId, weekName, val) => {
    setTaskInputs(prev => ({ ...prev, [`${goalId}-${weekName}`]: val }));
  };

  const handleAddTaskSubmit = (e, goalId, weekName) => {
    e.preventDefault();
    const val = taskInputs[`${goalId}-${weekName}`];
    if (!val || !val.trim()) return;
    addMilestoneTask(goalId, weekName, val.trim());
    setTaskInputs(prev => ({ ...prev, [`${goalId}-${weekName}`]: '' }));
  };

  return (
    <section id="habits-page" className="page-container active">
      {/* Routine Tracker Header */}
      <div className="section-title-row">
        <h2>Goal & Routine Streaks</h2>
        <button className="btn btn-primary" onClick={() => setHabitModalOpen(true)}>
          <Plus size={16} /> Add Habit
        </button>
      </div>
      
      {/* Habits Grid */}
      <div className="habits-grid" id="habits-list-container" style={{ marginBottom: '32px' }}>
        {habits.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', gridColumn: '1 / -1' }}>
            No habits tracked yet. Click Add Habit to start.
          </p>
        ) : (
          habits.map(h => {
            const historyDays = getHistoryDays(h);
            return (
              <div className="habit-card glass-panel" key={h.id}>
                <div className="habit-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="habit-title" style={{ fontWeight: 700 }}>{h.name}</span>
                    <span className="habit-streak">
                      <Zap size={11} style={{ fill: 'var(--accent-amber)', color: 'var(--accent-amber)', marginRight: '4px' }} /> 
                      {h.streak} Day Streak
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteHabit(h.id)}
                    className="habit-delete-btn"
                    title="Delete Habit"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="habit-history">
                  {historyDays.map((day, idx) => (
                    <div className="habit-day" key={idx} title={day.isToday ? "Click to check-in for today" : `${day.dayName} (Read-Only)`}>
                      <span className="habit-day-label">{day.dayName}</span>
                      <div 
                        className={`habit-day-dot ${day.isCompleted ? 'completed' : ''} ${day.isFuture ? 'future' : ''} ${day.isToday ? 'today' : 'read-only'}`}
                        onClick={() => day.isToday && toggleHabitDay(h.id, day.dateStr)}
                      >
                        {day.isCompleted ? '✓' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Goal Management System Header */}
      <div className="section-title-row" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', marginBottom: '16px' }}>
        <h2>
          <Target size={18} style={{ color: 'var(--accent-teal)', marginRight: '6px' }} /> 
          Goal Planner
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!showGoalForm ? (
            <button className="btn btn-primary" onClick={() => setShowGoalForm(true)}>
              <Plus size={16} /> New Goal
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => setShowGoalForm(false)}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Inline Goal Creation Form */}
      {showGoalForm && (
        <form onSubmit={handleGoalSubmit} className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Goal Title</label>
            <input 
              type="text" 
              placeholder="e.g. Master React Native, Train for Marathon, Write Book..." 
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              className="input-field"
              style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', outline: 'none' }}
              autoFocus
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Tracking Period</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)' }}>
                <input 
                  type="radio" 
                  name="goalType" 
                  value="weekly" 
                  checked={newGoalType === 'weekly'} 
                  onChange={() => setNewGoalType('weekly')} 
                  style={{ accentColor: 'var(--accent-teal)' }}
                />
                Weekly Tracking
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)' }}>
                <input 
                  type="radio" 
                  name="goalType" 
                  value="daily" 
                  checked={newGoalType === 'daily'} 
                  onChange={() => setNewGoalType('daily')} 
                  style={{ accentColor: 'var(--accent-teal)' }}
                />
                Daily Tracking
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowGoalForm(false)} style={{ padding: '8px 16px' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-purple))', border: 'none' }}>
              Create Goal
            </button>
          </div>
        </form>
      )}

      {/* Goal Roadmap List */}
      <div className="goals-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {goals.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
            No active goals. Click "New Goal" to get started!
          </p>
        ) : (
          goals.map(g => (
            <div className="goal-card glass-panel" key={g.id} style={{ padding: '20px' }}>
              <div className="goal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} style={{ color: 'var(--accent-amber)' }} />
                  <span className="goal-title" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{g.title}</span>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {g.type || 'weekly'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-teal)' }}>{g.progress}% Complete</span>
                  <button 
                    onClick={() => deleteGoal(g.id)} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', transition: 'color 0.2s, background-color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    title="Delete Goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="goal-progress-bar-container" style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
                <div className="goal-progress-bar" style={{ width: `${g.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-teal), var(--accent-purple))', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
              </div>

              {/* Weekly/Daily Milestones */}
              <div className="goal-roadmap-weeks" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {(g.weeks || []).map((week, wIdx) => (
                  <div className="roadmap-week-box" key={wIdx} style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {week.name}
                      </h4>
                      <button 
                        onClick={() => deleteMilestone(g.id, week.name)} 
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        title={`Delete ${g.type === 'daily' ? 'Day' : 'Week'}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                      {week.tasks.length === 0 ? (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>No tasks added yet</span>
                      ) : (
                        week.tasks.map(t => (
                          <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div 
                                className={`custom-checkbox ${t.completed ? 'checked' : ''}`}
                                onClick={() => toggleGoalTask(g.id, t.id)}
                                style={{ width: '14px', height: '14px', borderRadius: '3px', flexShrink: 0 }}
                              ></div>
                              <span style={{ fontSize: '12px', color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: t.completed ? 'line-through' : 'none', lineHeight: '1.3' }}>
                                {t.title}
                              </span>
                            </div>
                            <button 
                              onClick={() => deleteMilestoneTask(g.id, week.name, t.id)} 
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}
                              onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#ef4444'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.color = 'var(--text-muted)'; }}
                              title="Delete Task"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Inline Task Form */}
                    <form 
                      onSubmit={(e) => handleAddTaskSubmit(e, g.id, week.name)} 
                      style={{ display: 'flex', gap: '6px', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.03)' }}
                    >
                      <input 
                        type="text" 
                        placeholder="Add task..." 
                        value={taskInputs[`${g.id}-${week.name}`] || ''}
                        onChange={(e) => handleTaskInputChange(g.id, week.name, e.target.value)}
                        style={{ flexGrow: 1, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                      <button 
                        type="submit" 
                        style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      >
                        +
                      </button>
                    </form>
                  </div>
                ))}

                {/* Add Milestone Box */}
                <div 
                  className="roadmap-week-box" 
                  style={{ 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px dashed rgba(255,255,255,0.1)', 
                    padding: '14px', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px', 
                    justifyContent: 'center', 
                    minHeight: '130px' 
                  }}
                >
                  <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
                    + Add {g.type === 'daily' ? 'Day' : 'Week'} Section
                  </h4>
                  <form onSubmit={(e) => handleAddMilestoneSubmit(e, g.id)} style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      type="text" 
                      placeholder={g.type === 'daily' ? 'e.g. Day 1' : 'e.g. Week 1'} 
                      value={milestoneInputs[g.id] || ''}
                      onChange={(e) => handleMilestoneInputChange(g.id, e.target.value)}
                      style={{ flexGrow: 1, padding: '6px 10px', borderRadius: '6px', fontSize: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                    <button 
                      type="submit" 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      Add
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
