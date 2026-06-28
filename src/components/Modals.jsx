import React, { useState, useEffect } from 'react';
import { useApp, getLocalDateTimeString } from '../context/AppContext';
import { 
  Copy, 
  Clock, 
  Video, 
  CheckCircle, 
  Circle, 
  Trash2, 
  Plus, 
  X, 
  Calendar,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';

export default function Modals({
  taskModalOpen, setTaskModalOpen,
  habitModalOpen, setHabitModalOpen,
  deliverableModalOpen, setDeliverableModalOpen,
  deliverableContent,
  deliverableTitle,
  preFilledDate, setPreFilledDate,
  calendarModalOpen, setCalendarModalOpen,
  calendarModalDate
}) {
  const { tasks, addTask, deleteTask, toggleTask, addHabit } = useApp();

  // 1. Task Modal States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState('work');
  const [taskEnergy, setTaskEnergy] = useState('medium');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskComplexity, setTaskComplexity] = useState(3);

  // 2. Quick Add in Calendar State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickTime, setQuickTime] = useState('09:00');
  const [quickCategory, setQuickCategory] = useState('work');

  // Set default deadline to tomorrow noon
  useEffect(() => {
    if (taskModalOpen) {
      if (preFilledDate) {
        setTaskDeadline(preFilledDate);
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0);
        // Format to YYYY-MM-DDTHH:MM local
        const y = tomorrow.getFullYear();
        const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const d = String(tomorrow.getDate()).padStart(2, '0');
        const h = String(tomorrow.getHours()).padStart(2, '0');
        const min = String(tomorrow.getMinutes()).padStart(2, '0');
        setTaskDeadline(`${y}-${m}-${d}T${h}:${min}`);
      }
    }
  }, [taskModalOpen, preFilledDate]);

  const handleTaskSubmit = () => {
    if (!taskTitle.trim()) {
      alert('Please enter a title');
      return;
    }
    addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      category: taskCategory,
      energyCost: taskEnergy,
      deadline: taskDeadline,
      complexity: parseInt(taskComplexity, 10)
    });
    // Reset & Close
    setTaskTitle('');
    setTaskDesc('');
    setTaskCategory('work');
    setTaskEnergy('medium');
    setTaskComplexity(3);
    setPreFilledDate('');
    setTaskModalOpen(false);
  };

  // 3. Habit Modal States
  const [habitName, setHabitName] = useState('');

  const handleHabitSubmit = () => {
    if (!habitName.trim()) {
      alert('Please enter habit name');
      return;
    }
    addHabit(habitName.trim());
    setHabitName('');
    setHabitModalOpen(false);
  };

  // 4. Deliverable Actions
  const handleCopyDeliverable = () => {
    if (deliverableContent) {
      navigator.clipboard.writeText(deliverableContent).then(() => {
        alert('AI Output copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };

  // 5. Calendar Day Agenda Helpers
  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      deadline: `${calendarModalDate}T${quickTime}`,
      category: quickCategory,
      complexity: 3,
      energyCost: 'medium'
    });

    setQuickTitle('');
  };

  const handleOpenDetailedScheduler = () => {
    const now = new Date();
    const hrs = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const formattedVal = `${calendarModalDate}T${hrs}:${mins}`;
    setPreFilledDate(formattedVal);
    setCalendarModalOpen(false);
    setTaskModalOpen(true);
  };

  const getSelectedDateObj = () => {
    if (!calendarModalDate) return new Date();
    const parts = calendarModalDate.split('-');
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

  const getTodayStr = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const selectedDateObj = getSelectedDateObj();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  const formattedSelectedDate = calendarModalDate ? selectedDateObj.toLocaleDateString('en-US', dateOptions) : '';
  const isSelectedToday = calendarModalDate === getTodayStr();

  // Filter tasks for selected day agenda
  const selectedDayTasks = calendarModalDate ? tasks.filter(t => t.deadline && t.deadline.startsWith(calendarModalDate)) : [];
  const sortedDayTasks = [...selectedDayTasks].sort((a, b) => {
    const timeA = a.deadline.includes('T') ? a.deadline.split('T')[1] : '00:00';
    const timeB = b.deadline.includes('T') ? b.deadline.split('T')[1] : '00:00';
    return timeA.localeCompare(timeB);
  });

  return (
    <>
      {/* MODAL: Create Task */}
      <div className={`modal-overlay ${taskModalOpen ? 'active' : ''}`} id="task-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Create Task Rescue Target</h3>
            <button className="close-btn" onClick={() => { setPreFilledDate(''); setTaskModalOpen(false); }}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="task-title-input">Task Title</label>
              <input 
                type="text" 
                className="form-control" 
                id="task-title-input" 
                placeholder="e.g. Prep Presentation Slides"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="task-desc-input">Description / Details</label>
              <textarea 
                className="form-control" 
                id="task-desc-input" 
                rows="3" 
                placeholder="e.g. Gather research data, draft slide structure, design theme..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
              ></textarea>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-category-input">Category</label>
                <select 
                  className="form-control" 
                  id="task-category-input"
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                >
                  <option value="work">Work Project</option>
                  <option value="study">Study / Assignment</option>
                  <option value="personal">Personal Routine</option>
                  <option value="finance">Finance / Bill</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-energy-input">Focus Energy Cost</label>
                <select 
                  className="form-control" 
                  id="task-energy-input"
                  value={taskEnergy}
                  onChange={(e) => setTaskEnergy(e.target.value)}
                >
                  <option value="low">Low Energy (Routine)</option>
                  <option value="medium">Medium Energy (Average)</option>
                  <option value="high">High Energy (Deep Focus)</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-deadline-input">Deadline Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="form-control" 
                  id="task-deadline-input"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="task-complexity-input">Task Complexity (1-5)</label>
                <input 
                  type="range" 
                  className="form-control" 
                  id="task-complexity-input" 
                  min="1" 
                  max="5" 
                  step="1" 
                  value={taskComplexity}
                  onChange={(e) => setTaskComplexity(e.target.value)}
                />
                <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Level: {taskComplexity}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => { setPreFilledDate(''); setTaskModalOpen(false); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleTaskSubmit}>Create Target</button>
          </div>
        </div>
      </div>

      {/* MODAL: Create Habit */}
      <div className={`modal-overlay ${habitModalOpen ? 'active' : ''}`} id="habit-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Track Habit / Routine</h3>
            <button className="close-btn" onClick={() => setHabitModalOpen(false)}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="habit-name-input">Habit Name</label>
              <input 
                type="text" 
                className="form-control" 
                id="habit-name-input" 
                placeholder="e.g. Read Tech News, Meditate, Log Expenses..."
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setHabitModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleHabitSubmit}>Start Tracking</button>
          </div>
        </div>
      </div>

      {/* MODAL: AI Deliverable View */}
      <div className={`modal-overlay ${deliverableModalOpen ? 'active' : ''}`} id="deliverable-modal">
        <div className="modal-content" style={{ width: '600px' }}>
          <div className="modal-header">
            <h3 id="deliverable-modal-title">{deliverableTitle}</h3>
            <button className="close-btn" onClick={() => setDeliverableModalOpen(false)}>&times;</button>
          </div>
          <div className="modal-body" style={{ padding: '20px' }}>
            <pre 
              id="deliverable-modal-body" 
              style={{ 
                fontFamily: "'JetBrains Mono', monospace", 
                fontSize: '13px', 
                background: 'rgba(0,0,0,0.2)', 
                padding: '16px', 
                borderRadius: '10px', 
                overflowY: 'auto', 
                maxHeight: '300px', 
                border: '1px solid var(--border-color)', 
                whiteSpace: 'pre-wrap', 
                color: 'var(--text-primary)' 
              }}
            >
              {deliverableContent}
            </pre>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleCopyDeliverable}>
              <Copy size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Copy Content
            </button>
            <button className="btn btn-primary" onClick={() => setDeliverableModalOpen(false)}>Done</button>
          </div>
        </div>
      </div>

      {/* MODAL: Calendar Day Agenda & Quick Scheduler (Root-level, unclipped) */}
      <div 
        className={`modal-overlay ${calendarModalOpen ? 'active' : ''}`} 
        onClick={() => setCalendarModalOpen(false)}
        style={{ zIndex: 1050 }}
      >
        <div 
          className="modal-content glass-panel" 
          onClick={(e) => e.stopPropagation()} 
          style={{ width: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '24px' }}
        >
          <div className="agenda-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="agenda-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="agenda-title" style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{formattedSelectedDate}</span>
              {isSelectedToday && <span className="agenda-today-badge">Today</span>}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary btn-icon" 
                onClick={handleOpenDetailedScheduler} 
                title="Open detailed task scheduler"
                style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={16} />
              </button>
              <button 
                className="calendar-modal-close-btn" 
                onClick={() => setCalendarModalOpen(false)} 
                title="Close Panel"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="agenda-list" style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', minHeight: '150px', maxHeight: '350px' }}>
            {sortedDayTasks.length === 0 ? (
              <div className="agenda-empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 0', opacity: 0.6 }}>
                <Calendar size={28} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>No meetings or work scheduled for this day.</p>
              </div>
            ) : (
              sortedDayTasks.map(t => {
                const isCompleted = t.status === 'completed';
                const timePart = t.deadline.includes('T') ? t.deadline.split('T')[1] : '';
                const isMeeting = t.title.toLowerCase().includes('meeting') || 
                                  t.title.toLowerCase().includes('sync') || 
                                  t.title.toLowerCase().includes('call');

                return (
                  <div key={t.id} className={`agenda-item ${isCompleted ? 'completed' : ''}`} style={{ display: 'flex', alignItems: 'flex-start', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '8px', gap: '10px' }}>
                    <button className="agenda-check-btn" onClick={() => toggleTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isCompleted ? 'var(--accent-teal)' : 'var(--text-muted)', padding: 0 }}>
                      {isCompleted ? <CheckCircle size={17} className="completed-check" /> : <Circle size={17} />}
                    </button>
                    
                    <div className="agenda-item-content" style={{ flex: 1 }}>
                      <div className="agenda-item-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="agenda-item-title" style={{ fontSize: '13px', fontWeight: 600, color: isCompleted ? 'var(--text-muted)' : '#fff', textDecoration: isCompleted ? 'line-through' : 'none' }}>{t.title}</span>
                        <button className="agenda-delete-btn" onClick={() => deleteTask(t.id)} title="Delete task" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="agenda-item-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {timePart && (
                          <span className="agenda-time" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} />
                            {formatTimeStr(timePart)}
                          </span>
                        )}

                        {isMeeting ? (
                          <span className="agenda-badge meeting-badge" style={{ display: 'flex', alignItems: 'center', background: 'rgba(139,92,246,0.1)', color: 'var(--accent-purple)', padding: '2px 6px', borderRadius: '4px' }}>
                            <Video size={10} style={{ marginRight: '3px' }} /> Meeting
                          </span>
                        ) : (
                          <span className={`agenda-badge ${t.category}`} style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
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
          <form className="agenda-quick-add" onSubmit={handleQuickAdd} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span className="quick-add-title" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={12} style={{ color: 'var(--accent-teal)' }} /> Quick Schedule on this Day
            </span>
            
            <div className="quick-add-inputs" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text" 
                className="quick-add-input" 
                placeholder="Task or Meeting title"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                required
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '13px' }}
              />
              
              <div className="quick-add-row" style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="time" 
                  className="quick-add-input quick-add-time"
                  value={quickTime}
                  onChange={(e) => setQuickTime(e.target.value)}
                  required
                  style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '13px' }}
                />
                
                <select 
                  className="quick-add-select"
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  style={{ flex: 1, background: '#11101e', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
                >
                  <option value="work">Work</option>
                  <option value="study">Study</option>
                  <option value="finance">Finance</option>
                  <option value="personal">Personal</option>
                </select>
                
                <button type="submit" className="btn btn-primary" style={{ height: '38px', borderRadius: '8px', padding: '0 16px', fontSize: '13px', fontWeight: 600 }}>
                  Add
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}
