import React from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, Play, Pause, SkipForward, Waves, CloudRain, Radio, Volume1 } from 'lucide-react';

export default function FocusArena() {
  const {
    timeLeft,
    timerDuration,
    timerRunning,
    timerMode,
    toggleTimer,
    resetTimer,
    skipTimer,
    activeSounds,
    soundVolumes,
    toggleSound,
    adjustVolume
  } = useApp();

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // SVG circular timer math
  const radius = 130;
  const circumference = 2 * Math.PI * radius; // ~816.8
  const progress = timeLeft / timerDuration;
  const offset = circumference - (progress * circumference);

  return (
    <section id="focus-page" className="page-container active">
      <div className="focus-layout">
        
        {/* Timer Widget */}
        <div className="timer-section glass-panel">
          <div className={`timer-circle-container ${timerMode}`} id="timer-circle-container">
            <svg viewBox="0 0 280 280" style={{ width: '100%', height: '100%' }}>
              <circle className="timer-bg" cx="140" cy="140" r="130"></circle>
              <circle 
                className="timer-fill" 
                id="timer-progress-fill" 
                cx="140" 
                cy="140" 
                r="130" 
                style={{ strokeDashoffset: offset }}
              ></circle>
            </svg>
            <div className="timer-text-container">
              <div className="timer-time" id="timer-time-display">{timeStr}</div>
              <div className="timer-status" id="timer-status-display">
                {timerMode === 'work' ? 'DEEP FOCUS' : 'SHORT BREAK'}
              </div>
            </div>
          </div>

          <div className="timer-controls">
            <button className="btn btn-secondary btn-icon" id="timer-reset-btn" onClick={resetTimer} title="Reset Timer">
              <RotateCcw size={20} />
            </button>
            <button 
              className="btn btn-accent btn-icon" 
              id="timer-toggle-btn" 
              onClick={toggleTimer} 
              title={timerRunning ? "Pause Timer" : "Start Focus Timer"}
              style={{ width: '56px', height: '56px', borderRadius: '50%' }}
            >
              {timerRunning ? (
                <Pause size={24} style={{ fill: 'currentColor' }} />
              ) : (
                <Play size={24} style={{ fill: 'currentColor', marginLeft: '2px' }} />
              )}
            </button>
            <button className="btn btn-secondary btn-icon" id="timer-skip-btn" onClick={skipTimer} title="Skip Session">
              <SkipForward size={20} />
            </button>
          </div>
        </div>

        {/* Ambient Soundscapes */}
        <div className="soundscape-section glass-panel">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Focus Sound Engine</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Generates high-performance ambient soundscapes directly in your browser using synthesized audio nodes.
          </p>

          {/* Binaural Waves */}
          <div className="sound-card">
            <div className="sound-info">
              <button 
                className={`sound-icon-btn ${activeSounds.binaural ? 'active' : ''}`}
                onClick={() => toggleSound('binaural')}
              >
                <Waves size={18} />
              </button>
              <div className="sound-meta">
                <span className="sound-name">Binaural Waves</span>
                <span className="sound-desc">10Hz alpha waves for focus</span>
              </div>
            </div>
            <div className="sound-volume">
              <Volume1 size={14} />
              <input 
                type="range" 
                className="slider" 
                min="0" 
                max="1" 
                step="0.05" 
                value={soundVolumes.binaural} 
                onChange={(e) => adjustVolume('binaural', e.target.value)}
              />
            </div>
          </div>

          {/* Rainstorm Ambient */}
          <div className="sound-card">
            <div className="sound-info">
              <button 
                className={`sound-icon-btn ${activeSounds.rain ? 'active' : ''}`}
                onClick={() => toggleSound('rain')}
              >
                <CloudRain size={18} />
              </button>
              <div className="sound-meta">
                <span className="sound-name">Rainstorm Ambient</span>
                <span className="sound-desc">Simulated storm background noise</span>
              </div>
            </div>
            <div className="sound-volume">
              <Volume1 size={14} />
              <input 
                type="range" 
                className="slider" 
                min="0" 
                max="1" 
                step="0.05" 
                value={soundVolumes.rain} 
                onChange={(e) => adjustVolume('rain', e.target.value)}
              />
            </div>
          </div>

          {/* White Noise */}
          <div className="sound-card">
            <div className="sound-info">
              <button 
                className={`sound-icon-btn ${activeSounds.noise ? 'active' : ''}`}
                onClick={() => toggleSound('noise')}
              >
                <Radio size={18} />
              </button>
              <div className="sound-meta">
                <span className="sound-name">Deep White Noise</span>
                <span className="sound-desc">Constant noise for acoustic masking</span>
              </div>
            </div>
            <div className="sound-volume">
              <Volume1 size={14} />
              <input 
                type="range" 
                className="slider" 
                min="0" 
                max="1" 
                step="0.05" 
                value={soundVolumes.noise} 
                onChange={(e) => adjustVolume('noise', e.target.value)}
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
