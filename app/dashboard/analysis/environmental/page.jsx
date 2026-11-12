'use client';

import Link from 'next/link';
import { useAnalysis, analysisGate } from '../../useAnalysis';
import { useDevice } from '../../DeviceContext';
import { summariseSavings, formatINR } from '@/lib/savings';
import PageHeader   from '@/components/dashboard/PageHeader';
import Stat         from '@/components/dashboard/Stat';
import TableWrapper from '@/components/dashboard/TableWrapper';
import BarSeries    from '@/components/dashboard/charts/BarSeries';
import { C }        from '@/components/dashboard/charts/ChartConfig';
import { BEE_BENCHMARK_KWH_M2 } from '@/lib/engine/constants.js';

export default function EnvironmentalPage() {
  const { data: env, status } = useAnalysis('environmental');
  const { cache, selectedId, selectedSettings } = useDevice();
  const gate = analysisGate(status, env);
  if (gate) return gate;

  const saved = summariseSavings(cache[`alerts-${selectedId}`]?.alerts, selectedSettings.tariff);
  const vsBench = Number(env.estimatedKwh) - Number(env.benchmarkKwh);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      <PageHeader title="Environmental savings" sub={`Your savings from recommendations you marked as done, and how this room's electricity compares with the BEE benchmark of ${BEE_BENCHMARK_KWH_M2} kWh per m² a year.`} />

      <section aria-label="Saved so far">
        <div className="dash-section-title">Saved so far</div>
        <div className="dash-grid">
          <Stat icon="coin" tone="#16a34a" label="Money saved"  value={formatINR(saved.inr)} sub={`${saved.count} recommendation${saved.count === 1 ? '' : 's'} done`} />
          <Stat icon="zap"  tone="#f59e0b" label="Energy saved" value={`${saved.kwh.toFixed(1)} kWh`} sub={`At ₹${selectedSettings.tariff} per kWh`} />
          <Stat icon="leaf" tone="#0d9488" label="CO₂ avoided"  value={`${saved.co2Kg.toFixed(1)} kg`} sub="0.727 kg per kWh" />
          <Stat icon="tree" tone="#65a30d" label="Trees' worth" value={saved.trees} sub="24 kg of CO₂ per tree a year" />
        </div>
      </section>

      <section aria-label="Against the benchmark">
        <div className="dash-section-title">Last {env.periodDays} days against the benchmark</div>
        <div className="dash-grid">
          <Stat icon="gauge" tone="#3b82f6" label="Estimated use" value={`${env.estimatedKwh} kWh`} sub={env.monthlyKwhKnown ? `From your ${env.monthlyKwh} kWh a month` : 'Assumed. Add your monthly usage in Devices'} />
          <Stat icon="building" tone="#64748b" label="BEE benchmark" value={`${env.benchmarkKwh} kWh`} sub={`${env.benchmarkMonthlyKwh} kWh a month for a 20 m² room`} />
          <Stat icon="trendsAnalysis" tone={vsBench > 0 ? '#ef4444' : '#16a34a'} label="Compared with benchmark" value={`${vsBench > 0 ? '+' : ''}${vsBench.toFixed(0)} kWh`} sub={vsBench > 0 ? 'Above the benchmark' : 'Below the benchmark'} />
          <Stat icon="plug" tone="#ef4444" label="Still avoidable" value={`${env.avoidableKwh} kWh`} sub="Waste the rules found, not yet fixed" />
        </div>
        {!env.monthlyKwhKnown && (
          <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.625rem', lineHeight: 1.6 }}>
            Atmos cannot measure electricity, so use is an estimate. Enter this room&apos;s monthly kWh from your bill in <Link className="link" href="/dashboard/devices">Devices</Link> for a closer figure.
          </p>
        )}
      </section>

      <section aria-label="Graphs">
        <BarSeries
          title="Estimated use and avoidable energy by week"
          subtitle="Grey is the BEE benchmark for the same days. Red is the part of your use the rules flagged as avoidable."
          summary="Bar chart per week of estimated use, benchmark and avoidable energy in kilowatt-hours."
          data={env.weeklyData.map(w => ({ week: w.week, use: Number(w.kwh), benchmark: Number(w.baseline), avoidable: Number(w.avoidable) }))}
          xKey="week" unit=" kWh" decimals={1}
          bars={[
            { key: 'use',       name: 'Estimated use', color: C.temp },
            { key: 'benchmark', name: 'BEE benchmark', color: C.muted },
            { key: 'avoidable', name: 'Avoidable',     color: C.waste },
          ]}
        />
      </section>

      <section aria-labelledby="weeks-title">
        <div className="dash-section-title" id="weeks-title">Week by week</div>
        <TableWrapper headers={['Week', 'Estimated use', 'Benchmark', 'Avoidable']} caption="Weekly breakdown">
          {env.weeklyData.map((w, i) => (
            <tr key={i}>
              <td>{w.week}</td>
              <td>{w.hasData ? `${w.kwh} kWh` : '—'}</td>
              <td>{w.hasData ? `${w.baseline} kWh` : '—'}</td>
              <td>{w.hasData ? `${w.avoidable} kWh` : '—'}</td>
            </tr>
          ))}
        </TableWrapper>
      </section>
    </div>
  );
}
