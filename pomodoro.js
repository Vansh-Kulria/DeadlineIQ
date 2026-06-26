// Pomodoro Timer State
let timeLeft = 25 * 60;
let timerDuration = 25 * 60;
let timerInterval = null;
let timerRunning = false;
let timerMode = 'work'; // 'work' | 'break'

// Web Audio API State
let audioCtx = null;
const activeSounds = {
  binaural: false,
  rain: false,
  noise: false
};
const audioNodes = {
  binaural: null,
  rain: null,
  noise: null
};
const gainNodes = {
  binaural: null,
  rain: null,
  noise: null
};
const volumes = {
  binaural: 0.5,
  rain: 0.4,
  noise: 0.3
};

// Initialize Audio Context on first interaction
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Timer Functions
function updateTimerDisplay() {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  document.getElementById('timer-time-display').textContent = timeStr;
  
  // Update browser tab title with countdown
  document.title = `[${timeStr}] DeadlineIQ`;

  // Circular progress ring updates
  const circle = document.getElementById('timer-progress-fill');
  if (circle) {
    const radius = 130;
    const circumference = 2 * Math.PI * radius; // ~816.8
    const progress = timeLeft / timerDuration;
    const offset = circumference - (progress * circumference);
    circle.style.strokeDashoffset = offset;
  }
}

function toggleTimer() {
  initAudio();
  const playIcon = document.getElementById('timer-play-icon');
  
  if (timerRunning) {
    // Pause
    clearInterval(timerInterval);
    timerRunning = false;
    playIcon.setAttribute('data-lucide', 'play');
  } else {
    // Start
    timerRunning = true;
    playIcon.setAttribute('data-lucide', 'pause');
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
      } else {
        handleTimerEnd();
      }
    }, 1000);
  }
  safeCreateIcons();
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  
  const playIcon = document.getElementById('timer-play-icon');
  if (playIcon) {
    playIcon.setAttribute('data-lucide', 'play');
    safeCreateIcons();
  }

  if (timerMode === 'work') {
    timeLeft = 25 * 60;
    timerDuration = 25 * 60;
  } else {
    timeLeft = 5 * 60;
    timerDuration = 5 * 60;
  }
  updateTimerDisplay();
}

function skipTimer() {
  handleTimerEnd(true);
}

function handleTimerEnd(skipped = false) {
  clearInterval(timerInterval);
  timerRunning = false;
  
  const container = document.getElementById('timer-circle-container');
  const statusDisplay = document.getElementById('timer-status-display');
  const playIcon = document.getElementById('timer-play-icon');
  
  if (playIcon) {
    playIcon.setAttribute('data-lucide', 'play');
    safeCreateIcons();
  }

  // Synthesize Completion Chime
  if (!skipped) {
    playCompletionChime();
  }

  if (timerMode === 'work') {
    // Switch to break
    timerMode = 'break';
    timeLeft = 5 * 60;
    timerDuration = 5 * 60;
    statusDisplay.textContent = 'SHORT BREAK';
    container.className = 'timer-circle-container break';
    
    // AI Notification
    if (typeof speakRecommendation === 'function') {
      speakRecommendation("Focus session complete. Take a five minute break, stretch your body.");
    }
  } else {
    // Switch to work
    timerMode = 'work';
    timeLeft = 25 * 60;
    timerDuration = 25 * 60;
    statusDisplay.textContent = 'DEEP FOCUS';
    container.className = 'timer-circle-container work';
    
    if (typeof speakRecommendation === 'function') {
      speakRecommendation("Break complete. Back to deep focus mode.");
    }
  }
  
  updateTimerDisplay();
}

// Synthesis Chime (pleasant synthesizer sweep)
function playCompletionChime() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  // Arpeggio chord notes frequency
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
  notes.forEach((freq, index) => {
    osc.frequency.setValueAtTime(freq, now + index * 0.12);
  });
  
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  
  osc.start(now);
  osc.stop(now + 0.85);
}

// Synthesis Soundscape Toggles
function toggleSound(soundId, btn) {
  initAudio();
  if (!audioCtx) return;

  if (activeSounds[soundId]) {
    // Stop sound
    stopSynthesizedSound(soundId);
    btn.classList.remove('active');
  } else {
    // Play sound
    startSynthesizedSound(soundId);
    btn.classList.add('active');
  }
}

