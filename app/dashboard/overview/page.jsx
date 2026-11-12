'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProfile } from '@/lib/supabase';
import { fetchEngine } from '@/lib/engineFetch';
import { useDevice } from '../DeviceContext';
import Icon from '@/components/Icon';
import OptCard from '@/components/dashboard/OptCard';

const TARGET_LABEL = { light: 'Lights', fan: 'Fan', ac: 'AC' };

function alertsToOpts(alerts) {
  return (alerts ?? [])
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
    .map(a => ({
      group:     a.group_name,
      severity:  a.severity,
      title:     a.title,
      message:   a.message,
      saving:    a.saving_inr ? { inr: String(a.saving_inr) } : null,
      timestamp: a.when,
    }));
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function fmtLogTime(value) {
  return new Date(value)
    .toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
    .replace('am', 'AM')
    .replace('pm', 'PM');
}

function timeAgo(value) {
  const mins = Math.floor((Date.now() - new Date(value)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function capitalise(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function QuickLink({ href, icon, title, sub, badge, accent, tint, order }) {
  return (
    <Link href={href} className="ov-link ov-rise" style={{ '--accent': accent, '--tint': tint, '--i': order }}>
      <span className="ov-chip" style={{ color: accent, background: tint }}>
        <Icon name={icon} />
      </span>
      <span className="ov-link-body">
        <span className="ov-link-title font-heading">{title}</span>
        <span className="ov-link-sub">{sub}</span>
      </span>
      {badge}
      <span className="ov-arrow"><Icon name="arrowRight" /></span>
    </Link>
  );
}

function SectionHead({ title, href, linkLabel }) {
  return (
    <div className="ov-head">
      <div className="dash-section-title" style={{ marginBottom: 0 }}>{title}</div>
      {href && (
        <Link href={href} className="ov-more">
          {linkLabel}
          <Icon name="arrowRight" />
        </Link>
      )}
    </div>
  );
}

function MiniStat({ label, value, icon, color }) {
  return (
    <div className="dash-stat ov-mini">
      <span className="ov-mini-icon" style={{ color, background: color + '1f' }}>
        <Icon name={icon} />
      </span>
      <div className="dash-stat-value">{value}</div>
      <div className="dash-stat-label" style={{ paddingRight: 0 }}>{label}</div>
    </div>
  );
}

export default function OverviewPage() {
  const { selectedId, devices, refreshKey, getCached, setCached, isDemo, getDemoReadings, cache } = useDevice();
  const demoReadings = isDemo ? getDemoReadings(selectedId) : null;

  const [profile, setProfile]             = useState(null);
  const [optimizations, setOptimizations] = useState([]);
  const [environmental, setEnvironmental] = useState(null);
  const [status, setStatus]               = useState('idle');
  const [logs, setLogs]                   = useState([]);
  const [ruleCount, setRuleCount]         = useState(null);
  const [logsStatus, setLogsStatus]       = useState('loading');

  useEffect(() => {
    if (!selectedId) { setStatus('no-device'); return; }
    if (isDemo && !demoReadings?.length) return;

    let cancelled = false;
    const cacheKey = `overview-${selectedId}`;

    async function load(force = false) {
      try {
        if (!force) {
          const cached = getCached(cacheKey);
          if (cached) {
            setOptimizations(cached.optimizations ?? []);
            setEnvironmental(cached.environmental ?? null);
            setStatus(cached.noData ? 'no-data' : 'ready');
            if (!isDemo && cached.profile) {
              setProfile(cached.profile);
            } else if (!isDemo && !cached.profile) {
              getProfile('display_name, username').then(data => {
                if (!data) return;
                setProfile(data);
                setCached(cacheKey, { ...cached, profile: data });
              });
            }
            return;
          }
        }

        if (!force) setStatus('loading');

        if (!isDemo) {
          const prof = await getProfile('display_name, username');
          if (cancelled) return;
          if (prof) setProfile(prof);
        }

        const json = await fetchEngine({ isDemo, readings: demoReadings, deviceId: selectedId });
        if (cancelled) return;

        const { optimizations: jsOpts, environmental: env, readings } = json;

        if (!readings?.length) {
          setOptimizations([]);
          setEnvironmental(null);
          setStatus('no-data');
          setCached(cacheKey, { profile: null, latest: null, optimizations: [], environmental: null, noData: true });
          return;
        }

        let finalOptimizations = (jsOpts ?? []).slice(0, 5);
        const alertsCache = getCached(`alerts-${selectedId}`);
        if (alertsCache?.alerts?.length) {
          finalOptimizations = alertsToOpts(alertsCache.alerts);
        }

        setOptimizations(finalOptimizations);
        setEnvironmental(env ?? null);
        setStatus('ready');
        setCached(cacheKey, {
          profile:       isDemo ? null : undefined,
          latest:        readings.at(-1),
          optimizations: finalOptimizations,
          environmental: env ?? null,
          noData:        false,
        });
      } catch (err) {
        if (!cancelled) {
          console.error('[Overview] load() threw:', err);
          if (!force) setStatus('error');
        }
      }
    }

    load();
    const interval = setInterval(() => { if (!cancelled) load(true); }, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [selectedId, refreshKey, isDemo, demoReadings]);

  useEffect(() => {
    const alerts = cache?.[`alerts-${selectedId}`]?.alerts;
    if (!alerts?.length || status !== 'ready') return;
    setOptimizations(alertsToOpts(alerts));
  }, [cache, selectedId, status]);

  useEffect(() => {
    setLogs([]);
    setRuleCount(null);

    if (!selectedId || isDemo) {
      setLogsStatus('ready');
      return;
    }

    let cancelled = false;
    setLogsStatus('loading');

    async function loadLogs() {
      try {
        const res = await fetch(`/api/automation/schedules?deviceId=${encodeURIComponent(selectedId)}`);
        if (!res.ok) throw new Error('Failed to load automation');
        const data = await res.json();
        if (cancelled) return;
        setLogs(data.logs ?? []);
        setRuleCount((data.schedules ?? []).filter(r => r.enabled).length);
        setLogsStatus('ready');
      } catch {
        if (!cancelled) setLogsStatus('error');
      }
    }

    loadLogs();
    const interval = setInterval(loadLogs, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [selectedId, refreshKey, isDemo]);

  if (status === 'loading' || status === 'idle') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton" style={{ height: '2rem', width: '220px', borderRadius: '0.5rem' }} />
        <div className="skeleton" style={{ height: '1rem', width: '340px', borderRadius: '0.375rem' }} />
      </div>
      <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {[1, 2].map(i => (
          <div key={i} className="skeleton" style={{ height: '5.5rem', borderRadius: '1rem' }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: '9rem', borderRadius: '1rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="dash-device-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div className="skeleton" style={{ height: '1rem', width: '70px', borderRadius: '9999px' }} />
              <div className="skeleton" style={{ height: '1rem', width: '120px', borderRadius: '0.25rem' }} />
            </div>
            <div className="skeleton" style={{ height: '0.8rem', width: '100%', borderRadius: '0.25rem' }} />
            <div className="skeleton" style={{ height: '0.8rem', width: '80%', borderRadius: '0.25rem' }} />
          </div>
        ))}
      </div>
    </div>
  );

  if (status === 'error') return (
    <div className="dash-empty" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
      Failed to load data. Check your connection.
    </div>
  );

  const alertList = cache?.[`alerts-${selectedId}`]?.alerts;
  const unread    = alertList ? alertList.filter(a => !a.acknowledged).length : null;

  const firstName = profile?.display_name?.split(' ')[0];
  const title     = isDemo ? 'Welcome to the demo' : `${greeting()}, ${firstName ?? '...'}`;

  const saved     = environmental ? parseFloat(environmental.savedKwh) : 0;
  const actual    = environmental ? parseFloat(environmental.actualKwh) : 0;
  const baseline  = environmental ? parseFloat(environmental.baselineKwh) : 0;
  const isSaving  = saved > 0;
  const usedPct   = baseline > 0 ? Math.round((actual / baseline) * 100) : 0;
  const barColor  = usedPct > 100 ? '#ef4444' : usedPct > 85 ? '#eab308' : '#4ADE80';

  const alertsBadge = unread === null ? null : (
    <span className="ov-badge" style={unread > 0
      ? { color: '#ef4444', background: 'rgba(239,68,68,0.12)' }
      : { color: 'var(--color-primary-dark)', background: 'rgba(74,222,128,0.12)' }}
    >
      {unread > 0 ? `${unread} new` : 'All clear'}
    </span>
  );

  const automationBadge = ruleCount === null ? null : (
    <span className="ov-badge" style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.14)' }}>
      {plural(ruleCount, 'active rule')}
    </span>
  );

  const recentLogs = logs.slice(0, 6);

  return (
    <div className="ov-page">
      <style>{css}</style>

      <div className="dash-greeting ov-rise" style={{ '--i': 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div className="dash-greeting-name">{title}</div>
            <div className="dash-greeting-sub">
              Here is how your space is doing right now, what needs attention, and what your sensor has been up to.
            </div>
          </div>

          <div className="ov-devices">
            <span className="ov-live" />
            <span style={{ fontWeight: 600 }}>{devices.length}</span>
            <span>{devices.length === 1 ? 'device linked' : 'devices linked'}</span>
          </div>
        </div>
      </div>

      <div className="ov-links">
        <QuickLink
          href="/dashboard/alerts"
          icon="alerts"
          title="Alerts"
          sub={unread > 0
            ? `${plural(unread, 'alert')} waiting for you`
            : 'Review every rule that fired'}
          badge={alertsBadge}
          accent="#eab308"
          tint="rgba(234,179,8,0.14)"
          order={1}
        />
        <QuickLink
          href="/dashboard/automation"
          icon="automation"
          title="Automation"
          sub="Schedule lights, fan and AC, or let AI plan it"
          badge={automationBadge}
          accent="#a78bfa"
          tint="rgba(167,139,250,0.16)"
          order={2}
        />
      </div>

      {status === 'no-data' && (
        <div className="dash-empty ov-rise" style={{ '--i': 3 }}>
          No sensor data yet. Once your device starts sending readings, they will appear here.
        </div>
      )}

      {environmental && (
        <div className="ov-rise" style={{ '--i': 3 }}>
          <SectionHead title={`Savings vs benchmark${environmental.periodDays ? ` (last ${environmental.periodDays} days)` : ''}`} />
          <div className={`ov-hero ${isSaving ? '' : 'flat'}`}>
            <div className="ov-hero-main">
              <div className="ov-hero-label">{isSaving ? 'You have saved' : 'Savings so far'}</div>
              <div className="ov-hero-value font-heading">₹{environmental.moneySavedINR}</div>
              <div className="ov-hero-note">
                {isSaving
                  ? `${environmental.kwhSaved} kWh less than the BEE benchmark for a room this size.`
                  : 'Usage is at or above the BEE benchmark. The tips below can help bring it down.'}
              </div>
            </div>

            <div className="ov-hero-bar">
              <div className="ov-hero-bar-top">
                <span>Energy used</span>
                <span style={{ fontWeight: 600 }}>{usedPct}% of benchmark</span>
              </div>
              <div className="ov-bar">
                <span style={{ '--w': `${Math.min(usedPct, 100)}%`, background: barColor }} />
              </div>
              <div className="ov-hero-bar-bottom">
                <span>{environmental.actualKwh} kWh used</span>
                <span>{environmental.baselineKwh} kWh benchmark</span>
              </div>
            </div>
          </div>

          <div className="ov-minis">
            <MiniStat label="Energy saved"     value={`${environmental.kwhSaved} kWh`}   icon="zap"  color="#eab308" />
            <MiniStat label="CO₂ prevented"    value={`${environmental.co2KgSaved} kg`}  icon="leaf" color="#4ADE80" />
            <MiniStat label="Trees equivalent" value={environmental.treesEquiv}          icon="tree" color="#60a5fa" />
          </div>
        </div>
      )}

      {optimizations.length > 0 && (
        <div className="ov-rise" style={{ '--i': 4 }}>
          <SectionHead title="Recommendations" href="/dashboard/alerts" linkLabel="All alerts" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {optimizations.map((opt, i) => (
              <OptCard key={i} opt={opt} />
            ))}
          </div>
        </div>
      )}

      {status === 'ready' && optimizations.length === 0 && (
        <div className="dash-empty ov-rise" style={{ '--i': 4 }}>
          No recommendations right now. Your environment looks good.
        </div>
      )}

      <div className="ov-rise" style={{ '--i': 5 }}>
        <SectionHead title="Recent actions" href="/dashboard/automation" linkLabel="Open automation" />
        <div className="dash-device-card" style={{ padding: '0.5rem 1.25rem', gap: 0 }}>
          {logsStatus === 'loading' && [1, 2, 3].map(i => (
            <div key={i} className="ov-action">
              <div className="skeleton" style={{ width: '0.6rem', height: '0.6rem', borderRadius: '9999px' }} />
              <div className="skeleton" style={{ height: '0.8rem', width: `${60 - i * 8}%`, borderRadius: '0.25rem' }} />
            </div>
          ))}

          {logsStatus === 'error' && (
            <div className="ov-action-empty" style={{ color: '#ef4444' }}>
              Could not load recent actions. Try refreshing.
            </div>
          )}

          {logsStatus === 'ready' && recentLogs.length === 0 && (
            <div className="ov-action-empty">
              {isDemo
                ? 'Actions the sensor takes will appear here.'
                : 'No actions reported yet. Once your unit switches something, it shows up here.'}
            </div>
          )}

          {logsStatus === 'ready' && recentLogs.map((log, i) => (
            <div key={i} className="ov-action">
              <span className={`ov-action-dot ${log.action}`} />
              <div className="ov-action-body">
                <div className="ov-action-main">
                  {TARGET_LABEL[log.target] ?? capitalise(log.target)} turned{' '}
                  <span className={`ov-pill ${log.action}`}>{log.action}</span>
                </div>
                {log.reason && <div className="ov-action-reason">{capitalise(log.reason)}</div>}
              </div>
              <div className="ov-action-time" title={fmtLogTime(log.timestamp)}>{timeAgo(log.timestamp)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const css = `
.ov-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

@keyframes ovRise {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
@keyframes ovPulse {
  0%   { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
  70%  { box-shadow: 0 0 0 7px rgba(74,222,128,0); }
  100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
}
@keyframes ovGrow {
  from { width: 0; }
}

.ov-rise {
  opacity: 0;
  animation: ovRise 0.5s ease-out forwards;
  animation-delay: calc(var(--i, 0) * 70ms);
}

.ov-live {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #4ADE80;
  animation: ovPulse 2s infinite;
  flex-shrink: 0;
}

.ov-devices {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  color: #737373;
  background: rgba(74,222,128,0.08);
  border: 1px solid rgba(74,222,128,0.2);
}
.ov-devices span:nth-child(2) { color: var(--color-primary-dark); }
.dark .ov-devices span:nth-child(2) { color: var(--color-primary); }

.ov-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.875rem;
}

.ov-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.375rem;
  border-radius: 1rem;
  border: 1px solid rgba(128,128,128,0.18);
  background: white;
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.dark .ov-link { background: rgba(255,255,255,0.03); }
.ov-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 100% 0%, var(--tint), transparent 65%);
  pointer-events: none;
}
.ov-link:hover {
  transform: translateY(-3px);
  border-color: var(--accent);
  box-shadow: 0 12px 32px -14px var(--accent);
}
.ov-link:hover .ov-arrow { transform: translateX(4px); color: var(--accent); }

.ov-chip {
  position: relative;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ov-chip svg { width: 20px; height: 20px; }

.ov-link-body {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.ov-link-title { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.01em; }
.ov-link-sub { font-size: 0.78rem; color: #737373; line-height: 1.45; }

.ov-badge {
  position: relative;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  white-space: nowrap;
}

.ov-arrow {
  position: relative;
  display: inline-flex;
  color: #a3a3a3;
  transition: transform 0.2s ease, color 0.2s ease;
}

.ov-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}
.ov-more {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #737373;
  transition: color 0.15s ease;
}
.ov-more svg { width: 12px; height: 12px; }
.ov-more:hover { color: var(--color-primary-dark); }
.dark .ov-more:hover { color: var(--color-primary); }

.ov-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 2rem;
  align-items: center;
  padding: 1.75rem 2rem;
  border-radius: 1.125rem;
  border: 1px solid rgba(74,222,128,0.28);
  background: linear-gradient(135deg, rgba(74,222,128,0.16), rgba(74,222,128,0.03) 65%);
}
.ov-hero.flat {
  border-color: rgba(128,128,128,0.2);
  background: rgba(128,128,128,0.05);
}
@media (max-width: 760px) {
  .ov-hero { grid-template-columns: 1fr; gap: 1.5rem; padding: 1.5rem; }
}

.ov-hero-label { font-size: 0.78rem; color: #737373; margin-bottom: 0.25rem; }
.ov-hero-value {
  font-size: clamp(2.25rem, 5vw, 3.25rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: var(--color-primary-dark);
  font-variant-numeric: tabular-nums;
}
.dark .ov-hero-value { color: var(--color-primary); }
.ov-hero.flat .ov-hero-value { color: inherit; }
.ov-hero-note { font-size: 0.8rem; color: #737373; line-height: 1.6; margin-top: 0.625rem; max-width: 24rem; }

.ov-hero-bar-top,
.ov-hero-bar-bottom {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.75rem;
  color: #737373;
}
.ov-hero-bar-top { margin-bottom: 0.625rem; }
.ov-hero-bar-bottom { margin-top: 0.5rem; font-size: 0.7rem; }

.ov-bar {
  height: 0.625rem;
  border-radius: 9999px;
  background: rgba(128,128,128,0.2);
  overflow: hidden;
}
.ov-bar > span {
  display: block;
  height: 100%;
  width: var(--w);
  border-radius: inherit;
  animation: ovGrow 1s 0.3s ease-out backwards;
}

.ov-minis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.875rem;
  margin-top: 0.875rem;
}
.ov-mini { gap: 0.5rem; }
.ov-mini-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ov-mini-icon svg { width: 16px; height: 16px; }
.ov-mini .dash-stat-label { order: 2; }

.ov-action {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(128,128,128,0.12);
}
.ov-action:last-child { border-bottom: none; }

.ov-action-dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 9999px;
  flex-shrink: 0;
  background: #737373;
}
.ov-action-dot.on  { background: #4ADE80; box-shadow: 0 0 0 4px rgba(74,222,128,0.15); }
.ov-action-dot.off { background: #ef4444; box-shadow: 0 0 0 4px rgba(239,68,68,0.12); }

.ov-action-body { flex: 1; min-width: 0; }
.ov-action-main { font-size: 0.82rem; font-weight: 500; }
.ov-action-reason {
  font-size: 0.72rem;
  color: #737373;
  margin-top: 0.15rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ov-action-time { font-size: 0.72rem; color: #a3a3a3; white-space: nowrap; }
.ov-action-empty { font-size: 0.8rem; color: #737373; padding: 1rem 0; }

.ov-pill {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
}
.ov-pill.on  { color: var(--color-primary-dark); background: rgba(74,222,128,0.15); }
.dark .ov-pill.on { color: var(--color-primary); }
.ov-pill.off { color: #ef4444; background: rgba(239,68,68,0.12); }

@media (prefers-reduced-motion: reduce) {
  .ov-rise { animation: none; opacity: 1; }
  .ov-live, .ov-bar > span { animation: none; }
  .ov-link, .ov-arrow { transition: none; }
}
`;
