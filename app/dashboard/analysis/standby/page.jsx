'use client';

import { useAnalysis, analysisGate } from '../../useAnalysis';
import { byDay, fmtDate, latest, rupees, sum } from '../tableUtils';
import PageHeader      from '@/components/dashboard/PageHeader';
import Stat            from '@/components/dashboard/Stat';
import TableWrapper    from '@/components/dashboard/TableWrapper';
import Recommendations from '@/components/dashboard/Recommendations';
import BarSeries       from '@/components/dashboard/charts/BarSeries';
import { C }           from '@/components/dashboard/charts/ChartConfig';

export default function StandbyPage() {
  const { data, status } = useAnalysis('standby');
  const gate = analysisGate(status, data);
  if (gate) return gate;

  const { s1Events, daily, optimizations, loads } = data;
  const emptyHours = daily.reduce((t, d) => t + d.emptyH, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      <PageHeader title="Standby" sub="Chargers, monitors and other devices that keep drawing power while the room sits empty through the day." />

      <section aria-label="Summary">
        <div className="dash-grid">
          <Stat icon="plug"  tone="#ec4899" label="Idle stretches" value={s1Events.length} sub="Readings, empty 4+ hours in daytime" />
          <Stat icon="coin"  tone="#16a34a" label="Estimated waste" value={rupees(sum(s1Events, 'intervalCost'))} sub={`Assumes about ${Math.round(loads.standby)} W of standby`} />
          <Stat icon="clock" tone="#64748b" label="Empty this week" value={`${emptyHours.toFixed(0)} h`} sub="Hours the room had no one in it" />
        </div>
      </section>

      <section aria-label="Graphs" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <BarSeries
          title="Occupied and empty hours"
          subtitle="Each bar is one day. The longer the empty part, the more time standby devices spend drawing power for nothing."
          summary="Stacked bar chart of hours the room was occupied or empty, for each of the last seven days."
          data={daily} xKey="date" unit=" h"
          bars={[
            { key: 'occupiedH', name: 'Occupied', color: C.brand, stack: 'a' },
            { key: 'emptyH',    name: 'Empty',    color: C.muted, stack: 'a' },
          ]}
        />
        {s1Events.length > 0 && (
          <BarSeries
            title="Estimated standby waste by day"
            subtitle="What idle devices cost on days the room stayed empty for hours."
            summary="Bar chart of estimated rupees lost to standby power each day."
            data={byDay(s1Events, 'intervalCost', 'cost')} xKey="day" unit=" ₹" decimals={2}
            bars={[{ key: 'cost', name: 'Waste (₹)', color: C.standby }]}
          />
        )}
      </section>

      {s1Events.length > 0 && (
        <section aria-labelledby="idle-title">
          <div className="dash-section-title" id="idle-title">Latest idle stretches</div>
          <TableWrapper headers={['When', 'Room empty for', 'Estimated waste so far']} caption="Idle devices in an empty room">
            {latest(s1Events).map((e, i) => (
              <tr key={i}>
                <td>{fmtDate(e.timestamp)}</td>
                <td>{e.emptyHours} h</td>
                <td>{rupees(e.cost)}</td>
              </tr>
            ))}
          </TableWrapper>
        </section>
      )}

      <Recommendations items={optimizations} empty="No standby recommendations right now." />
    </div>
  );
}
