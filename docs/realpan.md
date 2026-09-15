# 3334Game — File-by-File Implementation Plan

**Repository:** `satyamsk05/3334game`
**Branch:** `main`
**Target:** Kotlin Android + Jetpack Compose
**Approach:** Existing project को incrementally refactor करना; पूरा project फिर से शुरू नहीं करना।

---

# 1. Migration Rule

सबसे important rule:

> पहले architecture ठीक होगा, फिर UI polish।

Migration के दौरान पुराने working UI को अचानक delete नहीं करना है।

हर stage पर project buildable रहना चाहिए।

```text
CURRENT
  ↓
SECURITY CLEANUP
  ↓
DOMAIN MODEL
  ↓
BACKEND CONTRACT
  ↓
DATA LAYER
  ↓
VIEWMODEL
  ↓
GAME/WHEEL REFACTOR
  ↓
UI REFACTOR
  ↓
TESTING
```

---

# 2. File Action Legend

| Action  | Meaning                                          |
| ------- | ------------------------------------------------ |
| KEEP    | File रहेगी, major change नहीं                    |
| MODIFY  | Existing file refactor होगी                      |
| REPLACE | Existing implementation हटाकर नया implementation |
| DELETE  | अब जरूरत नहीं                                    |
| NEW     | नई file                                          |

---

# 3. Current → Target Mapping

| Current File                  | Action             | Target                               |
| ----------------------------- | ------------------ | ------------------------------------ |
| `MainActivity.kt`             | MODIFY             | Lifecycle + navigation host          |
| `EnvConfig.kt`                | REPLACE            | Public client configuration          |
| `RngEngine.kt`                | REPLACE            | Verifiable game-result abstraction   |
| `GameTimerEngine.kt`          | REMOVE/REPLACE     | Server-authoritative state client    |
| `WalletLedger.kt`             | REMOVE from client | Server-backed account state          |
| `GameBackendRepository.kt`    | REPLACE            | API-based repository                 |
| `AdminEngine.kt`              | REMOVE from client | Server-side admin service            |
| `RiskEngine.kt`               | MOVE               | Backend policy layer                 |
| `WheelCanvas.kt`              | MODIFY             | Central geometry                     |
| `SpinController.kt`           | MODIFY             | Pure animation controller            |
| `RingOfFutureState.kt`        | MODIFY             | Immutable UI/domain state            |
| `WheelConfig.kt`              | MODIFY             | Single source of wheel configuration |
| `RingOfFutureScreen.kt`       | REFACTOR           | ViewModel-driven screen              |
| `AddCashScreen.kt`            | MODIFY             | Backend/payment-status UI            |
| `TransactionHistoryScreen.kt` | MODIFY             | Repository-driven                    |
| `FairPlayScreen.kt`           | MODIFY             | Only claims actually supported       |
| Other screens                 | REVIEW             | UI architecture cleanup              |

---

# 4. New Android Structure

Create:

```text
app/src/main/java/com/example/app334/
│
├── core/
│   ├── common/
│   ├── config/
│   ├── network/
│   └── session/
│
├── data/
│   ├── remote/
│   │   ├── api/
│   │   ├── dto/
│   │   └── websocket/
│   │
│   ├── repository/
│   └── mapper/
│
├── domain/
│   ├── model/
│   ├── repository/
│   └── usecase/
│
├── game/
│   └── ringoffuture/
│       ├── animation/
│       ├── model/
│       ├── wheel/
│       └── presentation/
│
├── ui/
│   ├── components/
│   ├── navigation/
│   ├── screens/
│   └── theme/
│
└── MainActivity.kt
```

---

# 5. Phase 1 — Security Cleanup

## 5.1 `EnvConfig.kt`

### Current

Contains configuration that should not be shipped as private Android secrets.

### Action

**REPLACE**

New:

```text
core/config/ClientConfig.kt
```

Only public values:

```text
API_BASE_URL
APP_VERSION
PUBLIC_FEATURE_FLAGS
```

No:

