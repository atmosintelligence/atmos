import Footer from '@/components/Footer';
import { BIBLIOGRAPHY } from '@/lib/bibliography';

export const metadata = {
  title: 'Bibliography',
  description: 'The sources behind the figures used across Atmos.',
};

export default function BibliographyPage() {
  return (
    <main id="main-content" className="min-h-dvh flex flex-col">
      <section className="px-6 pt-32 pb-12 section-border relative overflow-hidden">
        <div className="hero-glow" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-brand mb-4">Bibliography</div>
          <h1 className="font-heading font-bold tracking-tight leading-[1.08] text-[clamp(2.2rem,5vw,3.5rem)]" style={{ color: 'var(--text-heading)' }}>
            Where our numbers come from.
          </h1>
          <p className="mt-5 text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Every figure we show should be checkable. These are the sources we used, grouped by the part of Atmos that uses them. Schemes change often, so always confirm on the official portal before applying.
          </p>
          {BIBLIOGRAPHY.length > 1 && (
            <nav aria-label="Sections" className="mt-6 flex flex-wrap gap-2">
              {BIBLIOGRAPHY.map(s => (
                <a key={s.id} href={`#${s.id}`} className="rounded-full border border-black/10 dark:border-white/12 px-3.5 py-1.5 text-sm">{s.title}</a>
              ))}
            </nav>
          )}
        </div>
      </section>

      {BIBLIOGRAPHY.map(section => (
        <section key={section.id} id={section.id} className="section-pad section-border scroll-mt-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {section.intro}{section.accessed ? ` Accessed ${section.accessed}.` : ''}
            </p>

            <ol className="mt-8 flex flex-col gap-5 list-none p-0">
              {section.entries.map((e, i) => (
                <li key={e.url + e.title} className="flex gap-4">
                  <span className="font-heading text-sm font-bold text-brand min-w-[1.75rem] pt-0.5">[{i + 1}]</span>
                  <div className="min-w-0">
                    <p className="text-sm leading-relaxed">
                      {e.author}. ({e.year}). <i>{e.title}</i>.{' '}
                      <a href={e.url} target="_blank" rel="noopener noreferrer" className="link break-all">{e.url}</a>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>Used for: {e.usedFor}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}

      <Footer />
    </main>
  );
}
