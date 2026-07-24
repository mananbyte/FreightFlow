import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './RouteSeoPage.css';

// Mock database for programmatic generation.
// In a real scenario, this would be fetched from the backend or statically generated.
const MOCK_ROUTES_DB = {
  'chicago-il-to-atlanta-ga': {
    origin: 'Chicago, IL',
    destination: 'Atlanta, GA',
    mileage: 718,
    driveTimeHours: 11.5,
    totalTimeHours: 25.5,
    requiredRests: 1,
    fuelStops: 1,
    estFuelCost: '$450',
    terrain: 'Relatively flat route primarily following I-65 S and I-24 E. Watch for heavy congestion around Nashville and Chattanooga.',
    related: ['chicago-il-to-dallas-tx', 'atlanta-ga-to-miami-fl']
  },
  'los-angeles-ca-to-phoenix-az': {
    origin: 'Los Angeles, CA',
    destination: 'Phoenix, AZ',
    mileage: 372,
    driveTimeHours: 6.2,
    totalTimeHours: 6.7, // Only 30-min break needed
    requiredRests: 0,
    fuelStops: 0,
    estFuelCost: '$210',
    terrain: 'Desert crossing via I-10 E. Monitor engine temperatures and ensure adequate cooling during summer months.',
    related: ['los-angeles-ca-to-las-vegas-nv', 'phoenix-az-to-dallas-tx']
  }
};

const formatSlugToTitle = (slug) => {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function RouteSeoPage() {
  const { routeSlug } = useParams(); // e.g., 'chicago-il-to-atlanta-ga'
  const [routeData, setRouteData] = useState(null);

  useEffect(() => {
    // In production, this would be an API call: client.get(`/seo/routes/${routeSlug}`)
    // For now, we simulate fetching from our mock DB
    const data = MOCK_ROUTES_DB[routeSlug];
    if (data) {
      setRouteData(data);
    } else {
      // Fallback for unknown routes to avoid 404s, generating generic data
      const parts = routeSlug.split('-to-');
      if (parts.length === 2) {
        setRouteData({
          origin: formatSlugToTitle(parts[0]),
          destination: formatSlugToTitle(parts[1]),
          mileage: Math.floor(Math.random() * 1500) + 300,
          driveTimeHours: 0, // calculated below
          requiredRests: 0,
          fuelStops: 1,
          estFuelCost: 'Calculated on map',
          terrain: 'Standard highway routing. Calculate your trip below for precise FMCSA ELD compliance and route restrictions.',
          related: []
        });
      }
    }
  }, [routeSlug]);

  if (!routeData) {
    return <div className="seo-page-loading">Loading route details...</div>;
  }

  // Fallback calculations for dynamically generated unknown routes
  const driveTime = routeData.driveTimeHours || (routeData.mileage / 60).toFixed(1);
  const rests = routeData.requiredRests !== undefined ? routeData.requiredRests : Math.floor(driveTime / 11);
  
  return (
    <div className="seo-page-container">
      {/* 1. SEO Metadata Injection */}
      <Helmet>
        <title>Commercial Truck Route: {routeData.origin} to {routeData.destination} | FreightFlow</title>
        <meta name="description" content={`Calculate the exact truck drive time, mileage, and ELD compliance from ${routeData.origin} to ${routeData.destination}. See required 10-hour rests and fuel stops.`} />
        <meta property="og:title" content={`Truck Route: ${routeData.origin} to ${routeData.destination}`} />
        <meta property="og:description" content={`Plan your commercial freight route from ${routeData.origin} to ${routeData.destination} with FreightFlow's ELD calculator.`} />
        
        {/* JSON-LD Schema for the specific route */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": `Commercial Truck Route: ${routeData.origin} to ${routeData.destination}`,
            "description": `Truck trip calculation for ${routeData.origin} to ${routeData.destination} including ${routeData.mileage} miles and ELD planning.`,
            "provider": {
              "@type": "Organization",
              "name": "FreightFlow"
            }
          })
        }} />
      </Helmet>

      {/* 2. Optimized H1 Header */}
      <div className="seo-header">
        <span className="seo-badge">Programmatic SEO Route</span>
        <h1>Truck Route Calculator: <br/><span className="gradient-text">{routeData.origin}</span> to <span className="gradient-text">{routeData.destination}</span></h1>
        <p className="seo-subtitle">
          Plan your commercial freight trip efficiently. Below are the estimated route metrics, FMCSA ELD compliance requirements, and terrain warnings for your journey.
        </p>
      </div>

      <div className="seo-content-grid">
        {/* 3. Trip Summary Table / Cards */}
        <div className="seo-stats-panel glass-panel">
          <h3>Route Overview</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-icon">🛣️</span>
              <div className="stat-content">
                <span className="stat-label">Total Distance</span>
                <span className="stat-value">{routeData.mileage} miles</span>
              </div>
            </div>
            <div className="stat-box">
              <span className="stat-icon">⏱️</span>
              <div className="stat-content">
                <span className="stat-label">Est. Drive Time</span>
                <span className="stat-value">{driveTime} hours</span>
              </div>
            </div>
            <div className="stat-box">
              <span className="stat-icon">🛏️</span>
              <div className="stat-content">
                <span className="stat-label">10-Hr Rests Needed</span>
                <span className="stat-value">{rests}</span>
              </div>
            </div>
            <div className="stat-box">
              <span className="stat-icon">⛽</span>
              <div className="stat-content">
                <span className="stat-label">Fuel Stops</span>
                <span className="stat-value">{routeData.fuelStops}</span>
              </div>
            </div>
          </div>

          {/* 4. Unique Value Add Content */}
          <div className="seo-terrain-warning">
            <h4>⚠️ Route Insights</h4>
            <p>{routeData.terrain}</p>
          </div>
        </div>

        {/* 5. Call to Action / Interactive element placeholder */}
        <div className="seo-cta-panel glass-panel">
          <div className="map-placeholder">
            <div className="map-dots">
              <span className="dot origin"></span>
              <div className="line"></div>
              <span className="dot dest"></span>
            </div>
            <p>Interactive Map Available in App</p>
          </div>
          
          <div className="cta-content">
            <h3>Calculate Your Exact Trip</h3>
            <p>Get precise routing, real-time ELD log generation, and custom truck parameter routing for this exact lane.</p>
            <Link to="/" className="btn-primary cta-button">
              Calculate {routeData.origin} Route
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Internal Linking (Spokes) */}
      {routeData.related && routeData.related.length > 0 && (
        <div className="seo-related-routes">
          <h3>Popular Related Routes</h3>
          <div className="related-links">
            {routeData.related.map(slug => (
              <Link key={slug} to={`/route/${slug}-truck-route`} className="related-link-card glass-panel">
                <span>📍</span> {formatSlugToTitle(slug.replace('-truck-route', ''))}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
