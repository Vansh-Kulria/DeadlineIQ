// Speech Recognition Setup
let recognition = null;
let isListening = false;

// Check browser compatibility for Speech Recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRec();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isListening = true;
    const micBtn = document.getElementById('voice-mic-btn');
    if (micBtn) micBtn.classList.add('listening');
    showSpeechBubble("Listening for your command...");
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error', event);
    isListening = false;
    const micBtn = document.getElementById('voice-mic-btn');
    if (micBtn) micBtn.classList.remove('listening');
    showSpeechBubble("Could not understand. Try typing your command.");
  };

  recognition.onend = () => {
    isListening = false;
    const micBtn = document.getElementById('voice-mic-btn');
    if (micBtn) micBtn.classList.remove('listening');
  };

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    const input = document.getElementById('voice-cmd-input');
    if (input) {
      input.value = speechResult;
      parseVoiceCommand(speechResult);
    }
  };
}

// Bind Voice controls on load
window.addEventListener('DOMContentLoaded', () => {
  const micBtn = document.getElementById('voice-mic-btn');
  const input = document.getElementById('voice-cmd-input');

  if (micBtn) {
    micBtn.addEventListener('click', () => {
      initAudio(); // Activate web audio context for focus sound effects safety
      if (recognition) {
        if (isListening) {
          recognition.stop();
        } else {
          recognition.start();
        }
      } else {
        alert("Web Speech API is not supported in this browser. Try Typing your command!");
      }
    });
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (cmd) {
          parseVoiceCommand(cmd);
          input.value = '';
        }
      }
    });
  }
});

// Speech Bubble Helper (Bottom-Right AI Message Box)
let bubbleTimeout = null;
function showSpeechBubble(text) {
  const bubble = document.getElementById('ai-speech-hud');
  const bubbleText = document.getElementById('ai-speech-text');
  
  if (bubble && bubbleText) {
    bubbleText.innerHTML = `"${text}"`;
    bubble.classList.add('active');
    
    // Clear old timeout
    if (bubbleTimeout) clearTimeout(bubbleTimeout);
    
    // Dismiss after 6s
    bubbleTimeout = setTimeout(() => {
      bubble.classList.remove('active');
    }, 6000);
  }
}

