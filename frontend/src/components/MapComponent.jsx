import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── FMCSA-accurate color palette ──────────────────────────────────────────────
const EVENT_META = {
  current_location: { color: '#14B8A6', label: 'Current Location',  show: true  },
  pickup:           { color: '#10B981', label: 'Pickup Stop',        show: true  },
  dropoff:          { color: '#EF4444', label: 'Delivery / Dropoff', show: true  },
  fuel:             { color: '#F59E0B', label: 'Fuel Stop',          show: true  },
  break_30m:        { color: '#FBBF24', label: '30-Min Break',       show: true  },
  // Sleeper Berth events — blue family
  rest_2h:          { color: '#60A5FA', label: 'Sleeper 2-Hr Split', show: false },
  rest_8h:          { color: '#3B82F6', label: 'Sleeper 8-Hr Split', show: false },
  rest_10h:         { color: '#2563EB', label: '10-Hr Sleeper Rest', show: true  },
  // Cycle reset — purple
  rest_34h:         { color: '#8B5CF6', label: '34-Hr Cycle Reset',  show: true  },
  // Inspections are logged on the ELD sheet but hidden on map to prevent obscuring Rest markers
  pre_trip:         { color: '#6366F1', label: 'Pre-Trip Inspection',  show: false },
  post_trip:        { color: '#6366F1', label: 'Post-Trip Inspection', show: false },
};

const getColor = (type) => (EVENT_META[type] || { color: '#6B7280' }).color;
const getLabel = (type) => (EVENT_META[type] || { label: type }).label;
const isVisible = (type) => (EVENT_META[type] || { show: true }).show;

// ── Distinct SVG paths per event category ─────────────────────────────────────
const getSvgPath = (type) => {
  switch (type) {
    case 'current_location':
      // Pulsing dot / crosshair circle
      return `<circle cx="12" cy="12" r="6" fill="COLOR" stroke="white" stroke-width="2.5"/>
              <circle cx="12" cy="12" r="10" fill="none" stroke="COLOR" stroke-width="1.5" opacity="0.4"/>`;

    case 'pickup':
      // Upward arrow inside pin
      return `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="COLOR" stroke="white" stroke-width="1.5"/>
              <path d="M12 6l-3 3.5h2v3h2v-3h2z" fill="white"/>`;

    case 'dropoff':
      // Checkmark inside pin
      return `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="COLOR" stroke="white" stroke-width="1.5"/>
              <path d="M9 9l2 2 4-4" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>`;

    case 'fuel':
      // Gas pump icon
      return `<rect x="4" y="4" width="12" height="16" rx="2" fill="COLOR" stroke="white" stroke-width="1.5"/>
              <rect x="7" y="7" width="6" height="4" rx="1" fill="white"/>
              <path d="M16 7h2a1 1 0 011 1v4a1 1 0 01-1 1h-2" fill="none" stroke="COLOR" stroke-width="1.5"/>`;

    case 'break_30m':
      // Coffee cup
      return `<path d="M5 6h10l-1.5 9H6.5L5 6z" fill="COLOR" stroke="white" stroke-width="1.5"/>
              <path d="M15 8h2a2 2 0 010 4h-2" fill="none" stroke="COLOR" stroke-width="1.5"/>
              <path d="M7 17h10" stroke="white" stroke-width="1.5" stroke-linecap="round"/>`;

    case 'rest_2h':
      // Half moon (split sleeper — shorter)
      return `<path d="M12 4a8 8 0 000 16 6 6 0 010-16z" fill="COLOR" stroke="white" stroke-width="1.5"/>
              <text x="12" y="14" text-anchor="middle" fill="white" font-size="6" font-weight="bold" font-family="sans-serif">2h</text>`;

    case 'rest_8h':
      // Moon (split sleeper — longer)
      return `<path d="M12 4a8 8 0 000 16 6 6 0 010-16z" fill="COLOR" stroke="white" stroke-width="1.5"/>
              <text x="12" y="14" text-anchor="middle" fill="white" font-size="6" font-weight="bold" font-family="sans-serif">8h</text>`;

    case 'rest_10h':
      // Bed icon
      return `<rect x="3" y="10" width="18" height="8" rx="2" fill="COLOR" stroke="white" stroke-width="1.5"/>
              <circle cx="7" cy="8" r="2" fill="COLOR" stroke="white" stroke-width="1.5"/>
              <path d="M9 8h9a2 2 0 012 2v0H9V8z" fill="COLOR" stroke="white" stroke-width="1"/>`;

    case 'rest_34h':
      // Lightning bolt (restart)
      return `<polygon points="13,2 5,13 11,13 11,22 19,11 13,11" fill="COLOR" stroke="white" stroke-width="1.5"/>`;

    case 'pre_trip':
    case 'post_trip':
      // Clipboard / Checklist icon
      return `<rect x="6" y="4" width="12" height="16" rx="2" fill="COLOR" stroke="white" stroke-width="1.5"/>
              <path d="M9 4V3C9 2.45 9.45 2 10 2h4c.55 0 1 .45 1 1v1M8 4h8" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M9 10h6M9 14h6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>`;

    default:
      return `<circle cx="12" cy="12" r="8" fill="COLOR" stroke="white" stroke-width="2"/>`;
  }
};

