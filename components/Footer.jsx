import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-black/8 dark:border-white/8 px-8 py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between gap-8">
          <div className="max-w-xs">
            <span style={{ fontWeight: 950 }} className="font-heading text-lg tracking-tight">
              ATMOS<span className="text-brand">.</span>
            </span>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Also known as Atmos Intel. Providing environmental intelligence for smarter spaces in India. An interesting business project! Don't you agree?
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-1">Product</span>
              <Link href="/pricing" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Pricing</Link>
              <Link href="/dashboard" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Dashboard</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-1">Account</span>
              <Link href="/login" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Log in</Link>
              <Link href="/signup" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Sign up</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-1">Legal</span>
              <Link href="/privacy" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-black/8 dark:border-white/8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
          <span>© 2026 Atmos Intelligence. This project is under the MIT License.</span>
          <span>Made with 💖 in India</span>
        </div>
      </div>
    </footer>
  );
}