function startSynthesizedSound(soundId) {
  activeSounds[soundId] = true;
  
  // Set up volume node
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = volumes[soundId];
  gainNode.connect(audioCtx.destination);
  gainNodes[soundId] = gainNode;

  if (soundId === 'noise') {
    audioNodes[soundId] = playWhiteNoise(gainNode);
  } else if (soundId === 'binaural') {
    audioNodes[soundId] = playBinauralBeats(gainNode);
  } else if (soundId === 'rain') {
    audioNodes[soundId] = playRainAmbient(gainNode);
  }
}

function stopSynthesizedSound(soundId) {
  activeSounds[soundId] = false;
  const nodes = audioNodes[soundId];
  
  if (nodes) {
    if (Array.isArray(nodes)) {
      nodes.forEach(node => {
        try { node.stop(); } catch(e) {}
      });
    } else {
      try { nodes.stop(); } catch(e) {}
    }
  }
  
  audioNodes[soundId] = null;
  gainNodes[soundId] = null;
}

function adjustVolume(soundId, value) {
  const vol = parseFloat(value);
  volumes[soundId] = vol;
  if (gainNodes[soundId]) {
    gainNodes[soundId].gain.setValueAtTime(vol, audioCtx ? audioCtx.currentTime : 0);
  }
}

// 1. White Noise Generator
function playWhiteNoise(destination) {
  const bufferSize = 2 * audioCtx.sampleRate;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;
  whiteNoise.connect(destination);
  whiteNoise.start();
  return whiteNoise;
}

// 2. Binaural Beats Stereo Generator (200Hz L / 210Hz R)
function playBinauralBeats(destination) {
  const oscL = audioCtx.createOscillator();
  const oscR = audioCtx.createOscillator();
  
  oscL.type = 'sine';
  oscL.frequency.value = 200; // Left ear
  
  oscR.type = 'sine';
  oscR.frequency.value = 210; // Right ear (10Hz delta for alpha wave)

  const channelMerger = audioCtx.createChannelMerger(2);
  
  // Route Left to Left Channel (0), Right to Right Channel (1)
  oscL.connect(channelMerger, 0, 0);
  oscR.connect(channelMerger, 0, 1);
  
  channelMerger.connect(destination);
  
  oscL.start();
  oscR.start();
  
  return [oscL, oscR];
}

// 3. Rain Ambient Synthesizer
function playRainAmbient(destination) {
  // Rain is white noise passed through band filters to emulate storm dynamics
  const bufferSize = 3 * audioCtx.sampleRate;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;
  
  // Set up lowpass filter for deep rain rumble
  const rumblingFilter = audioCtx.createBiquadFilter();
  rumblingFilter.type = 'lowpass';
  rumblingFilter.frequency.value = 450;
  
  // Set up bandpass filter for higher speed droplet splashes
  const dropletFilter = audioCtx.createBiquadFilter();
  dropletFilter.type = 'bandpass';
  dropletFilter.frequency.value = 1400;
  dropletFilter.Q.value = 1.0;
  
  // Separate sub-gains to blend rain layers
  const rumbleGain = audioCtx.createGain();
  rumbleGain.gain.value = 0.8;
  
  const dropletGain = audioCtx.createGain();
  dropletGain.gain.value = 0.2;

  // LFO to simulate wind gust modulation
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.15; // 0.15 Hz slow sweep

  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 120; // Modulate droplet filter frequency by +/- 120 Hz

  // Connect graph
  noiseSource.connect(rumblingFilter);
  rumblingFilter.connect(rumbleGain);
  rumbleGain.connect(destination);
  
  noiseSource.connect(dropletFilter);
  dropletFilter.connect(dropletGain);
  dropletGain.connect(destination);

  // LFO modulates the droplet bandpass filter for dynamic rain movement
  lfo.connect(lfoGain);
  lfoGain.connect(dropletFilter.frequency);
  
  noiseSource.start();
  lfo.start();
  
  return [noiseSource, lfo];
}
