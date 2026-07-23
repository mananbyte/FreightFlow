# Phase 3: ELD Logic and Stop Calculation - Context

**Gathered:** 2026-07-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Backend processing to split the route based on HOS rules and truck constraints, calculating driving hours, rests, and fueling stops based on the 70hr/8day rule, and returning chronologically ordered events.

</domain>

<decisions>
## Implementation Decisions

### Data Structure for Events
- **D-01:** The backend will return a highly optimized chronological list of events (timestamps, coordinates, event type, distance, duration). The data structure will be explicitly designed using strong DSA principles to efficiently cover all HoS constraints and easily support visualization in Phase 4.

### Trip Start Time
- **D-02:** Assume the trip starts "Now" (at the time the calculation is made). This simplifies the UI by not requiring a DateTime picker.

### Fuel Stop Logic
- **D-03:** "Merge with rest" approach. The system will aim to insert fuel stops near the 1,000-mile mark but will dynamically snap them to coincide with the nearest mandatory 30-minute break or 10-hour sleeper berth period to simulate realistic, optimized truck routing.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The OSRM backend route logic in `views.py` provides the raw distance and geometry which will be fed into the ELD calculation algorithm.

### Established Patterns
- Python backend routing logic separated cleanly from the frontend view.

### Integration Points
- Backend `api/views.py` `calculate_route` needs to transform the raw OSRM path into the ELD-segmented event list.

</code_context>

<specifics>
## Specific Ideas

- The fuel stop optimization requires looking ahead in the route calculation to check if a break is upcoming before forcing a standalone fuel stop.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-eld-logic-and-stop-calculation*
*Context gathered: 2026-07-23*