```text
database password
service-role key
JWT signing secret
admin master secret
bot token
```

---

# 6. Server Configuration

Create separately:

```text
server/
└── config/
    └── ServerConfig
```

Server-only values remain there/environment secret manager में।

Concept:

```text
Android
   │
   └── public API URL

Backend
   │
   ├── database credentials
   ├── signing secrets
   └── service credentials
```

---

# 7. Phase 2 — Authentication/Session

Create:

```text
core/session/
├── SessionManager.kt
├── SessionState.kt
└── AuthTokenStore.kt
```

### `SessionState`

```text
SIGNED_OUT
SIGNED_IN
EXPIRED
REFRESHING
```

Client को `USR-304` जैसे hard-coded user IDs पर depend नहीं करना चाहिए।

---

# 8. Phase 3 — Domain Models

Create:

```text
domain/model/
├── User.kt
├── GameRound.kt
├── GamePhase.kt
├── GameResult.kt
├── WalletState.kt
├── Transaction.kt
├── ConnectionState.kt
└── FairnessProof.kt
```

---

# 9. `GameRound.kt`

Concept:

```text
GameRound
 ├── id
 ├── sequence
 ├── phase
 ├── bettingOpenAt
 ├── bettingCloseAt
 ├── spinStartedAt
 ├── resultAt
 └── result
```

Client-side timer authoritative नहीं होगा।

---

# 10. `GamePhase.kt`

Use explicit states:

```text
BETTING
LOCKED
SPINNING
RESULT
```

और connection state अलग रखें।

Game phase और network connection को एक enum में mix नहीं करना है।

---

# 11. `GameResult.kt`

Result model में:

```text
GameResult
 ├── roundId
 ├── segmentIndex
 ├── resultTimestamp
 └── fairnessReference
```

Result immutable होना चाहिए।

Client इसे generate नहीं करेगा।

---

# 12. Phase 4 — Wheel Model

Current:

```text
WheelConfig.kt
WheelSegment.kt
```

को central model में restructure करें।

Target:

```text
game/ringoffuture/wheel/
├── WheelConfig.kt
├── WheelSegment.kt
└── WheelGeometry.kt
```

---

# 13. `WheelGeometry.kt`

यह सबसे important wheel refactor है।

Responsibilities:

```text
segmentAngle(index)
segmentStartAngle(index)
segmentCenterAngle(index)
pointerAngle()
rotationForSegment(index)
segmentAtPointer(rotation)
```

हर जगह अलग angle calculation नहीं होना चाहिए।

---

# 14. Wheel Configuration

Current 32-segment configuration को एक जगह define करें।

Concept:

```text
SEGMENT_COUNT = 32
SEGMENT_ANGLE = 360 / 32
```

Color/index mapping भी एक source से आए।

UI अलग से colors duplicate न करे।

---

# 15. Wheel Geometry Tests

Create:

```text
test/.../WheelGeometryTest.kt
```

Test:

```text
for every segment:
    calculate rotation
    detect segment
    verify same index
```

Special tests:

```text
index 0
index 1
index 15
index 16
index 31
```

और boundary cases भी।

---

# 16. `WheelCanvas.kt`

### Action

**MODIFY**

Current renderer को रखें, लेकिन calculations `WheelGeometry` से लें।

Current responsibilities:

```text
draw wheel
draw segments
draw rim
draw LEDs
draw hub
draw pointer
```

ये ठीक हैं।

लेकिन result calculation यहाँ नहीं होना चाहिए।

---

# 17. `SpinController.kt`

### Action

**MODIFY**

SpinController केवल animation संभाले:

```text
start()
update()
reset()
```

इसमें:

```text
wallet
user
transaction
game rules
```

नहीं होने चाहिए।

---

# 18. Animation Flow

Target:

```text
Server Result
      ↓
GameViewModel
      ↓
Animation Target
      ↓
SpinController
      ↓
WheelCanvas
```

Animation को result generator नहीं बनाना है।

---

# 19. Phase 5 — Remove Local Game Engine

## `GameTimerEngine.kt`

