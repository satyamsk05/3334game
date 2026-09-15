# 📱 Home Screen Text Layout Specification & Visual Wireframe Blueprint

This document contains a complete **text-based visual ASCII mobile screen layout diagram** showing exact component placement, coordinate positioning, dimensions, paddings, font sizes, icon sizes, corner radii, animations, and color schemes for the 999xGame Android Home Screen (`HomeScreen.kt`) and Custom Bottom Navigation Tab Bar (`CustomBottomNavBar.kt`).

---

## 📱 Visual ASCII Mobile Screen Wireframe Diagram

```text
+-------------------------------------------------------------------------+
| 📱 MOBILE VIEWPORT (Width: 360dp | Height: 800dp | Aspect Ratio: 20:9)  |
+-------------------------------------------------------------------------+
| [System Status Bar Inset: 24dp]                                         |
+-------------------------------------------------------------------------+
| 🔝 1. TOP HEADER BAR (Height: 58dp | Padding H: 14dp)                    |
|                                                                         |
|  +-----------------------------------+   +----------------------------+ |
|  | 🟢 [Avatar 60x60] satyamog        |   | 💳 ₹42.2  |  +             | |
|  |    (Gold Border) [Profile ▸ 11sp] |   | (Green Pill VertPad: 9dp)  | |
|  +-----------------------------------+   +----------------------------+ |
+-------------------------------------------------------------------------+
| 📜 2. SCROLLABLE AREA (LazyColumn | Height: ~675dp | Pad: Top 10, Btm 100) |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | 🎁 HERO BANNER (Height: 140dp | Radius: 16dp | Purple Gradient)   |  |
|  |  [ DEPOSIT ] (Pill Tag | Gold #FFD700)                            |  |
|  |  DEPOSIT BONUS 180% BONUS (Title: 18sp Black White)             |  |
|  |  DEPOSIT ➔ GET BONUS (Sub: 12sp Bold Gold)                        |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  ⭐ FEATURED GAMES ROW (LazyRow | Item Gap: 16dp | Padding H: 14dp)       |
|  +---------------------------+   +---------------------------+          |
|  | 🎲 CLASSIC DICE           |   | 🚀 DOUBLE                 |          |
|  | [Artwork: 280dp x 280dp]  |   | [Artwork: 280dp x 280dp]  |  ======> |
|  +---------------------------+   +---------------------------+  (Swipe) |
|                                                                         |
|  🎮 ALL GAMES GRID (2 Columns | Row Gap: 14dp | Col Gap: 14dp)          |
|  +-------------------------+     +-------------------------+            |
|  | 💣 MINES                |     | 🎲 CLASSIC DICE         |            |
|  | [Logo: 125dp Fit]       |     | [Logo: 125dp Fit]       |            |
|  | Mines                   |     | Classic Dice            |            |
|  | [ ▶ PLAY NOW ]          |     | [ ▶ PLAY NOW ]          |            |
|  +-------------------------+     +-------------------------+            |
|  +-------------------------+     +-------------------------+            |
|  | 🎲 COLOR DICE           |     | 🚀 DOUBLE               |            |
|  | [Logo: 125dp Fit]       |     | [Logo: 125dp Fit]       |            |
|  | Color Dice              |     | Double                  |            |
|  | [ ▶ PLAY NOW ]          |     | [ ▶ PLAY NOW ]          |            |
|  +-------------------------+     +-------------------------+            |
|  +-------------------------+     +-------------------------+            |
|  | 🎯 HI-LO                |     | 🎰 KINO                 |            |
|  | [Logo: 125dp Fit]       |     | [Logo: 125dp Fit]       |            |
|  | Hi-Lo                   |     | Kino                    |            |
|  | [ ▶ PLAY NOW ]          |     | [ ▶ PLAY NOW ]          |            |
|  +-------------------------+     +-------------------------+            |
|  +-------------------------+     +-------------------------+            |
|  | 🚀 LIMBO                |     | 🪙 COIN FLIP             |            |
|  | [Logo: 125dp Fit]       |     | [Logo: 125dp Fit]       |            |
|  | Limbo                   |     | Coin Flip               |            |
|  | [ ▶ PLAY NOW ]          |     | [ ▶ PLAY NOW ]          |            |
|  +-------------------------+     +-------------------------+            |
|  +-------------------------+     +-------------------------+            |
|  | 🎨 PERYA COLOR          |     | 🔮 RINGS OF FUTURE      |            |
|  | [Logo: 125dp Fit]       |     | [Logo: 125dp Fit]       |            |
|  | Perya Color             |     | Rings of Future         |            |
|  | [ ▶ PLAY NOW ]          |     | [ ▶ PLAY NOW ]          |            |
|  +-------------------------+     +-------------------------+            |
|                                                                         |
+-------------------------------------------------------------------------+
| 🧭 3. CUSTOM BOTTOM TAB BAR (Height: 65dp | Gradient: #2C0C3E->#1B0626)  |
|   [ ACTIVE WHITE BOX INDICATOR (Width: 70dp | Height: 60dp | Rad: 7dp) ] |
|  +--------------+  +--------------+  +--------------+  +--------------+ |
|  | 🏠 [SVG 30dp] |  | 🔗 [SVG 30dp] |  | 💵 [SVG 30dp] |  | 👤 [SVG 30dp] | |
|  |  Home (11sp) |  | Share (11sp) |  |Add Cash(11sp)|  |Profile (11sp)| |
|  +--------------+  +--------------+  +--------------+  +--------------+ |
+-------------------------------------------------------------------------+
```

