import React, { useState } from 'react';
import FloatingPanel from '../components/FloatingPanel';
import MapComponent from '../components/MapComponent';
import './Dashboard.css';

export default function Dashboard() {
  const [routeData, setRouteData] = useState({ routeGeoJSON: null, events: [], dailyLogs: [] });

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
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (!response.ok) {
        alert("Routing failed: " + (result.error || "Unknown error"));
        return;
      }
      
      setRouteData({
        routeGeoJSON: result.routeGeoJSON,
        events: result.events,
        dailyLogs: result.dailyLogs || []
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>FreightFlow</h1>
        <div className="header-status">
          <span className="status-dot"></span>
          System Online
        </div>
      </div>
      <FloatingPanel onSubmit={calculateRoute} dailyLogs={routeData.dailyLogs} />
      <MapComponent routeGeoJSON={routeData.routeGeoJSON} events={routeData.events} />
    </div>
  );
}
