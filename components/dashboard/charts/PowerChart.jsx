'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { C, CHART_H, CHART_MARGIN } from './ChartConfig';
import ChartTooltip from './ChartTooltip';
import ChartWrapper from './ChartWrapper';

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function fmtDay(ts) {
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function PowerChart({ readings, avgPower }) {
  const grid = C.gridDark;
  const tick = C.tickDark;
  const axis = C.axisDark;

  const axisProps = {
    tick:     { fill: tick, fontSize: 10 },
    axisLine: { stroke: axis, strokeWidth: 0.4 },
    tickLine: false,
  };

  const powerTimeline = useMemo(() => {
    if (!readings?.length) return [];
    return [...readings]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-72)
      .map(r => ({
        time:  fmtTime(r.timestamp),
        power: Math.round(parseFloat(r.power ?? r.power_w ?? 0)),
      }));
  }, [readings]);

  const voltageTimeline = useMemo(() => {
    if (!readings?.length) return [];
    return [...readings]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-72)
      .map(r => ({
        time:    fmtTime(r.timestamp),
        voltage: parseFloat((r.voltage ?? r.voltage_v ?? 0)),
      }))
      .filter(r => r.voltage > 0);
  }, [readings]);

  const energyByDay = useMemo(() => {
    if (!readings?.length) return [];
    const map = {};
    for (const r of readings) {
      const day = fmtDay(r.timestamp);
      if (!map[day]) map[day] = { day, kwh: 0 };
      map[day].kwh += parseFloat(r.energy ?? 0);
    }
    return Object.values(map).map(d => ({ ...d, kwh: parseFloat(d.kwh.toFixed(3)) }));
  }, [readings]);

  const interval = Math.floor(powerTimeline.length / 6);

  if (!powerTimeline.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      <ChartWrapper
        title="Power consumption over time"
        subtitle="Live power draw across last 72 readings. The dashed green line is your historical average. Spikes significantly above it trigger anomaly alerts."
      >
        <ResponsiveContainer width="100%" height={CHART_H}>
          <AreaChart data={powerTimeline} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="pwrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.red} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.red} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="time" {...axisProps} interval={interval} />
            <YAxis {...axisProps} unit=" W" width={54} />
            <Tooltip
              content={<ChartTooltip fmt={v => `${v} W`} />}
              cursor={{ stroke: 'rgba(255,255,255,0.07)', strokeWidth: 1 }}
            />
            {avgPower > 0 && (
              <ReferenceLine
                y={Math.round(avgPower)}
                stroke={C.brand}
                strokeDasharray="5 3"
                strokeWidth={1.2}
                label={{ value: `Avg ${Math.round(avgPower)} W`, fill: C.brand, fontSize: 9, position: 'insideTopRight' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="power"
              name="Power"
              stroke={C.red}
              strokeWidth={1.5}
              fill="url(#pwrGrad)"
              dot={false}
              activeDot={{ r: 3, fill: C.red, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {energyByDay.length > 0 && (
        <ChartWrapper
          title="Energy consumed per day (kWh)"
          subtitle="Daily cumulative energy totals from device readings. Higher bars on specific days highlight unusual consumption."
        >
          <ResponsiveContainer width="100%" height={CHART_H}>
            <BarChart data={energyByDay} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey="day" {...axisProps} />
              <YAxis {...axisProps} unit=" kWh" width={60} />
              <Tooltip
                content={<ChartTooltip fmt={v => `${v} kWh`} />}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="kwh" name="Energy" fill={C.brand} radius={[3, 3, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}

      {voltageTimeline.length > 0 && (
        <ChartWrapper
          title="Voltage stability"
          subtitle="Safe Indian range is 210–245 V. Red dashed lines mark the boundaries. Irregularities degrade appliance lifespan and efficiency."
        >
          <ResponsiveContainer width="100%" height={CHART_H}>
            <AreaChart data={voltageTimeline} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="voltGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.yellow} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={C.yellow} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey="time" {...axisProps} interval={Math.floor(voltageTimeline.length / 6)} />
              <YAxis {...axisProps} domain={[195, 255]} unit=" V" width={54} />
              <Tooltip
                content={<ChartTooltip fmt={v => `${v} V`} />}
                cursor={{ stroke: 'rgba(255,255,255,0.07)', strokeWidth: 1 }}
              />
              <ReferenceLine y={210} stroke={C.red} strokeDasharray="4 3" strokeWidth={1}
                label={{ value: '210 V min', fill: C.red, fontSize: 8, position: 'insideBottomRight' }}
              />
              <ReferenceLine y={245} stroke={C.red} strokeDasharray="4 3" strokeWidth={1}
                label={{ value: '245 V max', fill: C.red, fontSize: 8, position: 'insideTopRight' }}
              />
              <ReferenceLine y={220} stroke="rgba(128,128,128,0.25)" strokeDasharray="6 4" strokeWidth={0.8}
                label={{ value: '220 V nominal', fill: '#737373', fontSize: 8, position: 'insideTopLeft' }}
              />
              <Area
                type="monotone"
                dataKey="voltage"
                name="Voltage"
                stroke={C.yellow}
                strokeWidth={1.5}
                fill="url(#voltGrad)"
                dot={false}
                activeDot={{ r: 3, fill: C.yellow, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}

    </div>
  );
}