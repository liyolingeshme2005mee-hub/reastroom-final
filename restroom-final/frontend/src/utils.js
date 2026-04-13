import { SENSORS } from "./config";

/** Get status for a sensor reading */
export function getStatus(key, value) {
  if (value == null) return { s:"good", color:"#00e5a0", icon:"✦", text:"Good" };
  const t = SENSORS[key];
  if (!t) return { s:"good", color:"#00e5a0", icon:"✦", text:"Good" };
  const isGood = t.low ? value <= t.good : value >= t.good;
  const isAvg  = t.low ? value <= t.avg  : value >= t.avg;
  if (isGood) return { s:"good",    color:"#00e5a0", icon:"✦", text:"Good"    };
  if (isAvg)  return { s:"average", color:"#f5c542", icon:"◈", text:"Average" };
  return            { s:"bad",     color:"#ff4d6d", icon:"⚠", text:"Bad"     };
}

/** Calculate band A/B/C from feedback counts */
export function getBand(g=0, a=0, b=0) {
  const total = g + a + b || 1;
  const score = ((g*3 + a*2 + b) / (total*3)) * 100;
  if (score >= 75) return { band:"A", text:"Excellent",        color:"#00e5a0", score:Math.round(score) };
  if (score >= 50) return { band:"B", text:"Satisfactory",     color:"#f5c542", score:Math.round(score) };
  return               { band:"C", text:"Needs Improvement", color:"#ff4d6d", score:Math.round(score) };
}

/** Format ISO to time string */
export function fmtTime(iso) {
  try { return new Date(iso).toLocaleTimeString(); } catch { return "—"; }
}

/** Format ISO to full date-time string */
export function fmtDateTime(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return "—"; }
}
