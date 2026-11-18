'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_CONFIG } from '@/lib/automation';

const FIELDS = [
  { key: 'light_min',        label: 'Lights',                 unit: 'min', min: 1, max: 1440 },
  { key: 'light_bright_min', label: 'Lights, if bright', unit: 'min', min: 0, max: 1440, hint: '0 = never' },
  { key: 'fan_min',          label: 'Fan',                    unit: 'min', min: 1, max: 1440 },
  { key: 'ac_min',           label: 'AC',                     unit: 'min', min: 1, max: 1440 },
  { key: 'bright_lux',       label: 'Bright from',            unit: 'lux',       min: 1, max: 65000 },
];

// "Auto-off" on the Automation page: how long the room must be empty before the unit
// switches each kind of smart device off. Saved to the device; the unit downloads it with
// its next reading.
export default function AutoOffSettings({ deviceId, isDemo }) {
  const [config, setConfig] = useState(null);
  const [draft, setDraft]   = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState(null);

  useEffect(() => {
    if (!deviceId) return;
    let cancelled = false;
    setMsg(null);
    if (isDemo) {
      setConfig(DEFAULT_CONFIG); setDraft(DEFAULT_CONFIG);
      return;
    }
    setConfig(null);
    fetch(`/api/devices/automation?deviceId=${encodeURIComponent(deviceId)}`)
      .then(r => r.json().then(j => (r.ok ? j : Promise.reject(new Error(j.error || 'Could not load settings')))))
      .then(j => { if (!cancelled) { setConfig(j.config); setDraft(j.config); } })
      .catch(err => { if (!cancelled) { setConfig(DEFAULT_CONFIG); setDraft(DEFAULT_CONFIG); setMsg({ type: 'error', text: err.message }); } });
    return () => { cancelled = true; };
  }, [deviceId, isDemo]);

  if (!draft) return <div className="dash-device-card"><span className="hint">Loading auto-off settings...</span></div>;

  const changed = Object.keys(DEFAULT_CONFIG).filter(k => String(draft[k]) !== String(config[k]));

  async function save(e) {
    e.preventDefault();
    setMsg(null);
    const patch = Object.fromEntries(changed.map(k => [k, k === 'enabled' ? draft[k] : Number(draft[k])]));
    for (const f of FIELDS) {
      const v = Number(draft[f.key]);
      if (!Number.isInteger(v) || v < f.min || v > f.max) {
        setMsg({ type: 'error', text: `${f.label}: enter a whole number from ${f.min} to ${f.max}.` });
        return;
      }
    }
    setSaving(true);
    try {
      if (isDemo) {
        const next = { ...config, ...patch };
        setConfig(next); setDraft(next);
        setMsg({ type: 'ok', text: 'Saved for this demo.' });
      } else {
        const res  = await fetch('/api/devices/automation', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId, ...patch }) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || 'Could not save');
        setConfig(json.config); setDraft(json.config);
        setMsg({ type: 'ok', text: 'Saved. Your unit picks this up with its next reading, within 10 minutes.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="dash-device-card" style={{ gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 16rem' }}>
          <div className="dash-section-title" style={{ marginBottom: '0.25rem' }}>Auto-off when the room is empty</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
            Your unit watches the room and switches its smart lights, fans and ACs off once it has been empty for this many minutes.
          </p>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
          {draft.enabled ? 'On' : 'Off'}
          <button
            type="button"
            role="switch"
            aria-checked={draft.enabled}
            aria-label="Auto-off"
            className={`dash-switch ${draft.enabled ? 'on' : ''}`}
            onClick={() => setDraft(d => ({ ...d, enabled: !d.enabled }))}
          >
            <span className="dash-switch-knob" />
          </button>
        </label>
      </div>

      <div className="auto-off-grid" style={{ opacity: draft.enabled ? 1 : 0.5 }}>
        {FIELDS.map(f => (
          <label key={f.key} className="auto-off-field">
            <span className="auto-field-label">{f.label}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <input
                type="number"
                inputMode="numeric"
                min={f.min}
                max={f.max}
                step={1}
                value={draft[f.key]}
                disabled={!draft.enabled}
                onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                className="field-input"
                style={{ width: '4.75rem' }}
              />
              <span className="hint">{f.unit}</span>
            </span>
            {f.hint && <span className="hint">{f.hint}</span>}
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={saving || changed.length === 0}
          className="btn bg-brand text-brand-on-bg"
          style={{ fontSize: '0.82rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '0.625rem' }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {msg && <span role={msg.type === 'error' ? 'alert' : 'status'} style={{ fontSize: '0.78rem', color: msg.type === 'error' ? '#ef4444' : 'var(--text-muted)' }}>{msg.text}</span>}
      </div>
    </form>
  );
}
