# Phase 2: Route Calculation and Map API Integration - Context

**Gathered:** 2026-07-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Accept user inputs for a trip (Current Location, Pickup, Dropoff, Current Cycle), interact with OpenRouteService to calculate the route, and visualize the path and markers on a map using React-Leaflet.

</domain>

<decisions>
## Implementation Decisions

### Form Input Flow
- **D-01:** Full-screen map with a floating side panel for inputs (modern, immersive app feel).

### Location Autocomplete
- **D-02:** Integrate an autocomplete service (like Nominatim/Photon) to resolve addresses to coordinates seamlessly.

### Route Visualization
- **D-03:** Solid line for the entire route with distinct map markers (easier to implement now).

### the agent's Discretion
- Specifics of how the API keys are injected/stored (though environment variables will be used).
- Granularity of error states in the UI if the routing API fails.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The Axios `client` (`frontend/src/api/client.js`) is already configured.

### Established Patterns
- Vanilla CSS styling strategy (from Phase 1).

### Integration Points
- Frontend `Dashboard.jsx` will house the new map and floating panel components.

</code_context>

<specifics>
## Specific Ideas

- Map needs to consume coordinates resolved by Nominatim to fetch the polyline from OpenRouteService.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-route-calculation-and-map-api-integration*
*Context gathered: 2026-07-23*
