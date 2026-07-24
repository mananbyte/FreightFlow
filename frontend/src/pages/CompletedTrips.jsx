import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { showToast, showConfirm } from '../utils/ui';
import './MyTrips.css';

export default function CompletedTrips() {
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
      // 401 handled by the global interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleViewLog = async (tripId) => {
    try {
      const res = await client.get(`/trips/${tripId}/`);
      navigate('/log', { state: { dailyLogs: res.data.daily_logs_json } });
    } catch (err) {
      showToast('Failed to load trip details');
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
      showToast('Failed to load map data');
    }
  };

  const handleDelete = async (tripId) => {
    const confirmed = await showConfirm('Delete Completed Trip', 'Are you sure you want to delete this trip permanently?');
    if (!confirmed) return;
    try {
      await client.delete(`/trips/${tripId}/`);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      showToast('Trip deleted permanently', 'success');
    } catch {
      showToast('Failed to delete trip');
    }
  };

  const completedTrips = trips.filter(t => t.is_completed);

  if (loading) {
    return (
      <div className="my-trips-container">
        <div className="trips-loading">
          <div className="spinner" />
          <p>Loading completed trips…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-trips-container">
      {/* Page header */}
      <div className="trips-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => navigate('/trips')} 
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
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', letterSpacing: '-1px' }}>Completed Trips</h1>
            <p className="trips-sub">{completedTrips.length} completed {completedTrips.length === 1 ? 'trip' : 'trips'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/trips" className="back-link new-route-btn">Back to Active Trips</Link>
        </div>
      </div>

      {/* Trip grid */}
      {completedTrips.length === 0 ? (
        <div className="no-trips glass-panel guided-empty-state">
          <div className="empty-illustration">
            <span style={{ fontSize: '48px' }}>🏁</span>
          </div>
          <h2>No completed trips yet</h2>
          <p>When you finish a route, click "Complete" on your active trips to move them here.</p>
          <Link to="/trips" className="btn-primary calculate-first-route-btn">
            View Active Trips <span className="arrow">→</span>
          </Link>
        </div>
      ) : (
        <div className="trips-grid">
          {completedTrips.map((trip) => (
            <div key={trip.id} className="trip-card glass-panel" style={{ opacity: 0.9 }}>
              <div className="trip-card-top">
                <span className="trip-icon">✅</span>
                <div className="trip-title-wrap">
                  <h3 className="trip-name">{trip.name}</h3>
                  <span className="trip-date">{new Date(trip.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="trip-route">
                {trip.current_location && (
                  <>
                    <div className="route-point current">
                      <span className="route-dot current" />
                      <span>{trip.current_location} <span style={{fontSize: '11px', color: '#007AFF', fontWeight: 'bold'}}>(End Location)</span></span>
                    </div>
                    <div className="route-line" />
                  </>
                )}
                <div className="route-point from">
                  <span className="route-dot origin" />
                  <span>{trip.pickup} <span style={{fontSize: '11px', color: '#34C759', fontWeight: 'bold'}}>(Pickup)</span></span>
                </div>
                <div className="route-line" />
                <div className="route-point to">
                  <span className="route-dot dest" />
                  <span>{trip.dropoff} <span style={{fontSize: '11px', color: '#FF3B30', fontWeight: 'bold'}}>(Dropoff)</span></span>
                </div>
              </div>

              <div className="trip-meta">
                <div className="meta-chip" style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34C759', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
                  <span>📅</span>
                  <span>{trip.log_days} {trip.log_days === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="meta-chip" style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34C759', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
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
                <button className="btn-delete" onClick={() => handleDelete(trip.id)} style={{ gridColumn: 'span 2' }}>
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
