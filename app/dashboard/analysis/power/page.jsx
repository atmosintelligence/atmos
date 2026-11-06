'use client';

import { useAnalysis, analysisGate } from '../../useAnalysis';
import { getColStats, scaleColor, fmtDate, tdBase } from '../tableUtils';
import Stat        from '@/components/dashboard/Stat';
import TableWrapper from '@/components/dashboard/TableWrapper';
import OptCard      from '@/components/dashboard/OptCard';
import PowerChart   from '@/components/dashboard/charts/PowerChart';

export default function PowerPage() {
  const { data, status, selectedId, refreshKey } = useAnalysis('power');
  const gate = analysisGate(status, data);
  if (gate) return gate;

  const { p1Events, p2Events, p3Events, avgPower, maxPower, totalEnergy, firstReading, lastReading, optimizations, readings } = data;
  const span = firstReading && lastReading
    ? `${new Date(firstReading).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} to ${new Date(lastReading).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
    : null;
  const totalP2Cost = p2Events.reduce((a, e) => a + parseFloat(e.intervalCost), 0);

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
            {optimizations.map((opt, i) => <OptCard key={i} opt={opt} />)}
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
          <Stat label="Total energy"  value={`${totalEnergy.toFixed(2)} kWh`} sub={span} />
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