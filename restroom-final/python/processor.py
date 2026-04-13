"""
Restroom Hygiene Monitor - Python Processor v3
2 tables only: toilet_readings + staff_locations

Usage:
  python processor.py           # terminal report
  python processor.py --json    # JSON output
  python processor.py --alerts  # alerts only (exit 1 if any)
  python processor.py --csv     # CSV export

Install: pip install requests
"""
import sys, os, json, csv, io
from datetime import datetime, timezone
from statistics import mean, stdev

try:
    import requests
except ImportError:
    sys.exit("Missing: pip install requests")

# Config
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://elarqfyoxbqgwbgjjzvd.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsYXJxZnlveGJxZ3diZ2pqenZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1Mzk2NzYsImV4cCI6MjA4OTExNTY3Nn0."
    "1Ba4EfE0ZlPP8jIi-Q-3QVQE6eFDuztWgZ5mvllp_7A")
H = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

SENSORS = {
    "ammonia_ppm": {"label":"Ammonia",     "unit":"ppm",  "good":5,  "avg":10, "low":True},
    "temperature": {"label":"Temperature", "unit":"C",    "good":26, "avg":30, "low":True},
    "humidity":    {"label":"Humidity",    "unit":"%",    "good":60, "avg":75, "low":True},
    "footfall":    {"label":"Footfall",    "unit":"ppl",  "good":30, "avg":60, "low":True},
    "usage":       {"label":"Usage",       "unit":"uses", "good":20, "avg":50, "low":True},
}

G, Y, R, C, B, X = "\033[92m", "\033[93m", "\033[91m", "\033[96m", "\033[1m", "\033[0m"

def get_status(key, val):
    t = SENSORS[key]
    if t["low"]:
        if val <= t["good"]: return "good"
        if val <= t["avg"]:  return "average"
        return "bad"
    else:
        if val >= t["good"]: return "good"
        if val >= t["avg"]:  return "average"
        return "bad"

def get_band(g, a, b):
    total = g + a + b or 1
    score = ((g*3 + a*2 + b) / (total*3)) * 100
    if score >= 75: return {"band":"A", "label":"Excellent",        "score":round(score,1)}
    if score >= 50: return {"band":"B", "label":"Satisfactory",     "score":round(score,1)}
    return              {"band":"C", "label":"Needs Improvement", "score":round(score,1)}

def status_color(s):
    return G if s == "good" else Y if s == "average" else R

def sb_fetch(table, params):
    try:
        r = requests.get(f"{SUPABASE_URL}/rest/v1/{table}", headers=H, params=params, timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"{R}[Error] {table}: {e}{X}", file=sys.stderr)
        return []

def load():
    readings = sb_fetch("toilet_readings", {"order":"updated_at.desc", "limit":100})
    staff    = sb_fetch("staff_locations",  {"order":"id.asc"})
    return readings, staff

