# 06 — Quick Fixes Checklist (Priority Order)

Apply in this order for maximum impact on network errors.

---

## Step 1 — Kill Hardcoded IPs (P0) — 15 min

### Files to edit

1. `admin-panel/.env.example`
2. `admin-panel/next.config.js`
3. `backend/src/app.ts` (CORS / PUBLIC_HOST)

### Actions

- [ ] Replace every `3.7.73.109` with env variable
- [ ] Update local `.env` files (not committed)
- [ ] Set correct values on Vercel + EC2

See exact code in `01-CRITICAL-NETWORK-CONFIG.md`.

---

## Step 2 — Harden Axios Client (P0) — 20 min

### File

`admin-panel/src/services/api.ts`

### Actions

- [ ] Add `timeout: 15000`
- [ ] Always prefer relative `/api/v1` in browser
- [ ] Normalize network / timeout / 403 / 401 errors
- [ ] Keep existing 401 logout logic

Full replacement code in `02-AXIOS-API-CLIENT.md`.

---

## Step 3 — Dashboard Error + Race Fix (P1) — 15 min

### File

`admin-panel/src/app/page.tsx`

### Actions

- [ ] Use new normalized errors from api.ts
- [ ] Add simple cancel flag or AbortController
- [ ] Show Retry button on network errors

See `05-DASHBOARD-UI.md`.

---

## Step 4 — Clean adminService (P2) — 5 min

### File

`admin-panel/src/services/adminService.ts`

### Actions

- [ ] Remove duplicate `adjustWallet` (keep `adjustUserWallet`)
- [ ] Search codebase for `adjustWallet` and update callers

---

## Step 5 — CORS Env Only (P1) — 10 min

### File

`backend/src/app.ts`

### Actions

- [ ] Remove hard-coded IP checks
- [ ] Rely on `CORS_ORIGIN` and `PUBLIC_HOST` env
- [ ] Document required env vars in backend README

---

## Step 6 — Optional but Valuable

- [ ] Add `@tanstack/react-query` for dashboard + lists
- [ ] Hide buttons based on permissions (`can('payments.approve')`)
- [ ] Deprecate / redirect legacy `/admin` HTML route
- [ ] Split large `page.tsx` into smaller components
- [ ] Standardize all backend responses to `{ success, data | message }`

---

## Env Vars Cheat Sheet

### Admin Panel (Vercel / local)

```env
BACKEND_API_URL=http://localhost:4001          # or production backend URL
NEXT_PUBLIC_API_URL=http://localhost:4001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:4001/ws
```

### Backend (EC2)

```env
NODE_ENV=production
PUBLIC_HOST=your-domain-or-ip
CORS_ORIGIN=https://admin-penal.vercel.app,https://your-admin.com
# JWT_SECRET, DB_*, etc.
```

---

## After Fixes — Test Matrix

| Scenario | Expected |
|----------|----------|
| Local admin → local backend | Works, no CORS error |
| Vercel admin → EC2 backend | Works with correct BACKEND_API_URL |
| Backend down | Friendly "Network error" + Retry |
| Expired token | Redirect to /login |
| No permission | 403 → "You do not have permission" |
| Slow network | Timeout after 15s, not infinite hang |
| IP change | Only env update required |

---

## Done When

- No `3.7.73.109` left in source code
- Network errors show clean message + retry
- Admin panel works on both localhost and Vercel without code change
- Only env differs between environments
