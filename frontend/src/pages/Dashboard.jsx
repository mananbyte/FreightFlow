import React, { useState, useEffect } from 'react';
import FloatingPanel from '../components/FloatingPanel';
import MapComponent from '../components/MapComponent';
import client from '../api/client';
import './Dashboard.css';

export default function Dashboard() {
  const [routeData, setRouteData] = useState({ routeGeoJSON: null, events: [], dailyLogs: [] });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tripName, setTripName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem('access_token'));
    sync();
    const id = setInterval(sync, 1500);
    window.addEventListener('session-expired', () => setIsLoggedIn(false));
    return () => clearInterval(id);
  }, []);

  const calculateRoute = async (data) => {
    const payload = {
      current: data.current,
      pickup: data.pickup,
      dropoff: data.dropoff,
      start_time: data.startTime,
      current_cycle_used: data.cycleHours,
    };
    try {
      const response = await fetch('/api/routes/calculate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        alert('Routing failed: ' + (result.error || 'Unknown error'));
        return;
      }
      setRouteData({
        routeGeoJSON: result.routeGeoJSON,
        events: result.events,
        dailyLogs: result.dailyLogs || [],
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveClick = () => {
    if (!isLoggedIn) {
      window.dispatchEvent(new Event('session-expired'));
      return;
    }
    const pickupName = localStorage.getItem('ff_pickupName') || 'Pickup';
    const dropoffName = localStorage.getItem('ff_dropoffName') || 'Dropoff';
    const dateStr = routeData.dailyLogs?.[0]?.date || new Date().toLocaleDateString();
    setTripName(`${pickupName.split(',')[0]} → ${dropoffName.split(',')[0]} (${dateStr})`);
    setShowSaveModal(true);
  };

  const submitSaveTrip = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await client.post('/trips/', {
        name: tripName,
        current_location: localStorage.getItem('ff_currentName'),
        pickup: localStorage.getItem('ff_pickupName'),
        dropoff: localStorage.getItem('ff_dropoffName'),
        start_time: localStorage.getItem('ff_startTime') || new Date().toISOString(),
        cycle_hours_used: parseFloat(localStorage.getItem('ff_cycleHours') || 0),
        events_json: routeData.events,
        daily_logs_json: routeData.dailyLogs,
      });
      setShowSaveModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save trip');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dashboard-container">
      <FloatingPanel
        onSubmit={calculateRoute}
        dailyLogs={routeData.dailyLogs}
        onSaveTrip={handleSaveClick}
        isLoggedIn={isLoggedIn}
      />
      <MapComponent routeGeoJSON={routeData.routeGeoJSON} events={routeData.events} />

      {showSaveModal && (
        <div className="save-modal-overlay">
          <div className="save-modal-content glass-panel">
            <h2>Save Trip</h2>
            <p className="modal-sub">Review the name, then save to My Trips.</p>
            <form onSubmit={submitSaveTrip}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Trip Name</label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowSaveModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary">
                  {isSaving ? 'Saving…' : '💾 Save Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
