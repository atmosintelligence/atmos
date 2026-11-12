'use client';

import './dashboard.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import NavbarBorderOverride from '@/components/NavbarBorderOverride';
import LinkDeviceModal from '@/components/dashboard/LinkDeviceModal';
import { getCurrentUser, signOut } from '@/lib/supabase';
import { deviceLabel } from '@/lib/deviceSettings';
import { DeviceProvider, useDevice } from './DeviceContext';
import { DemoProvider, useDemo } from './DemoContext';
import DemoGate from './DemoGate';

// Sidebar order: what you act on first, then your devices, then the deeper analysis.
const NAV = [
  { name: 'Overview',   href: '/dashboard/overview',   icon: 'overview'   },
  { name: 'Alerts',     href: '/dashboard/alerts',     icon: 'alerts'     },
  { name: 'Automation', href: '/dashboard/automation', icon: 'automation' },
  {
    name: 'Devices', href: '/dashboard/devices', icon: 'devices',
    subs: [{ name: 'History', href: '/dashboard/history', icon: 'history' }],
  },
  {
    name: 'Analysis', href: '/dashboard/analysis', icon: 'analysis',
    subs: [
      { name: 'Environmental Savings', href: '/dashboard/analysis/environmental', icon: 'environmentalAnalysis' },
      { name: 'Lighting',              href: '/dashboard/analysis/lighting',      icon: 'lightingAnalysis'      },
      { name: 'Temperature',           href: '/dashboard/analysis/temperature',   icon: 'temperatureAnalysis'   },
      { name: 'Standby',               href: '/dashboard/analysis/standby',       icon: 'standbyAnalysis'       },
      { name: 'Trends',                href: '/dashboard/analysis/trends',        icon: 'trendsAnalysis'        },
    ],
  },
  { name: 'API',      href: '/dashboard/api',      icon: 'api'      },
  { name: 'Settings', href: '/dashboard/settings', icon: 'settings' },
];

const navClass = (active, sub = false) => `dash-nav-link${sub ? ' sub' : ''}${active ? ' active' : ''}`;

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
  }).replace('am', 'AM').replace('pm', 'PM');
}

