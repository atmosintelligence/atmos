import Footer from '@/components/Footer';

export const metadata = { title: 'Cybersecurity • Atmos Intelligence' };

const eyebrow = (color = '#4ADE80', extra = {}) => ({
  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color, marginBottom: '1rem', ...extra,
});
const h2Style = { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '1.25rem' };
const bodyStyle = { color: '#737373', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.25rem' };

function Bullets({ items, color }) {
  return items.map((pt, i) => (
    <div key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', marginTop: i > 0 ? '0.625rem' : 0 }}>
      <div style={{ width: '5px', height: '5px', borderRadius: '9999px', background: color, marginTop: '0.45rem', flexShrink: 0 }} />
      <span style={{ fontSize: '0.78rem', color: '#737373', lineHeight: 1.65 }}>{pt}</span>
    </div>
  ));
}

function Panel({ color, rgb, title, items }) {
  return (
    <div style={{ padding: '1.5rem', borderRadius: '0.875rem', border: `1px solid rgba(${rgb},0.2)`, background: `rgba(${rgb},0.04)` }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color, marginBottom: '0.75rem' }}>{title}</div>
      <Bullets items={items} color={color} />
    </div>
  );
}

const layers = [
  {
    layer:   'Layer 1: Sensor to server',
    icon:    '📡',
    color:   '#4ADE80',
    current: 'Each unit posts its readings to our API and identifies itself with its own device ID and private key. A request with a wrong or missing key is rejected before anything is stored.',
    future:  'Hash device keys at rest, allow keys to be rotated from the dashboard, and add certificate pinning on the unit.',
  },
  {
    layer:   'Layer 2: Storage',
    icon:    '🗄️',
    color:   '#60a5fa',
    current: 'Everything lives in Supabase, our database and login provider. Supabase encrypts customer data at rest with AES-256 and in transit with TLS. Our server holds the privileged database key as a private environment variable, and every query it runs is limited to the signed-in account.',
    future:  'Field-level encryption for location coordinates, and a documented backup and restore routine.',
  },
  {
    layer:   'Layer 3: Dashboard and API',
    icon:    '🔐',
    color:   '#a78bfa',
    current: 'Sign-in, passwords and sessions are handled by Supabase Auth, so Atmos never stores your password. The session is refreshed on every request. API access uses a Bearer key you create, replace or revoke yourself from the API tab.',
    future:  'Store API keys hashed, add expiry dates, and rate-limit the API.',
  },
  {
    layer:   'Layer 4: AI recommendations',
    icon:    '🧠',
    color:   '#eab308',
    current: 'Our rule engine runs on our own server. Only the short text-writing step goes to a hosted AI model (Groq), and it receives a limited set of data, listed below. Nothing is trained on your readings.',
    future:  'Send only the country instead of coordinates, and add a per-account switch to turn the AI step off.',
  },
];

const aiCards = [
  {
    title: 'What the AI receives',
    icon:  '📨',
    color: '#60a5fa',
    body:  'The latest 48 readings (power, energy, voltage, temperature, humidity, light, occupancy), the rule engine\'s findings, your tariff, your plan, your approximate coordinates with the country they fall in, and recent alert titles. It does not receive your name, email, username or device ID.',
  },
  {
    title: 'What Groq does with it',
    icon:  '⚙️',
    color: '#4ADE80',
    body:  'Groq states that by default it does not retain inference data. Inputs and outputs may be logged for up to 30 days only to fix reliability problems or investigate abuse, unless zero data retention is switched on. Atmos does not use your readings to train any model.',
  },
  {
    title: 'Rules decide, AI words it',
    icon:  '🔎',
    color: '#a78bfa',
    body:  'Every finding starts as a deterministic rule on your readings, such as lights on in an empty room. The AI only rewrites it as a short recommendation in a fixed format. Anything that does not parse is discarded, and if the AI is down the engine\'s own text is shown. Alerts keep their explanation so you can see why they were raised.',
  },
  {
    title: 'Guarded generation',
    icon:  '🛡️',
    color: '#ef4444',
    body:  'Alert generation is authenticated, limited to one run per 30 seconds per account, skips titles already raised in the last hour, and respects your quiet hours. These checks run on the server, so a modified browser cannot skip them.',
  },
];

