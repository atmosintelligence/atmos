'use client';

import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { fmtINR, fmtCompact, fmtNum } from '@/lib/subsidy/calc';
import { tr } from '@/lib/subsidy/i18n';
import { useCountUp } from './ui';

export const C = { central: '#4ADE80', state: '#38bdf8', you: '#fbbf24' };

function Dot({ color }) {
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />;
}

export function Headline({ r, lang }) {
  const T = (k, v) => tr(lang, k, v);
  const { stack, input } = r;
  const isFarm = input.segment === 'farm';
  const grant = r.totalSupport;
  const money = stack.interestSaved;
  const headValue = grant > 0 ? grant : money;
  const shown = useCountUp(headValue);
  const cost = Math.max(1, stack.cost);
  const centralPct = (stack.central / cost) * 100;
  const statePct = (stack.state / cost) * 100;
  const youPct = Math.max(0, 100 - centralPct - statePct);
  const covered = Math.round(((stack.totalSubsidy) / cost) * 100);
  const applies = stack.items.filter((i) => i.status === 'applies' && i.amount > 0).length;

  const label = grant > 0 ? T('found') : money > 0 ? T('foundMoney') : T('found');
  const youShown = useCountUp(stack.net);

  return (
    <div className="sub-hero-card rounded-[1.25rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="sub-label !text-[var(--color-primary-dark)] dark:!text-[var(--color-primary)]">{label}</span>
        <span className="sub-pill applies">
          <Icon name="check" size={12} strokeWidth={2.4} />
          {applies === 0 ? T('schemeCountNone') : applies === 1 ? T('schemeCountOne') : T('schemeCount', { n: applies })}
        </span>
      </div>

      <div className="sub-num mt-3 leading-none text-[clamp(2.6rem,7vw,4.6rem)]" aria-live="polite">
        {fmtINR(shown)}
      </div>

      <p className="mt-3 max-w-xl text-sm sm:text-[0.95rem] leading-relaxed text-neutral-600 dark:text-neutral-400">
        {grant > 0
          ? T(isFarm ? 'coversFarm' : 'covers', { pct: covered, cost: fmtCompact(stack.cost, lang), kw: stack.kw })
          : money > 0 ? T('foundMoneyNote') : T('nogrant')}
      </p>

      {/* the stack */}
      <div className="mt-6">
        <div className="sub-bar" role="img" aria-label={`${T('central')} ${fmtINR(stack.central)}, ${T('state_')} ${fmtINR(stack.state)}, ${T('you')} ${fmtINR(stack.net)}`}>
          {centralPct > 0 && <span style={{ width: `${centralPct}%`, background: C.central }} />}
          {statePct > 0 && <span style={{ width: `${statePct}%`, background: C.state }} />}
          {youPct > 0 && <span style={{ width: `${youPct}%`, background: C.you }} />}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500"><Dot color={C.central} />{T('central')}</div>
            <div className="sub-num mt-1 text-lg">{fmtINR(stack.central)}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500"><Dot color={C.state} />{T('state_')}</div>
            <div className="sub-num mt-1 text-lg">{fmtINR(stack.state)}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500"><Dot color={C.you} />{T('youPay')}</div>
            <div className="sub-num mt-1 text-lg">{fmtINR(youShown)}</div>
          </div>
        </div>
      </div>

      {stack.ev > 0 && (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-black/4 dark:bg-white/6 px-3 py-2 text-xs text-neutral-600 dark:text-neutral-300">
          <Icon name="zap" size={14} /> PM E-DRIVE {T('upto', { x: fmtINR(stack.ev) })}
        </div>
      )}
      <p className="mt-5 text-xs text-neutral-500">{T('indicative')}</p>
    </div>
  );
}

function Kpi({ label, value, note, tone }) {
  return (
    <div className="card p-4 sm:p-5 flex flex-col">
      <div className="sub-label">{label}</div>
      <div className={`sub-num mt-2 text-2xl ${tone === 'good' ? 'text-brand' : tone === 'bad' ? 'text-amber-600 dark:text-amber-400' : ''}`}>{value}</div>
      {note && <p className="mt-2 text-xs leading-relaxed text-neutral-500">{note}</p>}
    </div>
  );
}

