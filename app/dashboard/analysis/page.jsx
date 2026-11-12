'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import PageHeader from '@/components/dashboard/PageHeader';
import { useDevice } from '../DeviceContext';

const TABS = [
  { name: 'Lighting',    href: '/dashboard/analysis/lighting',    icon: 'lightingAnalysis',      color: '#f59e0b', groups: ['Lighting'],
    text: 'Lights left on in an empty room, and daylight that makes them unnecessary.' },
  { name: 'Temperature', href: '/dashboard/analysis/temperature', icon: 'temperatureAnalysis',   color: '#3b82f6', groups: ['HVAC', 'Humidity'],
    text: 'AC running when no one is there, windows worth opening, and humidity.' },
  { name: 'Standby',     href: '/dashboard/analysis/standby',     icon: 'standbyAnalysis',       color: '#ec4899', groups: ['Standby'],
    text: 'Devices drawing power while the room sits empty through the day.' },
  { name: 'Trends',      href: '/dashboard/analysis/trends',      icon: 'trendsAnalysis',        color: '#8b5cf6', groups: ['Trends'],
    text: 'Whether waste is rising or falling, and the hour it usually happens.' },
  { name: 'Environmental savings', href: '/dashboard/analysis/environmental', icon: 'environmentalAnalysis', color: '#16a34a', groups: null,
    text: 'Money, energy and CO₂ you have saved, against the BEE benchmark.' },
];

export default function AnalysisPage() {
  const { selectedId, loadEngine, refreshKey, isDemo, getDemoReadings } = useDevice();
  const [opts, setOpts] = useState(null);
  const waiting = isDemo && !getDemoReadings(selectedId)?.length;

  useEffect(() => {
    if (!selectedId || waiting) return;
    let cancelled = false;
    loadEngine(selectedId).then(json => { if (!cancelled) setOpts(json.optimizations ?? []); }).catch(() => {});
    return () => { cancelled = true; };
  }, [selectedId, refreshKey, waiting]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <PageHeader title="Analysis" sub="Pick an area to see the numbers behind your recommendations." />

      <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))' }}>
        {TABS.map(tab => {
          const count = tab.groups && opts ? opts.filter(o => tab.groups.includes(o.group)).length : null;
          return (
            <Link key={tab.name} href={tab.href} className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'border-color 0.15s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="dash-stat-icon" style={{ position: 'static', width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', justifyContent: 'center', color: tab.color, background: `${tab.color}1f` }}>
                  <Icon name={tab.icon} size={24} />
                </span>
                {count !== null && (
                  <span className="dash-opt-badge" style={{ background: count ? `${tab.color}22` : 'rgba(128,128,128,0.1)', color: count ? tab.color : '#737373' }}>
                    {count ? `${count} to act on` : 'All clear'}
                  </span>
                )}
              </div>
              <div>
                <div className="dash-card-title" style={{ fontSize: '1.05rem' }}>{tab.name}</div>
                <p className="dash-card-sub">{tab.text}</p>
              </div>
              <span className="link arrow-link text-sm font-medium" style={{ marginTop: 'auto' }}>
                Open <span className="arrow"><Icon name="arrowRight" size={15} /></span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
