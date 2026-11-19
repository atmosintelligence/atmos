/** @type {import('next').NextConfig} */

// Files that never change between deploys can be cached for a long time.
const longCache = [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }];

const nextConfig = {
  turbopack: {},
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }, { key: 'Service-Worker-Allowed', value: '/' }] },
      { source: '/manifest.webmanifest', headers: [{ key: 'Content-Type', value: 'application/manifest+json' }, { key: 'Cache-Control', value: 'public, max-age=3600' }] },
      { source: '/countries.json', headers: longCache },
      { source: '/logo.png', headers: longCache },
      { source: '/favicon.png', headers: longCache },
    ];
  },
};

export default nextConfig;
