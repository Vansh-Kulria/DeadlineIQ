import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Menu, 
  Clock, 
  BatteryCharging, 
  Battery, 
  BatteryLow, 
  Mic, 
  LogOut 
} from 'lucide-react';

export default function Header({ setSidebarOpen }) {
  const { 
    activePage, 
    tasks, 
    syncStatus, 
    user, 
    signOutUser, 
    parseVoiceCommand,
    speechBubbleActive,
    speechBubbleText,
    setSpeechBubbleActive
  } = useApp();

  const [voiceInput, setVoiceInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // 1. Page Title Mapping
  const pageTitles = {
    dashboard: 'Dashboard',
    tasks: 'Task Brain & Prioritization',
    calendar: 'Deadline Calendar',
    focus: 'Focus Arena',
    habits: 'Habit Streaks & Goals',
    agent: 'AI Autonomous Agent'
  };

  // 2. Nearest Deadline Countdown Ticker Logic
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

  // 3. Energy levels
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
    if (energyLevel >= 85) return <BatteryCharging size={18} />;
    if (energyLevel >= 60) return <Battery size={18} />;
    return <BatteryLow size={18} />;
  };

  // 4. Speech Recognition initialization
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setVoiceInput(speechResult);
        parseVoiceCommand(speechResult);
        setVoiceInput('');
      };

      recognitionRef.current = rec;
    }
  }, [parseVoiceCommand]);

  const handleMicClick = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } else {
      alert("Web Speech API is not supported in this browser. Try typing your command!");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const cmd = voiceInput.trim();
      if (cmd) {
        parseVoiceCommand(cmd);
        setVoiceInput('');
      }
    }
  };

  // Sync Badge class
  const getSyncBadgeDotClass = () => {
    if (syncStatus === 'syncing') return 'sync-dot syncing';
    if (syncStatus === 'synced') return 'sync-dot synced';
    if (syncStatus === 'offline') return 'sync-dot offline';
    return 'sync-dot local';
  };

  const getSyncBadgeText = () => {
    if (syncStatus === 'syncing') return 'Syncing...';
    if (syncStatus === 'synced') return 'Synced';
    if (syncStatus === 'offline') return 'Offline';
    return 'Local';
  };

  return (
    <header>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          id="menu-toggle-btn" 
          className="btn btn-secondary btn-icon" 
          style={{ display: 'flex', width: '32px', height: '32px' }} 
          onClick={() => setSidebarOpen(true)}
          title="Toggle Menu"
        >
          <Menu size={18} />
        </button>
        <h1 id="page-title-display">{pageTitles[activePage] || 'DeadlineIQ'}</h1>
      </div>

      <div className="header-right">
        {/* Closest Deadline Countdown Ticker */}
        <div className={`header-countdown ${tickerClass}`} id="closest-deadline-ticker">
          <Clock size={18} />
          <span id="countdown-text">{nearestDeadlineText}</span>
        </div>

        {/* Energy/Productivity State Badge */}
        <div className="header-energy" id="energy-badge">
          <EnergyIcon />
          <span>Energy: {energyLevel}% ({energyText})</span>
        </div>

        {/* Voice Commander HUD */}
        <div className="voice-hud">
          <input 
            type="text" 
            className="voice-input-box" 
            id="voice-cmd-input" 
            placeholder="Type command or click mic..."
            value={voiceInput}
            onChange={(e) => setVoiceInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            id="voice-mic-btn" 
            title="Speak to DeadlineIQ"
            onClick={handleMicClick}
          >
            <Mic size={18} />
          </button>
        </div>

        {/* Cloud Sync Status Badge */}
        <div className="sync-badge" id="sync-status-badge" style={{ display: 'flex' }} data-status={syncStatus}>
          <span className={getSyncBadgeDotClass()}></span>
          <span className="sync-label">{getSyncBadgeText()}</span>
        </div>

        {/* Signed-in User Profile */}
        {user && (
          <div className="user-profile" id="user-profile" style={{ display: 'flex' }}>
            {user.photoURL && (
              <img className="user-avatar" id="user-avatar" src={user.photoURL} alt="User Avatar" />
            )}
            <span className="user-name" id="user-display-name">
              {user.displayName ? user.displayName.split(' ')[0] : 'Account'}
            </span>
            <button className="signout-btn" onClick={signOutUser} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Speech Bubble AI Notification HUD */}
      <div className={`speech-bubble ${speechBubbleActive ? 'active' : ''}`} id="ai-speech-hud">
        <div className="speech-bubble-icon">
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</span>
        </div>
        <div className="speech-bubble-text" id="ai-speech-text">
          "{speechBubbleText}"
        </div>
      </div>
    </header>
  );
}
