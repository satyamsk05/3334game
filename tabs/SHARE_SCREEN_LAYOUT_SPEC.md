# 🔗 Share (Refer & Earn) Screen Text Layout Specification & Visual Wireframe Blueprint

This document contains a complete **text-based visual ASCII mobile screen layout diagram** showing exact component placement, coordinate positioning, dimensions, paddings, font sizes, icon sizes, corner radii, animations, and color schemes for the 334Game Android Refer & Earn / Share Screen (`ShareScreen.kt`).

---

## 📱 Visual ASCII Mobile Screen Wireframe Diagram

```text
+-------------------------------------------------------------------------+
| 📱 MOBILE VIEWPORT (Width: 360dp | Height: 800dp | Aspect Ratio: 20:9)  |
+-------------------------------------------------------------------------+
| [System Status Bar Inset: 24dp]                                         |
+-------------------------------------------------------------------------+
| 🔝 1. TOP HEADER ROW (Height: 52dp | Padding Top: 45dp | Pad H: 16dp)    |
|                                                                         |
|  +--------------------------------+       +---------------------------+ |
|  | Refer & Earn                   |       |  अ 💬  (Lang Selector)    | |
|  | (Font: 30sp Black White)       |       |  (Box: 12dp Radius Pill)  | |
|  +--------------------------------+       +---------------------------+ |
+-------------------------------------------------------------------------+
| 💵 2. YOUR EARNINGS HEADER (Height: 60dp | Pad H: 16dp)                  |
|                                                                         |
|  +--------------------------------+       +---------------------------+ |
|  | Your Earnings (13sp Muted)     |       |  🪙 [Refer Coin PNG Asset]| |
|  | ₹30 (30sp Black White)          |       |     (Height: 48dp)        | |
|  +--------------------------------+       +---------------------------+ |
+-------------------------------------------------------------------------+
| 📜 3. SCROLLABLE AREA (Column + ScrollState | Bottom Pad: 120dp)        |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | 🎁 3. REFERRAL BREAKDOWN CARD (Bg: #220338 | Radius: 18dp)            |  |
|  |                                                                   |  |
|  |         1 Referral = ₹1,000 (Gold/Green 20sp Black)               |  |
|  |                                                                   |  |
|  |  +---------------+    +---------------+    +---------------+      |  |
|  |  | ₹15           |  + | ₹55           |  + | ₹930          |      |  |
|  |  | signs up      |    | adds cash ⓘ   |    | play games ⓘ  |      |  |
|  |  | [Asset 58x58] |    | [Asset 58x58] |    | [Asset 58x58] |      |  |
|  |  +---------------+    +---------------+    +---------------+      |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | 👥 4. RECENT REFERRALS LIST CARD (Bg: #220338 | Radius: 18dp)       |  |
|  |                                                                   |  |
|  |  (🟢 Avatar 44x44)  Dh animation  (09 Dec)            ₹15           |  |
|  |  ---------------------------------------------------------------  |  |
|  |  (🟢 Avatar 44x44)  Harshthakur   (08 Dec)            ₹15           |  |
|  |  ---------------------------------------------------------------  |  |
|  |  (🟢 Avatar 44x44)  RAHUL         (07 Dec)            ₹15           |  |
|  |                                                                   |  |
|  |                 View all referrals  ›                             |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
+-------------------------------------------------------------------------+
| 🚀 5. FLOATING SHARE BUTTONS BAR (Height: 52dp | Bottom Pad: 78dp)     |
|                                                                         |
|  +-------------------------------+ +----------------------------------+ |
|  | 🔗 Share                      | | 💬 Share on Whatsapp              | |
|  | (Purp: #7C3AED | Weight: 1f)  | | (Green: #00E676 | Weight: 1.4f)  | |
|  +-------------------------------+ +----------------------------------+ |
+-------------------------------------------------------------------------+
| 🧭 6. CUSTOM BOTTOM NAVIGATION TAB BAR (Height: 65dp)                   |
|  [ Home ]          [ 🟢 Share ]          [ Add Cash ]       [ Profile ] |
+-------------------------------------------------------------------------+
```

---

## 🖥️ Detailed Component Layout Specifications & Dimensions

### 1. Screen Root Container (`Box` + `Column`)
- **Container Type** -> `Box` with internal `Column`
- **Background Color** -> `#15001F` (Deep Midnight Purple)
- **Total Screen Dimensions** -> `fillMaxSize` (`100% Width` x `100% Height`)

---

