'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import { useNavbar } from './NavbarContext';
import { createClient } from '@/utils/supabase/client';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  {
    label: 'Pricing',
    href: '/pricing'
  },
  {
    label: 'Our Future',
    href: '/future',
    subTabs: [
      { label: 'About our future', href: '/future', description: 'What we\u2019re building next' },
      { label: 'AI and ML', href: '/future/ai', description: 'Using the tech of today' },
      { label: 'Cybersecurity', href: '/future/cybersecurity', description: 'Security is important' }
    ],
  },
  {
    label: 'Dashboard',
    href: '/dashboard'
  },
];

const CLOSE_DELAY = 120;

function NavItem({ item, pathname }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const hasSubTabs = Boolean(item.subTabs?.length);
  const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

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

export default function Navbar() {
  const [theme, setTheme] = useState('dark');
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { forceBorder } = useNavbar();
  const pathname = usePathname();

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

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('id', user.id)
        .single();
      setProfile(data);
    });

    setIsDemoMode(
      localStorage.getItem('atmos:demoMode') === 'true'
    );

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session) {
            localStorage.removeItem('atmos:demoMode');
            setIsDemoMode(false);
          }

          if (!session) {
            setProfile(null);
          }
        }
      );

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('atmos:themeChanged', onThemeChange);
      window.removeEventListener('atmos:profileChanged', onProfileChange);
      subscription.unsubscribe();
    };
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  const bordered = scrolled || forceBorder;

  return (
    <nav className={`select-none fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8 transition-all duration-300 backdrop-blur-md border-b ${
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
              color: '#4ADE80',
              border: '1px solid rgba(74,222,128,0.2)',
            }}
          >
            DEMO MODE
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 text-base">
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
    </nav>
  );
}