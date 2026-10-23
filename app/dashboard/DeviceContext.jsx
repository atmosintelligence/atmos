'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useDemo } from './DemoContext';
import { DEMO_DEVICE_ID, DEMO_DEVICE_ID_2 } from '@/lib/demo';

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const {
    isDemo,
    demoDevices,
    demoReadings,
    demoReadings2,
    demoReady
  } = useDemo();

  const [devices, setDevices]               = useState([]);
  const [selectedId, setSelectedIdState]    = useState(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [refreshKey, setRefreshKey]         = useState(0);
  const [weatherError, setWeatherError]     = useState(null);
  const selectedIdRef                       = useRef(null);

  const [cache, setCache] = useState({});
  const cacheRef  = useRef({});
  const inflight  = useRef(new Set());
  const syncedRef = useRef(new Set());

  function getCached(key) {
    return cacheRef.current[key] ?? null;
  }

  function setCached(key, value) {
    cacheRef.current = { ...cacheRef.current, [key]: value };
    setCache(cacheRef.current);
  }

  function triggerRefresh() {
    cacheRef.current = {};
    syncedRef.current.clear();
    inflight.current.clear();
    setCache({});
    setSubCache(null);
    setRefreshKey(k => k + 1);
  }

  function setSelectedId(id) {
    if (id === selectedIdRef.current) return;
    selectedIdRef.current = id;
    setSelectedIdState(id);
    if (id) localStorage.setItem('atmos:selectedDevice', id);
    setRefreshKey(k => k + 1);
  }

  function getDemoReadingsForDevice(deviceId) {
    return deviceId === DEMO_DEVICE_ID_2
      ? demoReadings2
      : demoReadings;
  }

  const [subCache, setSubCache] = useState(null);

  function getSubCache() {
    return subCache;
  }

  function setSubCacheData(data) {
    setSubCache(data);
  }

  async function preloadSubscription() {
    if (subCache) return;

    if (isDemo) {
      setSubCache({
        subscription: {
          plan: 'enterprise'
        }
      });
      return;
    }

    try {
      const res = await fetch('/api/subscription');

      if (!res.ok) return;

      const json = await res.json();

      setSubCache(json);
    } catch (err) {
      console.error(err);
    }
  }

  async function syncAIOptimizations(deviceId) {
    const key = `sync-${deviceId}`;
    if (syncedRef.current.has(key)) return;
    syncedRef.current.add(key);
    const alertsKey = `alerts-${deviceId}`;

    try {
      if (isDemo) {
        const readings = deviceId === DEMO_DEVICE_ID_2 ? demoReadings2 : demoReadings;
        if (!readings?.length) {
          syncedRef.current.delete(key);
          return;
        }
        const res = await fetch('/api/ai/demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            readings,
            deviceId,
            location: { lat: 28.6139, lon: 77.2090 },
            roomAreaM2: 20,
            tariff: 10,
          }),
        });
        if (!res.ok) throw new Error('demo ai failed');
        const { optimizations } = await res.json();
        setCached(alertsKey, { alerts: optimizations ?? [] });
        return;
      }

      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, roomAreaM2: 20 }),
      });
      const res = await fetch(`/api/alerts?deviceId=${deviceId}`);
      if (!res.ok) throw new Error('alerts fetch failed');
      const { alerts } = await res.json();
      setCached(alertsKey, { alerts: alerts ?? [] });
    } catch (err) {
      console.error('[Atmos AI] sync failed:', err.message);
      if (!getCached(alertsKey)) setCached(alertsKey, { alerts: [] });
    }
  }

  useEffect(() => {
    if (!selectedId) return;
    if (isDemo && !demoReadings?.length) return;

    // Small delay so the UI renders before the AI call goes out
    const timer = setTimeout(() => {
      syncAIOptimizations(selectedId);
    }, 1500);

    return () => clearTimeout(timer);
  }, [selectedId, isDemo, demoReadings]);

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
      if (!user) {
        setLoadingDevices(false);
        return;
      }
      const res = await fetch('/api/devices');
      if (!res.ok) {
        setLoadingDevices(false);
        return;
      }
      const { devices: devs } = await res.json();
      setDevices(devs ?? []);
      if (devs?.length) {
        const saved   = localStorage.getItem('atmos:selectedDevice');
        const valid   = saved && devs.find(d => d.device_id === saved);
        const initial = valid ? saved : devs[0].device_id;
        selectedIdRef.current = initial;
        setSelectedIdState(initial);
      }
      setLoadingDevices(false);
    }
    load();
  }, [isDemo, demoReady]);

  useEffect(() => {
    if (!isDemo || !demoReady) return;
    if (demoReadings?.length) {
      preloadDevice(DEMO_DEVICE_ID);
    }
    if (demoReadings2?.length) {
      preloadDevice(DEMO_DEVICE_ID_2);
    }
  }, [isDemo, demoReady, demoReadings, demoReadings2]);

  async function preloadDevice(deviceId) {
    try {
      const endpoint = isDemo
        ? '/api/engine/demo'
        : '/api/engine';
      const demoReadingsForDevice = getDemoReadingsForDevice(deviceId);
      const body = isDemo
        ? {
            readings: demoReadingsForDevice,
            location: { lat: 28.6139, lon: 77.2090 },
            roomAreaM2: 20,
            tariff: 10
          }
        : {
            location: { lat: 28.6139, lon: 77.2090 },
            roomAreaM2: 20,
            deviceId
          };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        console.error(await res.text());
        return;
      }
      const json = await res.json();
      const raw     = json.readings ?? [];
      const hasData = raw.length > 0;
      if (json.weatherError) {
        setWeatherError(json.weatherError);
      }
      if (!getCached(`overview-${deviceId}`)) {
        setCached(
          `overview-${deviceId}`,
          hasData
            ? {
                profile: null,
                latest: raw.at(-1),
                optimizations: json.optimizations ?? [],
                environmental: json.environmental ?? null,
                noData: false,
              }
            : {
                profile: null,
                latest: null,
                optimizations: [],
                environmental: null,
                noData: true
              }
        );
      }
      if (!getCached(`history-${deviceId}`) && hasData) {
        setCached(`history-${deviceId}`, {
          rows: [...raw].sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          )
        });
      }
      if (json.analysis && hasData) {
        if (!getCached(`lighting-${deviceId}`)) {
          setCached(`lighting-${deviceId}`, {
            ...json.analysis.lighting,
            optimizations: json.optimizations.filter(
              o => o.group === 'Lighting'
            )
          });
        }
        if (!getCached(`temperature-${deviceId}`)) {
          setCached(`temperature-${deviceId}`, {
            ...json.analysis.hvac,
            optimizations: json.optimizations.filter(
              o => o.group === 'HVAC' || o.group === 'Humidity'
            ),
            weatherError: json.weatherError,
            readings: raw
          });
        }
        if (!getCached(`power-${deviceId}`)) {
          setCached(`power-${deviceId}`, {
            ...json.analysis.power,
            optimizations: json.optimizations.filter(
              o => o.group === 'Power'
            )
          });
        }
        if (!getCached(`trends-${deviceId}`)) {
          setCached(`trends-${deviceId}`, {
            ...json.analysis.trends,
            optimizations: json.optimizations.filter(
              o => o.group === 'Trends'
            )
          });
        }
        if (!getCached(`environmental-${deviceId}`)) {
          setCached(
            `environmental-${deviceId}`,
            json.analysis.environmental
          );
        }
      }
      await preloadAlerts(deviceId);
    } catch (err) {
      console.error(err);
    }
  }

  async function preloadAlerts(deviceId) {
    const key = `alerts-${deviceId}`;
    if (isDemo || getCached(key) || inflight.current.has(key)) return;
    inflight.current.add(key);
    try {
      const res = await fetch(`/api/alerts?deviceId=${deviceId}`);
      if (!res.ok) return;
      const { alerts } = await res.json();
      if (!getCached(key)) setCached(key, { alerts: alerts ?? [] });
    } catch (_) {
    } finally {
      inflight.current.delete(key);
    }
  }

  useEffect(() => {
  if (loadingDevices || !selectedId) return;
  if (refreshKey === 0) return;

  const timer = setTimeout(async () => {
      await preloadSubscription();

      await preloadDevice(selectedId);
      await preloadAlerts(selectedId);

      const others = devices.filter(
        d => d.device_id !== selectedId
      );

      for (const device of others) {
        await preloadDevice(device.device_id);
        await preloadAlerts(device.device_id);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    loadingDevices,
    selectedId,
    refreshKey
  ]);

  const selectedDevice =
    devices.find(d => d.device_id === selectedId) ?? null;

  return (
    <DeviceContext.Provider
      value={{
        devices,
        setDevices,
        selectedId,
        setSelectedId,
        selectedDevice,
        loadingDevices,
        refreshKey,
        triggerRefresh,
        getCached,
        setCached,
        getSubCache,
        setSubCacheData,
        preloadDevice,
        isDemo,
        demoReadings,
        demoReadings2,
        weatherError,
        cache
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}