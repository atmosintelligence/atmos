import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10 px-8 py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between gap-8">
          <div className="max-w-xs">
            <span style={{ fontWeight: 950 }} className="font-heading text-lg tracking-tight">
              ATMOS<span className="text-brand">.</span>
            </span>
            <p className="mt-2 text-xs text-[#a3a3a3] leading-relaxed">
              <b>Sense. Optimize. Act.</b>
              <br />
              Atmos Intelligence delivers real-time environmental monitoring and AI-driven energy optimisation across Indian buildings, from single-room homes to enterprise networks.
            </p>
          </div>

          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-[#a3a3a3] uppercase tracking-widest mb-1">
                Product
              </span>
              <Link
                href="/pricing"
                className="text-[#a3a3a3] hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/pricing/subsidy"
                className="text-[#a3a3a3] hover:text-white transition-colors"
              >
                Subsidy Calculator
              </Link>
              <Link
                href="/dashboard"
                className="text-[#a3a3a3] hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <span
                className="text-[#a3a3a3] hover:text-white transition-colors"
              >
                GitHub
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-[#a3a3a3] uppercase tracking-widest mb-1">
                Account
              </span>
              <Link
                href="/login"
                className="text-[#a3a3a3] hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-[#a3a3a3] hover:text-white transition-colors"
              >
                Sign up
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-[#a3a3a3] uppercase tracking-widest mb-1">
                Legal
              </span>
              <Link
                href="/privacy"
                className="text-[#a3a3a3] hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="https://github.com/atmosintelligence/atmos/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a3a3a3] hover:text-white transition-colors"
              >
                License
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#a3a3a3]">
          <span
            className="text-[#a3a3a3] hover:text-white transition-colors"
          >
            © 2026 Atmos Intelligence.
          </span>
          <span>Made with 💖 in India</span>
        </div>
      </div>
    </footer>
  );
}