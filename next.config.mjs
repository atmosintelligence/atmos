/** @type {import('next').NextConfig} */

// Files that never change between deploys can be cached for a long time.
const longCache = [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }];

const nextConfig = {
  turbopack: {},
  poweredByHeader: false,
  // The About pages moved under /about. Old links and QR codes keep working.
  async redirects() {
    return [
      { source: '/future', destination: '/about/future', permanent: true },
      { source: '/future/ai', destination: '/about/ai', permanent: true },
      { source: '/future/cybersecurity', destination: '/about/cybersecurity', permanent: true },
      { source: '/pricing/subsidy', destination: '/about/subsidy', permanent: true },
      { source: '/bibliography', destination: '/about/bibliography', permanent: true },
    ];
  },
  async headers() {
    return [
      { source: '/countries.json', headers: longCache },
      { source: '/logo.png', headers: longCache },
      { source: '/favicon.png', headers: longCache },
    ];
  },
};

export default nextConfig;
