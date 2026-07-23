# Phase 3: ELD Logic and Stop Calculation - Research

## Core Requirements & HOS Rules to Model
Based on `REQUIREMENTS.md` and industry standards (70hr/8day cycle):
- **Driving Limits**: 11-hour driving limit, 14-hour on-duty window.
- **Breaks**: 30-minute break required after 8 cumulative hours of driving.
- **Rest**: 10-hour sleeper berth/off-duty required after 11 hours of driving or 14 hours on-duty.
- **Cycle**: 70 hours in 8 days. (Current cycle used will be provided via input).
- **Tasks**: 1 hour on-duty (not driving) for pickup, 1 hour for drop-off.
- **Fueling**: 1 fuel stop required at least every 1,000 miles.

## What Do I Need to Know to Plan This Phase Well?

### 1. OSRM API Enhancements
Currently, `backend/api/views.py` calls OSRM with `overview=full&geometries=geojson`, which only provides a single total duration/distance and a massive coordinate array. 
**To Plan:** The OSRM request must be updated to include `annotations=true` (and/or `steps=true`) to retrieve segment-level `distance` and `duration`. This is strictly necessary to calculate exactly where the truck is (coordinates) when an HOS clock expires or a fuel threshold is met.

### 2. State Machine & Event Simulation (D-01)
**To Plan:** The algorithm will require a state machine that iterates over the OSRM coordinates/segments. 
It must track:
- `accumulated_drive_time`, `accumulated_on_duty_time`, `cycle_time`
- `miles_since_last_fuel`
- `current_timestamp` (initialized from the user-selected trip start time).

When iterating through segments, if adding a segment exceeds a threshold (e.g., 8 hours drive time), the algorithm must:
1. Interpolate the exact coordinate mid-segment where the event occurs.
2. Generate the event (e.g., `break_30m`).
3. Advance the timestamp by the event duration (e.g., 30 mins).
4. Reset the respective HOS clocks and continue.

### 3. Fuel Stop Snapping (Lookahead Logic - D-03)
**To Plan:** Implementing the "merge with rest" logic requires a lookahead capability. As `miles_since_last_fuel` approaches 1,000 miles, the engine should check the HOS clocks. 
- If a 30m break or 10h rest is upcoming (e.g., within the next 100-200 miles or 1-3 hours), delay the fuel stop and merge it with the rest event. 
- If no rest is upcoming before exceeding the 1,000-mile mark, a standalone `fuel` event must be inserted.

### 4. Input Changes (D-02)
**To Plan:** The `calculate_route` endpoint in Django must be updated to parse and accept:
- `start_time` (Datetime)
- `current_cycle_used` (Hours)
These will be critical for initializing the state machine. Python's `datetime` and `timedelta` will handle the chronological timeline.

### 5. Standardized Data Structure for Output
**To Plan:** The backend response must evolve from a simple GeoJSON object to a comprehensive payload containing:
1. **Events Array**: A strictly ordered, chronological list of events (`pickup`, `driving`, `break_30m`, `rest_10h`, `fuel`, `dropoff`). Each event needs:
   - `event_type`
   - `timestamp` (ISO8601)
   - `coordinates` [lon, lat]
   - `distance_from_start`
   - `duration`
2. **Segmented Geometry**: (Optional but helpful for Phase 4 visualization) The frontend will need to render the route and plot the event markers. The geometry can either remain as one continuous LineString, letting the frontend plot markers using the event coordinates, or be split into segments.

## Conclusion
To successfully write the Technical Plan for Phase 3, you must focus on the data transformations inside `api/views.py`. The plan should detail the specific structure of the simulation loop, the HOS clock tracking variables, the exact parameters for the OSRM request, and the shape of the new JSON response payload.
