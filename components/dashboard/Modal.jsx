'use client';

import { useEffect, useId, useRef } from 'react';
import Icon from '@/components/Icon';

// An accessible dialog: closes on Escape or a click outside, keeps keyboard focus inside,
// and gives focus back to the button that opened it.
export default function Modal({ title, onClose, children }) {
  const titleId  = useId();
  const dialog   = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    const focusables = () => dialog.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    (focusables()?.[1] ?? focusables()?.[0])?.focus();

    function onKey(e) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const items = [...(focusables() ?? [])].filter(el => !el.disabled);
      if (!items.length) return;
      const first = items[0], last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus?.();
    };
  }, []);

  return (
    <div className="dash-modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dash-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialog}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 id={titleId} className="dash-card-title" style={{ fontSize: '1.1rem' }}>{title}</h2>
          <button type="button" className="dash-btn ghost sm" onClick={onClose} aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
