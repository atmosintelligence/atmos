'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import { useNavbar } from './NavbarContext';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  {
    label: 'About',
    href: '/about',
    subTabs: [
      { label: 'About Atmos', href: '/about', description: 'What we do, and why' },
      { label: 'Our Future', href: '/about/future', description: 'What we\u2019re building next' },
      { label: 'AI', href: '/about/ai', description: 'How Atmos thinks' },
      { label: 'Cybersecurity', href: '/about/cybersecurity', description: 'How your data stays safe' },
      { label: 'Bibliography', href: '/about/bibliography', description: 'The sources behind our figures' },
    ],
  },
  { label: 'Subsidies', href: '/subsidy' },
  { label: 'Dashboard', href: '/dashboard' },
];

const isActiveHref = (href, pathname) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

const CLOSE_DELAY = 120;

function NavItem({ item, pathname }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const hasSubTabs = Boolean(item.subTabs?.length);
  const isActive = isActiveHref(item.href, pathname);

  function handleEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  }

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={hasSubTabs ? handleEnter : undefined}
      onMouseLeave={hasSubTabs ? handleLeave : undefined}
    >
      <Link
        href={item.href}
        onFocus={hasSubTabs ? handleEnter : undefined}
        onBlur={hasSubTabs ? handleLeave : undefined}
        aria-expanded={hasSubTabs ? open : undefined}
        className={`flex items-center gap-1 py-5 transition-colors ${
          isActive
            ? 'text-neutral-900 dark:text-neutral-100'
            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
        }`}
      >
        {item.label}
        {hasSubTabs && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className={`mt-px transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </Link>

      {hasSubTabs && (
        <div
          className={`absolute left-1/2 top-full w-56 -translate-x-1/2 transition-all duration-200 ease-out ${
            open
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-1 opacity-0'
          }`}
        >
          <div className="mt-2 overflow-hidden rounded-[14px] border border-black/10 bg-white/90 p-1.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] backdrop-blur-md dark:border-white/10 dark:bg-[#161616]/90">
            {item.subTabs.map((sub) => (
              <Link
                key={sub.href}
                href={sub.href}
                prefetch={false}
                className="block rounded-lg px-3 py-2 transition-colors hover:bg-black/5 dark:hover:bg-white/8"
              >
                <div className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                  {sub.label}
                </div>
                {sub.description && (
                  <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {sub.description}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Phones and tablets: one button opens every link, the account links and the theme switch.
function MobileMenu({ open, onClose, pathname, profile }) {
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  const linkClass = active => `block rounded-lg px-3 py-2.5 text-base transition-colors ${
    active ? 'bg-black/5 dark:bg-white/8 text-neutral-900 dark:text-neutral-100 font-medium' : 'text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/8'
  }`;

  return (
    <div
      id="mobile-menu"
      className={`lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto overscroll-contain bg-white/95 dark:bg-[#0f0f0f]/95 backdrop-blur-md border-t border-black/10 dark:border-white/10 transition-all duration-200 ${
        open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
      aria-hidden={!open}
      inert={!open}
    >
      <nav className="px-5 py-4 flex flex-col gap-1" aria-label="Main">
        {NAV_ITEMS.map(item => (
          <div key={item.href}>
            {item.subTabs ? (
              <>
                <div className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{item.label}</div>
                {item.subTabs.map(sub => (
                  <Link key={sub.href} href={sub.href} onClick={onClose} prefetch={false} className={linkClass(pathname === sub.href)} aria-current={pathname === sub.href ? 'page' : undefined}>
                    {sub.label}
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400 font-normal">{sub.description}</span>
                  </Link>
                ))}
              </>
            ) : (
              <Link href={item.href} onClick={onClose} className={linkClass(isActiveHref(item.href, pathname))} aria-current={isActiveHref(item.href, pathname) ? 'page' : undefined}>
                {item.label}
              </Link>
            )}
          </div>
        ))}

        <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
          {profile ? (
            <div className="flex items-center gap-2.5 px-3 py-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-brand-on-bg text-xs font-semibold">
                {profile.display_name?.[0]?.toUpperCase()}
              </div>
              <span className="text-neutral-600 dark:text-neutral-400">Signed in as {profile.username}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-1">
              <Link href="/login" onClick={onClose} className="text-center rounded-full border border-black/15 dark:border-white/20 py-2.5 text-sm font-medium">Log in</Link>
              <Link href="/signup" onClick={onClose} className="text-center rounded-full bg-brand text-brand-on-bg py-2.5 text-sm font-medium">Sign up</Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default function Navbar() {
  const [theme, setTheme] = useState('dark');
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { forceBorder } = useNavbar();
  const pathname = usePathname();
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    setTheme(localStorage.getItem('theme') || 'dark');
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);

    const onThemeChange = (e) => setTheme(e.detail.theme);
    window.addEventListener('atmos:themeChanged', onThemeChange);

    const onProfileChange = (e) => {
      setProfile(prev => prev
        ? { ...prev, ...e.detail }
        : e.detail
      );
    };
    window.addEventListener('atmos:profileChanged', onProfileChange);

    setIsDemoMode(
      localStorage.getItem('atmos:demoMode') === 'true'
    );

    // The account library is large, so it loads once the page is idle, not before first paint.
    let cancelled = false;
    let stopAuthListener = () => {};
    const whenIdle = window.requestIdleCallback ?? (fn => setTimeout(fn, 200));
    const cancelIdle = window.cancelIdleCallback ?? clearTimeout;
    const idleId = whenIdle(() => {
      Promise.all([import('@/lib/auth'), import('@/lib/api')]).then(([{ onAuthChange, getCurrentUser }, { getProfile }]) => {
        if (cancelled) return;
        getCurrentUser().then(user => user && getProfile()).then(data => { if (data && !cancelled) setProfile(data); });
        stopAuthListener = onAuthChange(session => {
          if (session) {
            localStorage.removeItem('atmos:demoMode');
            setIsDemoMode(false);
          } else {
            setProfile(null);
          }
        });
      });
    });

    return () => {
      cancelled = true;
      cancelIdle(idleId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('atmos:themeChanged', onThemeChange);
      window.removeEventListener('atmos:profileChanged', onProfileChange);
      stopAuthListener();
    };
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  const bordered = scrolled || forceBorder || menuOpen;

  return (
    <>
    <nav className={`select-none fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-5 lg:px-8 transition-all duration-300 backdrop-blur-md border-b ${
      bordered
        ? 'bg-white/80 dark:bg-[#0f0f0f]/80 border-black/10 dark:border-white/10'
        : 'bg-transparent border-transparent'
    }`}>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          style={{ fontWeight: 950 }}
          className="font-heading text-xl tracking-tight"
        >
          ATMOS<span className="text-brand">.</span>
        </Link>

        {pathname.startsWith('/dashboard') && isDemoMode && (
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              background: 'rgba(74,222,128,0.1)',
              color: 'var(--text-accent)',
              border: '1px solid rgba(74,222,128,0.2)',
            }}
          >
            DEMO MODE
          </div>
        )}
      </div>

      <div className="hidden lg:flex items-center gap-6 text-base">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}

        {profile ? (
          <div className="flex items-center gap-2.5 text-sm px-2.5 py-1.5 rounded-[5px] bg-black/6 dark:bg-white/6 cursor-default">
            <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center text-brand-on-bg text-xs font-semibold pointer-events-none select-none">
              {profile.display_name?.[0]?.toUpperCase()}
            </div>
            <span className="text-neutral-600 dark:text-neutral-400 text-sm">{profile.username}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Log in</Link>
            <Link href="/signup" className="btn bg-brand text-brand-on-bg text-sm px-4 py-1.5 rounded-full font-medium">Sign up</Link>
          </div>
        )}

        <button onClick={toggleTheme} aria-label="Toggle theme" className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-black/5 dark:hover:bg-white/8 transition-all cursor-pointer">
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </div>

      <div className="flex lg:hidden items-center gap-1">
        <button onClick={toggleTheme} aria-label="Toggle theme" className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-black/5 dark:hover:bg-white/8 transition-all cursor-pointer">
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/8 transition-all cursor-pointer"
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>
      </div>
    </nav>
    <MobileMenu open={menuOpen} onClose={closeMenu} pathname={pathname} profile={profile} />
    </>
  );
}