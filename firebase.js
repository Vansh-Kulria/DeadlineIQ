// ════════════════════════════════════════════════════════════════════════
//  DeadlineIQ — Firebase Configuration
//
//  ⚠️  SETUP REQUIRED (2 minutes) — Follow these steps:
//
//  1. Go to https://console.firebase.google.com
//  2. Click "Add project" → Name it "DeadlineIQ" → Create project
//  3. Click the Web icon (</>)  → Register app as "DeadlineIQ" → Next
//  4. Copy the firebaseConfig object values into FIREBASE_CONFIG below
//  5. In Firebase Console → Authentication → Sign-in method → Enable Google
//  6. In Firebase Console → Firestore Database → Create database
//     (Choose "Start in test mode" → select a region → Done)
//  7. Save this file and reload the app!
//
// ════════════════════════════════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// ── Feature gate ─────────────────────────────────────────────────────────
// App works offline-only until you paste real Firebase config above.
const FIREBASE_CONFIGURED = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";

let db          = null;
let auth        = null;
let currentUser = null;

if (FIREBASE_CONFIGURED) {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    db   = firebase.firestore();

    // Enable offline persistence so the app works without internet.
    // Data is cached in IndexedDB and synced when connectivity returns.
    db.enablePersistence({ synchronizeTabs: true })
      .then(() => console.info('[DeadlineIQ] Offline persistence enabled ✓'))
      .catch(err => {
        if (err.code === 'failed-precondition') {
          console.warn('[DeadlineIQ] Multiple tabs open — persistence in one tab only');
        }
      });

    console.info('[DeadlineIQ] Firebase ready ✓');
  } catch (e) {
    console.error('[DeadlineIQ] Firebase init error:', e);
  }
} else {
  console.info('[DeadlineIQ] Local-only mode (Firebase not configured yet)');
}

// ── Firestore document path ───────────────────────────────────────────────
// All user data lives in a single document: users/{uid}/data/appState
// This allows atomic reads/writes and clean real-time sync.
function getUserDocRef(uid) {
  return db.collection('users').doc(uid).collection('data').doc('appState');
}

// ── Google Sign-In ────────────────────────────────────────────────────────
async function signInWithGoogle() {
  if (!auth) return;

  const btn      = document.getElementById('google-signin-btn');
  const errMsg   = document.getElementById('login-error-msg');
  const btnLabel = btn ? btn.querySelector('span') : null;

  if (errMsg)   errMsg.textContent = '';
  if (btn)      btn.disabled = true;
  if (btnLabel) btnLabel.textContent = 'Signing in…';

  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
    // onAuthStateChanged in app.js handles the rest
  } catch (error) {
    console.error('[DeadlineIQ] Sign-in failed:', error);
    if (errMsg) {
      errMsg.textContent = error.code === 'auth/popup-closed-by-user'
        ? 'Sign-in popup was closed. Please try again.'
        : 'Sign-in failed. Please try again.';
    }
    if (btn)      btn.disabled = false;
    if (btnLabel) btnLabel.textContent = 'Continue with Google';
  }
}

// ── Local mode (skip sign-in) ─────────────────────────────────────────────
function useLocalMode() {
  localStorage.setItem('deadlineiq_local_mode', '1');
  hideLoginScreen();

  const syncBadge      = document.getElementById('sync-status-badge');
  const cloudSwitchBtn = document.getElementById('switch-to-cloud-btn');
  if (syncBadge)      syncBadge.style.display      = 'flex';
  if (cloudSwitchBtn) cloudSwitchBtn.style.display = 'block';

  if (typeof showSyncStatus === 'function') showSyncStatus('local');
  if (typeof startApp       === 'function') startApp();
}

// ── Switch from local → cloud mode ────────────────────────────────────────
function switchToCloudMode() {
  localStorage.removeItem('deadlineiq_local_mode');
  showLoginScreen();
}

// ── Sign out ──────────────────────────────────────────────────────────────
async function signOutUser() {
  if (typeof stopSync === 'function') stopSync();
  if (auth) await auth.signOut();

  currentUser = null;
  localStorage.removeItem('deadlineiq_local_mode');

  // Hide user-specific UI
  const profile  = document.getElementById('user-profile');
  const badge    = document.getElementById('sync-status-badge');
  const cloudBtn = document.getElementById('switch-to-cloud-btn');
  if (profile)  profile.style.display  = 'none';
  if (badge)    badge.style.display    = 'none';
  if (cloudBtn) cloudBtn.style.display = 'none';

  showLoginScreen();
}

// ── Login screen helpers ──────────────────────────────────────────────────
function showLoginScreen() {
  const overlay = document.getElementById('login-overlay');
  if (overlay) overlay.classList.add('active');
}

function hideLoginScreen() {
  const overlay = document.getElementById('login-overlay');
  if (overlay) overlay.classList.remove('active');
}

// ── Update header with signed-in user info ────────────────────────────────
function updateUserUI(user) {
  if (!user) return;

  const avatar  = document.getElementById('user-avatar');
  const name    = document.getElementById('user-display-name');
  const profile = document.getElementById('user-profile');
  const badge   = document.getElementById('sync-status-badge');

  if (profile) profile.style.display = 'flex';
  if (badge)   badge.style.display   = 'flex';

  if (avatar) {
    avatar.src   = user.photoURL || '';
    avatar.style.display = user.photoURL ? 'block' : 'none';
  }
  if (name) {
    name.textContent = user.displayName
      ? user.displayName.split(' ')[0]
      : 'Account';
  }
}
