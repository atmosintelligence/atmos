'use client';

import VideoSection from '@/components/VideoSection';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import Icon from '@/components/Icon';
import Footer from '@/components/Footer';
import TypewriterHero from '@/components/TypewriterHero';
import GlobeBackground from '@/components/GlobeBackground';
import RevealSection from '@/components/RevealSection';
import CarbonFlow from '@/components/CarbonFlow';
import WanderingGlow from '@/components/WanderingGlow';
import CarbonBubbles from '@/components/CarbonBubbles';
import AtmosWeather from '@/components/AtmosWeather';
import GraphCard from '@/components/GraphCard';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import {
  co2ChartData,
  energyChartData,
  coalChartData,
  growthChartData,
} from './data/charts';

/* ---------- small helpers ---------- */

const PATHS = {
  plug: 'M12 22v-5M9 8V2M15 8V2M18 8v5a6 6 0 0 1-12 0V8Z',
  sensor: 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5',
  ai: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  log: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0ZM12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
  layers: 'M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  code: 'm16 18 6-6-6-6M8 6l-6 6 6 6',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8Z',
  check: 'M20 6 9 17l-5-5',
  cross: 'M18 6 6 18M6 6l12 12',
};

function Glyph({ name, className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

function Eyebrow({ children, left = false }) {
  return (
    <div
      className={`text-sm font-semibold uppercase tracking-[0.12em] mb-4 text-[var(--color-primary-dark)] dark:text-[var(--color-primary)] ${left ? '' : 'text-center'}`}
    >
      {children}
    </div>
  );
}

const tick = { fill: 'rgba(255,255,255,0.45)', fontSize: 11 };
const tip = (c) => ({
  background: '#071510',
  border: `1px solid ${c}`,
  borderRadius: '1rem',
  fontSize: '0.78rem',
});
const dot = { r: 5, fill: '#34d369', stroke: '#04110a', strokeWidth: 2 };

const tiltIn = (e) => {
  e.currentTarget.style.transform =
    'perspective(1800px) rotateY(0deg) rotateX(0deg) scale(1.04)';
};
const tiltOut = (e) => {
  e.currentTarget.style.transform =
    'perspective(1800px) rotateY(-18deg) rotateX(4deg)';
};

const scrollToHowAtmosWorks = (e) => {
  e.preventDefault();
  document
    .getElementById('how-atmos-works')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function ScrollIndicator() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      className={`flex flex-col items-center gap-1.5 text-neutral-400 transition-opacity duration-500 mb-10 cursor-pointer ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={scrollToHowAtmosWorks}
    >
      <span className="text-xs tracking-widest uppercase">Scroll</span>
      <Icon name="arrowDown" className="animate-bounce" />
    </div>
  );
}

/* ---------- data ---------- */

const steps = [
  { icon: 'plug', title: 'Plug in', text: 'One-time purchase. Already linked to your account.' },
  { icon: 'sensor', title: 'Sense', text: 'Readings stream to the cloud, tuned to your location and logged.' },
  { icon: 'ai', title: 'Optimise', text: 'AI turns readings into what to fix first.' },
  { icon: 'calendar', title: 'Automate', text: 'Your calendar switches devices off when energy is wasted.' },
];

const COLORS = { Lighting: '#eab308', HVAC: '#60a5fa', Power: '#ef4444', Weather: '#34d399' };

const optimisations = [
  {
    category: 'Lighting',
    title: 'Lights on in empty rooms',
    ai: 'Reads occupancy and daylight together, then ranks the fix.',
    basic: 'Flags lights that are on when nobody is in.',
  },
  {
    category: 'HVAC',
    title: 'Cooling an unused room',
    ai: 'Spots wasted cooling and suggests when to switch off.',
    basic: 'Flags the AC running in an empty room.',
  },
  {
    category: 'Power',
    title: 'Passive consumption',
    ai: 'Learns your normal load and flags what drifts above it.',
    basic: 'Flags power drawn at idle.',
  },
  {
    category: 'Weather',
    title: 'Free ventilation',
    ai: 'Uses your local forecast to find when windows beat the AC.',
    basic: 'Flags mild outdoor weather.',
  },
];

const features = [
  { icon: 'zap', title: 'Voltage', text: 'Get alerted when power turns unstable.' },
  { icon: 'pin', title: 'Local to you', text: 'Readings and weather are tailored to your location.' },
  { icon: 'log', title: 'Fully logged', text: 'Every sensor reading and automation is recorded.' },
  { icon: 'layers', title: 'Many devices', text: 'One account runs as many devices as you need.' },
  { icon: 'shield', title: 'Private', text: 'Your data is never shared or sold.' },
  { icon: 'code', title: 'Fast API', text: 'Simple endpoints for your own tools.' },
];

const comparison = [
  'Plug-in setup, no installer',
  'Low one-time cost',
  'Tuned to Indian buildings',
  'AI-made automations in <1 sec',
];

const audiences = [
  { type: 'Homes', icon: 'home', plan: 'Spark' },
  { type: 'Workspaces', icon: 'office', plan: 'Basic' },
  { type: 'Schools', icon: 'school', plan: 'Premium' },
  { type: 'Hospitals', icon: 'hospital', plan: 'Premium' },
  { type: 'Industry', icon: 'factory', plan: 'Enterprise' },
  { type: 'Portfolios', icon: 'building', plan: 'Enterprise' },
];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const SLOTS = ['9 AM', '1 PM', '5 PM', '9 PM'];
const INITIAL = {
  Classroom: ['30', '31', '32', '33', '34'],
  Office: ['20', '21', '22', '23', '24'],
  Lab: ['10', '11', '30', '31'],
};
const AI_PICKS = {
  Classroom: ['30', '31', '32', '33', '34', '35', '36', '10', '11', '12', '13', '14', '05', '06'],
  Office: ['20', '21', '22', '23', '24', '30', '31', '32', '33', '34', '35', '36', '05', '06'],
  Lab: ['10', '11', '12', '13', '14', '30', '31', '32', '33', '34', '35', '36'],
};

/* ---------- automation calendar ---------- */

function AutomationCalendar() {
  const devices = Object.keys(INITIAL);
  const [device, setDevice] = useState(devices[0]);
  const [cells, setCells] = useState(INITIAL);
  const [busy, setBusy] = useState(false);

  const toggle = (key) =>
    setCells((prev) => {
      const list = prev[device];
      return {
        ...prev,
        [device]: list.includes(key) ? list.filter((k) => k !== key) : [...list, key],
      };
    });

  const generate = () => {
    setBusy(true);
    setTimeout(() => {
      setCells((prev) => ({ ...prev, [device]: AI_PICKS[device] }));
      setBusy(false);
    }, 600);
  };

  return (
    <div className="rounded-[1.5rem] border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-5 shadow-xl">
      <div className="flex gap-2 mb-4 flex-wrap">
        {devices.map((d) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${device === d ? 'bg-brand text-brand-on-bg' : 'border border-black/10 dark:border-white/15 text-neutral-500 dark:text-neutral-400'}`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[2.5rem_repeat(7,1fr)] gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
        <div />
        {DAYS.map((d, i) => (
          <div key={i} className="text-center">{d}</div>
        ))}
        {SLOTS.map((s, r) => (
          <div key={s} className="contents">
            <div className="flex items-center">{s}</div>
            {DAYS.map((_, c) => {
              const key = `${r}${c}`;
              const off = cells[device].includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggle(key)}
                  aria-label={`${off ? 'Remove' : 'Add'} automation`}
                  className={`h-8 rounded-md transition-colors ${off ? 'bg-brand/80' : 'bg-black/[0.05] dark:bg-white/[0.06] hover:bg-brand/20'}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="h-3 w-3 rounded bg-brand/80" /> Device switched off
        </div>
        <button
          onClick={generate}
          disabled={busy}
          className="btn inline-flex items-center gap-2 bg-brand text-brand-on-bg px-4 py-1.5 rounded-full text-xs font-medium"
        >
          <Glyph name="ai" className="w-4 h-4" />
          {busy ? 'Generating' : 'Generate with AI'}
        </button>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function HomePage() {
  const [mode, setMode] = useState('ai');

  return (
    <main>
      {/* Hero */}
      <section className="min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-16 relative overflow-hidden section-border bg-white dark:bg-black">
        <div className="hero-glow" />
        <GlobeBackground />
        <CarbonFlow />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(52,211,105,0.10),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,rgba(52,211,105,0.14),transparent_45%)] pointer-events-none" />

        <div className="relative z-[1] flex flex-col items-center text-center w-full min-h-[calc(100dvh-4rem)]">
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6">
              <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.28em] text-brand font-bold">
                Sense • Optimise • Automate
              </span>
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.02] max-w-4xl text-neutral-900 dark:text-white">
              Enhance your room. <TypewriterHero />
            </h1>

            <p className="mt-6 text-neutral-600 dark:text-neutral-300/90 text-lg max-w-2xl leading-relaxed">
              Atmos is a plug-in sensor that tracks how your space uses energy. Its AI finds the waste and automates the savings.
            </p>

            <div className="mt-10 flex items-center gap-4 flex-wrap justify-center">
              <Link
                href="/pricing"
                className="btn bg-brand text-brand-on-bg px-7 py-3 rounded-full font-medium text-sm shadow-[0_0_30px_rgba(52,211,105,0.18)]"
              >
                Explore
              </Link>

              <a
                href="#how-atmos-works"
                onClick={scrollToHowAtmosWorks}
                className="arrow-link text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors inline-flex items-center gap-2 select-none"
              >
                <span>See how it works</span>
                <span className="arrow inline-flex items-center">
                  <Icon name="arrowRight" />
                </span>
              </a>
            </div>
          </div>

          <div id="how-atmos-works" className="pb-10">
            <ScrollIndicator />
          </div>
        </div>
      </section>

      <VideoSection />

      {/* How Atmos works */}
      <RevealSection className="section-pad section-border overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_520px] gap-20 items-center">
            <div>
              <h2 className="font-heading text-3xl font-semibold tracking-tight mb-3">
                HOW ATMOS WORKS
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 mb-12 max-w-lg">
                Four steps, from box to automatic savings.
              </p>

              <div className="relative space-y-9 before:content-[''] before:absolute before:left-[1.1rem] before:top-5 before:bottom-5 before:w-px before:bg-brand/30">
                {steps.map((s) => (
                  <div key={s.title} className="relative flex gap-5 items-start">
                    <div className="relative z-[1] shrink-0 h-9 w-9 rounded-full border border-brand/40 bg-white dark:bg-black text-brand flex items-center justify-center">
                      <Glyph name={s.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-sm mb-1">{s.title}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md">
                        {s.text}
                      </p>
                      {s.title === 'Automate' && (
                        <div className="mt-3 flex gap-1.5">
                          {[1, 1, 0, 1, 1, 0, 0].map((on, i) => (
                            <span
                              key={i}
                              className={`h-5 w-5 rounded ${on ? 'bg-brand/80' : 'bg-black/[0.06] dark:bg-white/[0.08]'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:flex justify-end items-start" style={{ marginTop: '-150px' }}>
              <div
                className="group relative transition-all duration-500 ease-out hover:scale-[1.04]"
                style={{
                  transform: 'perspective(1800px) rotateY(-18deg) rotateX(4deg)',
                  transformStyle: 'preserve-3d',
                }}
                onMouseEnter={tiltIn}
                onMouseLeave={tiltOut}
              >
                <div className="absolute inset-0 rounded-[2rem] bg-brand/10 blur-3xl opacity-60 scale-90" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0f0f] shadow-2xl backdrop-blur-xl">
                  <img
                    src="/hero_1.png"
                    alt="Atmos dashboard preview"
                    className="w-[520px] h-auto object-cover select-none"
                    draggable={false}
                  />
                </div>
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '-14rem',
                  right: '-1rem',
                  zIndex: 2,
                  width: 'clamp(200px, 28vh, 260px)',
                  height: 'clamp(200px, 28vh, 260px)',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(10,10,10,0.45)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                  transition: 'transform 0.4s ease',
                  transform: 'perspective(1800px) rotateY(-18deg) rotateX(4deg)',
                  transformStyle: 'preserve-3d',
                }}
                onMouseEnter={tiltIn}
                onMouseLeave={tiltOut}
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                >
                  <source src="/movie.mp4" type="video/mp4" />
                </video>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.15), transparent)',
                  }}
                />
                <div style={{ position: 'absolute', left: '1.25rem', bottom: '1.25rem', zIndex: 1 }}>
                  <div style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4ADE80', marginBottom: '0.4rem' }}>
                    ATMOS IN ACTION
                  </div>
                  <div style={{ fontFamily: 'var(--font-syne)', fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
                    DATA PROCESSING
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.72)' }}>
                    From the hardware to the dashboard
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* AI optimisations + manual control */}
      <RevealSection className="section-pad section-border overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,105,0.08),transparent_40%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-[1]">
          <div className="grid lg:grid-cols-[520px_1fr] gap-16 items-start">
            <div className="relative hidden lg:block">
              <div className="sticky top-28">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0f0f] shadow-2xl transition-all duration-500 ease-out hover:scale-[1.04]">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent z-[1]" />
                  <img
                    src="/hero_2.png"
                    alt="Atmos dashboard showing live energy optimisation insights"
                    className="w-full h-auto object-cover select-none"
                    draggable={false}
                  />
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 tracking-wide">
                    Live optimisation engine running in real time
                  </span>
                </div>

                <div className="mt-8">
                  <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0f0f0f] shadow-xl transition-all duration-500 ease-out hover:scale-[1.04]">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent z-[1]" />
                    <img
                      src="/hero_3.png"
                      alt="Energy alerts and recommendations dashboard"
                      className="w-full h-auto object-cover select-none"
                      draggable={false}
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 tracking-wide">
                      Alerts you can mark as acknowledged
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Eyebrow left>AI-powered</Eyebrow>

              <h2 className="font-heading text-3xl font-semibold tracking-tight mb-4">
                Get Optimisations
              </h2>

              <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-sm leading-relaxed mb-6">
                AI reads your lighting, ventilation, power and local weather, then tells you what to fix first.
              </p>

              <div className="inline-flex items-center gap-1 p-1 rounded-full border border-black/10 dark:border-white/15 mb-2">
                {[
                  { id: 'ai', label: 'AI-driven' },
                  { id: 'basic', label: 'Rule-based' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${mode === m.id ? 'bg-brand text-brand-on-bg' : 'text-neutral-500 dark:text-neutral-400'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-8">
                Switch anytime. You stay in control.
              </p>

              <div className="space-y-3">
                {optimisations.map((r) => (
                  <div
                    key={r.title}
                    className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="h-3 w-3 mt-1 rounded-full shrink-0"
                        style={{ background: COLORS[r.category] }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <h3 className="font-heading font-semibold text-sm">{r.title}</h3>
                          <span
                            className="text-[10px] px-2 py-1 rounded-full whitespace-nowrap"
                            style={{
                              background: `${COLORS[r.category]}22`,
                              color: COLORS[r.category],
                            }}
                          >
                            {mode === 'ai' ? 'AI' : 'Rule-based'}
                          </span>
                        </div>
                        <p className="text-neutral-500 dark:text-neutral-400 text-[0.8rem] leading-relaxed">
                          {mode === 'ai' ? r.ai : r.basic}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Automations */}
      <RevealSection className="section-pad section-border relative overflow-hidden">
        <AtmosWeather />

        <div className="max-w-5xl mx-auto relative z-[2]">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AutomationCalendar />

            <div>
              <Eyebrow left>Automations</Eyebrow>

              <h2 className="font-heading text-3xl font-semibold tracking-tight mb-4">
                Your calendar switches things off for you.
              </h2>

              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-8 max-w-md">
                Pick the slots when a device should be off. Tap any block to try it.
              </p>

              <div className="space-y-5">
                {[
                  { icon: 'ai', title: 'AI-made schedules', text: 'Qwen 3.8 builds one from your optimisations in under a second.' },
                  { icon: 'sliders', title: 'Full control', text: 'Edit any device, any slot, or turn AI off.' },
                  { icon: 'log', title: 'Always logged', text: 'Every automation is recorded alongside your readings.' },
                ].map((p) => (
                  <div key={p.title} className="flex gap-4 items-start">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                      <Glyph name={p.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-sm mb-0.5">{p.title}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{p.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Competition + features */}
      <RevealSection className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <Eyebrow>Of Indian origin</Eyebrow>

          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">
            Better than Siemens and Honeywell.
          </h2>

          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm leading-relaxed">
            Built around Indian buildings, regulations and power conditions, not global assumptions.
          </p>

          <div className="max-w-3xl mx-auto mb-14 rounded-[1.5rem] border border-black/8 dark:border-white/10 overflow-hidden text-sm">
            <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] bg-black/[0.03] dark:bg-white/[0.04] font-heading font-semibold text-xs">
              <div className="p-4" />
              <div className="p-4 text-center text-brand bg-brand/10">Atmos</div>
              <div className="p-4 text-center">Siemens</div>
              <div className="p-4 text-center">Honeywell</div>
            </div>
            {comparison.map((row) => (
              <div
                key={row}
                className="grid grid-cols-[1.6fr_1fr_1fr_1fr] border-t border-black/8 dark:border-white/10 items-center"
              >
                <div className="p-4 text-neutral-600 dark:text-neutral-300">{row}</div>
                <div className="p-4 flex justify-center bg-brand/10 text-brand">
                  <Glyph name="check" />
                </div>
                <div className="p-4 flex justify-center text-neutral-400">
                  <Glyph name="cross" />
                </div>
                <div className="p-4 flex justify-center text-neutral-400">
                  <Glyph name="cross" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card" style={{ padding: '1.5rem' }}>
                <div className="text-brand mb-3">
                  <Glyph name={f.icon} />
                </div>
                <h3 className="font-heading font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-[0.82rem] leading-relaxed">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* What you get */}
      <RevealSection className="section-pad section-border">
        <CarbonBubbles />
        <div className="max-w-5xl mx-auto">
          <Eyebrow>What you get</Eyebrow>

          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">
            Per building. Per year.
          </h2>

          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-14 max-w-2xl mx-auto text-sm leading-relaxed">
            Based on BEE and CEA benchmarks, for a typical building with Atmos installed.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10">
            {[
              { value: '33,000 kWh', title: 'Energy saved', upto: true },
              { value: '₹3.3 L', title: 'Money saved', upto: true },
              { value: '24 tons', title: 'CO₂ cut', upto: true },
              { value: '₹0', title: 'Installation cost', upto: false },
            ].map((item) => (
              <div
                key={item.title}
                className="px-4 text-center flex flex-col items-center lg:border-r last:border-r-0 border-black/8 dark:border-white/10"
              >
                <div className="text-[10px] uppercase tracking-[0.14em] text-brand font-semibold mb-1 h-[14px]">
                  {item.upto ? 'Up to' : ''}
                </div>
                <div className="font-heading text-brand text-[2.2rem] font-semibold leading-none tracking-tight mb-3">
                  {item.value}
                </div>
                <div className="text-xs font-semibold">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* Impact projections */}
      <RevealSection className="section-pad section-border">
        <div className="max-w-4xl mx-auto">
          <Eyebrow>Impact projections</Eyebrow>

          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">
            Environmental impact at scale.
          </h2>

          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-2xl mx-auto text-sm leading-relaxed">
            Projected over a five-year growth period.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            <GraphCard
              title="CO₂ avoided per year"
              description="CO₂ avoided over the years"
              data={co2ChartData.labels.map((label, i) => ({
                year: label,
                value: co2ChartData.co2[i],
                cars: co2ChartData.cars[i],
              }))}
            />

            <GraphCard
              title="Energy savings"
              description="Shown for 500 buildings"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyChartData} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="year" tick={tick} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={tick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}L`}
                  />
                  <Tooltip
                    contentStyle={tip('rgba(240,192,64,0.2)')}
                    formatter={(v) => [`${v} lakh kWh`, 'Saved']}
                  />
                  <Line
                    type="monotone"
                    dataKey="saved"
                    stroke="#34d369"
                    strokeWidth={3}
                    dot={dot}
                    activeDot={{ r: 7, fill: '#34d369' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </GraphCard>

            <GraphCard
              title="Resources conserved"
              description="Tonnes conserved in 5 years"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={coalChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 30, bottom: 0 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tick={tick} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ ...tick, fill: 'rgba(255,255,255,0.55)' }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(52,211,105,0.06)' }}
                    contentStyle={tip('rgba(52,211,105,0.18)')}
                    formatter={(value) => [`${value.toLocaleString()} tonnes avoided`, 'Year 5 impact']}
                  />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]} fill="rgba(52,211,105,0.82)" />
                </BarChart>
              </ResponsiveContainer>
            </GraphCard>

            <div className="relative overflow-hidden rounded-[2rem] border border-black/8 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] backdrop-blur-xl p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="relative">
                <h3 className="font-heading text-base font-semibold tracking-tight mb-1">
                  Growth trajectory
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  Buildings and CO₂ avoided, year by year
                </p>

                <div className="w-full h-[13rem] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="year" tick={tick} axisLine={false} tickLine={false} />
                      <YAxis
                        yAxisId="left"
                        tick={tick}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => v.toLocaleString()}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={tick}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                      />
                      <Tooltip
                        contentStyle={tip('rgba(52,211,105,0.2)')}
                        formatter={(value, name) => [Number(value).toLocaleString(), name]}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="co2"
                        name="CO₂"
                        stroke="rgba(255,255,255,0.45)"
                        strokeWidth={3}
                        strokeDasharray="8 4"
                        dot={{ ...dot, fill: 'rgba(255,255,255,0.45)' }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="buildings"
                        name="Buildings"
                        stroke="#34d369"
                        strokeWidth={3}
                        dot={dot}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Who it's for */}
      <RevealSection className="section-pad section-border">
        <div className="max-w-4xl mx-auto">
          <Eyebrow>Who it's for</Eyebrow>

          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-12">
            From homes to enterprises.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {audiences.map((u) => (
              <div
                key={u.type}
                className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-5 flex flex-col items-center text-center gap-3 hover:border-brand/30 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="text-brand">
                  <Icon name={u.icon} />
                </div>
                <h3 className="font-heading font-semibold text-sm">{u.type}</h3>
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-brand/10 text-brand tracking-wide">
                  {u.plan}
                </span>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* CTA */}
      <RevealSection className="section-pad section-border text-center relative overflow-hidden">
        <WanderingGlow />

        <div className="relative z-[1] max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl font-semibold tracking-tight mb-3">
            Don't just look at it. Go touch it!
          </h2>

          <p className="text-neutral-500 dark:text-neutral-400 mb-7">
            Try the dashboard first-hand, no account needed, in Demo Mode.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/dashboard"
              className="btn inline-flex bg-brand text-brand-on-bg px-8 py-2.5 rounded-full font-medium text-sm"
            >
              Enter Demo Mode
            </Link>
            <Link
              href="/signup"
              className="btn inline-flex bg-brand text-brand-on-bg px-8 py-2.5 rounded-full font-medium text-sm"
            >
              Sign up
            </Link>
          </div>
        </div>
      </RevealSection>

      <Footer />
    </main>
  );
}
