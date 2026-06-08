'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import NavbarBorderOverride from '@/components/NavbarBorderOverride';
import { createClient } from '@/utils/supabase/client';

const firstNames = [
  'Aryan', 'Rohan', 'Vikram', 'Aditya', 'Rahul',
  'Karan', 'Amit', 'Nikhil', 'Siddharth', 'Arjun',
  'Aarav', 'Vivaan', 'Krishna', 'Yash', 'Akash',
  'Raj', 'Varun', 'Harsh', 'Manav', 'Dhruv',

  'Priya', 'Ananya', 'Neha', 'Kavya', 'Sneha',
  'Pooja', 'Divya', 'Riya', 'Meera', 'Tanya',
  'Aanya', 'Diya', 'Ishita', 'Aditi', 'Shruti',
  'Simran', 'Naina', 'Anjali', 'Muskan', 'Saanvi',
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Mehta', 'Gupta',
  'Singh', 'Joshi', 'Kumar', 'Mishra', 'Nair',
  'Rao', 'Iyer', 'Bose', 'Das', 'Pillai',
  'Reddy', 'Malhotra', 'Chopra', 'Saxena', 'Trivedi',
  'Agarwal', 'Bhat', 'Chatterjee', 'Desai', 'Dubey',
  'Ghosh', 'Jain', 'Kapoor', 'Khanna', 'Kulkarni',
  'Mukherjee', 'Pandey', 'Sethi', 'Sinha', 'Thakur',
  'Yadav', 'Bansal', 'Bhattacharya', 'Tiwari', 'Menon',
];

const f = firstNames[Math.floor(Math.random() * firstNames.length)];
const l = lastNames[Math.floor(Math.random() * lastNames.length)];

function randomUsername() {
  return `${f.toLowerCase()}_${l.toLowerCase()}`;
}

function randomDisplayName() {
  return `${f} ${l}`;
}

function validateUsername(value) {
  if (!value) return 'Username is required.';
  if (/\s/.test(value)) return 'Username cannot contain spaces.';
  if (/[A-Z]/.test(value)) return 'Username must be lowercase.';
  if (!/^[a-z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores.';
  return null;
}

export default function SignupPage() {
  const router = useRouter();
  const [error, setError]                 = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [loading, setLoading]             = useState(false);
  const [placeholder]                     = useState(randomUsername);
  const [placeholder2]                    = useState(randomDisplayName);
  const [location, setLocation]           = useState({ lat: null, lon: null });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {}
    );
  }, []);

  function handleUsernameChange(e) {
    const val = e.target.value.toLowerCase().replace(/\s/g, '');
    e.target.value = val;
    setUsernameError(validateUsername(val) ?? '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.target);
    const username = form.get('username');
    const usernameErr = validateUsername(username);
    if (usernameErr) { setUsernameError(usernameErr); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.get('email'),
      password: form.get('password'),
      options: {
        data: {
          display_name: form.get('display_name'),
          username,
          latitude:  location.lat,
          longitude: location.lon,
        },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <NavbarBorderOverride />
      <div className="flex-1 flex items-center justify-center px-6 pt-16">
        <div className="w-full max-w-sm">
          <h1 className="font-heading text-2xl font-semibold tracking-tight mb-1">Create an account</h1>
          <p className="text-sm text-neutral-500 mb-7">Start monitoring your environment today.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-neutral-500 block mb-1.5">Display name</label>
              <input name="display_name" type="text" placeholder={placeholder2} required className="field-input" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 block mb-1.5">Username</label>
              <input
                name="username"
                type="text"
                placeholder={placeholder}
                required
                className="field-input"
                onChange={handleUsernameChange}
                onKeyDown={(e) => { if (e.key === ' ') e.preventDefault(); }}
              />
              {usernameError && <p className="text-xs text-red-500 mt-1">{usernameError}</p>}
            </div>
            <div>
              <label className="text-xs text-neutral-500 block mb-1.5">Email</label>
              <input name="email" type="email" placeholder={`${f.toLowerCase()}@example.com`} required className="field-input" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 block mb-1.5">Password</label>
              <input name="password" type="password" placeholder="••••••••••" required className="field-input" />
              <p className="text-xs text-neutral-400 mt-1.5">
                Your approximate location will be saved to enable outdoor weather comparisons in your dashboard.{' '}
                {location.lat
                  ? <span className="text-brand">Location detected.</span>
                  : <span>Allow location access in your browser for best results.</span>
                }
              </p>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary mt-2 w-full bg-brand text-brand-on-bg py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-neutral-500">
            Already have an account? <Link href="/login" className="link">Log in</Link>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}