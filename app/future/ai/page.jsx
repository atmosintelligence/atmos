import Footer from '@/components/Footer';

export const metadata = { title: 'AI & ML — Atmos Intelligence' };

export default function AiMlPage() {
  return (
    <main className="min-h-dvh flex flex-col">

      <section className="min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-16 relative overflow-hidden section-border">
        <div className="hero-glow" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#4ADE80', marginBottom: '1.5rem' }}>
            The next layer of intelligence
          </div>
          <h1 className="font-heading" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#e8e8e8', marginBottom: '1.5rem' }}>
            Sensors sense.<br />
            Intelligence <span style={{ color: '#4ADE80' }}>decides.</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#737373', lineHeight: 1.75, maxWidth: '540px', margin: '0 auto 2.5rem' }}>
            Every Atmos sensor already streams raw consumption data to our servers. The next phase is not about collecting more of it — it's about understanding it. We are building a machine learning core that finds the patterns a rule engine can't see, and an AI agent that turns those patterns into decisions a building can act on.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#444', lineHeight: 1.7, padding: '1rem 1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(74,222,128,0.03)', maxWidth: '460px', margin: '0 auto' }}>
            This page describes our AI/ML roadmap. Nothing here changes how your data is handled today — every future model trains on the same anonymised, privacy-first pipeline Atmos already runs on.
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1rem' }}>
            Machine learning
          </div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            ML is the core. It has three jobs.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '560px', marginBottom: '4rem' }}>
            Our current rule engine checks readings against eight known thresholds. It's fast and explainable, but it only catches what it was told to look for. Machine learning is what we're building next — trained on building-years of sensor history to do the things a static rule set structurally cannot.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>
            {[
              {
                num:     '01',
                label:   'Pattern detection',
                color:   '#4ADE80',
                heading: 'Find what the rules miss',
                body:    'Every building has its own signature — the HVAC that drifts every summer, the load spike that repeats on the third week of the month. ML trains across thousands of buildings to surface these signatures automatically, without anyone labelling them first.',
              },
              {
                num:     '02',
                label:   'Problem identification',
                color:   '#60a5fa',
                heading: 'Catch faults before they cost',
                body:    'A slow drift in compressor efficiency or a failing sensor rarely trips a hard threshold on day one. ML models are built to notice the trend, not just the breach, and flag degradation while it is still cheap to fix.',
              },
              {
                num:     '03',
                label:   'Prediction & trends',
                color:   '#a78bfa',
                heading: 'See next month, not just today',
                body:    'Forecasting models project consumption, cost, and carbon trajectory forward from historical and seasonal patterns, so a facilities manager can act on where a building is heading, not just where it is right now.',
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
                The AI agent
              </div>
              <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
                From a pattern<br />to a suggestion.
              </h2>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                ML finds what's happening. The AI agent decides what to do about it. Instead of a generic threshold alert, the agent reads the full context of a building — its layout, its occupancy history, its equipment, the season, even the specific pattern ML just surfaced — and produces one tailored, explainable suggestion for that building, at that moment.
              </p>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                This agent becomes the engine behind Atmos Alerts. Every alert a customer sees will trace back to a specific ML-detected pattern and an AI-generated reason, not a static rule that fired the same way for every building on the platform.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Context-aware',   desc: 'Reads occupancy, layout, equipment, and season before suggesting anything' },
                  { label: 'Explainable',     desc: 'Every alert cites the exact pattern and reading that triggered it'       },
                  { label: 'Tailored per building', desc: 'The same anomaly produces a different suggestion in a different building' },
                  { label: 'Feeds Alerts directly',  desc: 'Powers the next generation of Atmos Alerts end to end'            },
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
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#737373', marginBottom: '1rem' }}>Alerts today</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {['Reading crosses a fixed threshold', 'Rule engine fires the matching alert', 'Same message for every building', 'Manager decides what it means'].map((step, i) => (
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
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4ADE80', marginBottom: '1rem' }}>Alerts with AI</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {['ML flags a pattern specific to this building', 'AI agent reads full building context', 'Agent generates a tailored suggestion', 'Manager gets a reason, not just a number'].map((step, i) => (
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
            Intelligence has to scale too.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '580px', marginBottom: '4rem' }}>
            None of this works on our current server footprint. Every new sensor is more inference load, and ML doesn't get cheaper with scale unless the infrastructure underneath it is designed to. Three changes are already on our roadmap.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>
            {[
              {
                stage:  'Now',
                statusColor: '#eab308',
                label:  'Server capacity',
                color:  '#4ADE80',
                body:   'Our current server layer processes every reading centrally. As the sensor fleet grows, this is the first bottleneck — so scaling compute and throughput on the server side is already underway, ahead of any ML rollout, not after it.',
              },
              {
                stage:  'Next',
                statusColor: '#60a5fa',
                label:  'Edge processing',
                color:  '#60a5fa',
                body:   'Not every decision needs a round trip to the server. Moving inference closer to the sensor — running lightweight models on-device — cuts latency, cuts bandwidth, and keeps a building responsive even if connectivity drops.',
              },
              {
                stage:  'In parallel',
                statusColor: '#a78bfa',
                label:  'Dynamic scaling',
                color:  '#a78bfa',
                body:   'Server load is not constant — it spikes with occupancy, weather, and time of day. Dynamic scaling grows and shrinks our compute allocation to match real demand automatically, instead of provisioning for peak load every hour of every day.',
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
              Why this compounds
            </div>
            <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
              A rule set is copyable. A model isn't.
            </h2>
            <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '580px', margin: '0 auto' }}>
              Any competitor can write eight thresholds in an afternoon. None of them have the cross-building, cross-climate sensor history our ML models train on — and every new customer makes that dataset, and every model built on it, better for everyone already on the platform.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { stat: 'Edge',     label: 'Inference moves on-device', desc: 'Decisions happen at the sensor, not just on the server, cutting response time to near-instant.', color: '#60a5fa' },
              { stat: 'Elastic',  label: 'Compute matches demand',    desc: 'Dynamic scaling means we pay for load we actually have, not the peak we might hit.', color: '#a78bfa' },
              { stat: 'Compounding', label: 'Every building teaches the model', desc: 'More sensors mean more training data, which means sharper patterns for every customer.', color: '#4ADE80' },
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
            The sensors are already collecting the data.
            <span style={{ color: '#4ADE80' }}> ML and AI are how we start using it.</span>
          </div>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
            Pattern detection, problem identification, and prediction from ML. Context-aware suggestions and smarter Alerts from AI. Server scale-up, edge processing, and dynamic scaling underneath it all. This is the platform we're building next.
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