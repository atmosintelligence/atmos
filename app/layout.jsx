import './globals.css';
import localFont from 'next/font/local';
import Navbar from '@/components/Navbar';
import { NavbarProvider } from '@/components/NavbarContext';
import { Analytics } from '@vercel/analytics/next';

const syne = localFont({
  src: './fonts/Syne.ttf',
  variable: '--font-syne',
  display: 'swap'
});

const inter = localFont({
  src: './fonts/Inter.ttf',
  variable: '--font-inter',
  display: 'swap'
});

export const metadata = {
  title: 'Atmos Intelligence',
  description: "India's premier energy optimization tech, built for homes and offices alike"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${syne.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark');})();` }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var l=document.createElement('link');l.rel='icon';l.href=d?'/favicon.ico':'/favicon-dark.ico';document.head.appendChild(l);window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(e){l.href=e.matches?'/favicon.ico':'/favicon-dark.ico';});})();` }} />
      </head>
      <body className="bg-white text-neutral-900 dark:bg-[#0f0f0f] dark:text-neutral-100 antialiased transition-colors duration-300">
        <NavbarProvider>
          <Navbar />
          {children}
        </NavbarProvider>
        <Analytics />
      </body>
    </html>
  );
}