import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Zap, 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Target, 
  Flame, 
  Cpu, 
  X,
  Clock,
  BatteryCharging,
  Battery,
  BatteryLow
} from 'lucide-react';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { activePage, setActivePage, localMode, switchToCloudMode, tasks, clearAllData } = useApp();

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

  // 1. Nearest Deadline Countdown Ticker Logic
  const [nearestDeadlineText, setNearestDeadlineText] = useState('No pending deadlines');
  const [tickerClass, setTickerClass] = useState('time-safe');

  useEffect(() => {
    const updateTicker = () => {
      const pending = tasks.filter(t => t.status === 'pending');
      const now = new Date();
      let nearest = null;
      let minDiff = Infinity;

      pending.forEach(t => {
        const diff = new Date(t.deadline) - now;
        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          nearest = t;
        }
      });

      if (nearest) {
        const hours = Math.floor(minDiff / (1000 * 60 * 60));
        const mins = Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((minDiff % (1000 * 60)) / 1000);

        let timeStr = '';
        if (hours > 24) {
          timeStr = `${Math.floor(hours / 24)}d ${hours % 24}h`;
        } else {
          timeStr = `${hours}h ${mins}m ${secs}s`;
        }

        setNearestDeadlineText(`${nearest.title.slice(0, 15)}... in ${timeStr}`);

        if (minDiff <= 3 * 60 * 60 * 1000) {
          setTickerClass('time-critical');
        } else if (minDiff <= 24 * 60 * 60 * 1000) {
          setTickerClass('time-warning');
        } else {
          setTickerClass('time-safe');
        }
      } else {
        setNearestDeadlineText('No pending deadlines');
        setTickerClass('time-safe');
      }
    };

    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  // 2. Energy levels
  const [energyLevel, setEnergyLevel] = useState(85);
  const [energyText, setEnergyText] = useState('Peak Focus');

  useEffect(() => {
    const updateEnergy = () => {
      const hr = new Date().getHours();
      if (hr >= 6 && hr < 11) {
        setEnergyLevel(95);
        setEnergyText('Prime Morning Peak');
      } else if (hr >= 11 && hr < 14) {
        setEnergyLevel(80);
        setEnergyText('Midday Focus');
      } else if (hr >= 14 && hr < 17) {
        setEnergyLevel(60);
        setEnergyText('Post-Lunch Dip');
      } else if (hr >= 17 && hr < 21) {
        setEnergyLevel(85);
        setEnergyText('Evening Hyper-focus');
      } else {
        setEnergyLevel(50);
        setEnergyText('Night Recovery');
      }
    };

    updateEnergy();
    const interval = setInterval(updateEnergy, 30000);
    return () => clearInterval(interval);
  }, []);

  const EnergyIcon = () => {
    if (energyLevel >= 85) return <BatteryCharging size={14} />;
    if (energyLevel >= 60) return <Battery size={14} />;
    return <BatteryLow size={14} />;
  };

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
          {/* Status center */}
          <div className="status-center">
            <div className={`status-item countdown ${tickerClass}`}>
              <Clock size={14} />
              <span>{nearestDeadlineText}</span>
            </div>
            <div className="status-item energy">
              <EnergyIcon />
              <span>Energy: {energyLevel}% ({energyText})</span>
            </div>
          </div>

          <div className="system-status">
            <div>AI Companion: Active</div>
            <div style={{ fontSize: '11px', color: 'var(--accent-teal)' }}>System status: Optimal</div>
          </div>
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
          <button 
            className="btn-clear-data" 
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all tasks, habits, and goals? This cannot be undone.")) {
                clearAllData();
              }
            }}
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '8px 12px', 
              marginTop: '10px', 
              background: 'rgba(244, 63, 94, 0.08)', 
              border: '1px solid rgba(244, 63, 94, 0.2)', 
              borderRadius: '8px', 
              color: '#f43f5e', 
              fontSize: '11px', 
              fontWeight: 600, 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
          >
            🗑️ Clear All Data
          </button>
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
