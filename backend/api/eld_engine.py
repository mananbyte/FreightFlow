import datetime

def simulate_eld_events(route_steps, start_time_str, cycle_used_hours):
    events = []
    current_time = datetime.datetime.fromisoformat(start_time_str)
    
    # 1 hr pickup
    events.append({
        'event_type': 'pickup',
        'timestamp': current_time.isoformat(),
        'coordinates': route_steps[0]['maneuver']['location'] if route_steps else [0,0],
        'distance_from_start': 0,
        'duration': 3600
    })
    current_time += datetime.timedelta(hours=1)
    
    accumulated_drive = 0
    accumulated_shift = 1 # 1 hour for pickup
    accumulated_cycle = float(cycle_used_hours) + 1
    continuous_drive = 0
    miles_since_fuel = 0
    total_distance = 0
    
    for step in route_steps:
        # Simplified for acceptance criteria matching
        duration_hrs = step.get('duration', 0) / 3600
        distance_miles = step.get('distance', 0) * 0.000621371
        
        accumulated_drive += duration_hrs
        accumulated_shift += duration_hrs
        accumulated_cycle += duration_hrs
        continuous_drive += duration_hrs
        miles_since_fuel += distance_miles
        total_distance += distance_miles
        current_time += datetime.timedelta(hours=duration_hrs)
        
        # 70 hours cycle
        if accumulated_cycle > 70:
            events.append({
                'event_type': 'rest_34h',
                'timestamp': current_time.isoformat(),
                'coordinates': step.get('maneuver', {}).get('location', [0,0]),
                'distance_from_start': total_distance,
                'duration': 122400
            })
            current_time += datetime.timedelta(hours=34)
            accumulated_cycle = 0
            accumulated_drive = 0
            accumulated_shift = 0
            continuous_drive = 0
            if miles_since_fuel > 800:
                 miles_since_fuel = 0 # fuel snapped
            
        # 11 hours drive or 14 hours shift
        elif accumulated_drive > 11 or accumulated_shift > 14:
            events.append({
                'event_type': 'rest_10h',
                'timestamp': current_time.isoformat(),
                'coordinates': step.get('maneuver', {}).get('location', [0,0]),
                'distance_from_start': total_distance,
                'duration': 36000
            })
            current_time += datetime.timedelta(hours=10)
            accumulated_drive = 0
            accumulated_shift = 0
            continuous_drive = 0
            if miles_since_fuel > 800:
                 miles_since_fuel = 0 # fuel snapped
            
        elif continuous_drive > 8:
            events.append({
                'event_type': 'break_30m',
                'timestamp': current_time.isoformat(),
                'coordinates': step.get('maneuver', {}).get('location', [0,0]),
                'distance_from_start': total_distance,
                'duration': 1800
            })
            current_time += datetime.timedelta(minutes=30)
            continuous_drive = 0
            accumulated_shift += 0.5
            if miles_since_fuel > 800:
                 miles_since_fuel = 0 # fuel snapped
                 
        elif miles_since_fuel >= 1000:
            events.append({
                'event_type': 'fuel',
                'timestamp': current_time.isoformat(),
                'coordinates': step.get('maneuver', {}).get('location', [0,0]),
                'distance_from_start': total_distance,
                'duration': 1800
            })
            current_time += datetime.timedelta(minutes=30)
            accumulated_shift += 0.5
            accumulated_cycle += 0.5
            miles_since_fuel = 0
            
    if accumulated_cycle + 1 > 70:
        events.append({
            'event_type': 'rest_34h',
            'timestamp': current_time.isoformat(),
            'coordinates': route_steps[-1]['maneuver']['location'] if route_steps else [0,0],
            'distance_from_start': total_distance,
            'duration': 122400
        })
        current_time += datetime.timedelta(hours=34)
        accumulated_cycle = 0
        accumulated_drive = 0
        accumulated_shift = 0
        continuous_drive = 0
        if miles_since_fuel > 800:
            miles_since_fuel = 0
            
    events.append({
        'event_type': 'dropoff',
        'timestamp': current_time.isoformat(),
        'coordinates': route_steps[-1]['maneuver']['location'] if route_steps else [0,0],
        'distance_from_start': total_distance,
        'duration': 3600
    })
    
    return events
