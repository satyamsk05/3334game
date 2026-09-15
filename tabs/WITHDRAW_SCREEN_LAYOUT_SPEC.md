# 💸 Withdraw & Withdraw Details Screen Text Layout Specification & Visual Wireframe Blueprint

This document contains a complete **text-based visual ASCII mobile screen layout diagram** showing exact component placement, coordinate positioning, dimensions, paddings, font sizes, icon sizes, corner radii, animations, and color schemes for the 334Game Android Withdraw Screen (`WithdrawScreen.kt`) and Withdrawal Payment Details Screen (`WithdrawDetailsScreen.kt`).

---

## 📱 Visual ASCII Mobile Screen Wireframe Diagram

### Part 1: Withdraw Screen (`WithdrawScreen.kt`)

```text
+-------------------------------------------------------------------------+
| 📱 MOBILE VIEWPORT (Width: 360dp | Height: 800dp | Aspect Ratio: 20:9)  |
+-------------------------------------------------------------------------+
| [System Status Bar Inset: 24dp]                                         |
+-------------------------------------------------------------------------+
| 🔝 1. TOP NAVIGATION HEADER ROW (Padding Top: 45dp)                    |
|  ← (Back Button Circle: 40x40)    Withdrawal (28sp Black White)          |
+-------------------------------------------------------------------------+
| 💰 2. WINNINGS BALANCE HEADER ROW                                      |
|  Winnings Balance (13sp Muted)                                          |
|  ₹34.2 (32sp Black White)                                               |
+-------------------------------------------------------------------------+
| 📜 3. ENTER AMOUNT CARD (Bg: #220338 | Radius: 20dp | Border: #5B21B6)    |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | ₹ [ 34.2                 ]  (BasicTextField Height: 58dp)       |  |
|  |   (Purple: #6B11A3 | Rad: 16dp | Text: 24sp Black White)           |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  Min ₹100 - Max ₹10,000 / day (12.5sp Muted Gray)                       |
+-------------------------------------------------------------------------+
| ⚡ 4. QUICK AMOUNT SELECTION PILLS ROW                                  |
|  +--------+  +--------+  +--------+  +--------+                         |
|  | ₹100   |  | ₹200   |  | ₹500   |  | ₹1,000 |                         |
|  +--------+  +--------+  +--------+  +--------+                         |
+-------------------------------------------------------------------------+
| 🚀 5. NEXT ACTION CTA BUTTON (Height: 54dp | Radius: 14dp)              |
|  NEXT ► (Font: 16sp Black White | Background: #6366F1 Indigo)           |
+-------------------------------------------------------------------------+
```

---

### Part 2: Withdraw Details Payment Screen (`WithdrawDetailsScreen.kt`)

```text
+-------------------------------------------------------------------------+
| 📱 MOBILE VIEWPORT (Width: 360dp | Height: 800dp | Aspect Ratio: 20:9)  |
+-------------------------------------------------------------------------+
| 🔝 1. TOP HEADER (Padding Top: 45dp)                                    |
|  ← (Back Circle)                  Select Payment Method                 |
+-------------------------------------------------------------------------+
| 💳 2. PAYMENT METHODS LIST CARD (Bg: #220338 | Radius: 20dp)            |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  | 🟢  UPI / GPay / PhonePe / Paytm                           (RadioButton)|
|  | ----------------------------------------------------------------- |  |
|  | 🏦  Bank Transfer (IMPS / NEFT)                             (RadioButton)|
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
| 📝 3. ACCOUNT DETAILS INPUT CARD                                        |
|  Enter UPI ID / VPA or Bank Account Number                              |
|  +-------------------------------------------------------------------+  |
|  |  [ user@upi                     ] (Height: 52dp | Bg: #2B0845)   |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
| 🚀 4. CONFIRM WITHDRAWAL BUTTON                                         |
|  WITHDRAW ₹34.2 NOW  (Height: 54dp | Bg: #00E676 Green)                 |
+-------------------------------------------------------------------------+
```

---

## 🖥️ Detailed Component Layout Specifications & Dimensions

### 1. Withdraw Screen Specifications (`WithdrawScreen.kt`)
- **Root Container** -> `Column` | `Background: #13001C` | `Padding H: 16.dp`
- **Top Header Bar**:
  - Back Button: `40.dp x 40.dp` Circle Box | `Background: #25083B` | `Border: 1.dp #4C1D95` | Icon `ic_arrow_back`
  - Title Text: `"Withdrawal"` | `Font Size: 28.sp` | `Font Weight: Black` | `Color: #FFFFFF`
- **Winnings Header**:
  - Subtitle: `"Winnings Balance"` (`13.sp Medium #9CA3AF`)
  - Balance Amount: `"₹34.2"` (`32.sp Black #FFFFFF`)
- **Amount Input Card**:
  - Container: `Background: #220338` | `Border: 1.dp #5B21B6` | `Radius: 20.dp` | `Pad: 16.dp`
  - Input Box: `Height: 58.dp` | `Background: #6B11A3` | `Radius: 16.dp` | Prefix `"₹ "` + `BasicTextField` (`24.sp Black White`)
- **Quick Amount Selector Pills**:
  - Quick values: `listOf("100", "200", "500", "1000")`
  - Pill Box: `Height: 40.dp` | `Background: #2A0840` | `Border: 1.dp #6B21A8` | `Radius: 12.dp`
- **Next Action Button**:
  - `Height: 54.dp` | `Corner Radius: 14.dp` | `Background: #6366F1` | `Text: NEXT ►` (`16.sp Black White`)

---

### 2. Withdraw Details Payment Screen Specifications (`WithdrawDetailsScreen.kt`)
- **Root Container** -> `Column` | `Background: #13001C` | `Padding H: 16.dp`
- **Payment Method Options**:
  - **UPI Option**: Icon UPI/GPay + Label `"UPI (Instant)"` + Radio Button Indicator
  - **Bank Transfer Option**: Icon Bank + Label `"Bank Transfer (IMPS)"` + Radio Button Indicator
- **Account Details Input Field**:
  - Box Container: `Height: 52.dp` | `Background: #2B0845` | `Border: 1.dp #6B21A8` | `Radius: 14.dp`
  - Text Field: `BasicTextField` for UPI VPA or Bank Account Number input
- **Confirm CTA Button**:
  - `Height: 54.dp` | `Corner Radius: 14.dp` | `Background: #00E676` | Text `"WITHDRAW ₹34.2 NOW"` (`16.sp Black White`)
