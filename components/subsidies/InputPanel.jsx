'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import { STATES } from '@/lib/subsidy/schemes';
import { INCOME_BANDS, BILL_RANGE, fmtINR } from '@/lib/subsidy/calc';
import { tr } from '@/lib/subsidy/i18n';
import { Label, Seg, Slider, RupeeInput } from './ui';

const SEG_ICONS = { home: 'home', society: 'building', shop: 'office', farm: 'droplet', institution: 'school' };
const SEG_ORDER = ['home', 'society', 'shop', 'farm', 'institution'];

export default function InputPanel({ input, set, chooseSegment, reset, lang }) {
  const T = (k, v) => tr(lang, k, v);
  const [open, setOpen] = useState(false);
  const seg = input.segment;
  const [min, max, step] = BILL_RANGE[seg];
  const isHome = seg === 'home';

  return (
    <div className="card p-5 sm:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold">{T('about')}</h2>
        <button type="button" onClick={reset} className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
          {T('reset')}
        </button>
      </div>

      {/* who */}
      <div className="grid grid-cols-5 gap-1.5" role="group" aria-label={T('about')}>
        {SEG_ORDER.map((s) => (
          <button key={s} type="button" className="sub-segcard" aria-pressed={seg === s} onClick={() => chooseSegment(s)}>
            <Icon name={SEG_ICONS[s]} size={20} />
            <span>{T('seg_' + s)}</span>
          </button>
        ))}
      </div>

      {/* where */}
      <div>
        <Label htmlFor="sub-state">{T('state')}</Label>
        <select id="sub-state" className="field-input" value={input.state} onChange={(e) => set({ state: e.target.value })}>
          {STATES.map((s) => (
            <option key={s.name} value={s.name} style={{ color: '#111' }}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* bill */}
      <div>
        <Label htmlFor="sub-bill">{T('bill_' + seg)}</Label>
        <div className="flex items-baseline justify-between mb-3">
          <span className="sub-num text-3xl">{fmtINR(input.bill)}</span>
          <span className="text-xs text-neutral-500">{T('perMonth')}</span>
        </div>
        <Slider value={Math.min(max, Math.max(min, input.bill))} min={min} max={max} step={step} ariaLabel={T('bill_' + seg)} onChange={(v) => set({ bill: v, units: null })} />
        <div className="mt-2 flex justify-between text-[11px] text-neutral-500"><span>{fmtINR(min)}</span><span>{fmtINR(max)}</span></div>
      </div>

      {/* segment specifics */}
      {isHome && (
        <>
          <div>
            <Label>{T('roof')}</Label>
            <Seg value={input.roof} onChange={(v) => set({ roof: v })} options={[{ value: 'own', label: T('roof_own') }, { value: 'rent', label: T('roof_rent') }]} />
          </div>
          <div>
            <Label>{T('category')}</Label>
            <Seg value={input.category} onChange={(v) => set({ category: v })} options={[{ value: 'general', label: T('cat_general') }, { value: 'scst', label: T('cat_scst') }]} />
          </div>
          <div>
            <Label htmlFor="sub-income" hint={T('income_hint')}>{T('income')}</Label>
            <select id="sub-income" className="field-input" value={input.income} onChange={(e) => set({ income: e.target.value })}>
              {INCOME_BANDS.map((b) => (
                <option key={b.id} value={b.id} style={{ color: '#111' }}>{b.label[lang] || b.label.en}</option>
              ))}
            </select>
          </div>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={input.ev} onChange={(e) => set({ ev: e.target.checked })} className="mt-0.5 h-4 w-4 accent-[#15803D] dark:accent-[#4ADE80]" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300 leading-snug">{T('ev')}</span>
          </label>
        </>
      )}

      {seg === 'society' && (
        <div>
          <Label>{T('flats')}</Label>
          <div className="flex items-baseline justify-between mb-3">
            <span className="sub-num text-2xl">{input.flats}</span>
          </div>
          <Slider value={input.flats} min={10} max={500} step={5} ariaLabel={T('flats')} onChange={(v) => set({ flats: v })} />
        </div>
      )}

      {seg === 'farm' && (
        <div>
          <Label>{T('pump')}</Label>
          <Seg value={input.pumpHp} onChange={(v) => set({ pumpHp: v })} options={[3, 5, 7.5, 10].map((v) => ({ value: v, label: `${v} HP` }))} />
        </div>
      )}

      {/* advanced */}
      <div className="border-t border-black/8 dark:border-white/8 pt-4">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
          className="flex w-full items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
          <span>{T('advanced')}</span>
          <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}><Icon name="chevronDown" size={16} /></span>
        </button>
        {open && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sub-units">{T('units')}</Label>
              <RupeeInput id="sub-units" prefix="" suffix="kWh" value={input.units} onChange={(v) => set({ units: v })} />
            </div>
            <div>
              <Label htmlFor="sub-tariff">{T('tariff')}</Label>
              <RupeeInput id="sub-tariff" prefix="₹" value={input.tariff} placeholder="auto" onChange={(v) => set({ tariff: v })} />
            </div>
            <div>
              <Label htmlFor="sub-quote">{T('quote')}</Label>
              <RupeeInput id="sub-quote" prefix="₹" value={input.costOverride} placeholder="auto" onChange={(v) => set({ costOverride: v })} />
            </div>
            <div>
              <Label htmlFor="sub-loan">{T('loanYears')}</Label>
              <select id="sub-loan" className="field-input" value={input.loanYears} onChange={(e) => set({ loanYears: Number(e.target.value) })}>
                {[3, 5, 7, 10].map((y) => <option key={y} value={y} style={{ color: '#111' }}>{y}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
