import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function DonutChart({ value, max, color, unit, size = 100 }) {
  const pct  = Math.min(100, Math.round(((value ?? 0) / max) * 100));
  const data = [{ v: pct }, { v: 100 - pct }];
  const ir   = size * 0.28;
  const or   = size * 0.46;

  return (
    <div style={{ width:size, height:size, position:"relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="v" cx="50%" cy="50%"
            innerRadius={ir} outerRadius={or}
            startAngle={90} endAngle={-270} strokeWidth={0}>
            <Cell fill={color} style={{ filter:`drop-shadow(0 0 5px ${color}70)` }}/>
            <Cell fill="#151e30"/>
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
        <div style={{ fontSize:size > 90 ? 14 : 11, fontWeight:900, color, fontFamily:"'Courier New',monospace", lineHeight:1 }}>
          {value ?? "—"}
        </div>
        <div style={{ fontSize:7, color:"#8892a4" }}>{unit}</div>
      </div>
    </div>
  );
}
