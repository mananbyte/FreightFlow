import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getEventColor = (type) => {
  switch(type) {
    case 'current_location': return '#14B8A6'; // Teal
    case 'pickup': return '#10B981'; // Green
    case 'dropoff': return '#EF4444'; // Red
    case 'fuel': return '#F59E0B'; // Orange
    case 'break_30m': return '#FBBF24'; // Yellow
    case 'rest_2h': return '#FBBF24'; // Yellow (Off Duty)
    case 'rest_8h': return '#3B82F6'; // Blue (Sleeper)
    case 'rest_10h': return '#3B82F6'; // Blue
    case 'rest_34h': return '#8B5CF6'; // Purple
    default: return '#6B7280'; // Gray
  }
};

const createCustomIcon = (type) => {
  const color = getEventColor(type);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32px" height="32px" stroke="white" stroke-width="2">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>`;
  
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: svg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const formatEventType = (type) => {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export default function MapComponent({ routeGeoJSON, events }) {
  return (
    <MapContainer center={[39.8283, -98.5795]} zoom={4} zoomControl={false} style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <ZoomControl position="bottomright" />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      
      {routeGeoJSON && routeGeoJSON.routes && (
        <Polyline 
          positions={routeGeoJSON.routes[0].geometry.coordinates.map(c => [c[1], c[0]])} 
          pathOptions={{ color: '#4F46E5', weight: 4, opacity: 0.8 }}
        />
      )}
      
      {events && events.map((evt, idx) => {
        if (!evt.coordinates) return null;
        return (
          <Marker 
            key={idx} 
            position={[evt.coordinates[1], evt.coordinates[0]]}
            icon={createCustomIcon(evt.event_type)}
          >
            <Popup>
              <strong style={{ color: getEventColor(evt.event_type), fontSize: '1.1em' }}>
                {formatEventType(evt.event_type)}
              </strong><br/>
              <span style={{ color: '#6B7280', fontSize: '0.9em' }}>
                {new Date(evt.timestamp).toLocaleString()}
              </span>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
