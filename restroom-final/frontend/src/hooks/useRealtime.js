import { useEffect } from "react";
import { SUPABASE_URL, SUPABASE_KEY } from "../config";

/**
 * Subscribes to a Supabase Realtime table.
 * Auto-reconnects on disconnect. Heartbeat every 25s.
 */
export function useRealtime(table, onInsert, onUpdate) {
  useEffect(() => {
    let ws, heartbeat, retryTimer;
    let mounted = true;

    function connect() {
      if (!mounted) return;
      const realtimeUrl = SUPABASE_URL.replace("https://", "wss://");
      const url = `${realtimeUrl}/realtime/v1/websocket?apikey=${SUPABASE_KEY}&vsn=1.0.0`;
      // Explicitly using Supabase URL and anon key from config.js
      console.debug("Realtime connect", { realtimeUrl, key: SUPABASE_KEY });
      ws = new WebSocket(url);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          topic:   `realtime:public:${table}`,
          event:   "phx_join",
          payload: { config: { broadcast: { self: false }, presence: { key: "" } } },
          ref:     `join_${table}`,
        }));
        heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: "hb" }));
          }
        }, 25000);
      };

      ws.onmessage = ({ data }) => {
        try {
          const msg = JSON.parse(data);
          const rec = msg.payload?.record;
          if (!rec || msg.topic !== `realtime:public:${table}`) return;
          if (msg.event === "INSERT" && onInsert) {
            Promise.resolve(onInsert(rec)).catch((err) => console.error("Realtime onInsert failed", err));
          }
          if (msg.event === "UPDATE" && onUpdate) {
            Promise.resolve(onUpdate(rec)).catch((err) => console.error("Realtime onUpdate failed", err));
          }
        } catch (error) {
          console.warn("Realtime message parse error", error);
        }
      };

      ws.onclose = () => {
        clearInterval(heartbeat);
        if (mounted) {
          retryTimer = setTimeout(connect, 5000);
        }
      };

      ws.onerror = (err) => {
        console.error("Realtime websocket error", err);
        ws.close();
      };
    }

    connect();
    return () => {
      mounted = false;
      clearInterval(heartbeat);
      clearTimeout(retryTimer);
      if (ws) ws.close();
    };
  }, [table, onInsert, onUpdate]);
}
