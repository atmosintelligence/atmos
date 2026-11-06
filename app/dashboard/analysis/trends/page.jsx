'use client';

import { useAnalysis, analysisGate } from '../../useAnalysis';
import { getColStats, scaleColor, tdBase } from '../tableUtils';
import Stat        from '@/components/dashboard/Stat';
import TableWrapper from '@/components/dashboard/TableWrapper';
import OptCard      from '@/components/dashboard/OptCard';
import TrendsChart  from '@/components/dashboard/charts/TrendsChart';

export default function TrendsPage() {
  const { data, status, selectedId, refreshKey } = useAnalysis('trends');
  const gate = analysisGate(status, data);
  if (gate) return gate;

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
            {optimizations.map((opt, i) => <OptCard key={i} opt={opt} />)}
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