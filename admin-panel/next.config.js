/** @type {import('next').NextConfig} */
const backendOrigin =
  process.env.BACKEND_API_URL?.replace(/\/api\/v1\/?$/, '') ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') ||
  'http://localhost:4001';
const wsOrigin = backendOrigin.replace(/^http/, 'ws');

// Allow 'unsafe-inline' for Next.js hydration scripts/styles. Still blocks external script hosts,
// frames, and object embeds. Prefer nonces when the panel migrates to a nonce-capable setup.
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob:",
  `connect-src 'self' ${backendOrigin} ${wsOrigin}`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async rewrites() {
    const backend =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') ||
      'http://localhost:4001';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backend}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
