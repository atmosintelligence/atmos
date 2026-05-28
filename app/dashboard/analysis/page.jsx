'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDevice } from '../DeviceContext';
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

export default function AnalysisPage() {
  const router = useRouter();
  const { selectedId, refreshKey, getCached, setCached, isDemo, demoReadings } = useDevice();
  const [optimizations, setOptimizations] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!selectedId) return;
    if (isDemo && !demoReadings?.length) return;
    let cancelled = false;

    const cacheKey = `overview-${selectedId}`;
    const cached = getCached(cacheKey);

    if (cached?.optimizations) {
      setOptimizations(cached.optimizations);
      setStatus('ready');
      return;
    }

    async function load() {
      const endpoint = isDemo ? '/api/engine/demo' : '/api/engine';
      const body = isDemo
        ? { readings: demoReadings, location: { lat: 28.6139, lon: 77.2090 }, roomAreaM2: 20, tariff: 10 }
        : { location: { lat: 28.6, lon: 77.2 }, roomAreaM2: 20, deviceId: selectedId };

      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (cancelled || !res.ok) return;
      const { optimizations: opts } = await res.json();
      if (cancelled) return;
      setOptimizations(opts ?? []);
      setStatus('ready');
    }

    load();
    return () => { cancelled = true; };
  }, [selectedId, refreshKey, isDemo, demoReadings]);

  function countForTab(tab) {
    if (!tab.group) return null;
    const groups = Array.isArray(tab.group) ? tab.group : [tab.group];
    return optimizations.filter(o => groups.includes(o.group)).length;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div className="dash-greeting">
        <div className="dash-greeting-name">Analysis</div>
        <div className="dash-greeting-sub">
          Detailed breakdowns of your environmental data, organised by category. Each section runs the full rule set against your readings and surfaces actionable insights.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {SUB_TABS.map(tab => {
          const count    = countForTab(tab);
          const hasAlerts = count !== null && count > 0;
          return (
            <button
              key={tab.name}
              onClick={() => router.push(tab.href)}
              style={{
                display:       'flex',
                alignItems:    'center',
                gap:           '1.5rem',
                padding:       '1.5rem 1.75rem',
                borderRadius:  '0.875rem',
                border:        '1px solid rgba(128,128,128,0.12)',
                borderLeft:    `4px solid ${tab.color}`,
                background:    'rgba(255,255,255,0.02)',
                cursor:        'pointer',
                textAlign:     'left',
                width:         '100%',
                transition:    'background 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                  <span className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'inherit' }}>
                    {tab.name}
                  </span>
                  {status === 'ready' && count !== null && (
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                      padding: '0.2rem 0.6rem', borderRadius: '9999px',
                      background: hasAlerts ? tab.color + '20' : 'rgba(128,128,128,0.08)',
                      color: hasAlerts ? tab.color : '#737373',
                    }}>
                      {count === 0 ? 'No recommendations' : `${count} recommendation${count !== 1 ? 's' : ''}`}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#737373', lineHeight: 1.6, margin: 0 }}>
                  {tab.description}
                </p>
              </div>
              <div style={{ flexShrink: 0, color: '#737373' }}>
                <Icon name="arrowRight" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}