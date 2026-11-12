'use client';

import Link from 'next/link';

import Icon from '@/components/Icon';
import Footer from '@/components/Footer';
import VideoSection from '@/components/VideoSection';
import RevealSection from '@/components/RevealSection';
import AutomationDemo from '@/components/home/AutomationDemo';

// Placeholder pictures until real product screenshots are ready.
const shot = (w, h, text) => `https://placehold.co/${w}x${h}/101311/4ADE80/png?text=${encodeURIComponent(text)}`;

/* ---------- content ---------- */

const STEPS = [
  { icon: 'sensor',   title: 'Sense',     text: 'A small unit reads light, temperature, humidity and whether anyone is in the room.' },
  { icon: 'gauge',    title: 'Work it out', text: 'Atmos spots lights, AC and idle devices running for nothing.' },
  { icon: 'ai',       title: 'Recommend', text: 'AI turns that into a short list of what to fix first, in plain words.' },
  { icon: 'calendar', title: 'Automate',  text: 'Your schedule tells the unit which smart devices to switch off.' },
];

const EXAMPLES = [
  { tone: '#ef4444', tag: 'Standby',  title: 'Appliances left on',             text: 'The room has been empty for hours and devices are still on.', saving: '₹626.98' },
  { tone: '#f59e0b', tag: 'Lighting', title: 'Daylight harvesting opportunity', text: 'It is bright enough outside to switch the lights off.',      saving: '₹1.79' },
  { tone: '#3b82f6', tag: 'Cooling',  title: 'AC running in an empty room',     text: 'The room is cool and nobody is in. Turn the AC off.',        saving: '₹6.00' },
];

const PLANS = [
  { name: 'Spark',      price: 'Free',   note: 'Up to 2 devices' },
  { name: 'Basic',      price: '₹349',   note: 'per unit, per month' },
  { name: 'Premium',    price: '₹699',   note: 'Faster data and API' },
  { name: 'Enterprise', price: 'Custom', note: 'For large portfolios' },
];

const AUDIENCES = [
  { icon: 'home',     label: 'Homes' },
  { icon: 'office',   label: 'Offices' },
  { icon: 'school',   label: 'Schools' },
  { icon: 'hospital', label: 'Hospitals' },
  { icon: 'factory',  label: 'Industry' },
  { icon: 'building', label: 'Portfolios' },
];

function Eyebrow({ children }) {
  return <div className="text-xs font-semibold uppercase tracking-[0.14em] mb-3 text-brand">{children}</div>;
}

function Heading({ children, sub, center = false }) {
  return (
    <div className={center ? 'text-center mx-auto max-w-2xl mb-10' : 'mb-8 max-w-xl'}>
      <h2 className="font-heading text-3xl font-semibold tracking-tight">{children}</h2>
      {sub && <p className="mt-3 text-neutral-600 dark:text-neutral-400 leading-relaxed">{sub}</p>}
    </div>
  );
}

/* ---------- page ---------- */

