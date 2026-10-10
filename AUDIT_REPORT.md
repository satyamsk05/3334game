# BitArcade Platform — Full Security Audit Report

> **Auditor**: Antigravity AI Security Agent  
> **Date**: 2026-10-10  
> **Scope**: `/Users/satyamkumar/3334game` — Backend (Go/Gin), Admin Panel (Next.js 14), Mobile App (Android/Kotlin/Compose), Payment Proxy (Static HTML/Vercel)

---

## Executive Summary

**Overall Risk Score: 8.5 / 10 (CRITICAL)**

The platform is a real-money gaming application (UPI deposits/withdrawals, paise-denominated wallet) running on a live production server. The audit uncovered **7 Critical** and **8 High** severity vulnerabilities that can lead to direct financial loss, complete admin takeover, and user account compromise. Several issues are compounded — for example, no rate limiting combined with no OTP authentication means an attacker can enumerate or register any phone number instantly. The good news: strong foundations exist (JWT middleware, EncryptedSharedPreferences on Android, no SQLi, Gin binding), making fixes tractable.

---

## Project Map

| Layer | Technology | Key Files |
|---|---|---|
| **Backend API** | Go 1.25 / Gin v1.9.1 / GORM v1.25 / PostgreSQL / Redis | `backend/cmd/server/main.go`, `internal/handlers/handlers.go`, `internal/services/` |
| **Admin Panel** | Next.js 14 / TypeScript / Axios / Tailwind | `admin-panel/src/app/`, `src/services/adminService.ts`, `src/components/layout/AdminGuard.tsx` |
| **Mobile App** | Android (Kotlin/Compose) / OkHttp / EncryptedSharedPreferences / Firebase FCM | `app/src/main/java/com/playingame/app/` |
| **Payment Proxy** | Static HTML + Vercel rewrites | `payment-proxy/index.html`, `payment-proxy/vercel.json` |
| **Database** | PostgreSQL via Supabase; Redis (optional cache) | `backend/internal/database/db.go` |
| **3rd-party** | Loggin.dev (WhatsApp OTP), Firebase FCM (push) | `LogginAuthService.kt`, `auth_service.go` |

**Communication flow**: Android app → Go backend (REST + WebSocket) → PostgreSQL. Admin panel → Next.js rewrites → Go backend. Payment proxy (Vercel) → EC2 HTTP.

---

## Findings Table

