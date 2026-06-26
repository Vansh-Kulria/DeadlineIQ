import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarView({ setTaskModalOpen, setPreFilledDate }) {
  const { tasks } = useApp();
  const [calDate, setCalDate] = useState(new Date());

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
      <div className="glass-panel" style={{ padding: '30px' }}>
        <div className="calendar-controls">
          <div className="calendar-month-year" id="calendar-title">
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

        <div className="calendar-days-container" id="calendar-grid-cells">
          {cells.map((cell, idx) => {
            const y = cell.date.getFullYear();
            const mStr = String(cell.date.getMonth() + 1).padStart(2, '0');
            const dStr = String(cell.date.getDate()).padStart(2, '0');
            const dateStr = `${y}-${mStr}-${dStr}`;

            const dayTasks = tasks.filter(t => t.deadline && t.deadline.startsWith(dateStr));

            return (
              <div 
                key={idx}
                className={`calendar-day-cell ${cell.otherMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''}`}
                onClick={() => handleDayClick(dateStr)}
              >
                <div className="calendar-day-num-row">
                  <span className="calendar-day-number">{cell.date.getDate()}</span>
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

                    const timeFormatted = new Date(t.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                    return (
                      <div className={`calendar-event-pill ${pillClass}`} title={`${t.title} (${t.category})`} key={t.id}>
                        {timeFormatted} {t.title}
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
