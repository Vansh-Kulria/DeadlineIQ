import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Zap } from 'lucide-react';

export default function LoginOverlay() {
  const { user, localMode, signInWithGoogle, useLocalMode } = useApp();
  const [errorMsg, setErrorMsg] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  // If user is logged in or localMode is selected, do not render login screen
  if (user || localMode) return null;

  const handleSignIn = async () => {
    setErrorMsg('');
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in popup was closed. Please try again.');
      } else {
        setErrorMsg('Sign-in failed. Please try again.');
      }
      setSigningIn(false);
    }
  };

  return (
    <div id="login-overlay" className="active">
      {/* Decorative blurred background blobs */}
      <div className="login-bg-glows" style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1, pointerEvents: 'none' }}>
        <div className="login-glow-1" style={{ position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px', borderRadius: '50%', background: 'var(--accent-purple)', opacity: 0.15, filter: 'blur(120px)', animation: 'pulseGlow 8s infinite alternate' }}></div>
        <div className="login-glow-2" style={{ position: 'absolute', bottom: '10%', right: '15%', width: '400px', height: '400px', borderRadius: '50%', background: 'var(--accent-teal)', opacity: 0.12, filter: 'blur(120px)', animation: 'pulseGlow 12s infinite alternate-reverse' }}></div>
      </div>

      <div className="login-card" style={{ position: 'relative', zIndex: 2 }}>
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Zap size={26} strokeWidth={2.5} fill="#fff" color="#fff" />
          </div>
          <div className="login-brand">Deadline<span>IQ</span></div>
        </div>

        {/* Headline */}
        <div>
          <h2 className="login-title">Sync across all your devices</h2>
          <p className="login-subtitle">Sign in to keep tasks, deadlines, and habits in perfect sync — phone, laptop, tablet, anywhere.</p>
        </div>

        {/* Feature highlights */}
        <div className="login-features">
          <div className="login-feature"><span className="feature-icon">☁️</span><span>Real-time cloud sync across all devices</span></div>
          <div className="login-feature"><span className="feature-icon">⚡</span><span>Changes appear on every screen in &lt; 1 second</span></div>
          <div className="login-feature"><span className="feature-icon">🔒</span><span>Private data secured with Google Auth</span></div>
        </div>

        {/* Google Sign-In */}
        <button 
          className="btn-google-signin" 
          id="google-signin-btn" 
          onClick={handleSignIn}
          disabled={signingIn}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>{signingIn ? 'Signing in...' : 'Continue with Google'}</span>
        </button>
        {errorMsg && <p id="login-error-msg" className="login-error" style={{ display: 'block' }}>{errorMsg}</p>}

        {/* Divider */}
        <div className="login-divider"><span>or</span></div>

        {/* Local-only mode */}
        <button className="btn-local-only" onClick={useLocalMode}>Use on this device only</button>
        <p className="login-fine-print">Your data is stored privately per Google account and never shared with anyone.</p>
      </div>
    </div>
  );
}
