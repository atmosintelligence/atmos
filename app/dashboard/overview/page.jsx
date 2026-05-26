'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useDevice } from '../DeviceContext';
import Icon from '@/components/Icon';
import OptCard from '@/components/dashboard/OptCard';

function fmtLastContacted(str) {
  if (!str) return null;
  return new Date(str).toLocaleString('en-IN', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).replace('am', 'AM').replace('pm', 'PM');
}

export default function OverviewPage() {
  const { selectedId, devices, refreshKey, getCached, setCached, isDemo, demoReadings } = useDevice();
  const selectedDevice = devices.find(d => d.device_id === selectedId);

  const [profile, setProfile]             = useState(null);
  const [optimizations, setOptimizations] = useState([]);
  const [environmental, setEnvironmental] = useState(null);
  const [latest, setLatest]               = useState(null);
  const [status, setStatus]               = useState('loading');

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    const cacheKey = `overview-${selectedId}`;

    async function load(force = false) {
      if (!force) {
        const cached = getCached(cacheKey);
        if (cached) {
          setLatest(cached.latest);
          setOptimizations(cached.optimizations);
          setEnvironmental(cached.environmental);
          setStatus(cached.noData ? 'no-data' : 'ready');
          if (!isDemo && cached.profile) setProfile(cached.profile);
          else if (!isDemo && !cached.profile) {
            const supabase = createClient();
            supabase.auth.getUser().then(async ({ data: { user } }) => {
              if (!user) return;
              const { data } = await supabase
                .from('profiles')
                .select('display_name, username')
                .eq('id', user.id)
                .single();
              setProfile(data);
              setCached(cacheKey, { ...cached, profile: data });
            });
          }
          return;
        }
      }

      setStatus('loading');

      if (!isDemo) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data: prof } = await supabase
          .from('profiles')
          .select('display_name, username')
          .eq('id', user.id)
          .single();
        if (cancelled) return;
        setProfile(prof);
      }

      const endpoint = isDemo ? '/api/engine/demo' : '/api/engine';
      const body     = isDemo
        ? { readings: demoReadings, location: { lat: 28.6139, lon: 77.2090 }, roomAreaM2: 20, tariff: 10 }
        : { location: { lat: 28.6, lon: 77.2 }, roomAreaM2: 20, deviceId: selectedId };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (cancelled) return;
      if (!res.ok) { setStatus('error'); return; }

      const { optimizations: opts, environmental: env, readings } = await res.json();
      if (cancelled) return;

      if (!readings?.length) {
        setLatest(null);
        setOptimizations([]);
        setEnvironmental(null);
        setStatus('no-data');
        setCached(cacheKey, { profile: null, latest: null, optimizations: [], environmental: null, noData: true });
        return;
      }

      const l = readings.at(-1);
      setLatest(l);
      setOptimizations(opts ?? []);
      setEnvironmental(env ?? null);
      setStatus('ready');
      setCached(cacheKey, {
        profile: isDemo ? null : undefined,
        latest: l,
        optimizations: opts ?? [],
        environmental: env ?? null,
        noData: false,
      });
    }

    load();
    const interval = setInterval(() => { if (!cancelled) load(true); }, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [selectedId, refreshKey, isDemo, demoReadings]);

  if (status === 'loading') return (
    <div className="dash-empty" style={{ border: 'none' }}>Loading your data...</div>
  );

  if (status === 'error') return (
    <div className="dash-empty" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
      Failed to load data. Check your connection.
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <div className="dash-greeting">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div className="dash-greeting-name">
              {isDemo ? 'Hey there' : `Hey, ${profile?.display_name ?? '...'}`}
            </div>

            <div className="dash-greeting-sub">
              Welcome to your dashboard. Here, you'll find useful insights of the environment you've set your devices up in.
            </div>
          </div>

          <div className="dash-stat" style={{ flexShrink: 0, minWidth: '110px', textAlign: 'center', alignItems: 'center', marginLeft: 'auto' }}>
            <div className="dash-stat-value">{devices.length}</div>
            <div className="dash-stat-label">Devices linked</div>
          </div>
        </div>
      </div>

      {status === 'no-data' && (
        <div className="dash-empty">
          No sensor data yet. Once your device starts sending readings, they will appear here.
        </div>
      )}

      {latest && (
        <div>
          <div className="dash-section-title">Latest readings</div>
          <div className="dash-grid">
            {[
              { label: 'Temperature', value: latest.temperature != null ? `${latest.temperature}°C` : '—', icon: 'thermometer' },
              { label: 'Humidity',    value: latest.humidity    != null ? `${latest.humidity}%`     : '—', icon: 'droplet'     },
              { label: 'Power',       value: latest.power       != null ? `${latest.power} W`       : '—', icon: 'zap'         },
              { label: 'Light',       value: latest.light       != null ? `${latest.light} lux`     : '—', icon: 'lightbulb'   },
            ].map(m => (
              <div key={m.label} className="dash-stat">
                <div className="dash-stat-icon text-brand"><Icon name={m.icon} /></div>
                <div className="dash-stat-value">{m.value}</div>
                <div className="dash-stat-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {environmental && (
        <div>
          <div className="dash-section-title">Savings this month</div>
          <div className="dash-grid">
            {[
              { label: 'kWh saved',   value: environmental.kwhSaved,            icon: 'zap'      },
              { label: 'CO₂ reduced', value: `${environmental.co2KgSaved} kg`,  icon: 'leaf'     },
              { label: 'Money saved', value: `₹${environmental.moneySavedINR}`, icon: 'coin'     },
              { label: 'Trees equiv', value: environmental.treesEquiv,           icon: 'tree'     },
            ].map(m => (
              <div key={m.label} className="dash-stat">
                <div className="dash-stat-icon text-brand"><Icon name={m.icon} /></div>
                <div className="dash-stat-value">{m.value}</div>
                <div className="dash-stat-label">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {optimizations.length > 0 && (
        <div>
          <div className="dash-section-title">Recommendations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {optimizations.map((opt, i) => (
              <OptCard key={i} opt={opt} lastContacted={fmtLastContacted(selectedDevice?.last_contacted_at)} />
            ))}
          </div>
        </div>
      )}

      {status === 'ready' && optimizations.length === 0 && latest && (
        <div className="dash-empty">No recommendations right now. Your environment looks good.</div>
      )}
    </div>
  );
}