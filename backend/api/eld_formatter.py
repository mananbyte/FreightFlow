import datetime

def generate_daily_logs(events, start_time_str):
    if not events and not start_time_str:
        return []

    # Parse start time
    start_dt = datetime.datetime.fromisoformat(start_time_str)
    
    # Start of the first day
    day_start = start_dt.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Map event types to statuses
    status_map = {
        'current_location': 'on_duty',
        'pre_trip': 'on_duty',
        'post_trip': 'on_duty',
        'pickup': 'on_duty',
        'dropoff': 'on_duty',
        'fuel': 'on_duty',
        'break_30m': 'off_duty',
        'rest_34h': 'off_duty',
        'rest_10h': 'sleeper_berth',
        'rest_2h': 'off_duty',
        'rest_8h': 'sleeper_berth'
    }
    
    intervals = []
    
    # Initial interval from midnight to start_time
    if day_start < start_dt:
        intervals.append({
            'start_time': day_start,
            'end_time': start_dt,
            'status': 'off_duty',
            'event_type': 'off_duty'
        })
        
    current_time = start_dt
    
    for event in events:
        event_time = datetime.datetime.fromisoformat(event['timestamp'])
        
        # Fill gap with driving
        if current_time < event_time:
            intervals.append({
                'start_time': current_time,
                'end_time': event_time,
                'status': 'driving',
                'event_type': 'driving'
            })
            current_time = event_time
            
        event_end = event_time + datetime.timedelta(seconds=event.get('duration', 0))
        intervals.append({
            'start_time': event_time,
            'end_time': event_end,
            'status': status_map.get(event['event_type'], 'on_duty'),
            'event_type': event['event_type']
        })
        current_time = event_end
        
    # Pad to the end of the final day
    final_day_start = current_time.replace(hour=0, minute=0, second=0, microsecond=0)
    final_day_end = final_day_start + datetime.timedelta(days=1)
    
    if current_time < final_day_end:
        intervals.append({
            'start_time': current_time,
            'end_time': final_day_end,
            'status': 'off_duty',
            'event_type': 'off_duty'
        })
        
    # Slice crossing midnight
    sliced_intervals = []
    for interval in intervals:
        st = interval['start_time']
        et = interval['end_time']
        
        while st < et:
            # next midnight
            next_midnight = (st + datetime.timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            chunk_end = min(et, next_midnight)
            
            # Avoid adding 0-duration intervals
            if st < chunk_end:
                sliced_intervals.append({
                    'start_time': st.isoformat(),
                    'end_time': chunk_end.isoformat(),
                    'status': interval['status'],
                    'event_type': interval['event_type']
                })
            st = chunk_end
            
    # Group by date
    days_dict = {}
    for inv in sliced_intervals:
        date_str = inv['start_time'][:10] # YYYY-MM-DD
        if date_str not in days_dict:
            days_dict[date_str] = []
        days_dict[date_str].append(inv)
        
    daily_logs = [{'date': k, 'intervals': v} for k, v in days_dict.items()]
    
    # Sort just in case
    daily_logs.sort(key=lambda x: x['date'])
    
    return daily_logs
