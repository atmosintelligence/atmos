'use client';

import { useAnalysis, analysisGate } from '../../useAnalysis';
import { getColStats, scaleColor, fmtDate, tdBase } from '../tableUtils';
import Stat          from '@/components/dashboard/Stat';
import TableWrapper  from '@/components/dashboard/TableWrapper';
import OptCard       from '@/components/dashboard/OptCard';
import LightingChart from '@/components/dashboard/charts/LightingChart';

export default function LightingPage() {
  const { data, status, selectedId, refreshKey } = useAnalysis('lighting');
  const gate = analysisGate(status, data);
  if (gate) return gate;

  const { l1Events, l2Events, idleBaseline, idleBaselineMeasured, optimizations, readings } = data;
  const totalL1Waste = l1Events.reduce((a, e) => a + parseFloat(e.waste), 0);
  const totalL2Save  = l2Events.reduce((a, e) => a + parseFloat(e.saving), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div className="dash-greeting">
        <div className="dash-greeting-name">Lighting</div>
        <div className="dash-greeting-sub">Occupancy-based lighting waste, daylight harvesting opportunities, and idle baseline analysis.</div>
      </div>

      {optimizations.length > 0 ? (
        <div>
          <div className="dash-section-title">Recommendations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {optimizations.map((opt, i) => <OptCard key={i} opt={opt} />)}
          </div>
        </div>
      ) : (
        <div className="dash-empty">No lighting recommendations at this time.</div>
      )}

      <div>
        <div className="dash-section-title">Summary</div>
        <div className="dash-grid">
          <Stat label="Idle baseline"      value={`${idleBaseline.toFixed(0)} W`} sub={idleBaselineMeasured ? 'Night-time base load' : 'Default: no night readings yet'} />
          <Stat label="Empty room events"  value={l1Events.length}                sub="Lights on whilst vacant" />
          <Stat label="Daylight opportunities" value={l2Events.length}            sub="Artificial light redundant" />
          <Stat label="Total waste"     value={`₹${totalL1Waste.toFixed(2)}`} />
        </div>
      </div>

      <div>
        <div className="dash-section-title">Graphs</div>
        <LightingChart
          key={`${selectedId}-${refreshKey}`}
          readings={readings}
          idleBaseline={idleBaseline}
          l1Events={l1Events}
          l2Events={l2Events}
        />
      </div>

      {l1Events.length > 0 && (
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

      {l2Events.length > 0 && (
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