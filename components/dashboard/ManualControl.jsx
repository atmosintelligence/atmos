'use client';

import { useState } from 'react';
import Select from '@/components/dashboard/Select';

const ROLE_LABEL = { light: 'Lights', fan: 'Fan', ac: 'AC', board: 'Switchboard', unassigned: 'Not assigned' };

const roleOf  = d => d.role_override || d.role || 'unassigned';
const stateOf = d => d.desired_state ?? d.power_state ?? 'unknown';
const waiting = d => Boolean(d.desired_state) && d.desired_state !== d.power_state;
const canSwitch = d => d.controllable !== false && d.managed !== false && d.reachable !== false;

function signal(rssi) {
  if (rssi == null) return null;
  if (rssi >= -60) return 'Strong signal';
  if (rssi >= -70) return 'Fair signal';
  return 'Weak signal';
}

function seen(value) {
  if (!value) return null;
  const mins = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return 'Seen just now';
  if (mins < 60) return `Seen ${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Seen ${hours} h ago`;
  return `Seen ${Math.round(hours / 24)} days ago`;
}

function Switch({ checked, disabled, busy, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={busy || undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`dash-switch ${checked ? 'on' : ''} ${busy ? 'busy' : ''}`}
    >
      <span className="dash-switch-knob" />
    </button>
  );
}

// "Manual control" on the Automation page: every smart device the unit has found, with a
// switch for each. Today's unit firmware cannot take switches from the dashboard yet, so the
// switches work in the demo and are shown read-only for real units.
export default function ManualControl({ devices, isDemo, onUpdated, onAction }) {
  const [busy, setBusy]   = useState(null);
  const [error, setError] = useState(null);
  const live = isDemo;
  const switchable = live ? devices.filter(canSwitch) : [];
  const [picked, setPicked] = useState(null);
  const current = switchable.find(d => d.mac === picked) ?? switchable[0] ?? null;

  async function flip(device, on) {
    const state = on ? 'on' : 'off';
    setBusy(device.mac);
    setError(null);
    try {
      if (!live) throw new Error('Manual switching needs a newer unit firmware.');
      onUpdated({ mac: device.mac, desired_state: state });
      await new Promise(r => setTimeout(r, 700));
      onUpdated({ mac: device.mac, power_state: state, desired_state: null, power_w: state === 'off' ? 0 : device.has_metering ? 118.4 : null });
      onAction?.({ target: roleOf(device), action: state, reason: `${device.name || 'Device'}, switched from the dashboard`, timestamp: new Date().toISOString() });
    } catch (err) {
      setError(err.message);
    }
    setBusy(null);
  }

  const firmwareNote = 'Switching devices from the dashboard arrives with a newer unit firmware. Until then your unit turns them off by itself when the room is empty, using the Auto-off times above.';

  if (!devices.length) {
    return (
      <div className="dash-device-card">
        <p className="hint" style={{ margin: 0 }}>
          {live ? 'No smart devices found yet. Once your unit finds smart plugs or switches on your Wi-Fi, they appear here with an on/off switch.' : firmwareNote}
        </p>
      </div>
    );
  }

  const currentOn = current ? stateOf(current) === 'on' : false;

  return (
    <div className="dash-device-card" style={{ gap: '1rem' }}>
      <div className="manual-quick">
        <div style={{ minWidth: 0, flex: '1 1 14rem' }}>
          <span className="auto-field-label">Smart device</span>
          <Select
            label="Smart device"
            value={current?.mac ?? ''}
            options={switchable.length
              ? switchable.map(d => ({ value: d.mac, label: d.name || d.model || d.mac, hint: `${ROLE_LABEL[roleOf(d)] ?? 'Device'} · ${stateOf(d) === 'on' ? 'on' : 'off'}` }))
              : [{ value: '', label: 'None can be switched right now' }]}
            disabled={!switchable.length}
            onChange={setPicked}
          />
        </div>
        <button
          type="button"
          className={`dash-btn ${currentOn ? 'danger' : 'primary'}`}
          disabled={!current || busy === current?.mac}
          onClick={() => current && flip(current, !currentOn)}
          style={{ alignSelf: 'flex-end' }}
        >
          {busy && busy === current?.mac ? 'Sending...' : currentOn ? 'Switch off' : 'Switch on'}
        </button>
      </div>

      {error && <p role="alert" style={{ fontSize: '0.78rem', color: '#ef4444', margin: 0 }}>{error}</p>}

      <ul className="manual-list" aria-label="Smart devices">
        {devices.map(d => {
          const on = stateOf(d) === 'on';
          const details = [
            ROLE_LABEL[roleOf(d)],
            d.model,
            d.has_metering && d.power_w != null && d.power_state === 'on' ? `${Math.round(d.power_w)} W now` : null,
            signal(d.rssi),
            seen(d.last_seen_at),
          ].filter(Boolean);
          const status = d.reachable === false ? { text: 'Not reachable', tone: 'off' }
            : d.controllable === false ? { text: 'Cannot be switched', tone: 'muted' }
            : d.managed === false ? { text: 'Not managed by Atmos', tone: 'muted' }
            : waiting(d) ? { text: 'Waiting for the unit', tone: 'wait' }
            : { text: on ? 'On' : d.power_state === 'off' ? 'Off' : 'Unknown', tone: on ? 'on' : 'muted' };

          return (
            <li key={d.mac} className="manual-row">
              <div style={{ minWidth: 0 }}>
                <div className="manual-name">{d.name || d.model || d.mac}</div>
                <div className="manual-meta">{details.join(' · ')}</div>
              </div>
              <div className="manual-actions">
                <span className={`manual-status ${status.tone}`}>{status.text}</span>
                <Switch
                  checked={on}
                  busy={busy === d.mac}
                  disabled={!live || !canSwitch(d) || busy === d.mac}
                  label={`${d.name || 'Device'}: ${on ? 'on' : 'off'}`}
                  onChange={next => flip(d, next)}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="hint" style={{ margin: 0 }}>
        {isDemo ? 'Demo mode: switches change this page only.' : firmwareNote}
      </p>
    </div>
  );
}
