'use client';

import { useEffect, useState } from 'react';
import { useDevice } from './DeviceContext';
import { SECTIONS } from './sections';

// Loads one analysis section for the selected device. The engine result is shared and
// cached by DeviceContext, so switching between analysis pages is instant.
export function useAnalysis(section) {
  const { selectedId, refreshKey, loadEngine, isDemo, getDemoReadings } = useDevice();
  const [data, setData]     = useState(null);
  const [status, setStatus] = useState('loading');
  const waitingForDemo = isDemo && !getDemoReadings(selectedId)?.length;

  useEffect(() => {
    if (!selectedId || waitingForDemo) return;
    let cancelled = false;
    setStatus('loading');

    loadEngine(selectedId)
      .then(json => {
        if (cancelled) return;
        if (!json.analysis) { setStatus('no-data'); return; }
        setData(SECTIONS[section](json));
        setStatus('ready');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });

    return () => { cancelled = true; };
  }, [selectedId, refreshKey, waitingForDemo]);

  return { data, status, selectedId, refreshKey };
}

// Returns the loading / error / empty message to show, or null when the page should render.
export function analysisGate(status, data) {
  if (status === 'loading') return <div className="dash-empty" style={{ border: 'none' }}>Loading...</div>;
  if (status === 'error')   return <div className="dash-empty dash-error">Could not load the analysis. Check your connection and try again.</div>;
  if (status === 'no-data' || !data) return <div className="dash-empty">No readings yet. Once your device sends data, the analysis appears here.</div>;
  return null;
}
