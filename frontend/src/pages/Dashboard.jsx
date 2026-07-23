import React, { useState } from 'react';
import FloatingPanel from '../components/FloatingPanel';
import MapComponent from '../components/MapComponent';

export default function Dashboard() {
  const [routeData, setRouteData] = useState({ routeGeoJSON: null, events: [] });

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
      setRouteData({
        routeGeoJSON: result.routeGeoJSON,
        events: result.events
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <FloatingPanel onSubmit={calculateRoute} />
      <MapComponent routeGeoJSON={routeData.routeGeoJSON} events={routeData.events} />
    </div>
  );
}
