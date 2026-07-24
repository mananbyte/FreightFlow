import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationAutocomplete from './LocationAutocomplete';
import { showToast } from '../utils/ui';
import './FloatingPanel.css';

export default function FloatingPanel({ onSubmit, dailyLogs, onSaveTrip, isLoggedIn, isLoading, onError, isSavedTrip }) {
  const getSafeStorage = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  };

  const [current, setCurrent] = useState(() => getSafeStorage('ff_current'));
  const [currentName, setCurrentName] = useState(() => localStorage.getItem('ff_currentName') || '');
  
  const [pickup, setPickup] = useState(() => getSafeStorage('ff_pickup'));
  const [pickupName, setPickupName] = useState(() => localStorage.getItem('ff_pickupName') || '');
  
  const [dropoff, setDropoff] = useState(() => getSafeStorage('ff_dropoff'));
  const [dropoffName, setDropoffName] = useState(() => localStorage.getItem('ff_dropoffName') || '');
  
  const [cycleHours, setCycleHours] = useState(() => localStorage.getItem('ff_cycleHours') || 0);
  const [startTime, setStartTime] = useState(() => localStorage.getItem('ff_startTime') || '');
  const navigate = useNavigate();

  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    localStorage.setItem('ff_current', JSON.stringify(current));
    localStorage.setItem('ff_currentName', currentName);
    localStorage.setItem('ff_pickup', JSON.stringify(pickup));
    localStorage.setItem('ff_pickupName', pickupName);
    localStorage.setItem('ff_dropoff', JSON.stringify(dropoff));
    localStorage.setItem('ff_dropoffName', dropoffName);
    localStorage.setItem('ff_cycleHours', cycleHours);
    localStorage.setItem('ff_startTime', startTime);
  }, [current, currentName, pickup, pickupName, dropoff, dropoffName, cycleHours, startTime]);

  useEffect(() => {
    const handleTripSaved = () => {
      setCurrent([]);
      setCurrentName('');
      setPickup([]);
      setPickupName('');
      setDropoff([]);
      setDropoffName('');
      setCycleHours(0);
      setStartTime('');
      setResetKey(prev => prev + 1);
    };
    window.addEventListener('trip-saved', handleTripSaved);
    return () => window.removeEventListener('trip-saved', handleTripSaved);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!current.length || !pickup.length || !dropoff.length) {
      if (onError) onError("Please select valid locations from the dropdowns.");
      else showToast("Please select valid locations from the dropdowns.");
      return;
    }
    onSubmit({ current, pickup, dropoff, cycleHours, startTime });
  };

  return (
    <div className="floating-panel">
      <div className="drag-handle"></div>
      <div className="panel-header">
        <h2>Trip Setup</h2>
        <p>Configure your route & ELD constraints</p>
      </div>
      <form onSubmit={handleSubmit} className="panel-form">
        <LocationAutocomplete 
          key={`current-${resetKey}`}
          label="Current Location" 
          placeholder="e.g., Seattle, WA" 
          initialQuery={currentName}
          onLocationSelect={(coords, name) => { setCurrent(coords); setCurrentName(name); }} 
        />
        <LocationAutocomplete 
          key={`pickup-${resetKey}`}
          label="Pickup Location" 
          placeholder="e.g., Portland, OR" 
          initialQuery={pickupName}
          onLocationSelect={(coords, name) => { setPickup(coords); setPickupName(name); }} 
        />
        <LocationAutocomplete 
          key={`dropoff-${resetKey}`}
          label="Dropoff Location" 
          placeholder="e.g., Los Angeles, CA" 
          initialQuery={dropoffName}
          onLocationSelect={(coords, name) => { setDropoff(coords); setDropoffName(name); }} 
        />
        <div className="form-group row-group">
          <div className="form-field">
            <label>Cycle Hrs Used</label>
            <input type="number" step="0.1" value={cycleHours} onChange={e => setCycleHours(e.target.value)} placeholder="Hours" />
          </div>
          <div className="form-field">
            <label>Start Date/Time</label>
            <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="submit-btn" disabled={isLoading}>
          <span>{isLoading ? 'Calculating...' : 'Calculate Route'}</span>
        </button>
        {dailyLogs && dailyLogs.length > 0 && (
          <div className="route-success-banner">
            <div className="success-info">
              <div className="success-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div className="success-info-text">
                <h4>Route Ready</h4>
                <p>{dailyLogs.length} {dailyLogs.length === 1 ? 'day' : 'days'} of logs securely generated</p>
              </div>
            </div>
            <button 
              type="button" 
              className="premium-log-btn"
              onClick={() => navigate('/log', { state: { dailyLogs } })}
            >
              <span>View ELD Log Sheet</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </button>
            <button 
              type="button" 
              className={`premium-log-btn save-trip-btn ${isSavedTrip ? 'saved' : ''}`}
              onClick={isSavedTrip ? null : onSaveTrip}
              disabled={isSavedTrip}
              style={isSavedTrip ? { background: 'rgba(255,255,255,0.1)', cursor: 'default' } : {}}
            >
              <span>
                {isSavedTrip 
                  ? 'Already Saved' 
                  : (isLoggedIn ? 'Save Trip' : 'Sign in to save')}
              </span>
              {isSavedTrip ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
