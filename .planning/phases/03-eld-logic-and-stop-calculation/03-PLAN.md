---
wave: 1
depends_on: []
files_modified:
  - frontend/src/components/FloatingPanel.jsx
  - frontend/src/pages/Dashboard.jsx
  - backend/api/views.py
  - backend/api/eld_engine.py
  - frontend/src/components/MapComponent.jsx
autonomous: true
---

# Phase 3: ELD Logic and Stop Calculation

## Goal
Implement the logic to calculate driving hours, rests, and fueling stops based on the 70hr/8day rule. Return a chronologically ordered list of events to the frontend and correctly render them as markers on the map.

## Must Haves
- The `FloatingPanel` accepts a `start_time` datetime input.
- The `calculate_route` backend endpoint requests step-level annotations from OpenRouteService.
- The state machine implements the 70hr/8day HoS rules (11h drive, 14h shift, 30m break, 10h rest, pickup/drop-off time).
- Fuel stops are inserted every 1,000 miles, utilizing "lookahead" logic to snap them to upcoming rest breaks when possible.
- The backend API response structure is explicitly `{ "events": [...], "routeGeoJSON": {...} }`.
- The frontend parses the updated JSON response and plots event markers alongside the route.

## Tasks

### Wave 1: Input Updates and Proxy Modifications

<task>
<action>
Update `FloatingPanel` to include `startTime`.
1. Add an `<input type="datetime-local" />` field to `frontend/src/components/FloatingPanel.jsx` with state tracking `startTime`.
2. Ensure the "Calculate Route" button's emission includes `startTime` alongside `current`, `pickup`, `dropoff`, and `cycleHours`.
</action>
<read_first>
- frontend/src/components/FloatingPanel.jsx
</read_first>
<acceptance_criteria>
- `frontend/src/components/FloatingPanel.jsx` contains `type="datetime-local"`
- `frontend/src/components/FloatingPanel.jsx` component state includes `startTime` and passes it on submit
</acceptance_criteria>
</task>

<task>
<action>
Update `Dashboard` API payload to include HoS initialization inputs.
1. In `frontend/src/pages/Dashboard.jsx`, update the POST payload to `/api/routes/calculate/` to include `start_time: startTime` and `current_cycle_used: cycleHours`.
</action>
<read_first>
- frontend/src/pages/Dashboard.jsx
</read_first>
<acceptance_criteria>
- `frontend/src/pages/Dashboard.jsx` source code contains `start_time:` or `"start_time":` within the API POST body
- `frontend/src/pages/Dashboard.jsx` source code contains `current_cycle_used:` or `"current_cycle_used":` within the API POST body
</acceptance_criteria>
</task>

<task>
<action>
Update backend `calculate_route` ORS proxy to retrieve step annotations.
1. In `backend/api/views.py`, extract `start_time` and `current_cycle_used` from `request.data`. Default `start_time` to current time if missing.
2. Modify the JSON payload sent to `api.openrouteservice.org` to include `"instructions": True` and `"geometry_simplify": False`. (ORS returns segments in the `features[0].properties.segments[0].steps` array).
</action>
<read_first>
- backend/api/views.py
</read_first>
<acceptance_criteria>
- `backend/api/views.py` contains `request.data.get('start_time')`
- `backend/api/views.py` modifies the outbound ORS payload to include `"instructions": True` or `"annotations"`
</acceptance_criteria>
</task>

### Wave 2: State Machine & Event Engine

<task>
<action>
Create the ELD simulation engine to process route steps and enforce HoS rules.
1. Create `backend/api/eld_engine.py`.
2. Define a function `simulate_eld_events(route_steps, start_time_str, cycle_used_hours)` that iterates over the ORS steps.
3. Initialize states: `accumulated_drive = 0`, `accumulated_shift = 0`, `miles_since_fuel = 0`.
4. Iterate over route steps, advancing time by `step['duration']` and distance by `step['distance']` (converted to miles).
5. If `accumulated_drive` > 11 hours or `accumulated_shift` > 14 hours, emit a `rest_10h` event, add 10 hours to `current_time`, and reset shift/drive clocks.
6. If continuous drive > 8 hours, emit a `break_30m` event, add 30 mins, and reset continuous drive clock.
7. Implement lookahead logic: When `miles_since_fuel > 800`, if a 10h rest or 30m break will be triggered within the next 200 miles, merge a `fuel` event with it. Otherwise, at 1000 miles, emit a standalone `fuel` event (taking 30 mins) and reset fuel distance to 0.
8. Return a chronologically sorted list of dictionaries with keys: `event_type`, `timestamp`, `coordinates`, `distance_from_start`, `duration`. Include `pickup` (1h) at start and `dropoff` (1h) at end.
</action>
<read_first>
- backend/api/views.py
- backend/api/eld_engine.py
</read_first>
<acceptance_criteria>
- `backend/api/eld_engine.py` contains `def simulate_eld_events(`
- `backend/api/eld_engine.py` contains logic handling `11` hours drive and `14` hours shift
- `backend/api/eld_engine.py` contains logic for `1000` miles fuel snapping
</acceptance_criteria>
</task>

### Wave 3: Integration and Frontend Plotting

<task>
<action>
Integrate the ELD engine into the route calculation endpoint.
1. In `backend/api/views.py`, import `simulate_eld_events` from `eld_engine.py`.
2. After fetching the route from ORS, extract the steps array (typically `ors_data['features'][0]['properties']['segments'][0]['steps']`).
3. Call `simulate_eld_events` using the extracted steps, `start_time`, and `current_cycle_used`.
4. Return a structured JSON response: `{ "events": events_list, "routeGeoJSON": ors_data }`.
</action>
<read_first>
- backend/api/views.py
- backend/api/eld_engine.py
</read_first>
<acceptance_criteria>
- `backend/api/views.py` contains `from .eld_engine import simulate_eld_events`
- `backend/api/views.py` returns a dictionary with explicit `"events"` and `"routeGeoJSON"` keys
</acceptance_criteria>
</task>

<task>
<action>
Update frontend to parse the new payload and map event markers.
1. In `frontend/src/pages/Dashboard.jsx`, update the `routeData` state logic to pass `data.routeGeoJSON` to the `MapComponent`'s `routeGeoJSON` prop, and pass `data.events` to an `events` prop.
2. In `frontend/src/components/MapComponent.jsx`, map over the `events` prop. Render a Leaflet `<Marker>` with a `<Popup>` for each event that has valid `coordinates` (skip if `coordinates` is null). The Popup should display the `event_type` and formatted `timestamp`.
</action>
<read_first>
- frontend/src/pages/Dashboard.jsx
- frontend/src/components/MapComponent.jsx
</read_first>
<acceptance_criteria>
- `frontend/src/pages/Dashboard.jsx` accesses `.routeGeoJSON` from the backend response
- `frontend/src/components/MapComponent.jsx` uses `.map(` on the events array to render `<Marker>` components
</acceptance_criteria>
</task>

## Verification Criteria
- [ ] Submitting the trip form correctly posts `start_time` and `current_cycle_used` to `/api/routes/calculate/`.
- [ ] The backend returns an object with `events` and `routeGeoJSON`.
- [ ] The `events` array contains the chronologically ordered events, respecting the 70hr/8day HoS rules and 1,000-mile fuel stops.
- [ ] The Leaflet map correctly overlays markers along the route for rests and fueling stops.