| ID | Severity | Area | File : Line | What Is Wrong | Why It Matters | How to Fix |
|---|---|---|---|---|---|---|
| **SEC-01** | 🔴 Critical | Auth | `backend/.env:7-11` | **Hardcoded weak JWT secret and default admin credentials checked into VCS** (`JWT_SECRET=dev_jwt_secret_...`, `ADMIN_USERNAME=admin`, `ADMIN_PASSWORD=admin123`) | Anyone with repo access can forge any JWT or log in as admin | Rotate secrets immediately. Use strong random 256-bit values. Never commit `.env` (verify `.gitignore` correctly excludes it). |
| **SEC-02** | 🔴 Critical | Auth | `backend/internal/handlers/handlers.go:48-72` | **No OTP / no verification — phone number login with zero authentication.** `LoginOrRegister` creates/returns a session for any phone string passed. No SMS OTP, no WhatsApp verification. | Any attacker can log in as `+91XXXXXXXXXX` and get a valid JWT for that user with a single API call. Trivially bypasses account ownership. | Require verified WhatsApp token from Loggin.dev before issuing JWT. Gate `LoginOrRegister` behind token verification flow. |
| **SEC-03** | 🔴 Critical | Auth/IDOR | `backend/internal/handlers/handlers.go:155-163` | **IDOR on `/wallet/balance` — no auth, userId from query param.** The endpoint first tries `c.Query("userId")` and only falls back to JWT. An authenticated user can pass `?userId=<victim_id>` and read any user's balance. | Full financial data of any user exposed without authentication. | Remove `c.Query("userId")` fallback entirely. Always use `c.GetString("userId")` from JWT. Apply `JWTAuthMiddleware` to this route. |
| **SEC-04** | 🔴 Critical | Auth/IDOR | `backend/internal/handlers/handlers.go:184-201` & `backend/cmd/server/main.go:86-88` | **`/wallet/balance` and `/wallet/transactions` have no JWT middleware applied.** Routes are in `walletGroup` without `.Use(middleware.JWTAuthMiddleware(cfg))`. | Unauthenticated access to any user's transaction history by guessing user IDs. | Add `walletGroup.Use(middleware.JWTAuthMiddleware(cfg))` and remove `c.Query("userId")` fallback. |
| **SEC-05** | 🔴 Critical | Auth | `backend/internal/handlers/handlers.go:239-257` | **`SubmitUTR` has no authentication and no ownership check.** Any caller can set a UTR for any deposit ID (`backend/cmd/server/main.go:94`: `paymentGroup.POST("/deposits/utr", apiHandler.SubmitUTR)` — no middleware). | Attacker can submit a fake UTR on anyone else's deposit, potentially poisoning the approval queue. | Add `JWTAuthMiddleware`, then verify `deposit.UserID == c.GetString("userId")` before accepting the UTR. |
| **SEC-06** | 🔴 Critical | Auth | `backend/internal/config/config.go:56-61` | **Default admin password hardcoded as fallback**: `if adminPass == "" { adminPass = "admin123" }`. Even if `.env` is absent, server starts with known credentials. | Silent credential bake-in — server is accessible as `admin`/`admin123` in any configuration failure. | Remove the hardcoded fallback. Return a fatal error if `ADMIN_PASSWORD` is not set. |
| **SEC-07** | 🔴 Critical | Secrets | `app/src/main/java/com/playingame/app/core/config/ClientConfig.kt:16` | **Hardcoded ngrok URL in production Android binary**: `var SERVER_BASE_URL: String = "https://03ab-2402-3a80-...ngrok-free.app"`. This is mutable and publicly visible in decompiled APK. | Production APK points all traffic to a developer-controlled tunnel, not the real server. Anyone can MITM traffic or kill the service. | Set URL via `BuildConfig` field sourced from `local.properties` or Gradle secrets. Use separate `debug`/`release` variants. |
| **HIGH-01** | 🟠 High | Security | `backend/internal/middleware/middleware.go:13-33` | **CORS wildcard with credentials**: `Access-Control-Allow-Origin` is set to the request's `Origin` verbatim (any origin), AND `Access-Control-Allow-Credentials: true`. Env also has `CORS_ORIGIN=*`. | Allows cross-origin requests with cookies/tokens from any website — enables CSRF on credentialed endpoints. | Maintain an allowlist of valid origins and reject others: `if !isAllowed(origin) { c.AbortWithStatus(403) }`. |
| **HIGH-02** | 🟠 High | Security | `backend/internal/ws/hub.go:20-22` | **WebSocket origin check disabled**: `CheckOrigin: func(r *http.Request) bool { return true }` | Any website can open a WebSocket to the server and send messages. Combined with missing WS auth for "guest" connections, this enables cross-site WebSocket hijacking. | Validate `r.Header.Get("Origin")` against the known allowed origins list. |
| **HIGH-03** | 🟠 High | Security | `backend/cmd/server/main.go` (entire file) | **Zero rate limiting anywhere in the backend.** No middleware, no Redis-based throttling on any route — including login, OTP, deposit, withdrawal. | Enables brute-force of admin credentials, mass account enumeration, and flooding financial operations. | Add `golang.org/x/time/rate` or `github.com/ulule/limiter` middleware; at minimum apply to `/auth/`, `/payments/`. |
| **HIGH-04** | 🟠 High | Auth | `backend/internal/handlers/handlers.go:102-131` | **`VerifyWhatsApp` does not verify the WhatsApp token with Loggin.dev.** It accepts any `token` string and fabricates a phone from it: `phone = "98" + req.Token[max(0, len(req.Token)-8):]`. No SSE poll. | Any caller can call `POST /auth/whatsapp/verify` with an arbitrary token and get a JWT for a fabricated phone number. The entire WhatsApp 2FA is non-functional. | Call `LogginAuthService.waitForVerification(token)` on the server side and only issue JWT after verified phone is returned. |
| **HIGH-05** | 🟠 High | Business Logic | `backend/internal/services/wallet_service.go:235-253` | **`ApproveDeposit` is not atomic.** Status is set to `APPROVED` then `CreditDeposit` is called in a separate DB operation with no transaction wrapping. If the server crashes between the two operations, credit is not applied but deposit shows as approved. Also, `CreditDeposit` acquires its own mutex lock while `ApproveDeposit` doesn't — race condition between concurrent approvals of the same deposit. | Double-approval possible; if exploited, a deposit record can be approved without crediting funds (or vice versa with race on concurrent calls). | Wrap in a GORM transaction: `db.Transaction(func(tx *gorm.DB) error { ... })`. Use `SELECT ... FOR UPDATE` on the deposit row. |
| **HIGH-06** | 🟠 High | Auth | `backend/internal/handlers/handlers.go:294-313` | **IDOR on `UpdateProfile`**: `userID := c.Param(":id")` is used first before falling back to JWT. Any authenticated user can update any other user's `name` and `avatarId` by calling `PUT /api/v1/users/<victim_id>`. | Complete profile takeover for any user. | Remove `c.Param(":id")` fallback. Always use `userID = c.GetString("userId")` from JWT. |
| **HIGH-07** | 🟠 High | Secrets | `app/src/main/java/com/playingame/app/data/remote/LogginAuthService.kt:28` and `auth_service.go:215` | **Business WhatsApp phone number hardcoded**: `BUSINESS_PHONE = "919989907408"` in both the APK and backend. | Exposed phone number, non-rotatable without an app update. Minor info-leak risk; bigger concern is it signals the platform operator's direct contact to attackers. | Move to backend configuration / `BuildConfig`. |
| **HIGH-08** | 🟠 High | Admin | `backend/internal/handlers/handlers.go:409` | **Admin JWT is generated using the same `GenerateToken` function** (`GenerateToken("admin-1", "admin")`). The admin ID is hardcoded as `"admin-1"`. No support for multiple admin accounts, no session invalidation. | If the admin JWT leaks, there is no way to invalidate it. Anyone who has or steals the token has permanent admin access until expiry (30 days). | Implement admin session table in DB. Support token revocation. Use shorter-lived tokens (1–8 hours) with refresh for admin. |
| **MED-01** | 🟡 Medium | Security | `backend/internal/middleware/middleware.go:35-41` | **Missing critical security headers**: No `Strict-Transport-Security (HSTS)`, no `Content-Security-Policy`, no `X-XSS-Protection`, no `Permissions-Policy`. Only `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` are set. | Increases attack surface for MITM, XSS, clickjacking against clients not using HTTPS. | Add: `c.Writer.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains")` and a CSP header. |
| **MED-02** | 🟡 Medium | Security | `backend/internal/middleware/middleware.go:48-52` | **JWT passed via URL query param** (`?token=...`) is accepted as fallback. | Tokens in URLs appear in server logs, browser history, Referer headers, and proxy logs — serious token leakage. | Remove the query-param fallback for JWT. Only accept `Authorization: Bearer` header. |
| **MED-03** | 🟡 Medium | Business Logic | `backend/internal/handlers/handlers.go:210-232` | **No minimum/maximum deposit amount validation.** `InitiateDeposit` accepts any float, including `0`, `-1`, or `999999`. Withdrawal has limits but deposit does not. | Malicious actors can create noise deposits (₹0.01) or attempt to corner-case the approval system. | Add: `if req.AmountRupees < 10 || req.AmountRupees > 100000 { return error }`. |
| **MED-04** | 🟡 Medium | Business Logic | `backend/internal/services/wallet_service.go:374-441` | **`AdjustWallet` default case credits `deposit` bucket for any unrecognized `bucket` value.** An admin sending `bucket: "hacked"` would silently credit deposit balance. | Silent misrouting of admin wallet adjustments; no error returned for invalid bucket values. | Return error on default case: `default: return errors.New("invalid bucket: must be deposit, winnings, or bonus")`. |
| **MED-05** | 🟡 Medium | Auth | `backend/internal/handlers/handlers.go:339-373` | **`AuthStatus` endpoint leaks user PII unauthenticated**: returns `userId`, `name`, `phone`, and `isBanned` for any phone or userId query. No authentication required. | Unauthenticated user enumeration — any phone number can be checked to see if it's registered. Full PII disclosure. | Rate-limit the endpoint. Consider removing `phone` and `name` from the unauthenticated response. Return only `exists` and `isBanned`. |
| **MED-06** | 🟡 Medium | Admin | `admin-panel/src/services/adminService.ts:397-410` | **Admin panel calls endpoints for `/admin/admins`, `/admin/games`, `/admin/system/settings` that do not exist on the backend**. The backend does not implement these routes. | Admin panel silently fails on these features (CRUD admins, edit games, system settings). These are phantom routes. If a future developer adds them without auth review, they could be unprotected. | Either implement these backend routes with proper auth, or remove the dead service calls. |
| **MED-07** | 🟡 Medium | Mobile | `app/src/main/res/xml/network_security_config.xml:10-15` | **Cleartext HTTP allowed to EC2 production IP `3.7.73.109`** and loopback addresses. | All API traffic to the production server can be sent over plain HTTP. An on-path attacker can intercept credentials and tokens. | Remove `3.7.73.109` from the cleartext allowlist. Enforce TLS (HTTPS) on the production server and use `cleartextTrafficPermitted="false"` for all domains. |
| **MED-08** | 🟡 Medium | Secrets | `app/src/main/java/com/playingame/app/App334Application.kt:44-46` | **`DebugLogger` enabled for Coil image loader in debug builds.** Android `Log.d` statements (user ID, server name, FCM token in `AuthRepository.kt:348`) are present and will appear in `adb logcat` in debug builds. | Sensitive data (userId, name) visible in device logs. In debug APKs these are accessible. | Keep `DebugLogger` conditional (already done). Add ProGuard rule to strip `Log.d`/`Log.v` calls in release builds. |
| **MED-09** | 🟡 Medium | DevOps | `payment-proxy/vercel.json:6,10,14` | **Payment proxy rewrites plaintext HTTP to production EC2 `http://3.7.73.109:4001`**. Vercel terminates TLS but proxies to EC2 over plaintext. | Man-in-the-middle between Vercel edge and EC2. Deposit IDs and payment data in transit are unencrypted. | Enable HTTPS/TLS on the EC2 payment server. Update vercel.json to `https://`. |
| **MED-10** | 🟡 Medium | Business Logic | `backend/internal/services/wallet_service.go:149` | **Withdrawal ID generated from `time.Now().UnixNano()%1000000000000`** — not a UUID. Nano timestamps are predictable and could collide under high concurrency. | Predictable IDs allow withdrawal enumeration; potential ID collision corrupts records. | Use `uuid.New().String()` from `github.com/google/uuid` (already in go.mod). |
| **MED-11** | 🟡 Medium | Performance | `backend/internal/handlers/handlers.go:488-509` | **N+1 query in `AdminGetUsers`**: For each of up to 100 users, a separate wallet query is fired (`GetOrCreateWallet`). On 100 users = 101 DB queries. | Scales very poorly. Degrades admin panel performance linearly. | Use a JOIN or batch query: `SELECT wallets.* FROM wallets WHERE user_id IN (...)`. |
| **LOW-01** | 🟢 Low | Security | `app/google-services.json:18` | **Firebase API key committed to Git**: `"current_key": "AIzaSyC00SJqjcg6wutDxVZeVdjYOHdP2KRmd3A"`. | Firebase API keys for Android are intended to be public (access controlled by Firebase security rules), but the project_number and app_id are also exposed. If Firebase rules are misconfigured, this can allow unauthorized Firebase access. | Verify Firebase security rules are correctly configured. Consider restricting the API key to only the required Android package. The key itself is expected to be in the APK, but document this clearly. |
| **LOW-02** | 🟢 Low | Code Quality | `backend/internal/services/auth_service.go:206-219` | **`rand.Intn` used for WhatsApp token generation** — not cryptographically random (`math/rand` not `crypto/rand`). | Token prediction unlikely in practice but is a code quality concern; `math/rand` is seeded predictably in older Go. | Use `crypto/rand` for all security-relevant token generation. |
| **LOW-03** | 🟢 Low | Code Quality | `backend/internal/services/wallet_service.go:443-497` | **`GetFinancialStats` loads ALL wallets and withdrawals into memory** (`s.bundle.DB.Find(&wallets)`) for aggregation. No pagination or SQL aggregation. | At scale (10k+ users), this fetches the entire wallets table into application memory — OOM risk and very slow admin dashboard. | Use SQL aggregation: `SELECT SUM(deposit_paise) FROM wallets`, not application-level summation. |
| **LOW-04** | 🟢 Low | Code Quality | `backend/internal/handlers/handlers.go:488` | **`AdminGetUsers` hard-capped at 100 users with no pagination.** Client sends no page/offset params; server always returns first 100. | Admin cannot see all users in a large deployment. | Add `page` and `limit` query params with server-side `OFFSET`/`LIMIT`. |
| **LOW-05** | 🟢 Low | UX | `backend/internal/handlers/handlers.go:56-58` | **Internal error messages leaked in API responses**: `c.JSON(..., gin.H{"error": err.Error()})` returns raw Go error strings including potential DB internals. | Leaks stack traces, table names, and query details to clients. | Wrap errors: return generic user-facing messages in production; log the detail server-side. |

