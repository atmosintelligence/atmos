'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { C, CHART_H, CHART_MARGIN } from './ChartConfig';
import ChartTooltip from './ChartTooltip';
import ChartWrapper from './ChartWrapper';

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function TemperatureChart({ readings }) {
  const grid = C.gridDark;
  const tick = C.tickDark;
  const axis = C.axisDark;

  const axisProps = {
    tick:     { fill: tick, fontSize: 10 },
    axisLine: { stroke: axis, strokeWidth: 0.4 },
    tickLine: false,
  };

  const chartData = useMemo(() => {
    if (!readings?.length) return [];
    return [...readings]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-72)
      .map(r => ({
        time:        fmtTime(r.timestamp),
        temperature: parseFloat(parseFloat(r.temperature ?? r.temp_c ?? 0).toFixed(1)),
        humidity:    Math.round(parseFloat(r.humidity ?? r.humidity_pct ?? 0)),
      }));
  }, [readings]);

  if (!chartData.length) return null;

  const temps    = chartData.map(d => d.temperature).filter(Boolean);
  const tempMin  = Math.min(...temps, 18) - 1;
  const tempMax  = Math.max(...temps, 35) + 1;
  const interval = Math.floor(chartData.length / 6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      <ChartWrapper
        title="Temperature over time"
        subtitle="Green shaded band marks the 22–30°C comfort zone. Readings outside this band with no occupancy trigger HVAC waste alerts."
      >
        <ResponsiveContainer width="100%" height={CHART_H}>
          <AreaChart data={chartData} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.blue} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.blue} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="time" {...axisProps} interval={interval} />
            <YAxis {...axisProps} domain={[tempMin, tempMax]} unit="°C" width={50} />
            <Tooltip
              content={<ChartTooltip fmt={v => `${v}°C`} />}
              cursor={{ stroke: 'rgba(255,255,255,0.07)', strokeWidth: 1 }}
            />
            <ReferenceArea y1={22} y2={30} fill="rgba(74,222,128,0.07)" stroke="none" />
            <ReferenceLine y={22} stroke={C.brand} strokeDasharray="4 3" strokeWidth={0.8}
              label={{ value: '22°C', fill: C.brand, fontSize: 8, position: 'insideBottomRight' }}
            />
            <ReferenceLine y={30} stroke={C.brand} strokeDasharray="4 3" strokeWidth={0.8}
              label={{ value: '30°C', fill: C.brand, fontSize: 8, position: 'insideTopRight' }}
            />
            <Area
              type="monotone"
              dataKey="temperature"
              name="Temperature"
              stroke={C.blue}
              strokeWidth={1.5}
              fill="url(#tempGrad)"
              dot={false}
              activeDot={{ r: 3, fill: C.blue, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <ChartWrapper
        title="Humidity over time"
        subtitle="Green shaded band marks the 30–70% comfortable range. Outside this range increases discomfort and raises energy load."
      >
        <ResponsiveContainer width="100%" height={CHART_H}>
          <AreaChart data={chartData} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.purple} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.purple} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="time" {...axisProps} interval={interval} />
            <YAxis {...axisProps} domain={[0, 100]} unit="%" width={44} />
            <Tooltip
              content={<ChartTooltip fmt={v => `${v}%`} />}
              cursor={{ stroke: 'rgba(255,255,255,0.07)', strokeWidth: 1 }}
            />
            <ReferenceArea y1={30} y2={70} fill="rgba(74,222,128,0.07)" stroke="none" />
            <ReferenceLine y={30} stroke={C.brand} strokeDasharray="4 3" strokeWidth={0.8}
              label={{ value: '30%', fill: C.brand, fontSize: 8, position: 'insideBottomRight' }}
            />
            <ReferenceLine y={70} stroke={C.brand} strokeDasharray="4 3" strokeWidth={0.8}
              label={{ value: '70%', fill: C.brand, fontSize: 8, position: 'insideTopRight' }}
            />
            <Area
              type="monotone"
              dataKey="humidity"
              name="Humidity"
              stroke={C.purple}
              strokeWidth={1.5}
              fill="url(#humGrad)"
              dot={false}
              activeDot={{ r: 3, fill: C.purple, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

    </div>
  );
}