# Atmos Intelligence

Atmos finds wasted electricity in rooms and buildings. A plug-in ESP32 sensor streams temperature, humidity, light and occupancy readings to a web dashboard. The dashboard flags waste (lights or AC running in an empty room, idle devices, rising waste), estimates the ₹ and CO₂ cost, and tells the user what to do. The sensor can also switch smart devices off by itself, following a schedule the user (or AI) sets.

**The hardware cannot measure power, energy or voltage.** All energy and ₹ figures are estimates from assumed appliance loads (lighting 120 W, AC 1200 W, standby 45 W), scaled to the room's monthly kWh, which the owner can enter per device.

Built for Indian conditions: ₹ tariffs, BEE energy benchmarks, British English copy. Made by school students; the product is real, the business plans on `/future` are aspirational.

Live: https://atmosintelligence.vercel.app

## How it works

1. **Sensor** posts `{device_id, private_key, temperature, humidity, light, occupancy, auto_actions}` to `POST /api/device/reading`. The reply carries its automation config and enabled schedules.
2. **Storage**: Supabase (Postgres, Mumbai). All DB access is in `lib/supabase.js` (browser client for user data, admin client for server-only functions; every admin query is filtered by the authorised user id or username).
3. **Rule engine** (`lib/engine`, pure JS, deterministic): runs on the last 30 days of a device (max 5 pages x 1000 rows), cached 60 s in `lib/server/engine.js`.
4. **AI layer** (`lib/ai`): Groq (`qwen/qwen3.8-27b`) rewrites engine findings into short, specific recommendations. No model is trained on user data. Machine learning is a roadmap item, not built.
5. **Dashboard** (`app/dashboard`): overview, alerts, automation, analysis tabs (lighting, temperature, standby, trends, environmental savings), devices (with per-device name, rate, location, monthly use, PDF/JSON export, and History underneath), API, and settings (subscription at the top). Overview savings count only alerts the user marked as done. Demo mode needs no account: its data is generated in `lib/demo.js`. Per-device settings need `docs/sql/device-settings.sql` run once in Supabase.

## Rule engine

Energy is estimated: assumed load (scaled by the device's monthly kWh) x time until the next reading. Gaps over 1 h (device offline) are not counted. The rate per kWh is set per device (device, then profile, then ₹10). All thresholds live in `lib/engine/constants.js`; times use Asia/Kolkata.

|    Rule | Fires when |
|---------|------------|
|      L1 | Room empty for 3+ readings, after dark (18:00 to 06:00), and light still above 120 lux |
|      L2 | Occupied, light above 400 lux, 08:00 to 17:00 |
|      T1 | Room empty, 09:00 to 21:00, and at or below 24.5 °C (AC apparently running) |
|      T2 | Outdoor below 26 °C and dry, fresh readings only (Open-Meteo weather) |
|      T3 | Humidity outside 30-70 % |
|      S1 | Room empty for 4+ hours in the daytime (standby devices) |
| Trend 1 | Avoidable energy this week vs last week changed by more than 15 % and 0.5 kWh |
| Trend 2 | The hour of the day with the largest share of waste |

Environmental savings compare the estimated use with the BEE benchmark (180 kWh/m²/year, 20 m² room, pro-rated to days covered), CO₂ at 0.727 kg/kWh, 24 kg CO₂ per tree-year. Avoidable energy is capped at 60 % of estimated use.

## Alerts (`lib/alerts.js`, `POST /api/alerts`)

Order: cooldown (30 s per user) -> quiet hours -> engine -> AI -> fall back to engine text if the AI fails, returns nothing or the insert is rejected -> drop titles already raised in the last six hours -> save.

- The AI gets: country, tariff, last 24 readings, non-zero engine findings, the engine's current alert messages, and recent alert titles. It never gets name, email, username or device ID.
- It replies with lines: `CATEGORY|SEVERITY|Title|Text|Saving|Date/time`. `parseAIResponse` in `lib/ai/groq.js` validates each line and drops anything malformed.
- Categories: General, Lighting, Humidity, HVAC, Standby, Trends (write HVAC in capitals everywhere).
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
