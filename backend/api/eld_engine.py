import datetime

def simulate_eld_events(route_legs, start_time_str, cycle_used_hours, cycle_limit=70):
    """
    Simulate FMCSA-compliant ELD events for a given OSRM route.

    HOS Rules implemented (per FMCSR §395 / 2022 Drivers Guide):
      - 11-Hour Driving Limit              (§395.3(a)(3))
      - 14-Hour Driving Window             (§395.3(a)(2))
      - 30-Minute Break after 8 cumul.hrs  (§395.3(a)(3)(ii))
      - 60/70-Hour Cycle Limit             (§395.3(b))
      - 34-Hour Cycle Restart              (§395.3(c))
      - Sleeper Berth 10h/8h+2h Split      (§395.1(g))
      - Pre/Post Trip Inspections           (FMCSR Part 396.11/13)
      - Fuel stop every ~1000 miles         (Operational)
    """
    events = []
    current_time = datetime.datetime.fromisoformat(start_time_str)
    first_coords = route_legs[0]['steps'][0]['maneuver']['location'] if route_legs and route_legs[0]['steps'] else [0, 0]

    # ── Starting position marker ────────────────────────────────────────────────
    events.append({
        'event_type': 'current_location',
        'timestamp': current_time.isoformat(),
        'coordinates': first_coords,
        'distance_from_start': 0,
        'duration': 0
    })

    # ── Mandatory Pre-Trip Inspection (15 min On-Duty Not Driving) ─────────────
    events.append({
        'event_type': 'pre_trip',
        'timestamp': current_time.isoformat(),
        'coordinates': first_coords,
        'distance_from_start': 0,
        'duration': 900
    })
    current_time += datetime.timedelta(minutes=15)

    # ── HOS State Variables ─────────────────────────────────────────────────────
    # Cycle
    accumulated_cycle  = float(cycle_used_hours) + 0.25   # include pre-trip

    # 11-Hour driving counter (split sleeper aware)
    drive_since_rest   = 0.0
    drive_before_rest  = 0.0   # saved from the other half of a split pair

    # 14-Hour shift window counter (split sleeper aware)
    shift_since_rest   = 0.25  # pre-trip
    shift_before_rest  = 0.0

    # Split sleeper state: 0 = no split active, 2 = last rest was 2h, 8 = last was 8h
    split_state        = 0

    # 30-min break: cumulative DRIVING hours since last ≥30-min non-driving break
    # BUG FIX: this is separate from the 14-hr/11-hr clocks and only resets on a break event
    drive_since_break  = 0.0

    # Fuel
    miles_since_fuel   = 0.0
    total_distance     = 0.0

    def _add_break(coords, ts):
        """Log a 30-minute mandatory break. Returns updated time."""
        nonlocal shift_since_rest, accumulated_cycle, drive_since_break
        events.append({
            'event_type': 'break_30m',
            'timestamp': ts.isoformat(),
            'coordinates': coords,
            'distance_from_start': total_distance,
            'duration': 1800
        })
        ts += datetime.timedelta(minutes=30)
        shift_since_rest  += 0.5
        accumulated_cycle += 0.5
        drive_since_break  = 0.0   # ← break resets the 8-hr driving clock
        return ts

    def _add_rest(e_type, rest_hours, coords, ts):
        """Log a sleeper/rest event with pre/post trip inspections around long rests."""
        nonlocal shift_since_rest, shift_before_rest, drive_since_rest, drive_before_rest
        nonlocal accumulated_cycle, split_state, drive_since_break

        long_rest = e_type in ('rest_10h', 'rest_8h')

        if long_rest:
            events.append({'event_type': 'post_trip', 'timestamp': ts.isoformat(), 'coordinates': coords, 'distance_from_start': total_distance, 'duration': 900})
            ts += datetime.timedelta(minutes=15)
            shift_since_rest  += 0.25
            accumulated_cycle += 0.25

        events.append({'event_type': e_type, 'timestamp': ts.isoformat(), 'coordinates': coords, 'distance_from_start': total_distance, 'duration': int(rest_hours * 3600)})
        ts += datetime.timedelta(hours=rest_hours)

        if long_rest:
            events.append({'event_type': 'pre_trip', 'timestamp': ts.isoformat(), 'coordinates': coords, 'distance_from_start': total_distance, 'duration': 900})
            ts += datetime.timedelta(minutes=15)

        # ── Clock resets depending on rest type ─────────────────────────────────
        if e_type == 'rest_10h':
            # Full 10-hour reset: both 11h and 14h clocks restart completely
            drive_before_rest = 0.0
            drive_since_rest  = 0.0
            shift_before_rest = 0.0
            shift_since_rest  = 0.25   # only the new pre-trip
            accumulated_cycle += 0.25  # pre-trip after rest
            split_state        = 0
            drive_since_break  = 0.0

        elif e_type == 'rest_8h':
            # 8h of the 8+2 split — save current counters, reset since
            drive_before_rest = drive_since_rest
            drive_since_rest  = 0.0
            shift_before_rest = shift_since_rest
            shift_since_rest  = 0.25  # new pre-trip
            accumulated_cycle += 0.25
            split_state        = 8
            drive_since_break  = 0.0

        elif e_type == 'rest_2h':
            # 2h of the 8+2 split — save counters, 14-hr clock NOT paused
            drive_before_rest = drive_since_rest
            drive_since_rest  = 0.0
            shift_before_rest = shift_since_rest
            shift_since_rest  = 0.0
            split_state        = 2
            drive_since_break  = 0.0

        return ts

    # ── Main loop ───────────────────────────────────────────────────────────────
    for leg_idx, leg in enumerate(route_legs):
        for step in leg['steps']:
            duration_hrs   = step.get('duration', 0) / 3600.0
            distance_miles = step.get('distance', 0) * 0.000621371

            while duration_hrs > 1e-6:
                speed = distance_miles / duration_hrs if duration_hrs > 1e-6 else 60.0

                # Available time under each limit
                total_drive = drive_before_rest + drive_since_rest
                total_shift = shift_before_rest + shift_since_rest

                time_to_drive_limit  = max(0.0, 11.0 - total_drive)
                time_to_shift_limit  = max(0.0, 14.0 - total_shift)
                time_to_cycle_limit  = max(0.0, float(cycle_limit) - accumulated_cycle)
                time_to_break        = max(0.0, 8.0 - drive_since_break)   # BUG FIX: use drive_since_break
                time_to_fuel         = max(0.0, (1000.0 - miles_since_fuel) / (speed if speed > 0 else 60.0))

                allowed = min(duration_hrs, time_to_drive_limit, time_to_shift_limit,
                              time_to_cycle_limit, time_to_break, time_to_fuel)

                if allowed <= 1e-6:
                    coords = step.get('maneuver', {}).get('location', [0, 0])

                    # Priority 1: Cycle limit → 34-hr restart
                    if time_to_cycle_limit <= 1e-6:
                        events.append({'event_type': 'post_trip', 'timestamp': current_time.isoformat(), 'coordinates': coords, 'distance_from_start': total_distance, 'duration': 900})
                        current_time += datetime.timedelta(minutes=15)
                        events.append({'event_type': 'rest_34h', 'timestamp': current_time.isoformat(), 'coordinates': coords, 'distance_from_start': total_distance, 'duration': 122400})
                        current_time += datetime.timedelta(hours=34)
                        events.append({'event_type': 'pre_trip', 'timestamp': current_time.isoformat(), 'coordinates': coords, 'distance_from_start': total_distance, 'duration': 900})
                        current_time += datetime.timedelta(minutes=15)
                        # Full reset
                        accumulated_cycle = 0.25
                        drive_since_rest = drive_before_rest = 0.0
                        shift_since_rest = 0.25
                        shift_before_rest = 0.0
                        split_state = 0
                        drive_since_break = 0.0

                    # Priority 2: 11h drive or 14h shift limit → sleeper rest
                    elif time_to_drive_limit <= 1e-6 or time_to_shift_limit <= 1e-6:
                        # BUG FIX: split sleeper only continues if split_state is active
                        # Default is always 10h; split is an explicit pairing
                        if split_state == 8:
                            # Already took 8h, now take the paired 2h
                            current_time = _add_rest('rest_2h', 2, coords, current_time)
                        elif split_state == 2:
                            # Already took 2h, now take the paired 8h
                            current_time = _add_rest('rest_8h', 8, coords, current_time)
                        else:
                            # No active split — take standard 10h rest
                            current_time = _add_rest('rest_10h', 10, coords, current_time)

                    # Priority 3: 8-hour driving limit → mandatory 30-min break
                    elif time_to_break <= 1e-6:
                        current_time = _add_break(coords, current_time)

                    # Priority 4: Fuel stop
                    elif time_to_fuel <= 1e-6:
                        events.append({'event_type': 'fuel', 'timestamp': current_time.isoformat(), 'coordinates': coords, 'distance_from_start': total_distance, 'duration': 1800})
                        current_time     += datetime.timedelta(minutes=30)
                        shift_since_rest += 0.5
                        accumulated_cycle += 0.5
                        miles_since_fuel  = 0.0
                        # BUG FIX: fueling satisfies the 30-min break requirement
                        # (30 consecutive minutes of non-driving on-duty time)
                        drive_since_break = 0.0

                    continue  # recompute limits for remaining duration

                # Drive for allowed time
                drive_since_rest  += allowed
                drive_since_break += allowed
                shift_since_rest  += allowed
                accumulated_cycle += allowed

                driven_miles    = allowed * speed
                miles_since_fuel += driven_miles
                total_distance  += driven_miles
                current_time    += datetime.timedelta(hours=allowed)
                duration_hrs    -= allowed
                distance_miles  -= driven_miles

        # ── After each leg: mark pickup/dropoff ────────────────────────────────
        if leg_idx == 0:
            # Reached pickup — 1 hour on-duty loading
            events.append({
                'event_type': 'pickup',
                'timestamp': current_time.isoformat(),
                'coordinates': leg['steps'][-1]['maneuver']['location'] if leg['steps'] else [0, 0],
                'distance_from_start': total_distance,
                'duration': 3600
            })
            current_time      += datetime.timedelta(hours=1)
            shift_since_rest  += 1.0
            accumulated_cycle += 1.0
            # FMCSA §395.3(a)(3)(ii): on-duty not driving ≥30 min consecutive satisfies break
            drive_since_break  = 0.0

    # ── End of route ────────────────────────────────────────────────────────────
    last_coords = route_legs[-1]['steps'][-1]['maneuver']['location'] if route_legs and route_legs[-1]['steps'] else [0, 0]

    # Guard: if cycle is exhausted before we can complete dropoff
    if float(cycle_limit) - accumulated_cycle < 1.0:
        events.append({'event_type': 'post_trip', 'timestamp': current_time.isoformat(), 'coordinates': last_coords, 'distance_from_start': total_distance, 'duration': 900})
        current_time += datetime.timedelta(minutes=15)
        events.append({'event_type': 'rest_34h', 'timestamp': current_time.isoformat(), 'coordinates': last_coords, 'distance_from_start': total_distance, 'duration': 122400})
        current_time += datetime.timedelta(hours=34)
        events.append({'event_type': 'pre_trip', 'timestamp': current_time.isoformat(), 'coordinates': last_coords, 'distance_from_start': total_distance, 'duration': 900})
        current_time += datetime.timedelta(minutes=15)
        accumulated_cycle = 0.25

    events.append({
        'event_type': 'dropoff',
        'timestamp': current_time.isoformat(),
        'coordinates': last_coords,
        'distance_from_start': total_distance,
        'duration': 3600
    })
    current_time += datetime.timedelta(hours=1)

    events.append({
        'event_type': 'post_trip',
        'timestamp': current_time.isoformat(),
        'coordinates': last_coords,
        'distance_from_start': total_distance,
        'duration': 900
    })

    return events
