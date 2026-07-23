# Research: Phase 2 - Route Calculation and Map API Integration

## Overview
This phase builds the interactive core of the application: a modern map interface where drivers can input their trip details, view the calculated route, and see visualizations of their stops. The main technical challenge is seamlessly orchestrating string inputs to coordinates (geocoding), calculating routes via an external service, and rendering spatial data on a React-Leaflet map.

## Technical Strategy & Recommendations

### 1. External APIs Selection
- **Geocoding & Autocomplete:**
  - **Photon (`https://photon.komoot.io`)**: Recommended over raw Nominatim. It uses OpenStreetMap data but is specifically tuned for search-as-you-type (autocomplete) and returns cleaner JSON without requiring an API key. 
  - *Constraint:* Needs debouncing (e.g., 300-500ms) on the frontend to respect fair-use limits.
- **Routing:**
  - **OpenRouteService (ORS)**: Generous free tier.
  - *Profile:* As this is an ELD application for truck drivers, we should use the `driving-hgv` (Heavy Goods Vehicle) profile to ensure routes respect truck restrictions (weight, height, legal roads) where data is available.

### 2. Architecture: Direct vs. Proxied Requests
- **Geocoding (Photon):** Can be called **directly from the frontend**. It requires no API key, and keeping it frontend-direct reduces latency for real-time autocomplete typing.
- **Routing (OpenRouteService):** Should be **proxied through the Django backend**.
  - *Why?* Secures the ORS API key by keeping it out of the browser. Furthermore, in Phase 3/4, the backend will need to process the ORS route geometry and duration to calculate legally required ELD rest stops. Building the Django->ORS connection now lays the foundation for future phases.

### 3. Frontend Component Architecture
The UI requires a modern, immersive feel (Decision D-01).
- **`Dashboard.jsx` (State Manager):** Holds the full-screen layout. Manages the state for `currentLocation`, `pickup`, `dropoff`, `currentCycle`, and the resulting `routeData`.
- **`MapComponent.jsx`:**
  - Wraps the `react-leaflet` `MapContainer` to fill `100vh` and `100vw`.
  - Displays `TileLayer` (standard OSM tiles).
  - Renders a `Polyline` for the route path (solid line per D-03).
  - Renders distinct `Marker`s for Current Location, Pickup, and Dropoff.
  - Uses Leaflet's `fitBounds` inside a `useEffect` hook to smoothly zoom the map to frame the loaded route and markers.
- **`FloatingPanel.jsx`:**
  - Absolute positioned (e.g., top-left) over the map with a translucent or blurred background.
  - Houses the form inputs and a "Calculate Route" action button.
- **`AutocompleteInput.jsx`:**
  - Reusable controlled input component.
  - Manages its own dropdown of suggestions fetched dynamically from the Photon API.
  - On selection, passes a `{ name, lat, lon }` object up to the parent.

### 4. Backend Architecture
- **Route Endpoint (`/api/routes/calculate/`):**
  - Accepts POST request with coordinates for Current, Pickup, and Dropoff.
  - Constructs a request to ORS API (using `requests` or `httpx`).
  - Returns the route geometry (GeoJSON) and summary data (total distance, total duration) to the frontend.
- **Environment Variables:**
  - `ORS_API_KEY` must be added to Django's settings and loaded via `django-environ`.

### 5. Required Dependencies
- **Frontend:**
  - `react-leaflet` and `leaflet`: Core mapping capabilities.
  - *Note:* Leaflet CSS needs to be imported globally or in the component to prevent rendering glitches.
- **Backend:**
  - `requests` or `httpx`: For outbound HTTP requests to ORS.

### 6. Edge Cases & Error Handling (Agent Discretion Addressed)
- **Invalid/Unroutable Destinations:** OpenRouteService may fail if points are too far apart (e.g., across an ocean) or inaccessible. The UI must catch a non-200 response from the backend and display a clean error in the `FloatingPanel` (e.g., "Unable to calculate a route between these locations.").
- **Network Failures:** Standard Axios error handling for backend unreachability.
- **Map Initialization:** Ensure the map has a default view (e.g., center of the US) before the user inputs their locations.

## Roadmap for Planning (`03-PLAN.md`)
To execute this smoothly, the plan should roughly follow:
1. **Prep:** Install frontend Leaflet dependencies and backend HTTP request modules. Add ORS env vars.
2. **Backend:** Create the Django ORS proxy endpoint (`/api/routes/calculate/`).
3. **Frontend (Map Base):** Create the full-screen map layout in the Dashboard.
4. **Frontend (Inputs):** Build the `FloatingPanel` and the `AutocompleteInput` using Photon.
5. **Integration:** Connect the form submission to the backend API.
6. **Frontend (Visualization):** Parse the returned GeoJSON and draw the `Polyline` and `Marker`s, applying `fitBounds`.
