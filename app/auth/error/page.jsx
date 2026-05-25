import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata = { title: 'Auth Error — Atmos' };

export default function AuthErrorPage() {
  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 pt-16">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight mb-2">Link expired</h1>
          <p className="text-sm text-neutral-500 mb-7">This verification link is invalid or has expired. Please sign up or log in again.</p>
          <Link href="/signup" className="btn bg-brand text-brand-on-bg px-6 py-2.5 rounded-full font-medium text-sm inline-flex">
            Sign up
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}