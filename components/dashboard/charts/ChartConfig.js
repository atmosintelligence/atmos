'use client';

import { useEffect, useState } from 'react';

// One palette for every chart, so they read as a set. Each colour means one thing.
export const C = {
  brand:  '#22c55e',   // savings, comfortable range
  light:  '#f59e0b',   // light and lighting
  temp:   '#3b82f6',   // temperature and cooling
  humid:  '#8b5cf6',   // humidity
  waste:  '#ef4444',   // waste and problems
  standby:'#ec4899',   // standby
  muted:  '#94a3b8',
};

export const CHART_H = 230;
export const CHART_MARGIN = { top: 10, right: 16, left: -6, bottom: 0 };

const THEMES = {
  dark:  { grid: 'rgba(255,255,255,0.07)', tick: '#8a8a8a', axis: 'rgba(255,255,255,0.12)', cursor: 'rgba(255,255,255,0.18)', band: 'rgba(34,197,94,0.09)' },
  light: { grid: 'rgba(0,0,0,0.07)',       tick: '#6b6b6b', axis: 'rgba(0,0,0,0.14)',       cursor: 'rgba(0,0,0,0.22)',       band: 'rgba(34,197,94,0.1)' },
};

// Follows the dashboard's light/dark switch.
export function useChartTheme() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.classList.contains('dark'));
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return { dark, ...(dark ? THEMES.dark : THEMES.light) };
}

export const axisProps = theme => ({
  tick:     { fill: theme.tick, fontSize: 11 },
  axisLine: { stroke: theme.axis },
  tickLine: false,
});
