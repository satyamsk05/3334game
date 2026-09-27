# 04 — Security Audit (Admin Panel + Backend)

## P1 — Token Storage in localStorage

### Current

```ts
localStorage.setItem('adminToken', token);
// later
config.headers.Authorization = `Bearer ${token}`;
```

### Risk

XSS on admin panel can steal the token → full admin access.

### Mitigations (short term)

- Keep CSP strict (already partially set on backend)
- Never render untrusted HTML in admin UI
- Short JWT expiry + refresh if possible

### Better long-term

- httpOnly + Secure + SameSite cookie for admin session
- CSRF token for state-changing requests
- Or short-lived access token + refresh token in httpOnly cookie

---

## P1 — CORS Configuration

Already covered in `01-CRITICAL-NETWORK-CONFIG.md`.

Key rules:

- Never hardcode IP
- Use `CORS_ORIGIN` env (comma-separated exact origins)
- In production do **not** allow `*`
- Vercel previews: either allow `*.vercel.app` or pin exact production domain

---

## P2 — Frontend Does Not Respect RBAC

Backend has good permission checks:

```ts
requirePermission('users.manage')
requirePermission('payments.approve')
// etc.
```

Frontend still shows all buttons. User clicks → 403.

### Fix (simple)

After login, store permissions:

```ts
localStorage.setItem('adminPermissions', JSON.stringify(user.permissions || []));
```

Helper:

```ts
export function can(permission: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const perms: string[] = JSON.parse(localStorage.getItem('adminPermissions') || '[]');
    return perms.includes(permission) || perms.includes('*');
  } catch {
    return false;
  }
}
```

Usage:

```tsx
{can('payments.approve') && (
  <Button onClick={approve}>Approve</Button>
)}
```

---

## P2 — Password Handling on Create Admin

Ensure backend hashes password (bcrypt/argon2) and never returns hash.

Frontend should never log the password.

---

## Already Good

| Item | Status |
|------|--------|
| `X-Powered-By` disabled | OK |
| Security headers (HSTS, X-Frame-Options, nosniff, CSP, Referrer-Policy) | OK |
| Rate limiting (global + auth) | OK |
| JSON body size limit 100kb | OK |
| Admin routes behind `authenticateAdmin` | OK |
| Permission middleware | OK |
| Credentials + specific allowed headers | OK |

---

## Recommended CSP Tightening (Backend)

Current CSP allows `'unsafe-inline'` for scripts (needed for some admin HTML). For Next.js admin panel (separate origin) this is less critical.

If serving admin from same origin later, move to nonces / hashes.

---

## Checklist

- [ ] No hardcoded secrets in repo (check `.env` is gitignored)
- [ ] JWT secret strong and rotated
- [ ] Admin passwords hashed
- [ ] Audit log for sensitive actions (wallet adjust, ban, approve) — already present
- [ ] HTTPS only in production (HSTS already set)
