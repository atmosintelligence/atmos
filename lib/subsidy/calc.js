// Subsidy Calculator engine. Pure functions, no React, so it can be tested in Node.
// Every number the page shows comes from here.

import { SCHEMES, STATES } from './schemes.js';

// ---- Modelling assumptions (all shown to the user in "How we calculated") ----
export const ASSUMPTIONS = {
  yieldKwhPerKw: 1450,       // annual kWh per installed kW (India average, rooftop)
  degradation: 0.006,        // output lost each year
  tariffEscalation: 0.03,    // yearly rise in the grid tariff
  billShareAvoided: 0.9,     // fixed charges stay on the bill
  co2KgPerKwh: 0.727,        // grid emission factor used across Atmos
  kgCo2PerTreeYear: 24,
  years: 25,
  inverterReplaceYear: 12,
  inverterReplaceShare: 0.08, // of gross cost
  avoidableShare: 0.2,       // Atmos: modelling assumption, not a measured result
  atmosUnitCost: 1809,       // one Atmos device
  loanRateHome: 0.07,        // collateral-free solar loan, up to 3 kW, as announced
  loanRateOther: 0.105,      // indicative bank rate, replace with your quote
  marketLoanRate: 0.11,      // benchmark used to value cheaper MSME money. Not a quote.
  defaultTariff: { home: 7, society: 8, shop: 9, institution: 8, farm: 7 },
  pumpCostPerHp: 65000,      // indicative, replace with your quotation
};

export const SEGMENTS = ['home', 'society', 'shop', 'farm', 'institution'];

export const INCOME_BANDS = [
  { id: 'lt10', mid: 8000,   label: { en: 'Under ₹10,000', hi: '₹10,000 से कम' } },
  { id: '10_25', mid: 17500, label: { en: '₹10,000 to ₹25,000', hi: '₹10,000 से ₹25,000' } },
  { id: '25_50', mid: 37500, label: { en: '₹25,000 to ₹50,000', hi: '₹25,000 से ₹50,000' } },
  { id: '50_100', mid: 75000, label: { en: '₹50,000 to ₹1 lakh', hi: '₹50,000 से ₹1 लाख' } },
  { id: 'gt100', mid: 150000, label: { en: 'Above ₹1 lakh', hi: '₹1 लाख से ऊपर' } },
];

export const DEFAULT_INPUT = {
  segment: 'home',
  state: 'Delhi',
  bill: 2400,            // monthly bill in ₹ (for farms: monthly pump power or diesel spend)
  units: null,           // optional: units per month, overrides bill / tariff
  tariff: null,          // optional override ₹ per unit
  roof: 'own',           // own | rent
  category: 'general',   // general | scst
  income: '10_25',
  flats: 60,             // society only
  pumpHp: 5,             // farm only
  ev: false,
  loanYears: 5,
  cutFirst: false,
  households: 1,
  costOverride: null,    // total project cost override in ₹
};

// ---- Helpers ----
const r0 = (n) => Math.round(n);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const stateInfo = (name) => STATES.find((s) => s.name === name) || { name, special: false };

export function fmtINR(n) {
  const v = Math.round(Number(n) || 0);
  return '₹' + v.toLocaleString('en-IN');
}
export function fmtCompact(n, lang = 'en') {
  const v = Math.abs(Number(n) || 0);
  const s = n < 0 ? '-' : '';
  const hi = lang === 'hi';
  if (v >= 1e7) return `${s}₹${(v / 1e7).toFixed(2).replace(/\.?0+$/, '')} ${hi ? 'करोड़' : 'crore'}`;
  if (v >= 1e5) return `${s}₹${(v / 1e5).toFixed(2).replace(/\.?0+$/, '')} ${hi ? 'लाख' : 'lakh'}`;
  return `${s}₹${Math.round(v).toLocaleString('en-IN')}`;
}
export function fmtNum(n, d = 0) {
  return Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: 0 });
}

