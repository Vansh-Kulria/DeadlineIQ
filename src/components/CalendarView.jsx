import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus
} from 'lucide-react';

export default function CalendarView({ 
  setTaskModalOpen, 
  setPreFilledDate, 
  setCalendarModalOpen, 
  setCalendarModalDate 
}) {
  const { tasks } = useApp();
  const [calDate, setCalDate] = useState(new Date());

  const getTodayStr = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [selectedDateStr, setSelectedDateStr] = useState(getTodayStr());

  const year = calDate.getFullYear();
  const month = calDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate calendar days
  const getCalendarCells = () => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week 1st falls on
    const totalDays = new Date(year, month + 1, 0).getDate(); // Days in this month
    const prevMonthTotalDays = new Date(year, month, 0).getDate(); // Days in previous month
    const totalCells = 42; // 6 rows * 7 days
    const today = new Date();
    const cells = [];

    // 1. Prev Month's Ending Days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const cellDate = new Date(year, month - 1, dayNum);
      cells.push({ date: cellDate, otherMonth: true, isToday: false });
    }

    // 2. Current Month's Days
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const cellDate = new Date(year, month, dayNum);
      const isToday = cellDate.getDate() === today.getDate() &&
                      cellDate.getMonth() === today.getMonth() &&
                      cellDate.getFullYear() === today.getFullYear();
      cells.push({ date: cellDate, otherMonth: false, isToday });
    }

    // 3. Next Month's Beginning Days
    const remainingCells = totalCells - cells.length;
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const cellDate = new Date(year, month + 1, dayNum);
      cells.push({ date: cellDate, otherMonth: true, isToday: false });
    }

    return cells;
  };

  const changeMonth = (direction) => {
    const nextDate = new Date(calDate);
    nextDate.setMonth(nextDate.getMonth() + direction);
    setCalDate(nextDate);
  };

  const handleDayClick = (dateStr) => {
    setSelectedDateStr(dateStr);
    setCalendarModalDate(dateStr);
    setCalendarModalOpen(true);
  };

  const handleDayDoubleClick = (dateStr) => {
    // Pre-fill date input with the selected date (keeping current system hour/min)
    const now = new Date();
    const hrs = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const formattedVal = `${dateStr}T${hrs}:${mins}`;
    
    setPreFilledDate(formattedVal);
    setTaskModalOpen(true);
  };

  const cells = getCalendarCells();

  return (
    <section id="calendar-page" className="page-container active">
      {/* Monthly Calendar View (Full Width) */}
      <div className="glass-panel" style={{ padding: '24px', width: '100%' }}>
        <div className="calendar-controls">
          <div className="calendar-month-year" id="calendar-title" style={{ fontSize: '18px', fontWeight: '800' }}>
            {monthNames[month]} {year}
          </div>
          <div className="calendar-nav-btns">
            <button className="btn btn-secondary btn-icon" onClick={() => changeMonth(-1)}>
              <ChevronLeft size={16} />
            </button>
            <button className="btn btn-secondary btn-icon" onClick={() => changeMonth(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          <div className="calendar-day-header">Sun</div>
          <div className="calendar-day-header">Mon</div>
          <div className="calendar-day-header">Tue</div>
          <div className="calendar-day-header">Wed</div>
          <div className="calendar-day-header">Thu</div>
          <div className="calendar-day-header">Fri</div>
          <div className="calendar-day-header">Sat</div>
        </div>

        <div className="calendar-days-container" id="calendar-grid-cells" style={{ minHeight: '420px' }}>
          {cells.map((cell, idx) => {
            const y = cell.date.getFullYear();
            const mStr = String(cell.date.getMonth() + 1).padStart(2, '0');
            const dStr = String(cell.date.getDate()).padStart(2, '0');
            const dateStr = `${y}-${mStr}-${dStr}`;

            const dayTasks = tasks.filter(t => t.deadline && t.deadline.startsWith(dateStr));
            const isSelected = dateStr === selectedDateStr;

            return (
              <div 
                key={idx}
                className={`calendar-day-cell ${cell.otherMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleDayClick(dateStr)}
                onDoubleClick={() => handleDayDoubleClick(dateStr)}
                title="Click to view daily agenda | Double click to add a task"
              >
                <div className="calendar-day-num-row">
                  <span className="calendar-day-number">{cell.date.getDate()}</span>
                  {dayTasks.length > 0 && (
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      background: 'var(--accent-teal)',
                      display: 'inline-block'
                    }}></span>
                  )}
                </div>
                <div className="calendar-cell-events">
                  {dayTasks.map(t => {
                    let pillClass = 'event-safe';
                    if (t.status === 'completed') {
                      pillClass = 'event-completed';
                    } else {
                      const diff = new Date(t.deadline) - new Date();
                      const hours = diff / (1000 * 60 * 60);
                      if (hours < 0 || hours < 6) {
                        pillClass = 'event-critical';
                      } else if (hours < 24) {
                        pillClass = 'event-warning';
                      }
                    }

                    const timeFormatted = t.deadline.includes('T') ? t.deadline.split('T')[1] : '';
                    return (
                      <div className={`calendar-event-pill ${pillClass}`} title={`${t.title} (${t.category})`} key={t.id}>
                        {timeFormatted && `${timeFormatted} `}{t.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
