# 01 — Critical Network & Config Problems

## Problem 1 — Hardcoded Production IP (P0)

### Where

```text
admin-panel/.env.example
NEXT_PUBLIC_API_URL=http://3.7.73.109:4001/api/v1
NEXT_PUBLIC_WS_URL=ws://3.7.73.109:4001/ws

admin-panel/next.config.js
destination: `${process.env.BACKEND_API_URL || 'http://3.7.73.109:4001'}/api/v1/:path*`

backend/src/app.ts
const publicHost = process.env.PUBLIC_HOST || '3.7.73.109';
if (host === publicHost || host === '3.7.73.109') { ... }
```

### Why it breaks

- EC2 IP change / new server → admin panel rewrite + CORS fail
- Local development still points to production IP
- Vercel deploy without correct env → 502 / network error
- Browser shows CORS or connection refused

### Fix

**1. `admin-panel/.env.example`**

```env
# Admin Panel Environment Variables

# Browser-side API (used by axios when not using rewrite)
NEXT_PUBLIC_API_URL=http://localhost:4001/api/v1

# Server-side rewrite target (Next.js only — never expose to browser)
BACKEND_API_URL=http://localhost:4001

# WebSocket (if used)
NEXT_PUBLIC_WS_URL=ws://localhost:4001/ws
```

**2. `admin-panel/next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backend = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:4001';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backend}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

**3. `backend/src/app.ts` (CORS section)**

```ts
const publicHost = process.env.PUBLIC_HOST; // NO default IP
// ...
if (publicHost && (host === publicHost)) {
  return callback(null, true);
}
// Remove the hard-coded '3.7.73.109' check entirely
```

**4. Production `.env` on server / Vercel**

```env
# Vercel (admin-panel)
BACKEND_API_URL=https://your-backend-domain.com   # or http://internal-ip:4001
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1

# Backend EC2
PUBLIC_HOST=your-backend-domain.com
CORS_ORIGIN=https://admin-penal.vercel.app,https://your-admin-domain.com
```

---

## Problem 2 — Fragile Base URL Logic (P0)

### Current code (`admin-panel/src/services/api.ts`)

```ts
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'https:' || !process.env.NEXT_PUBLIC_API_URL) {
      return '/api/v1';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || '/api/v1';
};
```

### Why it breaks

- HTTPS admin panel always forces relative `/api/v1` (depends on Next rewrite)
- If rewrite target is wrong → 404 / network error
- SSR / build time `process.env.NEXT_PUBLIC_*` can be undefined
- Mixed HTTP/HTTPS causes unexpected fallback

### Fix (recommended)

```ts
const getBaseURL = (): string => {
  // Prefer relative path so Next.js rewrite handles proxy (works for both HTTP & HTTPS)
  // Only fall back to absolute URL when explicitly needed (e.g. local without Next)
  if (typeof window !== 'undefined') {
    // Always use relative in browser → Next rewrite
    return '/api/v1';
  }
  // Server-side (rare for this client) or build
  return process.env.NEXT_PUBLIC_API_URL || '/api/v1';
};
```

Or keep absolute for pure local testing:

```ts
const getBaseURL = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return envUrl; // direct to backend on local
  }
  return '/api/v1'; // production / Vercel → rewrite
};
```

---

## Problem 3 — CORS Too Restrictive + Hardcoded (P0)

### Current logic (simplified)

- Allows `*` or non-production
- Allows localhost
- Allows exact `3.7.73.109`
- Allows `*.vercel.app`
- Everything else → `callback(null, false)` (silent fail, no CORS headers)

### Symptoms

- New admin domain → browser console: `CORS policy: No 'Access-Control-Allow-Origin'`
- Network tab shows failed preflight

### Fix

```ts
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // mobile / curl / same-origin

    if (process.env.CORS_ORIGIN === '*' || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    const allowed = (process.env.CORS_ORIGIN || '')
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);

    try {
      const url = new URL(origin);
      const host = url.hostname;

      if (host === 'localhost' || host === '127.0.0.1') {
        return callback(null, true);
      }

      if (allowed.includes(origin) || allowed.includes(url.origin)) {
        return callback(null, true);
      }

      // Optional: allow any vercel preview
      if (host.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      return callback(null, false);
    } catch {
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
}));
```

**Never hardcode IP again.** Use env only.

---

## Problem 4 — Missing Timeout / Retry (P0 for flaky networks)

See `02-AXIOS-API-CLIENT.md` for full fixed `api.ts`.

---

## Verification Checklist

After applying fixes:

- [ ] Local: `admin-panel` on `:3001` → backend on `:4001` works without IP
- [ ] Vercel deploy: set `BACKEND_API_URL` to real backend URL
- [ ] Change backend IP → only update env, no code change
- [ ] Browser Network tab: requests go to `/api/v1/...` (relative) or correct absolute
- [ ] CORS preflight returns `Access-Control-Allow-Origin` for your admin domain
