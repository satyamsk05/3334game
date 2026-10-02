# Comprehensive Design, UI/UX & Accessibility Audit Report
**Project:** Bit Arcade Game — Authoritative Admin Portal (`bitarcade-admin-panel`)  
**Framework:** Next.js 14 (App Router) + Tailwind CSS 3.4 + Lucide React + TypeScript  
**Audit Conducted by:** Senior Frontend Engineer & Lead UI/UX Designer  
**Scope:** Complete `src/` tree (22 routes + all shared UI components, layouts, charts, styles)

---

## 1. Executive Summary & Critical Root Causes

### 1.1 Root Defect P1: Tailwind Spacing Override Distortion
In `tailwind.config.js`, `theme.extend.spacing` forcibly overrode core Tailwind spacing multipliers:
- `'3': '7.5px'`, `'4': '8px'`, `'5': '10px'`, `'6': '12px'`, `'7': '14px'`, `'8': '15px'`, `'9': '18px'`, `'10': '20px'`, `'12': '24px'`, `'16': '32px'`.
- **Destructive Impact:** In standard Tailwind, `h-4 w-4` is 16px (the universal icon size). Here, it became **8px**! In contrast, `h-3.5` (which fell back to standard 14px) was *larger* than `h-4` (8px). Buttons using `h-8` were 15px tall instead of 32px; `h-9` was 18px instead of 36px; padding and gaps were warped and compressed across the entire interface.
- **Remediation Strategy:** Completely strip `theme.extend.spacing` to restore the native 4px-based geometric scale (1 = 4px, 2 = 8px, 3 = 12px, 4 = 16px, 5 = 20px, 6 = 24px, 8 = 32px, etc.). Adjust every component, container, avatar, and modal to fit clean 4px/8px rhythm.

### 1.2 Root Defect P2: Typography Scale Collapse & Illegible Micro-Sizes
- Arbitrary micro-typography scattered across 17+ pages:
  - `text-[8px]`: 1 instance
  - `text-[9px]`: 11 instances (e.g. keyboard shortcuts, tags)
  - `text-[10px]`: 70 instances (table headers, badges, metadata)
  - `text-[11px]`: 84 instances (sidebar links, sub-labels, statuses)
  - `text-[13px]`: 1 instance
- Sub-12px text violates basic readability and WCAG AA legibility standards.
- `tailwind.config.js` and `globals.css` defined anti-hierarchical sizes:
  - `xs: 13.13px`, `sm: 13.5px`, `base: 15px`, `lg: 15px` (no difference between base and lg!).
- **Remediation Strategy:** Strict minimum font size of **12px (`text-xs`)**. Standardize scale:
  - `text-xs`: 12px / line-height 16px (badges, captions, uppercase table headers)
  - `text-sm`: 14px / line-height 20px (standard body, inputs, buttons, table cell content, nav links)
  - `text-base`: 16px / line-height 24px (lead text, section subtitles, dialog titles)
  - `text-lg`: 18px / line-height 28px (card titles, secondary headings)
  - `text-xl`: 20px / line-height 28px (panel titles, modal headers)
  - `text-2xl`: 24px / line-height 32px (page titles, prominent stat values)
  - `text-3xl`: 30px / line-height 36px (hero metric counters)
  - Load `Inter` via `next/font/google` with font weights 400, 500, 600, 700 to eliminate FOIT and remove remote render-blocking `@import`.

### 1.3 Root Defect P3: WCAG AA Contrast Failures & Broken Dark Mode
- `--text-tertiary` was defined as `#94a3b8` on light background (`#f8f9fa`), yielding **2.56:1 contrast ratio**, heavily failing WCAG AA (4.5:1 required).
- In dark mode, `--text-tertiary` was `#64748b` on `#121216`, yielding **3.93:1** (failing WCAG AA).
- Over 280+ instances of hardcoded classes:
  - `text-gray-400`, `text-gray-300`, `bg-gray-50`, `border-gray-200`, `bg-white`, `bg-[#f9fafb]`.
  - In dark mode, `bg-white` created harsh, un-themed glaring white cards and modals (e.g. `Modal.tsx`, `system/settings/page.tsx`, `transactions/ledger/page.tsx`, `users/page.tsx`).
  - `text-gray-400` becomes near-invisible on dark cards and fails AA contrast on light backgrounds.
