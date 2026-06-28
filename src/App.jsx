import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginOverlay from './components/LoginOverlay';
import Dashboard from './components/Dashboard';
import TaskBrain from './components/TaskBrain';
import CalendarView from './components/CalendarView';
import FocusArena from './components/FocusArena';
import HabitsRoutine from './components/HabitsRoutine';
import AIAgent from './components/AIAgent';
import Modals from './components/Modals';

function MainAppLayout() {
  const { activePage, authLoading } = useApp();
  
  // Mobile sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal open states
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [deliverableModalOpen, setDeliverableModalOpen] = useState(false);
  
  const [deliverableContent, setDeliverableContent] = useState('');
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [preFilledDate, setPreFilledDate] = useState('');

  if (authLoading) {
    return (
      <div style={{
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        width: '100%',
        background: '#0c0a1c',
        color: '#fff',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="loading-logo-icon" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))', 
            marginBottom: '16px',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
          }}>
            <svg viewBox="0 0 24 24" width="30" height="30" stroke="#fff" strokeWidth="2.5" fill="#fff" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translate(0.5px, 0px)' }}>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>DeadlineIQ</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', margin: '8px 0 0 0' }}>Initializing productivity engines...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 1. Login Overlay (renders only when unauthenticated and not in localMode) */}
      <LoginOverlay />

      {/* 2. Background blurs */}
      <div className="bg-glows">
        <div className="glow-1"></div>
        <div className="glow-2"></div>
      </div>

      {/* 3. Navigation Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* 4. Main content viewport */}
      <main id="main-content">
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Dynamic page routing */}
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'tasks' && <TaskBrain setTaskModalOpen={setTaskModalOpen} />}
        {activePage === 'calendar' && (
          <CalendarView 
            setTaskModalOpen={setTaskModalOpen} 
            setPreFilledDate={setPreFilledDate} 
          />
        )}
        {activePage === 'focus' && <FocusArena />}
        {activePage === 'habits' && <HabitsRoutine setHabitModalOpen={setHabitModalOpen} />}
        {activePage === 'agent' && (
          <AIAgent 
            setDeliverableModalOpen={setDeliverableModalOpen} 
            setDeliverableContent={setDeliverableContent}
            setDeliverableTitle={setDeliverableTitle}
          />
        )}
      </main>

      {/* 5. Application Modals container */}
      <Modals 
        taskModalOpen={taskModalOpen}
        setTaskModalOpen={setTaskModalOpen}
        habitModalOpen={habitModalOpen}
        setHabitModalOpen={setHabitModalOpen}
        deliverableModalOpen={deliverableModalOpen}
        setDeliverableModalOpen={setDeliverableModalOpen}
        deliverableContent={deliverableContent}
        deliverableTitle={deliverableTitle}
        preFilledDate={preFilledDate}
        setPreFilledDate={setPreFilledDate}
      />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
