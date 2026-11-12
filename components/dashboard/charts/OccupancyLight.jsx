'use client';

import { useMemo, useState } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { C, CHART_H, CHART_MARGIN, axisProps, useChartTheme } from './ChartConfig';
import ChartTooltip from './ChartTooltip';
import ChartCard, { RANGES } from './ChartCard';
import { bucketReadings, tickFormat, fullTime } from './series';

// Light level next to whether the room was occupied. Light that stays on while the shaded
// "occupied" area is empty is the lighting waste the rules look for.
export default function OccupancyLight({ readings }) {
  const theme = useChartTheme();
  const [range, setRange] = useState('24h');
  const data = useMemo(() => bucketReadings(readings, range).map(d => ({ ...d, occupiedLevel: d.occupied })), [readings, range]);
  if (!data.length) return null;

  return (
    <ChartCard
      title="Light and occupancy"
      subtitle="The amber line is the light level in the room. The grey area shows when someone was there. Light with no one in the room is waste."
      summary="Chart of room light level over time with periods of occupancy shaded."
      range={range} onRange={setRange} ranges={RANGES}
      legend={[{ label: 'Light (lux)', color: C.light }, { label: 'Room occupied', color: C.muted }]}
    >
      <ResponsiveContainer width="100%" height={CHART_H}>
        <ComposedChart data={data} margin={CHART_MARGIN}>
          <CartesianGrid stroke={theme.grid} vertical={false} />
          <XAxis dataKey="t" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={tickFormat(range)} {...axisProps(theme)} minTickGap={36} />
          <YAxis yAxisId="lux" {...axisProps(theme)} unit=" lx" width={58} />
          <YAxis yAxisId="occ" hide domain={[0, 1]} />
          <Tooltip
            content={<ChartTooltip fmt={(v, n) => (n === 'Light' ? `${v} lux` : v ? 'Occupied' : 'Empty')} labelFmt={fullTime} />}
            cursor={{ stroke: theme.cursor }}
          />
          <ReferenceLine yAxisId="lux" y={400} stroke={C.light} strokeDasharray="5 4" strokeWidth={1.25}
            label={{ value: '400 lux: enough to work by', fill: C.light, fontSize: 11, position: 'insideTopRight' }} />
          <Area yAxisId="occ" type="stepAfter" dataKey="occupiedLevel" name="Room" stroke="none" fill={C.muted} fillOpacity={0.22} connectNulls />
          <Line yAxisId="lux" type="monotone" dataKey="lux" name="Light" stroke={C.light} strokeWidth={2} dot={false} connectNulls activeDot={{ r: 4, fill: C.light, stroke: 'none' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
