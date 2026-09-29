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
  withCredentials: true,
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
