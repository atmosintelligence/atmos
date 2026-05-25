'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useDevice } from '../DeviceContext';

const PLANS = {
  spark: {
    label: 'Spark',
    price: '₹0',
    color: '#737373',
    description: 'Free forever. Basic monitoring for up to 2 devices.',
    features: ['2 sensor units', '10-min refresh', 'Live dashboard', '30-day history'],
  },
  basic: {
    label: 'Basic',
    price: '₹349',
    color: '#60a5fa',
    description: 'Recommendations and reporting for growing teams.',
    features: ['Unlimited units', '10-min refresh', 'Top 5 recommendations', 'Monthly PDF report'],
  },
  premium: {
    label: 'Premium',
    price: '₹699',
    color: '#4ADE80',
    description: 'Real-time intelligence for serious operations.',
    features: ['30-sec refresh', 'Real-time alerts', 'Predictive maintenance', 'BRSR compliance', 'API access'],
  },
  enterprise: {
    label: 'Enterprise',
    price: 'Custom',
    color: '#a78bfa',
    description: 'Tailored for large portfolios and institutions.',
    features: ['Everything in Premium', 'Dedicated manager', 'White-label reports', 'Custom integrations'],
  },
};

const UPGRADE_ORDER = ['spark', 'basic', 'premium', 'enterprise'];

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function daysUntil(str) {
  if (!str) return null;
  const diff = Math.ceil((new Date(str) - Date.now()) / 86400000);
  return diff;
}

