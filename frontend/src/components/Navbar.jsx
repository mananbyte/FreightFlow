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
        {/* Truck SVG */}
        <svg width="22" height="22" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Trailer / cargo box */}
          <rect x="0" y="3" width="20" height="13" rx="2" fill="#007AFF"/>
          {/* Cab */}
          <path d="M20 7 L20 16 L32 16 L32 10 L28 3 L22 3 L20 7Z" fill="#007AFF"/>
          {/* Windshield */}
          <path d="M22.5 4.5 L27.5 4.5 L30.5 9.5 L22.5 9.5 Z" fill="rgba(0,122,255,0.25)"/>
          {/* Connector between cab and trailer */}
          <rect x="19" y="8" width="3" height="5" fill="#0056CC"/>
          {/* Exhaust stack */}
          <rect x="29" y="1" width="2" height="4" rx="1" fill="#005DC7"/>
          {/* Front wheel */}
          <circle cx="27" cy="17.5" r="3" fill="#0056CC" stroke="#003D99" strokeWidth="1"/>
          <circle cx="27" cy="17.5" r="1.2" fill="#CCE0FF"/>
          {/* Rear wheel */}
          <circle cx="8" cy="17.5" r="3" fill="#0056CC" stroke="#003D99" strokeWidth="1"/>
          <circle cx="8" cy="17.5" r="1.2" fill="#CCE0FF"/>
          {/* Road / ground line */}
          <line x1="0" y1="21" x2="36" y2="21" stroke="rgba(0,122,255,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Headlight */}
          <rect x="31" y="11" width="2" height="2" rx="0.5" fill="#FFD60A"/>
          {/* Trailer door lines */}
          <line x1="10" y1="3" x2="10" y2="16" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
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
