# Atmos Intelligence

Atmos finds wasted electricity in rooms and buildings. A plug-in ESP32 sensor streams power, climate and occupancy readings to a web dashboard. The dashboard flags waste (lights or AC running in an empty room, phantom loads, power spikes, bad voltage, rising usage), estimates the ₹ and CO₂ cost, and tells the user what to do. The sensor can also switch lights, fan and AC off by itself, following a schedule the user (or AI) sets.

Built for Indian conditions: ₹ tariffs, BEE energy benchmarks, 210-245 V mains, British English copy. Made by school students; the product is real, the business plans on `/future` are aspirational.

Live: https://atmosintelligence.vercel.app

## How it works

1. **Sensor** posts `{device_id, private_key, power, current, energy, voltage, temperature, humidity, light, occupancy, auto_actions}` to `POST /api/device/reading`. The reply carries its automation config and enabled schedules.
2. **Storage**: Supabase (Postgres, Mumbai). All DB access is in `lib/supabase.js` (browser client for user data, admin client for server-only functions; every admin query is filtered by the authorised user id or username).
3. **Rule engine** (`lib/engine`, pure JS, deterministic): runs on the last 30 days of a device (max 5 pages x 1000 rows), cached 60 s in `lib/server/engine.js`.
4. **AI layer** (`lib/ai`): Groq (`qwen/qwen3.8-27b`) rewrites engine findings into short, specific recommendations. No model is trained on user data. Machine learning is a roadmap item, not built.
5. **Dashboard** (`app/dashboard`): overview, alerts, automation, analysis tabs (lighting, temperature, power, trends, environmental), history, devices, API keys, subscription, settings, PDF/JSON export. A demo mode runs on `public/demo.json` and `demo_2.json` without an account.

## Rule engine

Energy = power x time until the next reading. Gaps over 1 h (device offline) are not counted. Tariff defaults to ₹10/kWh (`profiles.tariff_rate`). All thresholds live in `lib/engine/constants.js`.

|    Rule | Fires when |
|---------|------------|
|      L1 | Room empty for 3+ readings and power > idle baseline + 50 W |
|      L2 | Occupied, light > 400 lux, power > idle baseline |
|      T1 | Empty for 3+ readings and temperature outside 22-30 °C |
|      T2 | Outdoor < 26 °C and dry, room > 27 °C, power > baseline + 100 W (Open-Meteo weather) |
|      T3 | Humidity outside 28-72 % |
|      P1 | Latest power z-score > 2.5 vs same weekday and hour |
|      P2 | Empty 4+ h and power > 80 W |
|      P3 | Voltage outside 210-245 V |
| Trend 1 | This week vs last week above 8 % (needs 5+ days in each week) |
| Trend 2 | Occupied-hours power rising daily over 14 days (R² > 0.6) |

Idle baseline = average power of empty, dark (< 50 lux) readings between 00:00 and 05:00, default 50 W. Environmental savings compare use with the BEE benchmark (180 kWh/m²/year, 20 m² room, pro-rated to days covered), CO₂ at 0.727 kg/kWh, 24 kg CO₂ per tree-year. Users can override a few thresholds in `alert_preferences`.

## Alerts (`lib/alerts.js`, `POST /api/alerts`)

Order: cooldown (30 s per user) -> quiet hours -> engine -> AI -> fall back to engine text if the AI fails, returns nothing or the insert is rejected -> drop titles already raised in the last hour -> save.

- The AI gets: country, tariff, last 24 readings, non-zero engine findings, the engine's current alert messages, and recent alert titles. It never gets name, email, username or device ID.
- It replies with lines: `CATEGORY|SEVERITY|Title|Text|Saving|Date/time`. `parseAIResponse` in `lib/ai/groq.js` validates each line and drops anything malformed.
- Categories: General, Lighting, Humidity, HVAC, Power, Trends (write HVAC in capitals everywhere).
- `alerts` columns: `id, user_id, device_id, group_name, severity, title, message, saving_inr, acknowledged, created_at, when`. `created_at` is when the alert was generated; `when` is the sensor-reading time it is about (from the AI's Date/time, else the engine's event time, else the latest reading). `when` is a reserved SQL word, so quote it in raw SQL.

## Automation

Rules (`automation_schedules`): target (light, fan, ac), on/off, weekdays, HH:MM, time zone, source (`manual` or `ai`). "Plan with AI" (`POST /api/automation/suggest`, `lib/ai/schedule.js`) replaces only the device's AI rules from usage patterns and never touches manual ones; editing an AI rule makes it manual. The sensor receives enabled rules with a UTC offset and reports what it did via `auto_actions` into `automation_logs`.

## Plans

Spark (free, 2 devices, 10 min refresh), Basic ₹349, Premium ₹699 (30 s refresh, PDF export, API), Enterprise (custom), priced per unit per month; hardware is ₹3,499 one-time. Plan changes are simulated; there is no payment integration yet.

## API

`Authorization: Bearer atmos_...` (key made on the dashboard API tab) or a logged-in session: `/api/devices`, `/api/engine`, `/api/alerts` (+ `/acknowledge`, `/preferences`), `/api/automation/*`, `/api/devices/clear-history`, `/api/devices/unlink`. Sensors use their own device key on `/api/device/reading`.

## Tech stack

Next.js 16 (App Router, JavaScript), React 19, Tailwind CSS 4 plus heavy inline styles, Recharts, jsPDF, d3-geo and topojson (home page globe), Supabase (auth, Postgres), Groq, Vercel (hosting, cron `keep-alive` daily, analytics).

## Code conventions

- JavaScript with `@/` imports; 2-space indent; few comments.
- Dark theme is the default; brand green `#4ADE80`; fonts Syne (headings) and Inter.
- British English copy, ₹ for money, no emojis in AI output.
- Dashboard data flows through `useAnalysis` and `app/dashboard/sections.js`; engine calls go through `lib/engineFetch.js`.

## Run locally

```bash
npm install
npm run dev
```

Refer to `.env.example` to set `.env.local` environment variables.

## Team

Built by Team Atmos, in India. The members are…

1. Akshat Patil
2. AR Nadal Verma
3. Medhansh Mathur
4. Rayansh Chhaunker
5. Ridit Popli
