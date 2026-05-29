'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function GraphCard({
  title,
  description,
  children,
  data,
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] backdrop-blur-xl p-7">
      <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="relative">
        <div className="text-[0.78rem] uppercase tracking-[0.18em] text-brand font-semibold mb-3">
          Analytics
        </div>

        <h3 className="font-heading text-xl font-semibold tracking-tight mb-2">
          {title}
        </h3>

        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8 max-w-xl">
          {description}
        </p>

        <div className="w-full h-[24rem] min-h-[24rem] min-w-0">
          {children ? (
            children
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(120,120,120,0.12)"
                />

                <XAxis
                  dataKey="year"
                  tick={{
                    fill: '#737373',
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fill: '#737373',
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v.toLocaleString()} t`}
                />

                <Tooltip
                  cursor={{ fill: 'rgba(52,211,105,0.06)' }}
                  contentStyle={{
                    background: '#0a0a0a',
                    border: '1px solid rgba(52,211,105,0.18)',
                    borderRadius: '1rem',
                    fontSize: '0.78rem',
                  }}
                  formatter={(value) => [
                    `${value.toLocaleString()} tonnes/year`,
                    'CO₂ avoided',
                  ]}
                  labelStyle={{
                    color: '#a3a3a3',
                  }}
                />

                <Bar
                  dataKey="value"
                  radius={[10, 10, 10, 10]}
                  fill="rgba(52,211,105,0.82)"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}