import Footer from '@/components/Footer';

export const metadata = { title: 'Cybersecurity • Atmos Intelligence' };

export default function CybersecurityPage() {
  return (
    <main className="min-h-dvh flex flex-col">

      <section className="min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-16 relative overflow-hidden section-border">
        <div className="hero-glow" />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '740px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#4ADE80', marginBottom: '1.5rem' }}>
            Security & Privacy
          </div>
          <h1 className="font-heading" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#e8e8e8', marginBottom: '1.5rem' }}>
            Your building's data<br />is your data.<br />
            <span style={{ color: '#4ADE80' }}>Full stop.</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#737373', lineHeight: 1.8, maxWidth: '540px', margin: '0 auto 2.5rem' }}>
            Atmos processes sensitive data, with real-time energy consumption, occupancy patterns, geographical location, and building behaviour at scale, across borders. Security is not a feature we add at the end. It is the foundation everything else is built on.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden', maxWidth: '540px', margin: '0 auto' }}>
            {[
              { value: 'AES-256', label: 'Encryption standard', color: '#4ADE80' },
              { value: 'Zero',    label: 'Data sold to third parties', color: '#ef4444' },
              { value: 'GDPR',    label: 'Compliance target', color: '#60a5fa' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-[#0f0f0f]" style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                <div className="font-heading" style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.68rem', color: '#555', lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ef4444', marginBottom: '1rem' }}>
                Why it matters
              </div>
              <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
                IoT is the largest<br />attack surface<br />on the planet.
              </h2>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                By 2030, there will be more than 29 billion connected IoT devices globally. Building sensors, precisely the kind Atmos deploys, are amongst the most frequently targeted, because they are numerous, often unpatched, and connected to critical infrastructure.
              </p>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8 }}>
                A compromised building sensor is not just a data leak. It is a window into occupancy patterns, a vector for lateral movement across a corporate network, and in an autonomous control future, a potential means of physical interference with electrical systems. We take this threat model seriously — because our customers' buildings depend on it.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { stat: '57%',    label: 'Of IoT devices are vulnerable to medium or high-severity attacks', source: 'Palo Alto Networks Unit 42', color: '#ef4444' },
                { stat: '98%',    label: 'Of IoT device traffic is unencrypted in enterprise environments', source: 'IBM Security Report',        color: '#eab308' },
                { stat: '$4.45M', label: 'Average cost of a data breach globally in 2023',                  source: 'IBM Cost of a Data Breach',  color: '#60a5fa' },
                { stat: '3×',     label: 'Faster growth in IoT attacks than traditional endpoint attacks',  source: 'SonicWall Cyber Threat Report', color: '#a78bfa' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(128,128,128,0.12)', background: 'rgba(255,255,255,0.01)', alignItems: 'flex-start' }}>
                  <div className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color, letterSpacing: '-0.03em', flexShrink: 0, lineHeight: 1 }}>{s.stat}</div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#c0c0c0', lineHeight: 1.55, marginBottom: '0.25rem' }}>{s.label}</div>
                    <div style={{ fontSize: '0.65rem', color: '#444' }}>{s.source}</div>
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
            Encryption architecture
          </div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', textAlign: 'center', marginBottom: '1rem' }}>
            Data encrypted at every layer.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '560px', margin: '0 auto 4rem', textAlign: 'center' }}>
            From the moment a sensor reading leaves the hardware device to the moment it appears on your dashboard, it passes through multiple independent encryption boundaries. No single breach point exposes everything.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>
            {[
              {
                layer:   'Layer 1: Hardware transmission',
                icon:    '📡',
                current: 'TLS 1.3 over Wi-Fi. All sensor readings are encrypted in transit the moment they leave the physical device.',
                future:  'Device-level certificate pinning to prevent man-in-the-middle attacks even on compromised networks. Hardware attestation to verify the authenticity of each device before it is permitted to transmit data.',
                color:   '#4ADE80',
              },
              {
                layer:   'Layer 2: Cloud storage',
                icon:    '🗄️',
                current: 'AES-256 encryption at rest on Supabase-managed PostgreSQL infrastructure. Row-level security policies enforce that no user can access another user\'s data — even at the database layer.',
                future:  'Field-level encryption for sensitive columns — location coordinates, device identifiers, and occupancy data encrypted with per-user keys. Key management via a dedicated HSM-backed key store.',
                color:   '#60a5fa',
              },
              {
                layer:   'Layer 3: API and dashboard',
                icon:    '🔐',
                current: 'HTTPS-only. API keys are hashed before storage. Session tokens are HTTP-only cookies, inaccessible to client-side JavaScript. Supabase session management with automatic token rotation.',
                future:  'Mutual TLS for API key authentication. Rate-limiting and anomaly detection on API endpoints to detect credential stuffing and scripted abuse before damage occurs.',
                color:   '#a78bfa',
              },
              {
                layer:   'Layer 4: ML training pipeline',
                icon:    '🧠',
                current: 'Training data is anonymised before any processing. Device identifiers are hashed. Building data is processed in isolation, so no cross-account data is ever joined in identifiable form!',
                future:  'Federated learning architecture: model weights are updated locally on each building\'s data and only gradients, notraw readings, are transmitted to the central model. Privacy-preserving machine learning as a first-class design constraint.',
                color:   '#eab308',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-[#0f0f0f]" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '240px 1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.07em', lineHeight: 1.4 }}>{item.layer}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4ADE80', marginBottom: '0.5rem' }}>Today</div>
                  <p style={{ fontSize: '0.8rem', color: '#737373', lineHeight: 1.75, margin: 0 }}>{item.current}</p>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#60a5fa', marginBottom: '0.5rem' }}>Roadmap</div>
                  <p style={{ fontSize: '0.8rem', color: '#737373', lineHeight: 1.75, margin: 0 }}>{item.future}</p>
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
                Location intelligence
              </div>
              <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
                Geolocation is a<br />security surface too.
              </h2>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                Atmos uses your building's geographical coordinates to fetch outdoor weather data, enabling ventilation recommendations, HVAC efficiency comparisons, and climate-adjusted benchmarking. This is powerful. It is also sensitive.
              </p>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                A precise latitude and longitude tied to an occupancy pattern is not just a location, it is a schedule. It reveals when a building is occupied, when it is empty, and potentially, the routine of the people inside it. We treat this data accordingly.
              </p>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8 }}>
                Location is stored with user consent only, encrypted at the field level, and used exclusively for weather API calls and localised energy benchmarking. It is never shared, never sold, and never used in any form of advertising or profiling.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1.5rem', borderRadius: '0.875rem', border: '1px solid rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.04)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4ADE80', marginBottom: '0.75rem' }}>How location is used</div>
                {[
                  'Outdoor temperature and condition fetched from Open-Meteo. No API key, no account linkage',
                  'Coordinates rounded to 4 decimal places (~11 metre precision). This is sufficient for weather, insufficient for pinpoint tracking',
                  'Weather requests are server-side only! Coordinates never exposed to client-side JavaScript',
                  'Location data is deletable instantly from the Settings page at any time',
                ].map((pt, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', marginTop: i > 0 ? '0.625rem' : 0 }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '9999px', background: '#4ADE80', marginTop: '0.45rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: '#737373', lineHeight: 1.65 }}>{pt}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: '1.5rem', borderRadius: '0.875rem', border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(96,165,250,0.04)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#60a5fa', marginBottom: '0.75rem' }}>Future: location privacy hardening</div>
                {[
                  'Approximate-only mode: users opt into a city-level bounding box rather than precise coordinates for weather queries',
                  'Differential privacy applied to aggregate location data used in regional benchmarking reports',
                  'On-device weather caching: coordinates leave the device as infrequently as possible',
                ].map((pt, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', marginTop: i > 0 ? '0.625rem' : 0 }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '9999px', background: '#60a5fa', marginTop: '0.45rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: '#737373', lineHeight: 1.65 }}>{pt}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: '1.5rem', borderRadius: '0.875rem', border: '1px solid rgba(234,179,8,0.2)', background: 'rgba(234,179,8,0.04)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#eab308', marginBottom: '0.75rem' }}>Alert security</div>
                {[
                  'Alerts are stored per-user with row-level security, so no alert from one account is ever readable by another',
                  'Quiet hours enforcement is server-side, so alert suppression cannot be bypassed by a compromised client',
                  'Alert webhook endpoints (roadmap) will use HMAC signature verification on every delivery',
                ].map((pt, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', marginTop: i > 0 ? '0.625rem' : 0 }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '9999px', background: '#eab308', marginTop: '0.45rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: '#737373', lineHeight: 1.65 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1rem', textAlign: 'center' }}>
            AI and ML security
          </div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', textAlign: 'center', marginBottom: '1rem' }}>
            The model is only as<br />trustworthy as its training.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '580px', margin: '0 auto 4rem', textAlign: 'center' }}>
            Machine learning introduces a new class of security risk that most IoT platforms do not yet account for. As Atmos transitions from rule-based to AI-driven intelligence, we are building security into the model layer from the ground up. We're not retrofitting it afterwards.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            {[
              {
                title:   'Data poisoning defence',
                icon:    '🧪',
                color:   '#ef4444',
                body:    'A malicious actor who can influence training data can corrupt model behaviour silently. As our TensorFlow model trains on cross-building energy data, we implement statistical outlier detection on incoming training samples — anomalous readings are quarantined before they reach the training pipeline, preventing adversarial corruption of predictions and trend signals.',
              },
              {
                title:   'Model inference security',
                icon:    '⚙️',
                color:   '#60a5fa',
                body:    'The model endpoint is not public. Inference requests are authenticated via the same API key system as all other endpoints. Rate limiting and input validation prevent adversarial inputs — crafted sensor readings designed to elicit specific model outputs — from being used to manipulate the optimisation engine or extract information about its training data.',
              },
              {
                title:   'Explainability as a security control',
                icon:    '🔎',
                color:   '#4ADE80',
                body:    'Black-box AI systems are difficult to audit for bias or manipulation. Atmos maintains explainability as a first-class requirement: every AI recommendation links to the specific sensor readings and statistical reasoning that produced it. This is not just good UX, it is the mechanism by which a security auditor, or a customer, can verify that the system is behaving as intended.',
              },
              {
                title:   'Federated learning and privacy',
                icon:    '🌐',
                color:   '#a78bfa',
                body:    'Our roadmap includes federated learning: rather than transmitting raw sensor data to a central training server, model updates are computed locally and only encrypted weight gradients are shared. No raw building data ever leaves the local environment for training purposes. This eliminates the central training dataset as an attack surface entirely.',
              },
            ].map((item, i) => (
              <div key={i} style={{ padding: '1.75rem', borderRadius: '1rem', border: '1px solid rgba(128,128,128,0.12)', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: item.color, marginBottom: '0.5rem' }}>ML Security</div>
                <div className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e8e8e8', marginBottom: '0.75rem', lineHeight: 1.25 }}>{item.title}</div>
                <p style={{ fontSize: '0.82rem', color: '#737373', lineHeight: 1.8, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>

          <div style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(74,222,128,0.15)', background: 'rgba(74,222,128,0.03)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4ADE80', marginBottom: '0.5rem' }}>Context-aware AI: a security consideration</div>
                <div className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e8e8e8', marginBottom: '0.625rem' }}>Personalised recommendations require personal data. We hold that tension deliberately.</div>
                <p style={{ fontSize: '0.82rem', color: '#737373', lineHeight: 1.75, margin: 0 }}>
                  Tailored, context-based energy optimisations, the kind AI makes possible, require the model to know things about your building: its occupancy rhythms, its geography, its equipment profile. The more context the model has, the better the suggestions. The more context it holds, the greater the responsibility. We resolve this tension through data minimisation: the model receives only the features it needs for each specific inference, and no inference result is stored in a form that could reconstruct the input data.
                </p>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div className="font-heading" style={{ fontSize: '2rem', fontWeight: 700, color: '#4ADE80', letterSpacing: '-0.03em' }}>Zero</div>
                <div style={{ fontSize: '0.72rem', color: '#737373', marginTop: '0.25rem', lineHeight: 1.5 }}>raw readings<br />used in training</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1rem' }}>
            Privacy by design
          </div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
            Security is not a setting.<br />It is the architecture.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '560px', marginBottom: '3.5rem' }}>
            Privacy by Design. The ISO 31700 standard requires that privacy protections are embedded into systems from the outset, not bolted on as an afterthought. Every technical decision in Atmos is evaluated against this standard before it is shipped.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              {
                principle: 'Proactive, not reactive',
                desc:      'Security vulnerabilities are anticipated in the design phase. Threat modelling is part of the engineering process, not an audit performed after the fact.',
                color:     '#4ADE80',
                number:    '01',
              },
              {
                principle: 'Privacy as the default',
                desc:      'The most privacy-protective settings are the default. A new user account shares nothing, exposes nothing, and retains everything locally until explicitly instructed otherwise.',
                color:     '#60a5fa',
                number:    '02',
              },
              {
                principle: 'End-to-end security',
                desc:      'Protection applies to data throughout its entire lifecycle — from the sensor reading, through transmission, through processing, through storage, to deletion.',
                color:     '#a78bfa',
                number:    '03',
              },
              {
                principle: 'Full functionality',
                desc:      'Privacy and security are not traded against usability. Stronger security should make the product better, not harder to use. We do not treat them as opposing forces.',
                color:     '#eab308',
                number:    '04',
              },
              {
                principle: 'Visibility and transparency',
                desc:      'Users can see what data is held, export it at any time, and delete it entirely from the Settings page. No hidden retention. No shadow profiles.',
                color:     '#ef4444',
                number:    '05',
              },
              {
                principle: 'Respect for user sovereignty',
                desc:      'The user controls their data. Not the platform. Not the model. Atmos cannot and will not use building data for any purpose the user has not explicitly sanctioned.',
                color:     '#4ADE80',
                number:    '06',
              },
            ].map((item, i) => (
              <div key={i} style={{ padding: '1.75rem', borderRadius: '1rem', border: '1px solid rgba(128,128,128,0.12)', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Principle</div>
                  <div className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(128,128,128,0.2)' }}>{item.number}</div>
                </div>
                <div className="font-heading" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e8e8e8', marginBottom: '0.625rem', lineHeight: 1.3 }}>{item.principle}</div>
                <p style={{ fontSize: '0.78rem', color: '#737373', lineHeight: 1.75, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1rem', textAlign: 'center' }}>
            Compliance roadmap
          </div>
          <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', textAlign: 'center', marginBottom: '1rem' }}>
            Certified for every<br />market we enter.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '540px', margin: '0 auto 3.5rem', textAlign: 'center' }}>
            As Atmos scales internationally, we will achieve and maintain compliance with the data protection and cybersecurity frameworks of every jurisdiction we operate in.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>
            {[
              {
                standard: 'GDPR',
                full:     'General Data Protection Regulation',
                region:   '🇪🇺 European Union',
                status:   'Design phase',
                color:    '#60a5fa',
                relevance: 'Applies to any platform processing data of EU residents. Requires explicit consent, right to erasure, data minimisation, and breach notification within 72 hours. Our architecture is designed around these requirements from the ground up.',
              },
              {
                standard: 'ISO 27001',
                full:     'Information Security Management System',
                region:   '🌍 International',
                status:   'Roadmap: Year 2',
                color:    '#4ADE80',
                relevance: 'The international standard for information security management. Certification provides enterprise customers, institutional investors, and government procurement bodies with independently verified assurance that our security controls meet a recognised benchmark.',
              },
              {
                standard: 'DPDP Act',
                full:     'Digital Personal Data Protection Act',
                region:   '🇮🇳 India',
                status:   'Compliant by design',
                color:    '#eab308',
                relevance: 'India\'s primary data protection legislation, enacted in 2023. Governs how personal data of Indian residents is collected, processed, and stored. Atmos\'s consent-first architecture, data minimisation practices, and user deletion capabilities are aligned with its requirements.',
              },
              {
                standard: 'NIST CSF 2.0',
                full:     'Cybersecurity Framework',
                region:   '🇺🇸 United States',
                status:   'Roadmap: Year 3',
                color:    '#a78bfa',
                relevance: 'The NIST Cybersecurity Framework provides a structured approach to managing cybersecurity risk across Identify, Protect, Detect, Respond, and Recover functions. Alignment with CSF 2.0 is a prerequisite for enterprise sales in US-regulated industries and federal procurement.',
              },
              {
                standard: 'UK Cyber Essentials',
                full:     'NCSC Cyber Essentials Scheme',
                region:   '🇬🇧 United Kingdom',
                status:   'Roadmap: Year 2',
                color:    '#4ADE80',
                relevance: 'The UK government\'s baseline cybersecurity certification scheme, required for all UK public sector contracts. Achieving Cyber Essentials Plus — the independently verified tier — signals to UK enterprise customers that our technical controls meet a government-endorsed minimum standard.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-[#0f0f0f]" style={{ padding: '1.75rem 2rem', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2.5rem', alignItems: 'start' }}>
                <div>
                  <div className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, color: item.color, marginBottom: '0.25rem' }}>{item.standard}</div>
                  <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '0.5rem', lineHeight: 1.4 }}>{item.full}</div>
                  <div style={{ fontSize: '0.68rem', color: '#737373', marginBottom: '0.625rem' }}>{item.region}</div>
                  <div style={{ display: 'inline-block', fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: item.color + '18', color: item.color, border: `1px solid ${item.color}30` }}>
                    {item.status}
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#737373', lineHeight: 1.8, margin: 0 }}>{item.relevance}</p>
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
                Incident response
              </div>
              <h2 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '1.25rem' }}>
                When something<br />goes wrong.
              </h2>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                No system is immune to incidents. What distinguishes a trustworthy platform is not the absence of problems, but the speed and transparency with which they are identified, contained, and communicated.
              </p>
              <p style={{ color: '#737373', fontSize: '0.9rem', lineHeight: 1.8 }}>
                Our incident response plan, currently being formalised for our Year 2 ISO 27001 target, defines clear roles, escalation paths, customer notification timelines, and post-incident review processes. We will publish our security incident history publicly, because transparency is itself a security control.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { time: '< 1 hr',  action: 'Detection and internal escalation',     desc: 'Automated monitoring alerts the on-call engineer. Incident severity is classified. Containment begins.',                             color: '#ef4444' },
                { time: '< 4 hrs', action: 'Containment and impact assessment',     desc: 'Affected systems are isolated. Scope of exposure is determined. Forensic logging begins.',                                             color: '#eab308' },
                { time: '< 24 hrs', action: 'Customer notification',                desc: 'Affected users are notified with plain-language description of what happened, what data was affected, and what we are doing about it.',  color: '#60a5fa' },
                { time: '< 72 hrs', action: 'Regulatory notification where required', desc: 'GDPR and DPDP Act require breach notification to the relevant supervisory authority within 72 hours. We meet this unconditionally.',  color: '#a78bfa' },
                { time: '< 2 wks', action: 'Public post-mortem published',           desc: 'A full account of what happened, why, and what systemic changes prevent recurrence, published to our security changelog.',           color: '#4ADE80' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(128,128,128,0.12)', background: 'rgba(255,255,255,0.01)', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: step.color, lineHeight: 1.3 }}>{step.time}</div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c0c0c0', marginBottom: '0.25rem' }}>{step.action}</div>
                    <div style={{ fontSize: '0.73rem', color: '#555', lineHeight: 1.6 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="font-heading" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1.5rem', color: '#e8e8e8' }}>
            The buildings of the future will be intelligent. They will also be
            <span style={{ color: '#4ADE80' }}> targets.</span>
          </div>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '1.25rem', maxWidth: '520px', margin: '0 auto 1.25rem' }}>
            An autonomous building that controls its own HVAC, lighting, and electrical load — and that is connected to the internet — is a high-value target. We are building Atmos with that future in mind, not after the fact.
          </p>
          <p style={{ color: '#555', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
            Security at Atmos is not a compliance checkbox. It is the reason a building manager in London, a facilities director in Dubai, and an operations team in Singapore can all trust the same platform with the data that runs their buildings.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/signup" style={{ fontFamily: 'var(--font-syne)', fontSize: '0.9rem', fontWeight: 700, padding: '0.75rem 2rem', borderRadius: '9999px', background: '#4ADE80', color: '#000', textDecoration: 'none', display: 'inline-block' }}>
              Get started
            </a>
            <a href="/privacy" style={{ fontFamily: 'var(--font-syne)', fontSize: '0.9rem', fontWeight: 700, padding: '0.75rem 2rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', color: '#a3a3a3', border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none', display: 'inline-block' }}>
              Privacy Policy
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
