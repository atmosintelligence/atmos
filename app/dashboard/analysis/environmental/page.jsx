'use client';

import { useAnalysis, analysisGate } from '../../useAnalysis';
import { getColStats, scaleColor, tdBase } from '../tableUtils';
import Stat               from '@/components/dashboard/Stat';
import TableWrapper        from '@/components/dashboard/TableWrapper';
import EnvironmentalChart  from '@/components/dashboard/charts/EnvironmentalChart';
import { BEE_BENCHMARK_KWH_M2 } from '@/lib/engine/constants.js';

const ROOM_AREA = 20;

export default function EnvironmentalPage() {
  const { data, status, selectedId, refreshKey } = useAnalysis('environmental');
  const gate = analysisGate(status, data);
  if (gate) return gate;

  const env      = data;
  const isSaving = parseFloat(env.savedKwh) > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div className="dash-greeting">
        <div className="dash-greeting-name">Environmental Savings</div>
        <div className="dash-greeting-sub">
          CO₂ emissions prevented, money saved, and carbon equivalence, benchmarked against the BEE standard of {BEE_BENCHMARK_KWH_M2} kWh/m²/year.
        </div>
      </div>

      {isSaving ? (
        <div className="dash-opt-card info" style={{ borderColor: 'rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.04)' }}>
          <div className="dash-opt-meta">
            <span className="dash-opt-badge" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ADE80' }}>Environmental</span>
          </div>
          <p className="dash-opt-message">
            This device is performing below the BEE benchmark. Over the last {env.periodDays} days it consumed {env.actualKwh} kWh against a pro-rated benchmark of {env.baselineKwh} kWh, saving {env.savedKwh} kWh, preventing {env.co2KgSaved} kg of CO₂, and saving ₹{env.moneySavedINR}. Equivalent to {env.treesEquiv} {env.treesEquiv === '1' ? 'tree' : 'trees'} absorbing carbon for a year.
          </p>
        </div>
      ) : (
        <div className="dash-empty">
          Consumption over the last {env.periodDays} days is at or above the BEE benchmark. Implementing the recommendations across other tabs should help.
        </div>
      )}

      <div>
        <div className="dash-section-title">Impact (last {env.periodDays} days)</div>
        <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <Stat label="Energy consumed"  value={`${env.actualKwh} kWh`}     sub={`Benchmark: ${env.baselineKwh} kWh`} />
          <Stat label="Energy saved"     value={`${env.savedKwh} kWh`}       accent={isSaving} />
          <Stat label="CO₂ prevented"    value={`${env.co2KgSaved} kg`}      sub="At 0.727 kg per kWh" accent={isSaving} />
          <Stat label="Money saved"      value={`₹${env.moneySavedINR}`}     sub="Per your tariff rate" accent={isSaving} />
          <Stat label="Trees equivalent" value={env.treesEquiv}              sub="FAO: 24 kg CO₂/tree/year" accent={isSaving} />
          <Stat label="BEE benchmark"    value={`${BEE_BENCHMARK_KWH_M2} kWh/m²/yr`} sub={`For ${ROOM_AREA} m² room`} />
        </div>
      </div>

      <div>
        <div className="dash-section-title">Graphs</div>
        <EnvironmentalChart
          key={`${selectedId}-${refreshKey}`}
          weeklyData={env.weeklyData}
          weeklyBaselineKwh={env.weeklyBaselineKwh}
        />
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
          Benchmark: {BEE_BENCHMARK_KWH_M2} kWh/m²/year for an assumed {ROOM_AREA} m² room, pro-rated to the days your readings cover. Tariff comes from your account settings.
        </div>
      </div>
    </div>
  );
}