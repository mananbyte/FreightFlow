---
wave: 1
depends_on: []
files_modified:
  - backend/requirements.txt
  - frontend/package.json
  - backend/.env.example
  - backend/core/settings.py
  - backend/api/views.py
  - backend/api/urls.py
  - frontend/src/components/AutocompleteInput.jsx
  - frontend/src/components/MapComponent.jsx
  - frontend/src/components/FloatingPanel.jsx
  - frontend/src/pages/Dashboard.jsx
autonomous: true
---

# Phase 2: Route Calculation and Map API Integration

## Goal
Implement a full-screen interactive map where drivers input their trip details using autocomplete. The backend must proxy a request to OpenRouteService to calculate a truck-safe route (`driving-hgv`) and the frontend must display the route polyline and location markers.

## Must Haves
- Leaflet map rendering correctly with full-screen bounds.
- Photon API integrated directly in the frontend for geocoding (no API key required).
- OpenRouteService API integrated via Django backend proxy to protect `ORS_API_KEY`.
- Backend uses the `driving-hgv` profile to ensure accurate truck routing.
- The UI contains a `FloatingPanel` overlaying the `MapComponent` in `Dashboard.jsx`.

## Tasks

### Wave 1: Foundation (Backend Proxy & Dependencies)

<task>
<action>
Add Python dependencies and Javascript dependencies for Phase 2.
1. Add `requests` to `backend/requirements.txt`.
2. Install `leaflet` and `react-leaflet` to `frontend/package.json`.
</action>
<read_first>
- backend/requirements.txt
- frontend/package.json
</read_first>
<acceptance_criteria>
- `backend/requirements.txt` contains `requests`
- `frontend/package.json` contains `react-leaflet`
- `frontend/package.json` contains `leaflet`
</acceptance_criteria>
</task>

<task>
<action>
Configure Django environment variables for OpenRouteService.
1. Add `ORS_API_KEY=` placeholder to `backend/.env.example`.
2. Load `ORS_API_KEY` in `backend/core/settings.py` so it is globally available.
</action>
<read_first>
- backend/.env.example
- backend/core/settings.py
</read_first>
<acceptance_criteria>
- `backend/.env.example` contains the literal string `ORS_API_KEY=`
- `backend/core/settings.py` accesses `ORS_API_KEY` from the environment or settings file
</acceptance_criteria>
</task>

<task>
<action>
Create the backend route calculation proxy endpoint.
1. In `backend/api/views.py`, create a view or viewset handling `POST /api/routes/calculate/`.
2. The endpoint should accept JSON with `{ "current": [lat, lon], "pickup": [lat, lon], "dropoff": [lat, lon] }`.
3. The backend makes an outbound POST request using `requests` to `https://api.openrouteservice.org/v2/directions/driving-hgv/geojson` with the provided coordinates using the `ORS_API_KEY` in the headers.
4. Return the resulting GeoJSON response to the caller.
5. Wire this endpoint up in `backend/api/urls.py`.
</action>
<read_first>
- backend/api/views.py
- backend/api/urls.py
</read_first>
<acceptance_criteria>
- `backend/api/views.py` contains logic handling POST requests and makes a `requests.post` call to `https://api.openrouteservice.org/v2/directions/driving-hgv/geojson`
- `backend/api/urls.py` exposes the `/routes/calculate/` path
</acceptance_criteria>
</task>

### Wave 2: Frontend Base Components

<task>
<action>
Build the `AutocompleteInput` component to resolve addresses using the Photon API.
1. Create `frontend/src/components/AutocompleteInput.jsx`.
2. The component should be a controlled input (`value`, `onChange`, `placeholder`).
3. Use `fetch` to query `https://photon.komoot.io/api/?q={query}` when the user types, displaying a dropdown of results. Debounce the call.
4. On selection, pass a structured object `{ name, lat, lon }` back to the parent `onChange` handler.
</action>
<read_first>
- frontend/src/components/AutocompleteInput.jsx
</read_first>
<acceptance_criteria>
- `frontend/src/components/AutocompleteInput.jsx` exports a functional React component
- The component source contains a fetch request to `https://photon.komoot.io/api/`
- Clicking a suggestion item triggers `onChange` with lat/lon coordinates
</acceptance_criteria>
</task>

<task>
<action>
Build the React-Leaflet Map component.
1. Create `frontend/src/components/MapComponent.jsx`.
2. Mount a `MapContainer` with `100vh` and `100vw` dimensions.
3. Add a standard OSM `TileLayer`.
4. Include `import 'leaflet/dist/leaflet.css'` in the file.
5. Accept props for `markers` (array of objects with lat/lon) and `routeGeoJSON`. Use `Marker` and `Polyline` or `GeoJSON` layer from `react-leaflet` to display them.
6. Create an inner component that uses Leaflet's `useMap()` and `map.fitBounds()` to auto-focus on the markers/route when they update.
</action>
<read_first>
- frontend/src/components/MapComponent.jsx
</read_first>
<acceptance_criteria>
- `frontend/src/components/MapComponent.jsx` imports `react-leaflet` components `MapContainer`, `TileLayer`, `Marker`
- The source imports `leaflet/dist/leaflet.css`
- Contains logic for `fitBounds` when map data updates
</acceptance_criteria>
</task>

### Wave 3: Assembly & Integration

<task>
<action>
Build the `FloatingPanel` container component.
1. Create `frontend/src/components/FloatingPanel.jsx`.
2. Render an absolute-positioned div with a translucent or blurred backdrop.
3. Include three `AutocompleteInput` fields: "Current Location", "Pickup", and "Dropoff".
4. Include a numeric input for "Current Cycle Used (Hrs)".
5. Include a "Calculate Route" button that emits the gathered form data to the parent.
</action>
<read_first>
- frontend/src/components/FloatingPanel.jsx
- frontend/src/components/AutocompleteInput.jsx
</read_first>
<acceptance_criteria>
- `frontend/src/components/FloatingPanel.jsx` imports and renders three `<AutocompleteInput />` instances
- Emits form data containing current, pickup, dropoff, and cycle hours when the button is clicked
</acceptance_criteria>
</task>

<task>
<action>
Integrate map and forms into the main `Dashboard`.
1. Update `frontend/src/pages/Dashboard.jsx` to render `<MapComponent>` and overlay `<FloatingPanel>`.
2. Manage state for the locations and the resulting `routeData`.
3. When the `FloatingPanel` emits the calculation event, use the existing Axios client (from `frontend/src/api/client.js`) to make a POST request to `/api/routes/calculate/` with the coordinates.
4. Pass the returned GeoJSON into the `routeGeoJSON` prop of `<MapComponent>`.
</action>
<read_first>
- frontend/src/pages/Dashboard.jsx
- frontend/src/api/client.js
</read_first>
<acceptance_criteria>
- `frontend/src/pages/Dashboard.jsx` renders both `<MapComponent>` and `<FloatingPanel>`
- The source calls the API proxy via a `POST` method
- Submitting the form updates map data properties
</acceptance_criteria>
</task>

## Verification Criteria
- [ ] Running `npm run start` (or equivalent dev server) in frontend displays a full-screen Leaflet map.
- [ ] Typing in the "Current Location" input yields autocomplete suggestions from Photon.
- [ ] The `backend/requirements.txt` and `frontend/package.json` contain the new required libraries.
- [ ] Sending a POST to `/api/routes/calculate/` through the backend proxy correctly responds with OpenRouteService JSON.
- [ ] The frontend dynamically fits bounds around the calculated route and draws a solid polyline.