const principles = [
  { principle: 'Collect little',       number: '01', color: '#4ADE80', desc: 'We store sensor readings, your profile, your tariff and your approximate location. We do not ask for anything we do not use.' },
  { principle: 'Keep accounts apart',  number: '02', color: '#60a5fa', desc: 'API routes check who is asking, then filter every query by that account. One account cannot read another account\'s devices, readings or alerts.' },
  { principle: 'Location with consent', number: '03', color: '#a78bfa', desc: 'Your browser asks before sharing location at sign-up, you can type it in yourself, and you can change it any time in Settings.' },
  { principle: 'Export anything',      number: '04', color: '#eab308', desc: 'Download your readings and recommendations as JSON or PDF from the Settings page whenever you like.' },
  { principle: 'Delete anything',      number: '05', color: '#ef4444', desc: 'Clear a device\'s history, unlink a device, or delete your account from the dashboard. No support ticket needed.' },
  { principle: 'No selling, no ads',   number: '06', color: '#4ADE80', desc: 'Your data is used to run your dashboard and alerts. It is not sold, and it is not used for advertising or profiling.' },
];

const standards = [
  {
    standard: 'DPDP Act',
    full:     'Digital Personal Data Protection Act, 2023',
    region:   '🇮🇳 India',
    status:   'Aligning',
    color:    '#eab308',
    relevance: 'India\'s data protection law. Consent for location, the ability to export and delete your data, and keeping the data we hold small are the parts we are building around first.',
  },
  {
    standard: 'GDPR',
    full:     'General Data Protection Regulation',
    region:   '🇪🇺 European Union',
    status:   'Planned',
    color:    '#60a5fa',
    relevance: 'Becomes relevant when we serve people in the EU. Most of what it asks for (access, erasure, minimisation) overlaps with the DPDP work above.',
  },
  {
    standard: 'ISO 27001',
    full:     'Information Security Management System',
    region:   '🌍 International',
    status:   'Planned',
    color:    '#4ADE80',
    relevance: 'An independent certification of how a company manages security. It suits larger customers, and we will pursue it once the product and team are ready for an audit.',
  },
];

const controls = [
  { where: 'API tab',        action: 'Revoke or regenerate your API key',  desc: 'The old key stops working straight away.',                          color: '#ef4444' },
  { where: 'Settings',       action: 'Change your password',               desc: 'Needs your current password.',                                      color: '#eab308' },
  { where: 'Devices',        action: 'Unlink a sensor',                    desc: 'Frees the device from your account.',                               color: '#60a5fa' },
  { where: 'History',        action: 'Clear a device\'s readings',         desc: 'Export them first from Settings as JSON or PDF if you want a copy.', color: '#a78bfa' },
  { where: 'Settings',       action: 'Delete your account',                desc: 'Removes your login and profile.',                                    color: '#4ADE80' },
];

