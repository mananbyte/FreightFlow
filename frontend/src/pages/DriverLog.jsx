import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ELDLogSheet from '../components/ELDLogSheet';
import './DriverLog.css';

export default function DriverLog() {
  const location = useLocation();
  const dailyLogs = location.state?.dailyLogs || [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const tabsRef = useRef(null);
  const thumbRef = useRef(null);

  // Drive the custom scrollbar thumb position/size from the tabs scroll position
  const updateThumb = () => {
    const el = tabsRef.current;
    const thumb = thumbRef.current;
    if (!el || !thumb) return;

    const ratio      = el.clientWidth / el.scrollWidth;        // visible fraction
    const thumbWidth = Math.max(ratio * 100, 8);               // % width, min 8%
    const thumbLeft  = (el.scrollLeft / el.scrollWidth) * 100; // % offset
    thumb.style.width = `${thumbWidth}%`;
    thumb.style.left  = `${thumbLeft}%`;

    // Hide the scrollbar entirely if all tabs fit without scrolling
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

  // Auto-scroll the active tab into view
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
        <div className="empty-card">
          <h2>No Route Calculated</h2>
          <p>Please calculate a route to view the ELD log sheet.</p>
          <Link to="/" className="back-link">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="driver-log-container">
      <div className="log-header">
        <h1>Driver Logs</h1>
        <Link to="/" className="back-link">Back to Dashboard</Link>
      </div>

      {/* Tabs + custom scrollbar wrapped together */}
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

        {/* Custom gradient scrollbar — only visible when tabs overflow */}
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
