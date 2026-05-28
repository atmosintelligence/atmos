'use client';

const molecules = Array.from({ length: 5 });

export default function CarbonFlow() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {molecules.map((_, i) => (
        <div
          key={i}
          className="carbon-molecule group"
          style={{
            animationDelay: `${i * 6}s`,
            animationDuration: `${24 + i * 3}s`,
            right: `${4 + i * 3}%`,
            transform: `translateX(${i * 10}px)`,
            pointerEvents: 'auto',
          }}
        >
          <span>C</span>

          <div className="carbon-tooltip">
            Carbon emissions from Earth
          </div>
        </div>
      ))}
    </div>
  );
}