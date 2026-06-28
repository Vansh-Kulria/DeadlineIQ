import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Menu, 
  Mic, 
  MicOff,
  LogOut,
  X
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
  const [voiceOverlayOpen, setVoiceOverlayOpen] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText] = useState('');
  const recognitionRef = useRef(null);

  // Page Title Mapping
  const pageTitles = {
    dashboard: 'Dashboard',
    tasks: 'Task Brain & Prioritization',
    calendar: 'Deadline Calendar',
    focus: 'Focus Arena',
    habits: 'Habit Streaks & Goals',
    agent: 'AI Autonomous Agent'
  };

  // Speech Recognition initialization
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setInterimText('');
        setFinalText('');
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        if (final) {
          setFinalText(final);
          setInterimText('');
          // Process the command and close after a brief delay
          parseVoiceCommand(final);
          setTimeout(() => {
            setVoiceOverlayOpen(false);
            setFinalText('');
          }, 1200);
        } else {
          setInterimText(interim);
        }
      };

      recognitionRef.current = rec;
    }
  }, [parseVoiceCommand]);

  const openVoiceOverlay = () => {
    setVoiceOverlayOpen(true);
    setInterimText('');
    setFinalText('');
    // Auto-start listening when overlay opens
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started
      }
    }
  };

  const closeVoiceOverlay = () => {
    setVoiceOverlayOpen(false);
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setInterimText('');
    setFinalText('');
  };

  const toggleListeningInOverlay = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        setInterimText('');
        setFinalText('');
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already started
        }
      }
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Web Speech API is not supported in this browser. Try typing your command!");
      return;
    }
    openVoiceOverlay();
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

  // Sync Badge helpers
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
    <>
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
            <Mic size={16} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div className="speech-bubble-text" id="ai-speech-text">
            "{speechBubbleText}"
          </div>
        </div>
      </header>

      {/* ── Google-style Voice Listening Overlay ── */}
      <div className={`voice-overlay ${voiceOverlayOpen ? 'active' : ''}`} onClick={closeVoiceOverlay}>
        <div className="voice-overlay-content" onClick={(e) => e.stopPropagation()}>
          
          {/* Close button */}
          <button className="voice-overlay-close" onClick={closeVoiceOverlay}>
            <X size={20} />
          </button>

          {/* Listening status text */}
          <div className="voice-overlay-status">
            {isListening && !interimText && !finalText && (
              <span className="voice-status-text">Listening...</span>
            )}
            {interimText && (
              <span className="voice-interim-text">{interimText}</span>
            )}
            {finalText && (
              <span className="voice-final-text">{finalText}</span>
            )}
            {!isListening && !finalText && (
              <span className="voice-status-text">Tap the mic to speak</span>
            )}
          </div>

          {/* Pulsing Mic Button */}
          <button 
            className={`voice-overlay-mic ${isListening ? 'listening' : ''}`}
            onClick={toggleListeningInOverlay}
          >
            <div className="voice-mic-rings">
              <div className="voice-ring ring-1"></div>
              <div className="voice-ring ring-2"></div>
              <div className="voice-ring ring-3"></div>
            </div>
            {isListening ? <Mic size={32} /> : <MicOff size={32} />}
          </button>

          {/* Hint */}
          <p className="voice-overlay-hint">
            Try: "Add task finish report by tomorrow" or "Show calendar"
          </p>

        </div>
      </div>
    </>
  );
}
