# 03 — Admin Service vs Backend Routes

## Overview

- Frontend: `admin-panel/src/services/adminService.ts` → calls `/admin/...` (via rewrite → `/api/v1/admin/...`)
- Backend primary: `backend/src/modules/admin/admin.routes.ts` + `admin.controller.ts`
- Backend legacy: `backend/src/routes/admin.ts` (HTML + few JSON endpoints)

Most endpoints match. Issues below.

---

## Problem 1 — Duplicate Methods in adminService (P3)

```ts
// Both are identical
adjustWallet: async (id, data) => { ... }
adjustUserWallet: async (id, data) => { ... }
```

**Fix:** Keep only one:

```ts
adjustUserWallet: async (
  id: string,
  data: {
    bucket: 'deposit' | 'winnings' | 'bonus';
    type: 'CREDIT' | 'DEBIT';
    amountRupees: number;
    reason: string;
  }
) => {
  const res = await api.post(`/admin/users/${id}/adjust-wallet`, data);
  return res.data;
},
```

Remove `adjustWallet`. Update any callers.

---

## Problem 2 — Deposit / Withdrawal Action Endpoints Inconsistency (P2)

### Frontend calls

```ts
approveDeposit:  POST /admin/deposits/approve   { depositId }
rejectDeposit:   POST /admin/deposits/reject    { depositId }
approveWithdrawal: POST /admin/withdrawals/approve
rejectWithdrawal:  POST /admin/withdrawals/reject
processWithdrawal: POST /admin/withdrawals/process
```

### Backend has both styles

```ts
// Modern (preferred)
POST /deposits/approve
POST /deposits/reject
POST /withdrawals/approve
POST /withdrawals/reject
POST /withdrawals/process

// Legacy style still present
POST /deposits/action   { depositId, action: 'APPROVE'|'REJECT' }
POST /withdrawals/action { withdrawalId, action: '...' }
```

**Recommendation:** Keep only modern endpoints. Remove legacy `/action` handlers after confirming no other client uses them.

---

## Problem 3 — Legacy `/admin` Router Still Mounted (P2)

```ts
// app.ts
app.use('/admin', adminRouter);           // legacy HTML + limited JSON
app.use('/api/v1/admin', adminRoutes);    // full modern API
```

Admin panel uses rewrite → hits modern path. But legacy HTML at `http://IP:4001/admin` still exists and can confuse.

**Fix options:**

1. **Preferred:** Deprecate legacy. Redirect `/admin` → admin panel URL or return 410.
2. Or keep only for emergency HTML UI, but document clearly.

```ts
// Optional redirect
adminRouter.get('/', (_req, res) => {
  res.redirect(302, process.env.ADMIN_PANEL_URL || 'https://admin-penal.vercel.app');
});
```

---

## Problem 4 — Missing / Thin Error Responses (P2)

Some controller methods may return inconsistent shapes:

```json
{ "success": true, "data": ... }
{ "success": false, "message": "..." }
```

Frontend mostly checks `res.success && res.data`.

**Ensure every admin endpoint returns:**

```ts
// Success
res.json({ success: true, data: payload });

// Error
res.status(4xx|5xx).json({ success: false, message: 'Human readable reason' });
```

Never throw unhandled — use global `errorHandler`.

---

## Endpoint Coverage Checklist

| Feature | Frontend method | Backend route | Status |
|---------|-----------------|---------------|--------|
| Dashboard stats | `getDashboardStats` | `GET /dashboard/stats` | OK |
| Pending counts | `getPendingCounts` | `GET /dashboard/pending-counts` | OK |
| List users | `getUsers` | `GET /users` | OK |
| User details | `getUserDetails` | `GET /users/:id` | OK |
| Update user | `updateUser` | `PATCH /users/:id` | OK |
| Ban user | `toggleBan` | `POST /users/:id/ban` | OK |
| Add note | `addUserNote` | `POST /users/:id/notes` | OK |
| Adjust wallet | `adjustUserWallet` | `POST /users/:id/adjust-wallet` | OK |
| Games list | `getGames` | `GET /games` | OK |
| Game status | `updateGameStatus` | `PATCH /games/:id/status` | OK |
| Game config | `updateGameConfig` | `PATCH /games/:id/config` | OK |
| Ledger overview | `getLedgerOverview` | `GET /ledger/overview` | OK |
| Ledger query | `queryLedger` | `GET /ledger/transactions` | OK |
| Deposits | `getDeposits` | `GET /deposits` | OK |
| Approve deposit | `approveDeposit` | `POST /deposits/approve` | OK |
| Reject deposit | `rejectDeposit` | `POST /deposits/reject` | OK |
| Withdrawals | `getWithdrawals` | `GET /withdrawals` | OK |
| Process/Approve/Reject withdrawal | corresponding | OK |
| System health | `getSystemHealth` | `GET /system/health` | OK |
| Settings | `getSettings` / `updateSetting` | OK |
| Announcements | create / toggle | OK |
| Push notification | `sendPushNotification` | OK |
| Promotions CRUD | full | OK |
| Admins | list / create / toggle | OK |
| Audit logs | `getAuditLogs` | `GET /audit-logs` | OK |

Coverage is good. Main work is consistency + remove duplicates/legacy.

---

## Suggested Cleanup Commit

1. Delete duplicate `adjustWallet` from `adminService.ts`
2. Remove legacy `/action` handlers if unused
3. Add comment on `app.use('/admin', ...)` that it is legacy
4. Standardize all controller responses to `{ success, data | message }`