- **Remediation Strategy:**
  - Update `--text-tertiary`: Light `#64748b` (4.68:1 AA pass), Dark `#94a3b8` (5.8:1 AA pass).
  - Migrate all hardcoded `text-gray-*`, `bg-gray-*`, `border-gray-*`, `bg-white` to semantic tokens (`text-text-primary`, `text-text-secondary`, `text-text-tertiary`, `bg-surface-base`, `bg-surface-raised`, `bg-surface-strong`, `border-border-default`, `border-border-subtle`).
  - Ensure status badges use accessible alpha contrasts (e.g. `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`).

### 1.4 Root Defect P4: Component & Accessibility Defects
- **Buttons (`Button.tsx`):**
  - Heights broken by spacing override: `h-8` was 15px, `h-9` was 18px.
  - Icon-only buttons lacked square aspect ratio and accessible touch targets (failed 40x40px target size).
  - Missing distinct `icon-only` variant and aria labels.
- **Modals (`Modal.tsx`):**
  - Completely lacked dark mode support (`bg-white`, `text-gray-900`, `border-gray-100`).
  - Close button was `h-8 w-8 !p-0` with `text-gray-400` (inaccessible contrast & undersized).
- **Sidebar (`Sidebar.tsx`):**
  - Collapsed state (`w-[68px]`) had truncated visual context without tooltips.
  - Micro-icons (`h-2`, `h-3`, `h-4` rendered at 6px, 7.5px, 8px).
- **Inputs & Controls:**
  - Inconsistent heights across pages (`h-7`, `h-8`, `py-1`, `py-1.5`), lack of unified focus rings.
- **Tables:**
  - Missing responsive horizontal wrappers (`overflow-x-auto`) in several sections, leading to clipping on 768px-1024px screens.
  - Inconsistent row heights (34px - 44px) instead of ergonomic 52-56px min-height.

---

## 2. Global Design Token Specifications (Step 2 Target System)

| Token Category | Old Broken Configuration | New Standardized Specification |
| :--- | :--- | :--- |
| **Spacing Scale** | Overridden: 3=7.5px, 4=8px, 8=15px, 10=20px, 16=32px | Default Tailwind 4px Scale: 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px |
| **Typography Scale** | xs: 13.13px, sm: 13.5px, md: 14px, base: 15px, lg: 15px, xl: 16px | xs: 12px/16px, sm: 14px/20px, base: 16px/24px, lg: 18px/28px, xl: 20px/28px, 2xl: 24px/32px, 3xl: 30px/36px |
| **Font Family** | External render-blocking Google Fonts `@import` | `next/font/google` Inter font loader (weights 400, 500, 600, 700) with zero CLS |
| **Text Tertiary (Light)** | `#94a3b8` (Contrast 2.56:1 - FAIL) | `#64748b` (Contrast 4.68:1 - PASS WCAG AA) |
| **Text Tertiary (Dark)** | `#64748b` (Contrast 3.93:1 - FAIL) | `#94a3b8` (Contrast 5.82:1 - PASS WCAG AA) |
| **Icon Sizes** | `h-2`, `h-3`, `h-3.5`, `h-4` (rendered 6px - 8px) | Sidebar/Nav: 20px (`h-5 w-5`), Tables: 18px, Buttons: 16px (`h-4 w-4`), Stat cards: 22-24px, Chevrons: 16px |
| **Button Heights** | sm=15px, md=18px, lg=20px | sm=32px (`h-8`), md=40px (`h-10`), lg=44px (`h-11`), Icon-only: 40x40px min hit area |
| **Input Heights** | Inconsistent (28px - 34px) | Uniform 40px (`h-10`), `px-3`, `text-sm`, `rounded-lg`, visible focus ring |
| **Table Rows** | Variable compressed 32px-40px | Min height 52px-56px, `px-4` to `px-6` cell padding, sticky header capability, overflow-x wrapper |
| **Border Radius** | Mixed `rounded-3xl`, `rounded-2xl`, `rounded-xl` | Unified: Inputs & Buttons `rounded-lg` (8px), Cards & Panels `rounded-xl` (12px), Modals `rounded-2xl` (16px) |

