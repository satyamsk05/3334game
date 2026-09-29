/** @type {import('next').NextConfig} */
const backendOrigin =
  process.env.BACKEND_API_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:4001';
const wsOrigin = backendOrigin.replace(/^http/, 'ws');

// Build a strict CSP — no unsafe-inline in script-src, exact connect-src origins.
// Tailwind/PostCSS generates all CSS at build time, so no inline styles are injected
// by our code. Next.js itself may inject a small inline style tag; we allow it via
// 'unsafe-inline' in style-src only (acceptable; mitigated by no external style sources).
const cspHeader = [
  "default-src 'self'",
  // No unsafe-inline — scripts are bundled by Next.js; no raw <script> blocks in admin panel
  "script-src 'self'",
  // Allow inline styles only (Next.js injects critical CSS inline)
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  // Exact backend origins only — no wildcard ws:, https:
  `connect-src 'self' ${backendOrigin} ${wsOrigin}`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
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
