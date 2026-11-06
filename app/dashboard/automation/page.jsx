'use client';

import { useEffect, useRef, useState } from 'react';
import { useDevice } from '../DeviceContext';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TARGETS   = [
  { value: 'light', label: 'Lights' },
  { value: 'fan',   label: 'Fan'    },
  { value: 'ac',    label: 'AC'     },
];
const TARGET_LABEL = Object.fromEntries(TARGETS.map(t => [t.value, t.label]));

const EMPTY_FORM = { target: 'light', action: 'off', days: [1, 2, 3, 4, 5], time: '19:30', enabled: true };

const DEMO_AI_RULES = [
  { target: 'light', action: 'off', days: [1, 2, 3, 4, 5], time: '19:30', reason: 'The room is usually empty after 19:00 on weekdays.' },
  { target: 'ac',    action: 'off', days: [1, 2, 3, 4, 5], time: '18:45', reason: 'Nobody is in the room 15 minutes before the lights go off.' },
  { target: 'ac',    action: 'on',  days: [1, 2, 3, 4, 5], time: '09:15', reason: 'Occupancy starts at about 09:30 on weekdays.' },
  { target: 'light', action: 'off', days: [0, 6],          time: '14:00', reason: 'Weekend use is short and ends by early afternoon.' },
];

const TZ = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata';

function fmtTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function fmtLogTime(value) {
  return new Date(value)
    .toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
    .replace('am', 'AM')
    .replace('pm', 'PM');
}

async function request(url, options) {
  const res  = await fetch(url, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'Something went wrong');
  return body;
}

