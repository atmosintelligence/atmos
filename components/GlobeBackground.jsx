'use client';

import { useEffect, useRef } from 'react';
import { geoOrthographic, geoPath, geoGraticule } from 'd3-geo';
import * as topojson from 'topojson-client';

export default function GlobeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    let animId;
    let rotation = 0;
    let intro    = 0;
    let land     = null;

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    fetch('/countries.json')
      .then(r => r.json())
      .then(world => {
        land = topojson.feature(world, world.objects.countries);
        requestAnimationFrame(draw);
      });

    const graticule = geoGraticule()();

    function draw() {
      const w  = canvas.width;
      const h  = canvas.height;
      const cx = w * 0.72;
      const cy = h * 0.48;
      const baseR = Math.min(w, h) * 0.38;
      intro += (1 - intro) * 0.045;
      const eased = 1 - Math.pow(1 - intro, 3);
      const r = baseR * eased;
      canvas.style.opacity = intro * 0.75;
      ctx.clearRect(0, 0, w, h);

      const projection = geoOrthographic()
        .scale(r)
        .translate([cx, cy])
        .rotate([-96 + rotation, -18, 0])
        .clipAngle(90);

      const path = geoPath(projection, ctx);

      // Globe fill
      ctx.beginPath();
      path({ type: 'Sphere' });
      const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.05, cx, cy, r);
      grad.addColorStop(0, 'rgba(74,222,128,0.04)');
      grad.addColorStop(1, 'rgba(74,222,128,0.01)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Outer ring
      ctx.beginPath();
      path({ type: 'Sphere' });
      ctx.strokeStyle = 'rgba(74,222,128,0.18)';
      ctx.lineWidth   = 0.8;
      ctx.stroke();

      // Graticule
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = 'rgba(74,222,128,0.07)';
      ctx.lineWidth   = 0.4;
      ctx.stroke();

      // Land
      if (land) {
        ctx.beginPath();
        path(land);
        ctx.fillStyle   = 'rgba(74,222,128,0.05)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(74,222,128,0.4)';
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }

      rotation += 0.04;
      animId = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        0,
      }}
    />
  );
}