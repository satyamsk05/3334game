# 334 Game Play Invariants & Bug Tracking Memory File

This file defines the strict hard rules and bug tracking checklist for `3334game` (Kotlin + Jetpack Compose Android repo). Future sessions must strictly observe these invariants.

---

## HARD RULES (Never Break)

1. **ONE Wallet Source of Truth:** Home header, Profile, Account/Wallet, Add Cash, Withdraw, and Ring of Future MUST all read from the exact same wallet state store. No secondary hardcoded balance (no ₹42.2 vs ₹1850 split).
2. **Paise Integer Arithmetic:** All money math is calculated in integer paise (`100 paise = ₹1`). Never use Double/Float for ledger math. Formatted UI strings display in rupees (e.g. `₹18.50`).
3. **Bucket Consistency:** `totalBalance = depositBalance + winningBalance + bonusBalance`. Wallet UI shows all three buckets + total from the exact same store.
4. **ONE Identity:** One name, one phone, one userId, one avatar across all screens. Never mix separate identities (e.g. "ashu bhai" / "Satyam Kumar" / "satyamog" / "USR-304").
5. **Bet Debit Order:** Debits for bets are drawn strictly in order: `deposit → winnings → bonus`. Track exactly how much came from each bucket per active round.
6. **Refund Bucket Equity:** CLEARing bets refunds the exact same buckets from which the bet was drawn. Never credit a refund as a WIN_PAYOUT into winnings (eliminates deposit-to-withdrawable-winnings exploit).
7. **Wins Credit Winnings Only:** All bet win payouts credit strictly to `winningBalance`.
8. **Bonus Usage & Non-Negativity:** Bonus bucket can be used for placing bets but cannot go negative; never subtract from winnings when only bonus remains.
9. **Game Engine Lifecycle:** Game engine runs ONLY while `RingOfFutureScreen` is active on screen. Start on enter, dispose/stop on leave. If player leaves during `BETTING`, refund open bets. If they leave during `LOCKED/SPINNING`, settle that round once then stop. Never let singleton timers run indefinitely in the background.
10. **No Client Admin Rigging:** No player-facing admin override of spin results in the APK. No client-side house-rigging.
11. **Fair Play Copy Honesty:** Do not advertise "provably fair", "certified RNG", or SHA-256 fairness while using local RNG. Until a real cryptographic server exists, Fair Play copy must not lie.
12. **Target ~95% RTP House Edge on All Colors:**
    - Green 1/32 → 30x (NOT 32x)
    - Red 6/32 → 5.06x
    - Purple 10/32 → 3.04x
    - Grey 15/32 → 2.03x
13. **Catalog Routing Accuracy:** ONLY Ring of Future is playable. Every other game tile (Mines, Dice, Hi-Lo, Limbo, Coin Flip, Keno, Double, Perya) must show "Coming Soon" or its own designated screen. NEVER route non-Ring games into `RingOfFutureScreen`.
14. **System Back Navigation:** Compose `BackHandler` must be integrated on every sub-screen. System back pops to the previous screen and must NOT finish the Activity from Settings, Game, Add Cash, or Withdraw screens.
15. **Real Ledger Transactions:** Transaction History displays real ledger events only. Dummy Mines/Dice win rows must be removed.
16. **No Secrets in APK:** No JWT secrets, Telegram bot tokens, Supabase service-role keys, or admin master keys in APK. Remove `File(".env")` calls.
17. **INTERNET Permission & Stub Integrity:** Include INTERNET permission only if making real network calls. If Telegram is a stub, do not pretend it is live.
18. **Release Signing:** Keep package/app naming intact; do not sign release builds with debug keystore.
19. **Grid Card Layout (160:230):** Game grid cards use a `160:230` aspect ratio (artwork + footer). 2 columns, no overlapping footer over artwork, compact PLAY NOW button (~8dp radius).
20. **Dead Buttons Resolution:** Dead buttons must either function correctly or be hidden (Share, WhatsApp share, Language, Edit UPI, Check updates, Logout, Play to use).
21. **State Synchronization:** Profile, Wallet, and Ring balances and user names must synchronize immediately after every action (bet, clear, win, add cash, withdraw).
22. **Demo Chip Labeling:** Label play-chips / demo clearly if money is local. No real-money UPI collection or live UPI payouts on a client-side ledger.

---

## ORIGINAL BUG LIST CHECKLIST

