const HIGHLIGHTS = ['Game-changer', 'Makes saving energy effortless', 'Hard to imagine going back the old way'];

export default function Testimonial() {
  return (
    <figure className="card relative mx-auto max-w-3xl flex flex-col sm:flex-row items-center gap-6 sm:gap-9 overflow-hidden" style={{ padding: '1.25rem' }}>
      <div
        aria-hidden="true"
        className="absolute -left-16 -top-16 h-56 w-56 pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent)' }}
      />

      <div className="relative shrink-0 w-40 sm:w-44 aspect-[9/16] overflow-hidden rounded-2xl bg-black border border-black/10 dark:border-white/10 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.5)]">
        <video
          src="/testimony.mp4#t=0.1"
          controls
          playsInline
          preload="metadata"
          aria-label="Video testimonial from Ms. Anshee, Engineer at Google"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="relative min-w-0 text-center sm:text-left">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] mb-3 text-brand">What people say</div>
        <blockquote>
          <p className="font-heading text-xl sm:text-2xl font-semibold tracking-tight leading-snug">
            &ldquo;Forgetfulness piles up and becomes expensiveness, Atmos removes this.&rdquo;
          </p>
        </blockquote>

        <ul className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2 list-none p-0">
          {HIGHLIGHTS.map(h => (
            <li key={h} className="rounded-full border border-black/10 dark:border-white/12 px-3 py-1 text-xs text-neutral-700 dark:text-neutral-300">
              &ldquo;{h}&rdquo;
            </li>
          ))}
        </ul>

        <figcaption className="mt-5 flex items-center justify-center sm:justify-start gap-3">
          <span className="h-9 w-9 rounded-full bg-brand text-brand-on-bg flex items-center justify-center text-sm font-semibold" aria-hidden="true">A</span>
          <span className="text-left">
            <span className="block text-sm font-semibold">Ms. Anshee</span>
            <span className="block text-xs text-neutral-600 dark:text-neutral-400">Engineer at Google</span>
          </span>
        </figcaption>
      </div>
    </figure>
  );
}
