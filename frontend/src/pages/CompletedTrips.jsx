import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
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
    if (!confirm('Delete this completed trip?')) return;
    try {
      await client.delete(`/trips/${tripId}/`);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch {
      alert('Failed to delete trip');
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
        <div>
          <h1>Completed Trips</h1>
          <p className="trips-sub">{completedTrips.length} completed {completedTrips.length === 1 ? 'trip' : 'trips'}</p>
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
