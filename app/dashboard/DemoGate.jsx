'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DemoGate({ onEnterDemo }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position:        'fixed',
      inset:           0,
      zIndex:          100,
      background:      'linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #111 100%)',
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '2rem',
      opacity:         visible ? 1 : 0,
      transition:      'opacity 0.4s ease',
    }}>
      <div style={{
        position:     'absolute',
        top:          '30%',
        left:         '50%',
        translate:    '-50% -50%',
        width:        '600px',
        height:       '600px',
        borderRadius: '9999px',
        background:   'rgba(74,222,128,0.06)',
        filter:       'blur(100px)',
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', maxWidth: '440px', position: 'relative' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ADE80', marginBottom: '1.5rem' }}>
          TRY DEMO MODE
        </div>

        <h1 style={{
          fontFamily:    'var(--font-syne)',
          fontSize:      'clamp(2rem, 5vw, 3rem)',
          fontWeight:    700,
          letterSpacing: '-0.03em',
          lineHeight:    1.1,
          color:         '#e8e8e8',
          marginBottom:  '1rem',
        }}>
          See how a space<br />thinks for itself.
        </h1>

        <p style={{ fontSize: '0.9rem', color: '#737373', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          You don't need an account to explore how the dashboard works. Through the demo mode, you can feel the dashboard before signing up! Do you want to enter demo mode?
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              localStorage.setItem('atmos:demoMode', 'true');
              onEnterDemo();
            }}
            style={{
              fontFamily:   'var(--font-syne)',
              fontSize:     '0.9rem',
              fontWeight:   700,
              padding:      '0.75rem 2rem',
              borderRadius: '9999px',
              background:   '#4ADE80',
              color:        '#000',
              border:       'none',
              cursor:       'pointer',
              transition:   'opacity 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Enter Demo Mode
          </button>
          <Link
            href="/login"
            style={{
              fontFamily:   'var(--font-syne)',
              fontSize:     '0.9rem',
              fontWeight:   700,
              padding:      '0.75rem 2rem',
              borderRadius: '9999px',
              background:   'rgba(255,255,255,0.06)',
              color:        '#e8e8e8',
              border:       '1px solid rgba(255,255,255,0.1)',
              cursor:       'pointer',
              textDecoration: 'none',
              transition:   'background 0.15s ease',
              display:      'inline-block',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            Log in instead
          </Link>
        </div>

        <p style={{ fontSize: '0.72rem', color: '#444', marginTop: '2rem', lineHeight: 1.6 }}>
          Demo uses realistic, simulated sensor data from a single room.<br />No data is stored on the cloud or associated with your device.
        </p>
      </div>
    </div>
  );
}