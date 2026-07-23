---
wave: 1
depends_on:
  - 3
files_modified:
  - backend/api/eld_formatter.py
  - backend/api/views.py
  - frontend/src/pages/Dashboard.jsx
  - frontend/src/components/FloatingPanel.jsx
  - frontend/src/pages/DriverLog.jsx
  - frontend/src/pages/DriverLog.css
  - frontend/src/components/ELDLogSheet.jsx
  - frontend/src/components/ELDLogSheet.css
autonomous: true
---

# Phase 04 - ELD Log Sheet Visualization

## Verification Criteria
- A route can be calculated and the backend responds with a `dailyLogs` array containing continuous, midnight-sliced intervals.
- The `FloatingPanel` shows a "Draw Log Sheet" CTA which redirects to the `/log` route with state.
- The `/log` route displays a tabbed UI for multiple days.
- The `ELDLogSheet` component renders an accurate SVG graph matching the standard 4-status grid and applies correct colors based on event types.

## must_haves
- [ ] Backend groups ELD events by Day (midnight to midnight).
- [ ] Backend fills "driving" gaps and pads "off_duty" gaps so every day is a full 24-hour sequence of intervals.
- [ ] "Draw Log Sheet" button navigates to the Driver Log page.
- [ ] Driver Log page renders tabs for each day.
- [ ] Driver Log page renders an SVG grid and continuous graph for the log sheet.
- [ ] Apply event-specific colors to the SVG lines (e.g., `#10B981` for pickup).

