'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDevice } from '../DeviceContext';
import Icon from '@/components/Icon';
import PageHeader from '@/components/dashboard/PageHeader';
import Stat from '@/components/dashboard/Stat';
import OptCard from '@/components/dashboard/OptCard';
import Segmented from '@/components/dashboard/Segmented';
import BarSeries from '@/components/dashboard/charts/BarSeries';
import { C } from '@/components/dashboard/charts/ChartConfig';

const SEVERITIES = ['critical', 'warning', 'info'];
const DEFAULT_PREFS = {
  min_consecutive_empty: 3, phantom_load_hours: 4,
  quiet_hours_enabled: false, quiet_hours_start: 22, quiet_hours_end: 7,
};

const dayLabel = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const asOpt = a => ({ ...a, group: a.group_name, saving: a.saving_inr ? { inr: a.saving_inr } : null, timestamp: a.when ?? a.created_at });

function NumberField({ id, label, hint, value, min, max, onChange, unit }) {
  return (
    <div className="dash-field">
      <label htmlFor={id}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input id={id} className="field-input" type="number" min={min} max={max} value={value}
               onChange={e => onChange(Number(e.target.value))} style={{ maxWidth: '6rem', margin: 0 }} aria-describedby={`${id}-h`} />
        <span className="dash-card-sub" style={{ margin: 0 }}>{unit}</span>
      </div>
      <span id={`${id}-h`} className="hint">{hint}</span>
    </div>
  );
}

