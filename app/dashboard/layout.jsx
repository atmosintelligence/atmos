'use client';

import './dashboard.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import NavbarBorderOverride from '@/components/NavbarBorderOverride';
import { createClient } from '@/utils/supabase/client';
import { DeviceProvider, useDevice } from './DeviceContext';
import { DemoProvider, useDemo } from './DemoContext';
import DemoGate from './DemoGate';

const pages = [
  { name: 'Overview',     href: '/dashboard/overview',     icon: 'overview'     },
  { name: 'Alerts',       href: '/dashboard/alerts',       icon: 'alerts'       },
  { name: 'Analysis',     href: '/dashboard/analysis',     icon: 'analysis'     },
  { name: 'History',      href: '/dashboard/history',      icon: 'history'      },
  { name: 'Devices',      href: '/dashboard/devices',      icon: 'devices'      },
  { name: 'API',          href: '/dashboard/api',          icon: 'api'          },
  { name: 'Subscription', href: '/dashboard/subscription', icon: 'subscription' },
  { name: 'Settings',     href: '/dashboard/settings',     icon: 'settings'     },
];

const analysisSubs = [
  { name: 'Lighting',              href: '/dashboard/analysis/lighting',      icon: 'lightingAnalysis'      },
  { name: 'Temperature',           href: '/dashboard/analysis/temperature',   icon: 'temperatureAnalysis'   },
  { name: 'Power Usage',           href: '/dashboard/analysis/power',         icon: 'powerAnalysis'         },
  { name: 'Trends & Predictions',  href: '/dashboard/analysis/trends',        icon: 'trendsAnalysis'        },
  { name: 'Environmental Savings', href: '/dashboard/analysis/environmental', icon: 'environmentalAnalysis' },
];

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).replace('am', 'AM').replace('pm', 'PM');
}

