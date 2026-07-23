import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Poll auth state (lightweight — interval checks localStorage)
  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem('access_token'));
    sync();
    const id = setInterval(sync, 1500);
    window.addEventListener('session-expired', sync);
    return () => {
      clearInterval(id);
      window.removeEventListener('session-expired', sync);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleSignIn = () => {
    // Fire the session-expired event to open the auth overlay
    window.dispatchEvent(new Event('session-expired'));
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <NavLink to="/" className="navbar-logo">
        <div className="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
            <rect x="9" y="11" width="14" height="10" rx="2" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>
        <span className="logo-text">FreightFlow</span>
      </NavLink>

      {/* Nav Links */}
      <div className="navbar-links">
        <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Dashboard</span>
        </NavLink>

        {isLoggedIn && (
          <NavLink to="/trips" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>My Trips</span>
          </NavLink>
        )}
      </div>

      {/* Status + Auth */}
      <div className="navbar-right">
        <div className="status-pill">
          <span className="status-dot" />
          <span>Online</span>
        </div>

        {isLoggedIn ? (
          <button className="nav-auth-btn sign-out" onClick={handleSignOut}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        ) : (
          <button className="nav-auth-btn sign-in" onClick={handleSignIn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
