'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { ASSUMPTIONS, fmtINR, fmtCompact, fmtNum } from '@/lib/subsidy/calc';
import { VERIFIED_ON } from '@/lib/subsidy/schemes';
import { tr } from '@/lib/subsidy/i18n';
import { summaryText, pitchText, whatsappUrl, printSummary } from '@/lib/subsidy/summary';
import { Slider } from './ui';
import { C } from './Results';

function Row({ label, a, b, better }) {
  return (
    <div className="grid grid-cols-[1.1fr_1fr_1fr] items-center gap-3 py-3 border-b border-black/8 dark:border-white/8 last:border-b-0 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold">{a}</span>
      <span className={`font-semibold ${better ? 'text-brand' : ''}`}>{b}</span>
    </div>
  );
}

export function AtmosPanel({ r, lang }) {
  const T = (k, v) => tr(lang, k, v);
  if (r.input.segment === 'farm') return null;
  const a = r.atmos;
  const unit = 'kW';
  return (
    <section className="card p-5 sm:p-7 overflow-hidden relative" aria-labelledby="sub-atmos-h">
      <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl pointer-events-none" style={{ background: 'color-mix(in srgb, var(--color-primary) 18%, transparent)' }} />
      <div className="relative">
        <div className="flex items-center gap-2 text-brand"><Icon name="sensor" size={18} /><span className="sub-label !text-inherit">Atmos</span></div>
        <h2 id="sub-atmos-h" className="mt-2 font-heading text-xl sm:text-2xl font-bold tracking-tight">{T('atmosTitle')}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{T('atmosSub')}</p>

        <div className="mt-5">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-3 pb-2 text-xs font-semibold">
            <span />
            <span className="text-neutral-500">{T('solarOnly')}</span>
            <span className="text-brand">{T('withAtmos')}</span>
          </div>
          <Row label={T('roofSize')} a={`${r.kw} ${unit}`} b={`${a.kwCut} ${unit}`} better={a.kwCut < r.kw} />
          <Row label={T('youPayAfter')} a={fmtINR(r.stack.net)} b={fmtINR(a.stack.net)} better={a.stack.net < r.stack.net} />
          <Row label={T('atmosUnit')} a="–" b={fmtINR(a.deviceCost)} />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {a.devicePaybackMonths ? T('deviceBack', { m: Math.max(1, Math.round(a.devicePaybackMonths)) }) : ''}
        </p>
        <p className="mt-2 text-xs text-neutral-500">{T('assumption', { pct: Math.round(ASSUMPTIONS.avoidableShare * 100) })}</p>
        <Link href="/pricing#plans" className="link arrow-link mt-4 text-sm font-medium">
          {T('seeAtmos')} <span className="arrow"><Icon name="arrowRight" size={14} /></span>
        </Link>
      </div>
    </section>
  );
}

function BurdenBar({ label, pct, color }) {
  const w = Math.min(100, pct * 100 * 3); // 33% of income fills the bar, so small shares stay visible
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-neutral-500">{label}</span>
        <span className="sub-num text-lg">{(pct * 100).toFixed(pct < 0.1 ? 1 : 0)}%</span>
      </div>
      <div className="mt-1.5 h-2.5 rounded-full bg-black/8 dark:bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${w}%`, background: color }} />
      </div>
    </div>
  );
}

const SCALE_STEPS = [1, 10, 100, 1000, 10000, 100000];

