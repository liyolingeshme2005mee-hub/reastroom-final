# Restroom Hygiene Monitoring System v3

Clean, optimized, zero-bug full-stack IoT dashboard.
Only 2 Supabase tables. Real credentials built in.

## Architecture

  IoT Device (60s)
       |
       v
  n8n Webhook
       |
       v
  Supabase: toilet_readings   <-- sensor + feedback in ONE row
  Supabase: staff_locations   <-- admin-managed staff list
       |
       v (Realtime WebSocket)
  React Website (Public + Admin)

## Folder Structure

  restroom-final/
  |-- frontend/
  |   |-- src/
  |   |   |-- config.js              Supabase keys + sensor thresholds
  |   |   |-- utils.js               getStatus, getBand, fmtTime, fmtDateTime
  |   |   |-- api.js                 All Supabase REST calls (2 tables only)
  |   |   |-- App.js                 Root + realtime + nav
  |   |   |-- index.js
  |   |   |-- hooks/
  |   |   |   `-- useRealtime.js     Supabase WebSocket auto-reconnect hook
  |   |   |-- components/
  |   |   |   |-- Pill.js            Good/Average/Bad status badge
  |   |   |   |-- SensorCard.js      Top header card (current + average)
  |   |   |   |-- Gauge.js           Speedometer SVG chart
  |   |   |   |-- DonutChart.js      Reusable donut pie
  |   |   |   |-- SensorPieRow.js    Current pie + Average pie per sensor
  |   |   |   `-- FeedbackPanel.js   3 separate live counters
  |   |   `-- pages/
  |   |       |-- PublicPage.js      Public dashboard
  |   |       |-- LoginPage.js       Admin login
  |   |       `-- AdminPage.js       Admin panel (Overview/Staff/LiveData tabs)
  |   `-- package.json
  |-- backend/
  |   |-- server.js                  Express API
  |   |-- test-iot.js                IoT simulator
  |   `-- package.json
  |-- python/
  |   |-- processor.py               Data analyser + reporter
  |   `-- requirements.txt
  |-- n8n/
  |   `-- workflow.json              Import into n8n
  `-- README.md

## Quick Start

### Supabase Tables (run in SQL Editor)

  CREATE TABLE toilet_readings (
    id               BIGSERIAL PRIMARY KEY,
    toilet_id        TEXT,
    toilet_name      TEXT,
    ammonia_ppm      NUMERIC,
    temperature      NUMERIC,
    humidity         NUMERIC,
    footfall         INTEGER,
    usage            INTEGER,
    feedback_good    INTEGER DEFAULT 0,
    feedback_average INTEGER DEFAULT 0,
    feedback_bad     INTEGER DEFAULT 0,
    updated_at       TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE staff_locations (
    id        BIGSERIAL PRIMARY KEY,
    name      TEXT,
    location  TEXT,
    shift     TEXT,
    toilet_id TEXT,
    added_at  TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE toilet_readings  ENABLE ROW LEVEL SECURITY;
  ALTER TABLE staff_locations  ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "anon all" ON toilet_readings  FOR ALL TO anon USING (true) WITH CHECK (true);
  CREATE POLICY "anon all" ON staff_locations  FOR ALL TO anon USING (true) WITH CHECK (true);
  ALTER PUBLICATION supabase_realtime ADD TABLE toilet_readings;

### Frontend

  cd frontend
  npm install
  npm start
  # Opens at http://localhost:3000

### Backend (optional)

  cd backend
  npm install
  npm start          # API on :3001
  node test-iot.js   # Simulate IoT device

### Python

  cd python
  pip install -r requirements.txt
  python processor.py            # full report
  python processor.py --json     # JSON
  python processor.py --alerts   # alerts only
  python processor.py --csv      # CSV export

### n8n

  1. Import n8n/workflow.json
  2. Set SUPABASE_KEY in n8n Settings > Environment Variables
  3. Activate workflow
  4. IoT device POSTs to: https://your-n8n.com/webhook/restroom

## IoT Payload (one payload every 60s)

  {
    "toilet_id":        "T-001",
    "toilet_name":      "Main Lobby Restroom",
    "ammonia_ppm":      8,
    "temperature":      27.4,
    "humidity":         62,
    "footfall":         43,
    "usage":            21,
    "feedback_good":    38,
    "feedback_average": 12,
    "feedback_bad":     5
  }

## Sensor Thresholds

  Ammonia     <= 5ppm  Good  |  <= 10ppm Average  |  > 10ppm Bad
  Temperature <= 26C   Good  |  <= 30C   Average  |  > 30C   Bad
  Humidity    <= 60%   Good  |  <= 75%   Average  |  > 75%   Bad
  Footfall    <= 30    Good  |  <= 60    Average  |  > 60    Bad
  Usage       <= 20    Good  |  <= 50    Average  |  > 50    Bad

## Admin Login

  Username: admin
  Password: admin123
  Change in: frontend/src/config.js
