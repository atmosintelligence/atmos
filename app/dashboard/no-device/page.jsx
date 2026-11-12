'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import LinkDeviceModal from '@/components/dashboard/LinkDeviceModal';

export default function NoDevicePage() {
  const [linking, setLinking] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '30rem', margin: '4rem auto', alignItems: 'center', textAlign: 'center' }}>
      <div className="dash-stat-icon text-brand" style={{ position: 'static' }}><Icon name="devices" size={44} strokeWidth={1.5} /></div>
      <div>
        <h1 className="dash-greeting-name" style={{ marginBottom: '0.5rem' }}>No device linked yet</h1>
        <p className="dash-greeting-sub" style={{ margin: '0 auto' }}>
          Enter the private key printed on your Atmos unit to link it to your account. Its readings will start showing up here.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button type="button" className="dash-btn primary" onClick={() => setLinking(true)}>
          <Icon name="link" size={16} /> Link new device
        </button>
        <Link href="/" className="dash-btn ghost">Back to home</Link>
      </div>
      {linking && <LinkDeviceModal onClose={() => setLinking(false)} />}
    </div>
  );
}
