# 3334Game — Project & Agent Guidelines

## Repository Structure

```text
3334game/
├── AGENTS.md
├── app/          # Android App (Kotlin + Jetpack Compose)
├── backend/      # Backend API Server (Authoritative game state, auth, wallet)
├── shared/       # Shared contracts, DTO schemas & protocol definitions
└── docs/         # Architecture plans, guides & documentation
```

## Graphify Rules

This project has a graphify knowledge graph at `graphify-out/`.

Rules:
- Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure.
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost).

---

## 334 Play Invariants & Memory Rules

All agent actions in this repository MUST comply with [.agent/rules/334-play-invariants.md](file:///Users/satyamkumar/Desktop/334game/.agent/rules/334-play-invariants.md).

### HARD RULES SUMMARY
1. **ONE Wallet Source of Truth:** Home, Profile, Wallet, Add Cash, Withdraw, Ring of Future read exact same state in integer paise (`100 paise = ₹1`).
2. **Bucket Accounting:** `totalBalance = depositBalance + winningBalance + bonusBalance`.
3. **ONE Identity:** Single user name, phone, userId, and avatar across all screens.
4. **Bet Debit Order:** `deposit → winnings → bonus`.
5. **Refund Bucket Equity:** CLEARing bets refunds original buckets (never credit as `WIN_PAYOUT` to winnings).
6. **Wins Credit Winnings Only:** Win payouts credit to `winningBalance` only.
7. **Bonus Usage & Non-Negativity:** Bonus bucket cannot go negative.
8. **Engine Lifecycle:** Game engine runs ONLY while `RingOfFutureScreen` is active. Stop engine on screen dispose.
9. **No Admin Override in Player App:** No client-side house-rigging.
10. **Fair Play Copy Honesty:** No fake "provably fair" / "certified RNG" claims on local RNG.
11. **RTP Multipliers (~95% RTP):** Green 1/32 → 30x, Red 6/32 → 5.06x, Purple 10/32 → 3.04x, Grey 15/32 → 2.03x.
12. **Catalog Routing Accuracy:** ONLY Ring of Future is playable. Non-Ring games show "Coming Soon".
13. **Compose BackHandler:** System back pops to previous screen on all sub-screens.
14. **No Secrets in APK:** No JWT secrets, Telegram tokens, Supabase keys in APK. Remove `File(".env")`.
15. **Grid Card Spec (160:230):** 2 columns, 160:230 aspect ratio, no footer overlap on artwork.
16. **Demo Chip Labeling:** Play-chips / demo clearly labeled; no real-money UPI collection on client.
