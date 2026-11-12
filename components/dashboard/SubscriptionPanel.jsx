'use client';

import { useEffect, useState } from 'react';
import { getSubscription, updateSubscription } from '@/lib/supabase';
import { useDevice } from '@/app/dashboard/DeviceContext';
import Icon from '@/components/Icon';

// Plans match the public pricing page. Prices are per unit, per month.
const PLANS = {
  spark:      { label: 'Spark',      price: '₹0',     color: '#737373', text: 'Free for up to 2 devices.',
                features: ['10-minute refresh', 'Up to 2 devices', 'Alerts and analysis'] },
  basic:      { label: 'Basic',      price: '₹349',   color: '#3b82f6', text: 'For homes and small offices.',
                features: ['10-minute refresh', 'Unlimited devices', 'Simple export'] },
  premium:    { label: 'Premium',    price: '₹699',   color: '#16a34a', text: 'For teams that want faster data and an API.',
                features: ['30-second refresh', 'Unlimited devices', 'Advanced export', 'API access'] },
  enterprise: { label: 'Enterprise', price: 'Custom', color: '#8b5cf6', text: 'For large portfolios. Priced with you.',
                features: ['30-second refresh', 'Unlimited devices', 'Dedicated support', 'Advanced export and API'] },
};
const ORDER = ['spark', 'basic', 'premium', 'enterprise'];

const fmtDate = s => (s ? new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');
const daysUntil = s => (s ? Math.ceil((new Date(s) - Date.now()) / 86400000) : null);

const DEMO_SUB = () => ({
  plan: 'premium',
  last_payment_at: new Date().toISOString(),
  next_payment_at: new Date(Date.now() + 30 * 86400000).toISOString(),
});

// Current plan, billing dates and upgrade options. Sits at the top of Settings.
export default function SubscriptionPanel() {
  const { isDemo, subCache, setSubCacheData } = useDevice();
  const [sub, setSub]         = useState(null);
  const [status, setStatus]   = useState('loading');
  const [busy, setBusy]       = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [msg, setMsg]         = useState('');
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    if (isDemo) { setSub(DEMO_SUB()); setStatus('ready'); return; }
    if (subCache) { setSub(subCache); setStatus('ready'); return; }
    getSubscription().then(data => {
      if (!data) { setStatus('error'); return; }
      setSub(data); setSubCacheData(data); setStatus('ready');
    });
  }, [isDemo]);

  async function change(plan) {
    if (confirm !== plan) { setConfirm(plan); return; }
    setBusy(true); setMsg('');
    const now = new Date();
    const next = new Date(now); next.setMonth(next.getMonth() + 1);
    const patch = {
      plan,
      last_payment_at: plan === 'spark' ? null : now.toISOString(),
      next_payment_at: plan === 'spark' ? null : next.toISOString(),
    };
    const { error } = await updateSubscription(patch);
    if (error) setMsg(error.message);
    else {
      const updated = { ...sub, ...patch };
      setSub(updated); setSubCacheData(updated);
      setMsg(`Plan changed to ${PLANS[plan].label}.`);
      setShowPlans(false);
    }
    setConfirm(null); setBusy(false);
  }

  if (status === 'loading') return <div className="dash-card" aria-busy="true"><div className="dash-card-sub">Loading your plan...</div></div>;
  if (status === 'error' || !sub) return <div className="dash-card dash-error" role="alert">We could not load your subscription. Try refreshing the page.</div>;

  const plan = PLANS[sub.plan] ?? PLANS.spark;
  const idx = ORDER.indexOf(sub.plan);
  const days = daysUntil(sub.next_payment_at);
  const overdue = days !== null && days < 0;
  const soon = days !== null && days >= 0 && days <= 5;
  const upgrades = ORDER.slice(idx + 1);

  return (
    <section className="dash-card" aria-labelledby="sub-title" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="dash-card-head">
        <div>
          <div id="sub-title" className="dash-card-sub" style={{ marginTop: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>Your plan</div>
          <div className="font-heading" style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', color: plan.color }}>{plan.label}</div>
          <p className="dash-card-sub">{plan.text}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="font-heading" style={{ fontSize: '1.4rem', fontWeight: 700 }}>{plan.price}</div>
          {sub.plan !== 'spark' && sub.plan !== 'enterprise' && <div className="dash-card-sub" style={{ marginTop: 0 }}>per unit, per month</div>}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
        {plan.features.map(f => (
          <span key={f} className="dash-opt-badge" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: `${plan.color}18`, color: plan.color }}>
            <Icon name="check" size={12} /> {f}
          </span>
        ))}
      </div>

      {sub.plan !== 'spark' && (
        <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))' }}>
          <div>
            <div className="dash-stat-label">Last payment</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{fmtDate(sub.last_payment_at)}</div>
          </div>
          <div>
            <div className="dash-stat-label">{overdue ? 'Payment overdue' : 'Next payment'}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: overdue ? '#ef4444' : soon ? '#b45309' : undefined }}>
              {fmtDate(sub.next_payment_at)}
              {days !== null && <span className="dash-card-sub" style={{ marginLeft: '0.4rem' }}>{overdue ? `${Math.abs(days)} days late` : days === 0 ? 'today' : `in ${days} days`}</span>}
            </div>
          </div>
        </div>
      )}

      {msg && <p role="status" style={{ fontSize: '0.8rem', color: /changed/i.test(msg) ? 'var(--color-primary-dark)' : '#ef4444' }}>{msg}</p>}

      {upgrades.length > 0 && (
        <>
          <div>
            <button type="button" className="dash-btn ghost" aria-expanded={showPlans} onClick={() => setShowPlans(s => !s)}>
              {showPlans ? 'Hide plans' : 'See other plans'}
              <Icon name="chevronDown" size={14} />
            </button>
          </div>
          {showPlans && (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {upgrades.map(key => {
                const p = PLANS[key];
                return (
                  <li key={key} className="dash-card" style={{ padding: "0.875rem 1rem", flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: p.color }}>{p.label} <span style={{ color: 'inherit', fontWeight: 500 }}>· {p.price}{key !== 'enterprise' && ' per unit/month'}</span></div>
                      <div className="dash-card-sub" style={{ marginTop: '0.1rem' }}>{p.text}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      {key === 'enterprise' ? (
                        <a className="dash-btn primary sm" href="mailto:atmosintelligence@gmail.com?subject=Atmos%20Enterprise">Talk to us</a>
                      ) : confirm === key ? (
                        <>
                          <button type="button" className="dash-btn primary sm" disabled={isDemo || busy} onClick={() => change(key)}>Confirm</button>
                          <button type="button" className="dash-btn ghost sm" onClick={() => setConfirm(null)}>Cancel</button>
                        </>
                      ) : (
                        <button type="button" className="dash-btn primary sm" disabled={isDemo || busy} onClick={() => change(key)}>
                          {isDemo ? 'Not in demo' : 'Choose'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {sub.plan === 'spark' && showPlans && (
            <p className="dash-card-sub">Payments are not connected yet, so choosing a plan only switches your plan here.</p>
          )}
        </>
      )}

      <p className="dash-card-sub">Billing questions? Write to <a className="link" href="mailto:atmosintelligence@gmail.com">atmosintelligence@gmail.com</a>.</p>
    </section>
  );
}
