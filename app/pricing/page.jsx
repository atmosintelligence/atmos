'use client';

import Link from 'next/link';
import { useRef, useState, useEffect, Fragment } from 'react';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';

function Calculator() {
  const [rooms, setRooms] = useState([{ size: 150 }]);

  function addRoom() { setRooms(r => [...r, { size: 150 }]); }
  function removeRoom(i) { setRooms(r => r.filter((_, idx) => idx !== i)); }
  function updateSize(i, val) { setRooms(r => r.map((room, idx) => idx === i ? { size: Number(val) } : room)); }

  function unitsForRoom(sqft) {
    if (sqft <= 150) return 1;
    if (sqft <= 300) return 2;
    if (sqft <= 500) return 3;
    return Math.ceil(sqft / 500);
  }

  const totalUnits = rooms.reduce((a, r) => a + unitsForRoom(r.size), 0);
  const totalSqft  = rooms.reduce((a, r) => a + r.size, 0);

  const recommendation =
    rooms.length >= 4 && totalSqft >= 1200
      ? 'enterprise'
      : totalSqft >= 1800
      ? 'enterprise'
      : totalSqft >= 350
      ? 'premium'
      : totalSqft >= 200
      ? 'basic'
      : 'spark';

  const planMeta = {
    spark:      { label: 'Spark',      price: 0,    color: '#737373' },
    basic:      { label: 'Basic',      price: 349,  color: '#60a5fa' },
    premium:    { label: 'Premium',    price: 699,  color: '#4ADE80' },
    enterprise: { label: 'Enterprise', price: null, color: '#a78bfa' },
  };

  const rec          = planMeta[recommendation];
  const monthlyCost  = rec.price !== null ? totalUnits * rec.price : null;
  const costPerRoom  = monthlyCost !== null && rooms.length > 0 ? Math.round(monthlyCost / rooms.length) : null;

  const recDesc = {
    spark:      'Your setup fits within the free and simple Spark plan.',
    basic:      'Basic gives you unlimited units and recommendations. Right for your scale.',
    premium:    'At this scale, you unlock almost everything you need to live a carbon-free life.',
    enterprise: 'A deployment this size warrants dedicated account management and custom pricing.',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#737373', marginBottom: '0.75rem' }}>
            Your rooms
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {rooms.map((room, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#737373', minWidth: '60px' }}>Room {i + 1}</span>
                <input
                  type="number"
                  value={room.size}
                  min="50"
                  step="50"
                  onChange={e => updateSize(i, e.target.value)}
                  className="field-input"
                  style={{ maxWidth: '100px', textAlign: 'right' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#737373' }}>sq ft</span>
                <span style={{ fontSize: '0.72rem', color: '#4ADE80', minWidth: '70px' }}>
                  {unitsForRoom(room.size)} unit{unitsForRoom(room.size) > 1 ? 's' : ''}
                </span>
                {rooms.length > 1 && (
                  <button
                    onClick={() => removeRoom(i)}
                    style={{ fontSize: '0.7rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.25rem' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addRoom}
            style={{ marginTop: '0.625rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary-dark)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            className="dark:text-[var(--color-primary)]"
          >
            + Add another room
          </button>
        </div>

        <div style={{ fontSize: '0.72rem', color: '#737373', lineHeight: 1.65, padding: '0.875rem', background: 'rgba(128,128,128,0.06)', borderRadius: '0.625rem', border: '1px solid rgba(128,128,128,0.12)' }}>
          <strong style={{ color: 'inherit', fontWeight: 600 }}>How units are counted:</strong> rooms up to 300 sq ft need 1 unit, up to 800 sq ft need 2, up to 1,500 sq ft need 3, and larger spaces need 1 unit per 500 sq ft.
        </div>
      </div>

      <div style={{ position: 'sticky', top: '5rem' }}>
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0' }}>

          <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(128,128,128,0.12)' }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#737373', marginBottom: '0.5rem' }}>
              Hardware units needed
            </div>
            <div className="font-heading text-brand" style={{ fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {totalUnits}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#737373', marginTop: '0.375rem' }}>
              across {rooms.length} room{rooms.length > 1 ? 's' : ''} · {totalSqft.toLocaleString()} sq ft total
            </div>
          </div>

          <div style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(128,128,128,0.12)' }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#737373', marginBottom: '0.5rem' }}>
              Recommended plan
            </div>
            <div className="font-heading" style={{ fontSize: '1.5rem', fontWeight: 700, color: rec.color, marginBottom: '0.375rem' }}>
              {rec.label}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#737373', lineHeight: 1.6 }}>
              {recDesc[recommendation]}
            </div>
          </div>

          <div style={{ paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#737373', marginBottom: '0.25rem' }}>
              Costs
            </div>
            {monthlyCost !== null ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.82rem', color: '#737373' }}>Monthly cost</span>
                  <span className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {monthlyCost === 0 ? 'Free' : `₹${monthlyCost.toLocaleString()}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.82rem', color: '#737373' }}>One-time hardware cost</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    ₹{(totalUnits * 3499).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.82rem', color: '#737373' }}>Cost per room</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                    {costPerRoom === 0 ? 'Free' : `₹${costPerRoom.toLocaleString()} / mo`}
                  </span>
                </div>
              </>
            ) : (
              <div style={{ fontSize: '0.82rem', color: '#737373', lineHeight: 1.65 }}>
                Enterprise pricing is custom. <a href="mailto:atmosintelligence@gmail.com" className="link">Contact us</a> for a tailored quote.
              </div>
            )}
          </div>

          <a
            href="/signup"
            className="btn bg-brand text-brand-on-bg text-center text-sm font-medium py-2.5 rounded-xl"
            style={{ marginTop: '1.5rem', display: 'block' }}
          >
            Get started with {rec.label}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const plansRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToPlans(e) {
    e.preventDefault();
    plansRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const featured = {
    name: 'Premium',
    price: '₹699',
    period: 'per unit / month',
    description: 'The most complete plan for serious energy optimisation',
    features: ['30-second data refresh', 'Real-time anomaly alerts', 'Predictive maintenance', 'Carbon credit revenue', 'BRSR compliance reports', 'API access'],
    href: '/signup',
  };

  const plans = [
    {
      name: 'Spark',
      price: '₹0',
      period: 'forever',
      description: 'Enjoy basic monitoring with simple features',
      features: ['Enough data refresh rate', '1 or 2 devices', 'All the essentials', 'Savings'],
      cta: 'Get started',
      href: '/signup',
      highlight: false,
    },
    {
      name: 'Basic',
      price: '₹349',
      period: 'per unit / month',
      description: 'An awesome and scalable choice to begin with',
      features: ['Everything in Spark', 'Unlimited devices', 'Alerts', 'Simple export'],
      cta: 'Start free trial',
      href: '/signup',
      highlight: false,
    },
    {
      name: 'Premium',
      price: '₹699',
      period: 'per unit / month',
      description: 'Small businesses and growing teams can turn eco-friendly',
      features: ['Everything in Basic', 'Fast data refresh rate', 'Advanced export', 'Simple API access'],
      cta: 'Start free trial',
      href: '/signup',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us for a quote',
      description: 'Tailored for large portfolios and institutions',
      features: ['Everything in Premium', 'Advanced API access', 'Go white-label', 'Dedicated support'],
      cta: 'Contact sales',
      href: 'mailto:atmosintelligence@gmail.com',
      highlight: false,
    },
  ];

  const CHECK   = <span style={{ color: '#4ADE80', fontWeight: 700 }}>✓</span>;
  const CROSS   = <span style={{ color: '#444', fontWeight: 700 }}>✗</span>;
  const NOTE    = (t) => <span style={{ color: '#4ADE80', fontWeight: 700 }}>✓ <span style={{ color: '#737373', fontWeight: 400, fontSize: '0.7rem' }}><br />{t}</span></span>;

  const tableGroups = [
    {
      group: 'Core',
      rows: [
        { feature: 'Data refresh rate',           spark: '10 min',  basic: '10 min',    premium: '30 sec',    enterprise: '30 sec'    },
        { feature: 'Maximum number of devices',   spark: '2 units', basic: 'Unlimited', premium: 'Unlimited', enterprise: 'Unlimited' },
        { feature: 'Live dashboard',              spark: CHECK,     basic: CHECK,       premium: CHECK,       enterprise: CHECK       },
        { feature: 'Latest readings and savings', spark: CHECK,     basic: CHECK,       premium: CHECK,       enterprise: CHECK       },
        { feature: 'Benchmark comparison',        spark: CHECK,     basic: CHECK,       premium: CHECK,       enterprise: CHECK       },
      ],
    },
    {
      group: 'Analysis',
      rows: [
        { feature: 'Recommendations',             spark: CHECK, basic: CHECK, premium: CHECK, enterprise: CHECK },
        { feature: 'Summaries',                   spark: CHECK, basic: CHECK, premium: CHECK, enterprise: CHECK },
        { feature: 'Graphs',                      spark: CROSS, basic: CHECK, premium: CHECK, enterprise: CHECK },
      ],
    },
    {
      group: 'Alerts',
      rows: [
        { feature: 'Acknowledgements',            spark: CROSS, basic: CHECK, premium: CHECK, enterprise: CHECK },
        { feature: 'Alert frequency',             spark: CROSS, basic: CHECK, premium: CHECK, enterprise: CHECK },
      ],
    },
    {
      group: 'Reporting and API',
      rows: [
        { feature: 'Data JSON export',            spark: CROSS, basic: CHECK, premium: CHECK, enterprise: CHECK },
        { feature: 'Data PDF export',             spark: CROSS, basic: CROSS, premium: CHECK, enterprise: CHECK },
        { feature: 'API access',                  spark: CROSS, basic: CROSS, premium: NOTE("Limited endpoints"), enterprise: NOTE("All endpoints") },
        { feature: 'White-label exports',         spark: CROSS, basic: CROSS, premium: CROSS, enterprise: CHECK },
      ],
    },
    {
      group: 'Support',
      rows: [
        { feature: 'Response time by email',          spark: 'Up to 1 week', basic: 'Up to 2 days', premium: 'Same day', enterprise: 'Dedicated manager' },
      ],
    },
  ];

  const thStyle = {
    padding: '0.875rem 1.25rem',
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#737373',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    background: 'transparent',
    borderBottom: '1px solid rgba(128,128,128,0.15)',
  };

  const tdStyle = {
    padding: '0.75rem 1.25rem',
    fontSize: '0.82rem',
    textAlign: 'center',
    borderBottom: '1px solid rgba(128,128,128,0.08)',
    verticalAlign: 'middle',
  };

  const tdFeatureStyle = {
    ...tdStyle,
    textAlign: 'left',
    color: '#c0c0c0',
    fontWeight: 400,
    paddingLeft: '1rem',
  };

  const groupStyle = {
    padding: '0.875rem 0 0.5rem',
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#4ADE80',
    textAlign: 'left',
    borderBottom: '1px solid rgba(128,128,128,0.08)',
    paddingLeft: '1rem'
  };

  return (
    <main className="min-h-dvh flex flex-col">
      <section className="min-h-dvh flex flex-col section-border relative overflow-hidden">
        <div className="hero-glow" />
        <div className="flex-1 flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto w-full px-6 pt-28 pb-8">
          <div className="flex-1 flex flex-col gap-6">
            <h1 className="font-heading text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
              Simple,<br />honest<br /><span className="text-brand">pricing.</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg leading-relaxed max-w-sm">
              Start free. Upgrade when you need more. No hidden fees, no lock-in.
            </p>
            <a href="#plans" onClick={scrollToPlans} className="arrow-link link self-start text-sm">
              <span>See all plans</span>
              <span className="arrow inline-flex items-center"><Icon name="arrowRight" /></span>
            </a>
          </div>

          <div className="w-full md:w-80 shrink-0 bg-brand bg-brand-static rounded-2xl p-7 flex flex-col gap-5 text-brand-on-bg">
            <div>
              <div className="text-xs font-medium opacity-60 uppercase tracking-widest mb-1">{featured.name}</div>
              <div className="font-heading text-5xl font-semibold tracking-tight">{featured.price}</div>
              <div className="text-xs opacity-60 mt-0.5">{featured.period}</div>
              <p className="text-sm opacity-75 mt-3 leading-relaxed">{featured.description}</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {featured.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <Icon name="check" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href={featured.href} className="btn mt-auto text-center text-sm font-medium py-2.5 rounded-xl bg-white text-[var(--color-primary-dark)]" style={{ backgroundColor: 'white' }}>
              Start free trial
            </Link>
          </div>
        </div>

        <div className={`flex flex-col items-center gap-1.5 text-neutral-400 transition-opacity duration-500 pb-10 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <Icon name="arrowDown" className="animate-bounce" />
        </div>
      </section>

      <section ref={plansRef} id="plans" className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">All plans</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-md mx-auto">
            Every plan includes access to the Atmos dashboard and hardware setup guide.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-6 flex flex-col border transition-all ${
                plan.highlight ? 'bg-brand text-brand-on-bg border-transparent' : 'card'
              }`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium bg-white text-[var(--color-primary-dark)] px-3 py-1 rounded-full whitespace-nowrap">
                    The idealistic option
                  </span>
                )}
                <div className="mb-5">
                  <div className="text-sm font-medium mb-1 opacity-70">{plan.name}</div>
                  <div className="font-heading text-3xl font-semibold tracking-tight">{plan.price}</div>
                  <div className={`text-xs mt-0.5 ${plan.highlight ? 'opacity-70' : 'text-neutral-400'}`}>{plan.period}</div>
                  <p className={`text-xs mt-3 leading-relaxed ${plan.highlight ? 'opacity-80' : 'text-neutral-500 dark:text-neutral-400'}`}>{plan.description}</p>
                </div>
                <ul className="flex flex-col gap-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <Icon name="check" className={plan.highlight ? 'opacity-90' : 'text-brand'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`btn text-center text-sm font-medium py-2 rounded-xl ${
                  plan.highlight
                    ? 'bg-white text-[var(--color-primary-dark)]'
                    : 'bg-brand text-brand-on-bg'
                }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-4 card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="text-sm font-medium mb-1 opacity-70">
                THE HARDWARE DEVICE
              </div>

              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
                Apart from the subscription, you'll also need the hardware device itself. Pay only once.
              </p>
            </div>

            <div className="text-right">
              <div className="font-heading text-4xl font-semibold tracking-tight">
                ₹3,499
              </div>

              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                One-time cost
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">Compare plans</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-md mx-auto">
            Explore and compare every feature and plan, side by side.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: '700px' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, textAlign: 'left', paddingLeft: '1rem', width: '35%' }}>Feature</th>
                  <th style={thStyle}>Spark</th>
                  <th style={thStyle}>Basic</th>
                  <th style={{ ...thStyle, color: '#4ADE80' }}>Premium</th>
                  <th style={thStyle}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {tableGroups.map((group) => (
                  <Fragment key={group.group}>
                    <tr>
                      <td colSpan={5} style={groupStyle}>{group.group}</td>
                    </tr>

                    {group.rows.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          background: i % 2 === 0
                            ? 'rgba(255,255,255,0.01)'
                            : 'transparent'
                        }}
                      >
                        <td style={tdFeatureStyle}>{row.feature}</td>
                        <td style={tdStyle}>{row.spark}</td>
                        <td style={tdStyle}>{row.basic}</td>
                        <td style={{ ...tdStyle, background: 'rgba(74,222,128,0.04)' }}>
                          {row.premium}
                        </td>
                        <td style={tdStyle}>{row.enterprise}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto px-6">
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-dark)', marginBottom: '1rem', textAlign: 'center' }} className="dark:text-[var(--color-primary)]">
            Pricing calculator
          </div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">Explore your needs</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-md mx-auto">
            Tell us about your space and we'll recommend the right setup.
          </p>
          <Calculator />
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">
            Your plan is special.
          </h2>

          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-2xl mx-auto">
            Every plan comes with these outcomes.
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'Compliance-ready',
                description:
                  'We always comply with national standards',
              },

              {
                title: 'Save and repeat',
                description:
                  'Atmos continuously enables recurring carbon-credit income',
              },

              {
                title: 'Scalable',
                description:
                  'We\'re built on a high-margin software model',
              },

              {
                title: 'Bulk deployment',
                description:
                  'Grab multiple devices to multiply the output',
              },

              {
                title: 'Upgrade anytime',
                description:
                  'Don\'t worry if you\'re not confident with your plan',
              },

              {
                title: 'Enterprise solution',
                description:
                  'Large enterprises are welcome and prioritised',
              },
            ].map(f => (
              <div key={f.title} className="card p-6">
                <h3 className="font-heading font-semibold text-sm mb-2 text-brand text-center">
                  {f.title}
                </h3>

                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed text-center">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-center mb-3">Frequently Asked Questions</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-center mb-12 max-w-md mx-auto">Everything you might want to know before getting started.</p>
          <div className="flex flex-col divide-y divide-black/8 dark:divide-white/8">
            {[
              {
                q: 'Can I change my plan later?',
                a: 'Of course! You may upgrade at any time. Remember, the changes will take effect from the next billing cycle.',
              },
              {
                q: 'What is a "unit"?',
                a: 'A unit is one Atmos hardware device, which is a physical prototype powered with sensors. Plans are priced per unit per month, so you only pay for what you deploy.',
              },
              {
                q: 'Is the hardware included in the price?',
                a: 'No, the hardware is a one-time purchase which you pay for separately. The monthly subscription covers the core software, analysis, reporting, and support.',
              },
              {
                q: 'What happens to my data if I cancel?',
                a: 'Your data is retained for 90 days after cancellation, unless you choose to subscribe again. If you\'re on the Basic plan or higher, you can export it at any time from the dashboard before the time window closes.',
              },
              {
                q: 'Does the Spark plan expire?',
                a: 'No, Spark is free forever, with no credit card required. However, it is limited to 2 units and 10-minute refresh intervals, among other small features.',
              },
            ].map((item, i) => (
              <div key={i} className="py-5">
                <div className="font-heading font-semibold text-sm mb-1.5">{item.q}</div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-heading text-3xl font-semibold tracking-tight mb-3">Ready to get started?</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">
            Join the national effort to make Indian buildings smarter and more energy efficient.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup" className="btn bg-brand text-brand-on-bg px-8 py-2.5 rounded-full font-medium text-sm inline-flex">
              Enter Demo Mode
            </Link>
            <Link href="/signup" className="btn bg-brand text-brand-on-bg px-8 py-2.5 rounded-full font-medium text-sm inline-flex">
              Start for free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}