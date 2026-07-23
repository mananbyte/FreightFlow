import datetime
from backend.api.eld_engine import simulate_eld_events

# Mock a really long leg: 2800 miles at 60mph = 46.66 hours
legs = [{
    'steps': [{
        'duration': 46.666 * 3600,
        'distance': 2800 * 1609.34, # meters
        'maneuver': {'location': [-122, 45]}
    }]
}]

events = simulate_eld_events(legs, "2026-07-23T08:00:00", 0)
for e in events:
    print(f"{e['event_type']} - Duration: {e['duration']/3600:.2f}h")
