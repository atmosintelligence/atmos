'use client';

import { useEffect, useState } from 'react';
import { useDevice }           from '../../DeviceContext';
import { getColStats, scaleColor, fmtDate, tdBase } from '../tableUtils';
import Stat        from '@/components/dashboard/Stat';
import TableWrapper from '@/components/dashboard/TableWrapper';
import OptCard      from '@/components/dashboard/OptCard';
import PowerChart   from '@/components/dashboard/charts/PowerChart';

export default function PowerPage() {
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
    const cacheKey = `power-${selectedId}`;
    const cached   = getCached(cacheKey);
    if (cached) { setData(structuredClone(cached)); setStatus('ready'); }

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
        ...json.analysis.power,
        optimizations: json.optimizations.filter(o => o.group === 'Power'),
        readings:      json.readings ?? [],
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

  const { p1Events, p2Events, p3Events, avgPower, maxPower, totalEnergy, optimizations, readings } = data;
  const totalP2Cost = p2Events.reduce((a, e) => a + parseFloat(e.cost), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div className="dash-greeting">
        <div className="dash-greeting-name">Power Usage</div>
        <div className="dash-greeting-sub">Energy consumption patterns, anomaly detection, phantom load analysis, and voltage stability.</div>
      </div>

      {optimizations.length > 0 ? (
        <div>
          <div className="dash-section-title">Recommendations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {optimizations.map((opt, i) => <OptCard key={i} opt={opt} lastContacted={lastContacted} />)}
          </div>
        </div>
      ) : (
        <div className="dash-empty">No power anomalies detected.</div>
      )}

      <div>
        <div className="dash-section-title">Summary</div>
        <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <Stat label="Average power" value={`${avgPower.toFixed(0)} W`} />
          <Stat label="Peak power"    value={`${maxPower.toFixed(0)} W`} />
          <Stat label="Total energy"  value={`${totalEnergy.toFixed(2)} kWh`} />
        </div>
      </div>

      <div>
        <div className="dash-section-title">Graphs</div>
        <PowerChart
          key={`${selectedId}-${refreshKey}`}
          readings={readings}
          avgPower={avgPower}
        />
      </div>

      {p2Events.length > 0 && (
        <div>
          <div className="dash-section-title">Phantom load events</div>
          <TableWrapper headers={['Detected at', 'Empty for', 'Power draw', 'Estimated cost']}>
            {(() => {
              const hoursStats = getColStats(p2Events, 'emptyHours');
              const powerStats = getColStats(p2Events, 'power');
              const costStats  = getColStats(p2Events, 'cost');
              return p2Events.map((e, i) => (
                <tr key={i} style={{ borderBottom: i < p2Events.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                  <td style={tdBase({ color: '#737373' })}>{fmtDate(e.timestamp)}</td>
                  <td style={tdBase(scaleColor(e.emptyHours, hoursStats))}>{e.emptyHours} hr</td>
                  <td style={tdBase(scaleColor(e.power, powerStats))}>{e.power} W</td>
                  <td style={tdBase(scaleColor(e.cost, costStats))}>₹{e.cost}</td>
                </tr>
              ));
            })()}
          </TableWrapper>
          <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#a3a3a3' }}>Total estimated cost: ₹{totalP2Cost.toFixed(2)}</div>
        </div>
      )}

      {p3Events.length > 0 && (
        <div>
          <div className="dash-section-title">Voltage irregularities</div>
          <TableWrapper headers={['Detected at', 'Voltage', 'Condition']}>
            {(() => {
              const voltStats = getColStats(p3Events, 'voltage');
              return p3Events.map((e, i) => (
                <tr key={i} style={{ borderBottom: i < p3Events.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                  <td style={tdBase({ color: '#737373' })}>{fmtDate(e.timestamp)}</td>
                  <td style={tdBase(scaleColor(e.voltage, voltStats))}>{e.voltage} V</td>
                  <td style={{ ...tdBase(), color: '#eab308' }}>{e.low ? 'Too low' : 'Too high'}</td>
                </tr>
              ));
            })()}
          </TableWrapper>
        </div>
      )}
    </div>
  );
}