---

## 🖥️ Detailed Component Layout Specifications & Dimensions

### 1. Screen Root Container (`Column`)
- **Container Type** -> `Column`
- **Background Color** -> `#15001F` (Deep Midnight Purple)
- **Total Screen Dimensions** -> `fillMaxSize` (`100% Width` x `100% Height / 100vh`)
- **System Bar Insets** -> `statusBarsPadding()` (Accounts for top Android notch & status bar)

---

### 2. Top Header Navigation Bar (`TopHeader`)
- **Container Type** -> `Row`
- **Width / Height** -> `fillMaxWidth` x `58.dp`
- **Upward Position Offset** -> `offset(y = -16.dp)` (Positioned 10% further upward towards top status bar)
- **Outer Padding** -> `Horizontal: 14.dp` | `Vertical: 1.dp`
- **Alignment / Arrangement** -> `SpaceBetween` (Pushes Profile to Left & Wallet to Right)

#### 2.1 Left Profile Section (`Row`)
- **Action** -> `clickable` (`onProfileClick`)
- **Vertical Alignment** -> `CenterVertically`
- **Avatar Box Container**:
  - **Size** -> `60.dp` x `60.dp` (10% larger circular profile avatar)
  - **Shape** -> `CircleShape` (`Radius: 30.dp`)
  - **Background Color** -> `#200038`
  - **Border Stroke** -> `2.dp` (Gold Glow `#FFFFD700`)
  - **Avatar AsyncImage** -> `Size: 60.dp x 60.dp` | `ContentScale: Crop`
- **Spacer Gap** -> `Width: 8.dp`
- **User Text Info (`Column`)**:
  - **Username Text ("satyamog")**: `Font Size: 17.sp` | `Font Weight: Black` | `Color: #FFFFFF` | `Letter Spacing: 0.2.sp`
  - **Spacer Gap** -> `Height: 2.dp`
  - **Profile Pill Badge (`Box`)**:
    - **Background Color** -> `#2A0E4E`
    - **Border Stroke** -> `1.dp` (`#4C1D95`)
    - **Corner Radius** -> `8.dp` (`RoundedCornerShape(8.dp)`)
    - **Height** -> `18.dp` (20% reduced height overlay layer)
    - **Internal Padding** -> `Horizontal: 8.dp` | `Vertical: 0.dp`
    - **Text "Profile"** -> `Font Size: 10.5.sp` | `Font Weight: Bold` | `Color: #FFFFD700`
    - **Arrow Icon "▸"** -> `Font Size: 9.5.sp` | `Font Weight: Bold` | `Color: #FFFFD700`

#### 2.2 Right Wallet Balance Pill (`Row`)
- **Action** -> `clickable` (`onAddCashClick` / `onWalletClick`)
- **Shape / Radius** -> `RoundedCornerShape(12.dp)`
- **Background** -> `Vertical Gradient (#00B57F -> #009A69)` (Vibrant Emerald Green)
- **Internal Padding** -> `Horizontal: 14.dp` | **`Vertical: 9.dp`**
- **Wallet SVG Icon** -> `Size: 22.dp x 22.dp` | `ColorFilter: White (#FFFFFF)`
- **Spacer Gap** -> `Width: 8.dp`
- **Balance Text ("₹0")** -> `Font Size: 17.sp` | `Font Weight: ExtraBold` | `Color: #FFFFFF` | `Letter Spacing: 0.3.sp`
- **Spacer Gap** -> `Width: 10.dp`
- **Vertical Divider Line (`Box`)** -> `Width: 1.dp` | `Height: 18.dp` | `Color: White 35% Opacity (#FFFFFF59)`
- **Spacer Gap** -> `Width: 10.dp`
- **Add Cash Plus Icon ("+")** -> `Font Size: 18.sp` | `Font Weight: ExtraBold` | `Color: #FFFFFF`

---

