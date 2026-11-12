'use client';

import { useAnalysis, analysisGate } from '../../useAnalysis';
import PageHeader      from '@/components/dashboard/PageHeader';
import Stat            from '@/components/dashboard/Stat';
import TableWrapper    from '@/components/dashboard/TableWrapper';
import Recommendations from '@/components/dashboard/Recommendations';
import BarSeries       from '@/components/dashboard/charts/BarSeries';
import { C }           from '@/components/dashboard/charts/ChartConfig';

const hourLabel = h => `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`;

export default function TrendsPage() {
  const { data, status } = useAnalysis('trends');
  const gate = analysisGate(status, data);
  if (gate) return gate;

  const { trend1, trend2, dailyBreakdown, optimizations } = data;
  const change = trend1 ? Number(trend1.changePct) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      <PageHeader title="Trends" sub="Is waste going up or down, and when does it happen? Avoidable energy is what the rules flagged, so these are estimates." />

      <section aria-label="Summary">
        <div className="dash-grid">
          <Stat icon="zap"           tone="#ef4444" label="Avoidable this week" value={trend1 ? `${trend1.thisKwh} kWh` : '—'} sub={trend1 ? `Last week: ${trend1.lastKwh} kWh` : 'Needs 5 days of data in both weeks'} />
          <Stat icon="trendsAnalysis" tone={change != null && change > 0 ? '#ef4444' : '#16a34a'} label="Week on week" value={change != null ? `${change > 0 ? '+' : ''}${change}%` : '—'} sub={trend1 ? (trend1.rising ? 'More waste than last week' : trend1.falling ? 'Less waste than last week' : 'About the same') : undefined} />
          <Stat icon="clock"         tone="#8b5cf6" label="Waste peaks around" value={trend2 ? hourLabel(trend2.hour) : '—'} sub={trend2 ? `${trend2.share}% of the waste happens in that hour` : 'No clear peak yet'} />
        </div>
      </section>

      <section aria-label="Graphs" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <BarSeries
          title="Avoidable energy by day"
          subtitle="Energy the rules found being used for nothing, over the last 7 days."
          summary="Bar chart of estimated avoidable kilowatt-hours for each of the last seven days."
          data={dailyBreakdown} xKey="date" unit=" kWh" decimals={2}
          bars={[{ key: 'wasteKwh', name: 'Avoidable (kWh)', color: C.waste }]}
        />
        <BarSeries
          title="Occupied and empty hours"
          subtitle="How the room was used each day. More empty hours with the same waste means devices are being left on."
          summary="Stacked bar chart of occupied and empty hours for each of the last seven days."
          data={dailyBreakdown} xKey="date" unit=" h"
          bars={[
            { key: 'occupiedH', name: 'Occupied', color: C.brand, stack: 'a' },
            { key: 'emptyH',    name: 'Empty',    color: C.muted, stack: 'a' },
          ]}
        />
      </section>

      <section aria-labelledby="daily-title">
        <div className="dash-section-title" id="daily-title">Last 7 days</div>
        <TableWrapper headers={['Day', 'Occupied', 'Empty', 'Avoidable energy', 'Readings']} caption="Daily breakdown">
          {[...dailyBreakdown].reverse().map(d => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.occupiedH} h</td>
              <td>{d.emptyH} h</td>
              <td>{d.wasteKwh.toFixed(2)} kWh</td>
              <td>{d.readings}</td>
            </tr>
          ))}
        </TableWrapper>
      </section>

      <Recommendations items={optimizations} empty="No notable trends yet. Check back after a week or two of readings." />
    </div>
  );
}
