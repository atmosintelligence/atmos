'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDevice } from '../DeviceContext';
import Icon from '@/components/Icon';
import PageHeader from '@/components/dashboard/PageHeader';
import LinkDeviceModal from '@/components/dashboard/LinkDeviceModal';
import DeviceSettingsForm from '@/components/dashboard/DeviceSettingsForm';
import { exportDevicePDF, exportDeviceJSON } from '@/lib/exportDevice';
import { deviceLabel } from '@/lib/deviceSettings';

const fmt = s => (s
  ? new Date(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace('am', 'AM').replace('pm', 'PM')
  : '—');

function lastSeen(s) {
  if (!s) return { text: 'Not heard from yet', tone: '#737373' };
  const mins = Math.round((Date.now() - new Date(s)) / 60000);
  if (mins < 30)   return { text: 'Online', tone: '#16a34a' };
  if (mins < 1440) return { text: `Last seen ${Math.max(1, Math.round(mins / 60))} h ago`, tone: '#b45309' };
  return { text: `Last seen ${Math.round(mins / 1440)} days ago`, tone: '#ef4444' };
}

function DeviceCard({ d }) {
  const router = useRouter();
  const ctx = useDevice();
  const { selectedId, setSelectedId, isDemo, devices, setDevices, triggerRefresh, settingsFor, profile, cache, getDemoReadings } = ctx;
  const [open, setOpen]         = useState(false);
  const [busy, setBusy]         = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError]       = useState('');
  const selected = selectedId === d.device_id;
  const status = lastSeen(d.last_contacted_at);

  async function run(kind) {
    setBusy(kind); setError('');
    try {
      const args = {
        device: d, settings: settingsFor(d.device_id), profile, isDemo,
        demoReadings: isDemo ? getDemoReadings(d.device_id) : null,
        alerts: cache[`alerts-${d.device_id}`]?.alerts ?? [],
      };
      await (kind === 'pdf' ? exportDevicePDF(args) : exportDeviceJSON(args));
    } catch (e) {
      console.error(e);
      setError('The export did not work. Please try again.');
    }
    setBusy('');
  }

  async function unlink() {
    setBusy('unlink'); setError('');
    const res = await fetch('/api/devices/unlink', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: d.device_id }),
    });
    if (!res.ok) { setError('Could not unlink this device.'); setBusy(''); return; }
    const remaining = devices.filter(x => x.device_id !== d.device_id);
    setDevices(remaining);
    if (!remaining.length) router.replace('/dashboard/no-device');
    else if (selected) setSelectedId(remaining[0].device_id);
    triggerRefresh();
    setBusy('');
  }

  return (
    <article className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} aria-label={deviceLabel(d)}>
      <div className="dash-card-head" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <span className="dash-stat-icon" style={{ position: 'static', width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', justifyContent: 'center', color: 'var(--color-primary-dark)', background: 'rgba(74,222,128,0.12)' }}>
            <Icon name="sensor" size={24} />
          </span>
          <div>
            <h2 className="font-heading" style={{ fontSize: '1.2rem', letterSpacing: '-0.01em', margin: 0 }}>{deviceLabel(d)}</h2>
            <div className="dash-card-sub" style={{ marginTop: '0.1rem' }}>
              {d.display_name ? `${d.device_id} · ` : ''}
              <span style={{ color: status.tone, fontWeight: 600 }}>{status.text}</span>
            </div>
          </div>
        </div>
        <button type="button" className={`dash-btn ${selected ? 'primary' : 'ghost'}`} onClick={() => setSelectedId(d.device_id)} aria-pressed={selected}>
          {selected && <Icon name="check" size={16} />}{selected ? 'Showing' : 'Show on dashboard'}
        </button>
      </div>

      <dl style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', margin: 0 }}>
        <div><dt className="dash-stat-label">Installed</dt><dd style={{ margin: 0, fontSize: '0.875rem' }}>{fmt(d.installed_at)}</dd></div>
        <div><dt className="dash-stat-label">Last contacted</dt><dd style={{ margin: 0, fontSize: '0.875rem' }}>{fmt(d.last_contacted_at)}</dd></div>
      </dl>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="dash-btn ghost" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          <Icon name="settings" size={16} /> {open ? 'Hide settings' : 'Settings'}
        </button>
        <button type="button" className="dash-btn ghost" onClick={() => run('pdf')} disabled={Boolean(busy)}>
          <Icon name="file" size={16} /> {busy === 'pdf' ? 'Preparing...' : 'Report (PDF)'}
        </button>
        <button type="button" className="dash-btn ghost" onClick={() => run('json')} disabled={Boolean(busy)}>
          <Icon name="download" size={16} /> {busy === 'json' ? 'Preparing...' : 'Data (JSON)'}
        </button>
        {!isDemo && (confirming ? (
          <>
            <button type="button" className="dash-btn danger" onClick={unlink} disabled={busy === 'unlink'}>{busy === 'unlink' ? 'Unlinking...' : 'Yes, unlink'}</button>
            <button type="button" className="dash-btn ghost" onClick={() => setConfirming(false)}>Cancel</button>
          </>
        ) : (
          <button type="button" className="dash-btn ghost" onClick={() => setConfirming(true)} style={{ marginLeft: 'auto' }}>Unlink</button>
        ))}
      </div>
      {error && <p role="alert" className="err" style={{ fontSize: '0.8rem' }}>{error}</p>}

      {open && (
        <div style={{ borderTop: '1px solid rgba(128,128,128,0.2)', paddingTop: '1rem' }}>
          <DeviceSettingsForm device={d} />
        </div>
      )}
    </article>
  );
}

export default function DevicesPage() {
  const { devices, loadingDevices } = useDevice();
  const [linking, setLinking] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      <PageHeader
        title="Devices"
        sub="Your Atmos units. Each has its own name, rate and location, and its own report."
        actions={<button type="button" className="dash-btn primary" onClick={() => setLinking(true)}><Icon name="plus" size={16} /> Link new device</button>}
      />

      {loadingDevices && <div className="dash-empty" style={{ border: 'none' }} aria-busy="true">Loading devices...</div>}
      {!loadingDevices && !devices.length && <div className="dash-empty">No devices yet. Use “Link new device” and enter the private key from your unit.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {devices.map(d => <DeviceCard key={d.device_id} d={d} />)}
      </div>

      {linking && <LinkDeviceModal onClose={() => setLinking(false)} />}
    </div>
  );
}
