'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';

const DAYS  = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const SLOTS = ['9 AM', '1 PM', '5 PM', '9 PM'];
const ROOMS = {
  Classroom: { start: ['30', '31', '32', '33', '34'], ai: ['30', '31', '32', '33', '34', '35', '36', '10', '11', '12', '13', '14'] },
  Office:    { start: ['20', '21', '22', '23', '24'], ai: ['20', '21', '22', '23', '24', '30', '31', '32', '33', '34', '35', '36'] },
};

// A small, tappable weekly calendar. Filled blocks are times a device is switched off.
export default function AutomationDemo() {
  const names = Object.keys(ROOMS);
  const [room, setRoom]   = useState(names[0]);
  const [cells, setCells] = useState(() => Object.fromEntries(names.map(n => [n, ROOMS[n].start])));
  const [busy, setBusy]   = useState(false);

  const toggle = key => setCells(prev => ({
    ...prev,
    [room]: prev[room].includes(key) ? prev[room].filter(k => k !== key) : [...prev[room], key],
  }));

  const plan = () => {
    setBusy(true);
    setTimeout(() => { setCells(prev => ({ ...prev, [room]: ROOMS[room].ai })); setBusy(false); }, 600);
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div className="flex gap-2 mb-4 flex-wrap" role="group" aria-label="Room">
        {names.map(n => (
          <button
            key={n}
            type="button"
            aria-pressed={room === n}
            onClick={() => setRoom(n)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${room === n ? 'bg-brand text-brand-on-bg' : 'border border-black/10 dark:border-white/15 text-neutral-600 dark:text-neutral-400'}`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[2.75rem_repeat(7,1fr)] gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-400">
        <div />
        {DAYS.map((d, i) => <div key={i} className="text-center" aria-hidden="true">{d}</div>)}
        {SLOTS.map((s, r) => (
          <div key={s} className="contents">
            <div className="flex items-center">{s}</div>
            {DAYS.map((_, c) => {
              const key = `${r}${c}`;
              const off = cells[room].includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={off}
                  aria-label={`${s}, day ${c + 1}: ${off ? 'switched off' : 'left on'}`}
                  onClick={() => toggle(key)}
                  className={`h-8 rounded-md transition-colors ${off ? 'bg-brand/80' : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-brand/20'}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="h-3 w-3 rounded bg-brand/80" /> Switched off
        </div>
        <button type="button" onClick={plan} disabled={busy} className="btn inline-flex items-center gap-2 bg-brand text-brand-on-bg px-4 py-1.5 rounded-full text-xs font-medium">
          <Icon name="ai" size={16} />
          {busy ? 'Planning...' : 'Plan with AI'}
        </button>
      </div>
    </div>
  );
}
