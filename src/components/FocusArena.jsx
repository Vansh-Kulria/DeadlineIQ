import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  RotateCcw, 
  Play, 
  Pause, 
  SkipForward, 
  Waves, 
  CloudRain, 
  Radio, 
  Volume1, 
  Calendar, 
  TrendingUp, 
  Zap 
} from 'lucide-react';

export default function FocusArena() {
  const {
    timeLeft,
    timerDuration,
    timerRunning,
    timerMode,
    toggleTimer,
    resetTimer,
    skipTimer,
    changeTimerDuration,
    focusHistory,
    activeSounds,
    soundVolumes,
    toggleSound,
    adjustVolume
  } = useApp();

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Custom Inputs State
  const durationHours = Math.floor(timerDuration / 3600);
  const durationMinutes = Math.floor((timerDuration % 3600) / 60);

  const [inputHrs, setInputHrs] = useState(durationHours.toString());
  const [inputMins, setInputMins] = useState(durationMinutes.toString());

  // Handle Preset Clicks
  const handlePresetSelect = (minutes) => {
    const secs = minutes * 60;
    changeTimerDuration(secs);
    setInputHrs(Math.floor(minutes / 60).toString());
    setInputMins((minutes % 60).toString());
  };

  // Handle Custom Input Changes
  const handleTimeChange = (h, m) => {
    const hours = parseInt(h) || 0;
    const minutes = parseInt(m) || 0;
    
    // Cap custom time to realistic range: 1 min to 12 hours
    const totalMins = Math.max(1, Math.min(720, (hours * 60) + minutes));
    changeTimerDuration(totalMins * 60);
  };

  // SVG circular timer math
  const radius = 130;
  const circumference = 2 * Math.PI * radius; // ~816.8
  const progress = timeLeft / timerDuration;
  const offset = circumference - (progress * circumference);

  // Daily focus tracking stats engine
  const getTodayStr = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getPast7DaysStats = () => {
    const stats = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const log = focusHistory.find(l => l.date === dateStr);
      const mins = log ? log.minutes || 0 : 0;
      stats.push({ dayName, mins, dateStr });
    }
    return stats;
  };

  const past7Days = getPast7DaysStats();
  const maxMins = Math.max(...past7Days.map(d => d.mins), 60); // default scale max of 60m

  const todayLog = focusHistory.find(l => l.date === getTodayStr());
  const todayMinsFocused = todayLog ? todayLog.minutes || 0 : 0;
  const todayHours = Math.floor(todayMinsFocused / 60);
  const todayRemainingMins = todayMinsFocused % 60;
  const todayTimeFormatted = todayHours > 0 
    ? `${todayHours}h ${todayRemainingMins}m` 
    : `${todayRemainingMins}m`;

  const totalWeeklyMins = past7Days.reduce((acc, curr) => acc + curr.mins, 0);
  const weeklyHours = Math.floor(totalWeeklyMins / 60);
  const weeklyRemainingMins = totalWeeklyMins % 60;
  const weeklyTimeFormatted = weeklyHours > 0 
    ? `${weeklyHours}h ${weeklyRemainingMins}m` 
    : `${weeklyRemainingMins}m`;

  return (
    <section id="focus-page" className="page-container active">
      <div className="focus-layout">
        
        {/* Timer Widget & Settings */}
        <div className="timer-section glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          
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

          {/* Time Configuration Cards */}
          <div className="timer-settings-card" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
            <span className="timer-settings-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Configure Session Duration
            </span>
            
            {/* Presets */}
            <div className="timer-preset-row">
              {[15, 25, 45, 60, 90].map(m => {
                const isActive = timerDuration === m * 60;
                return (
                  <button 
                    key={m}
                    className={`timer-preset-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handlePresetSelect(m)}
                  >
                    {m >= 60 ? `${m / 60}h` : `${m}m`}
                  </button>
                );
              })}
            </div>

            {/* Custom inputs */}
            <div className="timer-custom-inputs">
              <div className="timer-input-group">
                <input 
                  type="number" 
                  min="0" 
                  max="12"
                  value={inputHrs}
                  onChange={(e) => {
                    setInputHrs(e.target.value);
                    handleTimeChange(e.target.value, inputMins);
                  }}
                  title="Hours"
                />
                <span>h</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>:</span>
              <div className="timer-input-group">
                <input 
                  type="number" 
                  min="0" 
                  max="59"
                  value={inputMins}
                  onChange={(e) => {
                    setInputMins(e.target.value);
                    handleTimeChange(inputHrs, e.target.value);
                  }}
                  title="Minutes"
                />
                <span>m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Soundscapes & Stats Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          
          {/* Daily Track Stats */}
          <div className="soundscape-section glass-panel" style={{ padding: '24px' }}>
            <div className="focus-stats-card">
              <div className="stats-summary-row">
                <div className="stats-summary-item">
                  <span className="stats-summary-val">{todayTimeFormatted}</span>
                  <span className="stats-summary-label">Focused Today</span>
                </div>
                <div className="stats-summary-item" style={{ alignItems: 'flex-end' }}>
                  <span className="stats-summary-val" style={{ color: 'var(--accent-teal)' }}>{weeklyTimeFormatted}</span>
                  <span className="stats-summary-label">This Week</span>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="focus-chart-container">
                {past7Days.map((day, idx) => {
                  const barHeight = Math.max(4, Math.round((day.mins / maxMins) * 100));
                  const isToday = day.dateStr === getTodayStr();

                  return (
                    <div className="focus-chart-col" key={idx}>
                      <div className="focus-chart-bar-wrap">
                        <div 
                          className="focus-chart-bar" 
                          style={{ 
                            height: `${barHeight}%`,
                            background: isToday 
                              ? 'linear-gradient(360deg, var(--accent-purple) 0%, var(--accent-teal) 100%)' 
                              : 'rgba(255, 255, 255, 0.1)'
                          }}
                          title={`${day.mins} minutes focused`}
                        ></div>
                      </div>
                      <span className="focus-chart-label" style={{ color: isToday ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                        {day.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <TrendingUp size={14} style={{ color: 'var(--accent-teal)' }} />
                <span>Completion of focus sessions automatically updates daily tracker metrics.</span>
              </div>
            </div>
          </div>

          {/* Ambient Soundscapes */}
          <div className="soundscape-section glass-panel" style={{ padding: '24px' }}>
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

      </div>
    </section>
  );
}