// Speak recommendation aloud (TTS)
function speakRecommendation(message) {
  showSpeechBubble(message);
  
  if ('speechSynthesis' in window) {
    // Cancel ongoing speak sessions
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Filter voices to only English to avoid other language synthesizers being selected
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    const premiumVoice = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')) || englishVoices[0];
    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
}

// Natural Language Parser
function parseVoiceCommand(cmdText) {
  const cmd = cmdText.toLowerCase().trim();
  
  // NAVIGATION
  if (cmd.includes('go to') || cmd.includes('show') || cmd.includes('open')) {
    let page = '';
    if (cmd.includes('dashboard')) page = 'dashboard';
    else if (cmd.includes('task') || cmd.includes('todo')) page = 'tasks';
    else if (cmd.includes('calendar')) page = 'calendar';
    else if (cmd.includes('focus') || cmd.includes('timer') || cmd.includes('pomodoro')) page = 'focus';
    else if (cmd.includes('habit') || cmd.includes('routine')) page = 'habits';
    else if (cmd.includes('agent') || cmd.includes('console')) page = 'agent';
    
    if (page) {
      showPage(page);
      speakRecommendation(`Navigating to ${page} panel.`);
      return;
    }
  }

  // TIMER COMMANDS
  if (cmd === 'start timer' || cmd === 'start focus' || cmd === 'resume timer' || cmd === 'focus') {
    if (!timerRunning) {
      toggleTimer();
      speakRecommendation("Focus timer activated. Starting a 25-minute deep focus block.");
    } else {
      speakRecommendation("Timer is already running.");
    }
    return;
  }
  if (cmd === 'pause timer' || cmd === 'pause focus' || cmd === 'stop timer') {
    if (timerRunning) {
      toggleTimer();
      speakRecommendation("Timer paused.");
    } else {
      speakRecommendation("Timer is already paused.");
    }
    return;
  }
  if (cmd === 'reset timer') {
    resetTimer();
    speakRecommendation("Timer reset to starting state.");
    return;
  }
  if (cmd === 'skip timer' || cmd === 'skip session') {
    skipTimer();
    speakRecommendation("Skipped current focus block.");
    return;
  }

  // OPTIMIZE PRIORITIES
  if (cmd === 'prioritize' || cmd === 'optimize' || cmd === 'run optimization' || cmd.includes('optimize priority')) {
    runAIPrioritization();
    return;
  }

  // TASK ADDITION (NATURAL LANGUAGE)
  // Format matching: "add task [title] by [time]" or "remind me to [title] tomorrow"
  if (cmd.startsWith('add task') || cmd.startsWith('remind me to') || cmd.startsWith('new task')) {
    let rawTitle = '';
    
    // Strip prefixes
    if (cmd.startsWith('add task')) {
      rawTitle = cmdText.slice(8).trim();
    } else if (cmd.startsWith('remind me to')) {
      rawTitle = cmdText.slice(12).trim();
    } else {
      rawTitle = cmdText.slice(8).trim();
    }

    // Look for deadline markers
    const deadlineKeywords = ['by', 'due at', 'due on', 'deadline', 'before'];
    let title = rawTitle;
    let deadlineStr = '';
    
    for (const keyword of deadlineKeywords) {
      const idx = title.toLowerCase().lastIndexOf(' ' + keyword + ' ');
      if (idx !== -1) {
        deadlineStr = title.slice(idx + keyword.length + 2).trim();
        title = title.slice(0, idx).trim();
        break;
      }
    }

    // Fallback search without spaces around keyword
    if (!deadlineStr) {
      for (const keyword of [' tomorrow', ' tonight', ' today']) {
        const idx = title.toLowerCase().lastIndexOf(keyword);
        if (idx !== -1) {
          deadlineStr = title.slice(idx).trim();
          title = title.slice(0, idx).trim();
          break;
        }
      }
    }

    // Capitalize title
    title = title.charAt(0).toUpperCase() + title.slice(1);

    // Calculate dates based on NLP input
    const dateObj = parseNLPDate(deadlineStr || 'tomorrow at 5pm');
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const h = String(dateObj.getHours()).padStart(2, '0');
    const min = String(dateObj.getMinutes()).padStart(2, '0');
    const localDateTime = `${y}-${m}-${d}T${h}:${min}`;

    const newTask = {
      id: `task-${Date.now()}`,
      title: title,
      description: 'Added via AI Voice Commander HUD.',
      category: 'work',
      energyCost: 'medium',
      deadline: localDateTime,
      complexity: 3,
      status: 'pending'
    };

    tasks.push(newTask);
    saveTasks();
    
    // Render and update
    if (activePage === 'tasks') renderTasks();
    if (activePage === 'calendar' && typeof renderCalendar === 'function') renderCalendar();
    updateStats();
    updateDashboardTickers();

    // Re-verify list dropdown selectors in Agent if active
    if (typeof updateAgentSelectors === 'function') {
      updateAgentSelectors();
    }

    const readableDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    speakRecommendation(`Target saved. Added ${title} due ${readableDate}.`);
    return;
  }

  // NO MATCH FALLBACK
  speakRecommendation(`Command not recognized: "${cmdText}". Try saying: "go to tasks", "start timer", "prioritize", or "add task Buy groceries by tomorrow 4 PM".`);
}

// Simple heuristic NLP date parser
function parseNLPDate(str) {
  const clean = str.toLowerCase().trim();
  const date = new Date();

  // Handle "tonight"
  if (clean.includes('tonight')) {
    date.setHours(20, 0, 0, 0); // 8:00 PM tonight
    return date;
  }

  // Handle "tomorrow"
  if (clean.includes('tomorrow')) {
    date.setDate(date.getDate() + 1);
    
    // extract time if any, e.g., "tomorrow at 5pm" or "tomorrow 9am"
    const timeMatch = clean.match(/(\d+)(?::(\d+))?\s*(am|pm)/);
    if (timeMatch) {
      let hrs = parseInt(timeMatch[1], 10);
      const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const isPm = timeMatch[3] === 'pm';
      
      if (isPm && hrs < 12) hrs += 12;
      if (!isPm && hrs === 12) hrs = 0;
      date.setHours(hrs, mins, 0, 0);
    } else {
      date.setHours(17, 0, 0, 0); // default to 5 PM
    }
    return date;
  }

  // Handle "in X hours"
  const hrMatch = clean.match(/in\s+(\d+)\s+hour/);
  if (hrMatch) {
    const hrs = parseInt(hrMatch[1], 10);
    date.setHours(date.getHours() + hrs);
    return date;
  }

  // Handle "in X days"
  const dayMatch = clean.match(/in\s+(\d+)\s+day/);
  if (dayMatch) {
    const days = parseInt(dayMatch[1], 10);
    date.setDate(date.getDate() + days);
    date.setHours(12, 0, 0, 0); // Noon
    return date;
  }

  // Handle weekday matches e.g. "monday", "friday at 2pm"
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < 7; i++) {
    if (clean.includes(daysOfWeek[i])) {
      const currentDay = date.getDay();
      let targetDay = i;
      
      // Calculate offset days to next specified day
      let daysOffset = targetDay - currentDay;
      if (daysOffset <= 0) daysOffset += 7; // next week

      date.setDate(date.getDate() + daysOffset);

      // parse time in weekday string
      const timeMatch = clean.match(/(\d+)(?::(\d+))?\s*(am|pm)/);
      if (timeMatch) {
        let hrs = parseInt(timeMatch[1], 10);
        const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const isPm = timeMatch[3] === 'pm';
        
        if (isPm && hrs < 12) hrs += 12;
        if (!isPm && hrs === 12) hrs = 0;
        date.setHours(hrs, mins, 0, 0);
      } else {
        date.setHours(9, 0, 0, 0); // default 9 AM
      }
      return date;
    }
  }

  // Default fallback date (24 hours from now)
  date.setDate(date.getDate() + 1);
  return date;
}
