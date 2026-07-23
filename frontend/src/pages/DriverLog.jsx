import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ELDLogSheet from '../components/ELDLogSheet';
import './DriverLog.css';

export default function DriverLog() {
  const location = useLocation();
  const dailyLogs = location.state?.dailyLogs || [];
  
  const [selectedIndex, setSelectedIndex] = useState(0);

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
      
      <div className="tabs">
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
      
      <div className="tab-content">
        <ELDLogSheet day={dailyLogs[selectedIndex]} />
      </div>
    </div>
  );
}
