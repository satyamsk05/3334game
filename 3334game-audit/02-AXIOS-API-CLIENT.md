# 02 — Axios API Client (`admin-panel/src/services/api.ts`)

## Current Problems

| # | Problem | Impact |
|---|---------|--------|
| 1 | No `timeout` | Hanging requests on slow/dead backend |
| 2 | No retry for network / 5xx | Transient EC2 blips show permanent error |
| 3 | Only handles 401 | 403 / 5xx / network errors look the same |
| 4 | Raw Axios error messages leak | UI shows cryptic or internal messages |
| 5 | No request cancellation | Dashboard range switch races |

## Recommended Fixed Version

Replace entire `admin-panel/src/services/api.ts` with:

```ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const getBaseURL = (): string => {
  // Prefer Next.js rewrite (relative) in browser
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }
  return process.env.NEXT_PUBLIC_API_URL || '/api/v1';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15_000, // 15s — prevents infinite hang
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------- Request: attach token ----------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ---------- Response: auth + normalized errors ----------
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // Network / timeout / no response
    if (!error.response) {
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      return Promise.reject({
        message: isTimeout
          ? 'Request timed out. Please try again.'
          : 'Network error. Check your connection or server status.',
        isNetwork: true,
        isTimeout,
        original: error,
      });
    }

    const status = error.response.status;
    const data = error.response.data;

    // 401 — only clear session (not on login endpoint)
    if (status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/admin/login');
      if (!isLoginRequest && typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Normalized error object for UI
    return Promise.reject({
      message: data?.message || data?.error || error.message || 'Something went wrong',
      status,
      isNetwork: false,
      isForbidden: status === 403,
      isUnauthorized: status === 401,
      data,
      original: error,
    });
  }
);

export default api;
```

## Optional: Simple Retry Helper

If you don't want extra packages, add this utility:

```ts
// services/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 800
): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      // Only retry network / 5xx
      if (!err.isNetwork && !(err.status >= 500 && err.status < 600)) {
        throw err;
      }
      if (i < retries) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
  }
  throw lastError;
}
```

Usage in dashboard:

```ts
const res = await withRetry(() => adminService.getDashboardStats(selectedRange));
```

## UI Error Handling Pattern (use everywhere)

```ts
try {
  setLoading(true);
  setError(null);
  const res = await adminService.getDashboardStats(range);
  if (res.success && res.data) {
    setStats(res.data);
  } else {
    setError(res.message || 'Failed to load data');
  }
} catch (err: any) {
  if (err.isNetwork) {
    setError(err.message); // already user-friendly
  } else if (err.isForbidden) {
    setError('You do not have permission for this action.');
  } else {
    setError(err.message || 'Unexpected error');
  }
} finally {
  setLoading(false);
}
```

## Optional Upgrade (recommended later)

Install React Query / TanStack Query:

```bash
npm install @tanstack/react-query
```

Benefits: automatic retry, cache, cancellation, loading states — kills most race conditions.