<!--
### 3. Live Online Players Ticker Bar (`OnlineTicker`)
- **Placement** -> Inside `LazyColumn` as item #1 (Scrolls together with the main screen content)
- **Container Type** -> `Row`
- **Width / Height** -> `fillMaxWidth` x `42.dp`
- **Vertical Padding** -> `8.dp` (Expanded background vertical padding by 10%)
- **Background Gradient** -> `Horizontal Gradient colorStops` (`0.0f: #15001F` -> `0.2f: #220138` -> `0.5f: #2B044A` -> `0.8f: #220138` -> `1.0f: #15001F`)
  - **Left Edge Blend** -> Smoothly blends into background `#15001F` (0% to 20% width transition)
  - **Center Accent Glow** -> Rich dark purple `#2B044A` (50% center transition)
  - **Right Edge Blend** -> Smoothly blends into background `#15001F` (80% to 100% width transition)
- **Live Pulse Dot (`Box`)** -> `Size: 10.dp x 10.dp` | `Color: #00E676` | `Shape: CircleShape`
- **Ticker Text ("89,206 online")** -> `Font Size: 14.sp` | `Font Weight: Black` | `Color: #FFFFFF`
-->

---

### 4. Main Scrollable Content Area (`LazyColumn`)
- **Container Type** -> `LazyColumn`
- **Dimensions** -> `fillMaxSize` (`100% Width` x `Remaining Screen Height`)
- **Content Padding** -> `Top: 10.dp` | `Bottom: 100.dp` (Clears floating bottom navigation bar)
- **Vertical Item Spacing** -> `18.dp`

---

### 5. Promotional Hero Banner (`ChampionsLeagueBanner`)
- **Outer Padding** -> `Horizontal: 14.dp`
- **Banner Card Container (`Box`)**:
  - **Width** -> `fillMaxWidth`
  - **Height** -> `140.dp`
  - **Corner Radius** -> `16.dp`
  - **Background Gradient** -> `Linear Gradient (#4C1D95 -> #2563EB)`
- **Banner Content Structure (`Column`)**:
  - **Internal Padding** -> `16.dp`
  - **Hero Title ("CHAMPIONS LEAGUE")** -> `Font Size: 20.sp` | `Font Weight: ExtraBold` | `Color: #FFFFFF`
  - **Hero Subtitle ("PLAY & WIN REAL CASH REWARDS")** -> `Font Size: 13.sp` | `Color: #E2E8F0`
  - **Spacer Gap** -> `Height: 12.dp`
  - **Play Now CTA Button (`Box`)**:
    - **Button Height** -> `34.dp`
    - **Corner Radius** -> `20.dp`
    - **Background Color** -> `Gold #FFD700`
    - **Internal Padding** -> `Horizontal: 16.dp`
    - **Button Text ("PLAY NOW")** -> `Font Size: 12.sp` | `Font Weight: Bold` | `Color: #000000`

---

### 6. Featured Games Row - Top 2 Games (`LazyRow`)
- **Container Type** -> `LazyRow`
- **Content Padding** -> `Horizontal: 14.dp`
- **Horizontal Item Spacing** -> `16.dp`
- **Featured Game Card Component (`GameCard`)**:
  - **Card Width** -> `280.dp`
  - **Card Height** -> `280.dp`
  - **Corner Radius** -> `18.dp`
  - **Background** -> `Linear Gradient (#2A0E4E -> #1A002A)`
  - **Border Stroke** -> `1.5.dp` (`#7C3AED`)
  - **Game Artwork Image** -> `Width: 280.dp` | `Height: 195.dp` | `ContentScale: Crop`
  - **Game Details Footer (`Column`)**:
    - **Footer Height** -> `85.dp`
    - **Padding** -> `12.dp`
    - **Game Title ("Classic Dice" / "Crush")** -> `Font Size: 16.sp` | `Font Weight: Bold` | `Color: #FFFFFF`
    - **Game Description ("Roll dice & win instant rewards")** -> `Font Size: 11.sp` | `Color: #A78BFA`
    - **Spacer** -> `Height: 4.dp`
    - **Active Players Badge** -> `Background: #000000 50% Opacity` | `Font Size: 10.sp` | `Color: #00E676`

---

