import React from "react";
import { SENSORS } from "../config";
import { getStatus } from "../utils";
import DonutChart from "./DonutChart";
import Pill from "./Pill";

export default function SensorPieRow({ k, current, avg }) {
  const t      = SENSORS[k];
  const stCur  = getStatus(k, current);
  const stAvg  = getStatus(k, avg);
  const colCur = stCur.s === "bad" ? "#ff4d6d" : stCur.s === "average" ? "#f5c542" : t.color;
  const colAvg = stAvg.s === "bad" ? "#ff4d6d" : stAvg.s === "average" ? "#f5c542" : "#4a5e7a";

  return (
    <div style={{ textAlign:"center", padding:"8px 6px", minWidth:170 }}>
      <div style={{ fontSize:9, color:"#8892a4", letterSpacing:1.5, textTransform:"uppercase", marginBottom:10 }}>
        {t.label}
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"center", alignItems:"flex-end" }}>
        {/* Current */}
        <div style={{ textAlign:"center" }}>
          <DonutChart value={current} max={t.max} color={colCur} unit={t.unit} size={100}/>
          <div style={{ fontSize:8, color:"#5a6a8a", marginTop:3 }}>Current</div>
          <div style={{ marginTop:3 }}><Pill s={stCur.s} small/></div>
        </div>
        {/* Average */}
        <div style={{ textAlign:"center" }}>
          <DonutChart value={avg} max={t.max} color={colAvg} unit={t.unit} size={78}/>
          <div style={{ fontSize:8, color:"#5a6a8a", marginTop:3 }}>Average</div>
          <div style={{ marginTop:3 }}><Pill s={stAvg.s} small/></div>
        </div>
      </div>
      <div style={{ fontSize:8, color:"#3d4a6a", marginTop:6 }}>
        {Math.min(100, Math.round(((current ?? 0) / t.max) * 100))}% of max
      </div>
    </div>
  );
}
