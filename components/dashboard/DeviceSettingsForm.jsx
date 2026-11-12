'use client';

import { useId, useState } from 'react';
import Icon from '@/components/Icon';
import { useDevice } from '@/app/dashboard/DeviceContext';
import { resolveDeviceSettings, cleanDeviceSettings, DEVICE_SETTING_LIMITS } from '@/lib/deviceSettings';

const str = v => (v == null ? '' : String(v));

// The settings for one device. Empty fields use the defaults shown under each box.
export default function DeviceSettingsForm({ device, onSaved }) {
  const { profile, isDemo, updateDevice } = useDevice();
  const uid = useId();
  const resolved = resolveDeviceSettings({ ...device, display_name: null, tariff_rate: null, latitude: null, longitude: null, monthly_kwh: null }, profile);

  const [form, setForm] = useState({
    display_name: str(device.display_name),
    tariff_rate:  str(device.tariff_rate),
    monthly_kwh:  str(device.monthly_kwh),
    latitude:     str(device.latitude),
    longitude:    str(device.longitude),
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg]   = useState(null);
  const set = key => e => { setForm(f => ({ ...f, [key]: e.target.value })); setMsg(null); };

  function detect() {
    if (!navigator.geolocation) { setMsg({ error: 'Your browser cannot find your location. Type the coordinates in.' }); return; }
    navigator.geolocation.getCurrentPosition(
      pos => setForm(f => ({ ...f, latitude: pos.coords.latitude.toFixed(4), longitude: pos.coords.longitude.toFixed(4) })),
      () => setMsg({ error: 'Could not find your location. Type the coordinates in.' }),
    );
  }

  async function save(e) {
    e.preventDefault();
    const { value, error } = cleanDeviceSettings(form);
    if (error) { setMsg({ error }); return; }
    setBusy(true); setMsg(null);
    try {
      if (isDemo) {
        updateDevice({ device_id: device.device_id, ...value });
      } else {
        const res = await fetch('/api/devices/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: device.device_id, ...value }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || 'Could not save');
        updateDevice({ device_id: device.device_id, ...(body.device ?? value) });
      }
      setMsg({ ok: isDemo ? 'Saved for this demo session.' : 'Saved. Your numbers will update shortly.' });
      onSaved?.();
    } catch (err) {
      setMsg({ error: err.message });
    } finally {
      setBusy(false);
    }
  }

  const { tariff, monthlyKwh } = DEVICE_SETTING_LIMITS;

  return (
    <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
      <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))' }}>
        <div className="dash-field">
          <label htmlFor={`${uid}-name`}>Name</label>
          <input id={`${uid}-name`} className="field-input" value={form.display_name} onChange={set('display_name')}
                 maxLength={DEVICE_SETTING_LIMITS.name.max} placeholder={device.device_id} aria-describedby={`${uid}-name-h`} />
          <span id={`${uid}-name-h`} className="hint">Shown on your dashboard only. The device ID {device.device_id} never changes.</span>
        </div>

        <div className="dash-field">
          <label htmlFor={`${uid}-rate`}>Electricity rate (₹ per kWh)</label>
          <input id={`${uid}-rate`} className="field-input" type="number" inputMode="decimal" step="0.01" min={tariff.min} max={tariff.max}
                 value={form.tariff_rate} onChange={set('tariff_rate')} placeholder={str(resolved.tariff)} aria-describedby={`${uid}-rate-h`} />
          <span id={`${uid}-rate-h`} className="hint">Turns saved energy into rupees. Leave empty to use ₹{resolved.tariff}.</span>
        </div>

        <div className="dash-field">
          <label htmlFor={`${uid}-kwh`}>Monthly electricity use (kWh)</label>
          <input id={`${uid}-kwh`} className="field-input" type="number" inputMode="decimal" step="1" min={monthlyKwh.min} max={monthlyKwh.max}
                 value={form.monthly_kwh} onChange={set('monthly_kwh')} placeholder={str(resolved.monthlyKwhDefault)} aria-describedby={`${uid}-kwh-h`} />
          <span id={`${uid}-kwh-h`} className="hint">From your bill, for this room. Atmos cannot measure power, so this makes estimates closer. Empty uses {resolved.monthlyKwhDefault} kWh, a typical 20 m² room.</span>
        </div>
      </div>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="dash-stat-label" style={{ marginBottom: '0.5rem' }}>Location, for outdoor weather</legend>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="dash-field" style={{ flex: '1 1 8rem' }}>
            <label htmlFor={`${uid}-lat`}>Latitude</label>
            <input id={`${uid}-lat`} className="field-input" type="number" step="0.0001" value={form.latitude} onChange={set('latitude')} placeholder={resolved.latitude != null ? String(resolved.latitude) : '28.6139'} />
          </div>
          <div className="dash-field" style={{ flex: '1 1 8rem' }}>
            <label htmlFor={`${uid}-lon`}>Longitude</label>
            <input id={`${uid}-lon`} className="field-input" type="number" step="0.0001" value={form.longitude} onChange={set('longitude')} placeholder={resolved.longitude != null ? String(resolved.longitude) : '77.2090'} />
          </div>
          <button type="button" className="dash-btn ghost" onClick={detect}><Icon name="mapPin" size={16} /> Use my location</button>
        </div>
        <span className="hint" style={{ display: 'block', marginTop: '0.4rem' }}>Only a rounded position is used, and it is never tied to your name.</span>
      </fieldset>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="submit" className="dash-btn primary" disabled={busy}>{busy ? 'Saving...' : 'Save settings'}</button>
        {msg?.ok    && <span role="status" style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)' }}>{msg.ok}</span>}
        {msg?.error && <span role="alert" className="err" style={{ fontSize: '0.8rem' }}>{msg.error}</span>}
      </div>
    </form>
  );
}
