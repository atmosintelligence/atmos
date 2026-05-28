'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import Footer from '@/components/Footer';
import GlobeBackground from '@/components/GlobeBackground';
import RevealSection from '@/components/RevealSection';
import CarbonFlow from '@/components/CarbonFlow';
import WanderingGlow from '@/components/WanderingGlow';
import CarbonBubbles from '@/components/CarbonBubbles';

const features = [
  {
    title: 'Pay',
    description: 'Pay for the physical device, within reasonable pricing. Just lightweight product and economical solutions contribute to this price.',
  },
  {
    title: 'Install',
    description: "Your device is automatically associated to your account. The installation is simple setup.",
  },
  {
    title: 'Optimize',
    description: "The rest of the work is ours. You'll find improvements and relevant data directly in your dashboard!",
  },
];

function ScrollIndicator() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className={`flex flex-col items-center gap-1.5 text-neutral-400 transition-opacity duration-500 mb-10 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <span className="text-xs tracking-widest uppercase">Scroll</span>
      <Icon name="arrowDown" className="animate-bounce" />
    </div>
  );
}

export default function HomePage() {
  const [averages, setAverages] = useState({
    temperature: 26.3,
    humidity: 59.6,
    power: 206.8,
    light: 294.5
  });

  useEffect(() => {
    fetch('/api/averages')
      .then(r => r.json())
      .then(setAverages)
      .catch(() => {});
  }, []);

  const sampleMetrics = [
    { label: 'Temperature', value: averages?.temperature ? `${averages.temperature}°C` : '—' },
    { label: 'Humidity',    value: averages?.humidity    ? `${averages.humidity}%`      : '—' },
    { label: 'Power',       value: averages?.power       ? `${averages.power} W`        : '—' },
    { label: 'Light',       value: averages?.light       ? `${averages.light} lux`      : '—' },
  ];

  const scrollToHowAtmosWorks = (e) => {
    e.preventDefault();

    document
      .getElementById('how-atmos-works')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main>
      <section className="min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-16 relative overflow-hidden section-border">
        <div className="hero-glow" />
        <GlobeBackground />
        <CarbonFlow />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(52,211,105,0.14),transparent_45%)] pointer-events-none" />

        <div
          className="relative z-[1] flex flex-col items-center text-center w-full min-h-[calc(100dvh-4rem)]"
        >
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-transparent border-0">
              <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.28em] text-brand font-semibold">
                Sense · Optimise · Act
              </span>
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.02] max-w-4xl">
              Tech that <span className="text-brand">speaks</span> your environment
            </h1>

            <p className="mt-6 text-neutral-300/90 text-lg max-w-2xl leading-relaxed">
              Plug in a compact Atmos sensor, stream live building data to the cloud,
              and uncover exactly where electricity is being wasted, ranked by rupee savings.
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
                className="arrow-link text-sm text-neutral-400 hover:text-neutral-100 transition-colors inline-flex items-center gap-2 select-none"
              >
                <span>See how it works</span>

                <span className="arrow inline-flex items-center">
                  <Icon name="arrowRight" />
                </span>
              </a>
            </div>

            <div className="mt-16 w-full max-w-5xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sampleMetrics.map((m) => (
                  <div
                    key={m.label}
                    className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl px-5 py-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brand/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent opacity-70" />

                    <div className="relative flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-brand animate-pulse shadow-[0_0_12px_rgba(52,211,105,0.9)]" />

                        <span className="text-[10px] uppercase tracking-[0.18em] text-brand/90 font-medium">
                          Live
                        </span>
                      </div>

                      <div className="text-brand/70">
                        {m.label === 'Temperature' && <Icon name="thermometer" />}
                        {m.label === 'Humidity' && <Icon name="droplet" />}
                        {m.label === 'Power' && <Icon name="zap" />}
                        {m.label === 'Light' && <Icon name="lightbulb" />}
                      </div>
                    </div>

                    <div className="relative text-3xl font-semibold tracking-tight text-neutral-100">
                      {m.value}
                    </div>

                    <div className="relative text-xs text-neutral-500 mt-1 tracking-wide">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-500">
                <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />

                <span>Live sensor readings</span>
              </div>
            </div>
          </div>

          <div id="how-atmos-works" className="pb-10">
            <ScrollIndicator />
          </div>
        </div>
      </section>

      <RevealSection
        className="section-pad section-border overflow-hidden"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_520px] gap-20 items-center">
            <div>
              <h2 className="font-heading text-3xl font-semibold tracking-tight mb-3">
                HOW ATMOS WORKS
              </h2>

              <p className="text-neutral-500 dark:text-neutral-400 mb-12 max-w-lg">
                We understand simple setup with consistent, powerful outcomes.
              </p>

              <div className="divider-row flex-col">
                {features.map((f, i) => (
                  <div
                    key={f.title}
                    className="px-5 py-5 flex flex-col gap-3"
                  >
                    <div className="text-[11px] font-mono text-brand tracking-[0.18em] uppercase">
                      STEP 0{i + 1}
                    </div>

                    <div>
                      <h3 className="font-heading font-semibold text-sm mb-1">
                        {f.title}
                      </h3>

                      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md">
                        {f.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:flex justify-end">
              <div
                className="group relative transition-all duration-500 ease-out hover:scale-[1.04]"
                style={{
                  transform: 'perspective(1800px) rotateY(-18deg) rotateX(4deg)',
                  transformStyle: 'preserve-3d',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    'perspective(1800px) rotateY(0deg) rotateX(0deg) scale(1.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    'perspective(1800px) rotateY(-18deg) rotateX(4deg)';
                }}
              >
                <div
                  className="absolute inset-0 rounded-[2rem] bg-brand/10 blur-3xl opacity-60 scale-90"
                />
                <div
                  className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0f0f] shadow-2xl backdrop-blur-xl"
                >
                  <img
                    src="/hero_1.png"
                    alt="Atmos dashboard preview"
                    className="w-[520px] h-auto object-cover select-none"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="section-pad section-border overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,105,0.08),transparent_40%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-[1]">
          <div className="grid lg:grid-cols-[520px_1fr] gap-16 items-start">

            <div className="relative hidden lg:block">
              <div className="sticky top-28">
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0f0f] shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent z-[1]" />

                  <img
                    src="/hero_2.png"
                    alt="Atmos dashboard showing live energy optimization insights"
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
                  <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0f0f0f] shadow-xl">
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
                      Actionable alerts that can be marked as acknowledged
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div
                style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}
                className="dark:text-[var(--color-primary)]"
              >
                The intelligence layer
              </div>

              <h2 className="font-heading text-3xl font-semibold tracking-tight mb-4">
                From signals to savings.
              </h2>

              <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-sm leading-relaxed mb-10">
                Atmos doesn't just collect data. It interprets behaviour across lighting, HVAC, and power usage to surface exactly where energy is being wasted and what to fix first.
              </p>

              <div className="space-y-4">
                {[
                  {
                    category: 'Lighting',
                    title: 'Lights running in empty rooms',
                    description: 'Detects occupancy mismatch and quantifies unnecessary lighting cost in real time.',
                    tag: 'Occupancy-aware',
                  },
                  {
                    category: 'HVAC',
                    title: 'Cooling or heating unused spaces',
                    description: 'Identifies HVAC usage in vacant zones and flags avoidable energy loss.',
                    tag: 'HVAC analysis',
                  },
                  {
                    category: 'Power',
                    title: 'Hidden standby consumption',
                    description: 'Finds devices drawing power even when not actively in use.',
                    tag: 'Standby detection',
                  },
                  {
                    category: 'Trends',
                    title: 'Unusual consumption patterns',
                    description: 'Compares live usage against historical baselines to detect anomalies early.',
                    tag: 'Anomaly detection',
                  },
                  {
                    category: 'Lighting',
                    title: 'Daylight underutilisation',
                    description: 'Highlights opportunities to reduce artificial lighting during sufficient natural light.',
                    tag: 'Lux-aware',
                  },
                  {
                    category: 'HVAC',
                    title: 'Outdoor climate advantage missed',
                    description: 'Suggests ventilation opportunities when external conditions make AC unnecessary.',
                    tag: 'Weather-linked',
                  },
                ].map((r, i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 transition-all duration-200 hover:-translate-y-1"
                    style={{
                      padding: '1.2rem 1.3rem',
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          r.category === 'Lighting'
                            ? 'linear-gradient(to right, rgba(234,179,8,0.08), transparent)'
                            : r.category === 'HVAC'
                            ? 'linear-gradient(to right, rgba(96,165,250,0.08), transparent)'
                            : r.category === 'Power'
                            ? 'linear-gradient(to right, rgba(239,68,68,0.08), transparent)'
                            : 'linear-gradient(to right, rgba(167,139,250,0.08), transparent)',
                      }}
                    />

                    <div className="relative flex items-start gap-4">

                      <div
                        style={{
                          width: '0.8rem',
                          height: '0.8rem',
                          marginTop: '0.35rem',
                          borderRadius: '9999px',
                          flexShrink: 0,
                          background:
                            r.category === 'Lighting'
                              ? '#eab308'
                              : r.category === 'HVAC'
                              ? '#60a5fa'
                              : r.category === 'Power'
                              ? '#ef4444'
                              : '#a78bfa',
                        }}
                      />

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4 mb-1.5">
                          <h3 className="font-heading font-semibold text-sm">
                            {r.title}
                          </h3>

                          <span
                            style={{
                              fontSize: '0.62rem',
                              padding: '0.25rem 0.55rem',
                              borderRadius: '9999px',
                              background:
                                r.category === 'Lighting'
                                  ? 'rgba(234,179,8,0.12)'
                                  : r.category === 'HVAC'
                                  ? 'rgba(96,165,250,0.12)'
                                  : r.category === 'Power'
                                  ? 'rgba(239,68,68,0.12)'
                                  : 'rgba(167,139,250,0.12)',

                              color:
                                r.category === 'Lighting'
                                  ? '#ca8a04'
                                  : r.category === 'HVAC'
                                  ? '#60a5fa'
                                  : r.category === 'Power'
                                  ? '#ef4444'
                                  : '#a78bfa',
                            }}
                          >
                            {r.tag}
                          </span>
                        </div>

                        <p
                          className="text-neutral-500 dark:text-neutral-400"
                          style={{
                            fontSize: '0.8rem',
                            lineHeight: 1.6,
                          }}
                        >
                          {r.description}
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

      <RevealSection className="section-pad section-border relative overflow-hidden">
        <CarbonBubbles />
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-dark)', marginBottom: '1rem', textAlign: 'center' }} className="dark:text-[var(--color-primary)]">
            Environmental impact
          </div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">
            Energy saved is carbon avoided.
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-xl mx-auto text-sm leading-relaxed">
            Every kilowatt-hour your building does not consume is a kilowatt-hour the grid does not have to generate. Atmos tracks your impact in terms that matter.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>
            {[
              { value: '0.727 kg', label: 'CO₂ per kWh', desc: 'India\'s current grid emission factor per the Central Electricity Authority.' },
              { value: '24 kg', label: 'CO₂ per tree per year', desc: 'One mature urban tree absorbs approximately 24 kg of CO₂ annually (FAO).' },
              { value: '60%', label: 'Carbon credit proceeds to you', desc: 'On Premium, Atmos automates carbon credit sales and returns 60% of revenue to your account.' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-[#0f0f0f]" style={{ padding: '2rem' }}>
                <div className="font-heading font-semibold text-brand" style={{ fontSize: '2rem', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.5rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>{s.label}</div>
                <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: '0.78rem', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-primary-dark)',
              marginBottom: '1rem',
              textAlign: 'center',
            }}
            className="dark:text-[var(--color-primary)]"
          >
            Of Indian origin
          </div>

          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">
            Designed for real-world Indian infrastructure.
          </h2>

          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-xl mx-auto text-sm leading-relaxed">
            Atmos is engineered while keeping Indian buildings, regulations, and power conditions in mind. Every benchmark, threshold, and insight is aligned with on-ground realities, and not global assumptions.
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'Voltage stability (India grid)',
                description:
                  'Continuously tracks 220V ±5% fluctuations (210–245V range). Detects instability that reduces appliance efficiency and lifespan.',
              },
              {
                title: 'BEE efficiency benchmarks',
                description:
                  'Uses Bureau of Energy Efficiency standards (180 kWh/m²/year) as a baseline to measure savings and inefficiency.',
              },
              {
                title: 'MNRE subsidy mapping',
                description:
                  'Automatically identifies eligibility for renewable energy and efficiency subsidies under MNRE schemes.',
              },
              {
                title: 'State energy incentives',
                description:
                  'Tracks evolving state-level efficiency programs and highlights applicable financial incentives in real time.',
              },
              {
                title: 'BRSR reporting support',
                description:
                  'Generates structured sustainability and ESG reports aligned with Business Responsibility & Sustainability Reporting norms.',
              },
              {
                title: 'CEA emission factors',
                description:
                  'Uses official Central Electricity Authority grid emission data for accurate and audit-ready carbon calculations.',
              },
            ].map((f, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem' }}>
                <h3
                  className="font-heading font-semibold text-brand"
                  style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-neutral-500 dark:text-neutral-400"
                  style={{ fontSize: '0.82rem', lineHeight: 1.7 }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-primary-dark)',
              marginBottom: '1rem',
              textAlign: 'center',
            }}
            className="dark:text-[var(--color-primary)]"
          >
            How data flows
          </div>

          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">
            From sensors to insights in seconds.
          </h2>

          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-xl mx-auto text-sm leading-relaxed">
            Atmos collects real-time data from your space, processes it instantly, and turns it into clear actions you can use.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: '0',
              position: 'relative',
            }}
          >
            {[
              {
                step: '01',
                title: 'Sensing',
                description:
                  'The device captures temperature, humidity, light, power usage, voltage stability, and occupancy in real time.',
              },
              {
                step: '02',
                title: 'Transmission',
                description:
                  'Data is securely sent over Wi-Fi to a cloud database that stores raw readings for processing.',
              },
              {
                step: '03',
                title: 'Processing',
                description:
                  'The engine analyzes incoming data using predefined rules to detect waste, patterns, and inefficiencies.',
              },
              {
                step: '04',
                title: 'Insights',
                description:
                  'Findings appear on your dashboard as simple actions, alerts, and savings you can act on immediately.',
              },
            ].map((s, i, arr) => (
              <div
                key={i}
                className="card"
                style={{
                  flex: 1,
                  padding: '1.5rem',
                  borderRadius: 0,
                  borderRight: i < arr.length - 1 ? 'none' : undefined,
                  borderLeft: i > 0 ? 'none' : undefined,
                }}
              >
                <div
                  className="font-heading text-brand"
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    marginBottom: '0.75rem',
                  }}
                >
                  {s.step}
                </div>

                <h3
                  className="font-heading font-semibold"
                  style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}
                >
                  {s.title}
                </h3>

                <p
                  className="text-neutral-500 dark:text-neutral-400"
                  style={{ fontSize: '0.78rem', lineHeight: 1.7 }}
                >
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div
            style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-dark)', marginBottom: '1rem', textAlign: 'center' }}
            className="dark:text-[var(--color-primary)]"
          >
            Who it's for
          </div>

          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">
            Built to scale from homes to enterprises.
          </h2>

          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-xl mx-auto text-sm leading-relaxed">
            Whether it's a single apartment or an entire property network, Atmos adapts its intelligence to match your environment without adding complexity.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                type: 'Homes & apartments',
                icon: 'home',
                description: 'Track usage patterns, detect wasteful habits, and get simple efficiency suggestions without technical setup.',
                plan: 'Spark / Basic',
              },
              {
                type: 'Offices & co-working',
                icon: 'office',
                description: 'Reduce occupancy-based waste in lighting and HVAC with automatic insights across rooms.',
                plan: 'Basic / Premium',
              },
              {
                type: 'Schools & universities',
                icon: 'school',
                description: 'Build energy awareness across campuses and support sustainability programs with real data.',
                plan: 'Premium',
              },
              {
                type: 'Hospitals & clinics',
                icon: 'hospital',
                description: 'Maintain strict environmental conditions while optimizing energy usage safely.',
                plan: 'Premium',
              },
              {
                type: 'Industrial facilities',
                icon: 'factory',
                description: 'Detect anomalies, reduce downtime risk, and improve energy efficiency at scale.',
                plan: 'Premium / Enterprise',
              },
              {
                type: 'Real estate portfolios',
                icon: 'building',
                description: 'Centralized analytics, ESG reporting, and multi-site monitoring for large property networks.',
                plan: 'Enterprise',
              },
            ].map((u, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-5 hover:border-brand/30 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-start gap-3">
                  <div className="text-brand mt-1">
                    <Icon name={u.icon} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h3 className="font-heading font-semibold text-sm">{u.type}</h3>

                      <span className="text-[10px] px-2 py-1 rounded-full bg-brand/10 text-brand whitespace-nowrap">
                        {u.plan}
                      </span>
                    </div>

                    <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                      {u.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection className="section-pad section-border text-center relative overflow-hidden">
        <WanderingGlow />

        <div className="relative z-[1] max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl font-semibold tracking-tight mb-3">
            Optimise your space!
          </h2>

          <p className="text-neutral-500 dark:text-neutral-400 mb-7">
            India's premier energy optimisation tech, built for homes and offices alike. Get the hardware and hear what the walls of your room have to say.
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