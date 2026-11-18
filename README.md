# Atmos Intelligence

Atmos finds wasted electricity in rooms and buildings. A plug-in ESP32 sensor streams temperature, humidity, light and occupancy readings to a web dashboard. The dashboard flags waste (lights or AC running in an empty room, idle devices, rising waste), estimates the ₹ and CO₂ cost, and tells the user what to do. The sensor can also switch smart devices off by itself, following a schedule the user (or AI) sets.

**The hardware cannot measure power, energy or voltage.** All energy and ₹ figures are estimates from assumed appliance loads (lighting 120 W, AC 1200 W, standby 45 W), scaled to the room's monthly kWh, which the owner can enter per device.

Live: https://atmosintelligence.vercel.app

## How it works

1. Smart Sensor & Plug Control
An ESP32 sensor tracks room temperature, humidity, light, and motion, sending updates to the server every 10 minutes. In return, it receives user-set auto-off timers. When a room is empty, the sensor automatically turns off local smart plugs (lights, fans, or AC) over Wi-Fi and logs the action. (Note: Simulated power metrics are ignored unless explicitly named).

2. Database & Security (lib/server/db.js)
All data is stored in a Supabase database in Mumbai. For security, the web browser never accesses the database directly. Instead, it requests data through secure server routes that verify the user's identity and isolate their account data.

3. Rule Engine (lib/engine)
A logic engine scans up to 30 days of a device's recent history (up to 5,000 data points) to spot patterns. Results are cached for 60 seconds to keep the app fast.

4. AI Writing Assistant (lib/ai)
An AI model (Qwen via Groq) translates the rule engine's technical findings into short, plain-English tips. No user data is used to train the AI, and predictive machine learning is planned for the future.

5. User Dashboard (app/dashboard)
The web app lets users manage devices, set electricity rates, view energy analysis, and export reports (PDF/JSON). The savings tracker only counts recommendations the user marks as completed. A no-signup Demo Mode is also available using sample data.

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

## Alerts (`POST /api/alerts`)

Order: cooldown (30 s per user) -> quiet hours -> engine -> AI -> fall back to engine text if the AI fails, returns nothing or the insert is rejected -> drop titles already raised in the last six hours -> save.

- The AI gets: country, tariff, last 24 readings, non-zero engine findings, the engine's current alert messages, and recent alert titles. It never gets name, email, username or device ID.
- It replies with optimizations, validates them, and drops anything malformed.
- Categories: General, Lighting, Humidity, HVAC, Standby, Trends (write HVAC in capitals everywhere).

## Automation

Automation is for smart devices (plugs and switches the unit finds on Wi-Fi). Only appliances that are not smart raise alerts: Lighting and HVAC findings are dropped for a room whose lights or AC Atmos switches itself, judged from listed smart devices and from what the unit switched off in the last 7 days (`lib/smartDevices.js`). Settings → "Rule-based" skips the AI and saves the engine's own text.

Auto-off (top of the Automation tab) edits `devices.automation_config`, which the unit downloads with every reading. Schedules, Plan with AI and Manual control work in the demo; real units need a newer firmware to receive them, so the dashboard shows them read-only.

Rules (`automation_schedules`): target (light, fan, ac), on/off, weekdays, HH:MM, time zone, source (`manual` or `ai`). "Plan with AI" (`POST /api/automation/suggest`, `lib/ai/schedule.js`) replaces only the device's AI rules from usage patterns and never touches manual ones; editing an AI rule makes it manual. The sensor receives enabled rules with a UTC offset and reports what it did via `auto_actions` into `automation_logs`.

## Plans

Spark (free, 2 devices, 10 min refresh), Basic ₹349, Premium ₹699 (30 s refresh, PDF export, API), Enterprise (custom), priced per unit per month; hardware is ₹3,499 one-time. Plan changes are simulated; there is no payment integration yet.

## API

`Authorization: Bearer atmos_...` (key made on the dashboard API tab) or a logged-in session: `/api/devices`, `/api/engine`, `/api/alerts` (+ `/acknowledge`, `/preferences`), `/api/automation/*`, `/api/devices/clear-history`, `/api/devices/unlink`, `/api/devices/smart`, `/api/devices/automation`. Session only: `/api/account` (DELETE), `/api/account/profile`, `/api/account/subscription`, `/api/account/api-key`. Sensors use their own device key on `/api/device/reading`.

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
