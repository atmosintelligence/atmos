import Link from 'next/link';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';

export const metadata = { title: 'Cybersecurity' };

const SAFEGUARDS = [
  { icon: 'lock',   title: 'Encrypted everywhere',      text: 'Your readings are encrypted on the way to us and while they are stored, using the same standards banks rely on.' },
  { icon: 'shield', title: 'Every account walled off',  text: 'You only ever see your own rooms. Our servers check this on every request, and the database enforces it again on its own.' },
  { icon: 'layers', title: 'Checked on the server',     text: 'The website in your browser never touches stored data directly. Every request goes through our servers, which confirm who you are first.' },
  { icon: 'key',    title: 'Devices prove who they are', text: 'Each Atmos unit has its own secret key. Readings without the right key are turned away before anything is saved.' },
  { icon: 'user',   title: 'Trusted sign-in',           text: 'Sign-in and passwords are handled by an industry-standard provider. Atmos never sees or stores your password.' },
  { icon: 'ai',     title: 'Private by default AI',      text: 'Our AI only sees readings and findings. It never receives your name, email or exact location, and nothing is trained on your data.' },
];

const CONTROLS = [
  { title: 'Export anything',  text: 'Download your readings and recommendations as JSON or PDF whenever you like.' },
  { title: 'Delete anything',  text: 'Clear a device’s history, unlink a device or delete your account yourself. No support ticket needed.' },
  { title: 'Location with consent', text: 'Your browser asks before sharing location, and you can type in a nearby point instead.' },
  { title: 'Keys you control', text: 'Create, replace or revoke your API key at any time. An old key stops working at once.' },
];

const STANDARDS = [
  { name: 'DPDP Act, 2023', region: 'India', status: 'Aligning', text: 'Consent, small data collection, and the right to access and erase your data are built in from the start.' },
  { name: 'GDPR',           region: 'European Union', status: 'Planned', text: 'Most of what it asks for overlaps with our DPDP work, ready for when we serve people in the EU.' },
  { name: 'ISO 27001',      region: 'International', status: 'Planned', text: 'An independent security certification we will pursue as the team and product grow.' },
];

function Eyebrow({ children, center }) {
  return <div className={`text-xs font-bold uppercase tracking-[0.12em] text-brand mb-4 ${center ? 'text-center' : ''}`}>{children}</div>;
}

export default function CybersecurityPage() {
  return (
    <main id="main-content" className="min-h-dvh flex flex-col">
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 relative overflow-hidden section-border">
        <div className="hero-glow" />
        <div className="relative z-10 max-w-3xl">
          <Eyebrow center>Security and privacy</Eyebrow>
          <h1 className="font-heading font-bold tracking-tight leading-[1.05] text-[clamp(2.4rem,6vw,4.25rem)]" style={{ color: 'var(--text-heading)' }}>
            Your room&apos;s data<br />is <span className="text-brand">yours alone.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-relaxed mx-auto max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Energy readings can show when a room is busy and when it is empty. We treat them that way: protected at every step, used only to help you, and never sold.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-px rounded-2xl overflow-hidden max-w-xl mx-auto" style={{ background: 'rgba(128,128,128,0.15)' }}>
            {[
              { value: 'Encrypted', label: 'In transit and at rest' },
              { value: 'Isolated',  label: 'Each account sees only its own data' },
              { value: 'Never',     label: 'Sold or used for ads' },
            ].map(s => (
              <div key={s.value} className="bg-white dark:bg-[#0f0f0f] px-2 py-5 sm:px-4">
                <div className="font-heading text-base sm:text-xl font-bold text-brand">{s.value}</div>
                <div className="mt-1 text-[0.68rem] sm:text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <Eyebrow center>How we keep it safe</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-center mb-4">Protected at every step.</h2>
          <p className="text-center text-[0.95rem] leading-relaxed max-w-2xl mx-auto mb-12" style={{ color: 'var(--text-muted)' }}>
            From the sensor in your room to the dashboard on your phone, each step has its own lock.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAFEGUARDS.map(s => (
              <div key={s.title} className="card" style={{ padding: '1.5rem' }}>
                <span className="text-brand"><Icon name={s.icon} size={24} /></span>
                <h3 className="font-heading font-semibold text-lg mt-3 mb-1.5">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-2 lg:gap-20 items-start">
          <div>
            <Eyebrow>You stay in control</Eyebrow>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-5">
              Collect little.<br />Explain everything.
            </h2>
            <p className="text-[0.95rem] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              We only keep what Atmos needs to work: your readings, your account and an approximate location for local weather. Everything else is in your hands.
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {CONTROLS.map(c => (
              <li key={c.title} className="card flex gap-3" style={{ padding: '1.1rem 1.25rem' }}>
                <span className="text-brand mt-0.5"><Icon name="check" size={18} /></span>
                <div>
                  <div className="font-semibold text-sm">{c.title}</div>
                  <p className="text-sm leading-relaxed mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-5xl mx-auto">
          <Eyebrow center>Standards</Eyebrow>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-center mb-12">Honest about where we are.</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {STANDARDS.map(s => (
              <div key={s.name} className="card" style={{ padding: '1.5rem' }}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.region}</span>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-brand/10 text-brand">{s.status}</span>
                </div>
                <h3 className="font-heading font-semibold text-lg mb-1.5">{s.name}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad section-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-4">Questions about your data?</h2>
          <p className="text-[0.95rem] leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
            Read our <Link href="/privacy" className="link">Privacy Policy</Link>, or write to us at <a href="mailto:atmosintelligence@gmail.com" className="link">atmosintelligence@gmail.com</a>.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/signup" className="btn bg-brand text-brand-on-bg px-7 py-3 rounded-full font-medium text-sm">Get started</Link>
            <Link href="/about" className="btn px-7 py-3 rounded-full font-medium text-sm border border-black/15 dark:border-white/20">About Atmos</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
