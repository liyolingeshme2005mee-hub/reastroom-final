import React from "react";
import { SENSORS } from "../config";
import { getStatus } from "../utils";
import Pill from "./Pill";

export default function SensorCard({ k, val, avg }) {
  const t  = SENSORS[k];
  const st = getStatus(k, val);
  return (
    <div style={{
      flex:1, minWidth:88,
      background: `${st.color}0d`,
      border:`1px solid ${st.color}30`,
      borderRadius:14, padding:"12px 12px",
      textAlign:"center",
      transition:"all .4s ease",
    }}>
      <div style={{ fontSize:9, color:"#8892a4", textTransform:"uppercase", letterSpacing:1.5, marginBottom:5 }}>
        {t.label}
      </div>
      <div style={{ fontSize:20, fontWeight:900, color:st.color, fontFamily:"'Courier New',monospace", lineHeight:1 }}>
        {val ?? <span style={{color:"#3d4a6a"}}>—</span>}
        <span style={{ fontSize:9, color:"#8892a4", marginLeft:2 }}>{t.unit}</span>
      </div>
      <div style={{ marginTop:5 }}><Pill s={st.s} /></div>
      {avg != null && (
        <div style={{ marginTop:6, paddingTop:6, borderTop:"1px solid #ffffff0a", fontSize:9 }}>
          <span style={{color:"#5a6a8a"}}>avg </span>
          <span style={{color:"#8892a4", fontWeight:700, fontFamily:"'Courier New',monospace"}}>{avg}{t.unit}</span>
        </div>
      )}
      <div style={{ fontSize:7, color:"#2a3450", marginTop:3 }}>≤{t.good} Good · ≤{t.avg} Avg</div>
    </div>
  );
}
