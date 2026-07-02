'use client';

import { useEffect, useState } from 'react';
import { useDevice }           from '../../DeviceContext';
import { getColStats, scaleColor, tdBase } from '../tableUtils';
import Stat        from '@/components/dashboard/Stat';
import TableWrapper from '@/components/dashboard/TableWrapper';
import OptCard      from '@/components/dashboard/OptCard';
import TrendsChart  from '@/components/dashboard/charts/TrendsChart';

export default function TrendsPage() {
  const { selectedId, refreshKey, getCached, setCached, selectedDevice, isDemo, demoReadings } = useDevice();
  const [data, setData]     = useState(null);
  const [status, setStatus] = useState('loading');

  const lastContacted = selectedDevice?.last_contacted_at
    ? new Date(selectedDevice.last_contacted_at).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
      }).replace('am', 'AM').replace('pm', 'PM')
    : null;

  useEffect(() => {
    if (!selectedId) return;
    if (isDemo && !demoReadings?.length) return;
    let cancelled = false;
    const cacheKey = `trends-${selectedId}`;
    const cached   = getCached(cacheKey);
    if (cached) { setData(cached); setStatus('ready'); }

    async function load() {
      setStatus('loading');
      const endpoint = isDemo ? '/api/engine/demo' : '/api/engine';
      const body     = isDemo
        ? { readings: demoReadings, location: { lat: 28.6139, lon: 77.2090 }, roomAreaM2: 20, tariff: 10 }
        : { location: { lat: 28.6, lon: 77.2 }, roomAreaM2: 20, deviceId: selectedId };

      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (cancelled) return;
      if (!res.ok) { setStatus('error'); return; }
      const json = await res.json();
      if (cancelled) return;
      if (!json.analysis) { setStatus('no-data'); return; }
      const d = {
        ...json.analysis.trends,
        optimizations: json.optimizations.filter(o => o.group === 'Trends'),
      };
      setData(d);
      setCached(cacheKey, d);
      setStatus('ready');
    }

    load();
    return () => { cancelled = true; };
  }, [selectedId, refreshKey, isDemo, demoReadings]);

  if (status === 'loading') return <div className="dash-empty" style={{ border: 'none' }}>Loading...</div>;
  if (status === 'error')   return <div className="dash-empty" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>Failed to load data.</div>;
  if (status === 'no-data' || !data) return <div className="dash-empty">No data available for this device.</div>;

  const { trend1, trend2, avgPowerThisWeek, avgPowerLastWeek, dailyBreakdown, optimizations } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div className="dash-greeting">
        <div className="dash-greeting-name">Trends & Predictions</div>
        <div className="dash-greeting-sub">Week-over-week consumption trends, predictive degradation signals, and daily energy breakdowns.</div>
      </div>

      {optimizations.length > 0 ? (
        <div>
          <div className="dash-section-title">Recommendations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {optimizations.map((opt, i) => <OptCard key={i} opt={opt} lastContacted={lastContacted} />)}
          </div>
        </div>
      ) : (
        <div className="dash-empty">No notable trends detected. Consumption appears stable.</div>
      )}

      <div>
        <div className="dash-section-title">Week comparison</div>
        <div className="dash-grid">
          <Stat label="This week avg power" value={`${avgPowerThisWeek.toFixed(0)} W`} />
          <Stat label="Last week avg power" value={`${avgPowerLastWeek.toFixed(0)} W`} />
          <Stat label="Week-on-week change" value={trend1 ? `${trend1.changePct > 0 ? '+' : ''}${trend1.changePct}%` : '—'} sub={trend1?.rising ? 'Above 8% threshold' : 'Within normal range'} />
          {trend2 && <Stat label="Degradation rate" value={`${trend2.slope} W/day`} sub={`R² = ${trend2.r2}`} />}
        </div>
      </div>

      <div>
        <div className="dash-section-title">Graphs</div>
        <TrendsChart
          key={`${selectedId}-${refreshKey}`}
          dailyBreakdown={dailyBreakdown}
          avgPowerThisWeek={avgPowerThisWeek}
          avgPowerLastWeek={avgPowerLastWeek}
        />
      </div>

      <div>
        <div className="dash-section-title">Daily breakdown: Last 7 days</div>
        <TableWrapper headers={['Date', 'Avg power', 'Energy', 'Readings']}>
          {(() => {
            const powerStats   = getColStats(dailyBreakdown, 'avgPower');
            const kwhStats     = getColStats(dailyBreakdown, 'kwh');
            const readingStats = getColStats(dailyBreakdown, 'readings');
            return dailyBreakdown.map((d, i) => (
              <tr key={i} style={{ borderBottom: i < dailyBreakdown.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                <td style={tdBase({ color: '#737373' })}>{d.date}</td>
                <td style={tdBase(scaleColor(d.avgPower, powerStats))}>{d.avgPower} W</td>
                <td style={tdBase(scaleColor(d.kwh, kwhStats))}>{d.kwh} kWh</td>
                <td style={tdBase(scaleColor(d.readings, readingStats))}>{d.readings}</td>
              </tr>
            ));
          })()}
        </TableWrapper>
      </div>
    </div>
  );
}