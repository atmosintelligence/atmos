'use client';

import { useState } from 'react';
import Modal from './Modal';
import Icon from '@/components/Icon';
import { useDevice } from '@/app/dashboard/DeviceContext';

// "Link new device": the owner types the private key printed on the unit.
export default function LinkDeviceModal({ onClose }) {
  const { isDemo, setDevices, setSelectedId, triggerRefresh } = useDevice();
  const [key, setKey]         = useState('');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState('');
  const [linked, setLinked]   = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (isDemo || busy) return;
    setBusy(true);
    setError('');

    try {
      const res  = await fetch('/api/devices/link', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ privateKey: key }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) { setError(body.error || 'Could not link the device. Try again.'); return; }

      const list = await fetch('/api/devices').then(r => r.json()).catch(() => null);
      if (list?.devices) setDevices(list.devices);
      setSelectedId(body.device.device_id);
      triggerRefresh();
      setLinked({ id: body.device.device_id, already: body.already });
    } catch {
      setError('Could not reach the server. Check your connection.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Link a new device" onClose={onClose}>
      {linked ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            <strong>{linked.id}</strong> {linked.already ? 'was already linked to your account.' : 'is now linked to your account.'} Readings will show up here once it has sent a few.
          </p>
          <button type="button" className="dash-btn primary" onClick={onClose}>Done</button>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.82rem', color: '#737373', lineHeight: 1.6 }}>
            Enter the private key printed on your device. It links the device to your account, and only you can see its data.
          </p>
          <div className="dash-field">
            <label htmlFor="private-key">Private key</label>
            <input
              id="private-key"
              className="field-input"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Paste the key from your device"
              disabled={isDemo}
              aria-describedby={error ? 'link-error' : undefined}
              aria-invalid={Boolean(error)}
            />
            {error && <span id="link-error" className="err" role="alert">{error}</span>}
            {isDemo && <span className="hint">Linking is turned off in Demo Mode. Create a free account to link a device.</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="dash-btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="dash-btn primary" disabled={isDemo || busy || key.trim().length < 8}>
              <Icon name="link" size={16} />
              {busy ? 'Linking...' : 'Link device'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
