// Simulates IoT device — sends sensor + feedback every 60s
const API = "http://localhost:3001/api/iot";
const rand = (mn, mx, d=1) => parseFloat((Math.random()*(mx-mn)+mn).toFixed(d));

async function send() {
  const p = {
    toilet_id:"T-001", toilet_name:"Main Lobby Restroom",
    ammonia_ppm:rand(2,30), temperature:rand(23,34),
    humidity:rand(48,85,0), footfall:rand(5,90,0), usage:rand(2,60,0),
    feedback_good:rand(10,50,0), feedback_average:rand(2,20,0), feedback_bad:rand(0,15,0),
  };
  try {
    const r = await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});
    const d = await r.json();
    console.log(`[${new Date().toLocaleTimeString()}] ✓ NH3:${p.ammonia_ppm} 👍${p.feedback_good} 👌${p.feedback_average} 👎${p.feedback_bad}`);
  } catch(e) { console.error("✗", e.message); }
}

console.log("🚽 IoT Simulator — Ctrl+C to stop\n");
send(); setInterval(send, 60000);
