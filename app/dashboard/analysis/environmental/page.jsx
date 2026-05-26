'use client';

import { useEffect, useState } from 'react';
import { useDevice }           from '../../DeviceContext';
import { getColStats, scaleColor, tdBase } from '../tableUtils';
import Stat         from '@/components/dashboard/Stat';
import TableWrapper from '@/components/dashboard/TableWrapper';
import { BEE_BENCHMARK_KWH_M2 } from '@/lib/engine/constants.js';

const ROOM_AREA = 20;

export default function EnvironmentalPage() {
  const { selectedId, refreshKey, getCached, setCached, isDemo, demoReadings } = useDevice();
  const [data, setData]     = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    const cacheKey = `environmental-${selectedId}`;
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
      setData(json.analysis.environmental);
      setCached(cacheKey, json.analysis.environmental);
      setStatus('ready');
    }

    load();
    return () => { cancelled = true; };
  }, [selectedId, refreshKey]);

  if (status === 'loading') return <div className="dash-empty" style={{ border: 'none' }}>Loading...</div>;
  if (status === 'error')   return <div className="dash-empty" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>Failed to load data.</div>;
  if (status === 'no-data' || !data) return <div className="dash-empty">No data available for this device.</div>;

  const env       = data;
  const isSaving  = parseFloat(env.savedKwh) > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div className="dash-greeting">
        <div className="dash-greeting-name">Environmental Savings</div>
        <div className="dash-greeting-sub">
          CO₂ emissions prevented, money saved, and carbon equivalence — calculated against the Bureau of Energy Efficiency benchmark of {BEE_BENCHMARK_KWH_M2} kWh/m²/year.
        </div>
      </div>

      {isSaving ? (
        <div className="dash-opt-card info" style={{ borderColor: 'rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.04)' }}>
          <div className="dash-opt-meta">
            <span className="dash-opt-badge Lighting">Environmental</span>
          </div>
          <p className="dash-opt-message">
            This device is performing better than the BEE benchmark. Over the past month, it has consumed {env.actualKwh} kWh against a benchmark of {env.baselineKwh} kWh — saving {env.savedKwh} kWh, preventing {env.co2KgSaved} kg of CO₂, and saving ₹{env.moneySavedINR}. That is equivalent to {env.treesEquiv} {env.treesEquiv === '1' ? 'tree' : 'trees'} absorbing carbon for a year.
          </p>
        </div>
      ) : (
        <div className="dash-empty">
          Consumption this month exceeds the BEE benchmark. Implementing the recommendations on other tabs should help bring this down.
        </div>
      )}

      <div>
        <div className="dash-section-title">This month's impact</div>
        <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <Stat label="Energy consumed"  value={`${env.actualKwh} kWh`}      sub={`Benchmark: ${env.baselineKwh} kWh`} />
          <Stat label="Energy saved"     value={`${env.savedKwh} kWh`}        accent={isSaving} />
          <Stat label="CO₂ prevented"    value={`${env.co2KgSaved} kg`}       sub="At 0.727 kg per kWh" accent={isSaving} />
          <Stat label="Money saved"      value={`₹${env.moneySavedINR}`}      sub="Per your tariff rate" accent={isSaving} />
          <Stat label="Trees equivalent" value={env.treesEquiv}               sub="FAO: 24 kg CO₂/tree/year" accent={isSaving} />
          <Stat label="BEE benchmark"    value={`${BEE_BENCHMARK_KWH_M2} kWh/m²/yr`} sub={`For ${ROOM_AREA} m² room`} />
        </div>
      </div>

      <div>
        <div className="dash-section-title">Weekly breakdown</div>
        <TableWrapper headers={['Week', 'Consumed', 'Saved', 'CO₂ prevented', 'Money saved']}>
          {(() => {
            const kwhStats   = getColStats(env.weeklyData, 'kwh');
            const savedStats = getColStats(env.weeklyData, 'saved');
            const co2Stats   = getColStats(env.weeklyData, 'co2');
            const moneyStats = getColStats(env.weeklyData, 'money');
            return env.weeklyData.map((w, i) => (
              <tr key={i} style={{ borderBottom: i < env.weeklyData.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                <td style={tdBase({ color: '#737373' })}>{w.week}</td>
                <td style={tdBase(scaleColor(w.kwh, kwhStats))}>{w.kwh} kWh</td>
                <td style={tdBase(scaleColor(w.saved, savedStats))}>{w.saved} kWh</td>
                <td style={tdBase(scaleColor(w.co2, co2Stats))}>{w.co2} kg</td>
                <td style={tdBase(scaleColor(w.money, moneyStats))}>₹{w.money}</td>
              </tr>
            ));
          })()}
        </TableWrapper>
        <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#a3a3a3' }}>
          Baseline derived from BEE benchmark of {BEE_BENCHMARK_KWH_M2} kWh/m²/year for a {ROOM_AREA} m² room. Tariff rate applied from your account settings.
        </div>
      </div>
    </div>
  );
}