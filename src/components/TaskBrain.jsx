import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Grid, 
  List, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Brain,
  Zap,
  Briefcase,
  BookOpen,
  User,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  ChevronUp
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
    aiPrioritized,
    toggleSubtask,
    parseVoiceCommand
  } = useApp();

  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [nlpInput, setNlpInput] = useState('');

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'work':
        return <Briefcase size={12} style={{ marginRight: '4px', color: '#60a5fa' }} />;
      case 'study':
        return <BookOpen size={12} style={{ marginRight: '4px', color: '#c084fc' }} />;
      case 'finance':
        return <DollarSign size={12} style={{ marginRight: '4px', color: '#facc15' }} />;
      default:
        return <User size={12} style={{ marginRight: '4px', color: '#4ade80' }} />;
    }
  };

  const getEnergyLevelBadge = (energyCost) => {
    let color = 'rgba(255,255,255,0.04)';
    let textColor = 'var(--text-secondary)';
    let border = '1px solid rgba(255,255,255,0.08)';

    switch (energyCost?.toLowerCase()) {
      case 'high':
        color = 'rgba(244, 63, 94, 0.08)';
        textColor = '#f43f5e';
        border = '1px solid rgba(244, 63, 94, 0.2)';
        break;
      case 'medium':
        color = 'rgba(245, 158, 11, 0.08)';
        textColor = '#f59e0b';
        border = '1px solid rgba(245, 158, 11, 0.2)';
        break;
      case 'low':
        color = 'rgba(16, 185, 129, 0.08)';
        textColor = '#10b981';
        border = '1px solid rgba(16, 185, 129, 0.2)';
        break;
      default:
        break;
    }

    return (
      <span style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '4px', 
        padding: '3px 8px', 
        borderRadius: '12px', 
        fontSize: '11px', 
        fontWeight: 500,
        background: color, 
        color: textColor, 
        border: border 
      }}>
        <Zap size={10} style={{ fill: textColor }} />
        {energyCost} Energy
      </span>
    );
  };

  const now = new Date();

  const handleNlpSubmit = (e) => {
    e.preventDefault();
    if (!nlpInput.trim()) return;
    parseVoiceCommand(nlpInput);
    setNlpInput('');
  };

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
      <div className="tasks-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Manage Tasks */}
        <div className="tasks-left" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Header row */}
          <div className="section-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h2>Tasks</h2>
            <button className="btn btn-primary" onClick={() => setTaskModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Add New Task
            </button>
          </div>

          {/* Quick NLP Command Bar */}
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.015)' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick AI Task Commander
            </label>
            <form onSubmit={handleNlpSubmit} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Type in natural language, e.g. 'Finish project tomorrow at 5pm' or 'add task Pay bill today'..." 
                value={nlpInput}
                onChange={(e) => setNlpInput(e.target.value)}
                className="input-field"
                style={{ flexGrow: '1', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', outline: 'none' }}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ padding: '10px 20px', background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-purple))', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
              >
                Run Commander
              </button>
            </form>
          </div>

          {/* Filters & Views */}
          <div className="task-filters" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
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
              style={{ marginLeft: 'auto' }}
            >
              {showMatrix ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <List size={16} /> List View
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Grid size={16} /> Eisenhower Grid
                </span>
              )}
            </button>
          </div>

          {/* Eisenhower Matrix Grid */}
          {showMatrix ? (
            <div className="eisenhower-matrix" id="eisenhower-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="matrix-quadrant quad-do">
                <div className="quad-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Do (Urgent & Important)</span>
                  <span className="quad-count" id="count-quad-do">{matrix.do.length}</span>
                </div>
                <div className="quad-content">
                  {matrix.do.length === 0 ? (
                    <p className="quad-clear-text">All clear</p>
                  ) : (
                    matrix.do.map(t => (
                      <div key={t.id} className="quad-item" onClick={() => setShowMatrix(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{t.title}</span>
                        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="matrix-quadrant quad-plan">
                <div className="quad-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Plan (Not Urgent & Important)</span>
                  <span className="quad-count" id="count-quad-plan">{matrix.plan.length}</span>
                </div>
                <div className="quad-content">
                  {matrix.plan.length === 0 ? (
                    <p className="quad-clear-text">All clear</p>
                  ) : (
                    matrix.plan.map(t => (
                      <div key={t.id} className="quad-item" onClick={() => setShowMatrix(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{t.title}</span>
                        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="matrix-quadrant quad-delegate">
                <div className="quad-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Delegate (Urgent & Not Important)</span>
                  <span className="quad-count" id="count-quad-delegate">{matrix.delegate.length}</span>
                </div>
                <div className="quad-content">
                  {matrix.delegate.length === 0 ? (
                    <p className="quad-clear-text">All clear</p>
                  ) : (
                    matrix.delegate.map(t => (
                      <div key={t.id} className="quad-item" onClick={() => setShowMatrix(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{t.title}</span>
                        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="matrix-quadrant quad-eliminate">
                <div className="quad-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Eliminate (Not Urgent & Not Important)</span>
                  <span className="quad-count" id="count-quad-eliminate">{matrix.eliminate.length}</span>
                </div>
                <div className="quad-content">
                  {matrix.eliminate.length === 0 ? (
                    <p className="quad-clear-text">All clear</p>
                  ) : (
                    matrix.eliminate.map(t => (
                      <div key={t.id} className="quad-item" onClick={() => setShowMatrix(false)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{t.title}</span>
                        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Main Task List Container with Expandable Cards */
            <div className="main-task-list" id="main-task-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', width: '100%' }}>
                  <CheckCircle2 size={48} style={{ marginBottom: '12px', strokeWidth: 1 }} />
                  <p>No tasks found matching this criteria.</p>
                </div>
              ) : (
                filteredTasks.map(t => {
                  const isOverdue = t.status === 'pending' && new Date(t.deadline) < now;
                  const dateFormatted = new Date(t.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                  const isExpanded = expandedTaskId === t.id;

                  // Subtasks percentage calculation
                  const totalSub = t.subtasks?.length || 0;
                  const completedSub = t.subtasks?.filter(st => st.completed).length || 0;
                  const percentSub = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

                  return (
                    <div 
                      className={`task-card ${t.status === 'completed' ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`} 
                      key={t.id}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        padding: '16px',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        background: isOverdue 
                          ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.04), rgba(22, 24, 36, 0.8))' 
                          : 'rgba(22, 24, 36, 0.5)',
                        border: isOverdue 
                          ? '1px solid rgba(244, 63, 94, 0.25)' 
                          : isExpanded
                            ? '1px solid rgba(139, 92, 246, 0.4)'
                            : '1px solid rgba(255,255,255,0.06)',
                        boxShadow: isExpanded ? '0 10px 20px -10px rgba(139, 92, 246, 0.25)' : 'none',
                        opacity: t.status === 'completed' ? 0.65 : 1
                      }}
                      onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}
                    >
                      <div className="task-card-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div 
                          className="task-card-left" 
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', flexGrow: '1' }}
                        >
                          <div 
                            className={`custom-checkbox ${t.status === 'completed' ? 'checked' : ''}`} 
                            onClick={(e) => { e.stopPropagation(); toggleTask(t.id); }}
                            style={{ flexShrink: 0 }}
                          ></div>
                          <div className="task-card-details">
                            <span 
                              className="task-card-title" 
                              style={{ 
                                textDecoration: t.status === 'completed' ? 'line-through' : 'none',
                                color: t.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                                fontWeight: 500,
                                fontSize: '14px'
                              }}
                            >
                              {t.title}
                            </span>
                            <div className="task-card-meta" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                              <span style={{ 
                                color: isOverdue ? '#f43f5e' : 'var(--text-secondary)', 
                                fontWeight: isOverdue ? '600' : '400',
                                display: 'flex', 
                                alignItems: 'center', 
                                fontSize: '11px' 
                              }}>
                                {isOverdue ? (
                                  <AlertTriangle size={12} style={{ marginRight: '4px' }} />
                                ) : (
                                  <Clock size={12} style={{ marginRight: '4px' }} />
                                )}
                                {isOverdue ? 'OVERDUE: ' : ''}{dateFormatted}
                              </span>
                              <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                              {getEnergyLevelBadge(t.energyCost)}
                              <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                              <span style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                {getCategoryIcon(t.category)}
                                {t.category}
                              </span>
                              {totalSub > 0 && (
                                <>
                                  <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                    {completedSub}/{totalSub} Subtasks
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="task-card-right" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-secondary btn-icon" onClick={() => deleteTask(t.id)} title="Delete Task" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
                            <Trash2 size={14} style={{ color: 'var(--accent-rose)' }} />
                          </button>
                          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Card Details (Subtasks, Estimated Effort, Priority Level, Urgency Bar) */}
                      {isExpanded && (
                        <div className="task-card-expanded-content" style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
                          {t.description && (
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: '1.5', background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '6px', borderLeft: '3px solid var(--accent-purple)' }}>
                              {t.description}
                            </p>
                          )}
                          
                          {/* Subtasks Checklist */}
                          <div className="subtasks-section" style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <h4 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                Subtasks ({completedSub}/{totalSub})
                              </h4>
                              {totalSub > 0 && (
                                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-teal)' }}>{percentSub}% Done</span>
                              )}
                            </div>

                            {totalSub > 0 && (
                              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
                                <div style={{ width: `${percentSub}%`, height: '100%', background: 'var(--accent-teal)', borderRadius: '2px', transition: 'width 0.3s ease' }}></div>
                              </div>
                            )}

                            {t.subtasks && t.subtasks.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {t.subtasks.map(st => (
                                  <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.01)' }}>
                                    <div 
                                      className={`custom-checkbox subtask-checkbox ${st.completed ? 'checked' : ''}`}
                                      onClick={() => toggleSubtask(t.id, st.id)}
                                      style={{ width: '14px', height: '14px', borderRadius: '3px' }}
                                    ></div>
                                    <span style={{ fontSize: '12px', color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: st.completed ? 'line-through' : 'none' }}>
                                      {st.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0', fontStyle: 'italic' }}>No subtasks created for this task.</p>
                            )}
                          </div>
 
                          {/* Extra info row (Pills Grid) */}
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
                            gap: '10px', 
                            borderTop: '1px solid rgba(255,255,255,0.04)', 
                            paddingTop: '14px',
                            fontSize: '12px'
                          }}>
                            {t.estimatedTime && (
                              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', marginBottom: '2px', textTransform: 'uppercase' }}>Est. Time</span>
                                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t.estimatedTime}</span>
                              </div>
                            )}

                            {t.priorityLevel && (
                              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', marginBottom: '2px', textTransform: 'uppercase' }}>Priority Level</span>
                                <span className={`priority-badge priority-${t.priorityLevel.toLowerCase()}`} style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600 }}>
                                  {t.priorityLevel}
                                </span>
                              </div>
                            )}

                            {t.priorityScore && (
                              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', marginBottom: '2px', textTransform: 'uppercase' }}>Priority Score</span>
                                <span style={{ fontWeight: 600, color: 'var(--accent-purple)', fontSize: '13px' }}>{t.priorityScore}<span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/100</span></span>
                              </div>
                            )}
                            
                            {/* Deadline Risk Indicator */}
                            {t.missRisk !== undefined && (
                              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}>Deadline Risk</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ flexGrow: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${t.missRisk}%`, height: '100%', background: t.missRisk > 60 ? 'var(--accent-rose)' : t.missRisk > 30 ? 'var(--accent-amber)' : 'var(--accent-teal)' }}></div>
                                  </div>
                                  <span style={{ fontWeight: 600, fontSize: '11px', color: t.missRisk > 60 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>{t.missRisk}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
 
        {/* Right Column: AI Prioritizer Reasoning */}
        <div className="tasks-right" style={{ position: 'sticky', top: '16px' }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(22, 24, 36, 0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', margin: 0 }}>
              <Brain size={18} style={{ color: 'var(--accent-purple)' }} />
              AI Prioritization Analytics
            </h3>
            
            <div id="ai-task-reasoning-body" style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {aiPrioritized && aiInsights ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontWeight: 500, color: 'var(--text-primary)', margin: 0, fontSize: '12px' }}>AI Recommended Top Queue:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {aiInsights.evaluatedTop.map((t, idx) => (
                      <div key={t.id} style={{ display: 'flex', gap: '10px', padding: '8px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-purple)' }}>#{idx + 1}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '12px' }}>{t.title}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            Score: <b style={{ color: 'var(--accent-purple)' }}>{t.rps}</b> | Complexity: {t.complexity}/5 | {t.priorityLevel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', margin: '4px 0 0 0' }}>
                    Calculations weight deadline proximity (60%), focus effort (25%), and personal energy alignment (15%).
                  </p>
                </div>
              ) : (
                <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '12px' }}>
                  The AI will evaluate task details like deadline proximity, energy intensity, and complexity to sort your queue. Add tasks to see diagnostic analytics.
                </p>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Focus Complexity:</span>
                <span id="ai-complexity-total" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {totalComplexity} / {tasks.filter(t => t.status === 'pending').length * 5}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recommended Focus Block:</span>
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
