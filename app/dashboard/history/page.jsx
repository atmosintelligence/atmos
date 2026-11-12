'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDevice } from '../DeviceContext';
import { fetchEngine } from '@/lib/engineFetch';
import { fmtDate } from '../analysis/tableUtils';
import PageHeader   from '@/components/dashboard/PageHeader';
import Segmented    from '@/components/dashboard/Segmented';
import TableWrapper from '@/components/dashboard/TableWrapper';

const PAGE = 50;
const RANGES = [
  { value: 1,  label: '24 hours' },
  { value: 7,  label: '7 days' },
  { value: 30, label: '30 days' },
];

const isYes = v => v === true || v === 'true' || v === 1 || v === '1';

export default function HistoryPage() {
  const { selectedId, refreshKey, getCached, setCached, isDemo, getDemoReadings, nameOf } = useDevice();
  const [rows, setRows]       = useState([]);
  const [status, setStatus]   = useState('loading');
  const [days, setDays]       = useState(1);
  const [shown, setShown]     = useState(PAGE);
  const [clearing, setClearing]         = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!selectedId) return;
    const sortDesc = list => [...list].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (isDemo) {
      const source = getDemoReadings(selectedId) ?? [];
      setRows(sortDesc(source));
      setStatus(source.length ? 'ready' : 'no-data');
      return;
    }

    let cancelled = false;
    const key = `history-${selectedId}`;
    const cached = getCached(key);
    if (cached) { setRows(cached.rows); setStatus(cached.rows.length ? 'ready' : 'no-data'); return; }

    (async () => {
      setStatus('loading');
      try {
        const { readings } = await fetchEngine({ isDemo, deviceId: selectedId });
        if (cancelled) return;
        const sorted = sortDesc(readings ?? []);
        setRows(sorted);
        setCached(key, { rows: sorted });
        setStatus(sorted.length ? 'ready' : 'no-data');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId, refreshKey, isDemo]);

  useEffect(() => { setShown(PAGE); }, [days, selectedId]);

  // Ranges are measured back from the newest reading, so old demo data still shows.
  const visible = useMemo(() => {
    if (!rows.length) return [];
    const newest = new Date(rows[0].timestamp).getTime();
    const from = newest - days * 86400000;
    return rows.filter(r => new Date(r.timestamp).getTime() >= from);
  }, [rows, days]);

  async function clearHistory() {
    setClearing(true);
    const res = await fetch('/api/devices/clear-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: selectedId }),
    });
    setClearing(false);
    setConfirmClear(false);
    if (res.ok) { setRows([]); setCached(`history-${selectedId}`, { rows: [] }); setStatus('no-data'); }
  }

  const actions = rows.length > 0 && !isDemo && (
    confirmClear ? (
      <>
        <button type="button" className="dash-btn danger" onClick={clearHistory} disabled={clearing}>{clearing ? 'Clearing...' : 'Yes, delete readings'}</button>
        <button type="button" className="dash-btn ghost" onClick={() => setConfirmClear(false)}>Cancel</button>
      </>
    ) : (
      <button type="button" className="dash-btn ghost" onClick={() => setConfirmClear(true)}>Delete history</button>
    )
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      <PageHeader
        title="History"
        sub={`Every reading ${nameOf(selectedId)} has sent, newest first. Atmos sensors report temperature, humidity, light and whether the room is occupied.`}
        actions={actions}
      />

      {status === 'loading' && <div className="dash-empty" style={{ border: 'none' }} aria-busy="true">Loading history...</div>}
      {status === 'error'   && <div className="dash-error" role="alert">We could not load the history. Try the refresh button.</div>}
      {status === 'no-data' && <div className="dash-empty">No readings yet. They appear here a few minutes after the device is powered on.</div>}

      {status === 'ready' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <Segmented label="Time range" value={days} options={RANGES} onChange={setDays} />
            <span className="dash-card-sub" style={{ margin: 0 }}>{visible.length.toLocaleString('en-IN')} readings</span>
          </div>

          <TableWrapper headers={['Time', 'Temperature', 'Humidity', 'Light', 'Occupancy']} caption="Sensor readings">
            {visible.slice(0, shown).map((r, i) => (
              <tr key={`${r.timestamp}-${i}`}>
                <td>{fmtDate(r.timestamp)}</td>
                <td>{r.temperature != null ? `${r.temperature} °C` : '—'}</td>
                <td>{r.humidity != null ? `${r.humidity} %` : '—'}</td>
                <td>{r.light != null ? `${r.light} lux` : '—'}</td>
                <td>{isYes(r.occupancy) ? 'Occupied' : 'Empty'}</td>
              </tr>
            ))}
          </TableWrapper>

          {shown < visible.length && (
            <div style={{ textAlign: 'center' }}>
              <button type="button" className="dash-btn ghost" onClick={() => setShown(s => s + PAGE)}>
                Show more ({(visible.length - shown).toLocaleString('en-IN')} left)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
