'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import NavbarBorderOverride from '@/components/NavbarBorderOverride';
import { createClient } from '@/utils/supabase/client';

const firstNames = [
  'Aryan', 'Priya', 'Rohan', 'Ananya', 'Vikram',
  'Neha', 'Aditya', 'Kavya', 'Rahul', 'Sneha',
  'Karan', 'Pooja', 'Amit', 'Divya', 'Nikhil',
  'Riya', 'Siddharth', 'Meera', 'Arjun', 'Tanya',
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Mehta', 'Gupta',
  'Singh', 'Joshi', 'Kumar', 'Mishra', 'Nair',
  'Rao', 'Iyer', 'Bose', 'Das', 'Pillai',
  'Reddy', 'Malhotra', 'Chopra', 'Saxena', 'Trivedi',
];

const f = firstNames[Math.floor(Math.random() * firstNames.length)];
const l = lastNames[Math.floor(Math.random() * lastNames.length)];

function randomUsername() {
  return `${f.toLowerCase()}_${l.toLowerCase()}`;
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [placeholder] = useState(randomUsername);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.target);
    const username = form.get('username');
    const password = form.get('password');
    const supabase = createClient();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username)
      .single();

    if (profileError || !profile) {
      setError('No account found with that username.');
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (signInError) {
      if (signInError.message.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email before logging in.');
      } else {
        setError('Incorrect password.');
      }
      setLoading(false);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('display_name, username')
          .eq('id', user.id)
          .single();
        if (prof) {
          window.dispatchEvent(new CustomEvent('atmos:profileChanged', { detail: prof }));
        }
      }
      router.refresh();
      router.push('/dashboard');
    }
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <NavbarBorderOverride />
      <div className="flex-1 flex items-center justify-center px-6 pt-16">
        <div className="w-full max-w-sm">
          <h1 className="font-heading text-2xl font-semibold tracking-tight mb-1">Welcome back</h1>
          <p className="text-sm text-neutral-500 mb-7">Log in to your Atmos account.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-neutral-500 block mb-1.5">Username</label>
              <input
                name="username"
                type="text"
                placeholder={placeholder}
                required
                className="field-input"
                onChange={(e) => { e.target.value = e.target.value.toLowerCase().replace(/\s/g, ''); }}
                onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }}
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500 block mb-1.5">Password</label>
              <input name="password" type="password" placeholder="••••••••••" required className="field-input" />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary mt-2 w-full bg-brand text-brand-on-bg py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-neutral-500">
            No account? <Link href="/signup" className="link">Sign up instead!</Link>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}