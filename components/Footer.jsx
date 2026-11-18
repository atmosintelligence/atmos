import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Subsidy Calculator', href: '/subsidies' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'About Atmos', href: '/about' },
      { label: 'Our Future', href: '/about/future' },
      { label: 'AI', href: '/about/ai' },
      { label: 'Cybersecurity', href: '/about/cybersecurity' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Log in', href: '/login' },
      { label: 'Sign up', href: '/signup' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10 px-6 sm:px-8 py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between gap-8">
          <div className="max-w-xs">
            <span style={{ fontWeight: 950 }} className="font-heading text-lg tracking-tight">
              ATMOS<span className="text-brand">.</span>
            </span>
            <p className="mt-2 text-xs text-[#a3a3a3] leading-relaxed">
              <b>Sense. Optimise. Act.</b>
              <br />
              Smart energy savings for Indian homes, schools and offices.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:flex sm:gap-12 text-sm">
            {COLUMNS.map(col => (
              <div key={col.title} className="flex flex-col gap-2">
                <span className="text-xs font-medium text-[#a3a3a3] uppercase tracking-widest mb-1">
                  {col.title}
                </span>
                {col.links.map(l => (
                  <Link key={l.href} href={l.href} className="text-[#a3a3a3] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#a3a3a3]">
          <span>© 2026 Atmos Intelligence.</span>
          <span>Made with 💖 in India</span>
        </div>
      </div>
    </footer>
  );
}
