import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapComponent.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle auto-fitting map bounds
const MapBoundsFitter = ({ markers, routeGeoJSON }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    let bounds = L.latLngBounds();
    let hasBounds = false;

    if (markers && markers.length > 0) {
      markers.forEach(m => {
        if (m && m.lat && m.lon) {
          bounds.extend([m.lat, m.lon]);
          hasBounds = true;
        }
      });
    }

    if (routeGeoJSON && routeGeoJSON.features && routeGeoJSON.features.length > 0) {
      // Create a temporary GeoJSON layer to easily get its bounds
      const geoJsonLayer = L.geoJSON(routeGeoJSON);
      const geoJsonBounds = geoJsonLayer.getBounds();
      if (geoJsonBounds.isValid()) {
        bounds.extend(geoJsonBounds);
        hasBounds = true;
      }
    }

    if (hasBounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, markers, routeGeoJSON]);

  return null;
};

const MapComponent = ({ markers = [], routeGeoJSON = null }) => {
  // Default to center of US
  const defaultCenter = [39.8283, -98.5795];
  const defaultZoom = 4;

  const getPolylinePositions = () => {
    if (!routeGeoJSON || !routeGeoJSON.features || routeGeoJSON.features.length === 0) {
      return [];
    }
    // Assume LineString or MultiLineString
    const geometry = routeGeoJSON.features[0].geometry;
    if (geometry.type === 'LineString') {
      return geometry.coordinates.map(coord => [coord[1], coord[0]]); // GeoJSON is [lon, lat], Leaflet wants [lat, lon]
    }
    return [];
  };

  return (
    <div className="map-wrapper">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        zoomControl={false}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker, idx) => (
          marker && marker.lat && marker.lon ? (
            <Marker key={idx} position={[marker.lat, marker.lon]} />
          ) : null
        ))}

        {routeGeoJSON && (
          <Polyline 
            positions={getPolylinePositions()} 
            color="#2563eb" 
            weight={5} 
            opacity={0.8} 
          />
        )}

        <MapBoundsFitter markers={markers} routeGeoJSON={routeGeoJSON} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
