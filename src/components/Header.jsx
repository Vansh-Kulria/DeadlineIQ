import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Menu, 
  Mic, 
  LogOut 
} from 'lucide-react';

export default function Header({ setSidebarOpen }) {
  const { 
    activePage, 
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

  // 2. Speech Recognition initialization
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
          onClick={() => setSidebarOpen(true)}
          title="Toggle Menu"
        >
          <Menu size={18} />
        </button>
        <h1 id="page-title-display">{pageTitles[activePage] || 'DeadlineIQ'}</h1>
      </div>

      <div className="header-right">
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
        <div className="sync-badge" id="sync-status-badge" data-status={syncStatus}>
          <span className={getSyncBadgeDotClass()}></span>
          <span className="sync-label">{getSyncBadgeText()}</span>
        </div>

        {/* Signed-in User Profile */}
        {user && (
          <div className="user-profile" id="user-profile">
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
