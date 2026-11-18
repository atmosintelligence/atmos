import Link from 'next/link';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';

export const metadata = { title: 'AI' };

const TODAY = [
  {
    icon: 'ai',
    tag: 'Live',
    title: 'Advice in plain words',
    text: 'Our AI reads what the sensor saw and what our engine found, then writes one short, specific recommendation for your room, with the reason and what it is costing you in rupees.',
  },
  {
    icon: 'calendar',
    tag: 'Live',
    title: 'Plan with AI',
    text: 'One tap and the AI studies a month of how your room is really used, then plans when each smart device should switch off. You can edit or delete any rule it makes.',
  },
  {
    icon: 'shield',
    tag: 'Live',
    title: 'Checked before you see it',
    text: 'Every rupee figure the AI quotes is worked out again by our own code from your tariff and readings. Anything that does not add up is dropped, never shown.',
  },
];

const FLOW = [
  { icon: 'sensor',   title: 'Sense',   text: 'Light, temperature, humidity and occupancy, every few minutes.' },
  { icon: 'gauge',    title: 'Find',    text: 'Our engine spots lights, ACs and idle devices running for nobody.' },
  { icon: 'ai',       title: 'Explain', text: 'The AI turns each finding into what to do, why, and the ₹ at stake.' },
  { icon: 'zap',      title: 'Act',     text: 'You act on alerts, or Atmos switches your smart devices itself.' },
];

const WHY_NOW = [
  { stat: 'Seconds', label: 'From reading to advice', text: 'Findings go to the AI already worked out, so answers come back fast.' },
  { stat: '₹',       label: 'Priced for your room',    text: 'Savings use your own tariff, not a national average.' },
  { stat: '30 days', label: 'Of habits, studied',      text: 'Schedules come from how your room is actually used.' },
  { stat: 'Always',  label: 'Something to show',       text: 'If the AI is ever unavailable, our engine’s own advice is shown instead.' },
];

const NEXT = [
  {
    title: 'Forecast next month’s bill',
    text: 'Tell a family or a school what next month will cost, and what it would cost with the waste removed.',
    why: 'Every reading we store is already a time series. Forecasting it is a well-understood AI task.',
  },
  {
    title: 'Catch appliances going bad',
    text: 'An AC that cools a little slower each week is using more power. Spot it early, before the bill or the breakdown.',
    why: 'Slow drifts show up in months of temperature data, which builds up on its own as rooms stay connected.',
  },
  {
    title: 'Talk to Atmos in your language',
    text: 'Ask "why was my bill high?" in Hindi or English and get a plain answer, by voice or WhatsApp.',
    why: 'Today’s AI already writes our recommendations. Answering questions about the same data is the natural next step.',
  },
  {
    title: 'One brain for a whole building',
    text: 'Compare every room in a school or office, rank the worst offenders and plan the whole building at once.',
    why: 'Our dashboard already handles many devices per account. The AI only needs to look across them together.',
  },
];

function Eyebrow({ children, center }) {
  return <div className={`text-xs font-bold uppercase tracking-[0.12em] text-brand mb-4 ${center ? 'text-center' : ''}`}>{children}</div>;
}

export default function AiPage() {
  return (
    <main id="main-content" className="min-h-dvh flex flex-col">
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 relative overflow-hidden section-border">
        <div className="hero-glow" />
        <div className="relative z-10 max-w-3xl">
          <Eyebrow center>How Atmos thinks</Eyebrow>
          <h1 className="font-heading font-bold tracking-tight leading-[1.05] text-[clamp(2.4rem,6vw,4.25rem)]" style={{ color: 'var(--text-heading)' }}>
            Sensors sense.<br />AI <span className="text-brand">decides.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-relaxed mx-auto max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Atmos pairs a precise engine that finds waste with a modern AI that explains it and plans around it. The result is advice anyone can act on, and automation that fits how a room is really used.
          </p>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <Eyebrow>What our AI does today</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-4">Useful from day one.</h2>
          <p className="text-[0.95rem] leading-relaxed max-w-2xl mb-12" style={{ color: 'var(--text-muted)' }}>
            Our AI is not a demo. It writes every Atmos alert and plans automation for real rooms right now.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {TODAY.map(t => (
              <div key={t.title} className="card" style={{ padding: '1.5rem' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center"><Icon name={t.icon} size={22} /></span>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-brand/10 text-brand">{t.tag}</span>
                </div>
                <h3 className="font-heading font-semibold text-lg mb-1.5">{t.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <Eyebrow center>How it works</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-center mb-12">From a reading to a saving.</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 list-none p-0">
            {FLOW.map((f, i) => (
              <li key={f.title} className="card relative" style={{ padding: '1.5rem' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-brand"><Icon name={f.icon} size={24} /></span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Step {i + 1}</span>
                </div>
                <h3 className="font-heading font-semibold text-lg mb-1">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_NOW.map(w => (
              <div key={w.label} className="text-center rounded-2xl px-4 py-5" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
                <div className="font-heading text-2xl font-bold text-brand">{w.stat}</div>
                <div className="text-sm font-semibold mt-1">{w.label}</div>
                <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-muted)' }}>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <Eyebrow>What comes next</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-4">Where our AI goes from here.</h2>
          <p className="text-[0.95rem] leading-relaxed max-w-2xl mb-12" style={{ color: 'var(--text-muted)' }}>
            Each step builds on data Atmos already collects and AI we already run, which is why we believe they are within reach.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {NEXT.map(n => (
              <div key={n.title} className="card flex flex-col gap-3" style={{ padding: '1.5rem' }}>
                <h3 className="font-heading font-semibold text-lg">{n.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{n.text}</p>
                <p className="mt-auto text-xs leading-relaxed rounded-lg px-3 py-2" style={{ background: 'rgba(128,128,128,0.08)', color: 'var(--text-muted)' }}>
                  <span className="font-semibold text-brand">Why it is feasible: </span>{n.why}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <Eyebrow center>Our approach</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-center mb-12">Smart, and still trustworthy.</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Grounded',  text: 'Every piece of advice starts from something the sensor actually measured, never from a guess.' },
              { title: 'Private',   text: 'The AI sees readings and findings only, never your name, email or exact location. Nothing is trained on your data.' },
              { title: 'In your hands', text: 'Prefer simpler advice? Switch to rule-based recommendations in Settings at any time.' },
            ].map(p => (
              <div key={p.title} className="card text-center" style={{ padding: '1.5rem' }}>
                <h3 className="font-heading font-semibold text-lg text-brand mb-1.5">{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-4">See it think.</h2>
          <p className="text-[0.95rem] leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
            Open the live demo, read the AI&apos;s alerts and press Plan with AI on the Automation page.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/dashboard" className="btn bg-brand text-brand-on-bg px-7 py-3 rounded-full font-medium text-sm">Try the live demo</Link>
            <Link href="/about/future" className="btn px-7 py-3 rounded-full font-medium text-sm border border-black/15 dark:border-white/20">Our future</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
