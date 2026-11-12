'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, updateProfile, changePassword, deleteAccount } from '@/lib/supabase';
import { fetchEngine } from '@/lib/engineFetch';
import { exportPDF, exportJSON } from '@/lib/pdf/export';
import { useDevice } from '../DeviceContext';
import Link from 'next/link';

/* ---------- shared styles & helpers ---------- */

const MUTED = '#737373';
const LINE = 'rgba(128,128,128,0.2)';

const btn = {
  fontSize: '0.8rem',
  fontWeight: 600,
  padding: '0.5rem 1rem',
  borderRadius: '0.625rem',
};

const ghostBtn = {
  ...btn,
  background: 'rgba(128,128,128,0.08)',
  color: MUTED,
  border: `1px solid ${LINE}`,
  cursor: 'pointer',
};

const isOk = (msg) => /updated|successfully|detected|saved/i.test(msg);

function Card({ title, danger, children }) {
  return (
    <div className="dash-device-card" style={danger ? { borderColor: 'rgba(239,68,68,0.2)' } : undefined}>
      <div className="dash-section-title" style={{ marginBottom: 0, color: danger ? '#ef4444' : undefined }}>
        {title}
      </div>
      <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {children}
      </div>
    </div>
  );
}

function Group({ label, hint, divided, children }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        ...(divided ? { borderTop: `1px solid ${LINE}`, paddingTop: '1.25rem' } : {}),
      }}
    >
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</div>
        {hint && (
          <div style={{ fontSize: '0.75rem', color: MUTED, marginTop: '0.25rem', lineHeight: 1.5 }}>{hint}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function Msg({ text }) {
  if (!text) return null;
  return (
    <p style={{ fontSize: '0.75rem', margin: 0, color: isOk(text) ? 'var(--color-primary-dark)' : '#ef4444' }}>
      {text}
    </p>
  );
}

/* ---------- page ---------- */

export default function SettingsPage() {
  const router = useRouter();
  const { selectedId, isDemo, getDemoReadings } = useDevice();

  const [theme, setTheme] = useState('dark');

  const [displayName, setDisplayName] = useState('');
  const [displayNameSaving, setDisplayNameSaving] = useState(false);
  const [displayNameMsg, setDisplayNameMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  const [optMode, setOptMode] = useState('ai'); // 'ai' | 'rule'
  const [optSaving, setOptSaving] = useState(false);
  const [optMsg, setOptMsg] = useState('');

  const [tariff, setTariff] = useState('10');
  const [tariffSaved, setTariffSaved] = useState(false);

  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [locationSaved, setLocationSaved] = useState(false);
  const [locationMsg, setLocationMsg] = useState('');

  const [exporting, setExporting] = useState(false);
  const [exportingJSON, setExportingJSON] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    setTheme(localStorage.getItem('theme') || 'dark');

    const savedTariff = localStorage.getItem('atmos:tariff');
    if (savedTariff) setTariff(savedTariff);

    const cachedMode = localStorage.getItem('atmos:optMode');
    if (cachedMode === 'ai' || cachedMode === 'rule') setOptMode(cachedMode);

    getProfile('display_name, latitude, longitude').then((data) => {
      if (!data) return;
      setDisplayName(data.display_name ?? '');
      if (data.latitude != null) setLat(String(data.latitude));
      if (data.longitude != null) setLon(String(data.longitude));
    });

    // Fetched separately so a missing column can never break the rest of the page.
    getProfile('optimization_mode').then((data) => {
      const mode = data?.optimization_mode;
      if (mode === 'ai' || mode === 'rule') {
        setOptMode(mode);
        localStorage.setItem('atmos:optMode', mode);
      }
    });
  }, []);

  async function handleSaveDisplayName() {
    setDisplayNameSaving(true);
    setDisplayNameMsg('');
    const { error } = await updateProfile({ display_name: displayName });
    if (!error) {
      window.dispatchEvent(new CustomEvent('atmos:profileChanged', { detail: { display_name: displayName } }));
    }
    setDisplayNameMsg(error ? error.message : 'Display name updated.');
    setDisplayNameSaving(false);
  }

  async function handleChangePassword() {
    setPasswordSaving(true);
    setPasswordMsg('');
    const { error } = await changePassword(currentPassword, newPassword);
    setPasswordMsg(error ? error.message : 'Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setPasswordSaving(false);
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    window.dispatchEvent(new CustomEvent('atmos:themeChanged', { detail: { theme: next } }));
  }

  async function handleModeChange(next) {
    if (isDemo || optSaving || next === optMode) return;
    const prev = optMode;
    setOptMode(next);
    setOptSaving(true);
    setOptMsg('');
    localStorage.setItem('atmos:optMode', next);

    const { error } = await updateProfile({ optimization_mode: next });
    if (error) {
      setOptMode(prev);
      localStorage.setItem('atmos:optMode', prev);
      setOptMsg(error.message);
    } else {
      setOptMsg('Preference saved.');
      setTimeout(() => setOptMsg(''), 2000);
    }
    setOptSaving(false);
  }

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
    const { error } = await updateProfile({ latitude: parsedLat, longitude: parsedLon });
    setLocationMsg(error ? error.message : 'Location updated.');
    if (!error) {
      setLocationSaved(true);
      setTimeout(() => {
        setLocationSaved(false);
        setLocationMsg('');
      }, 2000);
    }
  }

  function handleDetectLocation() {
    if (!navigator.geolocation) {
      setLocationMsg('Geolocation not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLon(pos.coords.longitude.toFixed(6));
        setLocationMsg('');
      },
      () => setLocationMsg('Could not detect location. Please enter manually.')
    );
  }

  async function loadExportData() {
    return fetchEngine({
      isDemo,
      readings: isDemo ? getDemoReadings(selectedId) : null,
      deviceId: selectedId,
    });
  }

  async function handleExportPDF() {
    setExporting(true);
    try {
      const [prof, json] = await Promise.all([getProfile('display_name, username'), loadExportData()]);
      await exportPDF({
        deviceId: selectedId,
        profile: prof,
        readings: json.readings ?? [],
        optimizations: json.optimizations ?? [],
        environmental: json.environmental ?? null,
        analysis: json.analysis ?? null,
      });
    } catch (e) {
      console.error(e);
    }
    setExporting(false);
  }

  async function handleExportJSON() {
    setExportingJSON(true);
    try {
      const json = await loadExportData();
      exportJSON({ deviceId: selectedId, readings: json.readings ?? [], optimizations: json.optimizations ?? [] });
    } catch (e) {
      console.error(e);
    }
    setExportingJSON(false);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError('');
    const { error } = await deleteAccount();
    if (error) {
      setDeleteError(error.message);
      setDeleting(false);
    } else {
      router.replace('/');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '600px' }}>
      {isDemo && (
        <div
          style={{
            fontSize: '0.78rem',
            color: MUTED,
            padding: '0.75rem 1rem',
            background: 'rgba(74,222,128,0.06)',
            borderRadius: '0.625rem',
            border: '1px solid rgba(74,222,128,0.15)',
          }}
        >
          Most settings are read-only in demo mode.{' '}
          <Link href="/signup" className="link">Create an account</Link> to configure your preferences!
        </div>
      )}

      <div className="dash-greeting">
        <div className="dash-greeting-name">Settings</div>
        <div className="dash-greeting-sub">Manage your account and preferences.</div>
      </div>

      {/* Account */}
      <Card title="Account">
        <Group label="Display name">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={displayName}
              disabled={isDemo}
              onChange={(e) => setDisplayName(e.target.value)}
              className="field-input"
              style={{ flex: '1 1 200px', maxWidth: '280px', margin: 0 }}
              placeholder="Your display name"
            />
            <button
              onClick={handleSaveDisplayName}
              disabled={displayNameSaving || !displayName || isDemo}
              className="btn bg-brand text-brand-on-bg"
              style={{ ...btn, opacity: !displayName ? 0.5 : 1 }}
            >
              {displayNameSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <Msg text={displayNameMsg} />
        </Group>

        <Group label="Change password" divided>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '280px' }}>
            <input
              type="password"
              value={currentPassword}
              disabled={isDemo}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="field-input"
              style={{ margin: 0 }}
              placeholder="Current password"
            />
            <input
              type="password"
              value={newPassword}
              disabled={isDemo}
              onChange={(e) => setNewPassword(e.target.value)}
              className="field-input"
              style={{ margin: 0 }}
              placeholder="New password"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={passwordSaving || !currentPassword || !newPassword || isDemo}
            className="btn bg-brand text-brand-on-bg"
            style={{ ...btn, width: 'fit-content', opacity: !currentPassword || !newPassword ? 0.5 : 1 }}
          >
            {passwordSaving ? 'Updating...' : 'Update password'}
          </button>
          <Msg text={passwordMsg} />
        </Group>
      </Card>

      {/* Appearance */}
      <Card title="Appearance">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </div>
            <div style={{ fontSize: '0.75rem', color: MUTED, marginTop: '0.25rem' }}>
              Changes apply across the whole app
            </div>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              width: '3rem',
              height: '1.625rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              background: theme === 'dark' ? 'var(--color-primary-dark)' : 'rgba(128,128,128,0.3)',
              position: 'relative',
              transition: 'background 0.2s ease',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '0.1875rem',
                left: theme === 'dark' ? 'calc(100% - 1.4375rem)' : '0.1875rem',
                width: '1.25rem',
                height: '1.25rem',
                borderRadius: '9999px',
                background: 'white',
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>
      </Card>

      {/* AI optimisation generation */}
      <Card title="AI optimization generation">
        <Group label="Generation method">
          <div
            role="radiogroup"
            aria-label="Optimization generation method"
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              padding: '4px',
              borderRadius: '9999px',
              background: 'rgba(128,128,128,0.12)',
              border: `1px solid ${LINE}`,
              opacity: isDemo ? 0.6 : 1,
            }}
          >
            <span
              className="bg-brand"
              style={{
                position: 'absolute',
                top: '4px',
                bottom: '4px',
                left: '4px',
                width: 'calc(50% - 4px)',
                borderRadius: '9999px',
                transform: optMode === 'ai' ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.25s ease',
              }}
            />
            {[
              { id: 'ai', label: 'AI-BASED' },
              { id: 'rule', label: 'RULE-BASED' },
            ].map((m) => (
              <button
                key={m.id}
                role="radio"
                aria-checked={optMode === m.id}
                onClick={() => handleModeChange(m.id)}
                disabled={isDemo}
                className={optMode === m.id ? 'text-brand-on-bg' : ''}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '0.55rem 0',
                  background: 'transparent',
                  border: 'none',
                  cursor: isDemo ? 'not-allowed' : 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: optMode === m.id ? undefined : MUTED,
                  transition: 'color 0.2s ease',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.78rem', color: MUTED, margin: 0, lineHeight: 1.6 }}>
            AI-based optimizations are stronger and more context-specific, while rule-based optimizations are weaker but predictable.
          </p>
          <Msg text={optMsg} />
        </Group>
      </Card>

      {/* Energy tariff */}
      <Card title="Energy tariff">
        <Group
          label="Rate per kWh"
          hint="Used for all savings and waste estimates across your dashboard. Default is ₹10/kWh."
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', color: MUTED }}>₹</span>
            <input
              type="number"
              value={tariff}
              disabled={isDemo}
              onChange={(e) => setTariff(e.target.value)}
              min="0"
              step="0.5"
              className="field-input"
              style={{ maxWidth: '100px', textAlign: 'right', margin: 0 }}
            />
            <span style={{ fontSize: '0.8rem', color: MUTED }}>/ kWh</span>
            <button
              onClick={handleSaveTariff}
              disabled={isDemo}
              className="btn bg-brand text-brand-on-bg"
              style={btn}
            >
              {tariffSaved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </Group>
      </Card>

      {/* Location */}
      <Card title="Your location">
        <Group
          label="Coordinates"
          hint="Used to fetch outdoor weather data for ventilation and HVAC recommendations. Stored securely on your account."
        >
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'Lat', value: lat, set: setLat, placeholder: '28.6139' },
              { label: 'Lon', value: lon, set: setLon, placeholder: '77.2090' },
            ].map((f) => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', color: MUTED, minWidth: '22px' }}>{f.label}</span>
                <input
                  type="number"
                  value={f.value}
                  disabled={isDemo}
                  onChange={(e) => f.set(e.target.value)}
                  step="0.000001"
                  placeholder={f.placeholder}
                  className="field-input"
                  style={{ maxWidth: '120px', margin: 0 }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleSaveLocation}
              disabled={isDemo}
              className="btn bg-brand text-brand-on-bg"
              style={btn}
            >
              {locationSaved ? 'Saved!' : 'Save'}
            </button>
            <button onClick={handleDetectLocation} disabled={isDemo} style={ghostBtn}>
              Detect
            </button>
          </div>
          <Msg text={locationMsg} />
        </Group>
      </Card>

      {/* Data export */}
      <Card title="Data export">
        <Group
          label="Export your data"
          hint="Download a full environmental report for the selected device, including sensor history, savings summary, and recommendations."
        >
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportPDF}
              disabled={exporting || !selectedId}
              className="btn bg-brand text-brand-on-bg"
              style={{ ...btn, padding: '0.5rem 1.25rem', opacity: !selectedId ? 0.5 : 1, cursor: exporting ? 'wait' : 'pointer' }}
            >
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={handleExportJSON}
              disabled={exportingJSON || !selectedId}
              className="btn bg-brand text-brand-on-bg"
              style={{ ...btn, padding: '0.5rem 1.25rem', opacity: !selectedId ? 0.5 : 1, cursor: exportingJSON ? 'wait' : 'pointer' }}
            >
              {exportingJSON ? 'Exporting...' : 'Export JSON'}
            </button>
          </div>
        </Group>
      </Card>

      {/* Danger zone */}
      <Card title="Danger zone" danger>
        <Group
          label="Delete account"
          hint="Permanently deletes your account and all associated data. This cannot be undone."
        >
          {deleteError && <Msg text={deleteError} />}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={isDemo}
              style={{
                ...btn,
                width: 'fit-content',
                padding: '0.5rem 1.25rem',
                background: 'rgba(239,68,68,0.08)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.2)',
                cursor: 'pointer',
              }}
            >
              Delete my account
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  ...btn,
                  padding: '0.5rem 1.25rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, delete everything'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ ...ghostBtn, padding: '0.5rem 1.25rem', border: 'none' }}
              >
                Cancel
              </button>
            </div>
          )}
        </Group>
      </Card>
    </div>
  );
}