---

## 3. Systematic File-by-File Audit & Remediation Log

###  (11 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L71 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L144 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L148 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L152 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L156 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L160 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L164 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L212 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L216 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L220 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L224 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |

###  (24 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L119 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L119 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L144 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L144 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L190 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L192 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L195 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L197 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L200 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L202 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L205 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L209 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L229 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L233 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L237 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L241 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L264 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L268 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L272 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L276 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L311 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L324 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L346 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L346 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |

###  (6 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L93 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L114 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L114 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L156 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L202 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L202 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |

###  (3 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L104 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L105 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L105 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |

###  (51 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L204 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L208 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L217 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L217 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L221 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L230 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L230 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L240 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L240 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L245 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L255 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L271 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L274 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L278 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L282 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L316 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L323 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L324 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L324 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L346 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L351 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-950 | bg-gray-950 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L351 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-800 | border-gray-800 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L355 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-900 | bg-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L355 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-800 | border-gray-800 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L355 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L355 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L362 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L362 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L364 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L366 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class border-gray-400 | border-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L366 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class bg-gray-400 | bg-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L366 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L373 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L377 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-900 | bg-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L382 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L387 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L387 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L395 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L395 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-200 | text-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L401 | Typography | **High** | Arbitrary font size text-[9px] | Uses text-[9px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L401 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L403 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L403 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L410 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L410 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L412 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L430 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L450 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L461 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L461 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L464 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |

###  (48 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L171 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L190 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L190 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L206 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L206 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L226 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L226 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L250 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L262 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L282 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L294 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L315 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L322 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L331 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L354 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L355 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L355 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L360 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L386 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L386 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L390 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L390 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L406 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L410 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L414 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L429 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L441 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L441 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L446 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L452 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L461 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L461 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L466 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L472 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L481 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L481 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L486 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L492 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L503 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L503 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L530 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L530 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L573 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L580 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L580 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L582 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L582 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L591 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |

###  (16 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L106 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L116 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L126 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L161 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L191 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L191 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L191 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L191 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L211 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L211 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L211 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L211 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L242 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L242 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L252 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L252 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |

###  (23 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L125 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L134 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L138 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L147 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L151 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L160 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L164 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L173 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L202 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L232 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L232 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L232 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L232 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L251 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L251 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L251 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L251 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L281 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L281 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L292 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L292 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L302 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L302 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |

