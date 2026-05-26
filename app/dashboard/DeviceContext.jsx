'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useDemo } from './DemoContext';
import { DEMO_DEVICE_ID } from '@/lib/demo';

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const { isDemo, demoDevices, demoReadings, demoReady } = useDemo();

  const [devices, setDevices]               = useState([]);
  const [selectedId, setSelectedIdState]    = useState(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [refreshKey, setRefreshKey]         = useState(0);
  const [cache, setCache]                   = useState({});
  const [weatherError, setWeatherError] = useState(null);
  const selectedIdRef                       = useRef(null);

  function triggerRefresh() {
    setCache({});
    setRefreshKey(k => k + 1);
  }

  function setSelectedId(id) {
    if (id === selectedIdRef.current) return;
    selectedIdRef.current = id;
    setSelectedIdState(id);
    if (id) localStorage.setItem('atmos:selectedDevice', id);
    setRefreshKey(k => k + 1);
  }

  function getCached(key) { return cache[key] ?? null; }
  function setCached(key, value) { setCache(prev => ({ ...prev, [key]: value })); }

  const [subCache, setSubCache] = useState(null);
  function getSubCache() { return subCache; }
  function setSubCacheData(data) { setSubCache(data); }

  useEffect(() => {
    if (isDemo) {
      if (!demoReady) return;
      const devs = demoDevices ?? [];
      setDevices(devs);
      if (devs.length) {
        selectedIdRef.current = DEMO_DEVICE_ID;
        setSelectedIdState(DEMO_DEVICE_ID);
      }
      setLoadingDevices(false);
      return;
    }

    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingDevices(false); return; }
      const res = await fetch('/api/devices');
      if (!res.ok) { setLoadingDevices(false); return; }
      const { devices: devs } = await res.json();
      setDevices(devs ?? []);
      if (devs?.length) {
        const saved = localStorage.getItem('atmos:selectedDevice');
        const valid = saved && devs.find(d => d.device_id === saved);
        const initial = valid ? saved : devs[0].device_id;
        selectedIdRef.current = initial;
        setSelectedIdState(initial);
      }
      setLoadingDevices(false);
    }
    load();
  }, [isDemo, demoReady]);

  useEffect(() => {
    if (!isDemo || !demoReady || !demoReadings?.length) return;
    preloadDevice(DEMO_DEVICE_ID);
  }, [isDemo, demoReady, demoReadings]);

  async function preloadDevice(deviceId) {
    const alreadyCached =
      getCached(`overview-${deviceId}`) &&
      getCached(`lighting-${deviceId}`);
    if (alreadyCached) return;

    try {
      const endpoint = isDemo ? '/api/engine/demo' : '/api/engine';
      const body     = isDemo
        ? { readings: demoReadings, location: { lat: 28.6139, lon: 77.2090 }, roomAreaM2: 20, tariff: 10 }
        : { location: { lat: 28.6139, lon: 77.2090 }, roomAreaM2: 20, deviceId };

      const res  = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) return;
      const json = await res.json();
      const raw  = json.readings ?? [];
      const hasData = raw.length > 0;

      if (json.weatherError) setWeatherError(json.weatherError);

      if (!getCached(`overview-${deviceId}`)) {
        setCached(`overview-${deviceId}`, hasData ? {
          profile: null, latest: raw.at(-1),
          optimizations: json.optimizations ?? [],
          environmental: json.environmental ?? null,
          noData: false,
        } : { profile: null, latest: null, optimizations: [], environmental: null, noData: true });
      }
      if (!getCached(`history-${deviceId}`) && hasData) {
        setCached(`history-${deviceId}`, { rows: [...raw].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) });
      }
      if (json.analysis && hasData) {
        if (!getCached(`lighting-${deviceId}`))      setCached(`lighting-${deviceId}`,      { ...json.analysis.lighting,  optimizations: json.optimizations.filter(o => o.group === 'Lighting') });
        if (!getCached(`temperature-${deviceId}`))   setCached(`temperature-${deviceId}`,   { ...json.analysis.hvac,      optimizations: json.optimizations.filter(o => o.group === 'HVAC' || o.group === 'Humidity'), weatherError: json.weatherError, readings: raw });
        if (!getCached(`power-${deviceId}`))         setCached(`power-${deviceId}`,         { ...json.analysis.power,     optimizations: json.optimizations.filter(o => o.group === 'Power') });
        if (!getCached(`trends-${deviceId}`))        setCached(`trends-${deviceId}`,        { ...json.analysis.trends,    optimizations: json.optimizations.filter(o => o.group === 'Trends') });
        if (!getCached(`environmental-${deviceId}`)) setCached(`environmental-${deviceId}`, json.analysis.environmental);
      }

      await preloadAlerts(deviceId);
    } catch (_) {}
  }

  async function preloadAlerts(deviceId) {
    if (getCached(`alerts-${deviceId}`)) return;
    try {
      if (isDemo) {
        const res = await fetch('/api/engine/demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            readings: demoReadings,
            location: { lat: 28.6139, lon: 77.2090 },
            roomAreaM2: 20,
            tariff: 10,
          }),
        });
        if (!res.ok) return;
        const json = await res.json();
        const demoAlerts = (json.optimizations ?? []).map((opt, i) => ({
          id: `demo-${i}`,
          device_id: deviceId,
          group_name: opt.group,
          severity: opt.severity,
          title: opt.title,
          message: opt.message,
          saving_inr: opt.saving?.inr ? parseFloat(opt.saving.inr) : null,
          acknowledged: false,
          created_at: opt.timestamp ?? new Date().toISOString(),
        }));
        setCached(`alerts-${deviceId}`, { alerts: demoAlerts });
        return;
      }

      const res = await fetch(`/api/alerts?deviceId=${deviceId}`);
      if (!res.ok) return;
      const { alerts } = await res.json();
      setCached(`alerts-${deviceId}`, { alerts: alerts ?? [] });
    } catch (_) {}
  }

  useEffect(() => {
    if (loadingDevices || !selectedId) return;
    const timer = setTimeout(async () => {
      await preloadDevice(selectedId);
      if (!isDemo) {
        const others = devices.filter(d => d.device_id !== selectedId);
        for (const device of others) {
          await preloadDevice(device.device_id);
          await preloadAlerts(device.device_id);
        }
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [loadingDevices, selectedId]);

  const selectedDevice = devices.find(d => d.device_id === selectedId) ?? null;

  return (
    <DeviceContext.Provider value={{
      devices, setDevices,
      selectedId, setSelectedId,
      selectedDevice, loadingDevices,
      refreshKey, triggerRefresh,
      getCached, setCached,
      getSubCache, setSubCacheData,
      preloadDevice,
      isDemo,
      demoReadings,
      weatherError,
    }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}