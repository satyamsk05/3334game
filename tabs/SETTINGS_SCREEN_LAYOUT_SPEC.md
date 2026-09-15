# ⚙️ Settings Screen Text Layout Specification & Visual Wireframe Blueprint

This document contains a complete **text-based visual ASCII mobile screen layout diagram** showing exact component placement, coordinate positioning, dimensions, paddings, font sizes, icon sizes, corner radii, animations, and color schemes for the 334Game Android Settings Screen (`SettingsScreen.kt`).

---

## 📱 Visual ASCII Mobile Screen Wireframe Diagram

```text
+-------------------------------------------------------------------------+
| 📱 MOBILE VIEWPORT (Width: 360dp | Height: 800dp | Aspect Ratio: 20:9)  |
+-------------------------------------------------------------------------+
| [System Status Bar Inset: 24dp]                                         |
+-------------------------------------------------------------------------+
| 🔝 1. TOP HEADER ROW (Height: 45dp | Padding Top: 45dp | Pad H: 16dp)    |
|  ← (Back Button: 36x36)            Settings (29sp Black White)          |
+-------------------------------------------------------------------------+
| 📜 2. SCROLLABLE CONTENT AREA (Column + ScrollState | Gap: 22dp)        |
|                                                                         |
|  💵 MONEY SECTION (14.5sp ExtraBold Muted Gray)                         |
|  +-------------------------------------------------------------------+  |
|  | 💳  Add cash                                                   ›  |  |
|  | ----------------------------------------------------------------- |  |
|  | 📜  Transaction history                                        ›  |  |
|  | ----------------------------------------------------------------- |  |
|  | 💸  Withdrawals                                                ›  |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  ℹ️ HELP & UPDATES SECTION (14.5sp ExtraBold Muted Gray)               |
|  +-------------------------------------------------------------------+  |
|  | 🔄  Check for updates                                          ›  |  |
|  | ----------------------------------------------------------------- |  |
|  | ❓  Help Centre                                                ›  |  |
|  | ----------------------------------------------------------------- |  |
|  | 📋  My reported issues                                         ›  |  |
|  | ----------------------------------------------------------------- |  |
|  | ℹ️  About us                                                   ›  |  |
|  | ----------------------------------------------------------------- |  |
|  | 📞  Contact us                                                 ›  |  |
|  | ----------------------------------------------------------------- |  |
|  | 🛡️  InGames Fair Play                                          ›  |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  👤 ACCOUNT SECTION (14.5sp ExtraBold Muted Gray)                      |
|  +-------------------------------------------------------------------+  |
|  | 🚪  Log out                                                    ›  |  |
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
- **Padding** -> `Horizontal: 16.dp` | `Vertical Gap: 22.dp`

---

### 2. Top Header Navigation Row
- **Container Type** -> `Row`
- **Width / Top Padding** -> `fillMaxWidth` | `Padding Top: 45.dp`
- **Back Button Box**: `Size: 36.dp x 36.dp` | Icon `ic_arrow_back` (`24.dp White`)
- **Title Text ("Settings")** -> `Font Size: 29.sp` | `Font Weight: Black` | `Color: #FFFFFF`

---

### 3. Categorized Settings Options Sections
- **Section Headers**:
  - `Font Size: 14.5.sp` | `Font Weight: ExtraBold` | `Color: #9CA3AF` (Muted Gray) | `Bottom Padding: 6.dp`
- **Settings Item Row Component (`SettingsRow`)**:
  - **Height / Padding** -> `Vertical Padding: 12.dp`
  - **Left Row**:
    - **Icon** -> `Size: 22.dp x 22.dp` | `Color: #D1D5DB`
    - **Title Text** -> `Font Size: 18.sp` | `Font Weight: Bold` | `Color: #FFFFFF`
  - **Right Chevron Arrow** -> `"›"` | `Font Size: 22.sp` | `Font Weight: ExtraBold` | `Color: #9CA3AF`
  - **Divider Line** -> `HorizontalDivider(Color: #2D0A4E, Thickness: 1.dp)`

---

### 4. Settings Categories Breakdown:
1. **Money Section**:
   - `Add cash` (`ic_settings_add_cash`)
   - `Transaction history` (`ic_settings_history`)
   - `Withdrawals` (`ic_settings_withdraw`)
2. **Help & Updates Section**:
   - `Check for updates` (`ic_settings_update`)
   - `Help Centre` (`ic_settings_help`)
   - `My reported issues` (`ic_settings_issues`)
   - `About us` (`ic_settings_about`)
   - `Contact us` (`ic_settings_contact`)
   - `InGames Fair Play` (`ic_settings_shield`)
3. **Account Section**:
   - `Log out` (`ic_settings_logout`)
