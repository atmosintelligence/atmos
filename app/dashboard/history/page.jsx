'use client';

import { useEffect, useState } from 'react';
import { useDevice } from '../DeviceContext';
import { getColStats, scaleColor, fmtDate } from '../analysis/tableUtils';

const COLS = [
  { key: 'timestamp',   label: 'Timestamp',  unit: null  },
  { key: 'temperature', label: 'Temp',        unit: '°C'  },
  { key: 'humidity',    label: 'Humidity',    unit: '%'   },
  { key: 'power',       label: 'Power',       unit: 'W'   },
  { key: 'energy',      label: 'Energy',      unit: 'kWh' },
  { key: 'voltage',     label: 'Voltage',     unit: 'V'   },
  { key: 'light',       label: 'Light',       unit: 'lux' },
  { key: 'occupancy',   label: 'Occupancy',   unit: null  },
];

export default function HistoryPage() {
  const {
    selectedId,
    refreshKey,
    getCached,
    setCached,
    isDemo,
    demoReadings,
    demoReadings2
  } = useDevice();
  const [rows, setRows]                 = useState([]);
  const [status, setStatus]             = useState('loading');
  const [clearing, setClearing]         = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!selectedId) return;
    if (isDemo) {
      const source =
        selectedId === 'ATM-DEMO2'
          ? demoReadings2
          : demoReadings;

      const sorted = [...source].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setRows(sorted);
      setStatus('ready');
      return;
    }

    let cancelled = false;
    const cacheKey = `history-${selectedId}`;
    const cached = getCached(cacheKey);

    if (cached) {
      setRows(cached.rows);
      setStatus('ready');
      return;
    }

    async function load() {
      setStatus('loading');
      const { fetchEngine } = await import('@/lib/engineFetch');
      const res = await fetchEngine({
        isDemo, demoReadings, deviceId: selectedId,
        location: { lat: 28.6139, lon: 77.2090 }, roomAreaM2: 20,
      });
      if (cancelled) return;
      if (!res.ok) { setStatus('error'); return; }
      const { readings } = await res.json();
      if (cancelled) return;
      if (!readings?.length) { setRows([]); setStatus('no-data'); return; }
      const sorted = [...readings].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRows(sorted);
      setCached(cacheKey, { rows: sorted });
      setStatus('ready');
    }

    load();
    return () => { cancelled = true; };
  }, [selectedId, refreshKey]);

  async function handleClearHistory() {
    setClearing(true);
    const res = await fetch('/api/devices/clear-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: selectedId }),
    });
    setClearing(false);
    setConfirmClear(false);
    if (res.ok) { setRows([]); setStatus('no-data'); }
  }

  const colStats = {};
  COLS.slice(1).forEach(c => {
    if (c.key !== 'occupancy') colStats[c.key] = getColStats(rows, c.key);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div className="dash-greeting">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div className="dash-greeting-name">History</div>
            <div className="dash-greeting-sub">All recorded readings for the selected device, latest first.</div>
          </div>
          {rows.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginTop: '0.25rem' }}>
              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  disabled={isDemo}
                  style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.4rem 1rem', borderRadius: '0.5rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
                >
                  Forget history
                </button>
              ) : (
                <>
                  <button
                    onClick={handleClearHistory}
                    disabled={clearing}
                    style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.4rem 1rem', borderRadius: '0.5rem', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', opacity: clearing ? 0.6 : 1 }}
                  >
                    {clearing ? 'Clearing...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.4rem 1rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.06)', color: '#737373', border: 'none', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {status === 'loading' && <div className="dash-empty" style={{ border: 'none' }}>Loading history...</div>}
      {status === 'error'   && <div className="dash-empty" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>Failed to load history.</div>}
      {status === 'no-data' && <div className="dash-empty">No history yet for this device.</div>}

      {status === 'ready' && (
        <div style={{ overflowX: 'auto', borderRadius: '0.875rem', border: '1px solid rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                {COLS.map(c => (
                  <th key={c.key} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#737373', whiteSpace: 'nowrap', background: 'rgba(0,0,0,0.02)' }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isOccupancy = (key) => key === 'occupancy';
                const isYes = row.occupancy === 'true' || row.occupancy === true;
                return (
                  <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                    <td style={{ padding: '0.6rem 1rem', whiteSpace: 'nowrap', color: '#737373' }}>{fmtDate(row.timestamp)}</td>
                    {COLS.slice(1).map(c => {
                      const occ = isOccupancy(c.key);
                      const occStyle = occ ? { color: isYes ? 'rgb(240,240,240)' : 'rgb(160,160,160)' } : {};
                      const valStyle = !occ && row[c.key] != null ? scaleColor(row[c.key], colStats[c.key]) : {};
                      return (
                        <td key={c.key} style={{ padding: '0.6rem 1rem', whiteSpace: 'nowrap', ...occStyle, ...valStyle }}>
                          {occ
                            ? (isYes ? 'Yes' : 'No')
                            : row[c.key] != null
                              ? `${row[c.key]}${c.unit ? ' ' + c.unit : ''}`
                              : '—'
                          }
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}