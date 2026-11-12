'use client';

import { useEffect, useState } from 'react';
import { useDevice } from '../DeviceContext';
import { hasApiKey, setApiKey as saveApiKey } from '@/lib/supabase';
import Link from 'next/link';

function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div style={{ borderRadius: '0.75rem', border: '1px solid rgba(128,128,128,0.15)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', background: 'rgba(128,128,128,0.06)', borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#737373' }}>{label}</span>
        <button
          onClick={copy}
          style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '0.375rem', background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(128,128,128,0.1)', color: copied ? 'var(--color-primary-dark)' : '#737373', border: 'none', cursor: 'pointer' }}
          className={copied ? 'dark:text-[var(--color-primary)]' : ''}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '1rem', fontSize: '0.75rem', lineHeight: 1.7, overflowX: 'auto', color: '#c0c0c0', background: 'rgba(0,0,0,0.2)', fontFamily: 'monospace' }}>
        {code}
      </pre>
    </div>
  );
}

function EndpointCard({ method, path, description, children }) {
  const [open, setOpen] = useState(false);
  const methodColor = { GET: '#4ADE80', POST: '#60a5fa', DELETE: '#ef4444' }[method] ?? '#737373';
  return (
    <div style={{ borderRadius: '0.875rem', border: '1px solid rgba(128,128,128,0.12)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span
          style={{
            width: '4.5rem',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.2rem 0.6rem',
            borderRadius: '0.375rem',
            background: methodColor + '18',
            color: methodColor,
            fontFamily: 'monospace',
            flexShrink: 0,
            textAlign: 'center',
          }}
        >
          {method}
        </span>
        <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#c0c0c0', flex: 1 }}>{path}</span>
        <span style={{ fontSize: '0.78rem', color: '#737373', flex: 2, textAlign: 'left' }}>{description}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(128,128,128,0.1)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Note({ children }) {
  return <p style={{ fontSize: '0.8rem', color: '#737373', lineHeight: 1.65, margin: 0 }}>{children}</p>;
}

export default function ApiPage() {
  const { selectedId, isDemo } = useDevice();
  const deviceId = selectedId ?? 'ATM-D001';
  const [hasKey, setHasKey] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied]     = useState(false);

  const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';

  useEffect(() => {
    hasApiKey().then(setHasKey);
  }, []);

  async function generateApiKey() {
    setGenerating(true);
    const key = 'atmos_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    const { error } = await saveApiKey(key);
    if (!error) {
      setApiKey(key);
      setHasKey(true);
    }
    setGenerating(false);
  }

  async function revokeApiKey() {
    setRevoking(true);
    const { error } = await saveApiKey(null);
    if (!error) {
      setApiKey(null);
      setHasKey(false);
    }
    setRevoking(false);
  }

  function copyKey() {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {isDemo && (
        <div style={{ fontSize: '0.78rem', color: '#737373', padding: '0.75rem 1rem', background: 'rgba(74,222,128,0.06)', borderRadius: '0.625rem', border: '1px solid rgba(74,222,128,0.15)', marginBottom: '0.5rem' }}>
          API key generation is not possible in demo mode. <Link href="/signup" className="link">Create an account</Link> and grab a hardware unit to generate an API key!
        </div>
      )}

      <div className="dash-greeting">
        <div className="dash-greeting-name">API</div>
        <div className="dash-greeting-sub">
          Read your devices, run the analysis and manage alerts from your own code. Everything the dashboard does goes through these endpoints.
        </div>
      </div>

      <div className="dash-device-card">
        <div className="dash-section-title" style={{ marginBottom: '0.75rem' }}>Your API key</div>
        <p style={{ fontSize: '0.8rem', color: '#737373', lineHeight: 1.65, marginBottom: '1rem' }}>
          Send your key in the <code style={{ fontSize: '0.75rem', background: 'rgba(128,128,128,0.1)', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}>Authorization</code> header as a Bearer token. Generating a new key replaces the old one. Keep it secret.
        </p>

        {apiKey ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <code style={{ flex: 1, fontSize: '0.78rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(128,128,128,0.08)', border: '1px solid rgba(128,128,128,0.15)', color: '#4ADE80', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {apiKey}
              </code>
              <button
                onClick={copyKey}
                style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0.5rem 0.875rem', borderRadius: '0.5rem', background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(128,128,128,0.08)', color: copied ? 'var(--color-primary-dark)' : '#737373', border: '1px solid rgba(128,128,128,0.15)', cursor: 'pointer' }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#ef4444' }}>
              Copy this key now. It is only shown on this page, until you leave it.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem', width: '100%' }}>
              <button
                onClick={generateApiKey}
                disabled={generating || isDemo}
                className="btn bg-brand text-brand-on-bg"
                style={{ width: '33%', fontSize: '0.82rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '0.625rem' }}
              >
                {generating ? 'Generating...' : hasKey ? 'Regenerate API key' : 'Generate API key'}
              </button>

              {hasKey && (
                <button
                  onClick={revokeApiKey}
                  disabled={revoking}
                  className="btn"
                  style={{ width: '33%', fontSize: '0.82rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.18)' }}
                >
                  {revoking ? 'Revoking...' : 'Revoke key'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem', width: '100%' }}>
            <button
              onClick={generateApiKey}
              disabled={generating || isDemo}
              className="btn bg-brand text-brand-on-bg"
              style={{ width: '33%', fontSize: '0.82rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '0.625rem' }}
            >
              {generating ? 'Generating...' : hasKey ? 'Regenerate API key' : 'Generate API key'}
            </button>

            {hasKey && (
              <button
                onClick={revokeApiKey}
                disabled={revoking}
                className="btn"
                style={{ width: '33%', fontSize: '0.82rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.18)' }}
              >
                {revoking ? 'Revoking...' : 'Revoke key'}
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="dash-section-title">Base URL</div>
        <CodeBlock label="Base URL" code={BASE_URL} />
      </div>

      <div>
        <div className="dash-section-title">Authentication</div>
        <CodeBlock
          label="Request header"
          code={`Authorization: Bearer ${apiKey ?? 'YOUR_API_KEY'}`}
        />
      </div>

      <div>
        <div className="dash-section-title">Endpoints</div>
        <p style={{ fontSize: '0.78rem', color: '#737373', lineHeight: 1.65, margin: '0 0 0.75rem' }}>
          Every endpoint below needs the Bearer key. Errors return <code>{`{ "error": "message" }`}</code> with status 400 (bad input), 401 (missing or wrong key) or 500.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

          <EndpointCard method="GET" path="/api/devices" description="List your devices">
            <CodeBlock label="Response" code={`{
  "devices": [
    {
      "device_id": "${deviceId}",
      "owner_username": "your-username",
      "installed_at": "2026-10-05T10:00:00Z",
      "last_contacted_at": "2026-10-05T22:30:00Z"
    }
  ]
}`} />
          </EndpointCard>

          <EndpointCard method="POST" path="/api/engine" description="Run the analysis on the last 30 days of readings">
            <Note>
              Runs the rule engine for one device (omit <code>deviceId</code> for all). Rate per kWh, location and monthly usage come from the device's own settings. Atmos sensors do not measure power, so energy figures are estimates from assumed appliance loads. <code>roomAreaM2</code> defaults to 20 and sets the benchmark. Results are cached for 60 seconds.
            </Note>
            <CodeBlock label="Request body" code={JSON.stringify({ deviceId, roomAreaM2: 20 }, null, 2)} />
            <CodeBlock label="Response" code={`{
  "optimizations": [
    {
      "group": "Lighting",
      "severity": "warning",
      "title": "Lights on in empty room",
      "message": "...",
      "saving": { "inr": "2.40" },
      "timestamp": "2026-10-05T10:30:00Z"   // sensor reading time
    }
  ],
  "environmental": {
    "monthlyKwh": 300,
    "monthlyKwhKnown": false,       // true once you enter it in Devices
    "benchmarkMonthlyKwh": 300,
    "periodDays": 28,
    "estimatedKwh": 280.4,
    "benchmarkKwh": 280,
    "avoidableKwh": 41.2,
    "weeklyData": [{ "week": "...", "kwh": "70.1", "baseline": "70.0", "avoidable": "9.8", "hasData": true }]
  },
  "analysis": {
    "lighting": { "l1Events": [], "l2Events": [] },
    "hvac":     { "t1Events": [], "t2Events": [], "t3Events": [] },
    "standby":  { "s1Events": [] },
    "trends":   { "trend1": {}, "trend2": {}, "dailyBreakdown": [] }
  },
  "readings": [],
  "outdoorWeather": { "temp": 28.4, "condition": "Clear" },
  "weatherError": null
}`} />
          </EndpointCard>

          <EndpointCard method="GET" path={`/api/alerts?deviceId=${deviceId}`} description="Alert log, newest sensor reading first">
            <Note>
              <code>deviceId</code> is optional. <code>when</code> is the time of the sensor reading the alert is about; <code>created_at</code> is when Atmos wrote it.
            </Note>
            <CodeBlock label="Response" code={`{
  "alerts": [
    {
      "id": "uuid",
      "device_id": "${deviceId}",
      "group_name": "Standby",
      "severity": "warning",
      "title": "Idle devices in an empty room",
      "message": "...",
      "saving_inr": 3.2,
      "acknowledged": false,
      "created_at": "2026-10-05T22:30:00Z",
      "when": "2026-10-05T10:30:00Z"
    }
  ]
}`} />
          </EndpointCard>

          <EndpointCard method="POST" path="/api/alerts" description="Generate alerts from the latest analysis">
            <Note>
              Runs the engine, asks the AI layer to write the recommendations (falls back to the engine's own text), skips titles already raised in the last six hours, and stores the rest. One run per 30 seconds per account, and nothing is generated during your quiet hours.
            </Note>
            <CodeBlock label="Request body" code={JSON.stringify({ deviceId, roomAreaM2: 20 }, null, 2)} />
            <CodeBlock label="Response" code={`{ "synced": 2, "source": "ai" }

// nothing new
{ "synced": 0, "reason": "cooldown" | "quiet_hours" | "no_new_optimizations" }`} />
          </EndpointCard>

          <EndpointCard method="POST" path="/api/alerts/acknowledge" description="Mark alerts as read">
            <CodeBlock label="Specific alerts" code={`{ "ids": ["uuid-1", "uuid-2"] }`} />
            <CodeBlock label="All alerts, optionally for one device" code={`{ "all": true, "deviceId": "${deviceId}" }`} />
            <CodeBlock label="Response" code={`{ "ok": true }`} />
          </EndpointCard>

          <EndpointCard method="GET" path="/api/alerts/preferences" description="Read your alert settings">
            <CodeBlock label="Response" code={`{
  "preferences": {
    "quiet_hours_enabled": true,
    "quiet_hours_start": 22,
    "quiet_hours_end": 6
  }
}`} />
          </EndpointCard>

          <EndpointCard method="POST" path="/api/alerts/preferences" description="Save your alert settings">
            <CodeBlock label="Request body" code={`{ "quiet_hours_enabled": true, "quiet_hours_start": 22, "quiet_hours_end": 6 }`} />
            <CodeBlock label="Response" code={`{ "ok": true }`} />
          </EndpointCard>

          <EndpointCard method="POST" path="/api/devices/clear-history" description="Delete all stored readings of a device">
            <Note>Permanent. Only works on devices you own.</Note>
            <CodeBlock label="Request body" code={JSON.stringify({ deviceId }, null, 2)} />
            <CodeBlock label="Response" code={`{ "success": true }`} />
          </EndpointCard>

          <EndpointCard method="PATCH" path="/api/devices/settings" description="Change one device's name, rate, location or monthly usage">
            <Note>
              Send only the fields you want to change. An empty value goes back to the default. The device ID itself never changes.
            </Note>
            <CodeBlock label="Request body" code={JSON.stringify({ deviceId, display_name: 'Meeting room', tariff_rate: 8.5, monthly_kwh: 320, latitude: 28.61, longitude: 77.21 }, null, 2)} />
            <CodeBlock label="Response" code={`{ "device": { "device_id": "${deviceId}", "display_name": "Meeting room" } }`} />
          </EndpointCard>

          <EndpointCard method="POST" path="/api/devices/link" description="Link a device to your account with its private key">
            <CodeBlock label="Request body" code={JSON.stringify({ privateKey: 'DEVICE_PRIVATE_KEY' }, null, 2)} />
            <CodeBlock label="Response" code={`{ "device": { "device_id": "${deviceId}" }, "already": false }`} />
          </EndpointCard>

          <EndpointCard method="POST" path="/api/devices/unlink" description="Remove a device from your account">
            <CodeBlock label="Request body" code={JSON.stringify({ deviceId }, null, 2)} />
            <CodeBlock label="Response" code={`{ "success": true }`} />
          </EndpointCard>

        </div>
      </div>

      <div>
        <div className="dash-section-title">Sensor endpoint</div>
        <EndpointCard method="POST" path="/api/device/reading" description="Used by the Atmos sensor unit">
          <Note>
            The hardware posts here every few minutes. It does <strong>not</strong> use your API key. It signs in with its own <code>device_id</code> and <code>private_key</code> (printed on the unit). The unit reports temperature, humidity, light and occupancy, and all are optional; <code>timestamp</code> defaults to the server time. <code>auto_actions</code> reports what the unit switched on its own.
          </Note>
          <CodeBlock label="Request body" code={`{
  "device_id": "${deviceId}",
  "private_key": "DEVICE_PRIVATE_KEY",
  "timestamp": "2026-10-05T22:30:00Z",
  "temperature": 27.1, "humidity": 54, "light": 120, "occupancy": 0,
  "auto_actions": [{ "device": "light", "action": "off", "reason": "empty", "ago_s": 12 }]
}`} />
          <CodeBlock label="Response" code={`{
  "ok": true,
  "config": {
    "enabled": true, "light_min": 30, "light_bright_min": 10,
    "fan_min": 60, "ac_min": 60, "bright_lux": 300
  }
}`} />
        </EndpointCard>
      </div>

      <div>
        <div className="dash-section-title">Example: curl</div>
        <CodeBlock
          label="curl"
          code={`curl -X POST ${BASE_URL}/api/engine \\
  -H "Authorization: Bearer ${apiKey ?? 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"deviceId":"${deviceId}","roomAreaM2":20}'`}
        />
      </div>

      <div>
        <div className="dash-section-title">Example: JavaScript</div>
        <CodeBlock
          label="JavaScript (fetch)"
          code={`const res = await fetch('${BASE_URL}/api/engine', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ${apiKey ?? 'YOUR_API_KEY'}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ deviceId: '${deviceId}', roomAreaM2: 20 }),
});
if (!res.ok) throw new Error((await res.json()).error);
const { optimizations, environmental } = await res.json();`}
        />
      </div>

      <div style={{ fontSize: '0.75rem', color: '#737373', lineHeight: 1.7, padding: '1rem', background: 'rgba(128,128,128,0.04)', borderRadius: '0.75rem', border: '1px solid rgba(128,128,128,0.1)' }}>
        <strong style={{ color: 'inherit' }}>Security note:</strong> Anyone with your key can read your devices, alerts and readings, and can clear history or unlink devices. Share it only with apps you trust, revoke it if it leaks, and please use the API fairly.
      </div>
    </div>
  );
}