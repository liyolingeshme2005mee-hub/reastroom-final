// ─── Supabase ─────────────────────────────────────────────────────
export const SUPABASE_URL = "https://elarqfyoxbqgwbgjjzvd.supabase.co";
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsYXJxZnlveGJxZ3diZ2pqenZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1Mzk2NzYsImV4cCI6MjA4OTExNTY3Nn0.1Ba4EfE0ZlPP8jIi-Q-3QVQE6eFDuztWgZ5mvllp_7A";

// ─── Admin credentials ────────────────────────────────────────────
export const ADMIN_USER = "admin";
export const ADMIN_PASS = "admin123";

// ─── Sensor definitions ───────────────────────────────────────────
// low:true  → lower value is better (e.g. ammonia)
// low:false → higher value is better
export const SENSORS = {
  ammonia_ppm: { label:"Ammonia",     unit:"ppm",  max:60,  good:5,  avg:10, color:"#a78bfa", low:true },
  temperature: { label:"Temperature", unit:"°C",   max:50,  good:26, avg:30, color:"#fb923c", low:true },
  humidity:    { label:"Humidity",    unit:"%",    max:100, good:60, avg:75, color:"#38bdf8", low:true },
  footfall:    { label:"Footfall",    unit:"ppl",  max:150, good:30, avg:60, color:"#f472b6", low:true },
  usage:       { label:"Usage",       unit:"uses", max:100, good:20, avg:50, color:"#4ade80", low:true },
};
export const SENSOR_KEYS = Object.keys(SENSORS);

// ─── DB Tables ────────────────────────────────────────────────────
// 1. toilet_readings  — sensor values + feedback_good/average/bad per row
// 2. staff_locations  — staff list managed from admin panel