### A. Architecture / Backend
- [ ] **A1.** Replace fake server singletons with a unified in-app store with clear local/demo labeling until a real backend is connected.
- [ ] **A2.** Merge two wallet sources (`HomeScreen` userBalance vs `WalletLedger`) into one store.
- [ ] **A3.** Remove hardcoded userId ("USR-304" / "Satyam Kumar") across all ledger rows.
- [ ] **A4.** Base withdraw eligibility on live ledger totals instead of hardcoded numbers.
- [ ] **A5.** Auto-credit demo chips on deposit submit or handle deposit pending without fake "Instant Credit" claims.
- [ ] **A6.** Remove useless `File(".env")` calls on Android.
- [ ] **A7.** Fix missing INTERNET permission or stub TelegramBotEngine appropriately.
- [ ] **A8.** Set `allowBackup="false"` in AndroidManifest.xml for financial data.
- [ ] **A9.** Remove or properly implement `RtpMode` without segment override.
- [ ] **A10.** Wire `SoundFXEngine` audio triggers or remove dead code.
- [ ] **A11.** Unify `TransactionType` enums into a single contract.
- [ ] **A12.** Use secure local RNG (`SecureRandom`), remove biased 32-bit Int fold & "provably fair" fake label.
- [ ] **A13.** Synchronize `placeBet` with phase and wallet, adding min/max bet check and ban check.
- [ ] **A14.** Replace truncated 8-char UUIDs with standard robust IDs.
- [ ] **A15.** Compute `totalPoolBets` dynamically from real bets instead of fake static maps.

### B. Ring of Future
- [ ] **B1.** Fix catalog routing so only Ring of Future opens Ring of Future.
- [ ] **B2.** Remove player-facing admin override panel.
- [ ] **B3.** Update multipliers to enforce ~95% RTP (Green 30x, Red 5.06x, Purple 3.04x, Grey 2.03x).
- [ ] **B4.** Fix CLEAR refund to restore original buckets (deposit/winnings/bonus) rather than crediting as `WIN_PAYOUT`.
- [ ] **B5.** Fix bonus deduction so winningBalance cannot go negative. Deduct bonus last, clamp at 0.
- [ ] **B6.** Bind game engine lifecycle to `RingOfFutureScreen`. Stop engine on screen dispose.
- [ ] **B7.** Make wallet pill on game screen collect `WalletState` Flow instead of one-shot `remember`.
- [ ] **B8.** Show toast/snackbar feedback when bet placement fails (insufficient chips/invalid phase).
- [ ] **B9.** Debounce bet placement to prevent rapid double-tapping.
- [ ] **B10.** Make wheel layout responsive (e.g., 390dp width devices), scroll betting controls, avoid clipping CTAs.
- [ ] **B11.** Remove unused/hidden `onOpenAdminDashboard` rig panel from player navigation.
- [ ] **B12.** Sync spin animation clock with engine state to prevent desync on backgrounding/resume.

### C. Profile
- [ ] **C1.** Consolidate usernames ("ashu bhai" / "Satyam Kumar" / "satyamog") into one profile object.
- [ ] **C2.** Consolidate phone numbers into one profile object.
- [ ] **C3.** Remove dummy balance override (`if (balance == "₹0.00") "₹42.2"`).
- [ ] **C4.** Link avatar to profile state store.
- [ ] **C5.** Ensure Account tab (`WalletScreen`) and Profile use the same user + wallet store.
- [ ] **C6.** Wire Logout to reset demo data or disable the row cleanly.
- [ ] **C7.** Maintain honest static labeling for Gold Level without fake progress bars.

### D. Wallet / Add Cash / Withdraw
- [ ] **D1.** Pass real bucket balances (`deposit`, `winnings`, `bonus`) to `WalletScreen`.
- [ ] **D2.** Handle `AddCashScreen` as demo chip addition, writing real ledger rows and updating all screens.
- [ ] **D3.** Fix Withdraw to subtract actual withdrawal amount from `winningsBalance`.
- [ ] **D4.** Refresh displayed wallet after withdrawing from in-game modal.
- [ ] **D5.** Standardize UPI ID placeholders and handle Edit UPI cleanly.
- [ ] **D6.** Enforce min ₹25 / max ₹5000 withdrawal rule consistently across Ring and WithdrawScreen.
- [ ] **D7.** Bind `TransactionHistoryScreen` directly to the unified ledger.

### E. UI / Navigation
- [ ] **E1.** Add Compose `BackHandler` on all sub-screens to prevent accidental app termination on Back press.
- [ ] **E2.** Fix game grid card aspect ratio to `160:230` without overlapping artwork & footer.
- [ ] **E3.** Standardize compact spec for "All Games" grid while keeping featured row distinct.
- [ ] **E4.** Rename "Reward" tab to "Add Cash / Wallet".
- [ ] **E5.** Resolve dead buttons (Share code, WhatsApp share, Language, Check updates, Logout, Play to use).
- [ ] **E6.** Fix typos ("pramotion_banner", "Kino" -> "Keno", "Ring of Future" title).
- [ ] **E7.** Remove or replace fake player count labels (1.2M) with honest counts.
- [ ] **E8.** Replace hardcoded `padding(top = 45.dp)` with `WindowInsets` safe padding across screens.
- [ ] **E9.** Bounding height for any nested admin lists or removing SuperAdmin from player APK.
- [ ] **E10.** Standardize Account vs Profile bottom navigation labels.

### F. Product Honesty
- [ ] **F1.** Rewrite `FairPlayScreen` text to reflect actual local/demo RNG implementation.
- [ ] **F2.** Do not collect real UPI money on a client ledger.
- [ ] **F3.** Clearly label all money as play-chips / demo balance.
