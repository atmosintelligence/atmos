import Footer from '@/components/Footer';

export const metadata = { title: 'The Future • Atmos Intelligence' };

export default function FuturePage() {
  return (
    <main className="min-h-dvh flex flex-col">

      <section className="min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-16 relative overflow-hidden section-border">
        <div className="hero-glow" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#4ADE80', marginBottom: '1.5rem' }}>
            What comes next
          </div>
          <h1 className="font-heading" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#e8e8e8', marginBottom: '1.5rem' }}>
            We are just getting<br />
            <span style={{ color: '#4ADE80' }}>started.</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#737373', lineHeight: 1.75, maxWidth: '520px', margin: '0 auto 2.5rem' }}>
            Atmos today suggests. Atmos tomorrow acts. The global built environment wastes an estimated $1.2 trillion in energy every year. We are building the intelligence layer that stops it. One building at a time, on every continent.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#444', lineHeight: 1.7, padding: '1rem 1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(74,222,128,0.03)', maxWidth: '440px', margin: '0 auto' }}>
            All of this happens whilst collecting data with full respect for user privacy. No personal data is ever used for model training. Buildings are anonymised at source. You own your data entirely!
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1rem' }}>
            Expansion roadmap
          </div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Local. National. Global.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '540px', marginBottom: '4rem' }}>
            Atmos is designed to scale in three explicit phases, each one funded by the margins of the one before it, and each one more defensible than the last.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>
            {[
              {
                phase:   '01',
                label:   'Local',
                horizon: 'Now — Year 2',
                color:   '#4ADE80',
                heading: 'Prove the unit',
                points: [
                  'Deploy across India\'s major metros: Delhi, Mumbai, Bengaluru, Hyderabad',
                  'Hardware bill of materials at $32 per unit, sold at $42—31% gross margin',
                  'Subscription from $4.20/unit/month across Basic and Premium tiers',
                  'BRSR compliance reports unlock enterprise accounts in listed companies',
                  'Regulatory tailwind: India mandates energy disclosure for 1,000+ listed firms',
                  'Target: 500 units across 50 buildings, $51,000 ARR by end of Year 2',
                ],
              },
              {
                phase:   '02',
                label:   'National',
                horizon: 'Year 2 — Year 4',
                color:   '#60a5fa',
                heading: 'Scale the model',
                points: [
                  'Expand to Tier-1 markets across South and Southeast Asia',
                  'Channel partnerships with MEP consultants and facilities management firms',
                  'Enterprise multi-building portfolio dashboard for institutional real estate',
                  'Carbon credit aggregation pipeline: 60% of verified proceeds to customers',
                  'Wright\'s Law cost reduction — hardware BOM targets $22 at 10,000 units',
                  'Target: 3,200 buildings, $2.1M revenue, EBITDA positive by Year 4',
                ],
              },
              {
                phase:   '03',
                label:   'Global',
                horizon: 'Year 4 onwards',
                color:   '#a78bfa',
                heading: 'Become the platform',
                points: [
                  'Expansion into GCC, Southeast Asia, Sub-Saharan Africa, and the UK',
                  'Atmos OS licensed to building automation vendors and MEP engineers globally',
                  'API marketplace: third parties build products on our sensor and intelligence layer',
                  'Aggregated anonymised data sold to urban planners and national policy bodies',
                  'Addressable market: 5.6 million commercial buildings across target regions',
                  'The data moat, not the hardware, becomes the primary valuation driver',
                ],
              },
            ].map((p, i) => (
              <div key={i} className="bg-white dark:bg-[#0f0f0f]" style={{ padding: '2.5rem 2rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: p.color, marginBottom: '0.5rem' }}>
                  Phase {p.phase} · {p.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#444', marginBottom: '1.25rem' }}>{p.horizon}</div>
                <div className="font-heading" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e8e8e8', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                  {p.heading}
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', listStyle: 'none', padding: 0, margin: 0 }}>
                  {p.points.map((pt, j) => (
                    <li key={j} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '9999px', background: p.color, marginTop: '0.45rem', flexShrink: 0, opacity: 0.8 }} />
                      <span style={{ fontSize: '0.78rem', color: '#737373', lineHeight: 1.65 }}>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1rem' }}>
                Autonomous control
              </div>
              <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
                From suggestions<br />to action.
              </h2>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                Today, Atmos tells you what to do. In the next phase, Atmos does it. We are building direct integration with building electrical management systems: HVAC controllers, smart circuit breakers, and lighting relays. Hence, the moment our engine detects a wasteful pattern, it corrects it automatically.
              </p>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                Human intervention becomes zero. The building governs itself. Energy is not saved when someone remembers to act, it is saved at the precise moment waste would otherwise have occurred.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'HVAC scheduling',    desc: 'Air conditioning shuts off automatically when the last occupant leaves'       },
                  { label: 'Lighting control',    desc: 'Lights dim or switch off based on lux readings and occupancy state'          },
                  { label: 'Load management',     desc: 'Non-critical circuits shed load during detected demand peaks'                },
                  { label: 'Fault auto-response', desc: 'Voltage irregularities trigger circuit isolation before appliance damage'    },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.875rem 1rem', borderRadius: '0.625rem', border: '1px solid rgba(128,128,128,0.12)', background: 'rgba(74,222,128,0.03)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '9999px', background: '#4ADE80', marginTop: '0.35rem', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#c0c0c0', marginBottom: '0.2rem' }}>{f.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.55 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(128,128,128,0.12)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#737373', marginBottom: '1rem' }}>Today</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {['Sensor detects empty room', 'Engine generates recommendation', 'Dashboard displays suggestion', 'Person reads and acts'].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '9999px', border: '1px solid rgba(128,128,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.6rem', color: '#737373', fontWeight: 600 }}>{i + 1}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: i === 3 ? '#737373' : '#a0a0a0' }}>{step}</span>
                      {i === 3 && <span style={{ fontSize: '0.62rem', color: '#ef4444', fontWeight: 600, marginLeft: 'auto' }}>bottleneck</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.04)' }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4ADE80', marginBottom: '1rem' }}>Tomorrow</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {['Sensor detects empty room', 'Engine generates action', 'System executes automatically', 'Dashboard logs the saving'].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '9999px', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.6rem', color: '#4ADE80', fontWeight: 700 }}>{i + 1}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#c0c0c0' }}>{step}</span>
                      {i === 3 && <span style={{ fontSize: '0.62rem', color: '#4ADE80', fontWeight: 600, marginLeft: 'auto' }}>zero lag</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1rem' }}>
              The AI platform
            </div>
            <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
              Three stages of intelligence.
            </h2>
            <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '580px', margin: '0 auto' }}>
              A rule-based system can be replicated in an afternoon. A model trained on thousands of building-years of real-world energy data across diverse climates, construction types, and occupancy patterns cannot. Every customer we add makes the system better for every other customer. That is the moat.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>
            {[
              {
                stage:       'Stage 1',
                label:       'Rule-based intelligence',
                status:      'Live today',
                statusColor: '#4ADE80',
                color:       '#4ADE80',
                description: 'Eight precision-engineered rules, developed alongside energy engineers and aligned with international benchmarking frameworks, run against every sensor reading. This is our current engine: fast, explainable, and auditable. When it flags a recommendation, we can tell you exactly which reading triggered it and precisely why. Judges can verify it. Regulators can audit it. Customers can trust it.',
                capability:  'Detects known patterns. Cannot discover unknown ones.',
              },
              {
                stage:       'Stage 2',
                label:       'Pattern-learning AI',
                status:      'In development',
                statusColor: '#eab308',
                color:       '#60a5fa',
                description: 'An AI agent, built on TensorFlow, that trains continuously on anonymised, cross-building data gathered from every climate zone and construction type we operate in. It learns consumption histories it has never seen explicitly labelled: the HVAC that predictably degrades every summer in a particular building typology; the occupancy pattern that correlates with a 14% power spike on the third week of every month. The rule engine catches what we know. The learning layer surfaces what we did not know to look for.',
                capability:  'Learns consumption history. Surfaces unknown inefficiency patterns.',
              },
              {
                stage:       'Stage 3',
                label:       'Optimisation and edge AI',
                status:      'Vision',
                statusColor: '#a78bfa',
                color:       '#a78bfa',
                description: 'The model runs on-device at the hardware layer, edge inference with sub-second latency, operating even when cloud connectivity is unavailable. Optimisation decisions are made at the sensor itself. The building thinks in real time, without round-tripping data to a server. This is where our data moat becomes a hardware moat: no competitor has the cross-climate, cross-continent training dataset required to run this accurately.',
                capability:  'Acts autonomously at the edge. No cloud dependency.',
              },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-[#0f0f0f]" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '3rem', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: s.color, marginBottom: '0.375rem' }}>{s.stage}</div>
                  <div className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e8e8e8', marginBottom: '0.75rem', lineHeight: 1.2 }}>{s.label}</div>
                  <div style={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: s.statusColor + '18', color: s.statusColor, border: `1px solid ${s.statusColor}30` }}>
                    {s.status}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#737373', lineHeight: 1.8, marginBottom: '1rem' }}>
                    {s.description}
                  </p>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: s.color, padding: '0.5rem 0.875rem', background: s.color + '10', borderRadius: '0.375rem', display: 'inline-block' }}>
                    {s.capability}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1rem' }}>
                Scalability
              </div>
              <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
                Three structural<br />reasons it scales.
              </h2>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8 }}>
                Most hardware businesses break at scale because their cost of delivery grows with their customer count. Atmos does not and the reasons are structural, not optimistic. They hold in London as well as they hold in Delhi.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '0.5rem' }}>
              {[
                {
                  number: '01',
                  title:  'Near-zero marginal cost',
                  body:   'Once the software platform exists, adding the ten-thousandth customer costs almost nothing more than the first. There is no additional engineering, no new infrastructure, no incremental support headcount at the margin. Software scales across borders as readily as across postcodes. Hardware margins compound as volume increases.',
                  color:  '#4ADE80',
                },
                {
                  number: '02',
                  title:  'No installation team required',
                  body:   'The plug-in design is doing real strategic work. Every competitor in building energy management requires a certified engineer, a site survey, and a multi-day installation. We require none of that. A facilities manager receives the device, connects it to Wi-Fi, and is live within minutes. This is not a convenience feature, rather a global sales velocity multiplier. We can ship to São Paulo or Singapore with identical unit economics.',
                  color:  '#60a5fa',
                },
                {
                  number: '03',
                  title:  'Wright\'s Law on hardware cost',
                  body:   'For every doubling of cumulative units produced, manufacturing cost falls by a predictable percentage. At 500 units our bill of materials is $32. At 5,000 the projection is $23. At 50,000, below $17. The unit economics improve automatically as we grow — we do not have to negotiate them. Global scale accelerates this faster than any single-market competitor can match.',
                  color:  '#a78bfa',
                },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.25rem' }}>
                  <div className="font-heading" style={{ fontSize: '0.7rem', fontWeight: 700, color: item.color, minWidth: '28px', paddingTop: '0.15rem' }}>{item.number}</div>
                  <div>
                    <div className="font-heading" style={{ fontSize: '1rem', fontWeight: 700, color: '#e8e8e8', marginBottom: '0.5rem' }}>{item.title}</div>
                    <p style={{ fontSize: '0.82rem', color: '#737373', lineHeight: 1.75 }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1rem', textAlign: 'center' }}>
            Green economy
          </div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', textAlign: 'center', marginBottom: '1rem' }}>
            We are not a sensor company.<br />We are a green finance company.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '580px', margin: '0 auto 4rem', textAlign: 'center' }}>
            The sensor and dashboard are the entry point. The long-term value — for customers, investors, and governments — lives in what verified energy data unlocks downstream. The global voluntary carbon market is projected to reach $50 billion by 2030. We intend to be infrastructure for it.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              {
                title: 'Macro advocacy: Data to policy',
                color: '#4ADE80',
                body:  'At scale, our anonymised aggregate dataset becomes one of the richest longitudinal pictures of global commercial energy consumption ever assembled across emerging and developed markets simultaneously. We intend to share this in aggregated, privacy-preserving form, with national energy ministries, urban planning bodies, and international climate finance institutions. When policymakers design the next round of energy efficiency mandates, Atmos data should be informing the baseline.',
                tag:   'Policy impact',
              },
              {
                title: 'Green finance access: Carbon pipeline',
                color: '#60a5fa',
                body:  'Verified energy savings are monetisable under international carbon frameworks. Our Premium plan already estimates carbon credit revenue per building. By Year 3, we aggregate verified savings across our global portfolio, certify them under recognised schemes including the Verified Carbon Standard and Gold Standard, and sell them into compliance and voluntary markets. We return 60% of proceeds to customers. They do not just save money. They earn it.',
                tag:   'Carbon monetisation',
              },
            ].map((item, i) => (
              <div key={i} style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(128,128,128,0.12)', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: item.color, marginBottom: '0.75rem' }}>{item.tag}</div>
                <div className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e8e8e8', marginBottom: '0.875rem', lineHeight: 1.25 }}>{item.title}</div>
                <p style={{ fontSize: '0.82rem', color: '#737373', lineHeight: 1.8 }}>{item.body}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              {
                stat:  '$1.2T',
                label: 'Annual global building energy waste',
                desc:  'The market we are addressing is not a niche. It is one of the largest inefficiency pools in the global economy.',
                color: '#ef4444',
              },
              {
                stat:  '$50B',
                label: 'Voluntary carbon market by 2030',
                desc:  'Verified energy savings are a recognised asset class. We are building the infrastructure to monetise them at scale.',
                color: '#4ADE80',
              },
              {
                stat:  '40%',
                label: 'Of global energy consumed by buildings',
                desc:  'Commercial and residential buildings are the single largest energy consumer on earth. That is the scale of the opportunity.',
                color: '#60a5fa',
              },
            ].map((s, i) => (
              <div key={i} style={{ padding: '1.75rem', borderRadius: '1rem', border: '1px solid rgba(128,128,128,0.12)', background: 'rgba(255,255,255,0.01)', textAlign: 'center' }}>
                <div className="font-heading" style={{ fontSize: '2.25rem', fontWeight: 700, color: s.color, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>{s.stat}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#c0c0c0', marginBottom: '0.5rem' }}>{s.label}</div>
                <p style={{ fontSize: '0.72rem', color: '#555', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1rem' }}>
            Regulatory tailwinds
          </div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
            The world is legislating<br />in our direction.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '560px', marginBottom: '3rem' }}>
            We do not need to convince building owners that energy efficiency matters. Governments are doing that for us, and they are doing it across every market we intend to enter.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>
            {[
              {
                region:  'India',
                flag:    '🇮🇳',
                mandate: 'BRSR Core — mandatory for 1,000+ listed companies',
                detail:  'Business Responsibility and Sustainability Reporting requires energy consumption disclosure from all SEBI-listed companies. Atmos Premium generates these reports automatically. The regulation is our sales team.',
                color:   '#4ADE80',
              },
              {
                region:  'United Kingdom',
                flag:    '🇬🇧',
                mandate: 'SECR — Streamlined Energy and Carbon Reporting',
                detail:  'UK companies above threshold must report energy use and carbon emissions annually. The UK\'s Net Zero Buildings agenda and the upcoming Energy Efficiency Taskforce recommendations create direct demand for building-level measurement infrastructure.',
                color:   '#60a5fa',
              },
              {
                region:  'European Union',
                flag:    '🇪🇺',
                mandate: 'CSRD — Corporate Sustainability Reporting Directive',
                detail:  'From 2025, over 50,000 EU companies are required to report detailed sustainability data, including Scope 1 and 2 emissions. Building energy consumption is a primary source. Verified, sensor-level data is the difference between a credible report and an estimated one.',
                color:   '#a78bfa',
              },
              {
                region:  'Gulf Cooperation Council',
                flag:    '🌍',
                mandate: 'UAE Net Zero 2050 — Saudi Vision 2030 Green Initiatives',
                detail:  'Both UAE and Saudi Arabia have committed to major energy intensity reductions across their built environments. Commercial building efficiency is a priority vertical, with government-backed incentive schemes for verifiable energy savings. This is a direct match for our carbon credit pipeline.',
                color:   '#eab308',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-[#0f0f0f]" style={{ padding: '1.75rem 2rem', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2.5rem', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.375rem' }}>{item.flag}</div>
                  <div className="font-heading" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e8e8e8', marginBottom: '0.375rem' }}>{item.region}</div>
                  <div style={{ fontSize: '0.7rem', color: item.color, fontWeight: 600 }}>{item.mandate}</div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#737373', lineHeight: 1.8, margin: 0 }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="font-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1.5rem', color: '#e8e8e8' }}>
            The question is not whether the world's buildings will become intelligent.
            <span style={{ color: '#4ADE80' }}> It is who builds the platform they run on.</span>
          </div>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            We have the hardware in the field, the software in production, the regulatory tailwinds behind us across four continents, and a data advantage that compounds with every building we instrument.
          </p>
          <p style={{ color: '#555', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
            A rule-based system is copyable. A model trained on building-years of real energy data from London to Lagos, from Delhi to Dubai, is not. We are not predicting the future. We are building it — one building at a time.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/signup" style={{ fontFamily: 'var(--font-syne)', fontSize: '0.9rem', fontWeight: 700, padding: '0.75rem 2rem', borderRadius: '9999px', background: '#4ADE80', color: '#000', textDecoration: 'none', display: 'inline-block' }}>
              Get started
            </a>
            <a href="/pricing" style={{ fontFamily: 'var(--font-syne)', fontSize: '0.9rem', fontWeight: 700, padding: '0.75rem 2rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', color: '#a3a3a3', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', display: 'inline-block' }}>
              View pricing
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}