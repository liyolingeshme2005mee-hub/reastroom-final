import React, { useState, useEffect, useCallback } from "react";
import { fetchLatest, fetchAverages, fetchFeedback, fetchStaff } from "./api";
import { useRealtime } from "./hooks/useRealtime";
import PublicPage from "./pages/PublicPage";
import LoginPage  from "./pages/LoginPage";
import AdminPage  from "./pages/AdminPage";

export default function App() {
  const [page,    setPage]    = useState("public");
  const [auth,    setAuth]    = useState(false);
  const [latest,  setLatest]  = useState(null);
  const [avgs,    setAvgs]    = useState(null);
  const [feedback,setFeedback]= useState({ good:0, average:0, bad:0 });
  const [staff,   setStaff]   = useState([]);
  const [updated, setUpdated] = useState(null);
  const [live,    setLive]    = useState(false);

  function flash() {
    setLive(true);
    setTimeout(() => setLive(false), 1400);
  }

  // ── Load all data ────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    const [l, a, f, s] = await Promise.all([
      fetchLatest(),
      fetchAverages(),
      fetchFeedback(),
      fetchStaff(),
    ]);
    if (l) setLatest(l);
    if (a) setAvgs(a);
    setFeedback(f);
    setStaff(s);
    setUpdated(new Date().toISOString());
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Fallback poll every 60s
  useEffect(() => {
    const id = setInterval(loadAll, 60000);
    return () => clearInterval(id);
  }, [loadAll]);

  // ── Realtime: toilet_readings ────────────────────────────────
  // Fires whenever n8n inserts a new row (every 60s from IoT)
  useRealtime(
    "toilet_readings",
    async (row) => {
      // INSERT — new reading arrived
      setLatest(row);
      setUpdated(new Date().toISOString());
      flash();
      // Refresh averages and feedback totals
      const [a, f] = await Promise.all([fetchAverages(), fetchFeedback()]);
      if (a) setAvgs(a);
      setFeedback(f);
    },
    (row) => {
      // UPDATE
      setLatest(row);
      setUpdated(new Date().toISOString());
      flash();
    }
  );

  // ── Bottom nav ───────────────────────────────────────────────
  function Nav() {
    return (
      <div style={{ position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)", background:"#0f1623ee", border:"1px solid #ffffff15", borderRadius:30, padding:"8px 16px", display:"flex", gap:8, zIndex:999, backdropFilter:"blur(12px)", boxShadow:"0 8px 32px #00000060", alignItems:"center" }}>
        {/* Live dot */}
        <div style={{ display:"flex", alignItems:"center", gap:5, marginRight:4 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:live?"#00e5a0":"#2a3450", boxShadow:live?"0 0 8px #00e5a0":"none", transition:"all .3s" }}/>
          <span style={{ fontSize:8, color:live?"#00e5a0":"#3d4a6a", letterSpacing:1 }}>{live?"LIVE":"SYNC"}</span>
        </div>
        {[
          { key:"public", label:"🌐 PUBLIC", col:"#00e5a0" },
          { key:"admin",  label:"⚙ ADMIN",  col:"#f5c542" },
        ].map(({ key, label, col }) => {
          const active = page === key || (key === "admin" && page === "login");
          return (
            <button key={key}
              onClick={() => { if (key === "admin" && !auth) setPage("login"); else setPage(key); }}
              style={{ background:active?`${col}20`:"transparent", border:`1px solid ${active?col+"50":"transparent"}`, color:active?col:"#8892a4", borderRadius:20, padding:"6px 16px", fontSize:11, cursor:"pointer", fontFamily:"'Courier New',monospace", fontWeight:700, letterSpacing:1 }}>
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {page === "public" && (
        <PublicPage latest={latest} avgs={avgs} feedback={feedback} staff={staff} updated={updated} live={live}/>
      )}
      {page === "login" && (
        <LoginPage onLogin={() => { setAuth(true); setPage("admin"); }}/>
      )}
      {page === "admin" && auth && (
        <AdminPage latest={latest} avgs={avgs} feedback={feedback} staffList={staff} setStaffList={setStaff} onLogout={() => { setAuth(false); setPage("public"); }}/>
      )}
      <Nav/>
    </>
  );
}