export default function SubscriptionPage() {
  const [sub, setSub]           = useState(null);
  const [status, setStatus]     = useState('loading');
  const [upgrading, setUpgrading] = useState(false);
  const [targetPlan, setTargetPlan] = useState(null);
  const [confirmPlan, setConfirmPlan] = useState(null);
  const [msg, setMsg]           = useState('');

  const { getSubCache, setSubCacheData } = useDevice();

  useEffect(() => {
    const cached = getSubCache();
    if (cached) { setSub(cached); setStatus('ready'); return; }
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error || !data) { setStatus('error'); return; }
      setSub(data);
      setSubCacheData(data);
      setStatus('ready');
    });
    setSubCacheData(data);
  }, []);

  async function handleUpgrade(plan) {
    const cleanPlan = plan.replace('down-', '');
    const confirmKey = confirmPlan;
    if (confirmKey !== plan) { setConfirmPlan(plan); return; }
    setUpgrading(true);
    setMsg('');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUpgrading(false); return; }

    const now = new Date();
    const nextPayment = new Date(now);
    nextPayment.setMonth(nextPayment.getMonth() + 1);

    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan: cleanPlan,
        last_payment_at: cleanPlan === 'spark' ? null : now.toISOString(),
        next_payment_at: cleanPlan === 'spark' ? null : nextPayment.toISOString(),
      })
      .eq('user_id', user.id);

    if (!error) {
      const updated = { ...sub, plan: cleanPlan, last_payment_at: cleanPlan === 'spark' ? null : now.toISOString(), next_payment_at: cleanPlan === 'spark' ? null : nextPayment.toISOString() };
      setSub(updated);
      setSubCacheData(updated);
      setMsg(`Plan changed to ${PLANS[cleanPlan].label}.`);
    } else {
      setMsg(error.message);
    }
    setConfirmPlan(null);
    setUpgrading(false);
  }

  if (status === 'loading') return <div className="dash-empty" style={{ border: 'none' }}>Loading...</div>;
  if (status === 'error')   return <div className="dash-empty" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>Failed to load subscription.</div>;

  const currentPlan  = PLANS[sub.plan];
  const currentIndex = UPGRADE_ORDER.indexOf(sub.plan);
  const days         = daysUntil(sub.next_payment_at);
  const isOverdue    = days !== null && days < 0;
  const isUrgent     = days !== null && days <= 5 && days >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '680px' }}>
      <div className="dash-greeting">
        <div className="dash-greeting-name">Subscription</div>
        <div className="dash-greeting-sub">Your current plan, billing details, and upgrade options.</div>
      </div>

      <div className="dash-device-card" style={{ borderColor: currentPlan.color + '40' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: currentPlan.color, marginBottom: '0.375rem' }}>
              Current plan
            </div>
            <div className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: currentPlan.color }}>
              {currentPlan.label}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#737373', marginTop: '0.25rem' }}>{currentPlan.description}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="font-heading" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{currentPlan.price}</div>
            {sub.plan !== 'spark' && sub.plan !== 'enterprise' && (
              <div style={{ fontSize: '0.7rem', color: '#737373' }}>per unit / month</div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem 0', borderTop: '1px solid rgba(128,128,128,0.15)', borderBottom: '1px solid rgba(128,128,128,0.15)', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#737373', marginBottom: '0.3rem' }}>Last payment</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{fmtDate(sub.last_payment_at)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#737373', marginBottom: '0.3rem' }}>
              {isOverdue ? 'Payment overdue' : 'Next payment due'}
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: isOverdue ? '#ef4444' : isUrgent ? '#eab308' : 'inherit' }}>
              {fmtDate(sub.next_payment_at)}
              {days !== null && (
                <span style={{ fontSize: '0.72rem', color: isOverdue ? '#ef4444' : isUrgent ? '#eab308' : '#737373', marginLeft: '0.4rem' }}>
                  {isOverdue ? `${Math.abs(days)} days overdue` : days === 0 ? 'due today' : `in ${days} days`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#737373', marginBottom: '0.5rem' }}>Included in your plan</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {currentPlan.features.map(f => (
              <span key={f} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: currentPlan.color + '15', color: currentPlan.color, fontWeight: 500 }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {msg && (
        <p style={{ fontSize: '0.8rem', color: msg.includes('Successfully') ? 'var(--color-primary-dark)' : '#ef4444' }}>{msg}</p>
      )}

      {sub.plan !== 'enterprise' && (
        <div>
          <div className="dash-section-title">Upgrade your plan</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {UPGRADE_ORDER.slice(currentIndex + 1).map(planKey => {
              const plan = PLANS[planKey];
              const isConfirming = confirmPlan === planKey;
              return (
                <div key={planKey} className="dash-device-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: plan.color }}>{plan.label}</div>
                    <div style={{ fontSize: '0.72rem', color: '#737373', marginTop: '0.2rem' }}>{plan.description}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span className="font-heading" style={{ fontSize: '0.9rem', fontWeight: 700 }}>{plan.price}</span>
                    {planKey !== 'enterprise' && <span style={{ fontSize: '0.65rem', color: '#737373' }}>/unit/mo</span>}
                    {isConfirming ? (
                      <>
                        <button
                          onClick={() => handleUpgrade(planKey)}
                          disabled={upgrading}
                          className="btn bg-brand text-brand-on-bg"
                          style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.375rem 0.75rem', borderRadius: '0.5rem' }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmPlan(null)}
                          style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.06)', color: '#737373', border: 'none', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(planKey)}
                        className="btn bg-brand text-brand-on-bg"
                        style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.375rem 0.75rem', borderRadius: '0.5rem' }}
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {sub.plan === 'spark' && (
            <p style={{ fontSize: '0.72rem', color: '#737373', marginTop: '0.75rem' }}>
              Upgrading simulates a plan change. Real payment integration can be wired in when ready.
            </p>
          )}
        </div>
      )}

      {currentIndex > 0 && (
        <div>
          <div className="dash-section-title">Downgrade</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {UPGRADE_ORDER.slice(0, currentIndex).reverse().map(planKey => {
              const plan = PLANS[planKey];
              const isConfirming = confirmPlan === `down-${planKey}`;
              return (
                <div key={planKey} className="dash-device-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: plan.color }}>{plan.label}</div>
                    <div style={{ fontSize: '0.72rem', color: '#737373', marginTop: '0.2rem' }}>{plan.description}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span className="font-heading" style={{ fontSize: '0.9rem', fontWeight: 700 }}>{plan.price}</span>
                    {planKey !== 'spark' && <span style={{ fontSize: '0.65rem', color: '#737373' }}>/unit/mo</span>}
                    {isConfirming ? (
                      <>
                        <button
                          onClick={() => handleUpgrade(`down-${planKey}`)}
                          disabled={upgrading}
                          style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
                        >
                          Confirm downgrade
                        </button>
                        <button
                          onClick={() => setConfirmPlan(null)}
                          style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(0,0,0,0.06)', color: '#737373', border: 'none', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmPlan(`down-${planKey}`)}
                        style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.375rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
                      >
                        Downgrade
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sub.plan === 'enterprise' && (
        <div className="dash-empty">You are on the Enterprise plan. Contact your account manager for renewals or changes.</div>
      )}

      <div style={{ fontSize: '0.72rem', color: '#737373', lineHeight: 1.6 }}>
        Need help with billing? Contact us at <a href="mailto:atmosintelligence@gmail.com" className="link">atmosintelligence@gmail.com</a>
      </div>
    </div>
  );
}