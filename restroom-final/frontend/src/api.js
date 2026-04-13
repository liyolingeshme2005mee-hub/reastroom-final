/**
 * api.js
 * All Supabase REST calls — only 2 tables:
 *   toilet_readings  (sensor + feedback in one row)
 *   staff_locations  (admin-managed staff list)
 */
import { SUPABASE_URL, SUPABASE_KEY, SENSOR_KEYS } from "./config";

const H = {
  apikey:         SUPABASE_KEY,
  Authorization:  `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

// ─── Base helpers ─────────────────────────────────────────────────
async function sbGet(table, query = "") {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, { headers: H });
  if (!r.ok) throw new Error(`GET ${table}: ${r.status}`);
  return r.json();
}

async function sbPost(table, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method:  "POST",
    headers: { ...H, Prefer: "return=representation" },
    body:    JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${table}: ${r.status}`);
  return r.json();
}

async function sbDelete(table, id) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "DELETE", headers: H,
  });
  if (!r.ok) throw new Error(`DELETE ${table}: ${r.status}`);
}

// ─── toilet_readings ──────────────────────────────────────────────

/** Latest single sensor + feedback row */
export async function fetchLatest() {
  try {
    const rows = await sbGet("toilet_readings", "?order=updated_at.desc&limit=1");
    return rows[0] ?? null;
  } catch (e) {
    console.warn("[api] fetchLatest:", e.message);
    return null;
  }
}

/** Averages of sensor values from last 50 rows */
export async function fetchAverages() {
  try {
    const cols = SENSOR_KEYS.join(",");
    const rows = await sbGet("toilet_readings", `?order=updated_at.desc&limit=50&select=${cols}`);
    if (!rows.length) return null;
    const avgs = {};
    SENSOR_KEYS.forEach(k => {
      const vals = rows.map(r => r[k]).filter(v => v != null);
      avgs[k] = vals.length
        ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1))
        : null;
    });
    return avgs;
  } catch (e) {
    console.warn("[api] fetchAverages:", e.message);
    return null;
  }
}

/** Aggregate feedback totals from last 200 rows */
export async function fetchFeedback() {
  try {
    const rows = await sbGet(
      "toilet_readings",
      "?order=updated_at.desc&limit=200&select=feedback_good,feedback_average,feedback_bad"
    );
    const totals = { good: 0, average: 0, bad: 0 };
    rows.forEach(r => {
      totals.good    += r.feedback_good    ?? 0;
      totals.average += r.feedback_average ?? 0;
      totals.bad     += r.feedback_bad     ?? 0;
    });
    return totals;
  } catch (e) {
    console.warn("[api] fetchFeedback:", e.message);
    return { good: 0, average: 0, bad: 0 };
  }
}

// ─── staff_locations ──────────────────────────────────────────────

export async function fetchStaff() {
  try {
    return await sbGet("staff_locations", "?order=id.asc");
  } catch (e) {
    console.warn("[api] fetchStaff:", e.message);
    return [];
  }
}

export async function createStaff(data) {
  try {
    const rows = await sbPost("staff_locations", {
      name:      data.name,
      location:  data.location,
      shift:     data.shift,
      toilet_id: data.toilet_id || "T-001",
    });
    return rows[0] ?? { id: Date.now(), ...data };
  } catch (e) {
    console.warn("[api] createStaff:", e.message);
    return { id: Date.now(), ...data };
  }
}

export async function deleteStaff(id) {
  try {
    await sbDelete("staff_locations", id);
    return true;
  } catch (e) {
    console.warn("[api] deleteStaff:", e.message);
    return false;
  }
}
