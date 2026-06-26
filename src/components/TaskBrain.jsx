import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Grid, 
  List, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Brain 
} from 'lucide-react';

export default function TaskBrain({ setTaskModalOpen }) {
  const { 
    tasks, 
    activeFilter, 
    setActiveFilter, 
    showMatrix, 
    setShowMatrix, 
    toggleTask, 
    deleteTask,
    aiInsights,
    aiPrioritized
  } = useApp();

  const now = new Date();

  // 1. Get filtered list for render
  const getFilteredTasks = () => {
    let filtered = [...tasks];
    if (activeFilter === 'active') {
      filtered = filtered.filter(t => t.status === 'pending');
    } else if (activeFilter === 'completed') {
      filtered = filtered.filter(t => t.status === 'completed');
    } else if (activeFilter === 'urgent') {
      filtered = filtered.filter(t => {
        const diff = new Date(t.deadline) - now;
        return t.status === 'pending' && diff > 0 && diff <= 24 * 60 * 60 * 1000;
      });
    }
    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // 2. Eisenhower Grid Categorization
  const getEisenhowerMatrix = () => {
    const matrix = { do: [], plan: [], delegate: [], eliminate: [] };
    
    tasks.forEach(t => {
      if (t.status !== 'pending') return;

      const isUrgent = (new Date(t.deadline) - now) <= 36 * 60 * 60 * 1000;
      const isImportant = t.complexity >= 3 || ['work', 'study', 'finance'].includes(t.category);

      if (isUrgent && isImportant) matrix.do.push(t);
      else if (!isUrgent && isImportant) matrix.plan.push(t);
      else if (isUrgent && !isImportant) matrix.delegate.push(t);
      else matrix.eliminate.push(t);
    });

    return matrix;
  };

  const matrix = getEisenhowerMatrix();

  const totalComplexity = tasks.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.complexity, 0);
  const nextMinutes = Math.min(90, Math.max(25, totalComplexity * 10));

  return (
    <section id="tasks-page" className="page-container active">
      <div className="tasks-layout">
        
        {/* Left Column: Manage Tasks */}
        <div className="tasks-left">
          <div className="section-title-row" style={{ marginBottom: '12px' }}>
            <h2>Task Repositories</h2>
            <button className="btn btn-primary" onClick={() => setTaskModalOpen(true)}>
              <Plus size={16} /> Add New Task
            </button>
          </div>

          {/* Filters & Views */}
          <div className="task-filters">
            <button 
              className={`filter-btn ${activeFilter === 'all' && !showMatrix ? 'active' : ''}`}
              onClick={() => { setActiveFilter('all'); setShowMatrix(false); }}
            >
              All
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'active' && !showMatrix ? 'active' : ''}`}
              onClick={() => { setActiveFilter('active'); setShowMatrix(false); }}
            >
              Active
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'completed' && !showMatrix ? 'active' : ''}`}
              onClick={() => { setActiveFilter('completed'); setShowMatrix(false); }}
            >
              Completed
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'urgent' && !showMatrix ? 'active' : ''}`}
              onClick={() => { setActiveFilter('urgent'); setShowMatrix(false); }}
            >
              Critical (&lt;24h)
            </button>
            <button 
              className={`filter-btn ${showMatrix ? 'active' : ''}`}
              onClick={() => setShowMatrix(prev => !prev)}
            >
              {showMatrix ? (
                <>
                  <List size={16} style={{ marginRight: '4px' }} /> List View
                </>
              ) : (
                <>
                  <Grid size={16} style={{ marginRight: '4px' }} /> Eisenhower Grid
                </>
              )}
            </button>
          </div>

          {/* Eisenhower Matrix Grid */}
          {showMatrix ? (
            <div className="eisenhower-matrix" id="eisenhower-grid" style={{ display: 'grid' }}>
              <div className="matrix-quadrant quad-do">
                <div className="quad-header">
                  <span>Do (Urgent & Important)</span>
                  <span className="quad-count" id="count-quad-do">{matrix.do.length}</span>
                </div>
                <div className="quad-content">
                  {matrix.do.length === 0 ? (
                    <p className="quad-clear-text">All clear</p>
                  ) : (
                    matrix.do.map(t => (
                      <div key={t.id} className="quad-item" onClick={() => setShowMatrix(false)}>
                        <span>{t.title}</span>
                        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="matrix-quadrant quad-plan">
                <div className="quad-header">
                  <span>Plan (Not Urgent & Important)</span>
                  <span className="quad-count" id="count-quad-plan">{matrix.plan.length}</span>
                </div>
                <div className="quad-content">
                  {matrix.plan.length === 0 ? (
                    <p className="quad-clear-text">All clear</p>
                  ) : (
                    matrix.plan.map(t => (
                      <div key={t.id} className="quad-item" onClick={() => setShowMatrix(false)}>
                        <span>{t.title}</span>
                        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="matrix-quadrant quad-delegate">
                <div className="quad-header">
                  <span>Delegate (Urgent & Not Important)</span>
                  <span className="quad-count" id="count-quad-delegate">{matrix.delegate.length}</span>
                </div>
                <div className="quad-content">
                  {matrix.delegate.length === 0 ? (
                    <p className="quad-clear-text">All clear</p>
                  ) : (
                    matrix.delegate.map(t => (
                      <div key={t.id} className="quad-item" onClick={() => setShowMatrix(false)}>
                        <span>{t.title}</span>
                        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="matrix-quadrant quad-eliminate">
                <div className="quad-header">
                  <span>Eliminate (Not Urgent & Not Important)</span>
                  <span className="quad-count" id="count-quad-eliminate">{matrix.eliminate.length}</span>
                </div>
                <div className="quad-content">
                  {matrix.eliminate.length === 0 ? (
                    <p className="quad-clear-text">All clear</p>
                  ) : (
                    matrix.eliminate.map(t => (
                      <div key={t.id} className="quad-item" onClick={() => setShowMatrix(false)}>
                        <span>{t.title}</span>
                        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Main Task List Container */
            <div className="main-task-list" id="main-task-list" style={{ display: 'flex' }}>
              {filteredTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', width: '100%' }}>
                  <CheckCircle2 size={48} style={{ marginBottom: '12px', strokeWidth: 1 }} />
                  <p>No tasks found matching this criteria.</p>
                </div>
              ) : (
                filteredTasks.map(t => {
                  const isOverdue = t.status === 'pending' && new Date(t.deadline) < now;
                  const dateFormatted = new Date(t.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div className={`task-card ${t.status === 'completed' ? 'completed' : ''}`} key={t.id}>
                      <div className="task-card-left">
                        <div 
                          className={`custom-checkbox ${t.status === 'completed' ? 'checked' : ''}`} 
                          onClick={() => toggleTask(t.id)}
                        ></div>
                        <div className="task-card-details">
                          <span className="task-card-title">{t.title}</span>
                          <div className="task-card-meta">
                            <span style={{ color: isOverdue ? 'var(--accent-rose)' : 'var(--text-secondary)', fontWeight: isOverdue ? '600' : '400' }}>
                              <Clock size={12} style={{ marginRight: '4px' }} /> 
                              {isOverdue ? 'OVERDUE: ' : ''}{dateFormatted}
                            </span>
                            <span>•</span>
                            <span className={`task-energy-badge badge-${t.energyCost}`}>{t.energyCost} Energy</span>
                            <span>•</span>
                            <span style={{ textTransform: 'uppercase' }}>{t.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="task-card-right">
                        <div className="task-card-actions">
                          <button className="btn btn-secondary btn-icon" onClick={() => deleteTask(t.id)} title="Delete Task">
                            <Trash2 size={16} style={{ color: 'var(--accent-rose)' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right Column: AI Prioritizer Reasoning */}
        <div className="tasks-right">
          <div className="glass-panel" style={{ fill: 'none', flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={18} style={{ color: 'var(--accent-purple)' }} />
              AI Prioritization Analytics
            </h3>
            
            <div id="ai-task-reasoning-body" style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)', flexGrow: 1, minHeight: 0, overflowY: 'auto' }}>
              {aiPrioritized && aiInsights ? (
                <>
                  <p><b>AI Prioritization Algorithm Diagnostic:</b></p>
                  <ul style={{ marginLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {aiInsights.evaluatedTop.map((t, idx) => (
                      <li key={t.id}>
                        <b>#{idx + 1} {t.title}:</b> Rescue Urgency Index: <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{t.rps}</span>. 
                        Complexity factor is {t.complexity}/5. Energy matches energy constraints.
                      </li>
                    ))}
                  </ul>
                  <p style={{ marginTop: '15px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Calculations weight deadline proximity at 60%, mental/physical complexity at 25%, and matching energy profiles at 15%.
                  </p>
                </>
              ) : (
                <p>The AI will evaluate task details like deadline proximity, energy intensity, and complexity to sort your queue. Add tasks to see diagnostic analytics.</p>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Total Focus Complexity:</span>
                <span id="ai-complexity-total" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {totalComplexity} / {tasks.filter(t => t.status === 'pending').length * 5}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Recommended Next Block:</span>
                <span id="ai-next-duration" style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>
                  {totalComplexity > 0 ? `${nextMinutes} min block` : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
