import React from "react";
import { getBand } from "../utils";

const ITEMS = [
  { key:"good",    icon:"👍", label:"GOOD",    color:"#00e5a0" },
  { key:"average", icon:"👌", label:"AVERAGE", color:"#f5c542" },
  { key:"bad",     icon:"👎", label:"BAD",     color:"#ff4d6d" },
];

export default function FeedbackPanel({ good = 0, average = 0, bad = 0 }) {
  const total = good + average + bad || 1;
  const b     = getBand(good, average, bad);

  return (
    <div style={{ background:"#0f1623", border:"1px solid #ffffff0a", borderRadius:16, padding:24 }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10, marginBottom:20 }}>
        <div>
          <div style={{ fontSize:9, color:"#8892a4", letterSpacing:3, textTransform:"uppercase", marginBottom:3 }}>
            ◆ User Feedback · From IoT Device
          </div>
          <div style={{ fontSize:11, color:"#5a6a8a" }}>
            Counts from toilet_readings · updates every 60s
          </div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <div style={{ background:`${b.color}20`, border:`1px solid ${b.color}50`, borderRadius:20, padding:"4px 16px", fontSize:13, color:b.color, fontWeight:800 }}>
            Band {b.band} · {b.text}
          </div>
          <div style={{ background:"#ffffff08", border:"1px solid #ffffff12", borderRadius:20, padding:"4px 12px", fontSize:11, color:"#8892a4" }}>
            Score <span style={{ color:b.color, fontWeight:800 }}>{b.score}%</span>
          </div>
        </div>
      </div>

      {/* 3 Counters */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:18 }}>
        {ITEMS.map(({ key, icon, label, color }) => {
          const val = key === "good" ? good : key === "average" ? average : bad;
          const pct = Math.round((val / total) * 100);
          return (
            <div key={key} style={{
              background:`${color}0d`, border:`1px solid ${color}28`,
              borderRadius:14, padding:"16px 10px", textAlign:"center",
            }}>
              <div style={{ fontSize:26, marginBottom:6 }}>{icon}</div>
              <div style={{ fontSize:36, fontWeight:900, color, fontFamily:"'Courier New',monospace", lineHeight:1 }}>
                {val}
              </div>
              <div style={{ fontSize:9, color:"#8892a4", textTransform:"uppercase", letterSpacing:1.5, marginTop:6 }}>
                {label}
              </div>
              <div style={{ marginTop:7, display:"inline-block", background:`${color}15`, borderRadius:10, padding:"2px 8px", fontSize:10, color, fontWeight:700 }}>
                {pct}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ display:"flex", height:8, borderRadius:6, overflow:"hidden", gap:2, marginBottom:8 }}>
        <div style={{ width:`${(good/total)*100}%`,    background:"#00e5a0", transition:"width .8s ease", borderRadius:"6px 0 0 6px" }}/>
        <div style={{ width:`${(average/total)*100}%`, background:"#f5c542", transition:"width .8s ease" }}/>
        <div style={{ width:`${(bad/total)*100}%`,     background:"#ff4d6d", transition:"width .8s ease", borderRadius:"0 6px 6px 0" }}/>
      </div>
      <div style={{ textAlign:"center", fontSize:10, color:"#3d4a6a" }}>
        Total: <span style={{ color:"#8892a4", fontWeight:700 }}>{good + average + bad}</span>
      </div>
    </div>
  );
}
