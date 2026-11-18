import Link from 'next/link';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';

export const metadata = {
  title: 'About',
  description: 'What Atmos does, where it is going, and why it is built around people first.',
};

const VALUES = [
  { icon: 'user',   title: 'People before devices', text: 'Atmos speaks to the person in the room, not to an engineer. Advice comes in plain words, with a reason and a rupee figure, so anyone can act on it.' },
  { icon: 'shield', title: 'Your room stays yours', text: 'Readings are used to help you and nothing else. We never sell data, never show ads, and you can download or delete everything at any time.' },
  { icon: 'check',  title: 'You stay in charge',     text: 'Atmos suggests and automates, but every rule can be edited, paused or switched by hand. Comfort is never traded away for a saving.' },
  { icon: 'home',   title: 'Made for Indian rooms',  text: 'Rupees, Indian tariffs, BEE benchmarks, our summers and our schools. The Subsidy Calculator also works in Hindi.' },
];

const GIVING = [
  { stat: '₹0',        label: 'Spark plan',            text: 'Free for up to two devices, so a family or a classroom can start without paying a subscription.' },
  { stat: '2',         label: 'Languages',             text: 'The Subsidy Calculator works in English and Hindi, and needs no sign-up.' },
  { stat: '₹78,000',   label: 'Central solar subsidy', text: 'The most a home can get under PM Surya Ghar for a rooftop system. Our calculator shows people what they can claim and how.' },
  { stat: '0.727 kg',  label: 'CO₂ per unit',          text: 'Every kWh Atmos helps avoid keeps about this much CO₂ out of the air on India’s grid.' },
];

const TEAM = ['Akshat Patil', 'AR Nadal Verma', 'Medhansh Mathur', 'Rayansh Chhaunker', 'Ridit Popli'];

function Eyebrow({ children, center }) {
  return <div className={`text-xs font-bold uppercase tracking-[0.12em] text-brand mb-4 ${center ? 'text-center' : ''}`}>{children}</div>;
}

export default function AboutPage() {
  return (
    <main id="main-content" className="min-h-dvh flex flex-col">
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 relative overflow-hidden section-border">
        <div className="hero-glow" />
        <div className="relative z-10 max-w-3xl">
          <Eyebrow center>About Atmos</Eyebrow>
          <h1 className="font-heading font-bold tracking-tight leading-[1.05] text-[clamp(2.4rem,6vw,4.25rem)]" style={{ color: 'var(--text-heading)' }}>
            Energy that works<br /><span className="text-brand">for people.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-relaxed mx-auto max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Atmos is a small sensor and a simple dashboard that find the electricity a room wastes. The unit reads light, temperature, humidity and whether anyone is in the room. Atmos spots lights, ACs and idle devices running for nobody, tells you in plain words what to fix first and what it is costing you in rupees, and switches smart devices off by itself. It plugs in, links with one key, and works in homes, classrooms, shops and offices across India.
          </p>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-2 lg:gap-20 items-start">
          <div>
            <Eyebrow>Our vision</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-5">
              Every room in India,<br />wasting nothing.
            </h2>
            <p className="text-[0.95rem] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Buildings use a large share of the world&apos;s electricity, and much of it powers empty rooms. We want saving energy to be as easy as switching off a light, and as automatic as a phone updating itself.
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {[
              ['Today', 'Atmos finds the waste in one room, explains it and switches smart devices off.'],
              ['Next', 'Whole schools, offices and housing societies on one dashboard, with reports they can share.'],
              ['Later', 'Verified savings that help buildings reach green finance, and anonymous city-level data that helps plan a cleaner grid.'],
            ].map(([when, text]) => (
              <li key={when} className="card flex gap-4" style={{ padding: '1.1rem 1.25rem' }}>
                <span className="font-heading text-sm font-bold text-brand min-w-[3.5rem]">{when}</span>
                <span className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <Eyebrow center>Our approach</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-center mb-4">Technology with a human face.</h2>
          <p className="text-center text-[0.95rem] leading-relaxed max-w-2xl mx-auto mb-12" style={{ color: 'var(--text-muted)' }}>
            Saving energy only works if people want to keep doing it. So Atmos is built to be understood, trusted and switched off whenever you like.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map(v => (
              <div key={v.title} className="card" style={{ padding: '1.5rem' }}>
                <span className="text-brand"><Icon name={v.icon} size={24} /></span>
                <h3 className="font-heading font-semibold text-lg mt-3 mb-1.5">{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <Eyebrow center>Giving back</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-center mb-4">Good for the bill. Good for the community.</h2>
          <p className="text-center text-[0.95rem] leading-relaxed max-w-2xl mx-auto mb-12" style={{ color: 'var(--text-muted)' }}>
            Electricity is a large share of what many Indian families and schools spend each month. Every unit Atmos saves is money back in their pocket and cleaner air for everyone.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GIVING.map(g => (
              <div key={g.label} className="card text-center" style={{ padding: '1.5rem 1.25rem' }}>
                <div className="font-heading text-3xl font-bold tracking-tight text-brand">{g.stat}</div>
                <div className="text-sm font-semibold mt-2 mb-2">{g.label}</div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{g.text}</p>
              </div>
            ))}
          </div>
          <div className="card mt-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between" style={{ padding: '1.5rem' }}>
            <div>
              <div className="font-heading font-semibold mb-1">One AC left on in an empty classroom for an hour</div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                About 1.2 kWh, ₹12 at ₹10 a unit and 0.9 kg of CO₂. Across a school year of working days, catching that once a day is worth about ₹2,600 for one room. An illustration from our engine&apos;s assumed loads, not a measured result.
              </p>
            </div>
            <Link href="/about/subsidy" className="btn bg-brand text-brand-on-bg px-6 py-2.5 rounded-full text-sm font-medium text-center shrink-0">
              Try the Subsidy Calculator
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-3xl mx-auto text-center">
          <Eyebrow center>Who we are</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-4">Built by students, in India.</h2>
          <p className="text-[0.95rem] leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
            Atmos started with a simple question in our own school: why are the lights and ACs on when nobody is in the room? We are Team Atmos.
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            {TEAM.map(name => (
              <li key={name} className="rounded-full border border-black/10 dark:border-white/12 px-4 py-1.5 text-sm">{name}</li>
            ))}
          </ul>
          <div className="mt-10 flex gap-3 justify-center flex-wrap">
            <Link href="/dashboard" className="btn bg-brand text-brand-on-bg px-7 py-3 rounded-full font-medium text-sm">Try the live demo</Link>
            <Link href="/about/future" className="btn px-7 py-3 rounded-full font-medium text-sm border border-black/15 dark:border-white/20">Read our future</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
