'use client';

import { useAnalysis, analysisGate } from '../../useAnalysis';
import { byDay, fmtDate, latest, rupees, sum } from '../tableUtils';
import PageHeader      from '@/components/dashboard/PageHeader';
import Stat            from '@/components/dashboard/Stat';
import TableWrapper    from '@/components/dashboard/TableWrapper';
import Recommendations from '@/components/dashboard/Recommendations';
import OccupancyLight  from '@/components/dashboard/charts/OccupancyLight';
import BarSeries       from '@/components/dashboard/charts/BarSeries';
import { C }           from '@/components/dashboard/charts/ChartConfig';

export default function LightingPage() {
  const { data, status } = useAnalysis('lighting');
  const gate = analysisGate(status, data);
  if (gate) return gate;

  const { l1Events, l2Events, optimizations, readings, loads } = data;
  const wasteByDay = byDay(l1Events, 'waste', 'waste');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      <PageHeader title="Lighting" sub="When lights burn with nobody in the room, and when daylight is already enough." />

      <section aria-label="Summary">
        <div className="dash-grid">
          <Stat icon="user"      tone="#ef4444" label="Lights on, room empty" value={l1Events.length} sub="Readings after dark" />
          <Stat icon="coin"      tone="#16a34a" label="Estimated waste" value={rupees(sum(l1Events, 'waste'))} sub={`Assumes about ${Math.round(loads.lighting)} W of lighting`} />
          <Stat icon="sun"       tone="#f59e0b" label="Daylight chances" value={l2Events.length} sub="Bright enough to work without lights" />
          <Stat icon="lightbulb" tone="#f59e0b" label="Possible saving" value={`${rupees(sum(l2Events, 'saving'))}`} sub="If lights were off in daylight" />
        </div>
      </section>

      <section aria-label="Graphs" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <OccupancyLight readings={readings} />
        <BarSeries
          title="Estimated lighting waste by day"
          subtitle="What the lights cost while the room was empty at night. Taller bars mean more to save."
          summary="Bar chart of estimated rupees wasted on lighting each day."
          data={wasteByDay} xKey="day" unit=" ₹" decimals={2}
          bars={[{ key: 'waste', name: 'Waste (₹)', color: C.light }]}
        />
      </section>

      {l1Events.length > 0 && (
        <section aria-labelledby="events-title">
          <div className="dash-section-title" id="events-title">Latest empty-room events</div>
          <TableWrapper headers={['When', 'Room empty for', 'Light level', 'Estimated waste']} caption="Lights on in an empty room">
            {latest(l1Events).map((e, i) => (
              <tr key={i}>
                <td>{fmtDate(e.timestamp)}</td>
                <td>{e.vacantMins} min</td>
                <td>{Math.round(e.lux)} lux</td>
                <td>{rupees(e.windowWaste)}</td>
              </tr>
            ))}
          </TableWrapper>
        </section>
      )}

      <Recommendations items={optimizations} empty="No lighting recommendations right now." />
    </div>
  );
}
