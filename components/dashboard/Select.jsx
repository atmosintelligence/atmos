'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Icon from '@/components/Icon';

// The app's dropdown. Works with the keyboard (arrows, Enter, Escape).
// options: [{ value, label, hint? }]
export default function Select({ label, value, options, onChange, placeholder = 'Select', disabled = false, className = '' }) {
  const [open, setOpen]     = useState(false);
  const [active, setActive] = useState(0);
  const ref   = useRef(null);
  const listId = useId();
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  function openList() {
    setActive(Math.max(0, options.findIndex(o => o.value === value)));
    setOpen(true);
  }

  function onKeyDown(e) {
    if (disabled) return;
    if (!open && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList(); return; }
    if (!open) return;
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(options.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(i => Math.max(0, i - 1)); }
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (options[active]) { onChange(options[active].value); setOpen(false); }
    }
  }

  return (
    <div className={`dash-dropdown ${className}`} ref={ref}>
      <button
        type="button"
        className={`dash-dropdown-trigger select-none ${open ? 'open' : ''}`}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className="dash-dropdown-trigger-text">{selected?.label ?? placeholder}</span>
        <Icon name="chevronDown" size={14} className="dash-dropdown-chevron" />
      </button>

      {open && (
        <div className="dash-dropdown-menu" role="listbox" id={listId}>
          {options.map((o, i) => (
            <div
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className={`dash-dropdown-option ${o.value === value ? 'active' : ''}`}
              style={i === active ? { background: 'rgba(128,128,128,0.1)' } : undefined}
              onMouseEnter={() => setActive(i)}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <span>{o.label}</span>
                {o.hint && <span style={{ fontSize: '0.68rem', color: '#a3a3a3' }}>{o.hint}</span>}
              </span>
              {o.value === value && <Icon name="check" size={14} className="dash-dropdown-option-check" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
