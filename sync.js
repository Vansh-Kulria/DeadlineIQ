// ════════════════════════════════════════════════════════════════════════
//  DeadlineIQ — Real-time Cross-Device Sync Engine
//
//  How it works:
//    1. initSync(uid) registers a Firestore onSnapshot listener.
//    2. Firestore uses WebSockets to push data to every connected device.
//    3. When any device writes (cloudSave), ALL other devices receive
//       the update in < 1 second — no polling, no manual refresh needed.
//
//  Data flow:
//    Phone adds task → cloudSave() → Firestore → onSnapshot fires on
//    Laptop, Tablet, Desktop → tasks array updated → UI re-renders
// ════════════════════════════════════════════════════════════════════════

let syncUnsubscribe   = null;   // Holds the Firestore listener unsubscribe fn
let syncDebounceTimer = null;   // For batching rapid writes (e.g. completing 5 tasks)

// ── Sync status badge UI ──────────────────────────────────────────────────
function showSyncStatus(status) {
  const badge = document.getElementById('sync-status-badge');
  if (!badge) return;

  const states = {
    syncing: ['syncing', 'Syncing…'],
    synced:  ['synced',  'Synced'  ],
    offline: ['offline', 'Offline' ],
    local:   ['local',   'Local'   ],
  };
  const [cls, label] = states[status] || states.local;

  badge.dataset.status = status;
  badge.innerHTML = `<span class="sync-dot ${cls}"></span><span class="sync-label">${label}</span>`;
}

function flashSyncBadge() {
  const badge = document.getElementById('sync-status-badge');
  if (!badge) return;
  badge.classList.add('flash');
  setTimeout(() => badge.classList.remove('flash'), 700);
}

// ── Real-time listener ────────────────────────────────────────────────────
/**
 * Starts listening to the user's Firestore document.
 * Any write from any device triggers this callback on ALL connected devices.
 */
function initSync(uid) {
  if (!db || !uid) return;

  // Detach any existing listener before creating a new one
  if (syncUnsubscribe) syncUnsubscribe();

  showSyncStatus('syncing');
  const docRef = getUserDocRef(uid);

  syncUnsubscribe = docRef.onSnapshot((snap) => {
    if (snap.exists) {
      const data = snap.data();

      // ── Merge cloud state into local JS arrays ──────────────────────
      if (Array.isArray(data.tasks))  tasks  = data.tasks;
      if (Array.isArray(data.habits)) habits = data.habits;

      // ── Cache to localStorage for offline / fast initial load ───────
      localStorage.setItem('deadlineiq_tasks',  JSON.stringify(tasks));
      localStorage.setItem('deadlineiq_habits', JSON.stringify(habits));

      // ── Refresh all UI panels ────────────────────────────────────────
      if (typeof renderTasks           === 'function') renderTasks();
      if (typeof renderHabits          === 'function') renderHabits();
      if (typeof updateStats           === 'function') updateStats();
      if (typeof updateDashboardTickers === 'function') updateDashboardTickers();
      if (typeof renderCalendar        === 'function') renderCalendar();
      if (typeof updateAgentSelectors  === 'function') updateAgentSelectors();

      showSyncStatus('synced');
      flashSyncBadge();
    } else {
      // ── First sign-in: no cloud data yet → push local data up ───────
      cloudSave(true);
    }
  }, (error) => {
    console.error('[DeadlineIQ] Sync listener error:', error);
    showSyncStatus('offline');
  });

  console.info(`[DeadlineIQ] Real-time sync active for user: ${uid.slice(0, 8)}…`);
}

function stopSync() {
  if (syncUnsubscribe) {
    syncUnsubscribe();
    syncUnsubscribe = null;
    console.info('[DeadlineIQ] Sync listener stopped');
  }
}

// ── Cloud save (debounced) ────────────────────────────────────────────────
/**
 * Saves the current tasks + habits to Firestore.
 *
 * Debounced 600ms: rapid actions (checking off multiple tasks, editing)
 * are batched into a single write, reducing Firestore costs and network
 * traffic.
 *
 * Falls back silently to local-only if Firebase is unavailable.
 *
 * @param {boolean} immediate - Skip debounce and write right away
 */
function cloudSave(immediate = false) {
  if (!db || !currentUser) {
    showSyncStatus('local');
    return;
  }

  clearTimeout(syncDebounceTimer);
  showSyncStatus('syncing');

  const doWrite = () => {
    const docRef = getUserDocRef(currentUser.uid);
    docRef.set({
      tasks,
      habits,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      _meta: {
        appVersion: '2.1',
        device:     navigator.userAgent.slice(0, 100),
        savedAt:    new Date().toISOString()
      }
    })  // Full document overwrite — Firestore is the single source of truth
    .then(() => {
      showSyncStatus('synced');
    })
    .catch(err => {
      console.error('[DeadlineIQ] Cloud write failed:', err);
      showSyncStatus('offline');
    });
  };

  if (immediate) {
    doWrite();
  } else {
    syncDebounceTimer = setTimeout(doWrite, 600);
  }
}
