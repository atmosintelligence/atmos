// Text and print views of a result. Used by Copy, WhatsApp, Print and the sponsor pitch.

import { SCHEMES, VERIFIED_ON } from './schemes.js';
import { fmtINR, fmtCompact } from './calc.js';
import { tr } from './i18n.js';

function siteUrl() {
  try { return window.location.origin + '/subsidies'; } catch { return ''; }
}

function schemeNames(r, lang) {
  return r.stack.items
    .filter((i) => i.status === 'applies' || i.status === 'maybe')
    .map((i) => SCHEMES[i.id].name[lang] || SCHEMES[i.id].name.en);
}

export function summaryText(r, lang) {
  const T = (k, v) => tr(lang, k, v);
  const s = r.stack;
  const pay = r.proj.paybackYears;
  const payText = pay == null ? '–' : pay < 0.1 ? T('immediately') : T('years', { n: pay.toFixed(1) });
  const lines = [
    `Atmos ${T('eyebrow')}: ${T('seg_' + r.input.segment)}, ${r.input.state}`,
    `${T('systemOf')}: ${r.kw} ${r.input.segment === 'farm' ? 'HP' : 'kW'} (${fmtINR(s.cost)})`,
    `${T('found')}: ${fmtINR(r.totalSupport)} (${T('central')} ${fmtINR(s.central)}, ${T('state_')} ${fmtINR(s.state)})`,
    `${T('youPay')}: ${fmtINR(s.net)}`,
    `${T('yearOne')}: ${fmtINR(r.proj.year1)}. ${T('k_payback')}: ${payText}`,
  ];
  if (r.input.segment !== 'farm') lines.push(`${T('k_co2')}: ${r.impact.co2Year.toFixed(1)} t`);
  const names = schemeNames(r, lang);
  if (names.length) lines.push('', names.map((n) => `• ${n}`).join('\n'));
  lines.push('', T('indicative'), T('verified', { d: VERIFIED_ON }), siteUrl());
  return lines.join('\n');
}

export function pitchText(r, lang = 'en') {
  const s = r.stack;
  const unit = r.input.segment === 'farm' ? 'HP' : 'kW';
  return [
    `Clean-energy sponsorship request: ${tr('en', 'seg_' + r.input.segment)}, ${r.input.state}`,
    '',
    `We plan a ${r.kw} ${unit} solar installation, indicatively costing ${fmtINR(s.cost)}.`,
    s.totalSubsidy > 0 ? `Government schemes may cover about ${fmtINR(s.totalSubsidy)}, leaving ${fmtINR(s.net)} to raise.` : `We have not found a direct grant, so we are looking to raise ${fmtINR(s.net)}.`,
    `Expected first-year saving on electricity: ${fmtINR(r.proj.year1)}. Those savings stay with the institution.`,
    r.input.segment !== 'farm' ? `Expected CO₂ avoided: ${r.impact.co2Year.toFixed(1)} tonnes a year, about ${r.impact.co2Life.toFixed(0)} tonnes over 25 years.` : '',
    '',
    'We can share energy reports so you can see what the funding achieved.',
    'Figures are indicative, produced with the Atmos Subsidy Calculator, and need confirmation against written quotations.',
  ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
}

export function whatsappUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// A clean, light, print-friendly page in a new window.
export function printSummary(r, lang) {
  const T = (k, v) => tr(lang, k, v);
  const s = r.stack;
  const rows = r.stack.items
    .filter((i) => i.status === 'applies' || i.status === 'maybe')
    .map((i) => {
      const sc = SCHEMES[i.id];
      const val = i.amount > 0 ? fmtINR(i.amount) : i.interestSaved > 0 ? T('saveInterest', { x: fmtCompact(i.interestSaved, lang) }) : '';
      return `<tr><td>${esc(sc.name[lang] || sc.name.en)}</td><td>${esc(val)}</td><td>${esc(tr(lang, 'b_' + sc.basis))}</td></tr>`;
    }).join('');
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>Atmos ${esc(T('eyebrow'))}</title>
<style>
body{font-family:system-ui,-apple-system,'Noto Sans Devanagari',sans-serif;color:#111;margin:40px auto;max-width:720px;padding:0 20px;line-height:1.5}
h1{font-size:22px;margin:0 0 4px} .sub{color:#555;margin:0 0 24px;font-size:14px}
.big{font-size:44px;font-weight:700;margin:8px 0}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0 24px}
.box{border:1px solid #ddd;border-radius:10px;padding:12px}.box b{display:block;font-size:18px}.box span{font-size:12px;color:#666}
table{width:100%;border-collapse:collapse;font-size:14px}td,th{text-align:left;padding:8px;border-bottom:1px solid #eee}
.foot{margin-top:28px;font-size:12px;color:#666}
</style></head><body>
<h1>Atmos ${esc(T('eyebrow'))}</h1>
<p class="sub">${esc(T('seg_' + r.input.segment))}, ${esc(r.input.state)}. ${esc(T('systemOf'))}: ${r.kw} ${r.input.segment === 'farm' ? 'HP' : 'kW'}</p>
<div>${esc(T('found'))}</div><div class="big">${esc(fmtINR(r.totalSupport))}</div>
<div class="grid">
<div class="box"><b>${esc(fmtINR(s.central))}</b><span>${esc(T('central'))}</span></div>
<div class="box"><b>${esc(fmtINR(s.state))}</b><span>${esc(T('state_'))}</span></div>
<div class="box"><b>${esc(fmtINR(s.net))}</b><span>${esc(T('youPay'))}</span></div>
<div class="box"><b>${esc(fmtINR(r.proj.year1))}</b><span>${esc(T('yearOne'))}</span></div>
<div class="box"><b>${esc(fmtINR(s.cost))}</b><span>${esc(T('indicative'))}</span></div>
<div class="box"><b>${r.input.segment === 'farm' ? '–' : r.impact.co2Year.toFixed(1) + ' t'}</b><span>${esc(T('k_co2'))}</span></div>
</div>
<table><thead><tr><th>${esc(T('schemesTitle'))}</th><th></th><th></th></tr></thead><tbody>${rows}</tbody></table>
<p class="foot">${esc(T('disclaimer', { d: VERIFIED_ON }))}</p>
<script>window.onload=function(){setTimeout(function(){window.print()},250)}</script>
</body></html>`;
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}