function Sidebar({ refreshing, open, onNavigate }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { devices, selectedId, setSelectedId, selectedDevice, loadingDevices, triggerRefresh, weatherError } = useDevice();
  const { isDemo } = useDemo();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [linking, setLinking]           = useState(false);

  useEffect(() => {
    function onDown(e) { if (!e.target.closest('.dash-dropdown')) setDropdownOpen(false); }
    function onKey(e)  { if (e.key === 'Escape') setDropdownOpen(false); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  async function handleLogout() {
    await signOut();
    router.replace('/');
  }

  const isActive = href => pathname === href || (pathname === '/dashboard' && href === '/dashboard/overview');

  return (
    <aside
      className={`dash-sidebar fixed top-16 left-0 w-64 h-[calc(100dvh-4rem)] flex flex-col border-r border-black/8 dark:border-white/8${open ? ' open' : ''}`}
      aria-label="Dashboard"
    >
      <div className="dash-side-top">
        <div className="flex items-center gap-2">
          <div className="dash-dropdown">
            <button
              type="button"
              className={`dash-dropdown-trigger select-none ${dropdownOpen ? 'open' : ''}`}
              onClick={() => setDropdownOpen(o => !o)}
              disabled={loadingDevices}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
              aria-label="Choose device"
            >
              <span className="dash-dropdown-trigger-text">
                {loadingDevices ? 'Loading...' : (selectedDevice ? deviceLabel(selectedDevice) : 'No devices')}
              </span>
              <Icon name="chevronDown" size={14} className="dash-dropdown-chevron" />
            </button>

            {dropdownOpen && (
              <div className="dash-dropdown-menu" role="listbox">
                <div className="dash-dropdown-header select-none">Your devices</div>
                {!devices.length ? (
                  <div className="dash-dropdown-empty">No devices found</div>
                ) : devices.map(d => (
                  <div
                    key={d.device_id}
                    role="option"
                    aria-selected={selectedId === d.device_id}
                    tabIndex={0}
                    className={`dash-dropdown-option ${selectedId === d.device_id ? 'active' : ''}`}
                    onClick={() => { setSelectedId(d.device_id); setDropdownOpen(false); }}
                    onKeyDown={e => { if (e.key === 'Enter') { setSelectedId(d.device_id); setDropdownOpen(false); } }}
                  >
                    <span style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{deviceLabel(d)}</span>
                      {d.display_name && <span style={{ fontSize: '0.65rem', color: '#a3a3a3' }}>{d.device_id}</span>}
                    </span>
                    {selectedId === d.device_id && <Icon name="check" size={14} className="dash-dropdown-option-check" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className={`dash-refresh-btn select-none ${refreshing ? 'spinning' : ''}`}
            onClick={triggerRefresh}
            aria-label="Refresh data"
            title="Refresh data"
          >
            <Icon name="refresh" size={15} />
          </button>
        </div>

        <button type="button" className="dash-btn ghost sm" style={{ width: '100%', marginTop: '0.625rem' }} onClick={() => setLinking(true)}>
          <Icon name="plus" size={15} /> Link new device
        </button>

        {selectedDevice?.last_contacted_at && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#a3a3a3' }}>
            Last heard from: {formatDate(selectedDevice.last_contacted_at)}
          </div>
        )}
        {weatherError && weatherError !== 'No location set' && (
          <div style={{ marginTop: '0.25rem', fontSize: '0.68rem', color: 'rgba(239,68,68,0.85)' }}>
            Weather is unavailable right now
          </div>
        )}
      </div>

      <nav className="dash-nav" aria-label="Dashboard pages">
        {NAV.map(item => (
          <div key={item.name}>
            <Link href={item.href} className={navClass(isActive(item.href))} onClick={onNavigate} aria-current={isActive(item.href) ? 'page' : undefined}>
              <Icon name={item.icon} size={20} />
              {item.name}
            </Link>
            {item.subs && (
              <div className="dash-nav-subgroup">
                {item.subs.map(s => (
                  <Link key={s.name} href={s.href} className={navClass(isActive(s.href), true)} onClick={onNavigate} aria-current={isActive(s.href) ? 'page' : undefined}>
                    <Icon name={s.icon} size={17} />
                    {s.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="dash-side-footer">
        {isDemo ? (
          <>
            <div className="dash-side-row">
              <span className="dash-side-demo">Demo mode · simulated data</span>
            </div>
            <Link href="/signup" className="btn bg-brand text-brand-on-bg text-center text-xs font-semibold py-1.5 rounded-lg select-none">
              Create free account
            </Link>
          </>
        ) : (
          <div className="dash-side-row">
            <button type="button" onClick={handleLogout} className="dash-side-logout select-none" title="Log out">
              <Icon name="logout" size={16} />
              Log out
            </button>
          </div>
        )}
        <Link href="/privacy" className="dash-side-link select-none">Privacy Policy</Link>
      </div>

      {linking && <LinkDeviceModal onClose={() => setLinking(false)} />}
    </aside>
  );
}

function DashboardShell({ children }) {
  const pathname = usePathname();
  const [refreshing, setRefreshing] = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const { refreshKey } = useDevice();

  useEffect(() => {
    if (refreshKey === 0) return;
    setRefreshing(true);
    const t = setTimeout(() => setRefreshing(false), 800);
    return () => clearTimeout(t);
  }, [refreshKey]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <div className="flex min-h-dvh pt-16">
      <NavbarBorderOverride />
      <a href="#dash-main" className="skip-link">Skip to content</a>
      <div className="w-64 shrink-0 dash-sidebar-spacer" />
      <Sidebar refreshing={refreshing} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && <div className="fixed inset-0 top-16 z-50 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <main id="dash-main" className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <button
          type="button"
          className="dash-btn ghost sm dash-menu-btn"
          style={{ marginBottom: '1rem' }}
          onClick={() => setMenuOpen(o => !o)}
          aria-expanded={menuOpen}
          aria-label="Open dashboard menu"
        >
          <Icon name="menu" size={16} /> Menu
        </button>
        <div className="dash-page">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const [authState, setAuthState] = useState('checking');
  const [isDemo, setIsDemo]       = useState(false);

  useEffect(() => {
    if (authState === 'authed') localStorage.removeItem('atmos:demoMode');
  }, [authState]);

  useEffect(() => {
    getCurrentUser().then(user => setAuthState(user ? 'authed' : 'guest'));
  }, []);

  if (authState === 'checking') return (
    <div className="min-h-dvh flex items-center justify-center text-neutral-400 text-sm" role="status">
      Checking session...
    </div>
  );

  if (authState === 'guest' && !isDemo) {
    return (
      <DemoProvider isDemo={false}>
        <DeviceProvider>
          <DemoGate onEnterDemo={() => setIsDemo(true)} />
        </DeviceProvider>
      </DemoProvider>
    );
  }

  return (
    <DemoProvider isDemo={isDemo}>
      <DeviceProvider>
        <DashboardShell>{children}</DashboardShell>
      </DeviceProvider>
    </DemoProvider>
  );
}
