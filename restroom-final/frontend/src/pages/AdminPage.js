import React, { useState } from "react";
import { SENSOR_KEYS, SENSORS } from "../config";
import { getBand, getStatus, fmtDateTime } from "../utils";
import { createStaff, deleteStaff } from "../api";
import Pill from "../components/Pill";

// ─── Reusable atoms ───────────────────────────────────────────────
const INP = {
  width:"100%", background:"#0a1020", border:"1px solid #ffffff15",
  borderRadius:8, padding:"9px 12px", color:"#e8edf5",
  fontSize:13, fontFamily:"inherit", outline:"none",
};

function Card({ children, style = {} }) {
  return (
    <div style={{ background:"#0f1623", border:"1px solid #ffffff0a", borderRadius:16, padding:22, ...style }}>
      {children}
    </div>
  );
}

function SecTitle({ color = "#00e5a0", children }) {
  return (
    <div style={{ fontSize:9, color, letterSpacing:3, textTransform:"uppercase", marginBottom:16 }}>
      ◆ {children}
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#00e5a015" : "transparent",
      border:     `1px solid ${active ? "#00e5a040" : "#ffffff10"}`,
      color:      active ? "#00e5a0" : "#8892a4",
      borderRadius:8, padding:"8px 18px", fontSize:11,
      cursor:"pointer", fontFamily:"inherit", fontWeight:700,
      letterSpacing:1, transition:"all .2s",
    }}>
      {children}
    </button>
  );
}

function FieldLabel({ children, htmlFor }) {
  return <label htmlFor={htmlFor} style={{ fontSize:9, color:"#8892a4", letterSpacing:1.5, marginBottom:6, textTransform:"uppercase", display:"inline-block" }}>{children}</label>;
}

