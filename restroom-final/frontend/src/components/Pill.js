import React from "react";

const STYLES = {
  good:    { color:"#00e5a0", bg:"#00e5a015", bd:"#00e5a030", icon:"✦" },
  average: { color:"#f5c542", bg:"#f5c54215", bd:"#f5c54230", icon:"◈" },
  bad:     { color:"#ff4d6d", bg:"#ff4d6d15", bd:"#ff4d6d30", icon:"⚠" },
};

export default function Pill({ s, small = false }) {
  const c = STYLES[s] ?? STYLES.good;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:3,
      background:c.bg, border:`1px solid ${c.bd}`,
      borderRadius:20, padding:small?"2px 7px":"3px 10px",
      fontSize:small?9:11, color:c.color,
      fontWeight:700, textTransform:"uppercase", letterSpacing:0.8,
    }}>
      {c.icon} {s}
    </span>
  );
}
