import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import './MyTrips.css';

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await client.get('/trips/');
      setTrips(res.data);
    } catch (err) {
      // 401 handled by the global interceptor which fires session-expired
    } finally {
      setLoading(false);
    }
  };

  const handleViewLog = async (tripId) => {
    try {
      const res = await client.get(`/trips/${tripId}/`);
      navigate('/log', { state: { dailyLogs: res.data.daily_logs_json } });
    } catch (err) {
      alert('Failed to load trip details');
    }
  };

  const handleViewMap = async (tripId) => {
    try {
      const res = await client.get(`/trips/${tripId}/`);
      navigate('/', { 
        state: { 
          preloadedRoute: {
            routeGeoJSON: res.data.route_geojson,
            events: res.data.events_json,
            dailyLogs: res.data.daily_logs_json
          } 
        } 
      });
    } catch (err) {
      alert('Failed to load map data');
    }
  };

  const handleDelete = async (tripId) => {
    if (!confirm('Delete this trip?')) return;
    try {
      await client.delete(`/trips/${tripId}/`);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch {
      alert('Failed to delete trip');
    }
  };

  if (loading) {
    return (
      <div className="my-trips-container">
        <div className="trips-loading">
          <div className="spinner" />
          <p>Loading your trips…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-trips-container">
      {/* Page header */}
      <div className="trips-page-header">
        <div>
          <h1>My Trips</h1>
          <p className="trips-sub">{trips.length} saved {trips.length === 1 ? 'trip' : 'trips'}</p>
        </div>
        <Link to="/" className="back-link new-route-btn">+ New Route</Link>
      </div>

      {/* Trip grid */}
      {trips.length === 0 ? (
        <div className="no-trips glass-panel guided-empty-state">
          <div className="empty-illustration">
            <svg width="160" height="100" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Highway line */}
              <path d="M20 80 L140 80" stroke="rgba(0,122,255,0.2)" strokeWidth="4" strokeLinecap="round" strokeDasharray="12 12"/>
              {/* Sleek Truck */}
              <rect x="50" y="45" width="40" height="30" rx="4" fill="url(#truckGradEmpty)"/>
              <path d="M92 50 L92 75 L112 75 L112 60 L102 50 Z" fill="url(#cabGradEmpty)"/>
              <rect x="94" y="52" width="12" height="10" rx="2" fill="rgba(255,255,255,0.4)"/>
              <circle cx="65" cy="78" r="7" fill="#1d1d1f" stroke="rgba(255,255,255,0.8)" strokeWidth="2"/>
              <circle cx="100" cy="78" r="7" fill="#1d1d1f" stroke="rgba(255,255,255,0.8)" strokeWidth="2"/>
              <defs>
                <linearGradient id="truckGradEmpty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#007AFF"/>
                  <stop offset="100%" stopColor="#0056CC"/>
                </linearGradient>
                <linearGradient id="cabGradEmpty" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0A84FF"/>
                  <stop offset="100%" stopColor="#005DC7"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2>Your journey starts here</h2>
          <p>Calculate a route and tap <strong>"Save Trip"</strong> to store it here.</p>
          <Link to="/" className="btn-primary calculate-first-route-btn">
            Calculate your first route! <span className="arrow">→</span>
          </Link>
        </div>
      ) : (
        <div className="trips-grid">
          {trips.map((trip) => (
            <div key={trip.id} className="trip-card glass-panel">
              <div className="trip-card-top">
                <span className="trip-icon">🚛</span>
                <div className="trip-title-wrap">
                  <h3 className="trip-name">{trip.name}</h3>
                  <span className="trip-date">{new Date(trip.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="trip-route">
                <div className="route-point from">
                  <span className="route-dot origin" />
                  <span>{trip.pickup}</span>
                </div>
                <div className="route-line" />
                <div className="route-point to">
                  <span className="route-dot dest" />
                  <span>{trip.dropoff}</span>
                </div>
              </div>

              <div className="trip-meta">
                <div className="meta-chip">
                  <span>📅</span>
                  <span>{trip.log_days} {trip.log_days === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="meta-chip">
                  <span>⏱</span>
                  <span>{trip.cycle_hours_used}h used</span>
                </div>
              </div>

              <div className="trip-actions">
                <button className="btn-primary" onClick={() => handleViewMap(trip.id)}>
                  View Map
                </button>
                <button className="btn-secondary" onClick={() => handleViewLog(trip.id)}>
                  Log Sheet
                </button>
                <button className="btn-delete" onClick={() => handleDelete(trip.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
