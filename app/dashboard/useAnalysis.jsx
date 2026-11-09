'use client';

import { useEffect, useState } from 'react';
import { useDevice } from './DeviceContext';
import { fetchEngine } from '@/lib/engineFetch';
import { SECTIONS } from './sections';

export function useAnalysis(section) {
  const { selectedId, refreshKey, getCached, setCached, isDemo, getDemoReadings } = useDevice();
  const [data, setData]     = useState(null);
  const [status, setStatus] = useState('loading');

  const demoReadings = isDemo ? getDemoReadings(selectedId) : null;

  useEffect(() => {
    if (!selectedId) return;
    if (isDemo && !demoReadings?.length) return;

    let cancelled  = false;
    const cacheKey = `${section}-${selectedId}`;
    const cached   = getCached(cacheKey);

    if (cached) {
      setData(structuredClone(cached));
      setStatus('ready');
    } else {
      setStatus('loading');
    }

    fetchEngine({ isDemo, readings: demoReadings, deviceId: selectedId })
      .then(json => {
        if (cancelled) return;
        if (!json.analysis) { setStatus('no-data'); return; }
        const next = SECTIONS[section](json);
        setData(next);
        setCached(cacheKey, next);
        setStatus('ready');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });

    return () => { cancelled = true; };
  }, [selectedId, refreshKey, isDemo, demoReadings]);

  return { data, status, selectedId, refreshKey };
}

// Returns the loading / error / empty message to show, or null when the page should render.
export function analysisGate(status, data) {
  if (status === 'loading') return <div className="dash-empty" style={{ border: 'none' }}>Loading...</div>;
  if (status === 'error')   return <div className="dash-empty" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>Failed to load data.</div>;
  if (status === 'no-data' || !data) return <div className="dash-empty">No data available for this device.</div>;
  return null;
}
