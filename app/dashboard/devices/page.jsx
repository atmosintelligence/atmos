'use client';

import { useState } from 'react';
import { useDevice } from '../DeviceContext';
import { useRouter } from 'next/navigation';

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).replace('am', 'AM').replace('pm', 'PM');
}

export default function DevicesPage() {
  const router = useRouter();
  const { devices, selectedId, setSelectedId, loadingDevices, triggerRefresh, setDevices, isDemo } = useDevice();
  const [confirming, setConfirming] = useState(null);
  const [unlinking, setUnlinking]   = useState(null);

  async function handleUnlink(deviceId) {
    setUnlinking(deviceId);
    const res = await fetch('/api/devices/unlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    if (res.ok) {
      const remaining = devices.filter(d => d.device_id !== deviceId);
      setDevices(remaining);
      if (remaining.length === 0) {
        router.replace('/dashboard/no-device');
      }
      setConfirming(null);
      if (selectedId === deviceId) {
        if (remaining.length > 0) {
          setSelectedId(remaining[0].device_id);
        } else {
          setSelectedId(null);
        }
      }
      triggerRefresh();
    }
    setUnlinking(null);
  }

  if (loadingDevices) return (
    <div className="dash-empty" style={{ border: 'none' }}>Loading devices...</div>
  );

  if (!devices.length) return (
    <div className="dash-empty">No devices registered to your account.</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div className="dash-greeting">
        <div className="dash-greeting-name">Devices</div>
        <div className="dash-greeting-sub">All hardware devices registered to your account.</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {devices.map(d => (
          <div key={d.device_id} className="dash-device-card">
            <div className="dash-device-card-header">
              <span className="dash-device-id font-heading" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{d.device_id}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'flex-end' }}>
                <button
                  className={`dash-device-badge select-none ${selectedId === d.device_id ? 'selected' : ''}`}
                  onClick={() => setSelectedId(d.device_id)}
                >
                  {selectedId === d.device_id ? 'Selected' : 'Select'}
                </button>
                {confirming === d.device_id ? (
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button
                      onClick={() => handleUnlink(d.device_id)}
                      disabled={unlinking === d.device_id}
                      style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                    >
                      {unlinking === d.device_id ? 'Unlinking...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirming(null)}
                      style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(0,0,0,0.06)', color: '#737373', border: 'none', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  !isDemo && (
                    <button
                      className="dash-device-badge select-none"
                      onClick={() => setConfirming(d.device_id)}
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}
                    >
                      Unlink
                    </button>
                  )
                )}
              </div>
            </div>
            <div className="dash-device-meta">
              <div className="dash-device-meta-item">
                <span className="dash-device-meta-label">Installed</span>
                <span className="dash-device-meta-value">{formatDate(d.installed_at)}</span>
              </div>
              <div className="dash-device-meta-item">
                <span className="dash-device-meta-label">Last contacted</span>
                <span className="dash-device-meta-value">{formatDate(d.last_contacted_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}