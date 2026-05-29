'use client';

import { useEffect, useRef } from 'react';
import { geoOrthographic, geoPath, geoGraticule } from 'd3-geo';
import * as topojson from 'topojson-client';

export default function GlobeBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    let animId;
    let rotation = 0;
    let intro = 0;
    let land = null;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    fetch('/countries.json')
      .then((r) => r.json())
      .then((world) => {
        land = topojson.feature(world, world.objects.countries);
        requestAnimationFrame(draw);
      });

    const graticule = geoGraticule()();

    function isDarkMode() {
      return document.documentElement.classList.contains('dark');
    }

    function draw() {
      const dark = isDarkMode();

      const w = canvas.width;
      const h = canvas.height;

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

      const globeFillStart = dark
        ? 'rgba(74,222,128,0.04)'
        : 'rgba(21,128,61,0.10)';

      const globeFillEnd = dark
        ? 'rgba(74,222,128,0.01)'
        : 'rgba(21,128,61,0.03)';

      const outerRing = dark
        ? 'rgba(74,222,128,0.18)'
        : 'rgba(21,128,61,0.28)';

      const gridLines = dark
        ? 'rgba(74,222,128,0.07)'
        : 'rgba(21,128,61,0.12)';

      const landFill = dark
        ? 'rgba(74,222,128,0.05)'
        : 'rgba(21,128,61,0.08)';

      const landStroke = dark
        ? 'rgba(74,222,128,0.4)'
        : 'rgba(21,128,61,0.55)';

      ctx.beginPath();
      path({ type: 'Sphere' });

      const grad = ctx.createRadialGradient(
        cx - r * 0.2,
        cy - r * 0.2,
        r * 0.05,
        cx,
        cy,
        r
      );

      grad.addColorStop(0, globeFillStart);
      grad.addColorStop(1, globeFillEnd);

      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      path({ type: 'Sphere' });

      ctx.strokeStyle = outerRing;
      ctx.lineWidth = 0.8;

      ctx.stroke();

      ctx.beginPath();
      path(graticule);

      ctx.strokeStyle = gridLines;
      ctx.lineWidth = 0.4;

      ctx.stroke();

      if (land) {
        ctx.beginPath();
        path(land);

        ctx.fillStyle = landFill;
        ctx.fill();

        ctx.strokeStyle = landStroke;
        ctx.lineWidth = 0.6;

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
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}