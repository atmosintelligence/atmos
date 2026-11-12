'use client';

import { useAnalysis, analysisGate } from '../../useAnalysis';
import { fmtDate, latest, rupees, sum } from '../tableUtils';
import PageHeader      from '@/components/dashboard/PageHeader';
import Stat            from '@/components/dashboard/Stat';
import TableWrapper    from '@/components/dashboard/TableWrapper';
import Recommendations from '@/components/dashboard/Recommendations';
import TimeSeries      from '@/components/dashboard/charts/TimeSeries';
import { C }           from '@/components/dashboard/charts/ChartConfig';

export default function TemperaturePage() {
  const { data, status } = useAnalysis('temperature');
  const gate = analysisGate(status, data);
  if (gate) return gate;

  const { t1Events, t2Events, t3Events, optimizations, weatherError, readings, loads } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      <PageHeader title="Temperature" sub="Cooling that runs in an empty room, a chance to open a window, and humidity that is too high or too low." />

      {weatherError && weatherError !== 'No location set' && (
        <div className="dash-empty dash-error" role="status" style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>
          Outdoor weather is unavailable right now, so window-opening tips may be missing.
        </div>
      )}

      <section aria-label="Summary">
        <div className="dash-grid">
          <Stat icon="ac"          tone="#3b82f6" label="AC on, room empty" value={t1Events.length} sub="Readings in daytime and evening" />
          <Stat icon="coin"        tone="#16a34a" label="Estimated waste" value={rupees(sum(t1Events, 'waste'))} sub={`Assumes about ${Math.round(loads.ac)} W for the AC`} />
          <Stat icon="thermometer" tone="#0ea5e9" label="Window chances" value={t2Events.length} sub="Cooler and dry outside" />
          <Stat icon="droplet"     tone="#8b5cf6" label="Humidity alerts" value={t3Events.length} sub="Outside 28–72%" />
        </div>
      </section>

      <section aria-label="Graphs" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <TimeSeries
          title="Temperature"
          subtitle="The green band is the comfortable 22–30°C range. A room held at AC temperature while empty is a sign the AC is running."
          summary="Line chart of room temperature over time."
          readings={readings} field="temp" name="Temperature" color={C.temp} unit="°C" band={[22, 30]}
          domain={[(min) => Math.floor(Math.min(min, 20)), (max) => Math.ceil(Math.max(max, 32))]}
        />
        <TimeSeries
          title="Humidity"
          subtitle="The green band is the comfortable 28–72% range. Outside it, rooms feel worse and cooling works harder."
          summary="Line chart of room humidity over time."
          readings={readings} field="hum" name="Humidity" color={C.humid} unit="%" band={[28, 72]} domain={[0, 100]}
        />
      </section>

      {t1Events.length > 0 && (
        <section aria-labelledby="ac-title">
          <div className="dash-section-title" id="ac-title">Latest AC-in-empty-room events</div>
          <TableWrapper headers={['When', 'Room empty for', 'Room temperature', 'Estimated waste']} caption="AC running in an empty room">
            {latest(t1Events).map((e, i) => (
              <tr key={i}>
                <td>{fmtDate(e.timestamp)}</td>
                <td>{e.vacantMins} min</td>
                <td>{e.temp != null ? `${e.temp.toFixed(1)}°C` : '—'}</td>
                <td>{rupees(e.windowWaste)}</td>
              </tr>
            ))}
          </TableWrapper>
        </section>
      )}

      <Recommendations items={optimizations} empty="No temperature or humidity recommendations right now." />
    </div>
  );
}
