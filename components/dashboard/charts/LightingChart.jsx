'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { C, CHART_H, CHART_MARGIN } from './ChartConfig';
import ChartTooltip  from './ChartTooltip';
import ChartWrapper  from './ChartWrapper';

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function fmtDay(ts) {
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function LightingChart({ readings, idleBaseline, l1Events, l2Events }) {
  const grid = C.gridDark;
  const tick = C.tickDark;
  const axis = C.axisDark;

  const axisProps = {
    tick:     { fill: tick, fontSize: 10 },
    axisLine: { stroke: axis, strokeWidth: 0.4 },
    tickLine: false,
  };

  const powerData = useMemo(() => {
    if (!readings?.length) return [];
    return [...readings]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-60)
      .map(r => ({
        time:  fmtTime(r.timestamp),
        power: Math.round(parseFloat(r.power ?? r.power_w ?? 0)),
        lux:   Math.round(parseFloat(r.light ?? r.light_lux ?? 0)),
      }));
  }, [readings]);

  const l1ByDay = useMemo(() => {
    if (!l1Events?.length) return [];
    const map = {};
    for (const e of l1Events) {
      const day = fmtDay(e.timestamp);
      if (!map[day]) map[day] = { day, waste: 0, events: 0 };
      map[day].waste  += parseFloat(e.waste || 0);
      map[day].events += 1;
    }
    return Object.values(map).map(d => ({ ...d, waste: parseFloat(d.waste.toFixed(2)) }));
  }, [l1Events]);

  const l2Data = useMemo(() => {
    if (!l2Events?.length) return [];
    return l2Events.map(e => ({
      time:   fmtTime(e.timestamp),
      lux:    parseFloat(e.lux),
      power:  parseFloat(e.power),
      saving: parseFloat(e.saving),
    }));
  }, [l2Events]);

  if (!powerData.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      <ChartWrapper
        title="Power draw over time"
        subtitle="Last 60 readings. Dashed line marks the idle baseline. Sustained power above it with an empty room triggers a recommendation."
      >
        <ResponsiveContainer width="100%" height={CHART_H}>
          <AreaChart data={powerData} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="lgPower" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.brand} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.brand} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="time" {...axisProps} interval={Math.floor(powerData.length / 6)} />
            <YAxis {...axisProps} unit=" W" width={54} />
            <Tooltip
              content={<ChartTooltip fmt={v => `${v} W`} />}
              cursor={{ stroke: 'rgba(255,255,255,0.07)', strokeWidth: 1 }}
            />
            <ReferenceLine
              y={Math.round(idleBaseline)}
              stroke={C.red}
              strokeDasharray="5 3"
              strokeWidth={1.2}
              label={{ value: `Idle ${Math.round(idleBaseline)} W`, fill: C.red, fontSize: 9, position: 'insideTopRight' }}
            />
            <Area
              type="monotone"
              dataKey="power"
              name="Power"
              stroke={C.brand}
              strokeWidth={1.5}
              fill="url(#lgPower)"
              dot={false}
              activeDot={{ r: 3, fill: C.brand, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <ChartWrapper
        title="Ambient light over time"
        subtitle="Natural and artificial light levels. Above 400 lux with artificial lights still on is a daylight harvesting opportunity."
      >
        <ResponsiveContainer width="100%" height={CHART_H}>
          <AreaChart data={powerData} margin={CHART_MARGIN}>
            <defs>
              <linearGradient id="lgLux" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.yellow} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.yellow} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="time" {...axisProps} interval={Math.floor(powerData.length / 6)} />
            <YAxis {...axisProps} unit=" lux" width={60} />
            <Tooltip
              content={<ChartTooltip fmt={v => `${v} lux`} />}
              cursor={{ stroke: 'rgba(255,255,255,0.07)', strokeWidth: 1 }}
            />
            <ReferenceLine
              y={400}
              stroke={C.yellow}
              strokeDasharray="5 3"
              strokeWidth={1.2}
              label={{ value: '400 lux threshold', fill: C.yellow, fontSize: 9, position: 'insideTopRight' }}
            />
            <Area
              type="monotone"
              dataKey="lux"
              name="Light"
              stroke={C.yellow}
              strokeWidth={1.5}
              fill="url(#lgLux)"
              dot={false}
              activeDot={{ r: 3, fill: C.yellow, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {l1ByDay.length > 0 && (
        <ChartWrapper
          title="Estimated lighting waste by day (₹)"
          subtitle="Total cost of power consumed whilst the room was empty, grouped by day."
        >
          <ResponsiveContainer width="100%" height={CHART_H}>
            <BarChart data={l1ByDay} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey="day" {...axisProps} />
              <YAxis {...axisProps} unit=" ₹" width={54} />
              <Tooltip
                content={<ChartTooltip fmt={(v, n) => n === 'waste' ? `₹${v.toFixed(2)}` : `${v}`} />}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="waste"  name="Waste (₹)" fill={C.yellow} radius={[3, 3, 0, 0]} fillOpacity={0.85} />
              <Bar dataKey="events" name="Events"    fill={C.red}    radius={[3, 3, 0, 0]} fillOpacity={0.6}  />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      )}

    </div>
  );
}