function AlertSettings() {
  const { isDemo } = useDevice();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [busy, setBusy]   = useState(false);
  const [msg, setMsg]     = useState(null);

  useEffect(() => {
    if (isDemo) return;
    fetch('/api/alerts/preferences').then(r => r.json()).then(({ preferences }) => {
      if (preferences) setPrefs(p => ({ ...p, ...preferences }));
    }).catch(() => {});
  }, [isDemo]);

  const set = key => v => { setPrefs(p => ({ ...p, [key]: v })); setMsg(null); };

  async function save(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { min_consecutive_empty, phantom_load_hours, quiet_hours_enabled, quiet_hours_start, quiet_hours_end } = prefs;
    const res = await fetch('/api/alerts/preferences', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ min_consecutive_empty, phantom_load_hours, quiet_hours_enabled, quiet_hours_start, quiet_hours_end }),
    }).catch(() => null);
    setMsg(res?.ok ? { ok: 'Saved.' } : { error: 'Could not save. Try again.' });
    setBusy(false);
  }

  return (
    <form onSubmit={save} className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h2 className="dash-card-title">Alert settings</h2>
        <p className="dash-card-sub">Make alerts quicker or quieter. The defaults suit most rooms.</p>
      </div>
      <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))' }}>
        <NumberField id="pref-empty" label="Empty room, before alerting" value={prefs.min_consecutive_empty} min={2} max={10} unit="readings in a row"
                     hint="How long a room must look empty before lights or AC are flagged." onChange={set('min_consecutive_empty')} />
        <NumberField id="pref-standby" label="Empty room, for standby alerts" value={prefs.phantom_load_hours} min={1} max={12} unit="hours"
                     hint="How long a room sits empty in the day before standby devices are flagged." onChange={set('phantom_load_hours')} />
      </div>
      <div style={{ borderTop: '1px solid rgba(128,128,128,0.2)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
          <input type="checkbox" checked={prefs.quiet_hours_enabled} onChange={e => set('quiet_hours_enabled')(e.target.checked)} />
          Pause new alerts during quiet hours
        </label>
        {prefs.quiet_hours_enabled && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <NumberField id="pref-from" label="From" value={prefs.quiet_hours_start} min={0} max={23} unit="o'clock (0 to 23)" hint="" onChange={set('quiet_hours_start')} />
            <NumberField id="pref-to"   label="Until" value={prefs.quiet_hours_end} min={0} max={23} unit="o'clock (0 to 23)" hint="" onChange={set('quiet_hours_end')} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="submit" className="dash-btn primary" disabled={busy || isDemo}>{busy ? 'Saving...' : isDemo ? 'Not in demo' : 'Save settings'}</button>
        {msg?.ok    && <span role="status" style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)' }}>{msg.ok}</span>}
        {msg?.error && <span role="alert" className="err" style={{ fontSize: '0.8rem' }}>{msg.error}</span>}
      </div>
    </form>
  );
}

export default function AlertsPage() {
  const { selectedId, refreshKey, cache, getCached, setCached, isDemo, acknowledgeAlerts, nameOf } = useDevice();
  const [status, setStatus]   = useState('loading');
  const [view, setView]       = useState('todo');
  const [severity, setSeverity] = useState('all');
  const [group, setGroup]     = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const alerts = cache?.[`alerts-${selectedId}`]?.alerts;

  useEffect(() => {
    if (!selectedId || isDemo || getCached(`alerts-${selectedId}`)) return;
    let cancelled = false;
    setStatus('loading');
    fetch(`/api/alerts?deviceId=${encodeURIComponent(selectedId)}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(({ alerts: data }) => { if (!cancelled) setCached(`alerts-${selectedId}`, { alerts: data ?? [] }); })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [selectedId, refreshKey, isDemo]);

  useEffect(() => { if (alerts) setStatus('ready'); }, [alerts]);

  const list = alerts ?? [];
  const todo = list.filter(a => !a.acknowledged);
  const groups = useMemo(() => [...new Set(list.map(a => a.group_name))].filter(Boolean), [list]);

  const shown = useMemo(() => list.filter(a => {
    if (view === 'todo' && a.acknowledged) return false;
    if (view === 'done' && !a.acknowledged) return false;
    if (severity !== 'all' && a.severity !== severity) return false;
    if (group !== 'all' && a.group_name !== group) return false;
    return true;
  }).sort((a, b) => new Date(b.when ?? b.created_at) - new Date(a.when ?? a.created_at)), [list, view, severity, group]);

  // Alerts per day over the last 14 days, split by severity.
  const perDay = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      days.push({ key: dayLabel(d), day: dayLabel(d), critical: 0, warning: 0, info: 0 });
    }
    for (const a of list) {
      const row = days.find(d => d.key === dayLabel(new Date(a.created_at)));
      if (row && row[a.severity] != null) row[a.severity]++;
    }
    return days;
  }, [list]);

  if (status === 'loading') return <div className="dash-empty" style={{ border: 'none' }} aria-busy="true">Loading alerts...</div>;
  if (status === 'error')   return <div className="dash-error" role="alert">We could not load your alerts. Try the refresh button.</div>;

  const markAll = () => acknowledgeAlerts(selectedId, 'all');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <PageHeader
        title="Alerts"
        sub={`Everything Atmos has flagged in ${nameOf(selectedId)}. Mark an alert as done once you have acted on it, and its saving is counted on your Overview.`}
        actions={
          <>
            {todo.length > 0 && <button type="button" className="dash-btn ghost" onClick={markAll}><Icon name="check" size={16} /> Mark all as done</button>}
            <button type="button" className="dash-btn ghost" aria-expanded={showSettings} onClick={() => setShowSettings(s => !s)}><Icon name="settings" size={16} /> Alert settings</button>
          </>
        }
      />

      {showSettings && <AlertSettings />}

      <section aria-label="Summary">
        <div className="dash-grid">
          <Stat icon="alerts"  tone={todo.length ? '#ef4444' : '#16a34a'} label="To do" value={todo.length} sub={todo.length ? 'Waiting for you' : 'All caught up'} />
          <Stat icon="warning" tone="#f59e0b" label="Urgent" value={todo.filter(a => a.severity === 'critical').length} sub="Critical and not done" />
          <Stat icon="check"   tone="#16a34a" label="Done" value={list.length - todo.length} sub="Counted in your savings" />
        </div>
      </section>

      {list.length > 0 && (
        <BarSeries
          title="Alerts per day"
          subtitle="The last 14 days. A steady drop means your habits are changing."
          summary="Stacked bar chart of critical, warning and info alerts for each of the last fourteen days."
          data={perDay} xKey="day" unit=""
          bars={[
            { key: 'critical', name: 'Critical', color: '#ef4444', stack: 'a' },
            { key: 'warning',  name: 'Warning',  color: '#f59e0b', stack: 'a' },
            { key: 'info',     name: 'Info',     color: C.temp,    stack: 'a' },
          ]}
        />
      )}

      <section aria-labelledby="log-title" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <h2 id="log-title" className="dash-section-title" style={{ margin: 0 }}>
          Alert log {shown.length > 0 && <span style={{ color: '#737373', fontWeight: 400 }}>({shown.length})</span>}
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Segmented label="Show" value={view} onChange={setView} options={[{ value: 'todo', label: 'To do' }, { value: 'done', label: 'Done' }, { value: 'all', label: 'All' }]} />
          <Segmented label="Severity" value={severity} onChange={setSeverity}
                     options={[{ value: 'all', label: 'Any severity' }, ...SEVERITIES.map(s => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))]} />
          {groups.length > 1 && (
            <Segmented label="Category" value={group} onChange={setGroup} options={[{ value: 'all', label: 'All areas' }, ...groups.map(g => ({ value: g, label: g }))]} />
          )}
        </div>

        {shown.length === 0 ? (
          <div className="dash-empty">
            {list.length === 0 ? 'Nothing flagged yet. Alerts appear after the device has sent a few readings.'
              : view === 'todo' && !todo.length ? 'You are all caught up.' : 'No alerts match these filters.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {shown.map(a => (
              <OptCard key={a.id} opt={asOpt(a)} acknowledged={Boolean(a.acknowledged)} onAcknowledge={() => acknowledgeAlerts(selectedId, [a.id])} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
