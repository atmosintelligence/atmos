'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDevice } from '../DeviceContext';
import { fetchEngine } from '@/lib/engineFetch';
import { THRESHOLDS } from '@/lib/engine/constants.js';
import Icon from '@/components/Icon';

const SUB_TABS = [
  {
    name:        'Lighting',
    href:        '/dashboard/analysis/lighting',
    description: 'Occupancy-based lighting waste, daylight harvesting opportunities, and idle baseline analysis.',
    group:       'Lighting',
    color:       '#eab308',
  },
  {
    name:        'Temperature',
    href:        '/dashboard/analysis/temperature',
    description: 'HVAC efficiency, empty-room conditioning, natural ventilation opportunities, and humidity anomalies.',
    group:       ['HVAC', 'Humidity'],
    color:       '#60a5fa',
  },
  {
    name:        'Power Usage',
    href:        '/dashboard/analysis/power',
    description: 'Phantom load detection, statistical spike anomalies, voltage irregularities, and consumption patterns.',
    group:       'Power',
    color:       '#ef4444',
  },
  {
    name:        'Trends & Predictions',
    href:        '/dashboard/analysis/trends',
    description: 'Week-over-week consumption changes, predictive equipment degradation signals, and daily breakdowns.',
    group:       'Trends',
    color:       '#a78bfa',
  },
  {
    name:        'Environmental Savings',
    href:        '/dashboard/analysis/environmental',
    description: 'CO₂ prevented, money saved, and trees equivalent as benchmarked against BEE standards.',
    group:       null,
    color:       '#4ADE80',
  },
];

const TONE = { good: '#4ADE80', warn: '#eab308', bad: '#ef4444', neutral: '#737373' };

function newest(rows) {
  return rows.reduce((m, r) => (new Date(r.timestamp) > new Date(m.timestamp) ? r : m), rows[0]);
}

