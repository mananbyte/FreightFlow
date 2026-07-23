import React, { useState } from 'react';
import client from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import FloatingPanel from '../components/FloatingPanel';

const Dashboard = () => {
    const [markers, setMarkers] = useState([]);
    const [routeGeoJSON, setRouteGeoJSON] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleCalculateRoute = async (tripDetails) => {
        const { current, pickup, dropoff, cycleHours } = tripDetails;
        
        if (!current || !pickup || !dropoff) {
            setError('Please select all locations before calculating.');
            return;
        }

        setError(null);
        setIsLoading(true);

        const payload = {
            current: [current.lat, current.lon],
            pickup: [pickup.lat, pickup.lon],
            dropoff: [dropoff.lat, dropoff.lon],
            cycleHours
        };

        // Update markers to display immediately
        setMarkers([
            { lat: current.lat, lon: current.lon, name: 'Current' },
            { lat: pickup.lat, lon: pickup.lon, name: 'Pickup' },
            { lat: dropoff.lat, lon: dropoff.lon, name: 'Dropoff' }
        ]);

        try {
            const response = await client.post('/routes/calculate/', payload);
            setRouteGeoJSON(response.data);
            
            // Optionally, we could pass the cycleHours to the next phase (log drawing) via state or context
        } catch (err) {
            console.error('Error calculating route:', err);
            setError(err.response?.data?.error || 'Failed to calculate route. Ensure endpoints are reachable.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <MapComponent markers={markers} routeGeoJSON={routeGeoJSON} />
            <FloatingPanel onCalculate={handleCalculateRoute} />
            
            {/* Minimal top-right nav for phase 1/2 switching if needed */}
            <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <Link to="/log" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 600 }}>View Driver Log &rarr;</Link>
            </div>

            {error && (
                <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 1000, background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '300px' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {isLoading && (
                <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 1000, background: '#ebf8ff', color: '#0369a1', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    Calculating route...
                </div>
            )}
        </div>
    );
};

export default Dashboard;
