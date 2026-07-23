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
        {/* Animated truck logo — no box, blends with glass navbar */}
        <svg className="logo-truck" width="52" height="30" viewBox="0 0 52 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Speed lines */}
          <line className="speed-line sl1" x1="0" y1="11" x2="10" y2="11" stroke="url(#speedGrad)" strokeWidth="1.5" strokeLinecap="round"/>
          <line className="speed-line sl2" x1="0" y1="15" x2="7" y2="15" stroke="url(#speedGrad)" strokeWidth="1" strokeLinecap="round"/>
          <line className="speed-line sl3" x1="0" y1="19" x2="5" y2="19" stroke="url(#speedGrad)" strokeWidth="0.8" strokeLinecap="round"/>

          <defs>
            <linearGradient id="speedGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#007AFF" stopOpacity="0"/>
              <stop offset="100%" stopColor="#007AFF" stopOpacity="0.5"/>
            </linearGradient>
            <linearGradient id="truckBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#007AFF"/>
              <stop offset="100%" stopColor="#0056CC"/>
            </linearGradient>
            <linearGradient id="cabGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0A84FF"/>
              <stop offset="100%" stopColor="#005DC7"/>
            </linearGradient>
            <filter id="truckGlow">
              <feGaussianBlur stdDeviation="1" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>

          {/* Trailer body */}
          <rect x="10" y="4" width="26" height="16" rx="2.5" fill="url(#truckBody)"/>
          {/* Trailer highlight stripe */}
          <rect x="10" y="4" width="26" height="3" rx="2" fill="rgba(255,255,255,0.25)"/>
          {/* Trailer door line */}
          <line x1="23" y1="5" x2="23" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>

          {/* Cab */}
          <path d="M36 8 L36 20 L47 20 L47 14 L43.5 8 Z" fill="url(#cabGrad)"/>
          {/* Cab roof highlight */}
          <path d="M36.5 8.5 L43 8.5 L46 13 L36.5 13 Z" fill="rgba(255,255,255,0.12)"/>
          {/* Windshield */}
          <path d="M37.5 9.5 L42.5 9.5 L45.5 13.5 L37.5 13.5 Z" fill="rgba(200,230,255,0.45)" rx="1"/>

          {/* Exhaust pipe */}
          <rect x="44" y="2" width="2" height="7" rx="1" fill="#005DC7"/>
          {/* Exhaust puff */}
          <circle className="puff p1" cx="45" cy="1.5" r="1.5" fill="rgba(0,122,255,0.15)"/>
          <circle className="puff p2" cx="45" cy="0" r="1" fill="rgba(0,122,255,0.08)"/>

          {/* Coupling */}
          <rect x="34.5" y="13" width="3" height="4" rx="0.5" fill="#004AAD"/>

          {/* Headlight glow */}
          <rect x="46.5" y="15" width="2" height="2.5" rx="0.8" fill="#FFD60A"/>
          <rect x="46.5" y="15" width="4" height="2.5" rx="1" fill="rgba(255,214,10,0.25)"/>

          {/* Rear wheel */}
          <g className="wheel rear-wheel">
            <circle cx="18" cy="21.5" r="4.5" fill="#003D99" stroke="#0056CC" strokeWidth="1"/>
            <circle cx="18" cy="21.5" r="2.8" fill="#0056CC"/>
            {/* Spokes */}
            <line x1="18" y1="18" x2="18" y2="25" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
            <line x1="14.5" y1="21.5" x2="21.5" y2="21.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
            <line x1="15.5" y1="18.9" x2="20.5" y2="24.1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
            <line x1="20.5" y1="18.9" x2="15.5" y2="24.1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
            <circle cx="18" cy="21.5" r="1" fill="#CCE0FF"/>
          </g>

          {/* Front wheel */}
          <g className="wheel front-wheel">
            <circle cx="41" cy="21.5" r="4.5" fill="#003D99" stroke="#0056CC" strokeWidth="1"/>
            <circle cx="41" cy="21.5" r="2.8" fill="#0056CC"/>
            {/* Spokes */}
            <line x1="41" y1="18" x2="41" y2="25" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
            <line x1="37.5" y1="21.5" x2="44.5" y2="21.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
            <line x1="38.5" y1="18.9" x2="43.5" y2="24.1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
            <line x1="43.5" y1="18.9" x2="38.5" y2="24.1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
            <circle cx="41" cy="21.5" r="1" fill="#CCE0FF"/>
          </g>

          {/* Ground shadow */}
          <ellipse cx="29" cy="27.5" rx="20" ry="1.5" fill="rgba(0,122,255,0.12)"/>
        </svg>
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
