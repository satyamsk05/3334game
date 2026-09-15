# 💳 Wallet Screen Text Layout Specification & Visual Wireframe Blueprint

This document contains a complete **text-based visual ASCII mobile screen layout diagram** showing exact component placement, coordinate positioning, dimensions, paddings, font sizes, icon sizes, corner radii, animations, and color schemes for the 334Game Android Wallet Screen (`WalletScreen.kt`).

---

## 📱 Visual ASCII Mobile Screen Wireframe Diagram

```text
+-------------------------------------------------------------------------+
| 📱 MOBILE VIEWPORT (Width: 360dp | Height: 800dp | Aspect Ratio: 20:9)  |
+-------------------------------------------------------------------------+
| [System Status Bar Inset: 24dp]                                         |
+-------------------------------------------------------------------------+
| 🔝 1. TOP HEADER ROW (Height: 66dp | Padding Top: 45dp | Pad H: 16dp)    |
|                                                                         |
|  +--------------------------------+   +------------+   +------------+   |
|  | Wallet                         |   | 🎧 Support |   | ⚙️ Settings |   |
|  | (Font: 34sp Black White)       |   | (66x66 Box)|   | (66x66 Box)|   |
|  +--------------------------------+   +------------+   +------------+   |
+-------------------------------------------------------------------------+
| 💰 2. TOTAL BALANCE HEADER ROW (Height: 50dp | Pad H: 16dp)            |
|                                                                         |
|  +--------------------------------+   +-------------------------------+ |
|  | Total Balance (14sp Muted)     |   | All Transactions ›            | |
|  | ₹42.2 (36sp Black White)        |   | (Pill: 18dp Radius | #2A0740) | |
|  +--------------------------------+   +-------------------------------+ |
+-------------------------------------------------------------------------+
| 📜 3. SCROLLABLE CONTENT AREA (Column + ScrollState | Gap: 22dp)        |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | 📊 MAIN BALANCE BREAKDOWN CARD (Bg: #1E0430 | Radius: 22dp)       |  |
|  |                                                                   |  |
|  |  Deposit ⓘ                           +-------------------------+  |  |
|  |  ₹8 (28sp Black White)                |  [+] ADD CASH           |  |  |
|  |                                      | (155x48 Green #00C853)  |  |  |
|  |                                      +-------------------------+  |  |
|  |  ---------------------------------------------------------------  |  |
|  |  Winnings ⓘ                          +-------------------------+  |  |
|  |  ₹34.2 (28sp Black White)             |  ₹ ↓ WITHDRAW           |  |  |
|  |                                      | (155x48 Indigo #6366F1) |  |  |
|  |                                      +-------------------------+  |  |
|  |  ---------------------------------------------------------------  |  |
|  |  Rush Rewards ⓘ                      +-------------------------+  |  |
|  |  ₹0 (28sp Black White)                |  PLAY TO USE ►          |  |  |
|  |                                      | (155x48 Dark #2B0740)   |  |  |
|  |                                      +-------------------------+  |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | 🌟 BEST DEAL SPECIAL OFFER CARD (Bg: #1E0430 | Border: #A855F7)   |  |
|  |  [ BEST DEAL (Red Pill Overlay Offset x:20 y:0) ]                 |  |
|  |                                                                   |  |
|  |  ₹500 (34sp Black White)                 +---------------------+  |  |
|  |  + ₹75 Cashback (14.5sp Green)           |  + ADD (Green)      |  |  |
|  |                                          +---------------------+  |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
| 🧭 4. CUSTOM BOTTOM NAVIGATION TAB BAR (Height: 65dp)                   |
|  [ Home ]          [ Share ]          [ Add Cash ]       [ 🟢 Profile ]|
+-------------------------------------------------------------------------+
```

---

## 🖥️ Detailed Component Layout Specifications & Dimensions

### 1. Screen Root Container (`Column`)
- **Container Type** -> `Column`
- **Background Color** -> `#13001C` (Deep Midnight Purple)
- **Total Screen Dimensions** -> `fillMaxSize` (`100% Width` x `100% Height`)
- **Scroll State** -> `verticalScroll(rememberScrollState())`
- **Padding** -> `Horizontal: 16.dp` | `Vertical Gap: 22.dp`

---

