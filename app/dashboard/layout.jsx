'use client';

import './dashboard.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import NavbarBorderOverride from '@/components/NavbarBorderOverride';
import { getCurrentUser, signOut } from '@/lib/supabase';
import { DeviceProvider, useDevice } from './DeviceContext';
import { DemoProvider, useDemo } from './DemoContext';
import DemoGate from './DemoGate';

const pages = [
  { name: 'Overview',     href: '/dashboard/overview',     icon: 'overview'     },
  { name: 'Alerts',       href: '/dashboard/alerts',       icon: 'alerts'       },
  { name: 'Automation',   href: '/dashboard/automation',   icon: 'automation'   },
  { name: 'Analysis',     href: '/dashboard/analysis',     icon: 'analysis'     },
  { name: 'History',      href: '/dashboard/history',      icon: 'history'      },
  { name: 'Devices',      href: '/dashboard/devices',      icon: 'devices'      },
  { name: 'API',          href: '/dashboard/api',          icon: 'api'          },
  { name: 'Subscription', href: '/dashboard/subscription', icon: 'subscription' },
  { name: 'Settings',     href: '/dashboard/settings',     icon: 'settings'     },
];

const analysisSubs = [
  { name: 'Environmental Savings', href: '/dashboard/analysis/environmental', icon: 'environmentalAnalysis' },
  { name: 'Lighting',              href: '/dashboard/analysis/lighting',      icon: 'lightingAnalysis'      },
  { name: 'Temperature',           href: '/dashboard/analysis/temperature',   icon: 'temperatureAnalysis'   },
  { name: 'Power Usage',           href: '/dashboard/analysis/power',         icon: 'powerAnalysis'         },
  { name: 'Trends & Predictions',  href: '/dashboard/analysis/trends',        icon: 'trendsAnalysis'        },
];

function navClass(active, sub = false) {
  return `dash-nav-link${sub ? ' sub' : ''}${active ? ' active' : ''}`;
}

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
  const { devices, selectedId, setSelectedId, selectedDevice, loadingDevices, triggerRefresh, weatherError } = useDevice();
  const { isDemo } = useDemo();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [localTime, setLocalTime]       = useState('');

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
    await signOut();
    router.replace('/');
  }

  return (
    <aside className="dash-sidebar fixed top-16 left-0 w-64 h-[calc(100dvh-4rem)] flex flex-col border-r border-black/8 dark:border-white/8">
      <div className="dash-side-top">
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

      <nav className="dash-nav">
        {pages.map((p) => {
          if (p.name === 'Analysis') {
            return (
              <div key="analysis-group">
                <Link href="/dashboard/analysis" className={navClass(pathname === '/dashboard/analysis')}>
                  <Icon name="analysis" />
                  Analysis
                </Link>
                <div className="dash-nav-subgroup">
                  {analysisSubs.map(c => (
                    <Link key={c.name} href={c.href} className={navClass(pathname === c.href, true)}>
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
            <Link key={p.name} href={p.href} className={navClass(active)}>
              <Icon name={p.icon} />
              {p.name}
            </Link>
          );
        })}
      </nav>

      <div className="dash-side-footer">
        {isDemo ? (
          <>
            <div className="dash-side-row">
              <span className="dash-side-demo">Premium demo</span>
              {localTime && <span className="dash-side-time">{localTime}</span>}
            </div>
            <Link href="/signup" className="btn bg-brand text-brand-on-bg text-center text-xs font-semibold py-1.5 rounded-lg select-none">
              Create free account
            </Link>
          </>
        ) : (
          <div className="dash-side-row">
            {localTime && <span className="dash-side-time">{localTime}</span>}
            <button onClick={handleLogout} className="dash-side-logout select-none" title="Log out">
              <Icon name="logout" />
              Log out
            </button>
          </div>
        )}
        <Link href="/privacy" className="dash-side-link select-none">Privacy Policy</Link>
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
      <main className="flex-1 min-w-0 p-6 lg:p-8"><div className="dash-page">{children}</div></main>
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
    getCurrentUser().then(user => setAuthState(user ? 'authed' : 'guest'));
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