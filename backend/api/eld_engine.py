import datetime

def simulate_eld_events(route_legs, start_time_str, cycle_used_hours):
    events = []
    current_time = datetime.datetime.fromisoformat(start_time_str)
    
    # Starting location (Current)
    events.append({
        'event_type': 'current_location',
        'timestamp': current_time.isoformat(),
        'coordinates': route_legs[0]['steps'][0]['maneuver']['location'] if route_legs and route_legs[0]['steps'] else [0,0],
        'distance_from_start': 0,
        'duration': 0
    })
    
    # HOS Tracking Variables
    accumulated_cycle = float(cycle_used_hours)
    
    # Split sleeper tracking
    drive_since_last_rest = 0
    drive_before_last_rest = 0
    shift_since_last_rest = 0
    shift_before_last_rest = 0
    last_rest_duration = 0 # Can be 2, 8, or 10
    
    continuous_drive = 0
    miles_since_fuel = 0
    total_distance = 0
    
    for leg_idx, leg in enumerate(route_legs):
        for step in leg['steps']:
            duration_hrs = step.get('duration', 0) / 3600
            distance_miles = step.get('distance', 0) * 0.000621371
            
            while duration_hrs > 0:
                speed = distance_miles / duration_hrs if duration_hrs > 0 else 0
                
                # Calculate available limits
                total_drive = drive_before_last_rest + drive_since_last_rest
                total_shift = shift_before_last_rest + shift_since_last_rest
                
                time_to_drive_limit = 11 - total_drive
                time_to_shift_limit = 14 - total_shift
                time_to_cycle_limit = 70 - accumulated_cycle
                time_to_break_limit = 8 - continuous_drive
                
                # Approximate fuel range
                safe_speed = speed if speed > 0 else 60
                time_to_fuel = (1000 - miles_since_fuel) / safe_speed
                
                allowed_time = min(
                    duration_hrs,
                    max(0, time_to_drive_limit),
                    max(0, time_to_shift_limit),
                    max(0, time_to_cycle_limit),
                    max(0, time_to_break_limit),
                    max(0, time_to_fuel)
                )
                
                # If we hit a limit, trigger the appropriate event
                if allowed_time <= 0.0001:
                    coords = step.get('maneuver', {}).get('location', [0,0])
                    hit_limit = False
                    
                    if time_to_cycle_limit <= 0.0001:
                        hit_limit = True
                        # 34-hour restart
                        events.append({'event_type': 'rest_34h', 'timestamp': current_time.isoformat(), 'coordinates': coords, 'distance_from_start': total_distance, 'duration': 122400})
                        current_time += datetime.timedelta(hours=34)
                        accumulated_cycle = 0
                        drive_since_last_rest = 0
                        drive_before_last_rest = 0
                        shift_since_last_rest = 0
                        shift_before_last_rest = 0
                        last_rest_duration = 10
                        continuous_drive = 0
                    
                    elif time_to_drive_limit <= 0.0001 or time_to_shift_limit <= 0.0001:
                        hit_limit = True
                        # We hit the 11/14 hr wall. We can use Split Sleeper!
                        # If our last rest was 2h, we must take 8h. If our last rest was 8h, we must take 2h.
                        if last_rest_duration == 8:
                            rest_time = 2
                            e_type = 'rest_2h'
                        elif last_rest_duration == 2:
                            rest_time = 8
                            e_type = 'rest_8h'
                        else:
                            # Default to taking a 10h rest if we haven't split yet
                            rest_time = 8
                            e_type = 'rest_8h'
                            
                        events.append({'event_type': e_type, 'timestamp': current_time.isoformat(), 'coordinates': coords, 'distance_from_start': total_distance, 'duration': rest_time * 3600})
                        current_time += datetime.timedelta(hours=rest_time)
                        
                        # Apply split sleeper math
                        drive_before_last_rest = drive_since_last_rest
                        drive_since_last_rest = 0
                        
                        # Only the 8h break pauses the 14h shift clock. The 2h break does NOT pause it, but it pairs with an 8h break.
                        if rest_time == 8:
                            shift_before_last_rest = shift_since_last_rest
                            shift_since_last_rest = 0
                        elif rest_time == 2:
                            shift_before_last_rest = shift_since_last_rest
                            shift_since_last_rest = 0
                            
                        last_rest_duration = rest_time
                        continuous_drive = 0
                        
                    elif time_to_break_limit <= 0.0001:
                        hit_limit = True
                        # Instead of a 30m break, if we take a 2h break, it starts a split-sleeper!
                        # Let's take a 2h break to satisfy the 30m requirement AND start a split.
                        if last_rest_duration != 2:
                            events.append({'event_type': 'rest_2h', 'timestamp': current_time.isoformat(), 'coordinates': coords, 'distance_from_start': total_distance, 'duration': 7200})
                            current_time += datetime.timedelta(hours=2)
                            
                            drive_before_last_rest = drive_since_last_rest
                            drive_since_last_rest = 0
                            shift_before_last_rest = shift_since_last_rest
                            shift_since_last_rest = 0
                            
                            last_rest_duration = 2
                            accumulated_cycle += 2
                        else:
                            # Fallback to 30m break
                            events.append({'event_type': 'break_30m', 'timestamp': current_time.isoformat(), 'coordinates': coords, 'distance_from_start': total_distance, 'duration': 1800})
                            current_time += datetime.timedelta(minutes=30)
                            shift_since_last_rest += 0.5
                            accumulated_cycle += 0.5
                            
                        continuous_drive = 0
                        
                    elif time_to_fuel <= 0.0001:
                        hit_limit = True
                        events.append({'event_type': 'fuel', 'timestamp': current_time.isoformat(), 'coordinates': coords, 'distance_from_start': total_distance, 'duration': 1800})
                        current_time += datetime.timedelta(minutes=30)
                        shift_since_last_rest += 0.5
                        accumulated_cycle += 0.5
                        miles_since_fuel = 0
                        continuous_drive = 0 # Fueling satisfies the 30-min break
                        
                    if hit_limit:
                        continue # Loop again to process the remaining duration_hrs
                    
                # Drive for allowed_time
                drive_since_last_rest += allowed_time
                shift_since_last_rest += allowed_time
                accumulated_cycle += allowed_time
                continuous_drive += allowed_time
                
                driven_miles = allowed_time * speed
                miles_since_fuel += driven_miles
                total_distance += driven_miles
                current_time += datetime.timedelta(hours=allowed_time)
                
                duration_hrs -= allowed_time
                distance_miles -= driven_miles
        
        # After completing the leg
        if leg_idx == 0:
            # We reached the Pickup Location!
            events.append({
                'event_type': 'pickup',
                'timestamp': current_time.isoformat(),
                'coordinates': leg['steps'][-1]['maneuver']['location'] if leg['steps'] else [0,0],
                'distance_from_start': total_distance,
                'duration': 3600 # 1 hour for pickup
            })
            current_time += datetime.timedelta(hours=1)
            shift_since_last_rest += 1
            accumulated_cycle += 1
            continuous_drive = 0 # On-duty not driving satisfies 30m break rules too, though not an actual break. Actually FMCSA says on-duty not driving can satisfy the 30m break requirement if it lasts 30 minutes! Since pickup is 1 hour, it completely resets the 8-hour driving clock.
            
    # Final check for cycle limit before dropoff
    if accumulated_cycle + 1 > 70:
        events.append({'event_type': 'rest_34h', 'timestamp': current_time.isoformat(), 'coordinates': route_legs[-1]['steps'][-1]['maneuver']['location'] if route_legs and route_legs[-1]['steps'] else [0,0], 'distance_from_start': total_distance, 'duration': 122400})
        current_time += datetime.timedelta(hours=34)
        
    events.append({
        'event_type': 'dropoff',
        'timestamp': current_time.isoformat(),
        'coordinates': route_legs[-1]['steps'][-1]['maneuver']['location'] if route_legs and route_legs[-1]['steps'] else [0,0],
        'distance_from_start': total_distance,
        'duration': 3600
    })
    
    return events