def process(readings):
    if not readings:
        return {"error": "No readings found in toilet_readings table"}

    latest = readings[0]
    stats  = {}
    alerts = []
    trends = {}

    # Aggregate feedback totals from all fetched rows
    fg = sum(r.get("feedback_good",    0) for r in readings)
    fa = sum(r.get("feedback_average", 0) for r in readings)
    fb = sum(r.get("feedback_bad",     0) for r in readings)

    # Sensor stats
    for key in SENSORS:
        vals    = [r[key] for r in readings if r.get(key) is not None]
        cur_val = latest.get(key)
        if not vals:
            continue
        avg_val = round(mean(vals), 2)
        stats[key] = {
            "current":        cur_val,
            "mean":           avg_val,
            "min":            round(min(vals), 2),
            "max":            round(max(vals), 2),
            "stdev":          round(stdev(vals), 2) if len(vals) > 1 else 0,
            "count":          len(vals),
            "unit":           SENSORS[key]["unit"],
            "avg_status":     get_status(key, avg_val),
            "current_status": get_status(key, cur_val) if cur_val is not None else "good",
        }
        if stats[key]["current_status"] == "bad":
            alerts.append({
                "sensor":  key,
                "value":   cur_val,
                "unit":    SENSORS[key]["unit"],
                "message": f"{SENSORS[key]['label']} is {cur_val}{SENSORS[key]['unit']} - above threshold",
            })

    # Trends: compare newest vs oldest 20%
    if len(readings) >= 10:
        chunk = max(1, len(readings) // 5)
        for key in SENSORS:
            nv = [r[key] for r in readings[:chunk]  if r.get(key) is not None]
            ov = [r[key] for r in readings[-chunk:] if r.get(key) is not None]
            if nv and ov:
                diff = mean(nv) - mean(ov)
                trends[key] = "rising" if diff > 1 else "falling" if diff < -1 else "stable"

    band = get_band(fg, fa, fb)
    if band["band"] == "C":
        alerts.append({
            "sensor":  "feedback",
            "value":   band["score"],
            "unit":    "%",
            "message": f"Band C - staff performance review needed (score {band['score']}%)",
        })

    return {
        "toilet_id":    latest.get("toilet_id"),
        "toilet_name":  latest.get("toilet_name"),
        "count":        len(readings),
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "last_reading": latest.get("updated_at"),
        "stats":        stats,
        "feedback":     {"good":fg, "average":fa, "bad":fb, "band":band},
        "trends":       trends,
        "alerts":       alerts,
        "alert_count":  len(alerts),
    }

def print_report(r):
    if "error" in r:
        print(f"{R}Error: {r['error']}{X}")
        return

    fb   = r["feedback"]
    band = fb["band"]
    bc   = G if band["band"]=="A" else Y if band["band"]=="B" else R

    print(f"\n{B}{'='*62}{X}")
    print(f"{B}  RESTROOM HYGIENE REPORT{X}")
    print(f"  {C}{r.get('toilet_name','Unknown')}{X}  ({r.get('toilet_id','—')})")
    print(f"  Processed : {r['processed_at']}")
    print(f"  Readings  : {r['count']}  |  Last: {r.get('last_reading','—')}")
    print(f"{'='*62}\n")

    # Sensor table
    print(f"{B}  SENSOR READINGS{X}")
    print(f"  {'Sensor':<14} {'Current':>10} {'Mean':>10} {'Min':>8} {'Max':>8}  Status     Trend")
    print(f"  {'-'*66}")
    for key, s in r["stats"].items():
        u   = s["unit"]
        sc  = status_color(s["current_status"])
        tm  = r["trends"].get(key, "—")
        tc  = R if tm=="rising" else G if tm=="falling" else C
        print(
            f"  {SENSORS[key]['label']:<14}"
            f" {str(s['current'])+u:>10}"
            f" {str(s['mean'])+u:>10}"
            f" {str(s['min'])+u:>8}"
            f" {str(s['max'])+u:>8}"
            f"  {sc}{s['current_status']:<11}{X}"
            f" {tc}{tm}{X}"
        )

    # Feedback
    print(f"\n{B}  FEEDBACK  (from toilet_readings table){X}")
    print(f"  Thumbs Up  Good:    {G}{fb['good']}{X}")
    print(f"  Hand       Average: {Y}{fb['average']}{X}")
    print(f"  Thumbs Dn  Bad:     {R}{fb['bad']}{X}")
    print(f"  Band: {bc}{B}{band['band']} - {band['label']} ({band['score']}%){X}")

    # Alerts
    if r["alerts"]:
        print(f"\n{B}{R}  ACTIVE ALERTS ({r['alert_count']}){X}")
        for a in r["alerts"]:
            print(f"  {R}  {a['message']}{X}")
    else:
        print(f"\n  {G}  No active alerts - all sensors within range{X}")

    print(f"\n{'='*62}\n")

def export_csv(readings):
    if not readings:
        return ""
    fields = [
        "updated_at","toilet_id","toilet_name",
        "ammonia_ppm","temperature","humidity","footfall","usage",
        "feedback_good","feedback_average","feedback_bad",
    ]
    out = io.StringIO()
    w   = csv.DictWriter(out, fieldnames=fields, extrasaction="ignore")
    w.writeheader()
    w.writerows(readings)
    return out.getvalue()

if __name__ == "__main__":
    args     = set(sys.argv[1:])
    readings, staff = load()
    report   = process(readings)

    if "--json" in args:
        print(json.dumps(report, indent=2, default=str))
    elif "--alerts" in args:
        alerts = report.get("alerts", [])
        if alerts:
            for a in alerts:
                print(f"  {a['message']}")
            sys.exit(1)
        else:
            print("  No active alerts")
            sys.exit(0)
    elif "--csv" in args:
        print(export_csv(readings))
    else:
        print_report(report)
