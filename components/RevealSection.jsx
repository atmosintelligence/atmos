'use client';

import { useEffect, useRef } from 'react';

export default function RevealSection({ children, className = '', id }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            el.classList.remove('opacity-0', 'translate-y-4');
            el.classList.add('opacity-100', 'translate-y-0');
          });

          observer.unobserve(el);
        }
      },
      {
        threshold: 0.12,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className={`
        opacity-0
        translate-y-4
        transition-all
        duration-500
        ease-out
        will-change-transform
        ${className}
      `}
    >
      {children}
    </section>
  );
}