function fmtReadingTime(value) {
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

function buildReadingCards(latest) {
  const { temperature: tempLimits, humidity: humLimits, voltage: voltLimits, lux } = THRESHOLDS;
  const temp     = parseFloat(latest.temperature);
  const humidity = parseFloat(latest.humidity);
  const power    = parseFloat(latest.power);
  const light    = parseFloat(latest.light);
  const voltage  = parseFloat(latest.voltage);
  const occupied = latest.occupancy === true || latest.occupancy === 'true';

  const cards = [];

  if (Number.isFinite(temp)) {
    const [text, tone] = temp < tempLimits.low ? ['Cool', 'warn'] : temp > tempLimits.high ? ['Warm', 'warn'] : ['Comfortable', 'good'];
    cards.push({ label: 'Temperature', value: `${temp.toFixed(1)}°C`, icon: 'thermometer', color: '#60a5fa', text, tone });
  }
  if (Number.isFinite(humidity)) {
    const [text, tone] = humidity < humLimits.low ? ['Dry', 'warn'] : humidity > humLimits.high ? ['Humid', 'warn'] : ['Comfortable', 'good'];
    cards.push({ label: 'Humidity', value: `${humidity.toFixed(0)}%`, icon: 'droplet', color: '#a78bfa', text, tone });
  }
  if (Number.isFinite(power)) {
    cards.push({ label: 'Power', value: `${power.toFixed(0)} W`, icon: 'zap', color: '#ef4444', text: 'Current draw', tone: 'neutral' });
  }
  if (Number.isFinite(light)) {
    const [text, tone] = light < lux.dark ? ['Dark', 'neutral'] : light < lux.daylight ? ['Indoor level', 'neutral'] : ['Bright daylight', 'good'];
    cards.push({ label: 'Light', value: `${light.toFixed(0)} lux`, icon: 'lightbulb', color: '#eab308', text, tone });
  }
  if (Number.isFinite(voltage)) {
    const [text, tone] = voltage < voltLimits.low ? ['Too low', 'bad'] : voltage > voltLimits.high ? ['Too high', 'bad'] : ['Stable', 'good'];
    cards.push({ label: 'Voltage', value: `${voltage.toFixed(0)} V`, icon: 'voltage', color: '#4ADE80', text, tone });
  }
  if (latest.occupancy != null) {
    cards.push({
      label: 'Room',
      value: occupied ? 'Occupied' : 'Empty',
      icon:  'home',
      color: '#60a5fa',
      text:  occupied ? 'Someone is in' : 'Nobody inside',
      tone:  occupied ? 'good' : 'neutral',
    });
  }

  return cards;
}

function ReadingCard({ card }) {
  const tone = TONE[card.tone];
  return (
    <div className="dash-stat ar-reading">
      <span className="ar-icon" style={{ color: card.color, background: card.color + '1f' }}>
        <Icon name={card.icon} />
      </span>
      <div className="dash-stat-value">{card.value}</div>
      <div className="dash-stat-label" style={{ paddingRight: 0 }}>{card.label}</div>
      <span className="ar-status" style={{ color: tone, background: tone + '1f' }}>
        <i style={{ background: tone }} />
        {card.text}
      </span>
    </div>
  );
}

export default function AnalysisPage() {
  const { selectedId, refreshKey, getCached, isDemo, getDemoReadings } = useDevice();
  const demoReadings = isDemo ? getDemoReadings(selectedId) : null;
  const [optimizations, setOptimizations] = useState([]);
  const [environmental, setEnvironmental] = useState(null);
  const [latest, setLatest]               = useState(null);
  const [status, setStatus]               = useState('loading');

  useEffect(() => {
    if (!selectedId) return;
    if (isDemo && !demoReadings?.length) return;
    let cancelled = false;

    const cacheKey = `overview-${selectedId}`;
    const cached = getCached(cacheKey);

    if (cached?.optimizations) {
      const rows = getCached(`history-${selectedId}`)?.rows;
      setOptimizations(cached.optimizations);
      setEnvironmental(cached.environmental ?? null);
      setLatest(rows?.length ? newest(rows) : cached.latest ?? null);
      setStatus('ready');
      return;
    }

    setStatus('loading');

    fetchEngine({ isDemo, readings: demoReadings, deviceId: selectedId })
      .then(({ optimizations: opts, environmental: env, readings }) => {
        if (cancelled) return;
        setOptimizations(opts ?? []);
        setEnvironmental(env ?? null);
        setLatest(readings?.length ? newest(readings) : null);
        setStatus('ready');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [selectedId, refreshKey, isDemo, demoReadings]);

  function groupsOf(tab) {
    if (!tab.group) return [];
    return Array.isArray(tab.group) ? tab.group : [tab.group];
  }

  function countForTab(tab) {
    if (!tab.group) return null;
    return optimizations.filter(o => groupsOf(tab).includes(o.group)).length;
  }

  const loading   = status === 'loading';
  const cards     = latest ? buildReadingCards(latest) : [];
  const total     = optimizations.length;
  const urgent    = optimizations.filter(o => o.severity === 'critical' || o.severity === 'warning').length;
  const critical  = optimizations.filter(o => o.severity === 'critical').length;

  const segments  = SUB_TABS
    .filter(tab => tab.group)
    .map(tab => ({ name: tab.name, color: tab.color, count: countForTab(tab) }));
  const covered   = segments.reduce((sum, s) => sum + s.count, 0);
  if (total > covered) segments.push({ name: 'Other', color: '#737373', count: total - covered });
  const visible   = segments.filter(s => s.count > 0);

  const actual    = environmental ? parseFloat(environmental.actualKwh) : 0;
  const baseline  = environmental ? parseFloat(environmental.baselineKwh) : 0;
  const hasEnergy = environmental && baseline > 0;
  const usedPct   = hasEnergy ? Math.round((actual / baseline) * 100) : 0;
  const barColor  = usedPct > 100 ? '#ef4444' : usedPct > 85 ? '#eab308' : '#4ADE80';

  return (
    <div className="ar-page">
      <style>{css}</style>

      <div className="dash-greeting">
        <div className="dash-greeting-name">Analysis</div>
        <div className="dash-greeting-sub">
          Your room at a glance, then detailed breakdowns by category. Each section runs the full rule set against your readings and surfaces actionable insights.
        </div>
      </div>

      <div className="ar-in" style={{ '--i': 0 }}>
        <div className="ar-head">
          <div className="dash-section-title" style={{ marginBottom: 0 }}>Latest sensor readings</div>
          {latest?.timestamp && (
            <span className="ar-updated">
              <span className="ar-live" />
              {fmtReadingTime(latest.timestamp)} · {timeAgo(latest.timestamp)}
            </span>
          )}
        </div>

        {loading && (
          <div className="ar-cards">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton" style={{ height: '8.25rem', borderRadius: '0.75rem' }} />
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="dash-empty" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
            Failed to load readings. Check your connection and refresh.
          </div>
        )}

        {status === 'ready' && cards.length === 0 && (
          <div className="dash-empty">No sensor data yet. Once your device starts sending readings, they will appear here.</div>
        )}

        {status === 'ready' && cards.length > 0 && (
          <div className="ar-cards">
            {cards.map(card => <ReadingCard key={card.label} card={card} />)}
          </div>
        )}
      </div>

      {status === 'ready' && latest && (
        <div className="ar-in" style={{ '--i': 1 }}>
          <div className="ar-head">
            <div className="dash-section-title" style={{ marginBottom: 0 }}>At a glance</div>
          </div>

          <div className="ar-glance">
            <div className="dash-stat">
              <div className="dash-stat-value">{total}</div>
              <div className="dash-stat-label">Recommendations</div>
              <div className="ar-sub">{total === 0 ? 'Nothing to fix right now' : 'Across all categories'}</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value" style={urgent > 0 ? { color: critical > 0 ? '#ef4444' : '#eab308' } : {}}>{urgent}</div>
              <div className="dash-stat-label">Need attention</div>
              <div className="ar-sub">{critical > 0 ? `${critical} critical` : 'Warnings and critical'}</div>
            </div>
            {environmental && (
              <div className="dash-stat">
                <div className="dash-stat-value" style={parseFloat(environmental.moneySavedINR) > 0 ? { color: 'var(--color-primary-dark)' } : {}}>
                  ₹{environmental.moneySavedINR}
                </div>
                <div className="dash-stat-label">Saved vs benchmark</div>
                <div className="ar-sub">Last {environmental.periodDays} days</div>
              </div>
            )}
          </div>

          <div className="ar-panels">
            <div className="dash-device-card ar-panel">
              <div className="ar-panel-title">Where the recommendations are</div>
              {total === 0 ? (
                <div className="ar-sub" style={{ margin: 0 }}>Nothing to fix. Your space is running well.</div>
              ) : (
                <>
                  <div className="ar-stack">
                    {visible.map(s => (
                      <span key={s.name} style={{ flex: s.count, background: s.color }} title={`${s.name}: ${s.count}`} />
                    ))}
                  </div>
                  <div className="ar-legend">
                    {visible.map(s => (
                      <span key={s.name}>
                        <i style={{ background: s.color }} />
                        {s.name} <b>{s.count}</b>
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="dash-device-card ar-panel">
              <div className="ar-panel-title">Energy used vs benchmark</div>
              {hasEnergy ? (
                <>
                  <div className="ar-bar-top">
                    <span>{environmental.actualKwh} kWh used</span>
                    <b>{usedPct}%</b>
                  </div>
                  <div className="ar-bar">
                    <span style={{ '--w': `${Math.min(usedPct, 100)}%`, background: barColor }} />
                  </div>
                  <div className="ar-sub" style={{ margin: 0 }}>
                    {usedPct <= 100
                      ? `${environmental.savedKwh} kWh under the ${environmental.baselineKwh} kWh BEE benchmark.`
                      : `Above the ${environmental.baselineKwh} kWh BEE benchmark. See the tabs below for fixes.`}
                  </div>
                </>
              ) : (
                <div className="ar-sub" style={{ margin: 0 }}>Not enough readings yet to compare with the benchmark.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="ar-in" style={{ '--i': 2 }}>
        <div className="ar-head">
          <div className="dash-section-title" style={{ marginBottom: 0 }}>Explore by category</div>
        </div>
        <div className="ar-tabs">
          {SUB_TABS.map(tab => {
            const count     = countForTab(tab);
            const hasAlerts = count !== null && count > 0;
            return (
              <Link key={tab.name} href={tab.href} className="ar-tab" title={tab.description} style={{ '--c': tab.color }}>
                <i style={{ background: tab.color }} />
                <span className="ar-tab-name">{tab.name}</span>
                {status === 'ready' && count !== null && (
                  <span
                    className="ar-tab-count"
                    style={hasAlerts ? { color: tab.color, background: tab.color + '20' } : undefined}
                  >
                    {count}
                  </span>
                )}
                <span className="ar-tab-arrow"><Icon name="arrowRight" /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const css = `
.ar-page {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  width: 100%;
}

@keyframes arIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}
@keyframes arPulse {
  0%   { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
  70%  { box-shadow: 0 0 0 6px rgba(74,222,128,0); }
  100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
}
@keyframes arGrow {
  from { width: 0; }
}

.ar-in {
  opacity: 0;
  animation: arIn 0.5s ease-out forwards;
  animation-delay: calc(var(--i, 0) * 90ms);
}

.ar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-bottom: 0.75rem;
}

.ar-updated {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: #737373;
}
.ar-live {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #4ADE80;
  animation: arPulse 2s infinite;
}

.ar-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.875rem;
}

.ar-reading { gap: 0.5rem; }
.ar-reading .dash-stat-label { order: 2; }
.ar-icon {
  width: 2.125rem;
  height: 2.125rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ar-icon svg { width: 17px; height: 17px; }

.ar-status {
  align-self: flex-start;
  order: 3;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
  margin-top: 0.125rem;
}
.ar-status i {
  width: 5px;
  height: 5px;
  border-radius: 9999px;
}

.ar-glance {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.875rem;
}
.ar-sub {
  font-size: 0.72rem;
  color: #a3a3a3;
  line-height: 1.55;
  margin-top: 0.1rem;
}

.ar-panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 0.875rem;
  margin-top: 0.875rem;
}
.ar-panel { gap: 0.875rem; padding: 1.25rem 1.375rem; }
.ar-panel-title { font-size: 0.82rem; font-weight: 600; }

.ar-stack {
  display: flex;
  gap: 3px;
  height: 0.75rem;
  border-radius: 9999px;
  overflow: hidden;
}
.ar-stack span { min-width: 6px; }
.ar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  font-size: 0.72rem;
  color: #737373;
}
.ar-legend span { display: inline-flex; align-items: center; gap: 0.4rem; }
.ar-legend i { width: 8px; height: 8px; border-radius: 3px; }
.ar-legend b { color: inherit; font-weight: 600; }

.ar-bar-top {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #737373;
}
.ar-bar-top b { color: inherit; }
.ar-bar {
  height: 0.625rem;
  border-radius: 9999px;
  background: rgba(128,128,128,0.2);
  overflow: hidden;
}
.ar-bar > span {
  display: block;
  height: 100%;
  width: var(--w);
  border-radius: inherit;
  animation: arGrow 1s 0.3s ease-out backwards;
}

.ar-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.5rem;
}
.ar-tab {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.625rem;
  border: 1px solid rgba(128,128,128,0.16);
  background: rgba(128,128,128,0.03);
  font-size: 0.8rem;
  font-weight: 500;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.ar-tab:hover { border-color: var(--c); background: rgba(128,128,128,0.07); }
.ar-tab > i { width: 8px; height: 8px; border-radius: 9999px; flex-shrink: 0; }
.ar-tab-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ar-tab-count {
  font-size: 0.68rem;
  font-weight: 700;
  min-width: 1.25rem;
  text-align: center;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  color: #737373;
  background: rgba(128,128,128,0.12);
}
.ar-tab-arrow { display: inline-flex; color: #a3a3a3; transition: transform 0.15s ease; }
.ar-tab-arrow svg { width: 12px; height: 12px; }
.ar-tab:hover .ar-tab-arrow { transform: translateX(3px); }

@media (prefers-reduced-motion: reduce) {
  .ar-in { animation: none; opacity: 1; }
  .ar-live, .ar-bar > span { animation: none; }
  .ar-tab, .ar-tab-arrow { transition: none; }
}
`;