### 2. Top Header Navigation Row
- **Container Type** -> `Row`
- **Width / Top Padding** -> `fillMaxWidth` | `Padding Top: 45.dp`
- **Outer Padding** -> `Horizontal: 16.dp`
- **Title Text ("Refer & Earn")** -> `Font Size: 30.sp` | `Font Weight: Black` | `Color: #FFFFFF`
- **Language Selector Pill Button (`Box`)**:
  - **Background** -> `#2A083B`
  - **Border Stroke** -> `1.dp` (`#4C1D95`)
  - **Corner Radius** -> `12.dp` (`RoundedCornerShape(12.dp)`)
  - **Internal Padding** -> `Horizontal: 12.dp` | `Vertical: 6.dp`
  - **Text ("अ 💬")** -> `Font Size: 13.sp` | `Font Weight: ExtraBold` | `Color: #FFFFFF`

---

### 3. Earnings Summary Header
- **Container Type** -> `Row`
- **Width** -> `fillMaxWidth`
- **Outer Padding** -> `Horizontal: 16.dp`
- **Left Column**:
  - **Subtitle ("Your Earnings")** -> `Font Size: 13.sp` | `Font Weight: SemiBold` | `Color: #D1D5DB`
  - **Amount Text ("₹30")** -> `Font Size: 30.sp` | `Font Weight: Black` | `Color: #FFFFFF`
- **Right Coin Badge (`Image`)**:
  - **Asset** -> `R.drawable.refercoin`
  - **Height** -> `48.dp`

---

### 4. Referral Breakdown Card
- **Container Type** -> `Box` with internal `Column`
- **Width** -> `fillMaxWidth`
- **Shape / Radius** -> `RoundedCornerShape(18.dp)`
- **Background Color** -> `#220338` (Deep Dark Purple)
- **Border Stroke** -> `1.dp` (`#4C1D95`)
- **Padding** -> `16.dp`
- **Headline Row**:
  - **Text ("1 Referral = ")** -> `Font Size: 18.sp` | `Font Weight: Black` | `Color: #FFFFD700` (Gold)
  - **Text ("₹1,000")** -> `Font Size: 20.sp` | `Font Weight: Black` | `Color: #00E676` (Neon Green)
- **3-Step Flow Row**:
  - **Arrangement** -> `SpaceEvenly`
  - **Step 1 (Sign Up)**: Amount `₹15` (18sp Black White) + Subtitle `signs up` (12sp Bold) + `ic_refer_signup` (58dp x 58dp)
  - **Step 2 (Adds Cash)**: Amount `₹55` (18sp Black White) + Subtitle `adds cash ⓘ` (12sp Bold) + `ic_refer_addcash` (58dp x 58dp)
  - **Step 3 (Play Games)**: Amount `₹930` (18sp Black White) + Subtitle `play games ⓘ` (12sp Bold) + `ic_refer_playgames` (58dp x 58dp)

---

### 5. Recent Referrals List Card
- **Container Type** -> `Box` with internal `Column`
- **Width** -> `fillMaxWidth`
- **Shape / Radius** -> `RoundedCornerShape(18.dp)`
- **Background Color** -> `#220338`
- **Border Stroke** -> `1.dp` (`#4C1D95`)
- **Padding** -> `16.dp`
- **Referral Item Row**:
  - **Avatar Container** -> `Size: 44.dp x 44.dp` | `CircleShape` | `Border: 1.dp #FFFFD700`
  - **Name Text** -> `Font Size: 15.sp` | `Font Weight: ExtraBold` | `Color: #FFFFFF`
  - **Date Text** -> `Font Size: 12.sp` | `Font Weight: Medium` | `Color: #D1D5DB`
  - **Amount Text** -> `Font Size: 17.sp` | `Font Weight: Black` | `Color: #FFFFFF`
  - **Divider Line** -> `HorizontalDivider(Color: #3D105A, Thickness: 1.dp)`
- **View All Footer Text ("View all referrals ›")**:
  - `Font Size: 15.sp` | `Font Weight: ExtraBold` | `Color: #FFFFFF` | `Center Aligned`

---

### 6. Bottom Floating Action Share Buttons Bar
- **Positioning** -> `align(Alignment.BottomCenter)`
- **Offset / Padding** -> `Bottom: 78.dp` (Floats above bottom navigation bar) | `Horizontal: 16.dp`
- **Buttons Row**:
  - **Share Button**:
    - **Weight** -> `1f`
    - **Height** -> `52.dp`
    - **Background** -> `#7C3AED` (Purple)
    - **Corner Radius** -> `14.dp`
    - **Content** -> Icon `ic_nav_share` (20dp) + Text `"Share"` (16sp Black White)
  - **Share on Whatsapp Button**:
    - **Weight** -> `1.4f`
    - **Height** -> `52.dp`
    - **Background** -> `#00E676` (WhatsApp Green)
    - **Corner Radius** -> `14.dp`
    - **Content** -> Icon `ic_whatsapp` (22dp) + Text `"Share on Whatsapp"` (16sp Black White)
