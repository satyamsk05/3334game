
### Exact structure

```text
                 160dp
        ┌────────────────────┐
        │                    │
        │    GAME ARTWORK    │  160dp
        │                    │
        │                    │
        ├────────────────────┤
        │                    │  70dp
        │   ▶ PLAY NOW       │
        └────────────────────┘
                 ↓
             160 × 230dp
```

Aur **PLAY NOW button khud 160dp × ~40dp nahi**, balki footer ke andar inset/compact white rounded rectangle hoga.

Iske liye agent ko ye **full prompt** do:

---

## Kotlin Game Grid UI — Exact Layout Correction

**Important: Do not redesign the game UI from your own imagination. Use the attached/reference design and the measurements below as the source of truth. The current Kotlin implementation is visually too large/tall and does NOT match the reference. Modify the existing implementation rather than creating a new unrelated design.**

### 1. Overall game grid

Create a **2-column game grid**.

```text
┌────────────────┐  ┌────────────────┐
│     GAME 1     │  │     GAME 2     │
├────────────────┤  ├────────────────┤
│   PLAY NOW     │  │   PLAY NOW     │
└────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐
│     GAME 3     │  │     GAME 4     │
├────────────────┤  ├────────────────┤
│   PLAY NOW     │  │   PLAY NOW     │
└────────────────┘  └────────────────┘
```

The grid should continue vertically and be scrollable.

**Do NOT make the cards into the large/tall poster-style cards currently visible in the Kotlin implementation.**

---

### 2. Exact game card dimensions

The reference specification is based on:

* **Card width: 160dp**
* **Artwork area: 160dp × 160dp**
* **Bottom/footer area: 160dp × 70dp**
* **Total card height: 230dp**
* **Total card size: 160dp × 230dp**

So the fundamental card ratio is:

**160 : 230**

Do not arbitrarily increase the card height.

If the available device width requires responsive scaling, preserve the **same 160:230 aspect ratio** rather than independently stretching width and height.

---

### 3. Artwork section

The upper portion of every card must be:

**160dp × 160dp**

The existing game artwork/image must fill this area.

Rules:

* Keep the original game artwork.
* Do NOT replace the artwork.
* Do NOT distort/stretch the artwork.
* Preserve the image's visual proportions.
* Use an appropriate crop/fit such as `ContentScale.Crop` where required.
* The artwork should visually occupy the complete 160dp × 160dp area.
* Do not add large empty padding around the artwork.
* Do not make the artwork smaller just to create unnecessary whitespace.

---

### 4. Card corner radius

Follow the reference image rather than applying one large radius to the entire card.

The reference indicates approximately **25dp corner treatment**.

Use:

* **Top-left: 25dp**
* **Top-right: 25dp**
* **Bottom-left: 25dp**
* **Bottom-right: 25dp**

But the important point is that the artwork and footer should visually behave as **one card**, not as two unrelated rounded boxes with a gap between them.

There must be:

**NO gap between the 160dp artwork section and the 70dp footer.**

---

### 5. Bottom footer

The bottom section is exactly:

**160dp wide × 70dp high**

This section contains the `PLAY NOW` action.

The footer should be compact.

Do **NOT** make the footer 100dp+ tall.

Do **NOT** make `PLAY NOW` occupy most of the card.

---

### 6. PLAY NOW button

Inside the 160dp × 70dp footer, create a smaller white rounded rectangle.

Reference:

```text
┌────────────────────────┐
│                        │
│    ▶  PLAY NOW         │
│                        │
└────────────────────────┘
```

Button:

* White background
* Approximately **8dp corner radius**
* Compact horizontal button
* Centered inside the footer
* Purple/dark text depending on the game's theme
* Small play triangle/icon on the left
* `PLAY NOW` text should remain on one line
* Do not use an oversized button
* Do not make the button touch the card edges

The **8dp radius applies to the PLAY NOW button**, not the entire card.

---

### 7. Game logo / overlay

Where the reference shows the game-logo overlay element:

* Keep it as an **overlay on top of the game artwork**
* Overlay size: approximately **25dp**
* It must be positioned relative to the artwork/card rather than becoming part of the grid spacing.
* Do not let the overlay change the 160dp × 160dp artwork dimensions.
* Do not push the artwork or footer downward because of the overlay.

