import urllib.request
import json

payload = {
    "current": [-122.676483, 45.523064], # Portland
    "pickup": [-122.33207, 47.60621],    # Seattle
    "dropoff": [-77.036873, 38.907192],  # DC
    "startTime": "2026-07-23T08:00",
    "cycleHours": 0
}

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/routes/calculate/',
    data=json.dumps(payload).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        for e in result.get('events', []):
            print(f"{e['event_type']} at {e['coordinates']}")
except Exception as e:
    print("Error:", e)
