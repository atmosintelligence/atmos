'use client';

import { useEffect, useState, useMemo } from 'react';
import { useDevice } from '../DeviceContext';

const SEVERITY_ORDER  = { critical: 0, warning: 1, info: 2 };
const SEVERITY_COLOR  = { critical: '#ef4444', warning: '#eab308', info: '#60a5fa' };
const SEVERITY_BG     = { critical: 'rgba(239,68,68,0.06)', warning: 'rgba(234,179,8,0.06)', info: 'rgba(96,165,250,0.06)' };
const SEVERITY_BORDER = { critical: 'rgba(239,68,68,0.2)', warning: 'rgba(234,179,8,0.2)', info: 'rgba(96,165,250,0.2)' };

const GROUP_COLOR = {
  Lighting: '#eab308',
  HVAC:     '#60a5fa',
  Humidity: '#60a5fa',
  Power:    '#ef4444',
  Trends:   '#a78bfa',
};

function fmtDate(str) {
  return new Date(str).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).replace('am', 'AM').replace('pm', 'PM');
}

function timeAgo(str) {
  const diff = Date.now() - new Date(str);
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function BarChart({ alerts }) {
  const days = useMemo(() => {
    const map = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const k = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      map[k] = { critical: 0, warning: 0, info: 0, label: k };
    }
    for (const a of alerts) {
      const k = new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      if (map[k]) map[k][a.severity]++;
    }
    return Object.values(map);
  }, [alerts]);

  const max = Math.max(...days.map(d => d.critical + d.warning + d.info), 1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '64px' }}>
      {days.map((d, i) => {
        const total = d.critical + d.warning + d.info;
        const pct   = (total / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }} title={`${d.label}: ${total} alert${total !== 1 ? 's' : ''}`}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', borderRadius: '3px', overflow: 'hidden', height: `${Math.max(pct, total > 0 ? 8 : 2)}%` }}>
              {d.critical > 0 && <div style={{ background: '#ef4444', flex: d.critical }} />}
              {d.warning  > 0 && <div style={{ background: '#eab308', flex: d.warning  }} />}
              {d.info     > 0 && <div style={{ background: '#60a5fa', flex: d.info     }} />}
              {total === 0 && <div style={{ background: 'rgba(128,128,128,0.15)', flex: 1 }} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AlertsPage() {
  const { selectedId, refreshKey } = useDevice();

  const [alerts, setAlerts]         = useState([]);
  const [prefs, setPrefs]           = useState(null);
  const [status, setStatus]         = useState('loading');
  const [syncing, setSyncing]       = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [groupFilter, setGroupFilter]       = useState('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [selected, setSelected]     = useState(new Set());
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsMsg, setPrefsMsg]       = useState('');
  const [showPrefs, setShowPrefs]     = useState(false);
  const [editPrefs, setEditPrefs]     = useState(null);

  useEffect(() => {
    if (!selectedId) return;
    load();
    loadPrefs();
  }, [selectedId, refreshKey]);

  async function load() {
    setStatus('loading');
    const res = await fetch(`/api/alerts?deviceId=${selectedId}`);
    if (!res.ok) { setStatus('error'); return; }
    const { alerts: data } = await res.json();
    setAlerts(data ?? []);
    setStatus('ready');
  }

  async function loadPrefs() {
    const res = await fetch('/api/alerts/preferences');
    if (!res.ok) return;
    const { preferences } = await res.json();
    setPrefs(preferences);
    setEditPrefs(preferences);
  }

  async function handleSync() {
    setSyncing(true);
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: selectedId, roomAreaM2: 20 }),
    });
    await load();
    setSyncing(false);
  }

  async function handleAcknowledge(ids) {
    await fetch('/api/alerts/acknowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    setAlerts(prev => prev.map(a => ids.includes(a.id) ? { ...a, acknowledged: true } : a));
    setSelected(new Set());
  }

  async function handleAcknowledgeAll() {
    await fetch('/api/alerts/acknowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true, deviceId: selectedId }),
    });
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
    setSelected(new Set());
  }

  async function handleSavePrefs() {
    setPrefsSaving(true);
    setPrefsMsg('');
    const res = await fetch('/api/alerts/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editPrefs),
    });
    if (res.ok) {
      setPrefs(editPrefs);
      setPrefsMsg('Preferences saved.');
    } else {
      setPrefsMsg('Failed to save.');
    }
    setPrefsSaving(false);
    setTimeout(() => setPrefsMsg(''), 2000);
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const filtered = useMemo(() => {
    return alerts.filter(a => {
      if (!showAcknowledged && a.acknowledged) return false;
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      if (groupFilter !== 'all' && a.group_name !== groupFilter) return false;
      return true;
    });
  }, [alerts, severityFilter, groupFilter, showAcknowledged]);

  const unacknowledged = alerts.filter(a => !a.acknowledged);
  const counts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning:  alerts.filter(a => a.severity === 'warning').length,
    info:     alerts.filter(a => a.severity === 'info').length,
  };
  const groups = [...new Set(alerts.map(a => a.group_name))];
  const last30 = alerts.filter(a => (Date.now() - new Date(a.created_at)) / 86400000 < 30);

  if (status === 'loading') return <div className="dash-empty" style={{ border: 'none' }}>Loading alerts...</div>;
  if (status === 'error')   return <div className="dash-empty" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>Failed to load alerts.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>

      <div className="dash-greeting">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div className="dash-greeting-name">Alerts</div>
            <div className="dash-greeting-sub">A persistent log of every rule that fired for this device — past and present.</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginTop: '0.25rem' }}>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn bg-brand text-brand-on-bg"
              style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0.4rem 0.875rem', borderRadius: '0.5rem' }}
            >
              {syncing ? 'Syncing...' : 'Sync now'}
            </button>
            <button
              onClick={() => setShowPrefs(p => !p)}
              style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0.4rem 0.875rem', borderRadius: '0.5rem', background: 'rgba(128,128,128,0.08)', color: '#737373', border: '1px solid rgba(128,128,128,0.15)', cursor: 'pointer' }}
            >
              {showPrefs ? 'Hide settings' : 'Alert settings'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {[
          { label: 'Unacknowledged', value: unacknowledged.length, color: unacknowledged.length > 0 ? '#ef4444' : undefined },
          { label: 'Critical',       value: counts.critical,         color: counts.critical > 0 ? '#ef4444' : undefined },
          { label: 'Warnings',       value: counts.warning,          color: counts.warning  > 0 ? '#eab308' : undefined },
          { label: 'Last 30 days',   value: last30.length },
        ].map((s, i) => (
          <div key={i} className="dash-stat">
            <div className="dash-stat-value" style={s.color ? { color: s.color } : {}}>{s.value}</div>
            <div className="dash-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {last30.length > 0 && (
        <div>
          <div className="dash-section-title" style={{ marginBottom: '0.625rem' }}>Alert frequency — last 14 days</div>
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <BarChart alerts={last30} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              {['critical', 'warning', 'info'].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', color: '#737373' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: SEVERITY_COLOR[s] }} />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPrefs && editPrefs && (
        <div className="dash-device-card">
          <div className="dash-section-title" style={{ marginBottom: '1rem' }}>Alert settings</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#737373', marginBottom: '0.375rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Consecutive empty readings before alert</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number" min="2" max="10"
                  value={editPrefs.min_consecutive_empty}
                  onChange={e => setEditPrefs(p => ({ ...p, min_consecutive_empty: parseInt(e.target.value) }))}
                  className="field-input" style={{ maxWidth: '80px', textAlign: 'right' }}
                />
                <span style={{ fontSize: '0.78rem', color: '#737373' }}>readings</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#737373', marginBottom: '0.375rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phantom load — min empty duration</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number" min="1" max="12"
                  value={editPrefs.phantom_load_hours}
                  onChange={e => setEditPrefs(p => ({ ...p, phantom_load_hours: parseInt(e.target.value) }))}
                  className="field-input" style={{ maxWidth: '80px', textAlign: 'right' }}
                />
                <span style={{ fontSize: '0.78rem', color: '#737373' }}>hours</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#737373', marginBottom: '0.375rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Spike detection Z-score threshold</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number" min="1.5" max="5" step="0.1"
                  value={editPrefs.spike_zscore}
                  onChange={e => setEditPrefs(p => ({ ...p, spike_zscore: parseFloat(e.target.value) }))}
                  className="field-input" style={{ maxWidth: '80px', textAlign: 'right' }}
                />
                <span style={{ fontSize: '0.78rem', color: '#737373' }}>σ</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#737373', marginBottom: '0.375rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Week-over-week threshold</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number" min="1" max="50"
                  value={editPrefs.week_over_week_pct}
                  onChange={e => setEditPrefs(p => ({ ...p, week_over_week_pct: parseFloat(e.target.value) }))}
                  className="field-input" style={{ maxWidth: '80px', textAlign: 'right' }}
                />
                <span style={{ fontSize: '0.78rem', color: '#737373' }}>%</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(128,128,128,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: '#737373', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quiet hours</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editPrefs.quiet_hours_enabled}
                  onChange={e => setEditPrefs(p => ({ ...p, quiet_hours_enabled: e.target.checked }))}
                />
                Enable quiet hours
              </label>
              {editPrefs.quiet_hours_enabled && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem' }}>
                    <span style={{ color: '#737373' }}>From</span>
                    <input
                      type="number" min="0" max="23"
                      value={editPrefs.quiet_hours_start}
                      onChange={e => setEditPrefs(p => ({ ...p, quiet_hours_start: parseInt(e.target.value) }))}
                      className="field-input" style={{ maxWidth: '60px', textAlign: 'right' }}
                    />
                    <span style={{ color: '#737373' }}>to</span>
                    <input
                      type="number" min="0" max="23"
                      value={editPrefs.quiet_hours_end}
                      onChange={e => setEditPrefs(p => ({ ...p, quiet_hours_end: parseInt(e.target.value) }))}
                      className="field-input" style={{ maxWidth: '60px', textAlign: 'right' }}
                    />
                    <span style={{ color: '#737373' }}>hr (24h)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleSavePrefs}
              disabled={prefsSaving}
              className="btn bg-brand text-brand-on-bg"
              style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '0.625rem' }}
            >
              {prefsSaving ? 'Saving...' : 'Save settings'}
            </button>
            {prefsMsg && <span style={{ fontSize: '0.75rem', color: prefsMsg.includes('saved') ? 'var(--color-primary-dark)' : '#ef4444' }}>{prefsMsg}</span>}
          </div>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <div className="dash-section-title" style={{ marginBottom: 0 }}>
            Alert log {filtered.length > 0 && <span style={{ color: '#737373', fontWeight: 400 }}>({filtered.length})</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {selected.size > 0 && (
              <button
                onClick={() => handleAcknowledge([...selected])}
                style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(74,222,128,0.1)', color: 'var(--color-primary-dark)', border: '1px solid rgba(74,222,128,0.2)', cursor: 'pointer' }}
                className="dark:text-[var(--color-primary)]"
              >
                Acknowledge {selected.size} selected
              </button>
            )}
            {unacknowledged.length > 0 && (
              <button
                onClick={handleAcknowledgeAll}
                style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(128,128,128,0.08)', color: '#737373', border: '1px solid rgba(128,128,128,0.15)', cursor: 'pointer' }}
              >
                Acknowledge all
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {['all', 'critical', 'warning', 'info'].map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              style={{
                fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '9999px', cursor: 'pointer', border: '1px solid',
                borderColor: severityFilter === s ? (SEVERITY_COLOR[s] ?? 'var(--color-primary-dark)') : 'rgba(128,128,128,0.2)',
                background:  severityFilter === s ? ((SEVERITY_BG[s] ?? 'rgba(74,222,128,0.1)')) : 'transparent',
                color:       severityFilter === s ? (SEVERITY_COLOR[s] ?? 'var(--color-primary-dark)') : '#737373',
              }}
            >
              {s === 'all' ? 'All severities' : s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' && ` (${counts[s] ?? 0})`}
            </button>
          ))}
          <div style={{ width: '1px', background: 'rgba(128,128,128,0.2)', margin: '0 0.125rem' }} />
          {['all', ...groups].map(g => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              style={{
                fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '9999px', cursor: 'pointer', border: '1px solid',
                borderColor: groupFilter === g ? (GROUP_COLOR[g] ?? 'rgba(128,128,128,0.4)') : 'rgba(128,128,128,0.2)',
                background:  groupFilter === g ? ((GROUP_COLOR[g] ? GROUP_COLOR[g] + '18' : 'rgba(128,128,128,0.08)')) : 'transparent',
                color:       groupFilter === g ? (GROUP_COLOR[g] ?? '#737373') : '#737373',
              }}
            >
              {g === 'all' ? 'All categories' : g}
            </button>
          ))}
          <div style={{ width: '1px', background: 'rgba(128,128,128,0.2)', margin: '0 0.125rem' }} />
          <button
            onClick={() => setShowAcknowledged(p => !p)}
            style={{
              fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '9999px', cursor: 'pointer', border: '1px solid',
              borderColor: showAcknowledged ? 'rgba(128,128,128,0.4)' : 'rgba(128,128,128,0.2)',
              background:  showAcknowledged ? 'rgba(128,128,128,0.1)' : 'transparent',
              color: '#737373',
            }}
          >
            {showAcknowledged ? 'Hide acknowledged' : 'Show acknowledged'}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="dash-empty">
            {alerts.length === 0
              ? 'No alerts yet. Click "Sync now" to check for new alerts from your latest readings.'
              : 'No alerts match the current filters.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filtered.map((a, i) => (
              <div
                key={a.id}
                onClick={() => toggleSelect(a.id)}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '0.875rem',
                  border: `1px solid ${selected.has(a.id) ? SEVERITY_COLOR[a.severity] : SEVERITY_BORDER[a.severity]}`,
                  background: selected.has(a.id) ? SEVERITY_BG[a.severity] : a.acknowledged ? 'rgba(128,128,128,0.03)' : SEVERITY_BG[a.severity],
                  cursor: 'pointer',
                  opacity: a.acknowledged ? 0.55 : 1,
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  position: 'relative',
                }}
              >
                {!a.acknowledged && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1.25rem', width: '7px', height: '7px', borderRadius: '9999px', background: SEVERITY_COLOR[a.severity] }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingRight: '1rem' }}>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                    padding: '0.15rem 0.5rem', borderRadius: '9999px',
                    background: GROUP_COLOR[a.group_name] + '18',
                    color: GROUP_COLOR[a.group_name] ?? '#737373',
                  }}>
                    {a.group_name}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: SEVERITY_COLOR[a.severity], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {a.severity}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#737373', marginLeft: 'auto' }}>
                    {fmtDate(a.created_at)}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#a3a3a3' }}>
                    {timeAgo(a.created_at)}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-syne)' }}>{a.title}</div>
                <p style={{ fontSize: '0.8rem', color: '#a0a0a0', lineHeight: 1.65, margin: 0 }}>{a.message}</p>

                {a.saving_inr && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-primary-dark)', fontWeight: 500 }} className="dark:text-[var(--color-primary)]">
                    Estimated saving: ₹{parseFloat(a.saving_inr).toFixed(2)}
                  </div>
                )}

                {a.acknowledged && (
                  <div style={{ fontSize: '0.68rem', color: '#737373', fontStyle: 'italic' }}>Acknowledged</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}