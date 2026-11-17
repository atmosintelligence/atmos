'use client';

import { useEffect, useRef, useState } from 'react';

// Animates a number towards its target. Respects reduced-motion.
export function useCountUp(target, ms = 700) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || from.current === target) { from.current = target; setV(target); return; }
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      const cur = a + (target - a) * e;
      from.current = cur;
      setV(cur);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export function Label({ children, hint, htmlFor }) {
  return (
    <div className="mb-2">
      <label htmlFor={htmlFor} className="sub-label">{children}</label>
      {hint && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500 leading-relaxed">{hint}</p>}
    </div>
  );
}

export function Seg({ value, onChange, options, cols }) {
  return (
    <div className="sub-seg" style={{ gridTemplateColumns: `repeat(${cols || options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Slider({ value, min, max, step, onChange, ariaLabel }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <input
      type="range" className="sub-range" min={min} max={max} step={step} value={value}
      aria-label={ariaLabel}
      style={{ '--p': `${pct}%` }}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

export function RupeeInput({ value, onChange, id, placeholder, prefix = '₹', suffix }) {
  return (
    <div className="relative">
      {prefix && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-500">{prefix}</span>}
      <input
        id={id} type="number" inputMode="numeric" min="0" className="field-input" placeholder={placeholder}
        style={{ paddingLeft: prefix ? '1.9rem' : undefined, paddingRight: suffix ? '3.2rem' : undefined }}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      />
      {suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500">{suffix}</span>}
    </div>
  );
}
