'use client';

import { useEffect, useState } from 'react';

function createBubble(id) {
  const side = Math.random() > 0.5 ? 'left' : 'right';

  return {
    id,

    left:
      side === 'left'
        ? Math.random() * 18
        : 82 + Math.random() * 18,

    size: 30 + Math.random() * 45,

    duration: 20 + Math.random() * 8,

    drift:
    side === 'left'
      ? -140 - Math.random() * 120
      : 60 + Math.random() * 90,

    opacity: 0.035 + Math.random() * 0.035,
  };
}

export default function CarbonBubbleFlow() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    let id = 0;

    const interval = setInterval(() => {
      const bubble = createBubble(id++);

      setBubbles((prev) => [...prev, bubble]);

      setTimeout(() => {
        setBubbles((prev) =>
          prev.filter((b) => b.id !== bubble.id)
        );
      }, bubble.duration * 1000);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  function removeBubble(id) {
    setBubbles((prev) =>
      prev.filter((b) => b.id !== id)
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" style={{ opacity: 0.33 }}>
      {bubbles.map((bubble) => (
        <button
          key={bubble.id}
          onClick={() => removeBubble(bubble.id)}
          className="absolute flex items-center justify-center rounded-full border border-brand/35 font-heading text-brand/35 select-none pointer-events-auto"
          style={{
            width: bubble.size,
            height: bubble.size,

            left: `${bubble.left}%`,
            bottom: `-${bubble.size}px`,

            opacity: 0.33,

            animation: `largeCarbonFloat ${bubble.duration}s linear forwards`,

            '--drift': `${bubble.drift}px`,

            fontSize: `${bubble.size * 0.24}px`,
          }}
        >
          C
        </button>
      ))}
    </div>
  );
}