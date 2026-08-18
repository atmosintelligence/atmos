'use client';

import { useRef, useState, useEffect } from 'react';

export default function VideoSection() {
  const inlineRef  = useRef(null);
  const expandedRef = useRef(null);
  const [expanded, setExpanded]     = useState(false);
  const [hasExpanded, setHasExpanded] = useState(false);

  function openExpanded() {
    setExpanded(true);
    setHasExpanded(true);
    if (expandedRef.current) {
      expandedRef.current.currentTime = inlineRef.current?.currentTime ?? 0;
      expandedRef.current.muted = false;
      expandedRef.current.play();
    }
  }

  function closeExpanded() {
    setExpanded(false);
    if (expandedRef.current) {
      expandedRef.current.pause();
      expandedRef.current.muted = true;
    }
    if (inlineRef.current) {
      inlineRef.current.currentTime = expandedRef.current?.currentTime ?? 0;
      inlineRef.current.play();
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) closeExpanded();
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && expanded) closeExpanded();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  useEffect(() => {
    if (expanded && expandedRef.current) {
      expandedRef.current.currentTime = inlineRef.current?.currentTime ?? 0;
      expandedRef.current.muted = false;
      expandedRef.current.play().catch(() => {});
    }
  }, [expanded]);

  return (
    <>
      {/* Inline video — 30% viewport height */}
      <div
        onClick={openExpanded}
        style={{
          position:   'relative',
          width:      '100%',
          height:     '50dvh',
          overflow:   'hidden',
          cursor:     'pointer',
          flexShrink: 0,
        }}
      >
        <video
          ref={inlineRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        >
          <source src="/movie.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div style={{
          position:   'absolute',
          inset:      0,
          background: 'rgba(0,0,0,0.5)',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.3s ease',
          opacity:    hasExpanded ? 0 : 1,
          pointerEvents: hasExpanded ? 'none' : 'auto',
        }}>
          <div style={{ textAlign: 'center', userSelect: 'none' }}>
            <div style={{
              fontSize:      '0.65rem',
              fontWeight:    700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color:         'rgba(255,255,255,0.85)',
              marginBottom:  '0.625rem',
            }}>
              Click to expand video
            </div>
            <div style={{
              width:        '40px',
              height:       '40px',
              borderRadius: '9999px',
              border:       '1.5px solid rgba(255,255,255,0.5)',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              margin:       '0 auto',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{
          position:      'absolute',
          bottom:        0,
          left:          0,
          right:         0,
          height:        '40%',
          background:    'linear-gradient(to bottom, transparent, rgba(0,0,0,0.6))',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Expanded modal */}
      {expanded && (
        <div
          onClick={handleBackdropClick}
          style={{
            position:        'fixed',
            inset:           0,
            zIndex:          999,
            background:      'rgba(0,0,0,0.88)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            backdropFilter:  'none',
            animation:       'fadeInBackdrop 0.2s ease',
          }}
        >
          <div style={{
            position: 'relative',
            width:    '90vw',
            height:   '90vh',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
          }}>
            <video
              ref={expandedRef}
              loop
              playsInline
              controls
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', display: 'block' }}
            >
              <source src="/movie.mp4" type="video/mp4" />
            </video>

            <button
              onClick={closeExpanded}
              style={{
                position:     'absolute',
                top:          '1rem',
                right:        '1rem',
                width:        '32px',
                height:       '32px',
                borderRadius: '9999px',
                background:   'rgba(0,0,0,0.6)',
                border:       '1px solid rgba(255,255,255,0.15)',
                color:        'rgba(255,255,255,0.8)',
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                fontSize:     '0.75rem',
                zIndex:       10,
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
