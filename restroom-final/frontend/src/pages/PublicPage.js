import React from "react";
import { SENSOR_KEYS } from "../config";
import { getBand, fmtTime } from "../utils";
import SensorCard    from "../components/SensorCard";
import Gauge         from "../components/Gauge";
import SensorPieRow  from "../components/SensorPieRow";
import FeedbackPanel from "../components/FeedbackPanel";

export default function PublicPage({ latest, avgs, feedback, staff, updated, live }) {
  const b = getBand(feedback.good, feedback.average, feedback.bad);

  return (
    <div style={{ minHeight:"100vh", background:"#070c16", fontFamily:"'Courier New',monospace", color:"#e8edf5", paddingBottom:80 }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#0a1020}
        ::-webkit-scrollbar-thumb{background:#1e2840;border-radius:3px}
      `}</style>

      {/* ── TOP BANNER ── */}
      <div style={{ background:"linear-gradient(180deg,#0a1525,#080d18)", borderBottom:"1px solid #00e5a018", padding:"20px 24px 18px" }}>

        {/* Title + Band */}
        <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:18 }}>
          <div>
            <div style={{ fontSize:9, color:"#00e5a0", letterSpacing:4, marginBottom:5 }}>◆ RESTROOM HYGIENE MONITOR · PUBLIC</div>
            <div style={{ fontSize:22, fontWeight:900 }}>
              {latest?.toilet_name ?? "Waiting for IoT data…"}
            </div>
            <div style={{ fontSize:11, color:"#8892a4", marginTop:4, display:"flex", gap:12, flexWrap:"wrap" }}>
              {latest?.toilet_id && (
                <span>ID: <span style={{color:"#a78bfa"}}>{latest.toilet_id}</span></span>
              )}
              {staff[0] && (
                <span style={{color:"#00e5a0"}}>👷 {staff[0].name} · {staff[0].shift}</span>
              )}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, background:`${b.color}18`, border:`1px solid ${b.color}40`, borderRadius:12, padding:"8px 18px", marginBottom:6 }}>
              <span style={{ fontSize:26, fontWeight:900, color:b.color }}>Band {b.band}</span>
              <span style={{ fontSize:11, color:b.color }}>{b.text}</span>
            </div>
            <div style={{ fontSize:10, color:"#3d4a6a", display:"flex", alignItems:"center", gap:5, justifyContent:"flex-end" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:live?"#00e5a0":"#2a3450", boxShadow:live?"0 0 10px #00e5a0":"none", transition:"all .3s", animation:"pulse 2s infinite" }}/>
              {updated ? `Synced ${fmtTime(updated)}` : "Connecting…"} · Realtime
            </div>
          </div>
        </div>

        {/* Sensor cards — current value + average */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {SENSOR_KEYS.map(k => <SensorCard key={k} k={k} val={latest?.[k]} avg={avgs?.[k]}/>)}
        </div>
      </div>

      {/* ── CHARTS ── */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px", display:"flex", flexDirection:"column", gap:24 }}>

        {/* Gauges */}
        <section style={{ animation:"fadeUp .5s ease" }}>
          <div style={{ fontSize:9, color:"#8892a4", letterSpacing:3, textTransform:"uppercase", marginBottom:12 }}>◆ Live Sensor Gauges</div>
          <div style={{ background:"#0f1623", border:"1px solid #ffffff08", borderRadius:16, padding:"20px 8px", display:"flex", flexWrap:"wrap", gap:4, justifyContent:"space-around" }}>
            {SENSOR_KEYS.map(k => <Gauge key={k} k={k} val={latest?.[k]}/>)}
          </div>
        </section>

        {/* Pie charts — Current + Average per sensor */}
        <section style={{ animation:"fadeUp .7s ease" }}>
          <div style={{ fontSize:9, color:"#8892a4", letterSpacing:3, textTransform:"uppercase", marginBottom:4 }}>◆ Sensor Pie Charts — Current vs Average</div>
          <div style={{ fontSize:10, color:"#3d4a6a", marginBottom:12 }}>
            Each sensor: <span style={{color:"#00e5a0"}}>Current value</span> (large) · <span style={{color:"#4a5e7a"}}>50-reading average</span> (small)
          </div>
          <div style={{ background:"#0f1623", border:"1px solid #ffffff08", borderRadius:16, padding:"20px 12px", display:"flex", flexWrap:"wrap", gap:8, justifyContent:"space-around" }}>
            {SENSOR_KEYS.map(k => <SensorPieRow key={k} k={k} current={latest?.[k]} avg={avgs?.[k]}/>)}
          </div>
        </section>

        {/* Feedback */}
        <section style={{ animation:"fadeUp .9s ease" }}>
          <div style={{ fontSize:9, color:"#8892a4", letterSpacing:3, textTransform:"uppercase", marginBottom:12 }}>◆ User Feedback — Counts from IoT Device</div>
          <FeedbackPanel good={feedback.good} average={feedback.average} bad={feedback.bad}/>
        </section>

        <div style={{ textAlign:"center", fontSize:9, color:"#1e2840", letterSpacing:2 }}>
          RESTROOM HYGIENE MONITORING · IoT → N8N → SUPABASE → WEBSITE
        </div>
      </div>
    </div>
  );
}
