'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProfile, updateProfile, changePassword, deleteAccount } from '@/lib/supabase';
import { useDevice } from '../DeviceContext';
import PageHeader from '@/components/dashboard/PageHeader';
import Segmented from '@/components/dashboard/Segmented';
import SubscriptionPanel from '@/components/dashboard/SubscriptionPanel';

function Card({ title, sub, danger, children }) {
  return (
    <section className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', ...(danger ? { borderColor: 'rgba(239,68,68,0.3)' } : {}) }}>
      <div>
        <h2 className="dash-card-title" style={danger ? { color: '#ef4444' } : undefined}>{title}</h2>
        {sub && <p className="dash-card-sub">{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function Msg({ msg }) {
  if (!msg) return null;
  return msg.error
    ? <p role="alert" className="err" style={{ fontSize: '0.8rem' }}>{msg.error}</p>
    : <p role="status" style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)' }}>{msg.ok}</p>;
}

export default function SettingsPage() {
  const router = useRouter();
  const { isDemo } = useDevice();

  const [theme, setTheme]     = useState('dark');
  const [name, setName]       = useState('');
  const [nameBusy, setNameBusy] = useState(false);
  const [nameMsg, setNameMsg] = useState(null);

  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [pwBusy, setPwBusy]     = useState(false);
  const [pwMsg, setPwMsg]       = useState(null);

  const [mode, setMode]         = useState('ai');
  const [modeMsg, setModeMsg]   = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState(null);

  useEffect(() => {
    try {
      setTheme(localStorage.getItem('theme') || 'dark');
      const cached = localStorage.getItem('atmos:optMode');
      if (cached === 'ai' || cached === 'rule') setMode(cached);
    } catch {}

    getProfile('display_name').then(d => { if (d) setName(d.display_name ?? ''); });
    // Fetched on its own so a missing column cannot break the rest of the page.
    getProfile('optimization_mode').then(d => {
      const m = d?.optimization_mode;
      if (m === 'ai' || m === 'rule') { setMode(m); try { localStorage.setItem('atmos:optMode', m); } catch {} }
    });
  }, []);

  async function saveName(e) {
    e.preventDefault();
    setNameBusy(true); setNameMsg(null);
    const { error } = await updateProfile({ display_name: name });
    if (!error) window.dispatchEvent(new CustomEvent('atmos:profileChanged', { detail: { display_name: name } }));
    setNameMsg(error ? { error: error.message } : { ok: 'Name updated.' });
    setNameBusy(false);
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwBusy(true); setPwMsg(null);
    const { error } = await changePassword(current, next);
    setPwMsg(error ? { error: error.message } : { ok: 'Password updated.' });
    setCurrent(''); setNext(''); setPwBusy(false);
  }

  function setThemeTo(value) {
    setTheme(value);
    try { localStorage.setItem('theme', value); } catch {}
    document.documentElement.classList.toggle('dark', value === 'dark');
    window.dispatchEvent(new CustomEvent('atmos:themeChanged', { detail: { theme: value } }));
  }

  async function changeMode(value) {
    if (isDemo || value === mode) return;
    const prev = mode;
    setMode(value); setModeMsg(null);
    try { localStorage.setItem('atmos:optMode', value); } catch {}
    const { error } = await updateProfile({ optimization_mode: value });
    if (error) {
      setMode(prev);
      try { localStorage.setItem('atmos:optMode', prev); } catch {}
      setModeMsg({ error: error.message });
    } else {
      setModeMsg({ ok: 'Saved.' });
    }
  }

  async function removeAccount() {
    setDeleting(true); setDeleteMsg(null);
    const { error } = await deleteAccount();
    if (error) { setDeleteMsg({ error: error.message }); setDeleting(false); }
    else router.replace('/');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '44rem' }}>
      <PageHeader title="Settings" sub="Your plan, your account and how Atmos looks. Rates and locations are set per device, under Devices." />

      {isDemo && (
        <p className="dash-card-sub" style={{ margin: 0, padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(74,222,128,0.08)' }}>
          You are in the demo, so most settings are read-only. <Link href="/signup" className="link">Create a free account</Link> to change them.
        </p>
      )}

      <SubscriptionPanel />

      <Card title="Account">
        <form onSubmit={saveName} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="dash-field" style={{ maxWidth: '22rem' }}>
            <label htmlFor="display-name">Display name</label>
            <input id="display-name" className="field-input" value={name} onChange={e => setName(e.target.value)} disabled={isDemo} placeholder="What should we call you?" autoComplete="name" />
          </div>
          <div><button type="submit" className="dash-btn primary" disabled={nameBusy || !name.trim() || isDemo}>{nameBusy ? 'Saving...' : 'Save name'}</button></div>
          <Msg msg={nameMsg} />
        </form>

        <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(128,128,128,0.2)', paddingTop: '1rem' }}>
          <div className="dash-field" style={{ maxWidth: '22rem' }}>
            <label htmlFor="pw-current">Current password</label>
            <input id="pw-current" className="field-input" type="password" autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} disabled={isDemo} />
          </div>
          <div className="dash-field" style={{ maxWidth: '22rem' }}>
            <label htmlFor="pw-new">New password</label>
            <input id="pw-new" className="field-input" type="password" autoComplete="new-password" value={next} onChange={e => setNext(e.target.value)} disabled={isDemo} />
          </div>
          <div><button type="submit" className="dash-btn primary" disabled={pwBusy || !current || !next || isDemo}>{pwBusy ? 'Updating...' : 'Change password'}</button></div>
          <Msg msg={pwMsg} />
        </form>
      </Card>

      <Card title="Appearance">
        <Segmented label="Theme" value={theme} onChange={setThemeTo} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
      </Card>

      <Card title="How recommendations are written" sub="AI-based recommendations are more specific to your room. Rule-based ones are simpler and always predictable.">
        <div><Segmented label="Recommendation style" value={mode} onChange={changeMode} options={[{ value: 'ai', label: 'AI-based' }, { value: 'rule', label: 'Rule-based' }]} /></div>
        <Msg msg={modeMsg} />
      </Card>

      <Card title="Delete account" sub="Removes your account and everything linked to it. This cannot be undone." danger>
        {deleteMsg && <Msg msg={deleteMsg} />}
        {confirmDelete ? (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="dash-btn danger" onClick={removeAccount} disabled={deleting}>{deleting ? 'Deleting...' : 'Yes, delete everything'}</button>
            <button type="button" className="dash-btn ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
          </div>
        ) : (
          <div><button type="button" className="dash-btn ghost" onClick={() => setConfirmDelete(true)} disabled={isDemo} style={{ color: '#ef4444' }}>Delete my account</button></div>
        )}
      </Card>
    </div>
  );
}
