import './globals.css';
import localFont from 'next/font/local';
import Script from 'next/script';

import Navbar from '@/components/Navbar';
import { NavbarProvider } from '@/components/NavbarContext';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import PwaRegister from '@/components/PwaRegister';

const syne = localFont({
  src: './fonts/Syne.woff2',
  variable: '--font-syne',
  display: 'swap'
});

const inter = localFont({
  src: './fonts/Inter.woff2',
  variable: '--font-inter',
  display: 'swap'
});

export const metadata = {
  title: { default: 'Atmos Intelligence', template: '%s | Atmos Intelligence' },
  description: "India's premier energy optimisation tech, built for homes and offices alike",
  applicationName: 'Atmos',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Atmos', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
  icons: { apple: '/favicon.png' }
};

export const viewport = {
  themeColor: '#0f0f0f',
  viewportFit: 'cover'
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`dark ${syne.variable} ${inter.variable}`}
    >
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
        >
          {`
            (function(){
              var t = localStorage.getItem('theme') || 'dark';
              if (t !== 'dark') {
                document.documentElement.classList.remove('dark');
              }
            })();
          `}
        </Script>

        <Script
          id="favicon-script"
          strategy="beforeInteractive"
        >
          {`
            (function(){
              var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
              var l = document.createElement('link');

              l.rel = 'icon';
              l.href = d ? '/favicon.ico' : '/favicon-dark.ico';

              document.head.appendChild(l);

              window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', function(e) {
                  l.href = e.matches
                    ? '/favicon.ico'
                    : '/favicon-dark.ico';
                });
            })();
          `}
        </Script>
      </head>

      <body className="bg-white text-neutral-900 dark:bg-[#0f0f0f] dark:text-neutral-100 antialiased transition-colors duration-300">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <NavbarProvider>
          <Navbar />
          {children}
        </NavbarProvider>

        <Analytics />
        <SpeedInsights />
        <PwaRegister />
      </body>
    </html>
  );
}