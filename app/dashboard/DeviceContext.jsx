'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const [devices, setDevices]               = useState([]);
  const [selectedId, setSelectedIdState]    = useState(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [refreshKey, setRefreshKey]         = useState(0);
  const [cache, setCache]                   = useState({});
  const selectedIdRef                       = useRef(null);

  const [subCache, setSubCache] = useState(null);
  function getSubCache() { return subCache; }
  function setSubCacheData(data) { setSubCache(data); }

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

  async function preloadDevice(deviceId) {
    const alreadyCached =
      getCached(`overview-${deviceId}`) &&
      getCached(`history-${deviceId}`) &&
      getCached(`lighting-${deviceId}`) &&
      getCached(`temperature-${deviceId}`) &&
      getCached(`power-${deviceId}`) &&
      getCached(`trends-${deviceId}`) &&
      getCached(`environmental-${deviceId}`);

    if (alreadyCached) return;

    try {
      const res = await fetch('/api/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: { lat: 28.6, lon: 77.2 }, roomAreaM2: 20, deviceId }),
      });
      if (!res.ok) return;
      const json = await res.json();
      const raw  = json.readings ?? [];
      const hasData = raw.length > 0;

      if (!getCached(`overview-${deviceId}`)) {
        setCached(`overview-${deviceId}`, hasData ? {
          profile: null, latest: raw.at(-1),
          optimizations: json.optimizations ?? [],
          environmental: json.environmental ?? null,
          noData: false,
        } : { profile: null, latest: null, optimizations: [], environmental: null, noData: true });
      }
      if (!getCached(`history-${deviceId}`) && hasData) {
        const sorted = [...raw].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setCached(`history-${deviceId}`, { rows: sorted });
      }
      if (json.analysis && hasData) {
        if (!getCached(`lighting-${deviceId}`))     setCached(`lighting-${deviceId}`,     { ...json.analysis.lighting,     optimizations: json.optimizations.filter(o => o.group === 'Lighting') });
        if (!getCached(`temperature-${deviceId}`))  setCached(`temperature-${deviceId}`,  { ...json.analysis.hvac,         optimizations: json.optimizations.filter(o => o.group === 'HVAC' || o.group === 'Humidity'), weatherError: json.weatherError, readings: raw });
        if (!getCached(`power-${deviceId}`))        setCached(`power-${deviceId}`,        { ...json.analysis.power,        optimizations: json.optimizations.filter(o => o.group === 'Power') });
        if (!getCached(`trends-${deviceId}`))       setCached(`trends-${deviceId}`,       { ...json.analysis.trends,       optimizations: json.optimizations.filter(o => o.group === 'Trends') });
        if (!getCached(`environmental-${deviceId}`)) setCached(`environmental-${deviceId}`, json.analysis.environmental);
      }
    } catch (_) {}
  }

  useEffect(() => {
    if (!devices.length || !selectedId) return;
    const others = devices.filter(d => d.device_id !== selectedId);
    const timer = setTimeout(() => {
      others.forEach(d => preloadDevice(d.device_id));
    }, 2000);
    return () => clearTimeout(timer);
  }, [devices, selectedId]);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const res = await fetch('/api/devices');
      if (!res.ok) { setLoadingDevices(false); return; }
      const { devices: devs } = await res.json();
      setDevices(devs ?? []);
      if (!devs?.length) {
        setLoadingDevices(false);
        onNoDevices?.();
        return;
      }
      const saved = localStorage.getItem('atmos:selectedDevice');
      const valid = saved && devs.find(d => d.device_id === saved);
      const initial = valid ? saved : devs[0].device_id;
      selectedIdRef.current = initial;
      setSelectedIdState(initial);
      setLoadingDevices(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (loadingDevices || !selectedId) return;

    const timer = setTimeout(async () => {
      for (const device of devices) {
        await preloadDevice(device.device_id);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [loadingDevices, selectedId]);

  const selectedDevice = devices.find(d => d.device_id === selectedId) ?? null;

  return (
    <DeviceContext.Provider value={{
      devices, selectedId, setSelectedId,
      selectedDevice, loadingDevices,
      refreshKey, triggerRefresh,
      getCached, setCached, preloadDevice,
      setDevices
    }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}