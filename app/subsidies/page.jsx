'use client';

import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import Footer from '@/components/Footer';
import InputPanel from '@/components/subsidies/InputPanel';
import { Headline, Kpis, PaybackChart } from '@/components/subsidies/Results';
import { Schemes, ThirdParty } from '@/components/subsidies/Schemes';
import { DEFAULT_INPUT, SEGMENT_DEFAULTS, calculate } from '@/lib/subsidy/calc';
import { PRESETS, tr } from '@/lib/subsidy/i18n';
import { AtmosPanel, ImpactPanel, NextSteps, Method } from '@/components/subsidies/Insights';
import Sources from '@/components/subsidies/Sources';
import './subsidy.css';

export default function SubsidiesPage() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [lang, setLang] = useState('en');
  const [preset, setPreset] = useState('p_delhi');

  const changeLang = (l) => setLang(l);

  const set = useCallback((patch) => {
    setPreset(null);
    setInput((i) => ({ ...i, ...patch }));
  }, []);

  const chooseSegment = useCallback((s) => {
    setPreset(null);
    setInput((i) => ({ ...DEFAULT_INPUT, state: i.state, segment: s, ...SEGMENT_DEFAULTS[s], households: i.households }));
  }, []);

  const reset = useCallback(() => { setPreset('p_delhi'); setInput(DEFAULT_INPUT); }, []);

  const applyPreset = (p) => {
    setPreset(p.id);
    setInput({ ...DEFAULT_INPUT, ...p.input });
  };

  // Typing and dragging stay instant; the results catch up a moment later.
  const deferredInput = useDeferredValue(input);
  const result = useMemo(() => calculate(deferredInput), [deferredInput]);
  const T = (k, v) => tr(lang, k, v);

  return (
    <div className="sub-page min-h-dvh flex flex-col" lang={lang}>
      <main id="main-content" className="flex-1 relative">
        {/* hero */}
        <header className="relative pt-28 pb-8 sm:pb-10">
          <div className="sub-hero-bg" aria-hidden="true" />
          <div className="sub-orb a" aria-hidden="true" />
          <div className="sub-orb b" aria-hidden="true" />
          <div className="relative z-10 mx-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/12 bg-white/60 dark:bg-white/5 px-3.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {T('eyebrow')}
              </span>
              <div className="flex gap-1.5" role="group" aria-label="Language">
                <button type="button" className="sub-chip" aria-pressed={lang === 'en'} onClick={() => changeLang('en')}>English</button>
                <button type="button" className="sub-chip" aria-pressed={lang === 'hi'} onClick={() => changeLang('hi')}>हिन्दी</button>
              </div>
            </div>

            <h1 className="font-heading mt-6 max-w-4xl text-[clamp(2.1rem,5.4vw,4rem)] font-bold leading-[1.05] tracking-tight">
              {lang === 'en' ? (
                <>See what <span className="sub-gradient-text">India will pay</span> for your clean energy.</>
              ) : T('title')}
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">{T('sub')}</p>

            <div className="mt-7">
              <div className="sub-label mb-2.5">{T('try')}</div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button key={p.id} type="button" className="sub-chip" aria-pressed={preset === p.id} onClick={() => applyPreset(p)}>
                    {T(p.id)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* calculator */}
        <div className="relative z-10 mx-auto grid max-w-6xl gap-6 px-6 pb-20 lg:grid-cols-[390px_minmax(0,1fr)] lg:gap-8">
          <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto sub-scroll">
            <InputPanel input={input} set={set} chooseSegment={chooseSegment} reset={reset} lang={lang} />
          </aside>

          <div className="flex min-w-0 flex-col gap-10">
            <div className="flex flex-col gap-4">
              <Headline r={result} lang={lang} />
              <Kpis r={result} lang={lang} />
              <PaybackChart r={result} lang={lang} />
            </div>
            <div className="sub-defer"><Schemes r={result} lang={lang} /></div>
            <div className="sub-defer"><ThirdParty r={result} lang={lang} /></div>
            <div className="sub-defer"><AtmosPanel r={result} lang={lang} /></div>
            <div className="sub-defer"><ImpactPanel r={result} lang={lang} set={set} /></div>
            <div className="sub-defer"><NextSteps r={result} lang={lang} /></div>
            <Method lang={lang} />
            <Sources lang={lang} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
