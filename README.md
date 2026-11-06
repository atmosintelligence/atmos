# Atmos Intelligence

Atmos finds wasted electricity in buildings. A plug-in room sensor sends live readings to a web dashboard, which flags waste (lights or AC running in an empty room, phantom loads, power spikes) and suggests what to do about it.

Live site: https://atmosintelligence.vercel.app

## How it works

1. **Sensor unit** (ESP32) measures power, voltage, temperature, humidity, light and occupancy, and posts readings to `/api/device/reading`.
2. **Rule engine** (`lib/engine`) checks the readings against efficiency, comfort and safety rules and compares week-on-week usage.
3. **AI layer** (`lib/ai`) turns the engine's findings into short, actionable recommendations using Groq. If the AI is unavailable, the engine's own text is used.
4. **Dashboard** shows live readings, alerts, analysis, savings and PDF exports.

## Tech stack

Next.js (App Router), React, Tailwind CSS, Recharts, Supabase (auth and data), Groq, Vercel.

## Run locally

```bash
npm install
npm run dev
```

Create a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
```

## Team

Built by Team Atmos, India. MIT License.
