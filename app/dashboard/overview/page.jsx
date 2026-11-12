'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import Stat from '@/components/dashboard/Stat';
import OptCard from '@/components/dashboard/OptCard';
import PageHeader from '@/components/dashboard/PageHeader';
import { summariseSavings, formatINR } from '@/lib/savings';
import { useDevice } from '../DeviceContext';

const MAX_SHOWN = 5;
const SEVERITY_RANK = { critical: 0, warning: 1, info: 2 };

// Alerts as the recommendation cards the dashboard uses.
function toOpt(a) {
  return {
    id:        a.id,
    group:     a.group_name,
    severity:  a.severity,
    title:     a.title,
    message:   a.message,
    saving:    a.saving_inr ? { inr: String(a.saving_inr) } : null,
    timestamp: a.when,
  };
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} aria-busy="true">
      <div className="skeleton" style={{ height: '2rem', width: '14rem', borderRadius: '0.5rem' }} />
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '6rem', borderRadius: '0.75rem' }} />)}
    </div>
  );
}

export default function OverviewPage() {
  const { selectedId, devices, loadingDevices, profile, cache, loadEngine, refreshKey, isDemo, getDemoReadings, selectedSettings, nameOf, acknowledgeAlerts } = useDevice();

  const [engine, setEngine] = useState(null);
  const [status, setStatus] = useState('loading');

  const waitingForDemo = isDemo && !getDemoReadings(selectedId)?.length;

  useEffect(() => {
    if (!selectedId || waitingForDemo) return;
    let cancelled = false;
    setStatus('loading');
    loadEngine(selectedId)
      .then(json => { if (!cancelled) { setEngine(json); setStatus(json.readings?.length ? 'ready' : 'no-data'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [selectedId, refreshKey, waitingForDemo]);

  if (loadingDevices || (status === 'loading' && selectedId)) return <Skeleton />;
  if (!selectedId) return <div className="dash-empty">Link a device to see your recommendations.</div>;
  if (status === 'error') return <div className="dash-empty dash-error" role="alert">Could not load your data. Check your connection and try again.</div>;

  const alerts   = cache[`alerts-${selectedId}`]?.alerts;
  const pending  = alerts?.length ? alerts.filter(a => !a.acknowledged) : null;   // no alerts yet: show the engine's own findings
  const toShow   = (pending ?? (engine?.optimizations ?? []).map(o => ({ ...o, group_name: o.group, saving_inr: o.saving?.inr, when: o.timestamp })))
    .slice()
    .sort((a, b) => (SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]) || (new Date(b.when ?? 0) - new Date(a.when ?? 0)));

  const savings = summariseSavings(alerts, selectedSettings.tariff);
  const latest  = engine?.readings?.reduce((m, r) => (new Date(r.timestamp) > new Date(m.timestamp) ? r : m), engine.readings[0]);
  const firstName = isDemo ? null : profile?.display_name;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      <PageHeader
        title={firstName ? `Hey, ${firstName}` : 'Overview'}
        sub={`${nameOf(selectedId)}${devices.length > 1 ? ` · one of your ${devices.length} devices` : ''}. Here is what to do next.`}
      />

      {status === 'no-data' && (
        <div className="dash-empty">No readings yet. Once your device starts sending data, recommendations appear here.</div>
      )}

      {status === 'ready' && (
        <section aria-labelledby="todo-title">
          <div className="dash-section-title" id="todo-title">
            {toShow.length ? 'Do this next' : 'Recommendations'}
            {pending && pending.length > MAX_SHOWN && <span style={{ fontWeight: 500, letterSpacing: 0, textTransform: 'none' }}>· showing {MAX_SHOWN} of {pending.length}</span>}
          </div>

          {toShow.length === 0 ? (
            <div className="dash-empty">Nothing to fix right now. Your room is running well.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {toShow.slice(0, MAX_SHOWN).map((a, i) => (
                <OptCard
                  key={a.id ?? i}
                  opt={toOpt(a)}
                  onAcknowledge={a.id != null ? () => acknowledgeAlerts(selectedId, [a.id]) : undefined}
                />
              ))}
            </div>
          )}

          <div style={{ marginTop: '0.75rem' }}>
            <Link href="/dashboard/alerts" className="link arrow-link text-sm font-medium">
              See all alerts <span className="arrow"><Icon name="arrowRight" size={15} /></span>
            </Link>
          </div>
        </section>
      )}

      <section aria-labelledby="saved-title">
        <div className="dash-section-title" id="saved-title">What you have saved</div>
        <div className="dash-grid">
          <Stat icon="coin" tone="#16a34a" label="Money saved" value={formatINR(savings.inr)} sub="From recommendations you marked as done" />
          <Stat icon="zap"  tone="#f59e0b" label="Energy saved" value={`${savings.kwh.toFixed(1)} kWh`} sub={`At ₹${selectedSettings.tariff} per kWh`} />
          <Stat icon="leaf" tone="#0d9488" label="CO₂ avoided" value={`${savings.co2Kg.toFixed(1)} kg`} sub="Using the India grid factor" />
          <Stat icon="tree" tone="#65a30d" label="Trees' worth" value={savings.trees} sub="A tree absorbs about 24 kg a year" />
        </div>
        <p style={{ fontSize: '0.72rem', color: '#737373', marginTop: '0.625rem', lineHeight: 1.6 }}>
          {savings.count
            ? `Based on ${savings.count} recommendation${savings.count === 1 ? '' : 's'} you marked as done. These are estimates, not meter readings.`
            : 'Numbers appear here when you mark a recommendation as done. They are estimates, not meter readings.'}
        </p>
      </section>

      {latest && (
        <section aria-labelledby="now-title">
          <div className="dash-section-title" id="now-title">The room right now</div>
          <div className="dash-grid">
            <Stat icon="thermometer" tone="#3b82f6" label="Temperature" value={latest.temperature != null ? `${latest.temperature}°C` : '—'} />
            <Stat icon="droplet"     tone="#8b5cf6" label="Humidity"    value={latest.humidity != null ? `${latest.humidity}%` : '—'} />
            <Stat icon="lightbulb"   tone="#f59e0b" label="Light"       value={latest.light != null ? `${latest.light} lux` : '—'} />
            <Stat icon="user"        tone="#64748b" label="Occupancy"   value={latest.occupancy === true || latest.occupancy === 'true' ? 'Occupied' : latest.occupancy === false || latest.occupancy === 'false' ? 'Empty' : '—'} />
          </div>
        </section>
      )}
    </div>
  );
}
