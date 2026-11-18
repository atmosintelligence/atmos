'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import { BIBLIOGRAPHY } from '@/lib/bibliography';
import { tr } from '@/lib/subsidy/i18n';

export default function Sources({ lang }) {
  const T = (k, v) => tr(lang, k, v);
  const [open, setOpen] = useState(false);

  return (
    <section id="sources" className="card p-5 sm:p-7 scroll-mt-24">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="sources-panel"
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="font-heading text-base sm:text-lg font-semibold">{T('sourcesTitle')}</h2>
        <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <Icon name="chevronDown" size={18} />
        </span>
      </button>

      {open && (
        <div id="sources-panel" className="mt-4 flex flex-col gap-8">
          {BIBLIOGRAPHY.map((section) => (
            <div key={section.id}>
              <p className="text-sm leading-relaxed text-neutral-500">
                {section.intro}{section.accessed ? ` ${T('verified', { d: section.accessed })}.` : ''}
              </p>
              <ol className="mt-5 flex flex-col gap-5 list-none p-0">
                {section.entries.map((e, i) => (
                  <li key={e.url + e.title} className="flex gap-4">
                    <span className="font-heading text-sm font-bold text-brand min-w-[1.75rem] pt-0.5">[{i + 1}]</span>
                    <div className="min-w-0">
                      <p className="text-sm leading-relaxed">
                        {e.author}. ({e.year}). <i>{e.title}</i>.{' '}
                        <a href={e.url} target="_blank" rel="noopener noreferrer" className="link break-all">{e.url}</a>
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-500">{T('usedFor')}: {e.usedFor}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