function json(method, body) {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

function Dropdown({ labelledBy, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function close(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const i    = options.findIndex(o => o.value === value);
      const step = e.key === 'ArrowDown' ? 1 : options.length - 1;
      onChange(options[(i + step) % options.length].value);
    }
  }

  return (
    <div className="dash-dropdown auto-dropdown" ref={ref} onKeyDown={onKeyDown}>
      <button
        type="button"
        className={`dash-dropdown-trigger select-none ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelledBy}
      >
        <span className="dash-dropdown-trigger-text">{selected.label}</span>
        <svg className="dash-dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="dash-dropdown-menu" role="listbox" aria-labelledby={labelledBy}>
          {options.map(o => (
            <div
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`dash-dropdown-option ${o.value === value ? 'active' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              <span>{o.label}</span>
              {o.value === value && (
                <svg className="dash-dropdown-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AutomationPage() {
  const { selectedId, isDemo, loadingDevices, refreshKey } = useDevice();

  const [schedules, setSchedules] = useState([]);
  const [logs, setLogs]           = useState([]);
  const [loaded, setLoaded]       = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [planning, setPlanning]   = useState(false);
  const [message, setMessage]     = useState(null);
  const formRef  = useRef(null);
  const demoSeq  = useRef(1);

  useEffect(() => {
    if (!selectedId || isDemo) return;
    let cancelled = false;

    request(`/api/automation/schedules?deviceId=${encodeURIComponent(selectedId)}`)
      .then(data => {
        if (cancelled) return;
        setSchedules(data.schedules ?? []);
        setLogs(data.logs ?? []);
        setLoaded(selectedId);
        setLoadError(null);
      })
      .catch(err => {
        if (!cancelled) setLoadError(err.message);
      });

    return () => { cancelled = true; };
  }, [selectedId, isDemo, refreshKey]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function toggleDay(day) {
    setForm(f => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day],
    }));
  }

  function startEdit(rule) {
    setEditingId(rule.id);
    setForm({ target: rule.target, action: rule.action, days: rule.days, time: rule.time, enabled: rule.enabled });
    setMessage(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.days.length) {
      setMessage({ type: 'error', text: 'Pick at least one day.' });
      return;
    }
    setSaving(true);
    setMessage(null);

    try {
      if (isDemo) {
        if (editingId) {
          setSchedules(list => list.map(r => (r.id === editingId ? { ...r, ...form, source: 'manual' } : r)));
        } else {
          setSchedules(list => [...list, { id: `demo-${demoSeq.current++}`, ...form, source: 'manual', tz: TZ }]);
        }
      } else if (editingId) {
        const { schedule } = await request('/api/automation/schedules', json('PATCH', { id: editingId, ...form }));
        setSchedules(list => list.map(r => (r.id === editingId ? schedule : r)));
      } else {
        const { schedule } = await request('/api/automation/schedules', json('POST', { deviceId: selectedId, tz: TZ, ...form }));
        setSchedules(list => [...list, schedule]);
      }
      setMessage({ type: 'ok', text: editingId ? 'Rule updated.' : 'Rule added.' });
      resetForm();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    setSaving(false);
  }

  async function remove(id) {
    setMessage(null);
    try {
      if (!isDemo) await request(`/api/automation/schedules?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setSchedules(list => list.filter(r => r.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function planWithAI() {
    setPlanning(true);
    setMessage(null);
    try {
      if (isDemo) {
        setSchedules(list => [
          ...list.filter(r => r.source !== 'ai'),
          ...DEMO_AI_RULES.map(r => ({ ...r, id: `demo-ai-${demoSeq.current++}`, source: 'ai', enabled: true, tz: TZ })),
        ]);
        setMessage({ type: 'ok', text: `AI planned ${DEMO_AI_RULES.length} rules from the demo room's usage.` });
      } else {
        const data = await request('/api/automation/suggest', json('POST', { deviceId: selectedId, tz: TZ }));
        setSchedules(data.schedules ?? []);
        setMessage({
          type: 'ok',
          text: data.added
            ? `AI planned ${data.added} rule${data.added === 1 ? '' : 's'}. Edit or delete any of them.`
            : 'AI found nothing new to add. Your own rules already cover the pattern.',
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    setPlanning(false);
  }

  if (loadingDevices) {
    return <div className="dash-empty" style={{ border: 'none' }}>Loading automation...</div>;
  }

  if (!selectedId) {
    return <div className="dash-empty">Select a device to plan its automation.</div>;
  }

  if (!isDemo && loaded !== selectedId) {
    return loadError
      ? <div className="dash-empty" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>{loadError}</div>
      : <div className="dash-empty" style={{ border: 'none' }}>Loading automation...</div>;
  }

  const today    = new Date().getDay();
  const aiCount  = schedules.filter(r => r.source === 'ai').length;
  const byDay    = day => schedules
    .filter(r => r.days.includes(day))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      <div className="dash-greeting">
        <div className="dash-greeting-name">Automation</div>
        <div className="dash-greeting-sub">
          Atmos does not only watch. Set when your lights, fan and AC should switch on or off, or let AI plan it from how your room is used. The sensor unit carries the schedule out by itself.
        </div>
      </div>

      {message && (
        <div
          className="dash-empty"
          style={{
            padding: '0.75rem 1rem',
            textAlign: 'left',
            borderStyle: 'solid',
            borderColor: message.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(74,222,128,0.3)',
            color: message.type === 'error' ? '#ef4444' : 'inherit',
          }}
        >
          {message.text}
        </div>
      )}

      <div className="auto-grid">
        <form ref={formRef} onSubmit={submit} className="dash-device-card">
          <div className="dash-section-title" style={{ marginBottom: 0 }}>
            {editingId ? 'Edit rule' : 'Add a rule'}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <span className="auto-field-label" id="auto-target-label">Appliance</span>
              <Dropdown
                labelledBy="auto-target-label"
                value={form.target}
                options={TARGETS}
                onChange={v => setForm(f => ({ ...f, target: v }))}
              />
            </div>

            <div>
              <span className="auto-field-label">Action</span>
              <div className="auto-seg" role="group" aria-label="Action">
                <button type="button" className={`on ${form.action === 'on' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, action: 'on' }))}>
                  Turn on
                </button>
                <button type="button" className={`off ${form.action === 'off' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, action: 'off' }))}>
                  Turn off
                </button>
              </div>
            </div>

            <div>
              <label className="auto-field-label" htmlFor="auto-time">Time</label>
              <input
                id="auto-time"
                type="time"
                required
                className="field-input"
                style={{ width: 'auto' }}
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <span className="auto-field-label">Repeat on</span>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {DAY_ORDER.map(d => (
                <button
                  key={d}
                  type="button"
                  className={`auto-day ${form.days.includes(d) ? 'active' : ''}`}
                  onClick={() => toggleDay(d)}
                  aria-pressed={form.days.includes(d)}
                >
                  {DAY_SHORT[d]}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.875rem', marginTop: '0.5rem' }}>
              <span className="auto-link" onClick={() => setForm(f => ({ ...f, days: [1, 2, 3, 4, 5] }))}>Weekdays</span>
              <span className="auto-link" onClick={() => setForm(f => ({ ...f, days: [0, 6] }))}>Weekends</span>
              <span className="auto-link" onClick={() => setForm(f => ({ ...f, days: [0, 1, 2, 3, 4, 5, 6] }))}>Every day</span>
            </div>
          </div>

          {editingId && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
              />
              Rule is active
            </label>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button type="submit" disabled={saving} className="btn bg-brand text-brand-on-bg" style={{ fontSize: '0.82rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '0.625rem' }}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add rule'}
            </button>
            {editingId && (
              <>
                <button type="button" className="btn" onClick={resetForm} style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', borderRadius: '0.625rem', background: 'rgba(128,128,128,0.1)' }}>
                  Cancel
                </button>
                <button type="button" className="btn" onClick={() => remove(editingId)} style={{ fontSize: '0.82rem', padding: '0.5rem 1rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                  Delete
                </button>
              </>
            )}
          </div>
        </form>

        <div className="dash-device-card">
          <div className="dash-section-title" style={{ marginBottom: 0 }}>AI planner</div>
          <p style={{ fontSize: '0.8rem', color: '#737373', lineHeight: 1.65, margin: 0 }}>
            <strong>Let AI plan for you first, then control whether it's doing right.</strong> AI studies the last 30 days of occupancy in this room, then proposes when to switch each appliance on or off. Your own rules are never touched, and AI skips anything that clashes with them.
          </p>
          <p style={{ fontSize: '0.8rem', color: '#737373', lineHeight: 1.65, margin: 0 }}>
            You stay in charge. Edit or delete any AI rule and it becomes yours, so the next plan will not replace it.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={planWithAI}
              disabled={planning}
              className="btn bg-brand text-brand-on-bg"
              style={{ fontSize: '0.82rem', fontWeight: 600, padding: '0.5rem 1.25rem', borderRadius: '0.625rem' }}
            >
              {planning ? 'Planning...' : aiCount ? 'Plan again with AI' : 'Plan with AI'}
            </button>
            {aiCount > 0 && <span style={{ fontSize: '0.75rem', color: '#737373' }}>{aiCount} AI rule{aiCount === 1 ? '' : 's'} on the calendar</span>}
          </div>
          {isDemo && (
            <p style={{ fontSize: '0.72rem', color: '#a3a3a3', margin: 0 }}>
              Demo mode: rules live in this page only and the plan is a sample.
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="dash-section-title">Weekly calendar</div>
        <div className="auto-cal">
          {DAY_ORDER.map(day => {
            const rules = byDay(day);
            return (
              <div key={day} className={`auto-col ${day === today ? 'today' : ''}`}>
                <div className="auto-col-head">{DAY_SHORT[day]}</div>
                {rules.length === 0 && <div style={{ fontSize: '0.7rem', color: '#a3a3a3', padding: '0.25rem' }}>No rules</div>}
                {rules.map(rule => (
                  <button
                    key={rule.id}
                    type="button"
                    className={`auto-chip ${rule.action} ${rule.enabled ? '' : 'paused'}`}
                    onClick={() => startEdit(rule)}
                    title={rule.reason ?? 'Click to edit'}
                  >
                    <div className="auto-chip-time">{fmtTime(rule.time)}</div>
                    <div>{TARGET_LABEL[rule.target]} {rule.action === 'on' ? 'on' : 'off'}</div>
                    <div className="auto-chip-meta">
                      <span className={`auto-badge ${rule.source === 'ai' ? 'ai' : 'user'}`}>{rule.source === 'ai' ? 'AI' : 'You'}</span>
                      {!rule.enabled && <span style={{ fontSize: '0.6rem' }}>paused</span>}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: '0.72rem', color: '#a3a3a3', margin: '0.625rem 0 0' }}>
          Times are in {TZ}. Click a rule to edit it.
        </p>
      </div>

      <div>
        <div className="dash-section-title">Recent actions by the sensor</div>
        <div className="dash-device-card" style={{ padding: '0.5rem 1.25rem' }}>
          {logs.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: '#737373', padding: '0.75rem 0' }}>
              {isDemo ? 'Actions the sensor takes will appear here.' : 'No actions reported yet. Once your unit switches something, it shows up here.'}
            </div>
          ) : logs.map((log, i) => (
            <div key={i} className="auto-log">
              <span style={{ color: '#737373', minWidth: '8.5rem' }}>{fmtLogTime(log.timestamp)}</span>
              <span style={{ fontWeight: 500 }}>{TARGET_LABEL[log.target] ?? log.target} {log.action}</span>
              {log.reason && <span style={{ color: '#737373' }}>{log.reason}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
