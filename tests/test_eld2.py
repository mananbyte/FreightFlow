import datetime
from backend.api.eld_engine import simulate_eld_events

# Leg 0: Current to Pickup (short)
# Leg 1: Pickup to Dropoff (long)
legs = [
    {
        'steps': [{
            'duration': 1800, # 30 mins
            'distance': 30 * 1609.34,
            'maneuver': {'location': [-122, 45]}
        }]
    },
    {
        'steps': [{
            'duration': 46.666 * 3600,
            'distance': 2800 * 1609.34,
            'maneuver': {'location': [-121, 44]}
        }]
    }
]

events = simulate_eld_events(legs, "2026-07-23T08:00:00", 0)
for e in events:
    print(f"{e['event_type']} - Duration: {e['duration']/3600:.2f}h")
