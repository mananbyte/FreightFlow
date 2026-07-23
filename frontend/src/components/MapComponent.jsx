import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

export default function MapComponent({ routeGeoJSON, events }) {
  return (
    <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {routeGeoJSON && <Polyline positions={routeGeoJSON.features[0].properties.segments[0].steps.map(s => [s.maneuver.location[1], s.maneuver.location[0]])} />}
      {events && events.map((evt, idx) => {
        if (!evt.coordinates) return null;
        return (
          <Marker key={idx} position={[evt.coordinates[1], evt.coordinates[0]]}>
            <Popup>
              <strong>{evt.event_type}</strong><br/>
              {new Date(evt.timestamp).toLocaleString()}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