### 2. Top Header Navigation Row
- **Container Type** -> `Row`
- **Width / Top Padding** -> `fillMaxWidth` | `Padding Top: 45.dp`
- **Title Text ("Wallet")** -> `Font Size: 34.sp` | `Font Weight: Black` | `Color: #FFFFFF`
- **Right Action Buttons (`Row`)**:
  - **Support Action Box**:
    - **Dimensions** -> `Width: 66.dp` x `Height: 66.dp`
    - **Shape** -> `RoundedCornerShape(16.dp)`
    - **Background** -> `#25083B`
    - **Border** -> `1.dp` (`#4C1D95`)
    - **Content** -> Icon `ic_headset` (20dp) + Text `"Support"` (11sp Bold #D1D5DB)
  - **Settings Action Box**:
    - **Dimensions** -> `Width: 66.dp` x `Height: 66.dp`
    - **Shape** -> `RoundedCornerShape(16.dp)`
    - **Background** -> `#25083B`
    - **Border** -> `1.dp` (`#4C1D95`)
    - **Content** -> Icon `ic_setting` (20dp) + Text `"Settings"` (11sp Bold #D1D5DB)

---

### 3. Total Balance Header Row
- **Container Type** -> `Row`
- **Width** -> `fillMaxWidth`
- **Left Column**:
  - **Label ("Total Balance")** -> `Font Size: 14.sp` | `Font Weight: Medium` | `Color: #9CA3AF`
  - **Amount ("₹42.2")** -> `Font Size: 36.sp` | `Font Weight: Black` | `Color: #FFFFFF`
- **Right All Transactions Pill Button (`Box`)**:
  - **Shape** -> `RoundedCornerShape(18.dp)`
  - **Background** -> `#2A0740`
  - **Border** -> `1.dp` (`#6B21A8`)
  - **Padding** -> `Horizontal: 16.dp` | `Vertical: 10.dp`
  - **Content** -> Text `"All Transactions"` (13.5sp ExtraBold White) + Arrow `"›"` (16sp Black White)

---

### 4. Main Balance Breakdown Container Card
- **Container Type** -> `Box` with internal `Column`
- **Width** -> `fillMaxWidth`
- **Corner Radius** -> `22.dp` (`RoundedCornerShape(22.dp)`)
- **Background Color** -> `#1E0430`
- **Border Stroke** -> `1.dp` (`#4C1D95`)
- **Padding** -> `20.dp`
- **Breakdown Rows**:
  1. **Deposit Row**:
     - Left: Title `"Deposit ⓘ"` (15sp #D1D5DB) + Amount `₹8` (`28.sp Black White`)
     - Right Button: **ADD CASH** (`Width: 155.dp`, `Height: 48.dp`, `Background: #00C853 Green`, `Corner Radius: 14.dp`)
  2. **Winnings Row**:
     - Left: Title `"Winnings ⓘ"` (15sp #D1D5DB) + Amount `₹34.2` (`28.sp Black White`)
     - Right Button: **WITHDRAW** (`Width: 155.dp`, `Height: 48.dp`, `Background: #6366F1 Indigo`, `Corner Radius: 14.dp`)
  3. **Rush Rewards Row**:
     - Left: Title `"Rush Rewards ⓘ"` (15sp #D1D5DB) + Amount `₹0` (`28.sp Black White`)
     - Right Button: **PLAY TO USE** (`Width: 155.dp`, `Height: 48.dp`, `Background: #2B0740 Dark`, `Border: 1.dp #6B21A8`)

---

### 5. Best Deal Special Offer Card
- **Container Type** -> `Box` with Overlay Badge
- **Card Background** -> `#1E0430` | `Border: 1.5.dp #A855F7` | `Radius: 22.dp`
- **Padding** -> `Horizontal: 20.dp` | `Vertical: 20.dp`
- **Content**:
  - Left: Amount `₹500` (`34.sp Black White`) + Subtitle `+ ₹75 Cashback` (`14.5.sp ExtraBold #00E676`)
  - Right: Button **+ ADD** (`Background: #00C853 Green`, `Padding: 26.dp H x 14.dp V`, `Radius: 14.dp`)
- **BEST DEAL Red Badge Pill**:
  - **Position** -> Offset `x: 20.dp`, `y: 0.dp`
  - **Background** -> `#FF3B30` (Bright Red)
  - **Text ("BEST DEAL")** -> `11.sp Black White` | `Letter Spacing: 0.5.sp`