### Action

**REPLACE**

Current local timer loop production authority नहीं रहेगा।

इसके बदले:

```text
GameRepository
```

server state consume करेगा।

---

# 20. Game State Source

Target:

```text
Backend
   ↓
WebSocket / polling
   ↓
GameRepository
   ↓
StateFlow
   ↓
GameViewModel
   ↓
Compose
```

---

# 21. Reconnection

Create:

```text
data/remote/websocket/
└── GameRealtimeClient.kt
```

Responsibilities:

```text
connect()
disconnect()
reconnect()
observeEvents()
```

Server unavailable होने पर:

```text
ConnectionState.DISCONNECTED
```

UI में show हो।

---

# 22. App Resume

On resume:

```text
App resumed
   ↓
refresh current authoritative round
   ↓
synchronize UI
```

Local timer को resume करके state guess नहीं करना है।

---

# 23. Phase 6 — Repository

## Current

`GameBackendRepository.kt`

### Action

**REPLACE**

Target:

```text
domain/repository/
└── GameRepository.kt
```

Implementation:

```text
data/repository/
└── GameRepositoryImpl.kt
```

---

# 24. Repository Responsibilities

Repository:

```text
observeGameState()
observeConnection()
fetchCurrentRound()
```

जैसे data operations संभाले।

UI को backend implementation नहीं पता होनी चाहिए।

---

# 25. API Layer

Create:

```text
data/remote/api/
├── GameApi.kt
├── AccountApi.kt
├── AuthApi.kt
└── UserApi.kt
```

DTOs:

```text
data/remote/dto/
├── GameRoundDto.kt
├── GameResultDto.kt
├── WalletDto.kt
└── TransactionDto.kt
```

---

# 26. DTO → Domain Mapping

Never directly expose API DTOs to Compose.

Flow:

```text
API DTO
   ↓
Mapper
   ↓
Domain Model
   ↓
ViewModel
   ↓
UI
```

---

# 27. Phase 7 — Wallet Architecture

## `WalletLedger.kt`

### Action

**REMOVE from Android business authority**

Client में केवल:

```text
WalletState
Transaction
```

display models रहें।

---

# 28. Wallet Repository

Create:

```text
domain/repository/
└── AccountRepository.kt
```

Implementation:

```text
data/repository/
└── AccountRepositoryImpl.kt
```

Client सिर्फ server-confirmed state consume करे।

---

# 29. Transaction Model

Create immutable:

```text
Transaction
 ├── id
 ├── type
 ├── status
 ├── amount
 ├── createdAt
 └── referenceId
```

Status transitions server-side authoritative होंगे।

---

# 30. Idempotency

हर state-changing API request में unique request ID concept रखें।

```text
clientRequestId
```

Server duplicate request को detect कर सके।

यह network retries के लिए जरूरी है।

---

# 31. Phase 8 — Admin

## `AdminEngine.kt`

### Action

**REMOVE production business authority from Android**

Admin operations server-side API के through होंगे।

Client admin UI केवल authorized API consume करेगी।

---

# 32. Admin API

Concept:

```text
Admin API
 ├── authentication
 ├── authorization
 ├── analytics
 ├── user management
 └── audit events
```

Authorization server पर enforce हो।

---

# 33. Result Override

Development/testing के लिए deterministic test fixtures allowed हैं।

Production में arbitrary outcome control नहीं रखना है।

Recommended:

```text
src/test/
src/debug/
```

में testing controls।

Release build में unavailable।

---

# 34. Fairness Module

Create:

```text
domain/model/FairnessProof.kt
```

और backend में separate fairness service।

UI में केवल वही claims दिखाएँ जिन्हें actual protocol verify करता है।

यदि verification protocol implemented नहीं है तो:

```text
"Provably Fair"
```

जैसा claim हटाएँ।

---

# 35. Phase 9 — Game ViewModel

Create:

```text
game/ringoffuture/presentation/
├── RingOfFutureViewModel.kt
├── RingOfFutureUiState.kt
└── RingOfFutureUiEvent.kt
```

