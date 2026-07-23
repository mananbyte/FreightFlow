from backend.api.eld_formatter import generate_daily_logs
events = [{'timestamp': '2026-07-23T08:00:00Z', 'duration': 3600, 'event_type': 'pickup'}]
res = generate_daily_logs(events, '2026-07-23T08:00:00Z')
import json
print(json.dumps(res, indent=2))
