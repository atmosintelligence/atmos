'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';
import { C, CHART_H, CHART_MARGIN } from './ChartConfig';
import ChartTooltip from './ChartTooltip';
import ChartWrapper from './ChartWrapper';

export default function EnvironmentalChart({ weeklyData, baselineKwh }) {
  const grid = C.gridDark;
  const tick = C.tickDark;
  const axis = C.axisDark;

  const axisProps = {
    tick:     { fill: tick, fontSize: 10 },
    axisLine: { stroke: axis, strokeWidth: 0.4 },
    tickLine: false,
  };

  const perWeekBaseline = parseFloat(baselineKwh) / 4;

  const chartData = useMemo(() => {
    if (!weeklyData?.length) return [];
    return weeklyData.map(w => ({
      week:     w.week.split('–')[0].trim(),
      consumed: parseFloat(w.kwh),
      saved:    parseFloat(w.saved),
      co2:      parseFloat(w.co2),
      money:    parseFloat(w.money),
      baseline: parseFloat(perWeekBaseline.toFixed(3)),
    }));
  }, [weeklyData, perWeekBaseline]);

  if (!chartData.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      <ChartWrapper
        title="Consumed vs BEE benchmark (kWh)"
        subtitle="Your actual weekly consumption against the Bureau of Energy Efficiency benchmark. Bars shorter than the dashed line mean you saved energy that week."
      >
        <ResponsiveContainer width="100%" height={CHART_H}>
          <BarChart data={chartData} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="week" {...axisProps} />
            <YAxis {...axisProps} unit=" kWh" width={60} />
            <Tooltip
              content={<ChartTooltip fmt={(v, n) => n === 'Consumed' || n === 'Saved' ? `${v} kWh` : v} />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <ReferenceLine
              y={perWeekBaseline}
              stroke={C.red}
              strokeDasharray="5 3"
              strokeWidth={1.2}
              label={{ value: `BEE ${perWeekBaseline.toFixed(2)} kWh`, fill: C.red, fontSize: 9, position: 'insideTopRight' }}
            />
            <Bar dataKey="consumed" name="Consumed" fill={C.blue}  radius={[3, 3, 0, 0]} fillOpacity={0.8} />
            <Bar dataKey="saved"    name="Saved"    fill={C.brand} radius={[3, 3, 0, 0]} fillOpacity={0.8} />
            <Legend
              wrapperStyle={{ fontSize: '0.7rem', paddingTop: '0.625rem' }}
              formatter={v => <span style={{ color: tick }}>{v}</span>}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <ChartWrapper
        title="CO₂ prevented per week (kg)"
        subtitle="Carbon emissions avoided by consuming below the BEE benchmark. Calculated at 0.727 kg CO₂ per kWh saved."
      >
        <ResponsiveContainer width="100%" height={CHART_H}>
          <AreaChart data={chartData} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.brand} stopOpacity={0.25} />
                <stop offset="95%" stopColor={C.brand} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="week" {...axisProps} />
            <YAxis {...axisProps} unit=" kg" width={50} />
            <Tooltip
              content={<ChartTooltip fmt={v => `${v} kg CO₂`} />}
              cursor={{ stroke: 'rgba(255,255,255,0.07)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="co2"
              name="CO₂ prevented"
              stroke={C.brand}
              strokeWidth={2}
              fill="url(#co2Grad)"
              dot={{ fill: C.brand, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: C.brand, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <ChartWrapper
        title="Money saved per week (₹)"
        subtitle="Rupee value of energy saved against the benchmark, at your configured tariff rate."
      >
        <ResponsiveContainer width="100%" height={CHART_H}>
          <AreaChart data={chartData} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="moneyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.yellow} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.yellow} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="week" {...axisProps} />
            <YAxis {...axisProps} unit=" ₹" width={50} />
            <Tooltip
              content={<ChartTooltip fmt={v => `₹${v}`} />}
              cursor={{ stroke: 'rgba(255,255,255,0.07)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="money"
              name="Money saved"
              stroke={C.yellow}
              strokeWidth={2}
              fill="url(#moneyGrad)"
              dot={{ fill: C.yellow, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: C.yellow, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

    </div>
  );
}