// Equal monthly instalment and total interest on a reducing balance.
export function emi(principal, annualRate, years) {
  const n = years * 12;
  if (principal <= 0) return 0;
  const i = annualRate / 12;
  if (i === 0) return principal / n;
  return (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}
export function totalInterest(principal, annualRate, years) {
  return Math.max(0, emi(principal, annualRate, years) * years * 12 - principal);
}

// Indicative cost per kW. Small systems cost more per kW.
export function costPerKw(segment, kw) {
  if (segment === 'shop') return kw <= 10 ? 55000 : 50000;
  if (segment === 'society' || segment === 'institution') return kw <= 10 ? 55000 : 50000;
  return kw <= 3 ? 60000 : kw <= 10 ? 55000 : 50000;
}

// ---- Sizing ----
export function consumption(input) {
  const tariff = Number(input.tariff) > 0 ? Number(input.tariff) : ASSUMPTIONS.defaultTariff[input.segment] || 7;
  const unitsPerMonth = Number(input.units) > 0 ? Number(input.units) : Math.max(0, input.bill / tariff);
  const bill = Number(input.units) > 0 && !(input.bill > 0) ? unitsPerMonth * tariff : input.bill;
  return { tariff, unitsPerMonth, bill };
}

export function sizeKw(unitsPerMonth, segment, flats = 0) {
  const raw = (unitsPerMonth * 12) / ASSUMPTIONS.yieldKwhPerKw;
  let kw = Math.max(1, Math.round(raw * 2) / 2);
  if (segment === 'home') kw = Math.min(kw, 10);
  if (segment === 'society') kw = Math.min(kw, 500, Math.max(3, flats * 3));
  if (segment === 'shop' || segment === 'institution') kw = Math.min(kw, 100);
  return kw;
}

// ---- Scheme rules ----
function centralHomeCfa(kw, special) {
  const first = special ? 33000 : 30000;
  const third = special ? 19800 : 18000;
  const cap = special ? 85800 : 78000;
  const k = Math.min(kw, 3);
  const a = Math.min(k, 2) * first + Math.max(0, k - 2) * third;
  return Math.min(a, cap);
}

// Returns a plain description of the support stack for one scenario at a given size.
function stackFor(input, kw) {
  const seg = input.segment;
  const st = stateInfo(input.state);
  const items = [];       // { id, status: 'applies'|'maybe'|'info'|'no', amount?, interestSaved?, note? }
  const notes = [];
  const kwSubsidised = Math.min(kw, 3);

  let cost;
  let costBasis = 'market';
  const isHome = seg === 'home';
  const ownsRoof = input.roof === 'own';

  // Cost
  if (isHome && input.state === 'Delhi' && !input.costOverride) {
    cost = r0(52000 * Math.min(kw, 3) + costPerKw(seg, kw) * Math.max(0, kw - 3));
    costBasis = 'delhi';
  } else if (isHome && input.state === 'Gujarat' && !input.costOverride) {
    const g = Math.min(kw, 2);
    cost = r0(50000 * g + costPerKw(seg, kw) * (kw - g));
    costBasis = 'gujarat';
  } else {
    cost = r0(costPerKw(seg, kw) * kw);
  }
  if (Number(input.costOverride) > 0) { cost = r0(Number(input.costOverride)); costBasis = 'override'; }

  let central = 0;
  let stateAmt = 0;
  let consumerShare = null;

  // ----- Homes -----
  if (isHome) {
    if (ownsRoof) {
      central = centralHomeCfa(kw, st.special);
      items.push({ id: 'surya_ghar', status: 'applies', amount: central });

      if (input.state === 'Delhi') {
        const cap = Math.min(26000 * kwSubsidised, 78000);
        stateAmt = Math.max(0, Math.min(cap, cost - central));
        items.push({ id: 'delhi_solar', status: 'applies', amount: stateAmt });
        if (consumption(input).unitsPerMonth <= 400) {
          notes.push({ id: 'delhi_free', tone: 'good' });
        }
      }
      if (input.state === 'Gujarat') {
        const g = Math.min(kw, 2);
        const bench = 50000 * g;
        const cfaG = Math.min(30000 * g, central);
        const share = (input.category === 'scst' ? 0.05 : 0.10) * bench;
        stateAmt = Math.max(0, bench - cfaG - share);
        consumerShare = share;
        items.push({ id: 'gujarat_solar', status: 'applies', amount: stateAmt });
      }
      items.push({ id: 'surya_ghar_loan', status: kw <= 3 ? 'maybe' : 'info', note: kw <= 3 ? 'loan' : 'over3' });
    } else {
      items.push({ id: 'surya_ghar', status: 'no', note: 'rent' });
      notes.push({ id: 'rent_path', tone: 'info' });
    }
    if (input.state === 'Tamil Nadu') items.push({ id: 'tn_free_units', status: 'info' });
    if (input.state === 'Karnataka') items.push({ id: 'ka_gruha_jyothi', status: 'info' });
  }

  // ----- Societies -----
  if (seg === 'society') {
    const kwEff = Math.min(kw, 500, input.flats * 3);
    central = Math.min(18000 * kwEff, 18000 * 500);
    items.push({ id: 'surya_ghar_rwa', status: 'applies', amount: central });
    items.push({ id: 'surya_ghar_loan', status: 'info', note: 'society' });
  }

  // ----- Shops (no capital grant; the help is cheaper money) -----
  let interestSaved = 0;
  if (seg === 'shop') {
    notes.push({ id: 'no_grant_shop', tone: 'info' });
    const net = cost;
    if (net >= 1000000) {
      const saved = totalInterest(net, ASSUMPTIONS.marketLoanRate, input.loanYears) - totalInterest(net, 0.07, input.loanYears);
      items.push({ id: 'sidbi_4e', status: 'maybe', interestSaved: Math.max(0, saved), note: 'sidbi_range' });
      interestSaved += Math.max(0, saved);
    } else {
      items.push({ id: 'sidbi_4e', status: 'info', note: 'sidbi_min' });
    }
    const gift = totalInterest(net, ASSUMPTIONS.marketLoanRate, input.loanYears) - totalInterest(net, ASSUMPTIONS.marketLoanRate - 0.02, input.loanYears);
    items.push({ id: 'mse_gift', status: 'maybe', interestSaved: Math.max(0, gift) });
    interestSaved += Math.max(0, gift);
    items.push({ id: 'zed', status: 'info' });
    items.push({ id: 'adeetie', status: 'info' });
  }

  // ----- Farms (solar pump) -----
  if (seg === 'farm') {
    const special = st.special;
    const centralPct = special ? 0.5 : 0.3;
    const statePct = 0.3;
    central = cost * centralPct;
    stateAmt = cost * statePct;
    items.push({ id: 'kusum_b', status: 'applies', amount: central + stateAmt, note: special ? 'special' : 'standard' });
    notes.push({ id: 'kusum_split', tone: 'info' });
  }

  // ----- Institutions: no verified direct grant; third-party routes lead -----
  if (seg === 'institution') {
    notes.push({ id: 'no_grant_inst', tone: 'info' });
  }

  // Central plus state can never exceed the project cost
  const totalSubsidy = Math.min(cost, central + stateAmt);
  const net = Math.max(0, cost - totalSubsidy);

  // Optional EV two-wheeler (separate purchase, counted apart from the roof)
  let ev = 0;
  if (input.ev && (seg === 'home')) {
    ev = 5000;
    items.push({ id: 'e_drive', status: 'applies', amount: ev, note: 'separate' });
  }

  return { kw, cost, costBasis, central: Math.min(cost, central), state: Math.min(Math.max(0, cost - central), stateAmt), consumerShare, totalSubsidy, net, interestSaved, ev, items, notes };
}

// ---- Savings, payback, cash flow ----
function projection(input, stack, annualUnits, tariff, savingsOverrideYear1 = null) {
  const A = ASSUMPTIONS;
  const gen0 = Math.min(stack.kw * A.yieldKwhPerKw, annualUnits);
  const series = [];
  let cum = -stack.net || 0;
  let paybackYears = null;
  let cumSaved = 0;
  let kwhTotal = 0;
  series.push({ year: 0, cum: Math.round(cum) || 0 });
  for (let y = 1; y <= A.years; y++) {
    const gen = gen0 * Math.pow(1 - A.degradation, y - 1);
    const rate = tariff * Math.pow(1 + A.tariffEscalation, y - 1);
    let saved = gen * rate * A.billShareAvoided;
    if (y === 1 && savingsOverrideYear1 != null) saved = savingsOverrideYear1;
    const cost = y === A.inverterReplaceYear ? stack.cost * A.inverterReplaceShare : 0;
    const prev = cum;
    cum += saved - cost;
    cumSaved += saved;
    kwhTotal += gen;
    if (paybackYears === null && cum >= 0) {
      paybackYears = Math.max(0, y - 1 + (saved - cost > 0 ? -prev / (saved - cost) : 0));
    }
    series.push({ year: y, cum: Math.round(cum) });
  }
  const year1 = gen0 * tariff * A.billShareAvoided;
  return { series, paybackYears, year1, lifetimeSaved: cumSaved, lifetimeNet: cum, kwhTotal, gen0 };
}

// ---- Main entry ----
export function calculate(rawInput) {
  const input = { ...DEFAULT_INPUT, ...rawInput };
  const A = ASSUMPTIONS;
  const { tariff, unitsPerMonth, bill } = consumption(input);
  const annualUnits = unitsPerMonth * 12;

  // Farm: size by pump HP, saving from the monthly spend entered
  if (input.segment === 'farm') {
    const cost0 = Number(input.costOverride) > 0 ? Number(input.costOverride) : input.pumpHp * A.pumpCostPerHp;
    const probe = { ...input, costOverride: cost0 };
    const stack = stackFor(probe, input.pumpHp);
    stack.kw = input.pumpHp;
    const yearly = bill * 12;
    // Farm savings: the spend avoided, flat with tariff escalation and a small maintenance allowance
    const series = [{ year: 0, cum: -stack.net || 0 }];
    let cum = -stack.net || 0;
    let payback = null;
    let lifetime = 0;
    for (let y = 1; y <= 20; y++) {
      const saved = yearly * Math.pow(1 + A.tariffEscalation, y - 1) * 0.95;
      const prev = cum;
      cum += saved;
      lifetime += saved;
      if (payback === null && cum >= 0) payback = Math.max(0, y - 1 + (-prev / saved));
      series.push({ year: y, cum: Math.round(cum) });
    }
    return finish(input, { tariff, unitsPerMonth, bill }, stack, { series, paybackYears: payback, year1: yearly * 0.95, lifetimeSaved: lifetime, lifetimeNet: cum, kwhTotal: 0, gen0: 0 }, null);
  }

  const kw = sizeKw(unitsPerMonth, input.segment, input.flats);
  const stack = stackFor(input, kw);
  const proj = projection(input, stack, annualUnits, tariff);

  // "Cut first, then size": Atmos finds avoidable load, so the roof can be smaller.
  const cutUnits = unitsPerMonth * (1 - A.avoidableShare);
  const kwCut = sizeKw(cutUnits, input.segment, input.flats);
  const stackCut = stackFor(input, kwCut);
  const projCut = projection(input, stackCut, cutUnits * 12, tariff);
  const wasteSavedYear1 = bill * 12 * A.avoidableShare * A.billShareAvoided;
  const atmos = {
    kwCut,
    stack: stackCut,
    proj: projCut,
    wasteSavedYear1,
    deviceCost: A.atmosUnitCost,
    devicePaybackMonths: wasteSavedYear1 > 0 ? (A.atmosUnitCost / (wasteSavedYear1 / 12)) : null,
    upfrontDrop: Math.max(0, stack.net - stackCut.net),
  };
  return finish(input, { tariff, unitsPerMonth, bill }, stack, proj, atmos);
}

function finish(input, cons, stack, proj, atmos) {
  const A = ASSUMPTIONS;
  const rate = input.segment === 'home' && stack.kw <= 3 ? A.loanRateHome : A.loanRateOther;
  const loanAmount = stack.net;
  const monthlyEmi = emi(loanAmount, rate, input.loanYears);
  const monthlySaving = proj.year1 / 12;
  const monthOneCash = monthlySaving - monthlyEmi;

  const kwhLife = proj.kwhTotal;
  const co2Year = (proj.gen0 * A.co2KgPerKwh) / 1000; // tonnes
  const co2Life = (kwhLife * A.co2KgPerKwh) / 1000;
  const trees = (co2Year * 1000) / A.kgCo2PerTreeYear;
  const publicMoney = stack.totalSubsidy;
  const rupeesPerTonne = co2Life > 0 ? publicMoney / co2Life : null;

  const band = INCOME_BANDS.find((b) => b.id === input.income) || INCOME_BANDS[1];
  const burdenNow = input.segment === 'home' ? (cons.bill / band.mid) : null;
  const burdenAfter = input.segment === 'home'
    ? Math.max(0, cons.bill - proj.year1 / 12) / band.mid
    : null;

  // Tamil Nadu free-unit line (bi-monthly units)
  let tnLine = null;
  if (input.state === 'Tamil Nadu' && input.segment === 'home') {
    const bi = cons.unitsPerMonth * 2;
    if (bi > 500 && bi <= 600) tnLine = { kind: 'over', biUnits: Math.round(bi), over: Math.round(bi - 500) };
    else if (bi >= 430 && bi <= 500) tnLine = { kind: 'near', biUnits: Math.round(bi), room: Math.round(500 - bi) };
  }

  const households = Math.max(1, Number(input.households) || 1);

  return {
    input,
    consumption: cons,
    kw: stack.kw,
    stack,
    proj,
    atmos,
    loan: { amount: loanAmount, rate, years: input.loanYears, emi: monthlyEmi, monthlySaving, monthOneCash },
    impact: { co2Year, co2Life, trees, publicMoney, rupeesPerTonne, burdenNow, burdenAfter, households,
      community: {
        support: stack.totalSubsidy * households,
        saved: proj.year1 * households,
        co2: co2Year * households,
        lifetimeSaved: proj.lifetimeSaved * households,
      } },
    tnLine,
    totalSupport: stack.totalSubsidy + stack.ev,
    scheme(id) { return SCHEMES[id]; },
  };
}

// Which third-party routes to show first, by situation.
export function thirdPartyOrder(result) {
  const { input } = result;
  const low = input.income === 'lt10' || input.income === '10_25';
  if (input.segment === 'institution') return ['csr', 'ngo', 'resco', 'nbfc'];
  if (input.segment === 'shop') return ['resco', 'nbfc', 'csr', 'ngo'];
  if (input.segment === 'society') return ['resco', 'nbfc', 'csr', 'ngo'];
  if (input.segment === 'farm') return ['ngo', 'nbfc', 'csr', 'resco'];
  if (input.roof === 'rent' || low) return ['ngo', 'csr', 'nbfc', 'resco'];
  return ['nbfc', 'resco', 'ngo', 'csr'];
}

// What to reset to when someone switches who they are.
export const SEGMENT_DEFAULTS = {
  home:        { bill: 2400,  units: null, loanYears: 5, roof: 'own', pumpHp: 5 },
  society:     { bill: 40000, units: null, loanYears: 7, roof: 'own', flats: 60 },
  shop:        { bill: 18000, units: null, loanYears: 7, roof: 'own' },
  institution: { bill: 25000, units: null, loanYears: 7, roof: 'own' },
  farm:        { bill: 4000,  units: null, loanYears: 5, roof: 'own', pumpHp: 5 },
};

export const BILL_RANGE = {
  home: [300, 20000, 100],
  society: [5000, 200000, 1000],
  shop: [2000, 200000, 500],
  institution: [2000, 200000, 500],
  farm: [500, 15000, 250],
};
