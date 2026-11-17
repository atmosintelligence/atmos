'use client';

import dynamic from 'next/dynamic';
import { CHART_H } from './ChartConfig';

// The chart library is big, so charts load after the rest of the page. The placeholder
// keeps the card's height, so nothing jumps when the chart arrives.
function ChartSkeleton() {
  return <div className="dash-card chart-card" aria-busy="true" style={{ minHeight: CHART_H + 96 }} />;
}

const lazy = (loader) => dynamic(loader, { ssr: false, loading: ChartSkeleton });

export const BarSeries = lazy(() => import('./BarSeries'));
export const TimeSeries = lazy(() => import('./TimeSeries'));
export const OccupancyLight = lazy(() => import('./OccupancyLight'));
