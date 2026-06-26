import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Zap, 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Target, 
  Flame, 
  Cpu, 
  X 
} from 'lucide-react';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { activePage, setActivePage, localMode, switchToCloudMode } = useApp();

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Task Brain', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'focus', label: 'Focus Arena', icon: Target },
    { id: 'habits', label: 'Habits & Goals', icon: Flame },
    { id: 'agent', label: 'AI Agent', icon: Cpu },
  ];

  return (
    <>
      <aside id="sidebar" className={sidebarOpen ? 'active' : ''}>
        <div className="sidebar-header">
          <div className="logo-icon">
            <Zap size={22} style={{ color: '#ffffff', fill: '#ffffff' }} />
          </div>
          <div className="logo-text">Deadline<span>IQ</span></div>
          <button 
            id="sidebar-close-btn" 
            className="btn btn-secondary btn-icon" 
            style={{ display: sidebarOpen ? 'flex' : 'none', marginLeft: 'auto', width: '28px', height: '28px' }} 
            onClick={() => setSidebarOpen(false)}
            title="Close Menu"
          >
            <X size={16} />
          </button>
        </div>
        
        <ul className="nav-links">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <li 
                key={item.id} 
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                data-page={item.id}
              >
                <a onClick={() => handleNavClick(item.id)}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer">
          <div>AI Companion: Active</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-teal)' }}>System status: Optimal</div>
          {localMode && (
            <button 
              id="switch-to-cloud-btn" 
              className="btn-switch-cloud" 
              onClick={switchToCloudMode}
              style={{ display: 'block' }}
            >
              ☁️ Enable Cloud Sync
            </button>
          )}
        </div>
      </aside>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay active" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}
