import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle, 
  Circle,
  X
} from 'lucide-react';

export default function CalendarView({ setTaskModalOpen, setPreFilledDate }) {
  const { tasks, addTask, deleteTask, toggleTask } = useApp();
  const [calDate, setCalDate] = useState(new Date());
  const [isLayerOpen, setIsLayerOpen] = useState(false);

  const getTodayStr = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [selectedDateStr, setSelectedDateStr] = useState(getTodayStr());

  // Quick Add Form State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickTime, setQuickTime] = useState('09:00');
  const [quickCategory, setQuickCategory] = useState('work');

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
    setIsLayerOpen(true);
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

  const handleOpenModalForSelected = () => {
    const now = new Date();
    const hrs = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const formattedVal = `${selectedDateStr}T${hrs}:${mins}`;
    setPreFilledDate(formattedVal);
    setTaskModalOpen(true);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle,
      deadline: `${selectedDateStr}T${quickTime}`,
      category: quickCategory,
      complexity: 3,
      energyCost: 'medium'
    });

    setQuickTitle('');
  };

  const getSelectedDateObj = () => {
    const parts = selectedDateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date();
  };

  const formatTimeStr = (tStr) => {
    if (!tStr) return '';
    const [h, m] = tStr.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const hr12 = hr % 12 || 12;
    return `${String(hr12).padStart(2, '0')}:${m} ${ampm}`;
  };

  const cells = getCalendarCells();
  const selectedDateObj = getSelectedDateObj();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  const formattedSelectedDate = selectedDateObj.toLocaleDateString('en-US', dateOptions);
  const isSelectedToday = selectedDateStr === getTodayStr();

  // Filter tasks for selected day agenda
  const selectedDayTasks = tasks.filter(t => t.deadline && t.deadline.startsWith(selectedDateStr));
  const sortedDayTasks = [...selectedDayTasks].sort((a, b) => {
    const timeA = a.deadline.includes('T') ? a.deadline.split('T')[1] : '00:00';
    const timeB = b.deadline.includes('T') ? b.deadline.split('T')[1] : '00:00';
    return timeA.localeCompare(timeB);
  });

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

      {/* Floating Layer Overlay Modal (All data and quick scheduling) */}
      {isLayerOpen && (
        <div className="calendar-modal-backdrop" onClick={() => setIsLayerOpen(false)}>
          <div className="calendar-modal-container glass-panel" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
            
            <div className="agenda-header" style={{ marginBottom: '16px' }}>
              <div className="agenda-title-row">
                <span className="agenda-title" style={{ fontSize: '16px', fontWeight: '800' }}>{formattedSelectedDate}</span>
                {isSelectedToday && <span className="agenda-today-badge">Today</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="btn btn-secondary btn-icon" onClick={handleOpenModalForSelected} title="Open detailed task scheduler">
                  <Plus size={16} />
                </button>
                <button className="calendar-modal-close-btn" onClick={() => setIsLayerOpen(false)} title="Close Panel">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="agenda-list" style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', minHeight: '150px', maxHeight: '350px' }}>
              {sortedDayTasks.length === 0 ? (
                <div className="agenda-empty-state">
                  <Calendar size={28} style={{ color: 'var(--text-muted)' }} />
                  <p>No meetings or work scheduled for this day.</p>
                </div>
              ) : (
                sortedDayTasks.map(t => {
                  const isCompleted = t.status === 'completed';
                  const timePart = t.deadline.includes('T') ? t.deadline.split('T')[1] : '';
                  const isMeeting = t.title.toLowerCase().includes('meeting') || 
                                    t.title.toLowerCase().includes('sync') || 
                                    t.title.toLowerCase().includes('call');

                  return (
                    <div key={t.id} className={`agenda-item ${isCompleted ? 'completed' : ''}`}>
                      <button className="agenda-check-btn" onClick={() => toggleTask(t.id)}>
                        {isCompleted ? <CheckCircle size={17} className="completed-check" /> : <Circle size={17} />}
                      </button>
                      
                      <div className="agenda-item-content">
                        <div className="agenda-item-title-row">
                          <span className="agenda-item-title">{t.title}</span>
                          <button className="agenda-delete-btn" onClick={() => deleteTask(t.id)} title="Delete task">
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="agenda-item-meta">
                          {timePart && (
                            <span className="agenda-time">
                              <Clock size={11} />
                              {formatTimeStr(timePart)}
                            </span>
                          )}

                          {isMeeting ? (
                            <span className="agenda-badge meeting-badge">
                              <Video size={10} style={{ marginRight: '3px' }} /> Meeting
                            </span>
                          ) : (
                            <span className={`agenda-badge ${t.category}`}>
                              {t.category}
                            </span>
                          )}

                          {t.estimatedTime && (
                            <span style={{ opacity: 0.7 }}>({t.estimatedTime})</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Schedule Input inside the Modal Layer */}
            <form className="agenda-quick-add" onSubmit={handleQuickAdd} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <span className="quick-add-title">⚡ Quick Schedule on this Day</span>
              
              <div className="quick-add-inputs">
                <input 
                  type="text" 
                  className="quick-add-input" 
                  placeholder="Task or Meeting title"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  required
                />
                
                <div className="quick-add-row" style={{ marginTop: '8px' }}>
                  <input 
                    type="time" 
                    className="quick-add-input quick-add-time"
                    value={quickTime}
                    onChange={(e) => setQuickTime(e.target.value)}
                    required
                  />
                  
                  <select 
                    className="quick-add-select"
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                  >
                    <option value="work">💼 Work</option>
                    <option value="study">📚 Study</option>
                    <option value="finance">💵 Finance</option>
                    <option value="personal">👤 Personal</option>
                  </select>
                  
                  <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 12px', height: '33px', borderRadius: '8px' }}>
                    Add
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

    </section>
  );
}
