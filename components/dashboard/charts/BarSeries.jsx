'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { CHART_H, CHART_MARGIN, axisProps, useChartTheme } from './ChartConfig';
import ChartTooltip from './ChartTooltip';
import ChartCard from './ChartCard';

// Bars by day or week. `bars` is a list of { key, name, color, stack? }; bars that share a
// `stack` value are stacked. `xKey` names the label column of `data`.
export default function BarSeries({ title, subtitle, summary, data, xKey, bars, unit = '', decimals = 1, line }) {
  const theme = useChartTheme();
  if (!data?.length) return null;
  // Some engine fields are strings such as "0.93"; charts need numbers.
  const rows = data.map(r => ({ ...r, ...Object.fromEntries(bars.map(b => [b.key, Number(r[b.key]) || 0])) }));
  const fmt = v => `${Number(v).toFixed(decimals)}${unit}`;

  return (
    <ChartCard title={title} subtitle={subtitle} summary={summary} legend={bars.map(b => ({ label: b.name, color: b.color }))}>
      <ResponsiveContainer width="100%" height={CHART_H}>
        <BarChart data={rows} margin={CHART_MARGIN} barCategoryGap="22%">
          <CartesianGrid stroke={theme.grid} vertical={false} />
          <XAxis dataKey={xKey} {...axisProps(theme)} />
          <YAxis {...axisProps(theme)} unit={unit.trim().length > 2 ? '' : unit} width={46} />
          <Tooltip content={<ChartTooltip fmt={fmt} />} cursor={{ fill: theme.grid }} />
          {line && <ReferenceLine y={line.y} stroke={line.color} strokeDasharray="5 4" label={{ value: line.label, fill: line.color, fontSize: 11, position: 'insideTopRight' }} />}
          {bars.map(b => (
            <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} stackId={b.stack} radius={b.stack ? 0 : [4, 4, 0, 0]} maxBarSize={44} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