function Sidebar({ refreshing }) {
  const pathname   = usePathname();
  const router     = useRouter();
  const { devices, selectedId, setSelectedId, selectedDevice, loadingDevices, triggerRefresh, refreshKey, weatherError } = useDevice();
  const { isDemo } = useDemo();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localTime, setLocalTime]       = useState('');

  useEffect(() => {
    if (refreshKey === 0) return;
  }, [refreshKey]);

  useEffect(() => {
    function tick() {
      setLocalTime(new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      }).replace('am', 'AM').replace('pm', 'PM'));
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest('.dash-dropdown')) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/');
  }

  return (
    <aside className="fixed top-16 left-0 w-64 h-[calc(100dvh-4rem)] flex flex-col border-r border-black/8 dark:border-white/8">
      <div className="p-4 pb-3 border-b border-black/8 dark:border-white/8">
        <div className="flex items-center gap-2">
          <div className="dash-dropdown">
            <button
              className={`dash-dropdown-trigger select-none ${dropdownOpen ? 'open' : ''}`}
              onClick={() => setDropdownOpen(o => !o)}
              disabled={loadingDevices}
            >
              <span className="dash-dropdown-trigger-text">
                {loadingDevices ? 'Loading...' : (selectedDevice?.device_id ?? 'No devices')}
              </span>
              <svg className="dash-dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {dropdownOpen && (
              <div className="dash-dropdown-menu">
                <div className="dash-dropdown-header select-none">Your devices</div>
                {!devices.length ? (
                  <div className="dash-dropdown-empty">No devices found</div>
                ) : devices.map(d => (
                  <div
                    key={d.device_id}
                    className={`dash-dropdown-option ${selectedId === d.device_id ? 'active' : ''}`}
                    onClick={() => { setSelectedId(d.device_id); setDropdownOpen(false); }}
                  >
                    <span>{d.device_id}</span>
                    {selectedId === d.device_id && (
                      <svg className="dash-dropdown-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className={`dash-refresh-btn select-none ${refreshing ? 'spinning' : ''}`}
            onClick={triggerRefresh}
            aria-label="Refresh"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        </div>

        {selectedDevice?.last_contacted_at && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#a3a3a3' }}>
            Last contacted: {formatDate(selectedDevice.last_contacted_at)}
          </div>
        )}

        {weatherError && weatherError !== 'No location set' && (
          <div style={{ marginTop: '0.25rem', fontSize: '0.65rem', color: 'rgba(239,68,68,0.75)' }}>
            Weather API unreachable
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 pt-2 flex flex-col gap-0.5 text-sm overflow-y-auto">
        {pages.map((p) => {
          if (p.name === 'Analysis') {
            return (
              <div key="analysis-group">
                <Link href="/dashboard/analysis" className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors select-none ${
                  pathname === '/dashboard/analysis'
                    ? 'bg-black/6 dark:bg-white/6 text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-black/4 dark:hover:bg-white/4'
                }`}>
                  <Icon name="analysis" />
                  Analysis
                </Link>
                <div style={{ paddingLeft: '0.75rem', marginTop: '0.125rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  {analysisSubs.map(c => (
                    <Link key={c.name} href={c.href} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs select-none ${
                      pathname === c.href
                        ? 'bg-black/6 dark:bg-white/6 text-neutral-900 dark:text-neutral-100'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-black/4 dark:hover:bg-white/4'
                    }`}>
                      <Icon name={c.icon} />
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          const active = pathname === p.href || (pathname === '/dashboard' && p.href === '/dashboard/overview');
          return (
            <Link key={p.name} href={p.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors select-none ${
              active
                ? 'bg-black/6 dark:bg-white/6 text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-black/4 dark:hover:bg-white/4'
            }`}>
              <Icon name={p.icon} />
              {p.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-black/8 dark:border-white/8 bg-transparent p-4 flex flex-col gap-3">
        {localTime && (
          <div style={{ paddingLeft: '0.75rem', paddingBottom: '0.25rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em', fontFamily: 'var(--font-syne)' }}>
              {localTime}
            </div>
            <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#a3a3a3', marginTop: '0.1rem' }}>
              Your local time
            </div>
          </div>
        )}

        {isDemo ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#4ADE80', fontWeight: 600, paddingLeft: '0.75rem' }}>
              Premium Demo
            </div>
            <Link href="/signup" className="btn bg-brand text-brand-on-bg text-center text-xs font-semibold py-2 rounded-xl select-none">
              Create free account
            </Link>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-neutral-500 hover:text-red-500 hover:bg-red-500/6 transition-colors w-full text-left cursor-pointer select-none"
          >
            <Icon name="logout" />
            Log out
          </button>
        )}
        <Link href="/privacy" className="link text-xs px-3 select-none">Privacy Policy</Link>
      </div>
    </aside>
  );
}

function DashboardShell({ children, checking, isDemo }) {
  const [refreshing, setRefreshing] = useState(false);
  const { refreshKey } = useDevice();

  useEffect(() => {
    if (refreshKey === 0) return;
    setRefreshing(true);
    const t = setTimeout(() => setRefreshing(false), 800);
    return () => clearTimeout(t);
  }, [refreshKey]);

  if (checking) return (
    <div className="min-h-dvh flex items-center justify-center text-neutral-400 text-sm">
      Checking session...
    </div>
  );

  return (
    <div className="flex min-h-dvh pt-16">
      <NavbarBorderOverride />
      <div className="w-64 shrink-0" />
      <Sidebar refreshing={refreshing} />
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const [authState, setAuthState] = useState('checking');
  const [isDemo, setIsDemo]       = useState(false);
  const router                    = useRouter();

  useEffect(() => {
    if (authState === 'authed') localStorage.removeItem('atmos:demoMode');
  }, [authState]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setAuthState('authed');
      else setAuthState('guest');
    });
  }, []);

  if (authState === 'checking') return (
    <div className="min-h-dvh flex items-center justify-center text-neutral-400 text-sm">
      Checking session...
    </div>
  );

  if (authState === 'guest' && !isDemo) {
    return (
      <DemoProvider isDemo={false}>
        <DeviceProvider isDemo={false} demoDevices={null} demoReadings={null}>
          <DemoGate onEnterDemo={() => setIsDemo(true)} />
        </DeviceProvider>
      </DemoProvider>
    );
  }

  return (
    <DemoProvider isDemo={isDemo}>
      <DeviceProvider isDemo={isDemo}>
        <DashboardShell checking={false} isDemo={isDemo}>
          {children}
        </DashboardShell>
      </DeviceProvider>
    </DemoProvider>
  );
}