export function ImpactPanel({ r, lang, set }) {
  const T = (k, v) => tr(lang, k, v);
  const { impact, input } = r;
  const idx = Math.max(0, SCALE_STEPS.indexOf(input.households));
  const n = SCALE_STEPS[idx];
  const isHome = input.segment === 'home';
  const isFarm = input.segment === 'farm';
  const k = impact.community;
  return (
    <section className="card p-5 sm:p-7" aria-labelledby="sub-impact-h">
      <div className="flex items-center gap-2 text-brand"><Icon name="leaf" size={18} /><span className="sub-label !text-inherit">{T('impactTitle')}</span></div>

      <div className="mt-5 grid gap-8 md:grid-cols-2">
        {isHome && (
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-base font-semibold">{T('burden')}</h3>
            <BurdenBar label={T('burdenNow')} pct={impact.burdenNow} color="#fbbf24" />
            <BurdenBar label={T('burdenAfter')} pct={impact.burdenAfter} color={C.central} />
            <p className="text-xs leading-relaxed text-neutral-500">{T('burdenNote')}</p>
          </div>
        )}
        {!isFarm && impact.rupeesPerTonne != null && impact.publicMoney > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="font-heading text-base font-semibold">{T('leverage')}</h3>
            <div className="sub-num text-4xl">{fmtINR(impact.rupeesPerTonne)}</div>
            <p className="text-xs leading-relaxed text-neutral-500">{T('leverageNote')}</p>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-2xl bg-black/4 dark:bg-white/5 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-heading text-base font-semibold">{T('scale')}</h3>
          <span className="text-sm font-semibold text-brand">{T('scaleHouseholds', { n: fmtNum(n) })}</span>
        </div>
        <div className="mt-4">
          <Slider value={idx} min={0} max={SCALE_STEPS.length - 1} step={1} ariaLabel={T('scale')} onChange={(i) => set({ households: SCALE_STEPS[i] })} />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center sm:text-left">
          <div>
            <div className="sub-num text-xl sm:text-2xl">{fmtCompact(k.saved, lang)}</div>
            <div className="text-xs text-neutral-500">{T('scaleSaved')}</div>
          </div>
          <div>
            <div className="sub-num text-xl sm:text-2xl">{fmtCompact(k.support, lang)}</div>
            <div className="text-xs text-neutral-500">{T('scaleSupport')}</div>
          </div>
          <div>
            <div className="sub-num text-xl sm:text-2xl">{isFarm ? '—' : fmtNum(k.co2, k.co2 < 100 ? 1 : 0)}</div>
            <div className="text-xs text-neutral-500">{T('scaleCo2')}</div>
          </div>
        </div>
        <p className="mt-4 text-xs text-neutral-500">{T('scaleNote')}</p>
      </div>
    </section>
  );
}

export function NextSteps({ r, lang }) {
  const T = (k, v) => tr(lang, k, v);
  const [copied, setCopied] = useState('');

  async function copy(text, which) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(''), 1800);
    } catch { /* clipboard blocked: nothing to do */ }
  }
  const text = summaryText(r, lang);
  const forInstitution = r.input.segment === 'institution' || r.input.income === 'lt10';

  const btn = 'btn inline-flex items-center gap-2 rounded-full border border-black/12 dark:border-white/14 px-4 py-2 text-sm font-medium hover:border-brand transition-colors';
  return (
    <section className="card p-5 sm:p-7" aria-labelledby="sub-steps-h">
      <h2 id="sub-steps-h" className="font-heading text-xl sm:text-2xl font-bold tracking-tight">{T('stepsTitle')}</h2>
      <div className="mt-5 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <ol className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="flex gap-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-brand-on-bg text-xs font-bold">{n}</span>
              <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 pt-0.5">{T('step' + n)}</p>
            </li>
          ))}
        </ol>
        <div>
          <h3 className="sub-label">{T('docsTitle')}</h3>
          <ul className="mt-3 flex flex-col gap-2.5">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="flex gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="mt-0.5 shrink-0 text-brand"><Icon name="check" size={15} strokeWidth={2.2} /></span>{T('doc' + n)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-2.5">
        <button type="button" className={btn} onClick={() => copy(text, 'sum')}>
          <Icon name={copied === 'sum' ? 'check' : 'copy'} size={15} />{copied === 'sum' ? T('copied') : T('copy')}
        </button>
        <a className={btn} href={whatsappUrl(text)} target="_blank" rel="noopener noreferrer">
          <Icon name="arrowRight" size={15} />{T('whatsapp')}
        </a>
        <button type="button" className={btn} onClick={() => printSummary(r, lang)}>
          <Icon name="download" size={15} />{T('print')}
        </button>
        {forInstitution && (
          <button type="button" className={btn} onClick={() => copy(pitchText(r, lang), 'pitch')}>
            <Icon name={copied === 'pitch' ? 'check' : 'file'} size={15} />{copied === 'pitch' ? T('copied') : T('pitch')}
          </button>
        )}
      </div>
    </section>
  );
}

export function Method({ lang }) {
  const T = (k, v) => tr(lang, k, v);
  const [open, setOpen] = useState(false);
  return (
    <section className="card p-5 sm:p-7">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between text-left">
        <h2 className="font-heading text-base sm:text-lg font-semibold">{T('methodTitle')}</h2>
        <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}><Icon name="chevronDown" size={18} /></span>
      </button>
      {open && (
        <div className="mt-4">
          <p className="text-sm text-neutral-500">{T('methodIntro')}</p>
          <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 list-disc pl-5">
            <li>{T('m1', { y: ASSUMPTIONS.yieldKwhPerKw })}</li>
            <li>{T('m2')}</li>
            <li>{T('m3')}</li>
            <li>{T('m4', { y: ASSUMPTIONS.inverterReplaceYear })}</li>
            <li>{T('m5')}</li>
            <li>{T('m6')}</li>
            <li>{T('m7')}</li>
          </ul>
        </div>
      )}
      <p className="mt-5 text-xs leading-relaxed text-neutral-500">{T('disclaimer', { d: VERIFIED_ON })}</p>
    </section>
  );
}
