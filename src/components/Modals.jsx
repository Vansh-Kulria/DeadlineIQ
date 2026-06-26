import React, { useState, useEffect } from 'react';
import { useApp, getLocalDateTimeString } from '../context/AppContext';
import { Copy } from 'lucide-react';

export default function Modals({
  taskModalOpen, setTaskModalOpen,
  habitModalOpen, setHabitModalOpen,
  deliverableModalOpen, setDeliverableModalOpen,
  deliverableContent,
  deliverableTitle,
  preFilledDate, setPreFilledDate
}) {
  const { addTask, addHabit } = useApp();

  // 1. Task Modal States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState('work');
  const [taskEnergy, setTaskEnergy] = useState('medium');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskComplexity, setTaskComplexity] = useState(3);

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

  // 2. Habit Modal States
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

  // 3. Deliverable Actions
  const handleCopyDeliverable = () => {
    if (deliverableContent) {
      navigator.clipboard.writeText(deliverableContent).then(() => {
        alert('AI Output copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };

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
    </>
  );
}