---

# 36. `RingOfFutureUiState`

Concept:

```text
RingOfFutureUiState
 ├── gameRound
 ├── gamePhase
 ├── countdown
 ├── connectionState
 ├── wheelRotation
 ├── recentResults
 ├── wallet
 ├── selectedChip
 ├── isLoading
 └── error
```

एक central immutable UI state होगा।

---

# 37. UI Events

Example:

```text
SelectChip
OpenRules
OpenHistory
RetryConnection
DismissError
```

UI event handling ViewModel में रहेगा।

---

# 38. `RingOfFutureScreen.kt`

### Action

**MAJOR REFACTOR**

Screen को presentation-only रखें।

Target:

```text
RingOfFutureScreen
   ↓
collectAsState()
   ↓
GameUiState
```

और events:

```text
onEvent(...)
```

के through ViewModel को जाएँ।

---

# 39. Game Screen Component Split

Create:

```text
ui/components/game/
├── GameTopBar.kt
├── GameStatusBanner.kt
├── WheelSection.kt
├── RecentResults.kt
├── GameControls.kt
├── ChipSelector.kt
└── GameDialogs.kt
```

इससे 1 huge Compose file की dependency कम होगी।

---

# 40. Responsive Wheel

Current fixed size को responsive बनाएं।

Concept:

```text
availableWidth
availableHeight
        ↓
calculate wheel diameter
```

Targets:

```text
small phone
normal phone
large phone
tablet
landscape
```

---

# 41. Safe Area

Main UI में:

```text
WindowInsets
navigationBars
statusBars
displayCutout
```

का proper handling रखें।

Immersive mode को blindly apply नहीं करें।

---

# 42. Add Cash Screen

## `AddCashScreen.kt`

### Action

**MODIFY**

यह केवल UI/payment-state display layer रहे।

Client-side payment success को authoritative न मानें।

Flow:

```text
Payment UI
   ↓
Provider
   ↓
Backend verification
   ↓
Account state
   ↓
UI
```

---

# 43. Transaction History

## `TransactionHistoryScreen.kt`

### Action

**MODIFY**

Local singleton transaction list हटे।

Flow:

```text
AccountRepository
    ↓
StateFlow<List<Transaction>>
    ↓
ViewModel
    ↓
TransactionHistoryScreen
```

Pagination future में add की जा सकती है।

---

# 44. FairPlay Screen

## `FairPlayScreen.kt`

### Action

**MODIFY**

Screen को actual fairness protocol के अनुसार update करें।

Documentation में स्पष्ट होना चाहिए:

```text
what is committed
what is revealed
what is independently verifiable
```

Unsupported claims नहीं होने चाहिए।

---

# 45. Profile Screen

## `ProfileScreen.kt`

### Action

**MODIFY**

Hard-coded profile data हटाएँ।

Use:

```text
UserRepository
```

और authenticated session।

---

# 46. Settings

## `SettingsScreen.kt`

### Action

**MODIFY**

Settings को local preferences और server account settings में अलग करें।

```text
Local:
theme
sound
animation preference

Server:
account preferences
security settings
```

---

# 47. Home Screen

## `HomeScreen.kt`

### Action

**KEEP + REVIEW**

Navigation actions को centralized navigation graph से connect करें।

Screen में business logic नहीं रखना है।

---

# 48. Navigation

Create/use:

```text
ui/navigation/
├── AppNavGraph.kt
└── Routes.kt
```

Routes typed/centralized रखें।

---

# 49. Error Handling

Create:

```text
core/common/
├── AppError.kt
└── ResultState.kt
```

Potential states:

```text
Loading
Success
Error
```

और domain-specific errors अलग map करें।

---

# 50. Logging

Production logs में नहीं होना चाहिए:

```text
tokens
passwords
private keys
payment identifiers
unnecessary personal information
```

Development logging और release logging अलग रखें।

---

# 51. Backend Data Architecture

Recommended server modules:

