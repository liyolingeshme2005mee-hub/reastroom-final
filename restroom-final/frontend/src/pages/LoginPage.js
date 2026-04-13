import React, { useState } from "react";
import { ADMIN_USER, ADMIN_PASS } from "../config";

export default function LoginPage({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");

  function submit() {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setErr("");
      onLogin();
    } else {
      setErr("Invalid username or password");
    }
  }

  const inp = {
    width:"100%", background:"#0a1020",
    border:"1px solid #ffffff15", borderRadius:8,
    padding:"10px 14px", color:"#e8edf5",
    fontSize:13, fontFamily:"inherit", outline:"none",
  };

  return (
    <div style={{ minHeight:"100vh", background:"#070c16", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Courier New',monospace" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}input{outline:none}`}</style>

      <div style={{ background:"#0f1623", border:"1px solid #00e5a022", borderRadius:20, padding:"40px 36px", width:360, boxShadow:"0 0 50px #00e5a008" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:30, marginBottom:8 }}>🔐</div>
          <div style={{ fontSize:9, color:"#00e5a0", letterSpacing:4, marginBottom:6 }}>ADMIN ACCESS</div>
          <div style={{ fontSize:18, fontWeight:800 }}>Restroom Monitor</div>
        </div>

        <div style={{ marginBottom:14 }}>
          <label htmlFor="admin-user" style={{ fontSize:9, color:"#8892a4", letterSpacing:1.5, marginBottom:6, textTransform:"uppercase", display:"inline-block" }}>Username</label>
          <input
            id="admin-user"
            name="admin-user"
            type="text" value={user} placeholder="admin"
            onChange={e => setUser(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            style={inp}
          />
        </div>

        <div style={{ marginBottom: err ? 10 : 18 }}>
          <label htmlFor="admin-pass" style={{ fontSize:9, color:"#8892a4", letterSpacing:1.5, marginBottom:6, textTransform:"uppercase", display:"inline-block" }}>Password</label>
          <input
            id="admin-pass"
            name="admin-pass"
            type="password" value={pass} placeholder="••••••••"
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            style={inp}
          />
        </div>

        {err && (
          <div style={{ fontSize:11, color:"#ff4d6d", textAlign:"center", marginBottom:14 }}>{err}</div>
        )}

        <button onClick={submit} style={{ width:"100%", background:"linear-gradient(135deg,#00e5a0,#00b37a)", border:"none", borderRadius:10, padding:"12px", color:"#070c16", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit", letterSpacing:1 }}>
          LOGIN →
        </button>
        <div style={{ textAlign:"center", marginTop:14, fontSize:10, color:"#3d4a6a" }}>
          Default: admin / admin123
        </div>
      </div>
    </div>
  );
}
