'use client';

import { useEffect, useState } from 'react';
import { useDevice } from '../DeviceContext';
import { createClient } from '@/utils/supabase/client';

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

export default function ApiPage() {
  const { selectedId, isDemo } = useDevice();
  const [hasKey, setHasKey] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [userId, setUserId]     = useState(null);

  const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from('profiles')
        .select('api_key')
        .eq('id', user.id)
        .single();
      if (data?.api_key) setHasKey(true);
    });
  }, []);

  async function generateApiKey() {
    setGenerating(true);
    const key = 'atmos_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ api_key: key }).eq('id', user.id);
      setApiKey(key);
      setHasKey(true);
    }
    setGenerating(false);
  }

  async function revokeApiKey() {
    setRevoking(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ api_key: null })
        .eq('id', user.id);
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
      <div className="dash-greeting">
        <div className="dash-greeting-name">API</div>
        <div className="dash-greeting-sub">
          Programmatic access to your sensor data and optimisation engine. Use the REST API to integrate Atmos data into your own applications, dashboards, or automations.
        </div>
      </div>

      <div className="dash-device-card">
        <div className="dash-section-title" style={{ marginBottom: '0.75rem' }}>Your API key</div>
        <p style={{ fontSize: '0.8rem', color: '#737373', lineHeight: 1.65, marginBottom: '1rem' }}>
          All API requests must include your key in the <code style={{ fontSize: '0.75rem', background: 'rgba(128,128,128,0.1)', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}>Authorization</code> header. You may integrate this API whereever you deem fit. Keep this key secret!
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
              Store this key securely. It will not be shown again after you leave this page.
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

          <EndpointCard method="POST" path="/api/engine" description="Run the optimisation engine for a device">
            <p style={{ fontSize: '0.8rem', color: '#737373', lineHeight: 1.65 }}>
              Returns all optimisations, environmental counters, and full analysis data for the specified device. Reads your Supabase profile for tariff rate and location automatically.
            </p>
            <CodeBlock label="Request body" code={JSON.stringify({ deviceId: selectedId ?? 'ATM-D001', roomAreaM2: 20 }, null, 2)} />
            <CodeBlock label="Response shape" code={`{
  "optimizations": [
    {
      "group": "Lighting",
      "severity": "warning",
      "title": "Lights on in empty room",
      "message": "...",
      "saving": { "inr": "2.40" },
      "timestamp": "2025-05-14T13:00:00.000Z"
    }
  ],
  "environmental": {
    "actualKwh": "1.23",
    "savedKwh": "0.45",
    "co2KgSaved": "0.33",
    "moneySavedINR": "4.50",
    "treesEquiv": "0",
    "weeklyData": [...]
  },
  "analysis": {
    "lighting": { "l1Events": [...], "l2Events": [...] },
    "hvac":     { "t1Events": [...], "t2Events": [...], "t3Events": [...] },
    "power":    { "p1Events": [...], "p2Events": [...], "p3Events": [...] },
    "trends":   { "trend1": {...}, "trend2": {...}, "dailyBreakdown": [...] }
  },
  "readings": [...],
  "outdoorWeather": { "temp": 28.4, "condition": "Clear" },
  "weatherError": null
}`} />
          </EndpointCard>

          <EndpointCard method="GET" path="/api/devices" description="List all devices linked to your account">
            <p style={{ fontSize: '0.8rem', color: '#737373', lineHeight: 1.65 }}>Returns all devices registered under your username in the Devices sheet.</p>
            <CodeBlock label="Response shape" code={`{
  "devices": [
    {
      "device_id": "ATM-D001",
      "owner_username": "arnadal",
      "installed_at": "2025-01-10T09:00:00",
      "last_contacted_at": "2025-05-14T23:30:00"
    }
  ]
}`} />
          </EndpointCard>

          <EndpointCard method="GET" path="/api/alerts?deviceId=ATM-D001" description="Fetch the alert log for a device">
            <p style={{ fontSize: '0.8rem', color: '#737373', lineHeight: 1.65 }}>Returns all stored alerts for the specified device, ordered by timestamp descending.</p>
            <CodeBlock label="Response shape" code={`{
  "alerts": [
    {
      "id": "uuid",
      "device_id": "ATM-D001",
      "group_name": "Power",
      "severity": "warning",
      "title": "Phantom load whilst room is empty",
      "message": "...",
      "saving_inr": 3.2,
      "acknowledged": false,
      "created_at": "2025-05-14T22:30:00Z"
    }
  ]
}`} />
          </EndpointCard>

          <EndpointCard method="POST" path="/api/alerts" description="Sync latest optimisations as new alerts">
            <p style={{ fontSize: '0.8rem', color: '#737373', lineHeight: 1.65 }}>Runs the engine and persists any new optimisations as alert records. Respects quiet hours and deduplicates alerts within the last hour.</p>
            <CodeBlock label="Request body" code={JSON.stringify({ deviceId: selectedId ?? 'ATM-D001', roomAreaM2: 20 }, null, 2)} />
            <CodeBlock label="Response shape" code={`{ "synced": 2 }`} />
          </EndpointCard>

          <EndpointCard method="POST" path="/api/alerts/acknowledge" description="Acknowledge one or more alerts">
            <CodeBlock label="Acknowledge specific IDs" code={`{ "ids": ["uuid-1", "uuid-2"] }`} />
            <CodeBlock label="Acknowledge all for a device" code={`{ "all": true, "deviceId": "ATM-D001" }`} />
          </EndpointCard>

        </div>
      </div>

      <div>
        <div className="dash-section-title">Example: Fetch optimisations with CURL</div>
        <CodeBlock
          label="curl"
          code={`curl -X POST ${BASE_URL}/api/engine \\
  -H "Content-Type: application/json" \\
  -d '{"deviceId":"${selectedId ?? 'ATM-D001'}","roomAreaM2":20}'`}
        />
      </div>

      <div>
        <div className="dash-section-title">Example: Fetch optimisations with JavaScript</div>
        <CodeBlock
          label="JavaScript (fetch)"
          code={`const res = await fetch('${BASE_URL}/api/engine', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: '${selectedId ?? 'ATM-D001'}',
    roomAreaM2: 20,
  }),
});
const { optimizations, environmental, readings } = await res.json();`}
        />
      </div>

      <div style={{ fontSize: '0.75rem', color: '#737373', lineHeight: 1.7, padding: '1rem', background: 'rgba(128,128,128,0.04)', borderRadius: '0.75rem', border: '1px solid rgba(128,128,128,0.1)' }}>
        <strong style={{ color: 'inherit' }}>Security Note:</strong> By using the API, you agree that you will make use of it fairly. Please don't abuse or encourage any abuse to the API. Always keep your API key a secret to others, and only share it to people or apps you trust. Anyone or anything with your key can view your account and device details.
      </div>
    </div>
  );
}