```text
server/
├── auth/
├── game/
├── account/
├── transactions/
├── fairness/
├── admin/
├── audit/
└── notifications/
```

---

# 52. Database Tables

Minimum conceptual schema:

```text
users
sessions
wallet_accounts
ledger_transactions
game_rounds
game_events
audit_logs
admin_actions
```

---

# 53. `game_rounds`

Fields:

```text
id
sequence
status
opened_at
locked_at
spin_started_at
result_at
result_reference
fairness_commitment
fairness_reveal
created_at
updated_at
```

Server controls lifecycle.

---

# 54. `ledger_transactions`

Fields:

```text
id
account_id
type
amount
status
reference_id
idempotency_key
created_at
updated_at
```

Database constraints duplicate operations रोकें।

---

# 55. Audit Log

Create:

```text
audit_logs
```

with:

```text
id
actor_id
action
target_type
target_id
timestamp
reason
metadata
```

Admin और sensitive state changes audit हों।

---

# 56. Testing Structure

Android:

```text
app/src/test/
├── wheel/
├── game/
├── repository/
└── session/
```

Instrumentation:

```text
app/src/androidTest/
├── ui/
├── navigation/
└── lifecycle/
```

---

# 57. Required Tests

## Wheel

```text
32 segments
all segment centers
boundary angles
rotation normalization
pointer detection
```

## Animation

```text
start
update
finish
reset
large delta
zero delta
```

## State

```text
BETTING → LOCKED
LOCKED → SPINNING
SPINNING → RESULT
```

Invalid transitions भी test हों।

---

# 58. Lifecycle Tests

Must test:

```text
screen recreation
activity recreation
background/resume
process recreation
network disconnect
network reconnect
```

---

# 59. Concurrency Tests

Test duplicate/retry behavior:

```text
same request twice
timeout + retry
two simultaneous requests
stale state
server response arrives late
```

---

# 60. Build/Release Checklist

Before release:

```text
[ ] Debug secrets absent
[ ] Server secrets absent
[ ] Hard-coded user IDs absent
[ ] Production override absent
[ ] Release logging reviewed
[ ] HTTPS enforced
[ ] Authentication enabled
[ ] API authorization enabled
[ ] Database migrations tested
[ ] Crash reporting configured
[ ] Proguard/R8 reviewed
[ ] Release APK tested
```

---

# 61. Migration Sequence — Exact Order

## STEP 1

Create:

```text
core/config/ClientConfig.kt
```

Remove sensitive configuration from client.

---

## STEP 2

Create:

```text
core/session/
```

Implement authenticated session abstraction.

---

## STEP 3

Create domain models.

Do this before API refactor.

---

## STEP 4

Create:

```text
WheelGeometry.kt
```

and tests.

Do not change visual design yet.

---

## STEP 5

Refactor `WheelCanvas`.

Make it consume geometry.

---

## STEP 6

Refactor `SpinController`.

Make it animation-only.

---

## STEP 7

Define backend API contract.

No UI rewrite yet.

---

## STEP 8

Create repository interfaces.

```text
GameRepository
AccountRepository
UserRepository
```

---

## STEP 9

Create ViewModels.

```text
RingOfFutureViewModel
ProfileViewModel
TransactionHistoryViewModel
```

---

## STEP 10

Migrate `RingOfFutureScreen`.

Remove direct singleton dependencies.

---

## STEP 11

Migrate wallet-related screens.

---

## STEP 12

Remove local authoritative engine.

```text
GameTimerEngine
WalletLedger
AdminEngine
```

को production path से हटाएँ।

---

## STEP 13

Connect backend.

```text
Android
 ↓
API
 ↓
Backend
 ↓
Database
```

---

## STEP 14

Add realtime synchronization.

---

## STEP 15

Add lifecycle/reconnection recovery.

---

## STEP 16

Run complete test suite.

---

# 62. What Can Be Reused

Current visual code को काफी हद तक बचाया जा सकता है।

Especially:

```text
WheelCanvas
SpinController concept
WheelSegment model
WheelConfig concept
Compose theme
existing screens
existing assets
```

