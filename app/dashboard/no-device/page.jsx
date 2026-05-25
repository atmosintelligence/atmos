'use client';

import Link from 'next/link';

export default function NoDevicePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '480px', margin: '4rem auto', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem' }}>📡</div>
      <div>
        <div className="dash-greeting-name" style={{ marginBottom: '0.5rem' }}>No device linked</div>
        <div className="dash-greeting-sub">
          You don't have any hardware devices linked to your account yet. Once you set up your Atmos device, it will appear here automatically.
        </div>
      </div>
      <div className="dash-empty" style={{ width: '100%' }}>
        Contact your administrator or refer to the setup guide to register your device.
      </div>
      <Link href="/" className="btn bg-brand text-brand-on-bg px-6 py-2.5 rounded-full font-medium text-sm inline-flex">
        Back to home
      </Link>
    </div>
  );
}