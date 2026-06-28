import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Target, 
  Flame, 
  Cpu 
} from 'lucide-react';

export default function BottomNav() {
  const { activePage, setActivePage } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'focus', label: 'Focus', icon: Target },
    { id: 'habits', label: 'Habits', icon: Flame },
    { id: 'agent', label: 'AI Agent', icon: Cpu },
  ];

  return (
    <nav className="bottom-nav" id="mobile-bottom-nav">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button 
            key={item.id}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