<task>
  <read_first>
    - backend/api/views.py
    - backend/api/eld_engine.py
  </read_first>
  <action>
    Create `backend/api/eld_formatter.py` with a function `generate_daily_logs(events, start_time_str)`.
    Parse `start_time_str` using `datetime.fromisoformat` to determine the start of the first day (00:00:00).
    Build a continuous sequence of intervals:
    - Start with an interval from 00:00:00 to the `start_time_str` with `status="off_duty"`, `event_type="off_duty"`.
    - Iterate over `events`. If there is a time gap between the end of the previous interval and the event's `timestamp`, fill it with an interval `status="driving"`, `event_type="driving"`.
    - Add the event itself as an interval. Map its `duration` (in seconds) to find its end time. Map its `event_type` to a `status`: 'pickup', 'dropoff', 'fuel' map to 'on_duty'; 'break_30m', 'rest_34h' map to 'off_duty'; 'rest_10h' maps to 'sleeper_berth'. Include the original `event_type` in the interval object.
    - After the last event, pad the remaining time until the end of that final day (23:59:59) with `status="off_duty"`, `event_type="off_duty"`.
    Iterate through all generated intervals and slice any interval that crosses midnight (00:00:00) into two intervals exactly at midnight.
    Group the intervals by their date (YYYY-MM-DD format) into an array of day objects: `[{"date": "YYYY-MM-DD", "intervals": [...]}]`.
    Update `backend/api/views.py` `RouteCalculateView.post`: Import `generate_daily_logs` from `.eld_formatter`, call it with `events_list` and `start_time`, and add the result to the JSON response as the key `dailyLogs`.
  </action>
  <acceptance_criteria>
    - `backend/api/eld_formatter.py` exists and exports `generate_daily_logs`.
    - `generate_daily_logs` correctly inserts "driving" gaps, pads "off_duty" to fill 24-hour days, and splits intervals at midnight.
    - The `/api/routes/calculate/` endpoint response JSON includes a `dailyLogs` array with `date` and `intervals`.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - frontend/src/components/FloatingPanel.jsx
    - frontend/src/pages/Dashboard.jsx
    - .planning/phases/04-eld-log-sheet-visualization/04-UI-SPEC.md
  </read_first>
  <action>
    Update `frontend/src/pages/Dashboard.jsx` to store `dailyLogs` from the API response in its `routeData` state. Pass this `dailyLogs` to `FloatingPanel`.
    Update `frontend/src/components/FloatingPanel.jsx` to accept the `dailyLogs` prop.
    Add a new button below the "Calculate Route" button with the text "Draw Log Sheet".
    This button must only be rendered (or enabled) if `dailyLogs` exists and has a length > 0.
    When clicked, use React Router's `useNavigate` hook to navigate to `/log`, passing the `dailyLogs` array via the router state (`{ state: { dailyLogs } }`).
    Apply styles in `FloatingPanel.css` for the new button using the primary accent color `#4F46E5`.
  </action>
  <acceptance_criteria>
    - `Dashboard.jsx` state includes `dailyLogs` and passes it to `FloatingPanel`.
    - `FloatingPanel.jsx` renders a "Draw Log Sheet" CTA when `dailyLogs` are present.
    - Clicking the CTA invokes `navigate` to `/log` with the `dailyLogs` in the location state.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - frontend/src/pages/DriverLog.jsx
    - .planning/phases/04-eld-log-sheet-visualization/04-UI-SPEC.md
  </read_first>
  <action>
    Update `frontend/src/pages/DriverLog.jsx` to act as the `ELDLogViewer`.
    Retrieve `dailyLogs` using `useLocation().state?.dailyLogs`.
    If `dailyLogs` is missing or empty, render the empty state specified in `04-UI-SPEC.md`: a heading "No Route Calculated" and body "Please calculate a route to view the ELD log sheet.", along with a `<Link>` back to the Dashboard.
    If `dailyLogs` exists, implement a tabbed navigation UI to switch between the days (e.g., tabs labeled by `date`).
    Maintain the selected day index in local component state.
    Render a placeholder for the `<ELDLogSheet />` component (to be created in the next task), passing the selected day's data as a prop.
    Create `frontend/src/pages/DriverLog.css` and apply custom CSS matching the glassmorphic aesthetics and typography from `04-UI-SPEC.md`.
  </action>
  <acceptance_criteria>
    - `DriverLog.jsx` displays the correct empty state text when no logs are provided in state.
    - `DriverLog.jsx` renders date tabs and conditionally displays the selected day when logs are provided.
    - Component correctly imports and uses `useLocation` from `react-router-dom`.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - frontend/src/pages/DriverLog.jsx
    - .planning/phases/04-eld-log-sheet-visualization/04-UI-SPEC.md
  </read_first>
  <action>
    Create `frontend/src/components/ELDLogSheet.jsx` and `ELDLogSheet.css`.
    This component accepts a `day` prop containing `date` and `intervals`.
    Render an SVG element representing a 24-hour grid. Set the SVG background to the secondary color `rgba(255, 255, 255, 0.85)` (Glassmorphic).
    Draw 4 horizontal grid lines and labels for the statuses: Off Duty, Sleeper Berth, Driving, On Duty.
    Draw vertical grid lines for each of the 24 hours.
    Iterate through `day.intervals` and draw SVG `<line>` elements representing each interval. The Y-coordinate maps to the interval's `status` row. The X-coordinates calculate linearly based on the time elapsed from 00:00:00 of that day.
    Draw vertical `<line>` elements connecting consecutive intervals that have different statuses.
    Apply the event colors specified in `04-UI-SPEC.md` to the line segments based on the interval's `event_type` (Pickup: `#10B981`, Dropoff: `#EF4444`, Fuel: `#F59E0B`, Break 30m: `#FBBF24`, Rest 10h: `#3B82F6`, Rest 34h: `#8B5CF6`). For 'driving' or 'off_duty' use `#111827` or `#4F46E5`.
    Update `DriverLog.jsx` to import and render `<ELDLogSheet day={dailyLogs[selectedIndex]} />`.
  </action>
  <acceptance_criteria>
    - `ELDLogSheet.jsx` renders an SVG with horizontal lines for the 4 statuses and vertical lines for 24 hours.
    - `<line>` elements correctly map to the respective status rows based on `day.intervals`.
    - Vertical lines are rendered to connect intervals when the status changes.
    - Line segments have stroke colors correctly mapped from `event_type`.
  </acceptance_criteria>
</task>