// ─── Overview tab ─────────────────────────────────────────────────
function Overview({ latest, avgs, feedback }) {
  const b = getBand(feedback.good, feedback.average, feedback.bad);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Band summary */}
      <div style={{ background:`linear-gradient(135deg,${b.color}12,#0f1623)`, border:`1px solid ${b.color}28`, borderRadius:16, padding:22, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div>
          <div style={{ fontSize:9, color:b.color, letterSpacing:3, marginBottom:6 }}>PERFORMANCE RATING</div>
          <div style={{ fontSize:48, fontWeight:900, color:b.color, lineHeight:1 }}>Band {b.band}</div>
          <div style={{ fontSize:13, color:"#8892a4", marginTop:6 }}>{b.text} · Score {b.score}%</div>
        </div>
        <div style={{ display:"flex", gap:24 }}>
          {[["👍", feedback.good, "#00e5a0","Good"],["👌",feedback.average,"#f5c542","Avg"],["👎",feedback.bad,"#ff4d6d","Bad"]].map(([icon,val,col,lbl]) => (
            <div key={lbl} style={{ textAlign:"center" }}>
              <div style={{ fontSize:28, fontWeight:900, color:col }}>{val}</div>
              <div style={{ fontSize:10, color:"#8892a4" }}>{icon} {lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor alerts */}
      <Card>
        <SecTitle color="#38bdf8">Sensor Alert Status</SecTitle>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
          {SENSOR_KEYS.map(k => {
            const t  = SENSORS[k];
            const st = getStatus(k, latest?.[k]);
            return (
              <div key={k} style={{ background:`${st.color}0d`, border:`1px solid ${st.color}28`, borderRadius:10, padding:"12px 14px", flex:1, minWidth:110 }}>
                <div style={{ fontSize:11, fontWeight:700, color:st.color, marginBottom:4 }}>{st.icon} {t.label}</div>
                <div style={{ fontSize:16, fontWeight:800, color:st.color, fontFamily:"'Courier New',monospace" }}>
                  {latest?.[k] ?? "—"} {t.unit}
                </div>
                <div style={{ marginTop:4 }}><Pill s={st.s} small/></div>
                {avgs?.[k] != null && (
                  <div style={{ fontSize:9, color:"#5a6a8a", marginTop:5 }}>avg {avgs[k]}{t.unit}</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Connection */}
      <div style={{ background:"#0a1020", border:"1px solid #ffffff07", borderRadius:12, padding:16 }}>
        <SecTitle color="#3d4a6a">Supabase · 2 Tables</SecTitle>
        <div style={{ fontSize:11, color:"#5a6a8a" }}>
          🔗 <span style={{color:"#a78bfa"}}>elarqfyoxbqgwbgjjzvd.supabase.co</span>
        </div>
        <div style={{ marginTop:8, display:"flex", gap:16, flexWrap:"wrap" }}>
          <div style={{ fontSize:10, color:"#00e5a0" }}>✦ toilet_readings (sensor + feedback)</div>
          <div style={{ fontSize:10, color:"#f5c542" }}>✦ staff_locations (admin managed)</div>
        </div>
        {latest
          ? <div style={{ fontSize:11, color:"#00e5a0", marginTop:8 }}>Last reading: {fmtDateTime(latest.updated_at)}</div>
          : <div style={{ fontSize:11, color:"#f5c542", marginTop:8 }}>◈ Waiting for first IoT reading…</div>
        }
      </div>
    </div>
  );
}

// ─── Staff tab ────────────────────────────────────────────────────
function StaffTab({ feedback, staffList, setStaffList }) {
  const [form,  setForm]  = useState({ name:"", location:"", shift:"Morning (6am – 2pm)", toilet_id:"" });
  const [saved, setSaved] = useState(false);
  const [busy,  setBusy]  = useState(null);
  const b      = getBand(feedback.good, feedback.average, feedback.bad);
  const canAdd = form.name.trim() && form.location.trim();

  async function handleAdd() {
    if (!canAdd) return;
    const entry = await createStaff(form);
    setStaffList(prev => [...prev, entry]);
    setForm({ name:"", location:"", shift:"Morning (6am – 2pm)", toilet_id:"" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleRemove(id) {
    setBusy(id);
    await deleteStaff(id);
    setStaffList(prev => prev.filter(s => s.id !== id));
    setBusy(null);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Add form */}
      <Card>
        <SecTitle>Add New Staff & Location</SecTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div>
            <FieldLabel htmlFor="staff-name">Staff Name *</FieldLabel>
            <input id="staff-name" name="staff_name" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Rajan Kumar" style={INP}/>
          </div>
          <div>
            <FieldLabel htmlFor="staff-location">Location *</FieldLabel>
            <input id="staff-location" name="staff_location" value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} placeholder="e.g. Ground Floor – Main Lobby" style={INP}/>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:18 }}>
          <div>
            <FieldLabel htmlFor="staff-shift">Shift</FieldLabel>
            <select id="staff-shift" name="staff_shift" value={form.shift} onChange={e => setForm(f=>({...f,shift:e.target.value}))} style={{...INP,cursor:"pointer"}}>
              {["Morning (6am – 2pm)","Afternoon (2pm – 10pm)","Night (10pm – 6am)"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel htmlFor="staff-toilet-id">Restroom ID</FieldLabel>
            <input id="staff-toilet-id" name="toilet_id" value={form.toilet_id} onChange={e => setForm(f=>({...f,toilet_id:e.target.value}))} placeholder="e.g. T-001" style={INP}/>
          </div>
        </div>
        <button onClick={handleAdd} disabled={!canAdd} style={{
          width:"100%", border:"none", borderRadius:10, padding:"11px",
          fontSize:12, fontWeight:800, letterSpacing:1,
          cursor: canAdd ? "pointer" : "not-allowed",
          fontFamily:"inherit", transition:"all .3s",
          background: saved  ? "#00e5a015"
                     : canAdd ? "linear-gradient(135deg,#00e5a0,#00b37a)"
                     :          "#1e2840",
          color:  saved  ? "#00e5a0"
                 : canAdd ? "#070c16"
                 :          "#3d4a6a",
          ...(saved ? {border:"1px solid #00e5a050"} : {}),
        }}>
          {saved ? "✓ STAFF ADDED!" : "+ ADD STAFF"}
        </button>
      </Card>

      {/* Staff list */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <SecTitle color="#a78bfa">Staff Directory</SecTitle>
          <span style={{ fontSize:11, color:"#3d4a6a" }}>{staffList.length} member{staffList.length !== 1 ? "s" : ""}</span>
        </div>

        {staffList.length === 0
          ? <div style={{ textAlign:"center", padding:"32px 0", color:"#3d4a6a", fontSize:12 }}>No staff yet. Use the form above.</div>
          : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {staffList.map(s => (
                <div key={s.id} style={{ background:"#0a1020", border:"1px solid #ffffff08", borderRadius:12, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
                  <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                    <div style={{ width:40, height:40, borderRadius:"50%", background:`${b.color}20`, border:`2px solid ${b.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:b.color, flexShrink:0 }}>
                      {b.band}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700 }}>{s.name}</div>
                      <div style={{ fontSize:10, color:"#a78bfa", marginTop:2 }}>📍 {s.location}</div>
                      <div style={{ fontSize:10, color:"#8892a4", marginTop:1 }}>
                        🕐 {s.shift}{s.toilet_id ? ` · 🚽 ${s.toilet_id}` : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <div style={{ background:`${b.color}18`, border:`1px solid ${b.color}38`, borderRadius:8, padding:"4px 10px", fontSize:10, color:b.color, fontWeight:700 }}>
                      Band {b.band} · {b.text}
                    </div>
                    <button onClick={() => handleRemove(s.id)} disabled={busy === s.id} style={{ background:"#ff4d6d14", border:"1px solid #ff4d6d28", color:"#ff4d6d", borderRadius:8, padding:"4px 12px", fontSize:10, cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                      {busy === s.id ? "…" : "REMOVE"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
        }
      </Card>
    </div>
  );
}

// ─── Live data tab ────────────────────────────────────────────────
function LiveData({ latest, avgs, feedback }) {
  const b = getBand(feedback.good, feedback.average, feedback.bad);

  const rows = latest ? [
    ["Toilet ID",       latest.toilet_id,                  null     ],
    ["Toilet Name",     latest.toilet_name,                 null     ],
    ["Last Updated",    fmtDateTime(latest.updated_at),     null     ],
    ...SENSOR_KEYS.map(k => {
      const t  = SENSORS[k];
      const st = getStatus(k, latest[k]);
      return [`${t.label}`, `${latest[k] ?? "—"} ${t.unit} → ${st.text}`, st.color];
    }),
    ["Feedback 👍",     feedback.good,                     "#00e5a0"],
    ["Feedback 👌",     feedback.average,                  "#f5c542"],
    ["Feedback 👎",     feedback.bad,                      "#ff4d6d"],
    ["Feedback Score",  `${b.score}%`,                      b.color  ],
    ["Band",            `${b.band} — ${b.text}`,            b.color  ],
  ] : [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Card>
        <SecTitle color="#f5c542">Current Sensor + Feedback Reading</SecTitle>
        {rows.length
          ? <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {rows.map(([k, v, col]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #ffffff07", paddingBottom:8 }}>
                  <span style={{ fontSize:11, color:"#8892a4" }}>{k}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:col ?? "#e8edf5" }}>{v}</span>
                </div>
              ))}
            </div>
          : <div style={{ textAlign:"center", padding:"32px 0", color:"#3d4a6a", fontSize:12 }}>
              Waiting for IoT device to send data…
            </div>
        }
      </Card>

      {avgs && (
        <Card>
          <SecTitle color="#38bdf8">Sensor Averages — Last 50 Readings</SecTitle>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {SENSOR_KEYS.map(k => {
              const t  = SENSORS[k];
              const st = getStatus(k, avgs[k]);
              return (
                <div key={k} style={{ background:`${st.color}0d`, border:`1px solid ${st.color}28`, borderRadius:10, padding:"10px 14px", flex:1, minWidth:100, textAlign:"center" }}>
                  <div style={{ fontSize:9, color:"#5a6a8a", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{t.label}</div>
                  <div style={{ fontSize:16, fontWeight:800, color:st.color, fontFamily:"'Courier New',monospace" }}>
                    {avgs[k] ?? "—"}{t.unit}
                  </div>
                  <div style={{ marginTop:4 }}><Pill s={st.s} small/></div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Admin root ───────────────────────────────────────────────────
export default function AdminPage({ latest, avgs, feedback, staffList, setStaffList, onLogout }) {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ minHeight:"100vh", background:"#070c16", fontFamily:"'Courier New',monospace", color:"#e8edf5", paddingBottom:80 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}input,select{outline:none}`}</style>

      {/* Header */}
      <div style={{ background:"#0a1020", borderBottom:"1px solid #ffffff0a", padding:"16px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:9, color:"#f5c542", letterSpacing:4 }}>⚙ ADMIN PANEL</div>
          <div style={{ fontSize:16, fontWeight:800 }}>Restroom Hygiene Monitor</div>
        </div>
        <button onClick={onLogout} style={{ background:"#ff4d6d18", border:"1px solid #ff4d6d38", color:"#ff4d6d", borderRadius:8, padding:"7px 16px", fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
          LOGOUT
        </button>
      </div>

      <div style={{ maxWidth:1060, margin:"0 auto", padding:"24px 20px" }}>
        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
          <TabBtn active={tab==="overview"} onClick={() => setTab("overview")}>📊 Overview</TabBtn>
          <TabBtn active={tab==="staff"}    onClick={() => setTab("staff")}>👷 Staff</TabBtn>
          <TabBtn active={tab==="data"}     onClick={() => setTab("data")}>🔢 Live Data</TabBtn>
        </div>

        {tab === "overview" && <Overview latest={latest} avgs={avgs} feedback={feedback}/>}
        {tab === "staff"    && <StaffTab feedback={feedback} staffList={staffList} setStaffList={setStaffList}/>}
        {tab === "data"     && <LiveData latest={latest} avgs={avgs} feedback={feedback}/>}
      </div>
    </div>
  );
}
