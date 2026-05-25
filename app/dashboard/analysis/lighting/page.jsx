'use client';

import { useEffect, useState } from 'react';
import { useDevice }           from '../../DeviceContext';
import { getColStats, scaleColor, fmtDate, tdBase } from '../tableUtils';
import Stat         from '@/components/dashboard/Stat';
import TableWrapper from '@/components/dashboard/TableWrapper';
import OptCard      from '@/components/dashboard/OptCard';

export default function LightingPage() {
  const { selectedId, refreshKey, getCached, setCached, selectedDevice } = useDevice();
  const [data, setData]     = useState(null);
  const [status, setStatus] = useState('loading');

  const lastContacted = selectedDevice?.last_contacted_at
    ? new Date(selectedDevice.last_contacted_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }).replace('am','AM').replace('pm','PM')
    : null;

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    const cacheKey = `lighting-${selectedId}`;
    const cached = getCached(cacheKey);
    if (cached) { setData(cached); setStatus('ready'); return; }

    async function load() {
      setStatus('loading');
      const res = await fetch('/api/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: { lat: 28.6, lon: 77.2 }, roomAreaM2: 20, deviceId: selectedId }),
      });
      if (cancelled) return;
      if (!res.ok) { setStatus('error'); return; }
      const json = await res.json();
      if (cancelled) return;
      if (!json.analysis) { setStatus('no-data'); return; }
      const d = { ...json.analysis.lighting, optimizations: json.optimizations.filter(o => o.group === 'Lighting') };
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

  const { l1Events, l2Events, idleBaseline, optimizations } = data;
  const hasL1 = l1Events.length > 0;
  const hasL2 = l2Events.length > 0;
  const totalL1Waste = l1Events.reduce((a, e) => a + parseFloat(e.waste), 0);
  const totalL2Save  = l2Events.reduce((a, e) => a + parseFloat(e.saving), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div className="dash-greeting">
        <div className="dash-greeting-name">Lighting</div>
        <div className="dash-greeting-sub">Analysis of lighting conditions, occupancy patterns, and energy waste from artificial lighting.</div>
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
        <div className="dash-empty">No lighting recommendations at this time. Conditions look efficient.</div>
      )}

      <div>
        <div className="dash-section-title">Summary</div>
        <div className="dash-grid">
          <Stat label="Idle baseline" value={`${idleBaseline.toFixed(0)} W`} sub="Night-time base load" />
          <Stat label="L1 events" value={l1Events.length} sub="Empty room with high power" />
          <Stat label="L2 opportunities" value={l2Events.length} sub="Daylight harvesting" />
          <Stat label="Total L1 waste" value={`₹${totalL1Waste.toFixed(2)}`} />
        </div>
      </div>

      {hasL1 && (
        <div>
          <div className="dash-section-title">Empty room events</div>
          <TableWrapper headers={['Detected at', 'Vacant for', 'Power', 'Estimated waste']}>
            {(() => {
              const vacantStats = getColStats(l1Events, 'vacantMins');
              const powerStats  = getColStats(l1Events, 'power');
              const wasteStats  = getColStats(l1Events, 'waste');
              return l1Events.map((e, i) => (
                <tr key={i} style={{ borderBottom: i < l1Events.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                  <td style={tdBase({ color: '#737373' })}>{fmtDate(e.timestamp)}</td>
                  <td style={tdBase(scaleColor(e.vacantMins, vacantStats))}>{e.vacantMins} min</td>
                  <td style={tdBase(scaleColor(e.power, powerStats))}>{e.power} W</td>
                  <td style={tdBase(scaleColor(e.waste, wasteStats))}>₹{e.waste}</td>
                </tr>
              ));
            })()}
          </TableWrapper>
          <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#a3a3a3' }}>Total estimated waste: ₹{totalL1Waste.toFixed(2)}</div>
        </div>
      )}

      {hasL2 && (
        <div>
          <div className="dash-section-title">Daylight harvesting opportunities</div>
          <TableWrapper headers={['Detected at', 'Natural light', 'Power draw', 'Potential saving']}>
            {(() => {
              const luxStats    = getColStats(l2Events, 'lux');
              const powerStats  = getColStats(l2Events, 'power');
              const savingStats = getColStats(l2Events, 'saving');
              return l2Events.map((e, i) => (
                <tr key={i} style={{ borderBottom: i < l2Events.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                  <td style={tdBase({ color: '#737373' })}>{fmtDate(e.timestamp)}</td>
                  <td style={tdBase(scaleColor(e.lux, luxStats))}>{e.lux} lux</td>
                  <td style={tdBase(scaleColor(e.power, powerStats))}>{e.power} W</td>
                  <td style={tdBase(scaleColor(e.saving, savingStats))}>₹{e.saving}</td>
                </tr>
              ));
            })()}
          </TableWrapper>
          <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#a3a3a3' }}>Total potential saving: ₹{totalL2Save.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}