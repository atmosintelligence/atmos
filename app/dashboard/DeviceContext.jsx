'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getCurrentUser, getProfile, getSubscription } from '@/lib/supabase';
import { fetchEngine } from '@/lib/engineFetch';
import { resolveDeviceSettings, deviceLabel } from '@/lib/deviceSettings';
import { SECTIONS, SECTION_NAMES } from './sections';
import { useDemo } from './DemoContext';
import { DEMO_DEVICE_ID, DEMO_DEVICE_ID_2 } from '@/lib/demo';

const DeviceContext = createContext(null);

// Keeps the signed-in user's devices, their settings, and everything fetched for them in
// one place, so moving between dashboard pages never refetches what is already here.
export function DeviceProvider({ children }) {
  const { isDemo, demoDevices, demoProfile, demoReadings, demoReadings2, demoReady } = useDemo();

  const [devices, setDevices]               = useState([]);
  const [profile, setProfile]               = useState(null);
  const [selectedId, setSelectedIdState]    = useState(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [refreshKey, setRefreshKey]         = useState(0);
  const [weatherError, setWeatherError]     = useState(null);
  const [subCache, setSubCache]             = useState(null);
  const [cache, setCache]                   = useState({});

  const selectedIdRef   = useRef(null);
  const cacheRef        = useRef({});
  const inflight        = useRef(new Map());
  const syncedRef       = useRef(new Set());
  const devicesFetchRef = useRef(false);

  const getCached = key => cacheRef.current[key] ?? null;

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

  const getDemoReadings = deviceId => (deviceId === DEMO_DEVICE_ID_2 ? demoReadings2 : demoReadings);

  // Settings a device really uses: its own, then the account's, then the defaults.
  function settingsFor(deviceId) {
    return resolveDeviceSettings(devices.find(d => d.device_id === deviceId), profile);
  }

  // Replaces one device's row after its settings change, then recomputes everything.
  function updateDevice(row) {
    setDevices(list => list.map(d => (d.device_id === row.device_id ? { ...d, ...row } : d)));
    triggerRefresh();
  }

  function nameOf(deviceId) {
    return deviceLabel(devices.find(d => d.device_id === deviceId)) || deviceId;
  }

  // The engine result for a device. One request is shared by every page that asks.
  function loadEngine(deviceId) {
    const key = `engine-${deviceId}`;
    const hit = getCached(key);
    if (hit) return Promise.resolve(hit);
    if (inflight.current.has(key)) return inflight.current.get(key);

    const promise = fetchEngine({
      isDemo,
      readings: isDemo ? getDemoReadings(deviceId) : null,
      deviceId,
      settings: settingsFor(deviceId),
    })
      .then(json => {
        if (json.weatherError) setWeatherError(json.weatherError);
        setCached(key, json);
        return json;
      })
      .finally(() => inflight.current.delete(key));

    inflight.current.set(key, promise);
    return promise;
  }

  async function preloadSubscription() {
    if (subCache) return;
    if (isDemo) { setSubCache({ plan: 'premium' }); return; }
    try {
      const sub = await getSubscription();
      if (sub) setSubCache(sub);
    } catch (err) {
      console.error(err);
    }
  }

  // Generates alerts (AI, with the engine as the fallback) and caches the alert list.
  async function syncAlerts(deviceId) {
    const key = `sync-${deviceId}`;
    if (syncedRef.current.has(key)) return;
    syncedRef.current.add(key);
    const alertsKey = `alerts-${deviceId}`;

    try {
      if (isDemo) {
        const readings = getDemoReadings(deviceId);
        if (!readings?.length) { syncedRef.current.delete(key); return; }
        const s = settingsFor(deviceId);
        const res = await fetch('/api/ai/demo', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            readings, deviceId,
            location:   s.latitude != null ? { lat: s.latitude, lon: s.longitude } : undefined,
            roomAreaM2: 20,
            tariff:     s.tariff,
            monthlyKwh: s.monthlyKwh,
          }),
        });
        if (!res.ok) throw new Error('demo ai failed');
        const { optimizations } = await res.json();
        setCached(alertsKey, { alerts: optimizations ?? [] });
        return;
      }

      await fetch('/api/alerts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ deviceId, roomAreaM2: 20 }),
      });
      const res = await fetch(`/api/alerts?deviceId=${deviceId}`);
      if (!res.ok) throw new Error('alerts fetch failed');
      const { alerts } = await res.json();
      setCached(alertsKey, { alerts: alerts ?? [] });
    } catch (err) {
      console.error('[Atmos] alert sync failed:', err.message);
      if (!getCached(alertsKey)) setCached(alertsKey, { alerts: [] });
    }
  }

  // Marks alerts as done. Acknowledged alerts are what the Overview counts as savings.
  async function acknowledgeAlerts(deviceId, ids) {
    const alertsKey = `alerts-${deviceId}`;
    const apply = all => (all ?? []).map(a => (ids === 'all' || ids.includes(a.id) ? { ...a, acknowledged: true } : a));

    if (!isDemo) {
      const res = await fetch('/api/alerts/acknowledge', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(ids === 'all' ? { all: true, deviceId } : { ids }),
      });
      if (!res.ok) return false;
    }
    setCached(alertsKey, { alerts: apply(getCached(alertsKey)?.alerts) });
    return true;
  }

  async function preloadDevice(deviceId) {
    try {
      const json = await loadEngine(deviceId);
      if (json.analysis) {
        for (const name of SECTION_NAMES) {
          const key = `${name}-${deviceId}`;
          if (!getCached(key)) setCached(key, SECTIONS[name](json));
        }
      }
    } catch (err) {
      console.error(err);
    }
    await syncAlerts(deviceId);
  }

  // Devices and profile
  useEffect(() => {
    if (isDemo) {
      if (!demoReady) return;
      const devs = demoDevices ?? [];
      setDevices(devs);
      setProfile(demoProfile);
      if (devs.length) {
        selectedIdRef.current = DEMO_DEVICE_ID;
        setSelectedIdState(DEMO_DEVICE_ID);
      }
      setLoadingDevices(false);
      return;
    }
    if (devicesFetchRef.current) return;
    devicesFetchRef.current = true;

    async function load() {
      const user = await getCurrentUser();
      if (!user) { setLoadingDevices(false); return; }

      const [res, prof] = await Promise.all([
        fetch('/api/devices'),
        getProfile('display_name, username, latitude, longitude, tariff_rate').catch(() => null),
      ]);
      setProfile(prof);
      if (!res.ok) { setLoadingDevices(false); return; }

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

  // Load the selected device first, then the others, once devices and profile are known.
  useEffect(() => {
    if (!selectedId || loadingDevices) return;
    const timer = setTimeout(async () => {
      await preloadDevice(selectedId);
      for (const d of devices.filter(d => d.device_id !== selectedId)) await preloadDevice(d.device_id);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedId, loadingDevices, isDemo, refreshKey]);

  const selectedDevice = devices.find(d => d.device_id === selectedId) ?? null;
  const selectedSettings = useMemo(
    () => resolveDeviceSettings(selectedDevice, profile),
    [selectedDevice, profile],
  );

  return (
    <DeviceContext.Provider
      value={{
        devices, setDevices, updateDevice, profile,
        selectedId, setSelectedId, selectedDevice, selectedSettings,
        loadingDevices, refreshKey, triggerRefresh,
        getCached, setCached, cache,
        loadEngine, settingsFor, nameOf,
        acknowledgeAlerts,
        subCache, setSubCacheData: setSubCache, preloadSubscription,
        isDemo, getDemoReadings, demoReadings, demoReadings2,
        weatherError,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}