export default function CybersecurityPage() {
  return (
    <main className="min-h-dvh flex flex-col">

      <section className="min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-16 relative overflow-hidden section-border">
        <div className="hero-glow" />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '740px' }}>
          <div style={{ ...eyebrow('#4ADE80', { letterSpacing: '0.14em', marginBottom: '1.5rem' }) }}>
            Security & Privacy
          </div>
          <h1 className="font-heading" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#e8e8e8', marginBottom: '1.5rem' }}>
            Your building's data<br />is your data.<br />
            <span style={{ color: '#4ADE80' }}>Full stop.</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#737373', lineHeight: 1.8, maxWidth: '540px', margin: '0 auto 2.5rem' }}>
            Atmos handles live energy readings, occupancy and an approximate location. This page explains plainly what we collect, where it lives, who can see it, and what is still on our to-do list.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden', maxWidth: '540px', margin: '0 auto' }}>
            {[
              { value: 'AES-256', label: 'Encrypted at rest, by Supabase', color: '#4ADE80' },
              { value: 'TLS',     label: 'Encrypted in transit',           color: '#60a5fa' },
              { value: 'Never',   label: 'Sold or used for ads',           color: '#ef4444' },
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
              <div style={eyebrow('#ef4444')}>Why it matters</div>
              <h2 className="font-heading" style={h2Style}>
                Energy data says<br />more than it seems.
              </h2>
              <p style={bodyStyle}>
                A power reading looks harmless. Put a few weeks of them next to occupancy and a location, and they show when a room is used, when it is empty, and roughly where it is.
              </p>
              <p style={{ ...bodyStyle, marginBottom: 0 }}>
                A sensor that can be impersonated could also feed false readings into someone's dashboard. So we treat access to readings, and the keys that guard them, as the main things to protect.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { stat: 'Readings', label: 'Power, voltage, temperature, humidity, light and occupancy, sent by your sensor', color: '#ef4444' },
                { stat: 'Profile',  label: 'Username, email, display name, tariff and plan, held by Supabase Auth and our database', color: '#eab308' },
                { stat: 'Location', label: 'Latitude and longitude of your building, used for weather and AI context', color: '#60a5fa' },
                { stat: 'Keys',     label: 'Your device\'s private key and, if you create one, your API key', color: '#a78bfa' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(128,128,128,0.12)', background: 'rgba(255,255,255,0.01)', alignItems: 'flex-start' }}>
                  <div className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color, letterSpacing: '-0.02em', flexShrink: 0, lineHeight: 1.3, minWidth: '4.5rem' }}>{s.stat}</div>
                  <div style={{ fontSize: '0.8rem', color: '#c0c0c0', lineHeight: 1.55 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={eyebrow('#4ADE80', { textAlign: 'center' })}>How it is protected</div>
          <h2 className="font-heading" style={{ ...h2Style, textAlign: 'center', lineHeight: 1.2, marginBottom: '1rem' }}>
            What we do today,<br />and what comes next.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '560px', margin: '0 auto 4rem', textAlign: 'center' }}>
            Supabase is our infrastructure for the database and sign-in. Atmos adds the rules on top: who may read what, and what leaves our server. The roadmap column is not built yet.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>
            {layers.map((item, i) => (
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
              <div style={eyebrow()}>Location</div>
              <h2 className="font-heading" style={h2Style}>
                Location is<br />sensitive too.
              </h2>
              <p style={bodyStyle}>
                We use your building's coordinates to fetch outdoor weather, compare your HVAC against the temperature outside, and give the AI some local context.
              </p>
              <p style={bodyStyle}>
                A precise location tied to an occupancy pattern is more than a place, it is a routine. That is why we are open about exactly where the coordinates go.
              </p>
              <p style={{ ...bodyStyle, marginBottom: 0 }}>
                They are never sold, and never used for advertising or profiling.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Panel color="#4ADE80" rgb="74,222,128" title="Where your coordinates go" items={[
                'Our database, in your profile, as you entered or shared them',
                'Open-Meteo, from our server, to get current outdoor weather. The request carries coordinates only, with no account details',
                'BigDataCloud, from our server, to turn the coordinates into a country name',
                'Groq, inside the AI prompt, together with that country',
              ]} />
              <Panel color="#60a5fa" rgb="96,165,250" title="Your control" items={[
                'Your browser asks permission before sharing location, or you can type it in yourself',
                'Change or replace the coordinates any time in Settings',
                'Enter a nearby point instead of your exact address. Weather does not need more',
              ]} />
              <Panel color="#eab308" rgb="234,179,8" title="Planned hardening" items={[
                'Round coordinates before they leave our server',
                'Send only the country to the AI, not coordinates',
                'Field-level encryption of the stored location',
              ]} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={eyebrow('#4ADE80', { textAlign: 'center' })}>AI security</div>
          <h2 className="font-heading" style={{ ...h2Style, textAlign: 'center', lineHeight: 1.2, marginBottom: '1rem' }}>
            What the AI sees,<br />and what it doesn't.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '580px', margin: '0 auto 4rem', textAlign: 'center' }}>
            Atmos does not run a trained machine-learning model today. A rule engine finds the waste, and a hosted language model turns each finding into a readable recommendation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            {aiCards.map((item, i) => (
              <div key={i} style={{ padding: '1.75rem', borderRadius: '1rem', border: '1px solid rgba(128,128,128,0.12)', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: item.color, marginBottom: '0.5rem' }}>AI layer</div>
                <div className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e8e8e8', marginBottom: '0.75rem', lineHeight: 1.25 }}>{item.title}</div>
                <p style={{ fontSize: '0.82rem', color: '#737373', lineHeight: 1.8, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>

          <div style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(74,222,128,0.15)', background: 'rgba(74,222,128,0.03)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4ADE80', marginBottom: '0.5rem' }}>Looking ahead</div>
                <div className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e8e8e8', marginBottom: '0.625rem' }}>If we train models later, privacy comes first.</div>
                <p style={{ fontSize: '0.82rem', color: '#737373', lineHeight: 1.75, margin: 0 }}>
                  Our roadmap includes machine learning on energy patterns. Before any of that ships, we will remove identifiers from training data, keep accounts separate, and update this page and the Privacy Policy so you know what changed.
                </p>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div className="font-heading" style={{ fontSize: '2rem', fontWeight: 700, color: '#4ADE80', letterSpacing: '-0.03em' }}>None</div>
                <div style={{ fontSize: '0.72rem', color: '#737373', marginTop: '0.25rem', lineHeight: 1.5 }}>models trained<br />on your readings today</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <div style={eyebrow()}>Privacy by design</div>
          <h2 className="font-heading" style={{ ...h2Style, lineHeight: 1.2, marginBottom: '1rem' }}>
            Small, practical habits.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '560px', marginBottom: '3.5rem' }}>
            We follow the spirit of privacy by design: collect little, keep accounts separate, and put you in control. These are things you can check in the product.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {principles.map((item, i) => (
              <div key={i} style={{ padding: '1.75rem', borderRadius: '1rem', border: '1px solid rgba(128,128,128,0.12)', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Practice</div>
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
          <div style={eyebrow('#4ADE80', { textAlign: 'center' })}>Compliance</div>
          <h2 className="font-heading" style={{ ...h2Style, textAlign: 'center', lineHeight: 1.2, marginBottom: '1rem' }}>
            Honest about<br />where we are.
          </h2>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '560px', margin: '0 auto 3.5rem', textAlign: 'center' }}>
            Atmos does not hold a security certification yet. Supabase, which hosts our data, publishes that it is SOC 2 Type 2 compliant, but that covers their platform, not our application. These are the frameworks we are working towards.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(128,128,128,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>
            {standards.map((item, i) => (
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
              <div style={eyebrow()}>If something goes wrong</div>
              <h2 className="font-heading" style={h2Style}>
                You stay<br />in control.
              </h2>
              <p style={bodyStyle}>
                If you think a key has leaked or a device is compromised, you do not have to wait for us. These actions work immediately from your dashboard.
              </p>
              <p style={{ ...bodyStyle, marginBottom: 0 }}>
                If we ever find a problem that affects your data, we will tell affected users directly and say plainly what happened and what we changed. We have not yet written a formal incident-response plan with fixed timelines, and we would rather say so than promise numbers we have not tested.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {controls.map((step, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(128,128,128,0.12)', background: 'rgba(255,255,255,0.01)', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: step.color, lineHeight: 1.3 }}>{step.where}</div>
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
            Trust is built by saying what we do,
            <span style={{ color: '#4ADE80' }}> and doing it.</span>
          </div>
          <p style={{ color: '#737373', fontSize: '0.95rem', lineHeight: 1.8, margin: '0 auto 2.5rem', maxWidth: '520px' }}>
            This page will change as the product does. Questions about how your data is handled are always welcome.
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
