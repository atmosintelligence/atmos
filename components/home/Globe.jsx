'use client';

import { useEffect, useRef } from 'react';

// Decorative globe for the hero. It grows in when the page loads, then turns slowly.
// Kept cheap on purpose: d3 and the map load only here, drawing is capped at 30 fps, and it
// stops when the hero is off screen, the tab is hidden, or the visitor prefers reduced motion
// (they get one still frame).

const GROW_MS = 1600;
const DEG_PER_SECOND = 7;
const FRAME_MS = 33;

const COLORS = {
  dark:  { fillA: 'rgba(74,222,128,0.05)', fillB: 'rgba(74,222,128,0.01)', ring: 'rgba(74,222,128,0.22)', grid: 'rgba(74,222,128,0.08)', land: 'rgba(74,222,128,0.06)', coast: 'rgba(74,222,128,0.42)' },
  light: { fillA: 'rgba(21,128,61,0.10)',  fillB: 'rgba(21,128,61,0.03)',  ring: 'rgba(21,128,61,0.30)',  grid: 'rgba(21,128,61,0.12)',  land: 'rgba(21,128,61,0.08)',  coast: 'rgba(21,128,61,0.55)' },
};

export default function Globe() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let alive = true;
    let visible = true;
    let lib = null;          // { geoOrthographic, geoPath, graticule, land }
    let startedAt = 0;
    let lastDraw = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = host.clientWidth;
      height = host.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(now) {
      const t = now - startedAt;
      const grow = reduceMotion ? 1 : Math.min(1, t / GROW_MS);
      const eased = 1 - Math.pow(1 - grow, 3);
      const spin = reduceMotion ? 0 : (t / 1000) * DEG_PER_SECOND;

      const cx = width * (width >= 768 ? 0.72 : 0.5);
      const cy = height * 0.48;
      const r = Math.min(width, height) * 0.38 * eased;
      const c = COLORS[document.documentElement.classList.contains('dark') ? 'dark' : 'light'];

      ctx.clearRect(0, 0, width, height);
      canvas.style.opacity = String(0.8 * eased);
      if (r < 1) return;

      const projection = lib.geoOrthographic().scale(r).translate([cx, cy]).rotate([-96 + spin, -18, 0]).clipAngle(90);
      const path = lib.geoPath(projection, ctx);

      ctx.beginPath();
      path({ type: 'Sphere' });
      const fill = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.05, cx, cy, r);
      fill.addColorStop(0, c.fillA);
      fill.addColorStop(1, c.fillB);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = c.ring;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      path(lib.graticule);
      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 0.4;
      ctx.stroke();

      if (lib.land) {
        ctx.beginPath();
        path(lib.land);
        ctx.fillStyle = c.land;
        ctx.fill();
        ctx.strokeStyle = c.coast;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }

    function loop(now) {
      if (!alive) return;
      raf = 0;
      if (visible && !document.hidden && now - lastDraw >= FRAME_MS) {
        lastDraw = now;
        draw(now);
      }
      if (!reduceMotion) raf = requestAnimationFrame(loop);
    }

    function start() {
      if (raf || !lib) return;
      raf = requestAnimationFrame((now) => {
        startedAt = startedAt || now;
        loop(now);
      });
    }

    resize();
    const observer = new ResizeObserver(() => { resize(); if (lib && reduceMotion) draw(performance.now()); });
    observer.observe(host);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(host);

    // Start growing straight away. The map arrives a moment later and fades in with the globe.
    Promise.all([import('d3-geo'), import('topojson-client')]).then(([d3, topo]) => {
      if (!alive) return;
      lib = { geoOrthographic: d3.geoOrthographic, geoPath: d3.geoPath, graticule: d3.geoGraticule()(), land: null };
      start();
      return fetch('/countries.json')
        .then((res) => res.json())
        .then((world) => { if (alive) lib.land = topo.feature(world, world.objects.countries); });
    }).catch(() => { /* the globe is decoration; the page works without it */ });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
