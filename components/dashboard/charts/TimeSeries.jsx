'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { CHART_H, CHART_MARGIN, axisProps, useChartTheme } from './ChartConfig';
import ChartTooltip from './ChartTooltip';
import ChartCard, { RANGES } from './ChartCard';
import { bucketReadings, tickFormat, fullTime } from './series';

// A line over time for one reading (temperature, humidity, light). It has the 24 hour /
// 7 day / 30 day switch, an optional shaded "comfortable" band, and a hover card.
//   field: 'temp' | 'hum' | 'lux'     band: [low, high]     line: { y, label }
export default function TimeSeries({
  title, subtitle, summary, readings, field, name, color, unit, band, line, domain, step = false,
}) {
  const theme = useChartTheme();
  const [range, setRange] = useState('24h');
  const data = useMemo(() => bucketReadings(readings, range), [readings, range]);

  if (!data.length) return null;
  const gradient = `grad-${field}`;
  const fmt = v => `${v}${unit}`;

  return (
    <ChartCard title={title} subtitle={subtitle} summary={summary} range={range} onRange={setRange} ranges={RANGES}>
      <ResponsiveContainer width="100%" height={CHART_H}>
        <AreaChart data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.28} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={theme.grid} vertical={false} />
          <XAxis dataKey="t" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={tickFormat(range)} {...axisProps(theme)} minTickGap={36} />
          <YAxis {...axisProps(theme)} domain={domain ?? ['auto', 'auto']} unit={unit} width={unit.length > 2 ? 58 : 46} />
          <Tooltip
            content={<ChartTooltip fmt={fmt} labelFmt={fullTime} />}
            cursor={{ stroke: theme.cursor, strokeWidth: 1 }}
          />
          {band && <ReferenceArea y1={band[0]} y2={band[1]} fill={theme.band} stroke="none" />}
          {line && (
            <ReferenceLine y={line.y} stroke={color} strokeDasharray="5 4" strokeWidth={1.25}
              label={{ value: line.label, fill: color, fontSize: 11, position: 'insideTopRight' }} />
          )}
          <Area
            type={step ? 'stepAfter' : 'monotone'}
            dataKey={field}
            name={name}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradient})`}
            dot={false}
            connectNulls
            activeDot={{ r: 4, fill: color, stroke: 'none' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
