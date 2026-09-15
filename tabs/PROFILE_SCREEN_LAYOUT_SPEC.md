# 👤 Profile Screen Text Layout Specification & Visual Wireframe Blueprint

This document contains a complete **text-based visual ASCII mobile screen layout diagram** showing exact component placement, coordinate positioning, dimensions, paddings, font sizes, icon sizes, corner radii, animations, and color schemes for the 334Game Android User Account Profile Screen (`ProfileScreen.kt`).

---

## 📱 Visual ASCII Mobile Screen Wireframe Diagram

```text
+-------------------------------------------------------------------------+
| 📱 MOBILE VIEWPORT (Width: 360dp | Height: 800dp | Aspect Ratio: 20:9)  |
+-------------------------------------------------------------------------+
| [System Status Bar Inset: 24dp]                                         |
+-------------------------------------------------------------------------+
| 🔝 1. ACCOUNT TITLE HEADER (Height: 45dp | Padding Top: 45dp)           |
|  Account (Font: 28sp Bold White)                                        |
+-------------------------------------------------------------------------+
| 👤 2. USER PROFILE HEADER ROW                                           |
|                                                                         |
|  +-------------------------------------+   +--------------------------+ |
|  | ashu bhai                           |   | 🟢 [Avatar 90x90 Image]  | |
|  | +91727*****82  [ ✓ KYC Pill ]       |   |    (Circle Crop)         | |
|  |                                     |   +--------------------------+ |
|  | +--------------------------------+  |                                |
|  | | Profile  ▶ (Play Arrow Icon)   |  |                                |
|  | | (Pill: #381559 | Radius: 16dp) |  |                                |
|  | +--------------------------------+  |                                |
|  +-------------------------------------+                                |
+-------------------------------------------------------------------------+
| 💳 3. WALLET BALANCE GRADIENT CARD (Height: 115dp | Radius: 22dp)       |
|                                                                         |
|  | WALLET BALANCE 🛡️ (12sp Bold Slate)              +-----------------+ |
|  | ₹220673.85 ▶ (28sp ExtraBold White + Play Arrow)| 💰 [Money Bag]  | |
|  |                                                  |   (75dp Asset)  | |
|  | (Left Green Accent Bar: 4dp #00FF87 | Gradient: #260D6B -> #2B51E5)| |
+-------------------------------------------------------------------------+
| 🆘 4. CONTACT SUPPORT GRADIENT CARD (Height: 105dp | Radius: 18dp)      |
|                                                                         |
|  NEED ANY HELP? (12sp ExtraBold Slate)             +------------------+ |
|  Contact Support  ► (21sp Black White)             | 🎧 [Support Avt] | |
|  (Gradient: #4C0519 -> #3B0764 Dark Wine)          |    (60x60 Circle) | |
+-------------------------------------------------------------------------+
| ⚙️ 5. MENU OPTIONS CONTAINER CARD (Bg: #220338 | Radius: 18dp)         |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | 🕒  Transaction History                                        ›  |  |
|  | ----------------------------------------------------------------- |  |
|  | ⚙️  Settings                                                   ›  |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 🖥️ Detailed Component Layout Specifications & Dimensions

### 1. Screen Root Container (`Column`)
- **Container Type** -> `Column`
- **Background Color** -> `#15001F` (Deep Midnight Purple)
- **Total Screen Dimensions** -> `fillMaxSize` (`100% Width` x `100% Height`)
- **Scroll State** -> `verticalScroll(rememberScrollState())`
- **Padding** -> `Horizontal: 16.dp` | `Vertical Gap: 18.dp`

---

### 2. Account Header & User Profile Header
- **Title Header ("Account")** -> `Font Size: 28.sp` | `Font Weight: Bold` | `Color: #FFFFFF` | `Top Pad: 45.dp`
- **User Row Layout**:
  - **Left Section**:
    - **Username ("ashu bhai")** -> `Font Size: 24.sp` | `Font Weight: Bold` | `Color: #FFFFFF`
    - **Phone & KYC Row**:
      - Phone Text `"+91727*****82"` -> `14.sp Medium` | `Color: #9CA3AF`
      - **KYC Pill Badge**:
        - **Background** -> `#2563EB` (Vibrant Blue)
        - **Radius** -> `12.dp`
        - **Padding** -> `7.dp H x 3.dp V`
        - **Content** -> Circle White Box (`Size: 12.dp`) with Checkmark `"✓"` (`9.sp Black #2563EB`) + Text `"KYC"` (`11.sp Black White`)
    - **Profile Button Pill**:
      - **Background** -> `#381559` (Dark Violet)
      - **Border** -> `1.dp` (`#5B21B6`)
      - **Radius** -> `16.dp`
      - **Padding** -> `14.dp H x 6.dp V`
      - **Content** -> Text `"Profile"` (13sp Bold White) + Icon `ic_play_arrow` (10dp White)
  - **Right 3D Avatar Image**:
    - **Asset** -> `R.drawable.avatar_1`
    - **Size** -> `90.dp x 90.dp`
    - **Shape** -> `CircleShape`

---

### 3. Wallet Balance Gradient Card
- **Height** -> `115.dp`
- **Corner Radius** -> `22.dp` (`RoundedCornerShape(22.dp)`)
- **Background Gradient** -> `Brush.horizontalGradient(listOf(Color(0xFF260D6B), Color(0xFF2B51E5)))` (Rich Deep Indigo-Purple to Royal Blue)
- **Left Accent Strip** -> `Width: 4.dp` | `Height: fillMaxHeight` | `Color: #00FF87` (Neon Green)
- **Content Row**:
  - **Left Column**:
    - Title Row: `"WALLET BALANCE"` (`12.sp Bold #CBD5E1`) + Gold Shield Icon `ic_reward_badge` (`14.dp #FFFFD700`)
    - Balance Row: `"₹220673.85"` (`28.sp ExtraBold White`) + Icon `ic_play_arrow` (`16.dp White`)
  - **Right Image**: 3D Money Bag PNG Asset (`R.drawable.ic_refer_addcash`, `Size: 75.dp`)

---

### 4. Contact Support Gradient Card
- **Height** -> `105.dp`
- **Corner Radius** -> `18.dp`
- **Background Gradient** -> `Brush.horizontalGradient(listOf(Color(0xFF4C0519), Color(0xFF3B0764)))` (Dark Wine Purple)
- **Content**:
  - Left: Subtitle `"NEED ANY HELP?"` (`12.sp ExtraBold #D1D5DB`) + Action `"Contact Support  ►"` (`21.sp Black White`)
  - Right: Support Character Circle Avatar (`Size: 60.dp`, `CircleShape`)

---

### 5. Menu Options Container Card
- **Background** -> `#220338`
- **Border** -> `1.dp` (`#4C1D95`)
- **Corner Radius** -> `18.dp`
- **Padding** -> `16.dp`
- **Menu Rows**:
  1. **Transaction History Row**: Icon `ic_history` (22dp) + Text `"Transaction History"` (18sp ExtraBold White) + Arrow `"›"`
  2. **Settings Row**: Icon `ic_setting` (22dp) + Text `"Settings"` (18sp ExtraBold White) + Arrow `"›"`
