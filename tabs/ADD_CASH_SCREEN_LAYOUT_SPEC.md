# 💵 Add Cash Screen Text Layout Specification & Visual Wireframe Blueprint

This document contains a complete **text-based visual ASCII mobile screen layout diagram** showing exact component placement, coordinate positioning, dimensions, paddings, font sizes, icon sizes, corner radii, animations, and color schemes for the 334Game Android Add Cash Screen (`AddCashScreen.kt`).

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
|  | Add Cash                       |       | Total Balance: ₹42.2 💳   | |
|  | (Font: 32sp Black White)       |       | (Font: 17sp Black White)  | |
|  +--------------------------------+       +---------------------------+ |
+-------------------------------------------------------------------------+
| 📜 2. SCROLLABLE CONTENT AREA (Column + ScrollState)                   |
|                                                                         |
|  You are adding (13.5sp Muted Slate)                                    |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | 💳 ENTER AMOUNT CARD (Bg: #220338 | Radius: 20dp | Border: #5B21B6)   |  |
|  |                                                                   |  |
|  |  +-------------------------------------------------------------+  |  |
|  |  |  ₹ [ 200                ]  (BasicTextField Height: 58dp)     |  |  |
|  |  |    (Purp: #6B11A3 | Rad: 16dp | Text: 22sp Black White)         |  |  |
|  |  +-------------------------------------------------------------+  |  |
|  |                                                                   |  |
|  |  🟢 %  Add amount & get Cashback (13.5sp Bold Green)              |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  ✨ Offers (17sp Black White)                                           |
|                                                                         |
|  +-----------------------------+     +-----------------------------+    |
|  | ₹200                    +   |     | ₹500                    +   |    |
|  | ₹25 Cashback                |     | ₹75 Cashback                |    |
|  | (OfferCard Height: 88dp)    |     | (OfferCard Height: 88dp)    |    |
|  +-----------------------------+     +-----------------------------+    |
|  +-----------------------------+     +-----------------------------+    |
|  | ₹50                     +   |     | ₹100                    +   |    |
|  | ₹4 Cashback                 |     | ₹10 Cashback                |    |
|  +-----------------------------+     +-----------------------------+    |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | 🚀 ADD CASH CTA BUTTON (Height: 54dp | Radius: 14dp)                |  |
|  |  ADD ₹200  (Font: 16sp Black | Bg: #00E676 Green / #2C0B42 Muted)   |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
| 🧭 3. CUSTOM BOTTOM NAVIGATION TAB BAR (Height: 65dp)                   |
|  [ Home ]          [ Share ]          [ 🟢 Add Cash ]    [ Profile ] |
+-------------------------------------------------------------------------+
```

---

## 🖥️ Detailed Component Layout Specifications & Dimensions

### 1. Screen Root Container (`Column`)
- **Container Type** -> `Column`
- **Background Color** -> `#13001C` (Deep Midnight Purple)
- **Total Screen Dimensions** -> `fillMaxSize` (`100% Width` x `100% Height`)
- **Scroll State** -> `verticalScroll(rememberScrollState())`
- **Padding** -> `Horizontal: 16.dp` | `Vertical Gap: 16.dp`

---

### 2. Top Header Navigation & Balance Row
- **Container Type** -> `Row`
- **Width / Padding** -> `fillMaxWidth` | `Padding Top: 45.dp`
- **Title Text ("Add Cash")** -> `Font Size: 32.sp` | `Font Weight: Black` | `Color: #FFFFFF`
- **Right Balance Info (`Column`)**:
  - **Label ("Total Balance")** -> `Font Size: 12.sp` | `Font Weight: Medium` | `Color: #9CA3AF`
  - **Balance Row** -> Amount `₹42.2` (`17.sp ExtraBold White`) + Wallet Icon `ic_wallet` (`18.dp`)

---

### 3. Enter Amount Input Card
- **Container Type** -> `Box` with internal `Column`
- **Width** -> `fillMaxWidth`
- **Corner Radius** -> `20.dp` (`RoundedCornerShape(20.dp)`)
- **Background Color** -> `#220338`
- **Border Stroke** -> `1.dp` (`#5B21B6`)
- **Padding** -> `16.dp`
- **Interactive Purple Input TextField Box (`Box`)**:
  - **Height** -> `58.dp`
  - **Corner Radius** -> `16.dp`
  - **Background** -> `#6B11A3` (Bright Purple)
  - **Content Alignment** -> `CenterStart`
  - **Prefix Symbol ("₹ ")** -> `Font Size: 22.sp` | `Font Weight: Black` | `Color: #FFFFFF`
  - **BasicTextField**:
    - **Font Size** -> `22.sp` | `Font Weight: Black` | `Color: #FFFFFF`
    - **Cursor Brush** -> `SolidColor(#38BDF8)` (Cyan Glow Cursor)
    - **Keyboard Type** -> `KeyboardType.Number`
    - **Placeholder Text ("Enter Amount")** -> `22.sp Bold` | `Color: White 50% Opacity`
- **Cashback Offer Tag Line**:
  - **Icon Badge** -> `22.dp x 22.dp` Circle | `Background: #00E676` | Text `"%"`
  - **Tag Text** -> `"Add amount & get "` (`White 13.5sp`) + `"Cashback"` (`#00E676 Green 13.5sp Black`)

---

### 4. Dynamic Offers Grid Section
- **Header Row** -> Text `"Offers"` (`17.sp Black White`) + Emoji `"✨"`
- **Offers Grid Structure** -> 2-Column Row Grid
- **Offer Card Component (`OfferCard`)**:
  - **Height** -> `88.dp`
  - **Corner Radius** -> `16.dp`
  - **Background** -> Selected: `#7A14B8` (Vibrant Purple) | Default: `#5B0892`
  - **Border Stroke** -> Selected: `2.dp #00E676` | Default: `1.dp #7C3AED`
  - **Padding** -> `14.dp`
  - **Top Row** -> Amount `₹200` (`22.sp Black White`) + Plus Sign `"+"` (`22.sp Black White`)
  - **Bottom Subtitle** -> Cashback text `"₹25 Cashback"` (`14.sp ExtraBold #00E676`)

---

### 5. Deposit Action CTA Button
- **Height** -> `54.dp`
- **Corner Radius** -> `14.dp`
- **Background** -> Valid Amount: `#00E676` (Neon Green) | Empty Amount: `#2C0B42` (Dark Purple)
- **Text ("ADD ₹200" / "ADD CASH")**:
  - **Font Size** -> `16.sp` | `Font Weight: Black` | `Letter Spacing: 0.5.sp`
  - **Color** -> Valid Amount: `#FFFFFF` | Empty Amount: `#8B5CF6`
