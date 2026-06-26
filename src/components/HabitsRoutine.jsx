import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Zap } from 'lucide-react';

export default function HabitsRoutine({ setHabitModalOpen }) {
  const { habits, toggleHabitDay } = useApp();

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

      historyDays.push({
        dateStr: curStr,
        dayName,
        isCompleted,
        isFuture
      });
    }

    return historyDays;
  };

  return (
    <section id="habits-page" className="page-container active">
      <div className="section-title-row">
        <h2>Goal & Routine Streaks</h2>
        <button className="btn btn-primary" onClick={() => setHabitModalOpen(true)}>
          <Plus size={16} /> Add Habit
        </button>
      </div>
      
      <div className="habits-grid" id="habits-list-container">
        {habits.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', gridColumn: '1 / -1' }}>
            No habits tracked yet. Click Add Habit to start.
          </p>
        ) : (
          habits.map(h => {
            const historyDays = getHistoryDays(h);
            return (
              <div className="habit-card glass-panel" key={h.id}>
                <div className="habit-header">
                  <span className="habit-title">{h.name}</span>
                  <span className="habit-streak">
                    <Zap size={12} style={{ fill: 'var(--accent-amber)', color: 'var(--accent-amber)', marginRight: '4px' }} /> 
                    {h.streak} Day Streak
                  </span>
                </div>
                <div className="habit-history">
                  {historyDays.map((day, idx) => (
                    <div className="habit-day" key={idx}>
                      <span className="habit-day-label">{day.dayName}</span>
                      <div 
                        className={`habit-day-dot ${day.isCompleted ? 'completed' : ''} ${day.isFuture ? 'future' : ''}`}
                        onClick={() => !day.isFuture && toggleHabitDay(h.id, day.dateStr)}
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
    </section>
  );
}
