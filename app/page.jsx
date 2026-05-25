'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import Footer from '@/components/Footer';

const features = [
  {
    icon: '1',
    title: 'Pay',
    description: 'Pay for the physical device, within reasonable pricing. Just lightweight product and economical solutions contribute to this price.',
  },
  {
    icon: '2',
    title: 'Install',
    description: "Your device is automatically associated to your account. The installation is simple setup.",
  },
  {
    icon: '3',
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
  const [averages, setAverages] = useState(null);
  const howItWorksRef = useRef(null);

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

  function scrollToHowItWorks(e) {
    e.preventDefault();
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <main>
      <section className="min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-16 relative overflow-hidden section-border">
        <div className="hero-glow" />
        <div className="mt-auto" />

        <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
          Tech that <span className="text-brand">speaks</span> your environment
        </h1>

        <p className="mt-5 text-neutral-500 dark:text-neutral-400 text-lg max-w-xl leading-relaxed">
          Atmos offers a physical device that lets you access actionable insights of your home or your office directly on a dashboard. This build shares meaningful optimisations for your space.
        </p>

        <div className="mt-8 flex items-center gap-4 flex-wrap justify-center">
          <Link href="/pricing" className="btn bg-brand text-brand-on-bg px-6 py-2.5 rounded-full font-medium text-sm">
            Explore
          </Link>
          <a href="#how-it-works" onClick={scrollToHowItWorks} className="arrow-link text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            <span>See how it works</span>
            <span className="arrow inline-flex items-center"><Icon name="arrowRight" /></span>
          </a>
        </div>

        <div className="mt-14 w-full max-w-3xl">
          <div className="divider-row">
            {sampleMetrics.map((m) => (
              <div key={m.label} className="p-4 text-left">
                <div className="text-2xl font-semibold tracking-tight">{m.value}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-neutral-400">Average across all connected devices over the past year</p>
        </div>

        <div className="mt-auto pt-4">
          <ScrollIndicator />
        </div>
      </section>

      <section ref={howItWorksRef} id="how-it-works" className="section-pad section-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">HOW ATMOS WORKS</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-lg mx-auto">
            We understand simple setup with consistent, powerful outcomes.
          </p>
          <div className="divider-row flex-col sm:flex-row">
            {features.map((f, i) => (
              <div key={f.title} className="px-7 py-8 flex flex-col gap-5">
                <div className="text-2xl">{f.icon}</div>
                <div>
                  <div className="text-[10px] font-mono text-brand mb-2 tracking-widest uppercase">Step 0{i + 1}</div>
                  <h3 className="font-heading font-semibold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-dark)', marginBottom: '1rem' }} className="dark:text-[var(--color-primary)]">
                What Atmos detects
              </div>
              <h2 className="font-heading text-3xl font-semibold tracking-tight mb-4">
                Every metric that matters, in one place.
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-8">
                The Atmos device is packed with precision sensors that paint a complete picture of your indoor environment — from the air you breathe to the electricity you consume.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', borderTop: '1px solid rgba(128,128,128,0.15)' }}>
                {[
                  { label: 'Temperature', desc: 'Tracks indoor thermal comfort in real time, flagging when HVAC is running wastefully.' },
                  { label: 'Humidity', desc: 'Monitors moisture levels that affect both human comfort and equipment longevity.' },
                  { label: 'Light intensity', desc: 'Measures ambient lux to detect when artificial lighting is redundant.' },
                  { label: 'Power consumption', desc: 'Reads live wattage to identify spikes, phantom loads, and energy waste.' },
                  { label: 'Voltage', desc: 'Checks supply stability to protect appliances from damaging irregularities.' },
                  { label: 'Occupancy', desc: 'Detects presence so the system knows when a room is empty and energy is being wasted.' },
                ].map((m, i) => (
                  <div key={i} style={{ padding: '1rem 0', borderBottom: '1px solid rgba(128,128,128,0.15)', display: 'flex', justifyContent: 'space-between', gap: '2rem', alignItems: 'flex-start' }}>
                    <span className="font-heading font-semibold text-sm" style={{ minWidth: '140px' }}>{m.label}</span>
                    <span className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { value: '30 sec', label: 'Data refresh on Premium', sub: 'Near real-time awareness of your space' },
                { value: '₹10/kWh', label: 'Default tariff rate', sub: 'Customisable per your electricity bill' },
                { value: '0.727 kg', label: 'CO₂ per kWh', sub: 'India grid emission factor (CEA 2023)' },
                { value: '180', label: 'kWh/m²/year', sub: 'BEE benchmark — your baseline for savings' },
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div className="font-heading font-semibold text-brand" style={{ fontSize: '1.75rem', letterSpacing: '-0.03em', lineHeight: 1, minWidth: '80px' }}>{s.value}</div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.label}</div>
                    <div className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: '0.72rem', marginTop: '0.15rem' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-dark)', marginBottom: '1rem', textAlign: 'center' }} className="dark:text-[var(--color-primary)]">
            The intelligence layer
          </div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">
            Not just data. Decisions.
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-xl mx-auto text-sm leading-relaxed">
            Raw sensor readings mean nothing without context. Atmos runs every reading through a set of intelligent rules designed by energy engineers — and tells you exactly what to do.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                category: 'Lighting',
                title: 'Lights on in an empty room',
                description: 'When the occupancy sensor shows nobody is present but power draw is well above the idle baseline, Atmos flags the waste and estimates the cost per hour.',
                tag: 'Saves up to ₹12/day per room',
              },
              {
                category: 'HVAC',
                title: 'Conditioning an unoccupied space',
                description: 'If a room has been empty for three or more consecutive readings but the temperature is drifting outside the 22–30°C comfort band, something is actively heating or cooling nobody.',
                tag: 'Common in offices after 6 PM',
              },
              {
                category: 'Lighting',
                title: 'Daylight harvesting',
                description: 'When natural light exceeds 400 lux — the standard for comfortable work — and artificial lights are still on, Atmos prompts you to switch them off.',
                tag: '400 lux threshold (IS 3646)',
              },
              {
                category: 'Power',
                title: 'Phantom load detection',
                description: 'If a room has been empty for four or more hours and is still drawing more than 80 W, appliances have been left on. Atmos calculates the exact cost since the room emptied.',
                tag: 'Standby floor: 80 W',
              },
              {
                category: 'Power',
                title: 'Statistical anomaly detection',
                description: 'Atmos builds a baseline of normal power draw for each hour of each day of the week. When current draw is more than 2.5 standard deviations above that baseline, it raises an alert.',
                tag: 'Z-score > 2.5 threshold',
              },
              {
                category: 'HVAC',
                title: 'Natural ventilation opportunity',
                description: 'When outdoor conditions are cooler and dry, running air conditioning is wasteful. Atmos cross-references indoor temperature with outdoor weather data to flag this.',
                tag: 'Requires Weather API',
              },
              {
                category: 'Trends',
                title: 'Week-over-week consumption rise',
                description: 'If energy use this week is more than 8% higher than last week with no change in occupancy patterns, something has changed — a new appliance, or a failing one.',
                tag: '8% threshold',
              },
              {
                category: 'Trends',
                title: 'Predictive degradation signal',
                description: 'By fitting a linear regression to power draw during occupied hours over 14 days, Atmos can detect a consistent upward trend — the signature of equipment that is slowly failing.',
                tag: 'R² > 0.6 confidence filter',
              },
            ].map((r, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                    padding: '0.2rem 0.6rem', borderRadius: '9999px',
                    background: r.category === 'Lighting' ? 'rgba(234,179,8,0.12)' : r.category === 'HVAC' ? 'rgba(96,165,250,0.12)' : r.category === 'Power' ? 'rgba(239,68,68,0.12)' : 'rgba(167,139,250,0.12)',
                    color: r.category === 'Lighting' ? '#ca8a04' : r.category === 'HVAC' ? '#60a5fa' : r.category === 'Power' ? '#ef4444' : '#a78bfa',
                  }}>
                    {r.category}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#737373' }}>{r.tag}</span>
                </div>
                <h3 className="font-heading font-semibold" style={{ fontSize: '0.95rem' }}>{r.title}</h3>
                <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: '0.82rem', lineHeight: 1.7 }}>{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-dark)', marginBottom: '1rem', textAlign: 'center' }} className="dark:text-[var(--color-primary)]">
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
              <div key={i} className="card" style={{ padding: '2rem', borderRadius: 0, border: 'none' }}>
                <div className="font-heading font-semibold text-brand" style={{ fontSize: '2rem', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.5rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>{s.label}</div>
                <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: '0.78rem', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-dark)', marginBottom: '1rem', textAlign: 'center' }} className="dark:text-[var(--color-primary)]">
            Built for India
          </div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">
            Designed around Indian infrastructure.
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-xl mx-auto text-sm leading-relaxed">
            Atmos is not a generic global product retrofitted for India. Every threshold, benchmark, and regulation baked into the system is specific to the Indian context.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'Indian voltage standards',
                description: 'Atmos monitors supply voltage against the Indian standard of 220V ±5% (210–245V). Irregularities reduce appliance efficiency and are flagged immediately.',
              },
              {
                title: 'BEE energy benchmarks',
                description: 'The Bureau of Energy Efficiency publishes benchmarks of 180 kWh/m²/year for commercial buildings. Atmos uses this as your savings baseline out of the box.',
              },
              {
                title: 'MNRE subsidy eligibility',
                description: 'The Ministry of New and Renewable Energy runs subsidy schemes that many building owners are unaware of. Atmos automatically checks your eligibility.',
              },
              {
                title: 'ADEETIE incentives',
                description: 'State-level energy efficiency incentives vary significantly. Atmos keeps track so you don\'t have to — and surfaces relevant schemes directly in your dashboard.',
              },
              {
                title: 'BRSR compliance',
                description: 'Listed companies must submit Business Responsibility and Sustainability Reports. Premium generates these automatically from your energy data.',
              },
              {
                title: 'CEA emission factors',
                description: 'CO₂ calculations use the Central Electricity Authority\'s official grid emission factor, ensuring your carbon reporting is defensible and accurate.',
              },
            ].map((f, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem' }}>
                <h3 className="font-heading font-semibold text-brand" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: '0.82rem', lineHeight: 1.7 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-dark)', marginBottom: '1rem', textAlign: 'center' }} className="dark:text-[var(--color-primary)]">
            Who it's for
          </div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">
            From single rooms to entire campuses.
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-xl mx-auto text-sm leading-relaxed">
            Atmos scales from a student hostel room to a multi-building corporate campus. The hardware is the same. The intelligence adapts.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>
            {[
              {
                type: 'Homes and apartments',
                description: 'Track your electricity bill drivers, detect wasteful habits, and get simple suggestions — without needing an electrician or an energy audit.',
                plan: 'Spark or Basic',
              },
              {
                type: 'Co-working spaces and offices',
                description: 'Monitor occupancy-driven waste across multiple rooms. Automate HVAC recommendations. Generate reports for sustainability commitments.',
                plan: 'Basic or Premium',
              },
              {
                type: 'Schools and colleges',
                description: 'Deploy across classrooms and labs. Demonstrate energy awareness to students. Qualify for educational energy efficiency grants.',
                plan: 'Premium',
              },
              {
                type: 'Hospitals and clinics',
                description: 'Continuous monitoring of temperature and humidity is critical for patient safety. Atmos adds an energy efficiency layer on top of compliance.',
                plan: 'Premium',
              },
              {
                type: 'Industrial and manufacturing',
                description: 'Power anomaly detection and predictive maintenance signals are especially valuable where equipment failure has large downstream costs.',
                plan: 'Premium or Enterprise',
              },
              {
                type: 'Real estate portfolios',
                description: 'Multi-building portfolio view, white-label reporting, and dedicated account management for property managers overseeing large estates.',
                plan: 'Enterprise',
              },
            ].map((u, i) => (
              <div key={i} className="card" style={{ padding: '1.25rem 1.75rem', display: 'grid', gridTemplateColumns: '2fr 3fr 1fr', gap: '1.5rem', alignItems: 'center', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
                <div className="font-heading font-semibold" style={{ fontSize: '0.9rem' }}>{u.type}</div>
                <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: '0.8rem', lineHeight: 1.65 }}>{u.description}</p>
                <div style={{ textAlign: 'right', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-primary-dark)' }} className="dark:text-[var(--color-primary)] whitespace-nowrap">{u.plan}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-dark)', marginBottom: '1rem', textAlign: 'center' }} className="dark:text-[var(--color-primary)]">
            Data flow
          </div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">
            From sensor to insight in seconds.
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-xl mx-auto text-sm leading-relaxed">
            Every component in the Atmos pipeline is purpose-built for reliability and speed.
          </p>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: '0', position: 'relative' }}>
            {[
              {
                step: '01',
                title: 'Sensor',
                description: 'The Atmos device reads temperature, humidity, power, light, voltage, and occupancy at configurable intervals.',
              },
              {
                step: '02',
                title: 'Transmission',
                description: 'Readings are pushed over Wi-Fi to a cloud-hosted spreadsheet that acts as the raw data store.',
              },
              {
                step: '03',
                title: 'Processing',
                description: 'The Atmos engine fetches your data, runs it through the full rule set, and computes optimisations and environmental counters.',
              },
              {
                step: '04',
                title: 'Dashboard',
                description: 'Results appear on your personalised dashboard — recommendations, charts, savings, and alerts — ready to act on.',
              },
            ].map((s, i, arr) => (
              <div key={i} className="card" style={{ flex: 1, padding: '1.5rem', borderRadius: 0, borderRight: i < arr.length - 1 ? 'none' : undefined, borderLeft: i > 0 ? 'none' : undefined }}>
                <div className="font-heading text-brand" style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.75rem' }}>{s.step}</div>
                <h3 className="font-heading font-semibold" style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: '0.78rem', lineHeight: 1.7 }}>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-3xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-dark)', marginBottom: '1rem', textAlign: 'center' }} className="dark:text-[var(--color-primary)]">
            Common questions
          </div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-12">
            Things worth knowing.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0', borderTop: '1px solid rgba(128,128,128,0.15)' }}>
            {[
              {
                q: 'Do I need a professional to install the device?',
                a: 'No. The Atmos device is plug-and-play. You connect it to Wi-Fi through the dashboard and it begins transmitting data immediately. No electrician, no drilling, no disruption.',
              },
              {
                q: 'How accurate are the energy savings estimates?',
                a: 'Savings estimates are calculated from your actual sensor readings using real tariff rates. They are estimates — not guarantees — because they depend on assumptions about how long a wasteful condition would have continued. Over time, as the system learns your patterns, estimates become more precise.',
              },
              {
                q: 'What happens if my Wi-Fi goes down?',
                a: 'The device buffers readings locally and syncs them when connectivity is restored. Short outages of a few hours will not result in data loss.',
              },
              {
                q: 'Can I use Atmos without the hardware?',
                a: 'No. The dashboard and analytics engine require live sensor data. There is no simulation or demo mode — the system is designed around real environmental readings.',
              },
              {
                q: 'Is my energy data shared with anyone?',
                a: 'Never. Your data is used exclusively to generate insights for you. It is not sold, shared, or used for any purpose beyond the service. See our Privacy Policy for full details.',
              },
              {
                q: 'How is Atmos different from a smart plug or a basic energy monitor?',
                a: 'A smart plug measures power. Atmos measures power and correlates it with temperature, humidity, light, and occupancy — then interprets all of it together. The difference is between knowing that you used 3 kWh today and knowing exactly why, and exactly what to change.',
              },
            ].map((item, i) => (
              <div key={i} style={{ padding: '1.5rem 0', borderTop: '1px solid rgba(128,128,128,0.15)' }}>
                <h3 className="font-heading font-semibold" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{item.q}</h3>
                <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: '0.82rem', lineHeight: 1.75 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl font-semibold tracking-tight mb-3">Optimise your space!</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-7">India's premier energy optimisation tech, built for homes and offices alike. Get the hardware and hear what the walls of your room have to say.</p>
          <Link href="/signup" className="btn inline-flex bg-brand text-brand-on-bg px-8 py-2.5 rounded-full font-medium text-sm">
            Debug your space
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}