'use client';

// A small row of choices where one is selected: chart ranges, modes.
export default function Segmented({ label, value, options, onChange, transparent = false }) {
  return (
    <div 
      className={`seg${transparent ? ' seg--transparent' : ''}`} 
      role="group" 
      aria-label={label}
    >
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
