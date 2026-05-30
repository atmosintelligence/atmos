'use client';

import { useEffect, useRef, useState } from 'react';

function Cloud({ cloud, toggleRain }) {
  return (
    <button
      onClick={() => toggleRain(cloud.id)}
      className="atmos-cloud-btn"
      style={{
        top: `${cloud.top}px`,
        scale: cloud.scale,
        right: `${cloud.offset}px`,
        animationDuration: `${cloud.duration}s`,
      }}
      aria-label="Toggle rain"
    >
      <svg
        width="120"
        height="38"
        viewBox="0 0 88 28"
        fill="none"
        className="atmos-cloud-svg"
        style={{
          opacity: cloud.opacity,
        }}
      >
        <path
          d="M24 22H68C76 22 82 17 82 10C82 4 77 0 70 0C66 0 62 2 59 5C56 1 51 -1 46 1C40 3 36 8 36 14C35 14 34 14 33 14C26 14 20 18 20 22H24Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {cloud.raining && (
        <div className="atmos-rain">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="atmos-rain-drop"
              style={{
                left: `${10 + i * 7}px`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
}

export default function AtmosWeather() {
  const [clouds, setClouds] = useState([]);
  const nextId = useRef(0);

  useEffect(() => {
    let id = 0;

    function spawnCloud(initial = false) {
      const duration = 65 + Math.random() * 28;

      const cloud = {
        id: nextId.current++,
        top: 2 + Math.random() * 22,
        scale: 0.9 + Math.random() * 0.4,
        duration: 52 + Math.random() * 36,
        raining: false,
        opacity: 0.22 + Math.random() * 0.08,
        offset: initial
          ? -(Math.random() * window.innerWidth)
          : -180,
      };

      setClouds((prev) => [...prev, cloud]);

      setTimeout(() => {
        setClouds((prev) =>
          prev.filter((c) => c.id !== cloud.id)
        );
      }, duration * 1000);
    }

    for (let i = 0; i < 4; i++) {
      spawnCloud(true);
    }

    let timeout;
    function queueNextCloud() {
      const nextDelay =
        5000 + Math.random() * 7000;

      timeout = setTimeout(() => {
        spawnCloud(false);
        queueNextCloud();
      }, nextDelay);
    }
    queueNextCloud();

    return () => clearTimeout(timeout);
  }, []);

  function toggleRain(id) {
    setClouds((prev) =>
      prev.map((cloud) =>
        cloud.id === id
          ? {
              ...cloud,
              raining: !cloud.raining,
            }
          : cloud
      )
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      <div className="atmos-sun-wrap">
        <svg
          width="54"
          height="54"
          viewBox="0 0 54 54"
          fill="none"
        >
          <circle
            cx="27"
            cy="27"
            r="10"
            stroke="currentColor"
            strokeWidth="1.4"
          />

          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI) / 4;

            const x1 = 27 + Math.cos(angle) * 16;
            const y1 = 27 + Math.sin(angle) * 16;

            const x2 = 27 + Math.cos(angle) * 22;
            const y2 = 27 + Math.sin(angle) * 22;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      </div>

      <div className="atmos-weather-hint">
        Click the clouds to make it rain!
      </div>

      <div className="atmos-cloud-layer">
        {clouds.map((cloud) => (
          <Cloud
            key={cloud.id}
            cloud={cloud}
            toggleRain={toggleRain}
          />
        ))}
      </div>
    </div>
  );
}