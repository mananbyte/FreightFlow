import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import ELDLogSheet from '../components/ELDLogSheet';
import './DriverLog.css';

export default function DriverLog() {
  const location = useLocation();
  const navigate = useNavigate();
  const dailyLogs = location.state?.dailyLogs || [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const tabsRef = useRef(null);
  const thumbRef = useRef(null);

  const updateThumb = () => {
    const el = tabsRef.current;
    const thumb = thumbRef.current;
    if (!el || !thumb) return;
    const ratio = el.clientWidth / el.scrollWidth;
    const thumbWidth = Math.max(ratio * 100, 8);
    const thumbLeft = (el.scrollLeft / el.scrollWidth) * 100;
    thumb.style.width = `${thumbWidth}%`;
    thumb.style.left = `${thumbLeft}%`;
    thumb.parentElement.style.opacity = ratio >= 1 ? '0' : '1';
  };

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    updateThumb();
    el.addEventListener('scroll', updateThumb);
    window.addEventListener('resize', updateThumb);
    return () => {
      el.removeEventListener('scroll', updateThumb);
      window.removeEventListener('resize', updateThumb);
    };
  }, [dailyLogs]);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const activeBtn = el.querySelector('.tab-btn.active');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    updateThumb();
  }, [selectedIndex]);

  if (!dailyLogs || dailyLogs.length === 0) {
    return (
      <div className="driver-log-empty">
        <div className="empty-card glass-panel">
          <div className="empty-icon">📋</div>
          <h2>No Route Calculated</h2>
          <p>Go to the dashboard, enter your route, and come back here to view the ELD log sheet.</p>
          <Link to="/" className="back-link">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="driver-log-container">
      <div className="log-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="glass-panel"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              padding: '0',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%', 
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary)', 
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>ELD Log Sheet</h1>
            <p className="log-sub">{dailyLogs.length} {dailyLogs.length === 1 ? 'day' : 'days'} of driving logs</p>
          </div>
        </div>
        <Link to="/" className="back-link">← New Route</Link>
      </div>

      <div className="tabs-wrapper">
        <div className="tabs" ref={tabsRef}>
          {dailyLogs.map((day, index) => (
            <button
              key={day.date}
              className={`tab-btn ${index === selectedIndex ? 'active' : ''}`}
              onClick={() => setSelectedIndex(index)}
            >
              {day.date}
            </button>
          ))}
        </div>
        <div className="tabs-scrollbar">
          <div className="tabs-scrollbar-thumb" ref={thumbRef} />
        </div>
      </div>

      <div className="tab-content">
        <ELDLogSheet day={dailyLogs[selectedIndex]} />
      </div>
    </div>
  );
}
