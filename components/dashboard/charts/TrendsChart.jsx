'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import { C, CHART_H, CHART_H_SM, CHART_MARGIN } from './ChartConfig';
import ChartTooltip from './ChartTooltip';
import ChartWrapper from './ChartWrapper';

export default function TrendsChart({ dailyBreakdown, avgPowerThisWeek, avgPowerLastWeek }) {
  const grid = C.gridDark;
  const tick = C.tickDark;
  const axis = C.axisDark;

  const axisProps = {
    tick:     { fill: tick, fontSize: 10 },
    axisLine: { stroke: axis, strokeWidth: 0.4 },
    tickLine: false,
  };

  const avgLast = avgPowerLastWeek ?? 0;
  const avgThis = avgPowerThisWeek ?? 0;

  if (!dailyBreakdown?.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      <ChartWrapper
        title="Average power by day"
        subtitle={`Bars coloured red are above last week's average (${Math.round(avgLast)} W). Green bars are at or below it.`}
      >
        <ResponsiveContainer width="100%" height={CHART_H}>
          <BarChart data={dailyBreakdown} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="date" {...axisProps} />
            <YAxis {...axisProps} unit=" W" width={54} />
            <Tooltip
              content={<ChartTooltip fmt={v => `${v} W`} />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <ReferenceLine
              y={avgLast}
              stroke={C.blue}
              strokeDasharray="5 3"
              strokeWidth={1.2}
              label={{ value: `Last wk ${Math.round(avgLast)} W`, fill: C.blue, fontSize: 9, position: 'insideTopLeft' }}
            />
            <ReferenceLine
              y={avgThis}
              stroke={C.brand}
              strokeDasharray="5 3"
              strokeWidth={1.2}
              label={{ value: `This wk ${Math.round(avgThis)} W`, fill: C.brand, fontSize: 9, position: 'insideBottomRight' }}
            />
            <Bar dataKey="avgPower" name="Avg power" radius={[3, 3, 0, 0]}>
              {dailyBreakdown.map((entry, i) => (
                <Cell
                  key={i}
                  fill={parseFloat(entry.avgPower) > avgLast ? C.red : C.brand}
                  fillOpacity={0.82}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <ChartWrapper
        title="Energy consumed per day (kWh)"
        subtitle="Daily energy totals for the last 7 days. Useful for identifying which days drove the week's consumption."
      >
        <ResponsiveContainer width="100%" height={CHART_H}>
          <AreaChart data={dailyBreakdown} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="trendKwhGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.purple} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.purple} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="date" {...axisProps} />
            <YAxis {...axisProps} unit=" kWh" width={60} />
            <Tooltip
              content={<ChartTooltip fmt={v => `${v} kWh`} />}
              cursor={{ stroke: 'rgba(255,255,255,0.07)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="kwh"
              name="Energy"
              stroke={C.purple}
              strokeWidth={2}
              fill="url(#trendKwhGrad)"
              dot={{ fill: C.purple, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: C.purple, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <ChartWrapper
        title="Readings captured per day"
        subtitle="Low counts may indicate connectivity issues or device downtime. Gaps in readings reduce analysis accuracy."
      >
        <ResponsiveContainer width="100%" height={CHART_H_SM}>
          <BarChart data={dailyBreakdown} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="date" {...axisProps} />
            <YAxis {...axisProps} allowDecimals={false} width={36} />
            <Tooltip
              content={<ChartTooltip fmt={v => `${v} readings`} />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="readings" name="Readings" fill={C.blue} radius={[3, 3, 0, 0]} fillOpacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

    </div>
  );
}