export function Kpis({ r, lang }) {
  const T = (k, v) => tr(lang, k, v);
  const { loan, proj, impact, input, stack } = r;
  const pay = proj.paybackYears;
  const payLabel = pay == null ? '—' : pay < 0.1 ? T('immediately') : T('years', { n: pay < 10 ? pay.toFixed(1) : Math.round(pay) });
  const noLoan = stack.net <= 0;
  const cashText = noLoan
    ? T('cash_zero', { save: fmtINR(loan.monthlySaving) })
    : loan.monthOneCash >= 0
      ? T('cash_pos', { save: fmtINR(loan.monthlySaving), emi: fmtINR(loan.emi) })
      : T('cash_neg', { save: fmtINR(loan.monthlySaving), emi: fmtINR(loan.emi) });
  const isFarm = input.segment === 'farm';
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <Kpi label={T('k_payback')} value={payLabel} tone="good" />
      <Kpi label={T('k_cash')} value={(loan.monthOneCash >= 0 ? '+' : '−') + fmtINR(Math.abs(loan.monthOneCash))} tone={loan.monthOneCash >= 0 ? 'good' : 'bad'} note={cashText} />
      <Kpi label={T('k_co2')} value={isFarm ? '—' : `${impact.co2Year.toFixed(1)} t`} note={isFarm ? T('farmCo2') : T('trees', { n: fmtNum(impact.trees) })} />
      <Kpi label={T('k_net')} value={fmtCompact(proj.lifetimeNet, lang)} note={T('netNote', { n: 12 })} />
    </div>
  );
}

// Cumulative position chart. Plain SVG, no chart library, so it loads fast on weak connections.
export function PaybackChart({ r, lang }) {
  const T = (k, v) => tr(lang, k, v);
  const { series, paybackYears } = r.proj;
  const [hover, setHover] = useState(null);

  const W = 640, H = 240, pl = 8, pr = 8, pt = 16, pb = 28;
  const geo = useMemo(() => {
    const ys = series.map((p) => p.cum);
    let lo = Math.min(0, ...ys), hi = Math.max(0, ...ys);
    if (hi === lo) hi = lo + 1;
    const x = (i) => pl + (i / (series.length - 1)) * (W - pl - pr);
    const y = (v) => pt + (1 - (v - lo) / (hi - lo)) * (H - pt - pb);
    const pts = series.map((p, i) => [x(i), y(p.cum)]);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const zeroY = y(0);
    const area = `${line} L${x(series.length - 1).toFixed(1)},${zeroY.toFixed(1)} L${x(0).toFixed(1)},${zeroY.toFixed(1)} Z`;
    return { x, y, pts, line, area, zeroY };
  }, [series]);

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - pl) / (W - pl - pr)) * (series.length - 1));
    setHover(Math.max(0, Math.min(series.length - 1, i)));
  }

  const hp = hover != null ? series[hover] : null;
  const payX = paybackYears != null ? geo.x(Math.min(paybackYears, series.length - 1)) : null;

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-heading text-base font-semibold">{T('chartTitle')}</h3>
        <div className="text-xs text-neutral-500 min-h-[1rem]" aria-live="polite">
          {hp ? `${T('yearN', { n: hp.year })}: ${hp.cum < 0 ? '−' : '+'}${fmtCompact(Math.abs(hp.cum), lang)}` : T('hoverHint')}
        </div>
      </div>
      <p className="mt-1 text-xs text-neutral-500">{T('chartSub')}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full h-auto touch-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img"
        aria-label={T('chartTitle')}>
        <defs>
          <linearGradient id="subArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line x1={pl} x2={W - pr} y1={geo.zeroY} y2={geo.zeroY} stroke="currentColor" strokeOpacity="0.25" strokeDasharray="4 4" />
        <path d={geo.area} fill="url(#subArea)" />
        <path d={geo.line} fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {[0, 5, 10, 15, 20, 25].filter((n) => n < series.length).map((n) => (
          <text key={n} x={geo.x(n)} y={H - 8} fontSize="11" textAnchor={n === 0 ? 'start' : n === 25 ? 'end' : 'middle'} fill="currentColor" fillOpacity="0.5">{n}</text>
        ))}
        {payX != null && paybackYears > 0.1 && (
          <g>
            <line x1={payX} x2={payX} y1={pt} y2={geo.zeroY} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx={payX} cy={geo.zeroY} r="5" fill="#fbbf24" />
          </g>
        )}
        {hp && (
          <g>
            <line x1={geo.pts[hover][0]} x2={geo.pts[hover][0]} y1={pt} y2={H - pb} stroke="currentColor" strokeOpacity="0.3" />
            <circle cx={geo.pts[hover][0]} cy={geo.pts[hover][1]} r="5" fill="#4ADE80" stroke="#0a0a0a" strokeOpacity="0.4" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
}