---

## Sorted by Severity

### 🔴 Critical (7)
- SEC-01 · SEC-02 · SEC-03 · SEC-04 · SEC-05 · SEC-06 · SEC-07

### 🟠 High (8)
- HIGH-01 · HIGH-02 · HIGH-03 · HIGH-04 · HIGH-05 · HIGH-06 · HIGH-07 · HIGH-08

### 🟡 Medium (11)
- MED-01 through MED-11

### 🟢 Low (5)
- LOW-01 through LOW-05

---

## Top 10 Fix Priority List

| Priority | Finding | Action | ETA |
|---|---|---|---|
| **1** | SEC-01 | Rotate `JWT_SECRET`, `ADMIN_JWT_SECRET`, and `ADMIN_PASSWORD` immediately on the live server. Never re-commit `.env` to Git. | **Today** |
| **2** | SEC-02 + HIGH-04 | Enforce real WhatsApp token verification via Loggin.dev SSE on the backend before issuing a JWT. The `VerifyWhatsApp` handler must call the verification service. | Day 1 |
| **3** | SEC-03 + SEC-04 | Add `JWTAuthMiddleware` to `walletGroup`. Remove `c.Query("userId")` fallback from `GetBalance` and `GetTransactions`. | Day 1 |
| **4** | SEC-05 | Add `JWTAuthMiddleware` to `POST /payments/deposits/utr`. Add ownership check: verify `deposit.UserID == jwtUserID` before accepting UTR. | Day 1 |
| **5** | HIGH-03 | Add global rate limiter middleware. Minimum: 5 req/min on `/auth/`, 10 req/min on `/payments/`, 30 req/min general. Use Redis (already connected). | Day 2 |
| **6** | SEC-07 | Replace hardcoded ngrok URL in `ClientConfig.kt` with `BuildConfig` variable. Add `release` variant pointing to the real HTTPS production server. | Day 2 |
| **7** | HIGH-06 | Remove `c.Param(":id")` fallback from `UpdateProfile`. Only use JWT `userId`. | Day 2 |
| **8** | MED-07 + MED-09 | Enforce TLS on the production EC2 server. Remove HTTP cleartext allowlist for `3.7.73.109`. Update `vercel.json` rewrites to `https://`. | Day 3 |
| **9** | HIGH-01 + HIGH-02 | Fix CORS to use an explicit allowlist. Fix WebSocket `CheckOrigin` to validate against the same list. | Day 3 |
| **10** | HIGH-05 | Wrap `ApproveDeposit` in a GORM DB transaction. Add idempotency check (`SELECT FOR UPDATE`) to prevent double-credit on concurrent approval. | Day 4 |

