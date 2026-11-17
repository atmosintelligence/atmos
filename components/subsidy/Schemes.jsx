'use client';

import Icon from '@/components/Icon';
import { SCHEMES, KINDS, VERIFIED_ON } from '@/lib/subsidy/schemes';
import { fmtINR, fmtCompact, thirdPartyOrder } from '@/lib/subsidy/calc';
import { tr } from '@/lib/subsidy/i18n';

const ORDER = { applies: 0, maybe: 1, info: 2, no: 3 };
const TP_ICON = { csr: 'building', resco: 'zap', nbfc: 'coin', ngo: 'leaf' };

function Pill({ status, lang }) {
  return <span className={`sub-pill ${status}`}>{tr(lang, 'st_' + status)}</span>;
}

function Basis({ basis, lang }) {
  const tone = basis === 'official' ? 'text-brand' : basis === 'reported' ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-500';
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] ${tone}`}>
      <Icon name={basis === 'official' ? 'shield' : basis === 'reported' ? 'info' : 'link'} size={12} />
      {tr(lang, 'b_' + basis)}
    </span>
  );
}

function SchemeCard({ item, lang, index }) {
  const T = (k, v) => tr(lang, k, v);
  const s = SCHEMES[item.id];
  const kind = KINDS[s.kind];
  const dim = item.status === 'no';
  return (
    <article className={`card p-5 sm:p-6 sub-rise ${dim ? 'opacity-70' : ''}`} style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
          <span className="h-2 w-2 rounded-full" style={{ background: kind.color }} />
          {kind[lang] || kind.en}
        </span>
        <Pill status={item.status} lang={lang} />
        <Basis basis={s.basis} lang={lang} />
      </div>

      <h3 className="mt-3 font-heading text-base sm:text-lg font-semibold leading-snug">{s.name[lang] || s.name.en}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{s.benefit[lang] || s.benefit.en}</p>

      {(item.amount > 0 || item.interestSaved > 0 || item.note) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {item.amount > 0 && (
            <span className="rounded-lg bg-black/5 dark:bg-white/8 px-3 py-1.5 text-sm font-semibold">
              {T('worth')} {fmtINR(item.amount)}
            </span>
          )}
          {item.interestSaved > 0 && (
            <span className="rounded-lg bg-black/5 dark:bg-white/8 px-3 py-1.5 text-sm font-semibold">
              {T('saveInterest', { x: fmtCompact(item.interestSaved, lang) })}
            </span>
          )}
          {item.note && T('n_' + item.note) !== 'n_' + item.note && (
            <span className="text-xs text-neutral-500">{T('n_' + item.note)}</span>
          )}
        </div>
      )}

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
        <div>
          <dt className="sub-label">{T('whoFor')}</dt>
          <dd className="mt-1 text-neutral-600 dark:text-neutral-400 leading-relaxed">{s.who[lang] || s.who.en}</dd>
        </div>
        <div>
          <dt className="sub-label">{T('howTo')}</dt>
          <dd className="mt-1 text-neutral-600 dark:text-neutral-400 leading-relaxed">{s.how[lang] || s.how.en}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
        <a href={s.link} target="_blank" rel="noopener noreferrer" className="link arrow-link font-medium">
          {T('officialSite')} <span className="arrow"><Icon name="arrowRight" size={13} /></span>
        </a>
        <span>{T('verified', { d: VERIFIED_ON })}</span>
      </div>
    </article>
  );
}

function Note({ children, tone = 'info' }) {
  const cls = tone === 'good'
    ? 'border-brand bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]'
    : tone === 'warn'
      ? 'border-amber-500/50 bg-amber-500/10'
      : 'border-black/10 dark:border-white/10 bg-black/3 dark:bg-white/4';
  const icon = tone === 'warn' ? 'warning' : tone === 'good' ? 'check' : 'info';
  return (
    <div className={`flex gap-3 rounded-xl border p-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 ${cls}`}>
      <span className="mt-0.5 shrink-0"><Icon name={icon} size={16} /></span>
      <p>{children}</p>
    </div>
  );
}

export function Schemes({ r, lang }) {
  const T = (k, v) => tr(lang, k, v);
  const items = [...r.stack.items].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const notes = r.stack.notes;
  return (
    <section aria-labelledby="sub-schemes-h">
      <h2 id="sub-schemes-h" className="font-heading text-xl sm:text-2xl font-bold tracking-tight">{T('schemesTitle')}</h2>
      <p className="mt-2 text-sm text-neutral-500 max-w-2xl">{T('schemesSub')}</p>

      <div className="mt-5 flex flex-col gap-3">
        {r.tnLine && <Note tone="warn">{r.tnLine.kind === 'over' ? T('tn_over', { bi: r.tnLine.biUnits, over: r.tnLine.over }) : T('tn_near', { bi: r.tnLine.biUnits, room: r.tnLine.room })}</Note>}
        {notes.map((n) => <Note key={n.id} tone={n.tone === 'good' ? 'good' : 'info'}>{T('n_' + n.id)}</Note>)}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-1">
        {items.length === 0
          ? <p className="card p-6 text-sm text-neutral-500">{T('none')}</p>
          : items.map((it, i) => <SchemeCard key={it.id} item={it} lang={lang} index={i} />)}
      </div>
    </section>
  );
}

export function ThirdParty({ r, lang }) {
  const T = (k, v) => tr(lang, k, v);
  const order = thirdPartyOrder(r);
  return (
    <section aria-labelledby="sub-tp-h">
      <h2 id="sub-tp-h" className="font-heading text-xl sm:text-2xl font-bold tracking-tight">{T('tpTitle')}</h2>
      <p className="mt-2 text-sm text-neutral-500 max-w-2xl">{T('tpSub')}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {order.map((id, i) => {
          const s = SCHEMES[id];
          return (
            <article key={id} className="card p-5 flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: 'rgba(192,132,252,0.16)', color: '#a855f7' }}>
                  <Icon name={TP_ICON[id]} size={18} />
                </span>
                {i === 0 && <span className="sub-pill applies">{T('tpFirst')}</span>}
              </div>
              <h3 className="mt-3 font-heading text-base font-semibold leading-snug">{s.name[lang] || s.name.en}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{s.benefit[lang] || s.benefit.en}</p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">{s.how[lang] || s.how.en}</p>
              <div className="mt-auto pt-4">
                <a href={s.link} target="_blank" rel="noopener noreferrer" className="link arrow-link text-xs font-medium">
                  {T('officialSite')} <span className="arrow"><Icon name="arrowRight" size={13} /></span>
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {/* An idea, clearly labelled. Not a live product. */}
      <div className="mt-4 rounded-2xl border border-dashed border-black/20 dark:border-white/20 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-heading text-base font-semibold">{T('conceptTitle')}</h3>
          <span className="sub-pill maybe">{T('concept')}</span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{T('conceptBody')}</p>
      </div>
    </section>
  );
}