Use a layered layout (`Box` in Jetpack Compose or `FrameLayout`/equivalent in XML) so the logo can sit **over** the artwork.

---

### 8. Grid spacing

The cards should have controlled spacing similar to the reference.

Do not use huge vertical gaps.

Use a consistent small gap between:

* Column 1 ↔ Column 2
* Row 1 ↔ Row 2

The spacing must be visually proportional to the **160dp card width**, not the oversized spacing currently visible.

---

### 9. Responsive behavior

This is important.

The reference uses **160dp as the design/reference size**, but the implementation must work on different Android screen widths.

Therefore:

**Do NOT simply hardcode a huge card width based on the screen width.**

Instead:

1. Maintain exactly **2 columns**.
2. Calculate available grid width.
3. Apply consistent horizontal spacing.
4. Scale the card proportionally if necessary.
5. Preserve the **160:230 aspect ratio**.

For example, conceptually:

```text
Available width
      ↓
┌──────────┬──────────┐
│  CARD    │  CARD    │
│          │          │
│ 160×230  │ 160×230  │
└──────────┴──────────┘
```

If scaling is required:

```text
original:
160 × 230

scaled:
W × (W × 230 / 160)
```

**Never independently scale width and height.**

---

### 10. What is wrong with the current Kotlin UI

The current implementation appears like:

```text
┌─────────────────────┐
│                     │
│                     │
│    HUGE ARTWORK     │
│                     │
│                     │
│                     │
│                     │
│      GAME NAME      │
│                     │
│   HUGE PLAY BUTTON  │
│                     │
└─────────────────────┘
```

This is **NOT** the desired design.

The desired design is a compact game tile:

```text
┌────────────────┐
│                │
│   160 × 160    │
│   GAME ART     │
│                │
├────────────────┤
│                │
│  ▶ PLAY NOW    │
│                │
└────────────────┘
    160 × 230
```

---

### 11. Do not change these things

**Do NOT:**

* Replace existing game artwork.
* Generate new game images.
* Change game names.
* Change the game order unless already required by existing data.
* Turn the cards into large vertical posters.
* Add unnecessary descriptions.
* Add large shadows/glows.
* Add unnecessary padding.
* Add extra UI elements that aren't in the reference.
* Create a completely new screen.
* Change backend/game-launch functionality.
* Break existing click actions.
* Hardcode fake game data just to demonstrate the UI.

**Only correct the existing Kotlin game's grid/card presentation.**

---

### 12. Implementation requirement

First inspect the **existing Kotlin implementation** and identify:

* Current game-grid container
* Current card composable/XML
* Current image dimensions
* Current card dimensions
* Current padding
* Current spacing
* Current corner radius
* Current PLAY NOW button dimensions
* Current image scaling mode
* Current responsive/grid calculation

Then modify those existing components.

If this is **Jetpack Compose**, prefer:

* `LazyVerticalGrid`
* `GridCells.Fixed(2)`
* `Box` for image + overlay
* Explicit/proportional card sizing
* `ContentScale.Crop`
* `RoundedCornerShape`
* Proper `Arrangement.spacedBy(...)`

If this is **RecyclerView/XML**, use:

* 2-column `GridLayoutManager`
* Existing card item layout
* Proper fixed/proportional dimensions
* `ImageView` with appropriate `scaleType`
* Separate artwork/footer containers
* 8dp radius for PLAY NOW button

---

### Final visual target

The final Kotlin UI should visually match the **first reference specification**, not the oversized cards currently generated.

**Primary measurements to respect:**

| Element                       |              Size |
| ----------------------------- | ----------------: |
| Game card width               |         **160dp** |
| Artwork                       | **160dp × 160dp** |
| Footer                        |  **160dp × 70dp** |
| Total card                    | **160dp × 230dp** |
| Game-logo overlay             |         **~25dp** |
| PLAY NOW button corner radius |           **8dp** |
| Grid columns                  |             **2** |

**The 160 × 160 + 160 × 70 structure is the most important requirement. Preserve this proportion throughout responsive scaling.**

---