###  (75 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L234 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L234 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L236 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L236 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L288 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L288 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L311 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L311 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L323 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L323 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L337 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L364 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L368 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L371 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L371 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L382 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L394 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L398 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L398 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L398 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L400 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L400 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L400 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L443 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L451 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L454 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L463 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L471 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L483 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L492 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L508 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-950 | bg-gray-950 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L519 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L612 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L623 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L635 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L643 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L647 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L647 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L656 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L663 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L667 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L674 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L705 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L705 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L712 | Color/Dark Mode | **Med** | Hardcoded Hex color bg-[#0A0614] | bg-[#0A0614] bypasses semantic theme tokens and lacks dark mode adaptation | Replace with semantic CSS/Tailwind token |
| L712 | Color/Dark Mode | **Med** | Hardcoded Hex color border-[#2A2045] | border-[#2A2045] bypasses semantic theme tokens and lacks dark mode adaptation | Replace with semantic CSS/Tailwind token |
| L716 | Typography | **High** | Arbitrary font size text-[9px] | Uses text-[9px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L717 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L719 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L719 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L726 | Typography | **High** | Arbitrary font size text-[9px] | Uses text-[9px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L729 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L732 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L732 | Color/Dark Mode | **Med** | Hardcoded Hex color bg-[#1E1634] | bg-[#1E1634] bypasses semantic theme tokens and lacks dark mode adaptation | Replace with semantic CSS/Tailwind token |
| L739 | Typography | **High** | Arbitrary font size text-[9px] | Uses text-[9px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L750 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L754 | Typography | **High** | Arbitrary font size text-[9px] | Uses text-[9px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L757 | Typography | **High** | Arbitrary font size text-[9px] | Uses text-[9px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L757 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L768 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L780 | Typography | **High** | Arbitrary font size text-[9px] | Uses text-[9px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L783 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L783 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L783 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L785 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L785 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L785 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L793 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L794 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L800 | Typography | **High** | Arbitrary font size text-[9px] | Uses text-[9px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L802 | Color/Dark Mode | **Med** | Hardcoded Hex color bg-[#1E1634] | bg-[#1E1634] bypasses semantic theme tokens and lacks dark mode adaptation | Replace with semantic CSS/Tailwind token |
| L804 | Typography | **High** | Arbitrary font size text-[9px] | Uses text-[9px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L806 | Color/Dark Mode | **Med** | Hardcoded Hex color bg-[#1E1634] | bg-[#1E1634] bypasses semantic theme tokens and lacks dark mode adaptation | Replace with semantic CSS/Tailwind token |
| L808 | Typography | **High** | Arbitrary font size text-[9px] | Uses text-[9px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L814 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |

###  (4 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L105 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L105 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L162 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L162 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |

###  (5 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L121 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L121 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L136 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L239 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L239 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |

###  (10 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L82 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L82 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L120 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L120 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L129 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L164 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L164 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L164 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L164 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L182 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |

###  (8 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L103 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L103 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L122 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L137 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L145 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L145 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L149 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L149 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |

###  (11 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L163 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L163 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L170 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L174 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L178 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L182 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L197 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L197 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L217 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L217 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L231 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |

###  (6 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L212 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L222 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L222 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L285 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L285 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L298 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |

###  (5 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L90 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L90 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L172 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L178 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L182 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |

###  (254 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L340 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L343 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L346 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L351 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-100 | bg-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L351 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L356 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L361 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L361 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L361 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L362 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L362 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L362 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L365 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L379 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L380 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L388 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L388 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L388 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L410 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L412 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L413 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L419 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-600 | text-gray-600 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L428 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L428 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L428 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L437 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L437 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L446 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L448 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L449 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L456 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-600 | text-gray-600 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L462 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L462 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L462 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L466 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-600 | text-gray-600 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L472 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L472 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L472 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L487 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L487 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L495 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L497 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L498 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L506 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-600 | text-gray-600 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L523 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L525 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L526 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L534 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-600 | text-gray-600 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L560 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L566 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L574 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L574 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L574 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L588 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L595 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L599 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L606 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L607 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-800 | text-gray-800 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L612 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L617 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L621 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L625 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L630 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L634 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L639 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L639 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L642 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L642 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L643 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L648 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L648 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L649 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L652 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L652 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L653 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L668 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L671 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L678 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L678 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L689 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L691 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-600 | text-gray-600 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L692 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L692 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L692 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L692 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L705 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L712 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L724 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-100 | bg-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L724 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L724 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L727 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L734 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L735 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L735 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L740 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L752 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L755 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L761 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L761 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L763 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L763 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L763 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L763 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L767 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L792 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-900 | bg-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L793 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L793 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L794 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L797 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L799 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L801 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L801 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L809 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L809 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L816 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L822 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L822 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L822 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L827 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L833 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L833 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L833 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L838 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L842 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L842 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L842 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L852 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L886 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L889 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L897 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L897 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L897 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L903 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L903 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L910 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L910 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L910 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L910 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L919 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L919 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L919 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L919 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L927 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L927 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L933 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L935 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-600 | text-gray-600 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L936 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L936 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L936 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L936 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L949 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L956 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L966 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-100 | bg-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L966 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-800 | text-gray-800 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L966 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L969 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L970 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L973 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L979 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L979 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L982 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L982 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L982 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L982 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L987 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L991 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-800 | text-gray-800 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L992 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-100 | bg-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L992 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L996 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1000 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L1004 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1004 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1008 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L1008 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1022 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-900 | bg-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L1023 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L1023 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L1024 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L1025 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1026 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L1028 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1028 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1034 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-900 | bg-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L1062 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1063 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1068 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1068 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1070 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1070 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1075 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1075 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1084 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1085 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1089 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1091 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1094 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1101 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1105 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L1110 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1111 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L1111 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1114 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1119 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L1124 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1125 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L1125 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1128 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1143 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1146 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1152 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1155 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1161 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L1161 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1161 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1161 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L1188 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L1195 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1200 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1211 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1211 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1217 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L1217 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L1218 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L1218 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1219 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1221 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L1221 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L1222 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L1222 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1223 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1225 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L1225 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L1226 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L1226 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1229 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L1229 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L1230 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L1230 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1231 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1238 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1255 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L1255 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1255 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1255 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L1265 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1265 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1272 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L1273 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1275 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1278 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L1278 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L1279 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L1279 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L1283 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-800 | text-gray-800 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |

###  (62 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L133 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L136 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L151 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L152 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L153 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L156 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L157 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L158 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L161 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L166 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L167 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L168 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L175 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L175 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L176 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L182 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L182 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L193 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L193 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L193 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L216 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L216 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L216 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L230 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L230 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L239 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-600 | text-gray-600 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L240 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L240 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L240 | Color/Dark Mode | **Med** | Hardcoded Hex color bg-[#f9fafb] | bg-[#f9fafb] bypasses semantic theme tokens and lacks dark mode adaptation | Replace with semantic CSS/Tailwind token |
| L256 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L263 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L275 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L276 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L279 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L282 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L282 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L286 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L286 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L288 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L288 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L294 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L300 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L300 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L300 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L308 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L313 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L318 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L322 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L326 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L330 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L342 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L342 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L342 | Color/Dark Mode | **Med** | Hardcoded Hex color bg-[#f9fafb] | bg-[#f9fafb] bypasses semantic theme tokens and lacks dark mode adaptation | Replace with semantic CSS/Tailwind token |
| L347 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L351 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L351 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L351 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L355 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L358 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L362 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L362 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L362 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |

###  (102 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L282 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L282 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L343 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L344 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L344 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L345 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L345 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L352 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L352 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L356 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L357 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L360 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L364 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L364 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L372 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L374 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L375 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L378 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L383 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L383 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L385 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L385 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L393 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L393 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L393 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L395 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L401 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L404 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L409 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L409 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L411 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L411 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L421 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L421 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L436 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L436 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L445 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L445 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L454 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L454 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L454 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L454 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L465 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L471 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L478 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L478 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L478 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L479 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L479 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L479 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L482 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L485 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L485 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-100 | bg-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L485 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-600 | text-gray-600 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L503 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L504 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L505 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L508 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L509 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L510 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L513 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L515 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L518 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L522 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L529 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L534 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L534 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L541 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L542 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L545 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L546 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L549 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L551 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L561 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L561 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L567 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L568 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-800 | text-gray-800 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L571 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L577 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L578 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-800 | text-gray-800 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L727 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L731 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L735 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L739 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L834 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L855 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L892 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L896 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L900 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L904 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L908 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L912 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L922 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L925 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L1010 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1010 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1088 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1088 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1097 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L1108 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L1193 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L1193 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |

###  (63 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L126 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L129 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L136 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L136 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-600 | text-gray-600 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L136 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L138 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L147 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-900 | bg-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L148 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L148 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L157 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L163 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L163 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-800 | text-gray-800 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L163 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L163 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L176 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L176 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L192 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-600 | text-gray-600 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L193 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L193 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L193 | Color/Dark Mode | **Med** | Hardcoded Hex color bg-[#f9fafb] | bg-[#f9fafb] bypasses semantic theme tokens and lacks dark mode adaptation | Replace with semantic CSS/Tailwind token |
| L209 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L216 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L231 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L236 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L239 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L239 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L239 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L241 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L241 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L243 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L246 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L250 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L250 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L252 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L252 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L259 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L271 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L279 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L283 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L287 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L298 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L310 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L310 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L312 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L312 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L314 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L314 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L328 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L328 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L328 | Color/Dark Mode | **Med** | Hardcoded Hex color bg-[#f9fafb] | bg-[#f9fafb] bypasses semantic theme tokens and lacks dark mode adaptation | Replace with semantic CSS/Tailwind token |
| L333 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L337 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L337 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L337 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L341 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L344 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L348 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L348 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-50 | bg-gray-50 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L348 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L372 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L378 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-200 | border-gray-200 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L378 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L383 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |

###  (2 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L53 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L57 | Typography | **High** | Arbitrary font size text-[8px] | Uses text-[8px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |

###  (1 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L131 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |

###  (4 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L111 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L111 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L123 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L123 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |

###  (14 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L81 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L97 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L97 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L100 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L100 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L116 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L116 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L130 | Typography | **High** | Arbitrary font size text-[9px] | Uses text-[9px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L131 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L131 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L141 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L141 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L154 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L154 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |

###  (39 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L126 | Typography | **Med** | Arbitrary font size text-[13px] | Uses text-[13px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L130 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L171 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L174 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L177 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L177 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L177 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L177 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L222 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L222 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L222 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L222 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L233 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L239 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L239 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L245 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L253 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L278 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L300 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L352 | Typography | **High** | Arbitrary font size text-[10px] | Uses text-[10px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L379 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L382 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L385 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L385 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L385 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L385 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L415 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L459 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L462 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L465 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L465 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L465 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L465 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L508 | Icon/Spacing Scale | **High** | Micro-dimension class h-2 | Micro class h-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L508 | Icon/Spacing Scale | **High** | Micro-dimension class w-2 | Micro class w-2 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L516 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |
| L523 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L530 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L530 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |

###  (1 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L31 | Typography | **High** | Arbitrary font size text-[11px] | Uses text-[11px] which violates minimum font size requirement (min 12px/text-xs) | Replace with semantic text-xs (12px) or text-sm (14px) |

###  (3 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L53 | Accessibility | **High** | Button potentially missing aria-label | Interactive button without accessible label | Add descriptive aria-label |
| L59 | Icon/Spacing Scale | **High** | Micro-dimension class h-3 | Micro class h-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |
| L59 | Icon/Spacing Scale | **High** | Micro-dimension class w-3 | Micro class w-3 created illegibly tiny elements under modified scale (or awkward sizing once scale is restored) | Standardize to standard icon sizes (16px/h-4 w-4, 18px, 20px/h-5 w-5) |

###  (9 issues detected)

| Line | Category | Priority | Issue Description | Root Cause / Impact | Exact Remediation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L58 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-900 | bg-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L64 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class border-gray-100 | border-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (border-text-secondary, border-surface-raised, border-border-default) |
| L64 | Color/Dark Mode | **High** | Hardcoded bg-white | bg-white stays blindingly bright in dark mode | Replace with bg-surface-raised or bg-surface-base |
| L68 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-900 | text-gray-900 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L72 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-500 | text-gray-500 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L80 | Color/Dark Mode | **High** | Hardcoded Tailwind gray class text-gray-400 | text-gray-400 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L80 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |
| L80 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class bg-gray-100 | bg-gray-100 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (bg-text-secondary, bg-surface-raised, bg-border-default) |
| L86 | Color/Dark Mode | **Med** | Hardcoded Tailwind gray class text-gray-700 | text-gray-700 breaks dark mode and fails WCAG AA contrast (e.g. text-gray-400 on light/dark) | Replace with semantic token (text-text-secondary, text-surface-raised, text-border-default) |

---

## 4. Specific UX & Edge Case Analysis

### 4.1 Collapsed Sidebar UX (`Sidebar.tsx`)
- **Issue:** When `collapsed` is true (`w-[68px]`), labels are hidden, but child submenus (like Games) previously tried to open or collapse without visual feedback, and tooltip hovers were bare HTML `title` strings which screen readers and mobile touch devices ignore.
- **Fix:** Provide accessible tooltips, ensure icons remain centered with `h-5 w-5` (20px) visual clarity, and enlarge toggle buttons from `h-7 w-7` (14px) to ergonomic `h-9 w-9` (36px) or `h-10 w-10` (40px) hit areas.

### 4.2 Modal Sizing, Contrast & Dark Mode (`Modal.tsx`)
- **Issue:** In dark mode, `Modal.tsx` renders `bg-white` with `text-gray-900`, causing an immediate contrast and theme rupture. The backdrop was `bg-gray-900/30` with no theme styling.
- **Fix:** Replace `bg-white` with `bg-surface-raised`, `text-gray-900` with `text-text-primary`, `text-gray-500` with `text-text-tertiary`, add `border-border-default`, and enlarge close button to `h-9 w-9` or `h-10 w-10` with accessible `aria-label="Close dialog"`.

### 4.3 Form Inputs & Filters
- **Issue:** Pages like `system/settings/page.tsx`, `users/page.tsx`, and `transactions/ledger/page.tsx` contained hardcoded input elements styled with `bg-white border-gray-200 text-gray-900`.
- **Fix:** Standardize on semantic tokens: `h-10 px-3.5 text-sm rounded-lg bg-surface-strong/60 border border-border-default text-text-primary placeholder:text-text-tertiary focus:bg-surface-raised focus:border-border-focus focus:ring-1 focus:ring-border-focus transition-all`.

### 4.4 Table Responsive Overflow
- **Issue:** `users/page.tsx`, `transactions/ledger/page.tsx`, and `payments/deposits/page.tsx` tables had rich data columns that clipped and caused page-level horizontal overflow on tablet/mobile screens (768px-1024px).
- **Fix:** Wrap all tables in `overflow-x-auto w-full scrollbar-thin` containers, enforce `min-w-[700px]` or `min-w-[900px]` where appropriate, and keep sticky header alignment intact.

---

## 5. Remediation Execution Plan (Step 2)

1. **Phase A: Design Tokens & Foundation**
   - Clean up `tailwind.config.js` (remove `spacing` override, install standardized `fontSize` scale).
   - Clean up `src/app/globals.css` (sync font size tokens, update `--text-tertiary` contrast to WCAG AA, update body styling).
   - Configure `next/font/google` in `src/app/layout.tsx` and eliminate Google Font `@import` from `globals.css`.

2. **Phase B: Core UI Components**
   - Refactor `src/components/ui/Button.tsx` (standardize sm/md/lg heights to 32px, 40px, 44px, add icon-only support, fix Loader icon).
   - Refactor `src/components/ui/Modal.tsx` (dark mode semantic tokens, 40px hit area close button, accessible escape handling).
   - Refactor `src/components/ui/Badge.tsx` (enforce min 12px `text-xs`, fix contrast and padding).
   - Refactor `src/components/ui/Card.tsx` (clean border radius, semantic shadow and border).
   - Refactor `src/components/layout/Sidebar.tsx` & `src/components/layout/AppShell.tsx` (icon sizing, hit targets, tooltips, search bar, breadcrumb).

3. **Phase C: Page-by-Page Migration (Colors, Typography, Icons, Tables)**
   - Group 1: Auth & Overview (`login`, `page.tsx` Dashboard, `analytics`, `reports`)
   - Group 2: Users & Profiles (`users/page.tsx`, `users/[id]/page.tsx`, `support/page.tsx`)
   - Group 3: Financial & Transactions (`payments/deposits`, `payments/withdrawals`, `transactions/ledger`)
   - Group 4: Games Engine (`games/page.tsx`, `games/[id]/page.tsx`)
   - Group 5: Growth & Engagement (`promotions/page.tsx`, `notifications/page.tsx`)
   - Group 6: Security & System (`security/admins`, `security/roles`, `security/audit-logs`, `system/settings`, `system/health`, `system/announcements`)

4. **Phase D: Quality Assurance & Build Verification**
   - Run `npm run build` and `npx tsc --noEmit` to verify zero TypeScript and Next.js compiler errors.
   - Run verification scripts: zero `text-[8/9/10/11px]`, zero `text-gray-300/400`, no spacing override in `tailwind.config.js`.
   - Calculate WCAG AA contrast ratio table for light and dark modes.