---

## Areas Not Checked / Needs Verification

| Area | Reason |
|---|---|
| **Git history for committed secrets** | Only surface-level history checked. A full `git log -p` scan with `truffleHog` or `gitleaks` is needed to verify `.env` was never committed in earlier commits. |
| **ProGuard/R8 rules** | `proguard-rules.pro` was not fully analyzed. Verify that sensitive class names and token handling code are obfuscated in the release APK. |
| **Firebase Security Rules** | Cannot access the Firebase console. Verify Firestore/Storage rules do not allow public read/write if any Firebase services are used beyond FCM. |
| **Supabase Row-Level Security (RLS)** | Supabase is used as a raw PostgreSQL host. If RLS is not enabled, any leaked DB credentials provide full DB access. Cannot verify RLS from codebase alone. |
| **Full payment proxy logic** | `payment-proxy/index.html` is 1,384 lines. Only headers and backend URL were checked. The full JS deposit/UTR flow should be audited for client-side manipulation. |
| **CI/CD pipeline** | No Dockerfile, `docker-compose.yml`, or CI config (`.github/workflows`) was found. Cannot audit deployment security, secret injection, or image hardening. |
| **Certificate pinning** | The Android app uses `network_security_config.xml` with system CA trust but no certificate pinning. This is acceptable if TLS is enforced server-side, but pinning would add defense-in-depth. |
| **`shared/` and `docs/` directories** | Not analyzed. Could contain additional secrets or configuration. |
| **Admin panel pages** | Only `login/page.tsx`, `page.tsx` (dashboard), and layout files were read. The `payments`, `users`, `security`, `reports`, `analytics` sub-pages were not fully analyzed. |
| **Automated tests** | `app/src/test/` exists but contents were not reviewed. No backend tests found. Test coverage is likely very low, leaving regressions undetected. |
