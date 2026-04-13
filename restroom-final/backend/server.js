/**
 * Restroom Hygiene Monitor — Node.js Backend v3
 * Only 2 tables: toilet_readings + staff_locations
 */
require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const axios   = require("axios");

const app  = express();
const PORT = process.env.PORT || 3001;
const SB   = process.env.SUPABASE_URL      || "https://elarqfyoxbqgwbgjjzvd.supabase.co";
const KEY  = process.env.SUPABASE_ANON_KEY || "YOUR_KEY";
const H    = { apikey:KEY, Authorization:`Bearer ${KEY}`, "Content-Type":"application/json", Prefer:"return=minimal" };

app.use(cors());
app.use(express.json());

// In-memory cache
let cache = { reading: null, staff: [] };

// ─── POST /api/iot ─────────────────────────────────────────────────
// Receives sensor + feedback data from n8n every 60s
// Body: { toilet_id, toilet_name, ammonia_ppm, temperature, humidity,
//         footfall, usage, feedback_good, feedback_average, feedback_bad }
app.post("/api/iot", async (req, res) => {
  try {
    const data = { ...req.body, updated_at: new Date().toISOString() };
    cache.reading = data;
    await axios.post(`${SB}/rest/v1/toilet_readings`, data, { headers: H });
    console.log(`[IoT] ${data.updated_at} | NH3:${data.ammonia_ppm}ppm | 👍${data.feedback_good} 👌${data.feedback_average} 👎${data.feedback_bad}`);
    res.json({ ok: true });
  } catch (e) {
    console.error("[IoT]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /api/sensor ──────────────────────────────────────────────
app.get("/api/sensor", async (req, res) => {
  try {
    if (cache.reading) return res.json(cache.reading);
    const r = await axios.get(`${SB}/rest/v1/toilet_readings?order=updated_at.desc&limit=1`, { headers: H });
    cache.reading = r.data[0] ?? null;
    res.json(cache.reading);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── GET /api/staff ───────────────────────────────────────────────
app.get("/api/staff", async (req, res) => {
  try {
    if (cache.staff.length) return res.json(cache.staff);
    const r = await axios.get(`${SB}/rest/v1/staff_locations?order=id.asc`, { headers: H });
    cache.staff = r.data;
    res.json(cache.staff);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── POST /api/staff ──────────────────────────────────────────────
app.post("/api/staff", async (req, res) => {
  const { name, location, shift, toilet_id } = req.body;
  if (!name || !location) return res.status(400).json({ error: "name and location required" });
  try {
    const entry = { id: Date.now(), name, location, shift: shift || "Morning (6am – 2pm)", toilet_id: toilet_id || "T-001" };
    cache.staff.push(entry);
    await axios.post(`${SB}/rest/v1/staff_locations`, entry, { headers: H });
    res.status(201).json(entry);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── DELETE /api/staff/:id ────────────────────────────────────────
app.delete("/api/staff/:id", async (req, res) => {
  try {
    cache.staff = cache.staff.filter(s => s.id !== Number(req.params.id));
    await axios.delete(`${SB}/rest/v1/staff_locations?id=eq.${req.params.id}`, { headers: H });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── GET /api/health ──────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({
  ok: true,
  uptime: Math.floor(process.uptime()),
  lastReading: cache.reading?.updated_at ?? null,
  tables: ["toilet_readings","staff_locations"],
}));

app.listen(PORT, () => console.log(`🚽 Restroom API :${PORT}  |  Tables: toilet_readings + staff_locations`));
