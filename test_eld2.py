from backend.api.eld_engine import simulate_eld_events
from backend.api.eld_formatter import generate_daily_logs
import json

legs = [{'duration': 3600}] # 1 hour drive
start_time = "2026-07-23T08:00:00+00:00"
events = simulate_eld_events(legs, start_time, 0)
res = generate_daily_logs(events, start_time)
print(json.dumps(res, indent=2))
