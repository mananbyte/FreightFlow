---
wave: 1
depends_on: []
files_modified:
  - backend/api/eld_engine.py
autonomous: true
---

# Phase 03 - Gap Closure: ELD 70hr Cycle Logic

## Verification Criteria
- `eld_engine.py` implements the 70-hour cycle limit logic using `cycle_used_hours`.
- When the 70-hour cycle limit is reached, a 34-hour reset event (`rest_34h`) is generated to reset the cycle.

## must_haves
- [ ] Enforce the 70-hour on-duty cycle limit.
- [ ] Reset the cycle after a 34-hour rest period.

<task>
  <read_first>
    - backend/api/eld_engine.py
  </read_first>
  <action>
    Update `simulate_eld_events` in `backend/api/eld_engine.py` to enforce the 70hr/8day cycle limit.
    Initialize a variable `accumulated_cycle` with `float(cycle_used_hours) + 1` (accounting for the 1 hour pickup).
    During the simulation loop, increment `accumulated_cycle` by `duration_hrs` (along with `accumulated_shift`) for driving time.
    Additionally, whenever a fueling event (`event_type: 'fuel'`) occurs, increment `accumulated_cycle` by `0.5` hours, as this counts as ON-DUTY time.
    Add a condition to check if the accumulated cycle exceeds the 70-hour cycle limit (`if accumulated_cycle > 70:`).
    **CRITICAL**: This 70-hour check MUST be placed as the **first `if` statement** in the rule-checking chain, *before* the 11-hour driving or 14-hour shift limit checks, to prevent overlapping rules and ensure the 34-hour reset evaluates correctly before shift variables are reset.
    If the cycle limit is exceeded:
    - Append an event with `event_type`: `'rest_34h'`, `duration`: `122400` (34 hours in seconds), including the `timestamp`, `coordinates`, and `distance_from_start` fields.
    - Increment `current_time` by 34 hours.
    - Reset `accumulated_cycle = 0`, `accumulated_drive = 0`, `accumulated_shift = 0`, `continuous_drive = 0`.
    - If `miles_since_fuel > 800`, snap it by setting `miles_since_fuel = 0`.
    Finally, at the end of the simulation, check if adding the 1-hour dropoff would exceed the 70-hour limit (`if accumulated_cycle + 1 > 70:`). If so, append a 34-hour reset event and update `current_time` accordingly before appending the final `dropoff` event.
  </action>
  <acceptance_criteria>
    - `backend/api/eld_engine.py` contains logic that checks if the accumulated cycle hours exceed 70.
    - The engine inserts a `rest_34h` event and resets the cycle counters when the 70-hour limit is reached.
  </acceptance_criteria>
</task>
