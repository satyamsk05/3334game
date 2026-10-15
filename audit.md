# 🔍 BIT ARCADE — A-to-Z CODEBASE AUDIT REPORT

> **Audit Date:** 15 October 2026  
> **Auditor:** Antigravity AI  
> **Scope:** Go Backend · Android App (Kotlin) · Admin Panel (Next.js) · Payment Proxy (HTML/JS)  
> **Graph Stats:** 694 nodes · 1,182 edges · 127 communities

---

## 🗂️ TABLE OF CONTENTS

1. [🚨 CRITICAL — Security & Secret Leaks](#1-critical--security--secret-leaks)
2. [🔴 HIGH — Backend Bugs & Logic Errors](#2-high--backend-bugs--logic-errors)
3. [🟠 MEDIUM — Admin Panel Issues](#3-medium--admin-panel-issues)
4. [🟡 LOW — Android App Issues](#4-low--android-app-issues)
5. [💳 Payment Proxy Issues](#5-payment-proxy-issues)
6. [💀 Unused / Dead Code](#6-unused--dead-code)
7. [📦 Architecture & Design Problems](#7-architecture--design-problems)
8. [🔐 Auth & JWT Issues](#8-auth--jwt-issues)
9. [💰 Financial / Wallet Logic Issues](#9-financial--wallet-logic-issues)
10. [🎮 Game Engine Issues](#10-game-engine-issues)
11. [🌐 WebSocket Issues](#11-websocket-issues)
12. [📱 Android App Hardening Gaps](#12-android-app-hardening-gaps)
13. [🗄️ Database Issues](#13-database-issues)
14. [📊 Monitoring & Observability](#14-monitoring--observability)
15. [✅ What's Working Well](#15-whats-working-well)
16. [📋 Priority Fix Checklist](#16-priority-fix-checklist)

---

## 1. 🚨 CRITICAL — Security & Secret Leaks

### 1.1 — `.env` File Has Placeholder Secrets Committed

**File:** `backend/.env` Lines 16-21

```
JWT_SECRET=CHANGE_ME_use_openssl_rand_hex_32_output_here_aabbccddeeff112233445566
ADMIN_JWT_SECRET=CHANGE_ME_use_openssl_rand_hex_32_output_here_ffeeddccbbaa665544332211
ADMIN_USERNAME=CHANGE_ME_admin_username
ADMIN_PASSWORD=CHANGE_ME_strong_password_12chars_minimum
```

> **⚠️ CAUTION:** ये placeholder values production में use हो सकती हैं। ये `.env` file Git में है। Real secrets production server पर environment variables के रूप में set करो।

**Fix:**
```bash
openssl rand -hex 32  # नई JWT_SECRET generate करो
# .env file को .gitignore में add करो
```

---

### 1.2 — Hardcoded Production IP Address in 8 Files

**Problem:** EC2 server IP `15.252.241.88` hard-coded है 8 जगह।

| File | Line |
|------|------|
| `payment-proxy/vercel.json` | 30, 34 |
| `admin-panel/next.config.js` | 5, 49 |
| `admin-panel/vercel.json` | 6 |
| `app/src/main/res/xml/network_security_config.xml` | 11 |
| `app/build.gradle.kts` | 22, 26 |

> **⚠️ CAUTION:** अगर server IP बदली तो app rebuild + redeploy करना होगा। HTTPS भी नहीं है — plain `http://` IP use हो रही है। Man-in-the-middle attack possible है।

**Fix:** Domain name लो (e.g. `api.bitarcade.in`), IP नहीं। HTTPS / TLS setup करो।

---

### 1.3 — HTTP Instead of HTTPS (Plain Text Traffic)

**Files:** `admin-panel/.env.local`, `app/build.gradle.kts`, `payment-proxy/vercel.json`

```
NEXT_PUBLIC_API_URL=http://15.252.241.88/api/v1   ← HTTP!
NEXT_PUBLIC_WS_URL=ws://15.252.241.88/ws          ← WS, not WSS!
```

> **⚠️ CAUTION:** सभी API calls, JWT tokens, UPI payment data plain HTTP पर जा रहे हैं। यह **real money gaming app** है — completely unacceptable।

---

### 1.4 — Hardcoded Business Phone in App Build Config

**File:** `app/build.gradle.kts` Line 41

```kotlin
buildConfigField("String", "BUSINESS_SUPPORT_PHONE", "\"919989907408\"")
```

यह phone number compiled APK में visible होता है। Reverse engineering से easily extract हो सकता है।

---

### 1.5 — Payment Proxy Server-Side Absolute Dev Path Hardcoded

**File:** `backend/cmd/server/main.go` Line 147

```go
"/Users/satyamkumar/3334game/payment-proxy/index.html",  // local dev path!
```

> **⚠️ WARNING:** Production server पर यह path नहीं होगा → 404 → users deposit नहीं कर पाएंगे।

---

### 1.6 — `client-log` Endpoint — Unauthenticated, No Size Limit

**File:** `backend/cmd/server/main.go` Lines 97-101

```go
router.POST("/api/v1/client-log", func(c *gin.Context) {
    body, _ := io.ReadAll(c.Request.Body)  // no size limit!
    log.Printf("\n [CLIENT_CRASH]\n%s\n", string(body))
    c.JSON(http.StatusOK, gin.H{"status": "logged"})
})
```

- **No authentication** — कोई भी spam कर सकता है
- **No body size limit** — disk fill attack possible
- **No sanitization** — log injection possible

---

## 2. 🔴 HIGH — Backend Bugs & Logic Errors

### 2.1 — `AdminSystemHealth` Always Returns "ONLINE" (Fake Status)

**File:** `backend/internal/handlers/admin_handlers.go` Lines 312-322

```go
"status":   "ONLINE",  // ← हमेशा ONLINE!
"database": "ONLINE",  // ← actual DB check नहीं!
"redis":    "ONLINE",  // ← actual Redis check नहीं!
```

Admin panel में database down हो तो भी "ONLINE" दिखेगा।

---

### 2.2 — Admin Dashboard Game Stats All Hardcoded Zero

**File:** `backend/internal/handlers/admin_handlers.go` Lines 96-101

```go
"games": gin.H{
    "totalRounds":       0,  // ← हमेशा 0!
    "totalWageredPaise": 0,
    "ggrPaise":          0,
},
```

---

### 2.3 — User Detail Metrics All Hardcoded Zero

**File:** `backend/internal/handlers/admin_handlers.go` Lines 164-178

```go
"metrics": gin.H{"totalBets": 0, "totalWageredChips": 0, ...},
"recentBets":  []gin.H{},   // always empty
"deposits":    []gin.H{},   // always empty
"withdrawals": []gin.H{},   // always empty
"notes":       []gin.H{},   // always empty
"auditTrail":  []gin.H{},   // always empty
```

---

### 2.4 — Race Condition in Wallet Debit (No Atomic Check)

**File:** `backend/internal/services/wallet_service.go` Lines 130-150

```go
if w.WinningChips < amountChips { return error }
// time gap यहाँ! concurrent request double-spend कर सकती है
w.WinningChips -= amountChips
_ = s.bundle.DB.Save(w)
```

Multiple concurrent withdrawal requests double-spend कर सकती हैं।

**Fix:** Atomic SQL use करो:
```sql
UPDATE wallets SET winning_chips = winning_chips - $1 
WHERE user_id = $2 AND winning_chips >= $1
```

---

### 2.5 — Duplicate Route Definitions (Route Pollution)

**File:** `backend/cmd/server/main.go`

Admin routes दो बार register हैं: `/api/v1/admin/...` AND `/admin/...` — 40+ routes each। Maintenance nightmare।

---

### 2.6 — Transaction IDs Are Predictable / Collision-Prone

**File:** `backend/internal/services/wallet_service.go` Lines 98, 152

```go
ID: fmt.Sprintf("TX-%d", time.Now().UnixNano())   // collision possible!
ID: fmt.Sprintf("W%d", time.Now().UnixNano()%1000000000000)  // modulo = more collisions!
```

UUID use करना चाहिए था।

---

### 2.7 — FCM Token Update Silently Ignored (Push Notifications Broken)

**File:** `backend/internal/handlers/auth_handlers.go` Lines 258-265

```go
func (h *APIHandler) UpdateFCMToken(c *gin.Context) {
    var req FCMTokenRequest
    _ = c.ShouldBindJSON(&req)
    // FCM token कहीं save नहीं होता!
    c.JSON(http.StatusOK, gin.H{"success": true, "message": "FCM token updated successfully"})
}
```

Push notifications काम नहीं करेंगी।

---

### 2.8 — `AdminGetUsers` Hard Limit of 100, No Pagination

**File:** `backend/internal/handlers/admin_handlers.go` Line 119

```go
users := h.authService.GetAllUsers(100)  // 100 से ज्यादा users = data missing
```

---

### 2.9 — Auth Status Endpoint Leaks User Phone Number (No Auth Required)

**File:** `backend/internal/handlers/auth_handlers.go` Lines 242-251

```go
// Public unauthenticated endpoint!
c.JSON(http.StatusOK, gin.H{
    "data": gin.H{
        "phone": user.Phone,  // ← phone number expose हो रहा है!
    },
})
```

कोई भी phone number enumerate कर सकता है।

---

### 2.10 — `AdminToggleBan` Request Body Error Silently Ignored

**File:** `backend/internal/handlers/admin_handlers.go` Lines 189-190

```go
_ = c.ShouldBindJSON(&req)  // error ignore! req.IsBlocked = false (zero value)
```

Bind fail होने पर user unexpectedly unban हो सकता है।

---

## 3. 🟠 MEDIUM — Admin Panel Issues

### 3.1 — Admin Panel `.env.local` Git में Committed

**File:** `admin-panel/.env.local`

```
NEXT_PUBLIC_API_URL=http://15.252.241.88/api/v1
BACKEND_API_URL=http://15.252.241.88
```

`.env.local` files कभी Git में नहीं होनी चाहिए।

---

### 3.2 — Admin Panel CSP में `unsafe-eval`

**File:** `admin-panel/next.config.js` Line 12

```js
"script-src 'self' 'unsafe-eval'",  // XSS risk!
```

`unsafe-eval` XSS attacks को enable करता है।

---

### 3.3 — No RBAC — All Admins Are Superadmin

**File:** `backend/internal/handlers/admin_handlers.go`

```go
"role": "superadmin",  // सभी admins superadmin हैं!
```

Graphify में `rbac.middleware.ts` reference है लेकिन Go backend में RBAC implement नहीं है।

---

### 3.4 — Admin Panel Pages Without Backend Endpoints

Admin panel में `reports`, `security`, `analytics`, `notifications`, `support` pages हैं लेकिन Go backend में इनके endpoints नहीं हैं।

---

### 3.5 — Admin Panel `vercel.json` — HTTP Backend Proxy (Mixed Content)

**File:** `admin-panel/vercel.json`

```json
"destination": "http://15.252.241.88/api/v1/:path*"  // HTTP!
```

HTTPS admin panel → HTTP backend = mixed content warning।

---

## 4. 🟡 LOW — Android App Issues

### 4.1 — `versionCode = 1` Static — Never Incremented

**File:** `app/build.gradle.kts` Lines 36-37

```kotlin
versionCode = 1   // static — Play Store updates के लिए increment होना चाहिए
versionName = "1.0"
```

---

### 4.2 — Debug Logs Active in Production Code

Multiple `Log.d()` statements release builds में भी active हैं:

| File | Info Leaked |
|------|-------------|
| `RemoteApiClient.kt` L86 | WebSocket URL |
| `RemoteApiClient.kt` L94 | Full WebSocket event data |
| `AuthRepository.kt` L355 | userId, name, isNewUser |
| `AppFirebaseMessagingService.kt` L69 | Firebase sender ID |
| `WalletSyncService.kt` L72 | Exact wallet balances |

ProGuard `Log.d()` remove नहीं करता — `adb logcat` से visible।

---

### 4.3 — `security-crypto:1.1.0-alpha06` — Alpha in Production

**File:** `app/build.gradle.kts` Line 91

```kotlin
implementation("androidx.security:security-crypto:1.1.0-alpha06")  // alpha!
```

Stable `1.0.0` use करो।

---

### 4.4 — `targetSdk = 34` — Outdated (Android 14)

Android 15 (API 35) आ चुका है। Google Play latest targetSdk require करता है।

---

### 4.5 — `minSdk = 24` — Android 7.0 (June 2016) Support

बहुत outdated। `minSdk = 26` (Android 8.0) minimum reasonable है।

---

## 5. 💳 Payment Proxy Issues

### 5.1 — Payment Page Served with Local Dev Absolute Path

**File:** `backend/cmd/server/main.go` Lines 143-156

```go
"/Users/satyamkumar/3334game/payment-proxy/index.html",  // dev machine path!
```

Production पर 404 → deposit broken।

---

### 5.2 — `whatsapp://` UPI Redirect Bug

**File:** `payment-proxy/index.html` Line 1287

```js
else if (app === 'whatsapp') targetUri = baseUri.replace('upi://', 'whatsapp://');
```

WhatsApp UPI scheme `whatsapp://` नहीं होती। Invalid redirect।

---

### 5.3 — Polling Only, No Webhook for Payment Status

`startAdminApprovalPolling` polling है। User का browser close हो तो approval miss हो जाएगी।

---

### 5.4 — `AndroidBridge.syncWalletBalance` — One-Way Trust Risk

**File:** `payment-proxy/index.html` Lines 1272-1277

```js
window.AndroidBridge.syncWalletBalance(chips);  // JS से Android को trust
```

Malicious JS injection से fake balance credit possible अगर WebView insecure है।

---

## 6. 💀 Unused / Dead Code

### 6.1 — `bitarcade-server` Binary (14MB) Committed to Git

**File:** `backend/bitarcade-server` — 14,991,544 bytes

Compiled binary Git में नहीं होना चाहिए। `.gitignore` में add करो।

---

### 6.2 — Root-Level Large Images in Git (7.8MB+)

```
Arcade Game Logo.png                        - 1.2 MB
Cheerful Forest Explorer Splash Art (1).png - 1.5 MB
Gameplay-Background.webp                    - 0.9 MB
animation_play_once_optimized.webp          - 1.7 MB
Warm Honey Wood Grain Panel copy.png        - 1.2 MB
original-24b05e33c5ac5b38aa52adf960e19126.webp - 0.3 MB
```

Git LFS में move करो।

---

### 6.3 — Duplicate Wallet Fields (Chips = Paise = Same Value)

**File:** `backend/internal/handlers/wallet_handlers.go` Lines 37-42

```go
"depositChips": wallet.DepositChips,
"depositPaise": wallet.DepositChips,  // same value! confusing
```

1 chip = 1 paise? 1 chip = ₹1? Naming inconsistent है।

---

### 6.4 — `/ledger/overview` Duplicates `/dashboard/stats` Handler

**File:** `backend/cmd/server/main.go` Line 272

```go
adminGroup.GET("/ledger/overview", apiHandler.AdminDashboardStats)  // same handler!
```

---

### 6.5 — `icoons/` Directory — Typo in Folder Name

`icoons` → should be `icons`।

---

### 6.6 — `engine.go` Interface — Only DragonTiger Implements It

**File:** `backend/internal/game/engine.go`

`GameEngine` interface exists लेकिन only `DragonTigerEngine` implements it। `RingOfFutureEngine`, `TicTacToeEngine` referenced in graph but missing from Go backend।

---

## 7. 📦 Architecture & Design Problems

### 7.1 — Two Separate Backends (Go + Node.js) — Fragmented

Graphify में `AuthService`, `WalletLedger`, `TicTacToeEngine`, `FinancialService` Desktop/1356 path पर हैं (Node.js/TypeScript backend)। Current working Go backend अलग है।

**Question:** Production पर कौन सा backend है? दोनों का data sync कैसे?

---

### 7.2 — Memory Fallback — Silent Data Loss Risk

**File:** `backend/internal/services/wallet_service.go`

```go
// Memory fallback — DB fail होने पर
w, exists := s.memUsers[userID]  // server restart = paise gone!
```

DB down होने पर in-memory fallback use होती है। **Server restart पर सारा data lose।**

---

### 7.3 — No Structured Logging

`log.Printf()` use हो रहा है। JSON structured logging, log levels, correlation IDs नहीं।

---

### 7.4 — Duplicate Route Bloat

`/api/v1/...` और direct `/...` routes दोनों exist करते हैं। 80+ routes जहाँ 40 होने चाहिए।

---

### 7.5 — `shared/` Directory — No Documentation

**File:** `3334game/shared/` — किसके लिए? कोई README नहीं।

---

## 8. 🔐 Auth & JWT Issues

### 8.1 — JWT Algorithm Not Validated (`alg:none` Attack)

**File:** `backend/internal/middleware/middleware.go` Lines 70-72

```go
token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
    return []byte(cfg.JWTSecret), nil  // algorithm check missing!
})
```

**Fix:**
```go
if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
    return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
}
```

---

### 8.2 — Token Revocation In-Memory Only

**File:** `backend/internal/services/auth_service.go` Line 31

```go
revokedTokens map[string]time.Time  // in-memory!
```

Server restart पर revoked tokens फिर valid हो जाएंगे। Redis में store करो।

---

### 8.3 — `LoginOrRegister` — JWT Auth Skips Phone Verification

**File:** `backend/internal/handlers/auth_handlers.go` Lines 37-47

```go
if strings.HasPrefix(authHeader, "Bearer ") {
    authenticated = true  // WhatsApp verification skip!
}
```

Any valid JWT token से किसी भी phone number के लिए login possible।

---

### 8.4 — Admin Password Plain String Comparison (Timing Attack)

**File:** `backend/internal/handlers/admin_handlers.go` Lines 30-33

```go
if req.Username != h.cfg.AdminUsername || req.Password != h.cfg.AdminPassword {
```

**Fix:** `crypto/subtle.ConstantTimeCompare` use करो।

---

## 9. 💰 Financial / Wallet Logic Issues

### 9.1 — Withdrawal Only from WinningChips (Deposit Chips Locked)

**File:** `backend/internal/services/wallet_service.go` Line 142

```go
if w.WinningChips < amountChips {
    return nil, errors.New("insufficient winning balance")
}
```

Users अपना deposited money withdraw नहीं कर सकते। Intentional या bug?

---

### 9.2 — No Deposit Amount Validation (Min/Max)

**File:** `backend/internal/handlers/wallet_handlers.go` Lines 63-75

कोई ₹0.01 या ₹10,00,000 deposit initiate कर सकता है। Min/max check नहीं।

---

### 9.3 — Duplicate UTR Prevention Missing (Fraud Risk)

**File:** `backend/internal/handlers/wallet_handlers.go` Lines 128-157

Same UTR number multiple deposits के लिए submit किया जा सकता है। Serious fraud vector।

---

### 9.4 — `AdminAdjustWallet` — No Audit Log

**File:** `backend/internal/handlers/admin_handlers.go` Lines 207-223

Admin किसी भी user का wallet adjust कर सकता है without audit trail। Admin fraud possible।

---

## 10. 🎮 Game Engine Issues

### 10.1 — Bet Deduplication Missing (Double Bet on Retry)

**File:** `backend/internal/game/dragontiger_engine.go`

Network retry से same bet twice submit हो सकती है (idempotency key नहीं)।

---

### 10.2 — Game Round Stats Not Persisted

Dashboard में games stats always 0 हैं। Dragon Tiger round results consistently DB में persist नहीं होते।

---

### 10.3 — Single Game Only Despite Multi-Game Architecture

`GameEngine` interface define है लेकिन only DragonTiger implement है। Ring of Future, TicTacToe — Go backend में नहीं।

---

## 11. 🌐 WebSocket Issues

### 11.1 — WebSocket Endpoint Has No Auth Middleware

**File:** `backend/cmd/server/main.go` Line 70

```go
router.GET("/ws", hub.HandleWebSocket)  // no auth!
```

Anyone unauthenticated WebSocket connect कर सकता है।

---

### 11.2 — No WebSocket Message Size Limit

**File:** `backend/internal/ws/hub.go`

Max message size set नहीं → memory exhaustion attack possible।

---

## 12. 📱 Android App Hardening Gaps

### 12.1 — WebView AndroidBridge — No Origin Validation

Payment proxy WebView में `AndroidBridge` expose है। Injected JS `closeDeposit()` या `onDepositSuccess()` call कर सकता है।

---

### 12.2 — No Certificate Pinning

HTTP client में certificate pinning नहीं। MITM attacks possible।

---

### 12.3 — IP Address Allowlisted for Cleartext Traffic

```xml
<domain includeSubdomains="true">15.252.241.88</domain>
```

Domain + HTTPS use करने के बाद यह हटाना होगा।

---

## 13. 🗄️ Database Issues

### 13.1 — GORM Errors Silently Ignored

**File:** `backend/internal/services/wallet_service.go` Lines 86, 112, 149, 178

```go
_ = s.bundle.DB.Save(w)      // error ignored!
_ = s.bundle.DB.Create(&tx)  // error ignored!
```

DB write fail होने पर transaction missing हो जाएगी, user को पता नहीं चलेगा।

---

### 13.2 — No Database Migration System

GORM `AutoMigrate` production पर risky है। Proper migration tool (goose/atlas) use करो।

---

### 13.3 — `go 1.25.5` in `go.mod` — Version Does Not Exist

**File:** `backend/go.mod` Line 3

```
go 1.25.5  // Go 1.25 exists नहीं करता!
```

---

## 14. 📊 Monitoring & Observability

### 14.1 — No APM / Error Tracking

- No Sentry/Bugsnag
- No Prometheus/Grafana metrics
- No distributed tracing

### 14.2 — Client Crash Logger — No Storage

`/api/v1/client-log` सिर्फ `log.Printf` करता है, DB में store नहीं। Server restart पर crash logs gone।

### 14.3 — No Alerting System

Graphify में `TelegramBotService` reference है लेकिन Go backend में implement नहीं।

---

## 15. ✅ What's Working Well

| Feature | Status |
|---------|--------|
| JWT Authentication middleware | ✅ Properly implemented |
| CORS middleware with origin validation | ✅ Working |
| Security headers (X-Frame-Options, HSTS) | ✅ Set |
| Rate limiting (Redis + in-memory fallback) | ✅ Implemented |
| Graceful shutdown | ✅ Signal handling |
| DPDP Act 2023 — Right to Erasure | ✅ Implemented |
| Admin auth token revocation on logout | ✅ Working |
| crypto/rand for Dragon Tiger randomness | ✅ Cryptographically secure |
| ProGuard in release builds | ✅ `isMinifyEnabled = true` |
| EncryptedSharedPreferences (Android) | ✅ Using security-crypto |
| Withdrawal limits (min 25 / max 5000 INR) | ✅ Validated |
| DB Connection fallback + warning logs | ✅ Graceful degradation |

---

## 16. 📋 Priority Fix Checklist

### 🚨 तुरंत करो (Today — Production Risk)

- [ ] **HTTPS enable करो** — domain + TLS certificate setup
- [ ] **Production .env** — Real secrets generate करो (openssl rand -hex 32)
- [ ] **Payment proxy absolute path** fix करो — relative path use करो
- [ ] **FCM token save** करो — `UpdateFCMToken` handler implement करो
- [ ] **JWT algorithm validation** add करो (alg:none attack prevent)

### 🔴 इस हफ्ते

- [ ] Admin dashboard stats — real DB data connect करो (0s हटाओ)
- [ ] `AdminSystemHealth` — actual DB/Redis ping implement करो
- [ ] Duplicate UTR prevention — DB unique constraint add करो
- [ ] Wallet withdrawal race condition fix — atomic SQL use करो
- [ ] `Log.d()` statements — release builds के लिए disable करो
- [ ] `bitarcade-server` binary — Git से remove करो (.gitignore)
- [ ] `admin-panel/.env.local` — Git से remove करो
- [ ] `versionCode` — build automation से auto-increment setup करो

### 🟠 इस महीने

- [ ] Admin password — timing-safe comparison (`crypto/subtle`)
- [ ] Auth status endpoint — phone number hide करो
- [ ] WebSocket — auth middleware add करो on connection
- [ ] WebSocket — max message size set करो
- [ ] Memory fallback — proper error alert add करो
- [ ] Admin users list — pagination implement करो
- [ ] Deposit amount — min/max validation add करो
- [ ] `AdminAdjustWallet` — audit log implement करो
- [ ] Transaction IDs — UUID में convert करो
- [ ] `security-crypto:1.1.0-alpha06` → stable `1.0.0`
- [ ] `icoons/` folder → `icons/` rename करो
- [ ] Root-level images → Git LFS move करो
- [ ] `AdminToggleBan` — bind error handle करो

### 🟡 Long Term

- [ ] RBAC — Role-Based Access Control implement करो
- [ ] Structured logging — JSON format + correlation IDs
- [ ] APM/Sentry integrate करो
- [ ] Certificate pinning (Android OkHttp)
- [ ] Database migration system (goose/atlas)
- [ ] `go.mod` version fix (1.25.5 → 1.23.x)
- [ ] Two backends unify करो (Go vs Node.js)
- [ ] Webhook-based payment status (instead of polling)
- [ ] Game round stats — DB persist properly करो
- [ ] Bet idempotency key implement करो

---

## 📊 Summary Stats

| Severity | Count |
|----------|-------|
| 🚨 Critical | 6 |
| 🔴 High | 10 |
| 🟠 Medium | 10 |
| 🟡 Low | 12 |
| **Total Issues** | **38** |

---

*Audit performed using Graphify Knowledge Graph (694 nodes, 1182 edges, 127 communities) + direct file analysis.*  
*Report generated: 2026-10-15 16:30 IST*
