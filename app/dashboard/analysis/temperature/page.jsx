'use client';

import { useEffect, useState } from 'react';
import { useDevice }           from '../../DeviceContext';
import { getColStats, scaleColor, fmtDate, tdBase } from '../tableUtils';
import Stat         from '@/components/dashboard/Stat';
import TableWrapper from '@/components/dashboard/TableWrapper';
import OptCard      from '@/components/dashboard/OptCard';

export default function TemperaturePage() {
  const { selectedId, refreshKey, getCached, setCached, isDemo, demoReadings, devices } = useDevice();

  const selectedDevice = devices.find(d => d.device_id === selectedId);

  const [data, setData]     = useState(null);
  const [status, setStatus] = useState('loading');

  const lastContacted = selectedDevice?.last_contacted_at
    ? new Date(selectedDevice.last_contacted_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }).replace('am','AM').replace('pm','PM')
    : null;

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    const cacheKey = `temperature-${selectedId}`;
    const cached = getCached(cacheKey);
    if (cached) { setData(cached); setStatus('ready'); return; }

    async function load() {
      setStatus('loading');
      const { fetchEngine } = await import('@/lib/engineFetch');
      const res = await fetchEngine({
        isDemo, demoReadings, deviceId: selectedId,
        location: { lat: 28.6139, lon: 77.2090 }, roomAreaM2: 20,
      });
      if (cancelled) return;
      if (!res.ok) { setStatus('error'); return; }
      const json = await res.json();
      if (cancelled) return;
      if (!json.analysis) { setStatus('no-data'); return; }
      const d = {
        ...json.analysis.hvac,
        optimizations: json.optimizations.filter(o => o.group === 'HVAC' || o.group === 'Humidity'),
        weatherError: json.weatherError,
        readings: json.readings,
      };
      setData(d);
      setCached(cacheKey, d);
      setStatus('ready');
    }

    load();
    return () => { cancelled = true; };
  }, [selectedId, refreshKey]);

  if (status === 'loading') return <div className="dash-empty" style={{ border: 'none' }}>Loading...</div>;
  if (status === 'error')   return <div className="dash-empty" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>Failed to load data.</div>;
  if (status === 'no-data' || !data) return <div className="dash-empty">No data available for this device.</div>;

  const { t1Events, t2Events, t3Events, optimizations, weatherError, readings } = data;
  const sorted   = readings ? [...readings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) : [];
  const latest   = sorted.at(-1);
  const latestTemp = parseFloat(latest?.temperature ?? 0);
  const latestHum  = parseFloat(latest?.humidity ?? 0);
  const avgTemp    = sorted.reduce((a, r) => a + parseFloat(r.temperature || 0), 0) / (sorted.length || 1);
  const avgHum     = sorted.reduce((a, r) => a + parseFloat(r.humidity || 0), 0) / (sorted.length || 1);
  const totalT2Save = t2Events.reduce((a, e) => a + parseFloat(e.estimatedSaving), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div className="dash-greeting">
        <div className="dash-greeting-name">Temperature</div>
        <div className="dash-greeting-sub">Indoor temperature and humidity trends, HVAC efficiency, and ventilation opportunities.</div>
      </div>

      {weatherError && weatherError !== 'No location set' && (
        <div style={{ fontSize: '0.75rem', color: '#ef4444', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.06)', borderRadius: '0.5rem', border: '1px solid rgba(239,68,68,0.15)' }}>
          Oh no, weather data is currently unavailable! Outdoor ventilation recommendations may be missing.
        </div>
      )}

      {optimizations.length > 0 && (
        <div>
          <div className="dash-section-title">Recommendations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {optimizations.map((opt, i) => <OptCard key={i} opt={opt} lastContacted={lastContacted} />)}
          </div>
        </div>
      )}

      {optimizations.length === 0 && (
        <div className="dash-empty">No temperature or humidity recommendations at this time. Conditions look comfortable.</div>
      )}

      <div>
        <div className="dash-section-title">Summary</div>
        <div className="dash-grid">
          <Stat label="Current temperature" value={`${latestTemp.toFixed(1)}°C`} sub={latestTemp < 22 ? 'Below comfort band' : latestTemp > 30 ? 'Above comfort band' : 'Within comfort band'} />
          <Stat label="Average temperature" value={`${avgTemp.toFixed(1)}°C`} />
          <Stat label="Current humidity" value={`${latestHum.toFixed(0)}%`} sub={latestHum > 72 ? 'Too humid' : latestHum < 28 ? 'Too dry' : 'Comfortable'} />
          <Stat label="Average humidity" value={`${avgHum.toFixed(0)}%`} />
        </div>
      </div>

      {t1Events.length > 0 && (
        <div>
          <div className="dash-section-title">HVAC running in empty room</div>
          <TableWrapper headers={['Detected at', 'Temperature']}>
            {(() => {
              const tempStats = getColStats(t1Events, 'temp');
              return t1Events.map((e, i) => (
                <tr key={i} style={{ borderBottom: i < t1Events.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                  <td style={tdBase({ color: '#737373' })}>{fmtDate(e.timestamp)}</td>
                  <td style={tdBase(scaleColor(e.temp, tempStats))}>{e.temp} °C</td>
                </tr>
              ));
            })()}
          </TableWrapper>
        </div>
      )}

      {t2Events.length > 0 && (
        <div>
          <div className="dash-section-title">Natural ventilation opportunities</div>
          <TableWrapper headers={['Detected at', 'Indoor temp', 'Outdoor temp', 'Power draw', 'Est. saving/hr']}>
            {(() => {
              const tempStats   = getColStats(t2Events, 'indoorTemp');
              const powerStats  = getColStats(t2Events, 'power');
              const savingStats = getColStats(t2Events, 'estimatedSaving');
              return t2Events.map((e, i) => (
                <tr key={i} style={{ borderBottom: i < t2Events.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                  <td style={tdBase({ color: '#737373' })}>{fmtDate(e.timestamp)}</td>
                  <td style={tdBase(scaleColor(e.indoorTemp, tempStats))}>{e.indoorTemp} °C</td>
                  <td style={tdBase()}>{e.outdoorTemp} °C</td>
                  <td style={tdBase(scaleColor(e.power, powerStats))}>{e.power} W</td>
                  <td style={tdBase(scaleColor(e.estimatedSaving, savingStats))}>₹{e.estimatedSaving}</td>
                </tr>
              ));
            })()}
          </TableWrapper>
          <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#a3a3a3' }}>Total potential saving: ₹{totalT2Save.toFixed(2)}</div>
        </div>
      )}

      {t3Events.length > 0 && (
        <div>
          <div className="dash-section-title">Humidity anomalies</div>
          <TableWrapper headers={['Detected at', 'Humidity', 'Condition']}>
            {(() => {
              const humStats = getColStats(t3Events, 'humidity');
              return t3Events.map((e, i) => (
                <tr key={i} style={{ borderBottom: i < t3Events.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                  <td style={tdBase({ color: '#737373' })}>{fmtDate(e.timestamp)}</td>
                  <td style={tdBase(scaleColor(e.humidity, humStats))}>{e.humidity} %</td>
                  <td style={{ ...tdBase(), color: e.high ? '#eab308' : '#60a5fa' }}>{e.high ? 'Too humid' : 'Too dry'}</td>
                </tr>
              ));
            })()}
          </TableWrapper>
        </div>
      )}
    </div>
  );
}