'use client';

import { useEffect, useState } from 'react';
import { useDevice }           from '../../DeviceContext';
import { getColStats, scaleColor, tdBase } from '../tableUtils';
import Stat         from '@/components/dashboard/Stat';
import TableWrapper from '@/components/dashboard/TableWrapper';
import OptCard      from '@/components/dashboard/OptCard';

export default function TrendsPage() {
  const { selectedId, selectedDevice, refreshKey, getCached, setCached, isDemo, demoReadings } = useDevice();
  const [data, setData]     = useState(null);
  const [status, setStatus] = useState('loading');

  const lastContacted = selectedDevice?.last_contacted_at
    ? new Date(selectedDevice.last_contacted_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }).replace('am','AM').replace('pm','PM')
    : null;

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    const cacheKey = `trends-${selectedId}`;
    const cached = getCached(cacheKey);
    if (cached) { setData(cached); setStatus('ready'); return; }

    async function load() {
      setStatus('loading');
      const { fetchEngine } = await import('@/lib/engineFetch');
      const res = await fetchEngine({
        isDemo, demoReadings, deviceId: selectedId,
        location: { lat: 28.6139, lon: 77.2090 }, roomAreaM2: 20,
      });
      if (cancelled) return;
      if (!res.ok) { setStatus('error'); return; }
      const json = await res.json();
      if (cancelled) return;
      if (!json.analysis) { setStatus('no-data'); return; }
      const d = { ...json.analysis.trends, optimizations: json.optimizations.filter(o => o.group === 'Trends') };
      setData(d);
      setCached(cacheKey, d);
      setStatus('ready');
    }

    load();
    return () => { cancelled = true; };
  }, [selectedId, refreshKey]);

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

      {optimizations.length > 0 && (
        <div>
          <div className="dash-section-title">Recommendations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {optimizations.map((opt, i) => <OptCard key={i} opt={opt} lastContacted={lastContacted} />)}
          </div>
        </div>
      )}

      {optimizations.length === 0 && (
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
        <div className="dash-section-title">Daily breakdown: last 7 days</div>
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