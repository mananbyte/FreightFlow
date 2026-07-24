import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FloatingPanel from '../components/FloatingPanel';
import MapComponent from '../components/MapComponent';
import { showToast } from '../utils/ui';
import client from '../api/client';
import './Dashboard.css';

export default function Dashboard() {
  const location = useLocation();
  const [routeData, setRouteData] = useState({ routeGeoJSON: null, events: [], dailyLogs: [] });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tripName, setTripName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const [isSavedTrip, setIsSavedTrip] = useState(false);

  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem('access_token'));
    sync();
    const id = setInterval(sync, 1500);
    window.addEventListener('session-expired', () => setIsLoggedIn(false));
    return () => clearInterval(id);
  }, []);

  // Pre-load route data if navigated from "View Map" in MyTrips
  useEffect(() => {
    const preloaded = location.state?.preloadedRoute;
    if (preloaded) {
      setRouteData({
        routeGeoJSON: preloaded.routeGeoJSON,
        events: preloaded.events,
        dailyLogs: preloaded.dailyLogs,
      });
      setIsSavedTrip(true);
      // Clear the state so a refresh doesn't re-apply
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const calculateRoute = async (data) => {
    setIsLoadingRoute(true);
    setLoadingText('Connecting to routing engine...');
    
    // Cycle text for a premium feel
    const t1 = setTimeout(() => setLoadingText('Analyzing fastest path...'), 600);
    const t2 = setTimeout(() => setLoadingText('Checking ELD rules...'), 1400);
    const t3 = setTimeout(() => setLoadingText('Finalizing log sheets...'), 2200);

    const payload = {
      current: data.current,
      pickup: data.pickup,
      dropoff: data.dropoff,
      start_time: data.startTime,
      current_cycle_used: data.cycleHours,
    };
    try {
      const response = await client.post('/routes/calculate/', payload);
      const result = response.data;
      setRouteData({
        routeGeoJSON: result.routeGeoJSON,
        events: result.events,
        dailyLogs: result.dailyLogs || [],
      });
      setIsSavedTrip(false);
    } catch (error) {
      if (error.response) {
        showToast('Routing failed: ' + (error.response.data.error || 'Unknown error'), 'error');
      } else {
        console.error('Error:', error);
      }
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsLoadingRoute(false);
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
        route_geojson: routeData.routeGeoJSON || {},
      });
      setShowSaveModal(false);
      showToast('Trip saved successfully!', 'success');
      setRouteData({ routeGeoJSON: null, events: [], dailyLogs: [] });
      window.dispatchEvent(new Event('trip-saved'));
    } catch (err) {
      console.error(err);
      showToast('Failed to save trip', 'error');
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
        isLoading={isLoadingRoute}
        isSavedTrip={isSavedTrip}
      />
      <MapComponent routeGeoJSON={routeData.routeGeoJSON} events={routeData.events} />

      {/* Premium Glassmorphic Loading Overlay */}
      {isLoadingRoute && (
        <div className="route-loading-overlay">
          <div className="loading-card glass-panel">
            {/* Reusing the beautiful animated truck from navbar, scaled up */}
            <svg className="logo-truck loader-truck" width="80" height="46" viewBox="0 0 52 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line className="speed-line sl1" x1="0" y1="11" x2="10" y2="11" stroke="url(#speedGradL)" strokeWidth="1.5" strokeLinecap="round"/>
              <line className="speed-line sl2" x1="0" y1="15" x2="7" y2="15" stroke="url(#speedGradL)" strokeWidth="1" strokeLinecap="round"/>
              <line className="speed-line sl3" x1="0" y1="19" x2="5" y2="19" stroke="url(#speedGradL)" strokeWidth="0.8" strokeLinecap="round"/>
              <defs>
                <linearGradient id="speedGradL" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#007AFF" stopOpacity="0"/>
                  <stop offset="100%" stopColor="#007AFF" stopOpacity="0.8"/>
                </linearGradient>
                <linearGradient id="truckBodyL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#007AFF"/>
                  <stop offset="100%" stopColor="#0056CC"/>
                </linearGradient>
                <linearGradient id="cabGradL" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0A84FF"/>
                  <stop offset="100%" stopColor="#005DC7"/>
                </linearGradient>
              </defs>
              <rect x="10" y="4" width="26" height="16" rx="2.5" fill="url(#truckBodyL)"/>
              <rect x="10" y="4" width="26" height="3" rx="2" fill="rgba(255,255,255,0.25)"/>
              <line x1="23" y1="5" x2="23" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <path d="M36 8 L36 20 L47 20 L47 14 L43.5 8 Z" fill="url(#cabGradL)"/>
              <path d="M36.5 8.5 L43 8.5 L46 13 L36.5 13 Z" fill="rgba(255,255,255,0.12)"/>
              <path d="M37.5 9.5 L42.5 9.5 L45.5 13.5 L37.5 13.5 Z" fill="rgba(200,230,255,0.45)" rx="1"/>
              <rect x="44" y="2" width="2" height="7" rx="1" fill="#005DC7"/>
              <circle className="puff p1" cx="45" cy="1.5" r="1.5" fill="rgba(0,122,255,0.25)"/>
              <circle className="puff p2" cx="45" cy="0" r="1" fill="rgba(0,122,255,0.15)"/>
              <rect x="34.5" y="13" width="3" height="4" rx="0.5" fill="#004AAD"/>
              <rect x="46.5" y="15" width="2" height="2.5" rx="0.8" fill="#FFD60A"/>
              <rect x="46.5" y="15" width="4" height="2.5" rx="1" fill="rgba(255,214,10,0.4)"/>
              <g className="wheel rear-wheel">
                <circle cx="18" cy="21.5" r="4.5" fill="#003D99" stroke="#0056CC" strokeWidth="1"/>
                <circle cx="18" cy="21.5" r="2.8" fill="#0056CC"/>
                <line x1="18" y1="18" x2="18" y2="25" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                <line x1="14.5" y1="21.5" x2="21.5" y2="21.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                <line x1="15.5" y1="18.9" x2="20.5" y2="24.1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
                <line x1="20.5" y1="18.9" x2="15.5" y2="24.1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
                <circle cx="18" cy="21.5" r="1" fill="#CCE0FF"/>
              </g>
              <g className="wheel front-wheel">
                <circle cx="41" cy="21.5" r="4.5" fill="#003D99" stroke="#0056CC" strokeWidth="1"/>
                <circle cx="41" cy="21.5" r="2.8" fill="#0056CC"/>
                <line x1="41" y1="18" x2="41" y2="25" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                <line x1="37.5" y1="21.5" x2="44.5" y2="21.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                <line x1="38.5" y1="18.9" x2="43.5" y2="24.1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
                <line x1="43.5" y1="18.9" x2="38.5" y2="24.1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
                <circle cx="41" cy="21.5" r="1" fill="#CCE0FF"/>
              </g>
              <ellipse cx="29" cy="27.5" rx="20" ry="1.5" fill="rgba(0,122,255,0.15)"/>
            </svg>
            
            <div className="loading-text-container">
              <h3 className="loading-title">Calculating Route</h3>
              <p className="loading-subtitle">{loadingText}</p>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      )}

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