### 7. Grid Games Section - 2 Columns (`Column` + `Row`)
- **Outer Container Padding** -> `Horizontal: 14.dp`
- **Vertical Row Spacing** -> `12.dp`
- **Horizontal Column Spacing** -> `12.dp`
- **Grid Game Card Component (`GridGameCard`)**:
  - **Card Container** -> `fillMaxWidth` | `Corner Radius: 16.dp` | `Background: Game Theme Color` | `Total Height: ~157.dp`
  - **Top Artwork/Logo Container (`Box`)**:
    - **Height** -> `105.dp`
    - **Background** -> `Vertical Gradient (Game Theme Start Color -> End Color)`
    - **Padding** -> `6.dp`
    - **Logo Image (`Image`)** -> `fillMaxSize` | `ContentScale: Fit` (Uncropped, full logo preserved)
  - **Bottom Info Container (`Column`)**:
    - **Height** -> `~52.dp`
    - **Background** -> `Game Theme End Color`
    - **Padding** -> `8.dp`
    - **Game Title** -> `Font Size: 13.sp` | `Font Weight: ExtraBold` | `Color: #FFFFFF` | `Uppercase` | `Max Lines: 1`
    - **Small White PLAY NOW Pill Button (`Box`)**:
      - **Height** -> `30.dp`
      - **Corner Radius** -> `15.dp`
      - **Background** -> `Solid White (#FFFFFF)`
      - **Icon `ic_play_arrow`** -> `Size: 10.dp` | `Tint: Dynamic Game Theme Color`
      - **Button Text ("PLAY NOW")** -> `Font Size: 10.5.sp` | `Font Weight: ExtraBold` | `Color: Dynamic Game Theme Color` | `Letter Spacing: 0.5.sp`

---

### 🧭 8. Custom Bottom Navigation Tab Bar (`CustomBottomNavBar`)
- **Container Type** -> `Box` + `BoxWithConstraints` + `Row`
- **Width** -> `fillMaxWidth`
- **Fixed Nav Height** -> **`65.dp`**
- **Vertical Padding** -> `2.dp`
- **Background Gradient** -> `Vertical Gradient (#2C0C3E -> #1B0626)` (50% Deeper Top & Bottom Dark Purple)

#### 8.1 Active Sliding White Box Indicator (`Box`)
- **Positioning** -> `offset(x = tabWidth * animatedIndex)`
- **Sliding Animation** -> `animateFloatAsState` (`tween(250ms, FastOutSlowInEasing)`)
- **Single Tab Width** -> `fillMaxWidth / 4` (~`90.dp` on 360dp screen width)
- **Active White Box Exact Dimensions**:
  - **Width** -> **`70.dp`** (`width = 70.dp`)
  - **Height** -> **`60.dp`** (`height = 60.dp`, 5% reduction from 63.dp)
  - **Corner Radius** -> **`7.dp`** (`RoundedCornerShape(7.dp)`)
  - **Color & Opacity** -> **White 18% Opacity** (`#FFFFFF2E` / `Color.White.copy(alpha = 0.18f)`)

#### 8.2 Icon-to-Text Distance & SVG Icon Dimensions
- **SVG Icon Size** -> **`30.dp x 30.dp`**
- **Distance / Gap Between SVG Icon and Text** -> **`0.5.dp`** (`Spacer(Height: 0.5.dp)`)

Each tab item occupies `weight(1f)` with height `60.dp` and clickable action (`onItemSelected(item)`):

1. **Tab 1: Home (`NavItem.HOME`)**:
   - **Label Text** -> `"Home"`
   - **SVG Asset** -> `"file:///android_asset/nav_icon/home.svg"`
   - **SVG Icon Size** -> **`30.dp x 30.dp`** (Fixed size, no zoom scaling)
   - **Active State** -> Tint `#FFFFFF` (100% White), Font Weight `W700` (Bold)
   - **Inactive State** -> Tint `#FFFFFF` 50% Opacity (`#FFFFFF80`), Font Weight `W500` (Medium)

2. **Tab 2: Share / Refer (`NavItem.SHARE`)**:
   - **Label Text** -> `"Share"`
   - **SVG Asset** -> `"file:///android_asset/nav_icon/share.svg"`
   - **SVG Icon Size** -> **`30.dp x 30.dp`** (Fixed size, no zoom scaling)
   - **Active State** -> Tint `#FFFFFF` (100%), Font Weight `W700`

3. **Tab 3: Add Cash (`NavItem.ADD_CASH`)**:
   - **Label Text** -> `"Add Cash"`
   - **SVG Asset** -> `"file:///android_asset/nav_icon/addmoney.svg"`
   - **SVG Icon Size** -> **`30.dp x 30.dp`** (Fixed size, no zoom scaling)
   - **Active State** -> Tint `#FFFFFF` (100%), Font Weight `W700`

4. **Tab 4: Profile (`NavItem.PROFILE`)**:
   - **Label Text** -> `"Profile"`
   - **SVG Asset** -> `"file:///android_asset/nav_icon/profile.svg"`
   - **SVG Icon Size** -> **`30.dp x 30.dp`** (Fixed size, no zoom scaling)
   - **Active State** -> Tint `#FFFFFF` (100%), Font Weight `W700`
