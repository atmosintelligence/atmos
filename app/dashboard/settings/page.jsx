'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { exportPDF, exportJSON } from '@/lib/pdf/export';
import { useDevice } from '../DeviceContext';

export default function SettingsPage() {
  const router = useRouter();
  const { selectedId } = useDevice();

  const [theme, setTheme]               = useState('dark');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [deleteError, setDeleteError]   = useState('');

  const [displayName, setDisplayName]       = useState('');
  const [displayNameSaving, setDisplayNameSaving] = useState(false);
  const [displayNameMsg, setDisplayNameMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [passwordSaving, setPasswordSaving]   = useState(false);
  const [passwordMsg, setPasswordMsg]         = useState('');

  const [lat, setLat]           = useState('');
  const [lon, setLon]           = useState('');
  const [locationSaved, setLocationSaved] = useState(false);
  const [locationMsg, setLocationMsg]     = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, latitude, longitude')
        .eq('id', user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name ?? '');
        if (data.latitude  != null) setLat(String(data.latitude));
        if (data.longitude != null) setLon(String(data.longitude));
      }
    });
  }, []);

  async function handleSaveDisplayName() {
    setDisplayNameSaving(true);
    setDisplayNameMsg('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setDisplayNameSaving(false); return; }
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', user.id);
    if (!error) {
      window.dispatchEvent(new CustomEvent('atmos:profileChanged', { detail: { display_name: displayName } }));
    }
    setDisplayNameMsg(error ? error.message : 'Display name updated.');
    setDisplayNameSaving(false);
  }

  async function handleChangePassword() {
    setPasswordSaving(true);
    setPasswordMsg('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setPasswordSaving(false); return; }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      setPasswordMsg('Current password is incorrect.');
      setPasswordSaving(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordMsg(error ? error.message : 'Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setPasswordSaving(false);
  }

  useEffect(() => {
    setTheme(localStorage.getItem('theme') || 'dark');
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    window.dispatchEvent(new CustomEvent('atmos:themeChanged', { detail: { theme: next } }));
  }

  const [exporting, setExporting] = useState(false);
  const [exportingJSON, setExportingJSON] = useState(false);

  const [tariff, setTariff]         = useState('10');
  const [tariffSaved, setTariffSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('atmos:tariff');
    if (saved) setTariff(saved);
  }, []);

  function handleSaveTariff() {
    const val = parseFloat(tariff);
    if (isNaN(val) || val <= 0) return;
    localStorage.setItem('atmos:tariff', String(val));
    setTariffSaved(true);
    setTimeout(() => setTariffSaved(false), 2000);
  }

  async function handleSaveLocation() {
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    if (isNaN(parsedLat) || isNaN(parsedLon)) {
      setLocationMsg('Please enter valid coordinates.');
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ latitude: parsedLat, longitude: parsedLon })
      .eq('id', user.id);
    setLocationMsg(error ? error.message : 'Location updated.');
    if (!error) {
      setLocationSaved(true);
      setTimeout(() => { setLocationSaved(false); setLocationMsg(''); }, 2000);
    }
  }

  function handleDetectLocation() {
    if (!navigator.geolocation) { setLocationMsg('Geolocation not supported by your browser.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLon(pos.coords.longitude.toFixed(6));
        setLocationMsg('');
      },
      () => setLocationMsg('Could not detect location. Please enter manually.')
    );
  }

  async function handleExportPDF() {
    setExporting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      let prof = null;
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('display_name, username')
          .eq('id', user.id)
          .single();
        prof = data;
      }

      const res = await fetch('/api/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: { lat: 28.6, lon: 77.2 }, roomAreaM2: 20, deviceId: selectedId }),
      });
      const { readings, optimizations, environmental, analysis } = await res.json();

      await exportPDF({
        deviceId: selectedId,
        profile: prof,
        readings:      readings      ?? [],
        optimizations: optimizations ?? [],
        environmental: environmental ?? null,
        analysis:      analysis      ?? null,
      });
    } catch (e) {
      console.error(e);
    }
    setExporting(false);
  }

  async function handleExportJSON() {
    setExportingJSON(true);
    try {
      const res = await fetch('/api/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: { lat: 28.6, lon: 77.2 }, roomAreaM2: 20, deviceId: selectedId }),
      });
      const { readings, optimizations } = await res.json();
      exportJSON({ deviceId: selectedId, readings: readings ?? [], optimizations: optimizations ?? [] });
    } catch (e) {
      console.error(e);
    }
    setExportingJSON(false);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError('');
    const supabase = createClient();
    const { error } = await supabase.rpc('delete_user');
    if (error) {
      setDeleteError(error.message);
      setDeleting(false);
    } else {
      await supabase.auth.signOut();
      router.replace('/');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '560px' }}>
      <div className="dash-greeting">
        <div className="dash-greeting-name">Settings</div>
        <div className="dash-greeting-sub">Manage your account and preferences.</div>
      </div>

      <div className="dash-device-card">
        <div className="dash-section-title" style={{ marginBottom: 0 }}>Account</div>

        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Display name</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="field-input"
              style={{ maxWidth: '280px' }}
              placeholder="Your display name"
            />
            <button
              onClick={handleSaveDisplayName}
              disabled={displayNameSaving || !displayName}
              className="btn bg-brand text-brand-on-bg"
              style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '0.625rem', opacity: !displayName ? 0.5 : 1 }}
            >
              {displayNameSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
          {displayNameMsg && (
            <p style={{ fontSize: '0.75rem', color: displayNameMsg.includes('updated') ? 'var(--color-primary-dark)' : '#ef4444' }}>
              {displayNameMsg}
            </p>
          )}
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Change password</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '280px' }}>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="field-input"
              placeholder="Current password"
            />
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="field-input"
              placeholder="New password"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={passwordSaving || !currentPassword || !newPassword}
            className="btn bg-brand text-brand-on-bg"
            style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '0.625rem', width: 'fit-content', opacity: (!currentPassword || !newPassword) ? 0.5 : 1 }}
          >
            {passwordSaving ? 'Updating...' : 'Update password'}
          </button>
          {passwordMsg && (
            <p style={{ fontSize: '0.75rem', color: passwordMsg.includes('successfully') ? 'var(--color-primary-dark)' : '#ef4444' }}>
              {passwordMsg}
            </p>
          )}
        </div>
      </div>

      <div className="dash-device-card">
        <div className="dash-section-title" style={{ marginBottom: 0 }}>Appearance</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.2rem' }}>
              Changes apply across the whole app
            </div>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              width: '3rem', height: '1.625rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
              background: theme === 'dark' ? 'var(--color-primary-dark)' : 'rgba(0,0,0,0.15)',
              position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: '0.1875rem',
              left: theme === 'dark' ? 'calc(100% - 1.25rem)' : '0.1875rem',
              width: '1.25rem', height: '1.25rem', borderRadius: '9999px',
              background: 'white', transition: 'left 0.2s ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
      </div>

      <div className="dash-device-card">
        <div className="dash-section-title" style={{ marginBottom: 0 }}>Energy tariff</div>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Rate per kWh</div>
          <div style={{ fontSize: '0.75rem', color: '#737373', marginBottom: '1rem' }}>
            Used for all savings and waste estimates across your dashboard. Default is ₹10/kWh.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#737373' }}>₹</span>
            <input
              type="number"
              value={tariff}
              onChange={e => setTariff(e.target.value)}
              min="0"
              step="0.5"
              className="field-input"
              style={{ maxWidth: '100px', textAlign: 'right' }}
            />
            <span style={{ fontSize: '0.8rem', color: '#737373' }}>/ kWh</span>
            <button
              onClick={handleSaveTariff}
              className="btn bg-brand text-brand-on-bg"
              style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '0.625rem' }}
            >
              {tariffSaved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="dash-device-card">
        <div className="dash-section-title" style={{ marginBottom: 0 }}>Your location</div>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Coordinates</div>
          <div style={{ fontSize: '0.75rem', color: '#737373', marginBottom: '1rem' }}>
            Used to fetch outdoor weather data for ventilation and HVAC recommendations. Stored securely on your account.
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#737373', minWidth: '20px' }}>Lat</span>
              <input
                type="number"
                value={lat}
                onChange={e => setLat(e.target.value)}
                step="0.000001"
                placeholder="28.6139"
                className="field-input"
                style={{ maxWidth: '120px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#737373', minWidth: '20px' }}>Lon</span>
              <input
                type="number"
                value={lon}
                onChange={e => setLon(e.target.value)}
                step="0.000001"
                placeholder="77.2090"
                className="field-input"
                style={{ maxWidth: '120px' }}
              />
            </div>
            <button
              onClick={handleSaveLocation}
              className="btn bg-brand text-brand-on-bg"
              style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '0.625rem' }}
            >
              {locationSaved ? 'Saved!' : 'Save'}
            </button>
            <button
              onClick={handleDetectLocation}
              style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '0.625rem', background: 'rgba(0,0,0,0.04)', color: '#737373', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer' }}
            >
              Detect
            </button>
          </div>
          {locationMsg && (
            <p style={{ fontSize: '0.75rem', color: locationMsg.includes('updated') || locationMsg.includes('detected') ? 'var(--color-primary-dark)' : '#ef4444' }}>
              {locationMsg}
            </p>
          )}
        </div>
      </div>

      <div className="dash-device-card">
        <div className="dash-section-title" style={{ marginBottom: 0 }}>Data export</div>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Export your data</div>
          <div style={{ fontSize: '0.75rem', color: '#737373', marginBottom: '1rem' }}>
            Download a full environmental report for the selected device, including sensor history, savings summary, and recommendations.
          </div>
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportPDF}
              disabled={exporting || !selectedId}
              className="btn bg-brand text-brand-on-bg"
              style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '0.625rem', opacity: !selectedId ? 0.5 : 1, cursor: exporting ? 'wait' : 'pointer' }}
            >
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={handleExportJSON}
              disabled={exportingJSON || !selectedId}
              className="btn bg-brand text-brand-on-bg"
              style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '0.625rem', opacity: !selectedId ? 0.5 : 1, cursor: exportingJSON ? 'wait' : 'pointer' }}
            >
              {exportingJSON ? 'Exporting...' : 'Export JSON'}
            </button>
          </div>
        </div>
      </div>

      <div className="dash-device-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <div className="dash-section-title" style={{ marginBottom: 0, color: '#ef4444' }}>Danger zone</div>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Delete account</div>
          <div style={{ fontSize: '0.75rem', color: '#737373', marginBottom: '1rem' }}>
            Permanently deletes your account and all associated data. This cannot be undone.
          </div>
          {deleteError && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', marginBottom: '0.75rem' }}>{deleteError}</p>
          )}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
            >
              Delete my account
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '0.625rem', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', opacity: deleting ? 0.6 : 1 }}
              >
                {deleting ? 'Deleting...' : 'Yes, delete everything'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '0.625rem', background: 'rgba(0,0,0,0.06)', color: '#737373', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