const createCustomIcon = (type) => {
  const color = getColor(type);
  const path = getSvgPath(type).replace(/COLOR/g, color);
  const iconSize = 22;
  const badgeSize = 38;

  // White circle badge + drop-shadow ensures every marker pops on any map tile
  const html = `
    <div style="
      width:${badgeSize}px;
      height:${badgeSize}px;
      background:white;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 2px 8px rgba(0,0,0,0.35), 0 0 0 2.5px ${color};
      position:relative;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${iconSize}px" height="${iconSize}px">${path}</svg>
    </div>`;

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html,
    iconSize: [badgeSize, badgeSize],
    iconAnchor: [badgeSize / 2, badgeSize / 2],
    popupAnchor: [0, -(badgeSize / 2)],
  });
};

const formatDuration = (seconds) => {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

function MapUpdater({ routeGeoJSON, events }) {
  const map = useMap();
  
  React.useEffect(() => {
    const coords = [];
    if (routeGeoJSON && routeGeoJSON.routes) {
      routeGeoJSON.routes[0].geometry.coordinates.forEach(c => coords.push([c[1], c[0]]));
    }
    if (events && events.length > 0) {
      events.forEach(e => {
        if (e.coordinates) coords.push([e.coordinates[1], e.coordinates[0]]);
      });
    }
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      // Extra padding to account for the left floating panel
      map.fitBounds(bounds, { paddingBottomRight: [40, 40], paddingTopLeft: [440, 40], animate: true, duration: 1.5 });
    }
  }, [routeGeoJSON, events, map]);

  return null;
}

function MapComponent({ routeGeoJSON, events }) {
  return (
    <MapContainer
      center={[39.8283, -98.5795]}
      zoom={4}
      zoomControl={false}
      style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
    >
      <ZoomControl position="bottomright" />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      <MapUpdater routeGeoJSON={routeGeoJSON} events={events} />

      {routeGeoJSON && routeGeoJSON.routes && (
        <Polyline
          positions={routeGeoJSON.routes[0].geometry.coordinates.map(c => [c[1], c[0]])}
          pathOptions={{ color: '#4F46E5', weight: 4, opacity: 0.8 }}
        />
      )}

      {events && events.map((evt, idx) => {
        if (!evt.coordinates) return null;
        if (!isVisible(evt.event_type)) return null;

        const color = getColor(evt.event_type);
        const label = getLabel(evt.event_type);
        const dur = formatDuration(evt.duration);

        return (
          <Marker
            key={idx}
            position={[evt.coordinates[1], evt.coordinates[0]]}
            icon={createCustomIcon(evt.event_type)}
          >
            <Popup>
              <div style={{ minWidth: '160px', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  borderBottom: `2px solid ${color}`, paddingBottom: '6px', marginBottom: '6px'
                }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: color, flexShrink: 0, display: 'inline-block'
                  }} />
                  <strong style={{ color: '#1F2937', fontSize: '0.95em' }}>{label}</strong>
                </div>
                <div style={{ color: '#6B7280', fontSize: '0.82em', lineHeight: 1.7 }}>
                  <div>🕐 {new Date(evt.timestamp).toLocaleString()}</div>
                  {dur && <div>⏱ Duration: <strong style={{ color: '#374151' }}>{dur}</strong></div>}
                  <div>📍 {evt.coordinates[1].toFixed(4)}, {evt.coordinates[0].toFixed(4)}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

const Legend = () => {
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      fontFamily: 'system-ui, sans-serif',
      color: '#1F2937',
      minWidth: '200px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '600' }}>Marker Legend</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {Object.entries(EVENT_META).filter(([_, meta]) => meta.show).map(([key, meta]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'white', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 1px 4px rgba(0,0,0,0.3), 0 0 0 1.5px ${meta.color}`,
              position: 'relative'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14px" height="14px" dangerouslySetInnerHTML={{ __html: getSvgPath(key).replace(/COLOR/g, meta.color) }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{meta.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MapComponentWrapper({ routeGeoJSON, events }) {
  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      <MapComponent routeGeoJSON={routeGeoJSON} events={events} />
      <Legend />
    </div>
  );
}
