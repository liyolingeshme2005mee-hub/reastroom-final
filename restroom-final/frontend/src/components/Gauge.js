import React from "react";
import { SENSORS } from "../config";
import { getStatus } from "../utils";
import Pill from "./Pill";

export default function Gauge({ k, val }) {
  const t   = SENSORS[k];
  const st  = getStatus(k, val);
  const col = st.s === "bad" ? "#ff4d6d" : st.s === "average" ? "#f5c542" : t.color;
  const pct = Math.min(1, Math.max(0, (val ?? 0) / t.max));

  const CX = 68, CY = 68, R = 52;
  const toRad = d => (d * Math.PI) / 180;
  const arcPath = (startDeg, endDeg) => {
    const x1 = CX + R * Math.cos(toRad(startDeg));
    const y1 = CY + R * Math.sin(toRad(startDeg));
    const x2 = CX + R * Math.cos(toRad(endDeg));
    const y2 = CY + R * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
  };

  const needleAngle = -140 + pct * 280;
  const nx = CX + 36 * Math.cos(toRad(needleAngle));
  const ny = CY + 36 * Math.sin(toRad(needleAngle));

  return (
    <div style={{ textAlign:"center", padding:"4px 2px" }}>
      <svg width="136" height="92" viewBox="0 0 136 92" style={{ overflow:"visible" }}>
        {/* Track */}
        <path d={arcPath(-140, 140)} fill="none" stroke="#1a2236" strokeWidth="8" strokeLinecap="round"/>
        {/* Fill */}
        <path d={arcPath(-140, -140 + pct * 280)} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 4px ${col}90)`, transition:"all 1s ease" }}/>
        {/* Needle */}
        <line x1={CX} y1={CY} x2={nx} y2={ny} stroke="#c8d0e0" strokeWidth="2" strokeLinecap="round"
          style={{ transition:"all 1s ease" }}/>
        <circle cx={CX} cy={CY} r="4" fill="#c8d0e0"/>
        {/* Value */}
        <text x={CX} y={CY+20} textAnchor="middle" fill={col}
          fontSize="13" fontWeight="900" fontFamily="'Courier New',monospace">
          {val ?? "—"}<tspan fontSize="8" fill="#8892a4"> {t.unit}</tspan>
        </text>
      </svg>
      <div style={{ fontSize:9, color:"#8892a4", letterSpacing:1, textTransform:"uppercase", marginTop:-2 }}>{t.label}</div>
      <div style={{ marginTop:3 }}><Pill s={st.s} small/></div>
    </div>
  );
}