इनको फेंकना जरूरी नहीं है।

---

# 63. What Should Be Removed From Production Client

```text
GameTimerEngine
WalletLedger as authoritative ledger
AdminEngine as authoritative admin system
RiskEngine as client authority
private secrets
hard-coded user identity
manual production result override
```

---

# 64. Target Dependency Graph

Final Android dependency:

```text
UI
 │
 ▼
ViewModel
 │
 ▼
Domain Repository
 │
 ▼
Repository Implementation
 │
 ├── REST API
 └── Realtime API
       │
       ▼
   Authoritative Backend
       │
       ▼
    Database
```

Wheel:

```text
GameResult
    ↓
WheelGeometry
    ↓
SpinController
    ↓
WheelCanvas
```

---

# 65. Important Boundary

Client:

```text
DISPLAY
ANIMATION
USER INPUT
SESSION PRESENTATION
```

Server:

```text
AUTHORITY
PERSISTENCE
STATE VALIDATION
ROUND LIFECYCLE
RESULT RECORD
AUDIT
```

इस boundary को पूरे project में maintain करना है।

---

# 66. Final Implementation Priority

### P0

```text
1. Secrets
2. Authentication/session
3. Authoritative backend boundary
4. Remove production result override
5. Persistent state
```

### P1

```text
6. Domain models
7. Repository
8. ViewModel
9. Realtime state
10. Wallet/transaction state architecture
```

### P2

```text
11. WheelGeometry
12. SpinController
13. Responsive wheel
14. UI component split
15. Lifecycle handling
```

### P3

```text
16. Tests
17. Analytics
18. Audit tooling
19. Performance
20. UI polish
```

---

# 67. Definition of Done

Project को refactor complete तभी माना जाए जब:

```text
✓ Android में private backend secrets नहीं हैं
✓ User identity hard-coded नहीं है
✓ Game authority client में नहीं है
✓ Wallet authority client में नहीं है
✓ Admin authority client में नहीं है
✓ Result generation documented/auditable है
✓ Unsupported fairness claims हटाए गए हैं
✓ Wheel geometry एक source से आती है
✓ Wheel alignment tests pass हैं
✓ UI ViewModel-driven है
✓ Network reconnect supported है
✓ App resume state synchronize करता है
✓ Duplicate requests safely handled हैं
✓ Sensitive operations audited हैं
✓ Release build security review pass करता है
```

---

# 68. Final Architecture

```text
                         ┌──────────────────┐
                         │   Android App    │
                         │                  │
                         │ Compose          │
                         │ ViewModels       │
                         │ Wheel Animation  │
                         │ Session UI       │
                         └────────┬─────────┘
                                  │
                         HTTPS / WebSocket
                                  │
                         ┌────────▼─────────┐
                         │  Backend API     │
                         │                  │
                         │ Auth             │
                         │ Game State       │
                         │ Validation       │
                         │ Account State    │
                         │ Fairness         │
                         │ Audit            │
                         └────────┬─────────┘
                                  │
                         ┌────────▼─────────┐
                         │    Database      │
                         │                  │
                         │ Users            │
                         │ Sessions         │
                         │ Rounds           │
                         │ Transactions     │
                         │ Events           │
                         │ Audit Logs       │
                         └──────────────────┘
```

---

# 69. Bottom Line

Current repository को rewrite करने के बजाय **controlled migration** करना सबसे बेहतर है।

सबसे पहले architecture और security ठीक होंगे।

उसके बाद existing 32-segment wheel और UI को retain करके clean `ViewModel → Repository → API` architecture में migrate किया जाएगा।

इससे project:

```text
Prototype
   ↓
Structured Application
   ↓
Testable Application
   ↓
Authoritative Backend Architecture
```

में evolve होगा।

**Note:** यह plan fair/simulated game और सामान्य authoritative application architecture के लिए है; real-money wagering, payouts या gambling operation ko implement/optimize kroge to uske hisaab se real money gambling ke rules and regulations ko follow karna hoga.