export default function HomePage() {
  return (
    <main id="main">
      {/* Hero: the whole idea in one screen */}
      <section className="px-6 pt-28 pb-14 section-border bg-white dark:bg-black relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(52,211,105,0.10),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto text-center">
          <Eyebrow>Energy optimization for Indian rooms</Eyebrow>
          <h1 className="font-heading text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.04] max-w-3xl mx-auto text-balance">
            Find the waste. <span className="text-brand">Switch it off.</span>
          </h1>
          <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Atmos is a small sensor for your room. It tells you what is wasting energy, and can turn those devices off for you.
          </p>

          <div className="mt-8 flex items-center gap-4 flex-wrap justify-center">
            <Link href="/dashboard" className="btn bg-brand text-brand-on-bg px-7 py-3 rounded-full font-medium text-sm">
              Try the live demo
            </Link>
            <Link href="/signup" className="arrow-link text-sm text-neutral-700 dark:text-neutral-300 inline-flex items-center gap-2">
              <span>Create a free account</span>
              <span className="arrow inline-flex"><Icon name="arrowRight" size={16} /></span>
            </Link>
          </div>

          <ol className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left" aria-label="How Atmos works">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card" style={{ padding: '1.25rem' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                    <Icon name={s.icon} size={22} />
                  </span>
                  <span className="text-xs text-neutral-500 font-medium">Step {i + 1}</span>
                </div>
                <h3 className="font-heading font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <VideoSection />

      {/* What you see */}
      <RevealSection className="section-pad section-border">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Eyebrow>Your dashboard</Eyebrow>
            <Heading sub="Open it and the first thing you see is what to do next. Mark a recommendation as done and its saving is added to your total.">
              What to fix, first.
            </Heading>
            <ul className="space-y-3 text-sm">
              {['Recommendations at the top, most urgent first', 'Savings count only what you have actually done', 'Charts you can hover, and a PDF report per room'].map(t => (
                <li key={t} className="flex gap-3 items-start">
                  <span className="mt-0.5 text-brand"><Icon name="check" size={18} /></span>
                  <span className="text-neutral-700 dark:text-neutral-300">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <img
            src={shot(960, 600, 'Dashboard overview')}
            alt="Placeholder for the Atmos dashboard overview"
            width="960" height="600" loading="lazy"
            className="w-full h-auto rounded-2xl border border-black/10 dark:border-white/10"
          />
        </div>
      </RevealSection>

      {/* Examples */}
      <RevealSection className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <Heading center sub="Examples of what Atmos might tell you. Rupee figures are estimates.">
            Plain-English alerts.
          </Heading>
          <div className="grid md:grid-cols-3 gap-4">
            {EXAMPLES.map(e => (
              <article key={e.title} className="card flex flex-col gap-3" style={{ padding: '1.25rem', borderLeft: `3px solid ${e.tone}` }}>
                <span className="text-[11px] font-bold uppercase tracking-wide self-start px-2 py-1 rounded-full" style={{ background: `${e.tone}1f`, color: e.tone }}>{e.tag}</span>
                <h3 className="font-heading font-semibold">{e.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{e.text}</p>
                <p className="mt-auto text-sm font-medium text-brand">Could save about {e.saving}</p>
              </article>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* Automation */}
      <RevealSection className="section-pad section-border">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <AutomationDemo />
          <div>
            <Eyebrow>Automation</Eyebrow>
            <Heading sub="Pick when devices should be off, or let AI plan it from how your room is used. Atmos sends the schedule to your unit, and the unit switches your smart devices.">
              It does the switching for you.
            </Heading>
            <ul className="space-y-3 text-sm">
              {['Two-way: the software decides, the hardware acts', 'Edit or delete any rule, any time', 'Every action is logged'].map(t => (
                <li key={t} className="flex gap-3 items-start">
                  <span className="mt-0.5 text-brand"><Icon name="check" size={18} /></span>
                  <span className="text-neutral-700 dark:text-neutral-300">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </RevealSection>

      {/* Privacy and speed */}
      <RevealSection className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <Heading center>Private and quick.</Heading>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: 'lock',  title: 'Anonymous',     text: 'Only readings go to the AI. Nothing that names you or points to an exact place.' },
              { icon: 'zap',   title: 'Under a second', text: 'Our own findings go in with the readings, so answers come back fast.' },
              { icon: 'shield', title: 'Yours',        text: 'Your data is never sold, and you can delete it any time.' },
            ].map(p => (
              <div key={p.title} className="card" style={{ padding: '1.25rem' }}>
                <span className="text-brand"><Icon name={p.icon} size={26} /></span>
                <h3 className="font-heading font-semibold mt-3 mb-1">{p.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* Cost */}
      <RevealSection className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <Heading center sub="One device per room, then a small monthly plan, or nothing at all on Spark.">
            ₹3,499 for the device.
          </Heading>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map(p => (
              <div key={p.name} className="card text-center" style={{ padding: '1.25rem' }}>
                <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{p.name}</div>
                <div className="font-heading text-3xl font-semibold my-2">{p.price}</div>
                <div className="text-xs text-neutral-500">{p.note}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Large building-management systems are usually quoted per project and installed by specialists. Atmos plugs in and links with a key. That is an industry benchmark, not a company quote.
          </p>
          <p className="mt-3 text-center text-xs text-neutral-500 max-w-2xl mx-auto">
            Savings depend on the room. Our models assume a share of energy is avoidable, and that is an assumption, not a measured result. The demo uses simulated data.
          </p>
          <div className="mt-6 text-center">
            <Link href="/pricing" className="arrow-link text-sm font-medium inline-flex items-center gap-2 text-brand">
              <span>See pricing</span><span className="arrow inline-flex"><Icon name="arrowRight" size={16} /></span>
            </Link>
          </div>
        </div>
      </RevealSection>

      {/* Who it is for */}
      <RevealSection className="section-pad section-border">
        <div className="max-w-4xl mx-auto">
          <Heading center>From one room to a portfolio.</Heading>
          <ul className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {AUDIENCES.map(a => (
              <li key={a.label} className="card flex flex-col items-center gap-2 text-center" style={{ padding: '1rem' }}>
                <span className="text-brand"><Icon name={a.icon} size={26} /></span>
                <span className="text-sm font-medium">{a.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </RevealSection>

      {/* Closing call to action */}
      <RevealSection className="section-pad text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-heading text-3xl font-semibold tracking-tight mb-3">See your own room.</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">Start with the demo, or create a free account and link your device.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard" className="btn bg-brand text-brand-on-bg px-7 py-3 rounded-full font-medium text-sm">Try the live demo</Link>
            <Link href="/signup" className="btn px-7 py-3 rounded-full font-medium text-sm border border-black/15 dark:border-white/20">Sign up free</Link>
          </div>
        </div>
      </RevealSection>

      <Footer />
    </main>
  );
}
