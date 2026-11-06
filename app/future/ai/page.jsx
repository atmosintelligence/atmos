import Footer from '@/components/Footer';

export const metadata = { title: 'AI & ML • Atmos Intelligence' };

export default function AiMlPage() {
  return (
    <main className="min-h-dvh flex flex-col">

      <section className="min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-16 relative overflow-hidden section-border">
        <div className="hero-glow" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#4ADE80', marginBottom: '1.5rem' }}>
            How Atmos thinks
          </div>
          <h1 className="font-heading" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#e8e8e8', marginBottom: '1.5rem' }}>
            Sensors sense.<br />
            Intelligence <span style={{ color: '#4ADE80' }}>decides.</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#737373', lineHeight: 1.75, maxWidth: '540px', margin: '0 auto 2.5rem' }}>
            Every Atmos sensor streams power, climate and occupancy readings to our servers. A rule engine finds the waste in them, and an AI model turns each finding into a short recommendation for your room. Machine learning on top of that is the next step, and it is not built yet.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#444', lineHeight: 1.7, padding: '1rem 1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(74,222,128,0.03)', maxWidth: '460px', margin: '0 auto' }}>
            This page separates what runs today from what is planned. For how data is handled, see the Cybersecurity page: nothing is trained on your readings today.
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1rem' }}>
            What runs today
          </div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Rules find it. AI explains it.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '560px', marginBottom: '4rem' }}>
            Today's intelligence has two working parts and one planned part. The rule engine and the AI writer are live in the product. Machine learning is on the roadmap, and we label it that way.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>
            {[
              {
                num:     '01',
                label:   'Live · Rule engine',
                color:   '#4ADE80',
                heading: 'Eight rules, two trend checks',
                body:    'Our own code checks lighting, temperature and humidity, and power against efficiency, comfort and safety limits, compares this week with last week, and estimates the energy and money saved. It uses the time between readings, so a gap in data is not counted as usage. It is fast, predictable and every result can be traced to readings.',
              },
              {
                num:     '02',
                label:   'Live · AI recommendations',
                color:   '#60a5fa',
                heading: 'Findings become advice',
                body:    'A hosted language model (Groq) takes the engine\'s findings plus recent readings and your tariff, and writes short, specific recommendations with a rupee estimate. The output must follow a strict format and is checked before it is saved. If the AI is unavailable, the engine\'s own wording is used instead.',
              },
              {
                num:     '03',
                label:   'Planned · Machine learning',
                color:   '#a78bfa',
                heading: 'Learn what the rules miss',
                body:    'Fixed thresholds only catch what we thought to look for. Models trained on long histories could spot slow drifts, repeating spikes and forecast next month\'s use. This needs far more data than we have, so for now it is a goal, not a feature.',
              },
            ].map((p, i) => (
              <div key={i} className="bg-white dark:bg-[#0f0f0f]" style={{ padding: '2.5rem 2rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: p.color, marginBottom: '0.5rem' }}>
                  {p.num} · {p.label}
                </div>
                <div className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e8e8e8', marginBottom: '0.875rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                  {p.heading}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#737373', lineHeight: 1.75, margin: 0 }}>{p.body}</p>
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
                From finding to advice
              </div>
              <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
                From a finding<br />to a suggestion.
              </h2>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                The rule engine finds what is happening, such as lights left on in an empty room. The AI step then writes what to do about it, using that finding, the last 48 readings, your tariff and your plan, so the advice fits your room rather than reading like a template.
              </p>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                This is how Atmos Alerts are made today. Alerts are saved with the time of the sensor reading they describe, skip anything already raised in the last hour, and stay quiet during your quiet hours.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Grounded',        desc: 'Starts from a rule that fired on real readings, never from a guess'  },
                  { label: 'Checked',         desc: 'Output is parsed against a fixed format; anything else is dropped'   },
                  { label: 'Always available', desc: 'If the AI is down, the engine\'s own text is used so alerts continue' },
                  { label: 'Priced in rupees', desc: 'Savings are estimated from your own tariff'                          },
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
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#737373', marginBottom: '1rem' }}>Engine only</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {['Reading crosses a rule\'s limit', 'Engine writes the standard message', 'Same wording for every room', 'You work out what to do'].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '9999px', border: '1px solid rgba(128,128,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.6rem', color: '#737373', fontWeight: 600 }}>{i + 1}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: i === 3 ? '#737373' : '#a0a0a0' }}>{step}</span>
                      {i === 3 && <span style={{ fontSize: '0.62rem', color: '#ef4444', fontWeight: 600, marginLeft: 'auto' }}>generic</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.04)' }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4ADE80', marginBottom: '1rem' }}>Engine + AI</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {['Engine flags the finding', 'AI reads recent readings and tariff', 'AI writes one specific suggestion', 'You get a reason and a ₹ estimate'].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '9999px', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.6rem', color: '#4ADE80', fontWeight: 700 }}>{i + 1}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#c0c0c0' }}>{step}</span>
                      {i === 3 && <span style={{ fontSize: '0.62rem', color: '#4ADE80', fontWeight: 600, marginLeft: 'auto' }}>tailored</span>}
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
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1rem' }}>
            Infrastructure
          </div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Built to grow in steps.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '580px', marginBottom: '4rem' }}>
            Atmos runs on Vercel for the app and Supabase for data and sign-in, which keeps it simple and cheap to operate today. As sensors grow, three things matter.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>
            {[
              {
                stage:  'Now',
                statusColor: '#4ADE80',
                label:  'Server',
                color:  '#4ADE80',
                body:   'Readings arrive at our API, are stored in Supabase, and the engine analyses the last 30 days of a device on demand, with results cached for a minute. Vercel runs the app as serverless functions, so capacity follows traffic without us managing servers.',
              },
              {
                stage:  'Now',
                statusColor: '#4ADE80',
                label:  'On the sensor',
                color:  '#60a5fa',
                body:   'The unit already makes simple decisions locally. It switches lights, fan and AC off after the delays set on the server, and reports each action back. That keeps the room responsive even when the connection drops.',
              },
              {
                stage:  'Planned',
                statusColor: '#a78bfa',
                label:  'Database and compute plan',
                color:  '#a78bfa',
                body:   'As the number of devices grows we will move up to larger Supabase and Vercel plans, summarise old readings instead of scanning them, and only then consider heavier models.',
              },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-[#0f0f0f]" style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '3rem', alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: s.statusColor + '18', color: s.statusColor, border: `1px solid ${s.statusColor}30`, marginBottom: '0.75rem' }}>
                    {s.stage}
                  </div>
                  <div className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e8e8e8', lineHeight: 1.2 }}>{s.label}</div>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#737373', lineHeight: 1.8, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1rem' }}>
              Our approach
            </div>
            <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
              Rules first. Models when the data is ready.
            </h2>
            <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '580px', margin: '0 auto' }}>
              Rules give results you can check from day one. Models only help once there is enough clean history to learn from, so we are collecting that history carefully and not rushing the model.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { stat: 'Explainable', label: 'Every alert has a reason',  desc: 'Each recommendation starts from a rule and the readings behind it.', color: '#4ADE80' },
              { stat: 'On-device',   label: 'Sensor automation today',    desc: 'The unit switches loads off on its own, using settings from the server.', color: '#60a5fa' },
              { stat: 'Next',        label: 'Learning from history',      desc: 'Forecasting and drift detection once there is enough data to do it well.', color: '#a78bfa' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '1.75rem', borderRadius: '1rem', border: '1px solid rgba(128,128,128,0.12)', background: 'rgba(255,255,255,0.01)', textAlign: 'center' }}>
                <div className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>{s.stat}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#c0c0c0', marginBottom: '0.5rem' }}>{s.label}</div>
                <p style={{ fontSize: '0.72rem', color: '#555', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="font-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1.5rem', color: '#e8e8e8' }}>
            The sensors already collect the data.
            <span style={{ color: '#4ADE80' }}> Rules and AI put it to work.</span>
          </div>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
            A rule engine finds the waste, an AI model explains it in plain words, and machine learning is the next chapter. We will keep this page honest about which is which.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/signup" style={{ fontFamily: 'var(--font-syne)', fontSize: '0.9rem', fontWeight: 700, padding: '0.75rem 2rem', borderRadius: '9999px', background: '#4ADE80', color: '#000', textDecoration: 'none', display: 'inline-block' }}>
              Get started
            </a>
            <a href="/future" style={{ fontFamily: 'var(--font-syne)', fontSize: '0.9rem', fontWeight: 700, padding: '0.75rem 2rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', color: '#a3a3a3', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', display: 'inline-block' }}>
              Back to Our Future
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}