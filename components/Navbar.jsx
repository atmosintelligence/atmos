'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import { useNavbar } from './NavbarContext';
import { createClient } from '@/utils/supabase/client';

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setProfile(null);
    });

    setIsDemoMode(localStorage.getItem('atmos:demoMode') === 'true');

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
        <Link href="/pricing" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Pricing</Link>
        <Link href="/dashboard" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Dashboard</Link>

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