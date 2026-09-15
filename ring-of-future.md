## 1. Project structure

Agar Android app Kotlin mein hai aur LibGDX ko separate game module rakh rahe ho:

```text
MyApp/
│
├── app/                              ← Existing Android/Kotlin app
│   └── src/main/java/com/example/app/
│       ├── MainActivity.kt
│       ├── App.kt
│       └── game/
│           └── GameLauncher.kt
│
├── game/                             ← LibGDX Core
│   └── src/main/java/com/example/game/
│       │
│       ├── WheelGame.kt
│       │
│       ├── config/
│       │   └── WheelConfig.kt
│       │
│       ├── model/
│       │   ├── WheelSegment.kt
│       │   └── GameState.kt
│       │
│       ├── wheel/
│       │   ├── WheelRenderer.kt
│       │   └── SpinController.kt
│       │
│       ├── screen/
│       │   └── WheelGameScreen.kt
│       │
│       └── ui/
│           └── WheelUi.kt
│
└── assets/
    ├── fonts/
    ├── sounds/
    │   ├── tick.wav
    │   └── win.wav
    └── textures/
        └── pointer.png
```

---

# 2. `WheelConfig.kt`

Yahan wheel ki configuration rahegi.

```kotlin
package com.example.game.config

object WheelConfig {

    const val SEGMENT_COUNT = 32

    const val GREEN_COUNT = 1
    const val RED_COUNT = 6
    const val PURPLE_COUNT = 10
    const val GREY_COUNT = 15

    const val FULL_CIRCLE = 360f

    val SEGMENT_ANGLE =
        FULL_CIRCLE / SEGMENT_COUNT
}
```

Result:

```text
360 / 32 = 11.25°
```

---

# 3. `WheelSegment.kt`

Har slice ka data:

```kotlin
package com.example.game.model

import com.badlogic.gdx.graphics.Color

data class WheelSegment(
    val index: Int,
    val color: Color,
    val name: String
)
```

---

# 4. `GameState.kt`

Game ke states:

```kotlin
package com.example.game.model

enum class GameState {
    IDLE,
    SPINNING,
    RESULT
}
```

Isse double-spin jaise bugs avoid karna easy hota hai.

---

# 5. `WheelRenderer.kt`

Ye actual **32 segments ka wheel draw karega**.

```kotlin
package com.example.game.wheel

import com.badlogic.gdx.graphics.Color
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import com.example.game.config.WheelConfig
import com.example.game.model.WheelSegment

class WheelRenderer(
    private val shapeRenderer: ShapeRenderer
) {

    private val segments = createSegments()

    var rotation = 0f

    private fun createSegments(): List<WheelSegment> {

        val result = mutableListOf<WheelSegment>()

        repeat(WheelConfig.GREEN_COUNT) {
            result.add(
                WheelSegment(
                    result.size,
                    Color.valueOf("4CAF50"),
                    "GREEN"
                )
            )
        }

        repeat(WheelConfig.RED_COUNT) {
            result.add(
                WheelSegment(
                    result.size,
                    Color.valueOf("F44336"),
                    "RED"
                )
            )
        }

        repeat(WheelConfig.PURPLE_COUNT) {
            result.add(
                WheelSegment(
                    result.size,
                    Color.valueOf("9C27B0"),
                    "PURPLE"
                )
            )
        }

        repeat(WheelConfig.GREY_COUNT) {
            result.add(
                WheelSegment(
                    result.size,
                    Color.valueOf("D9D9D9"),
                    "GREY"
                )
            )
        }

        return result
    }

    fun render(
        centerX: Float,
        centerY: Float,
        radius: Float
    ) {

        shapeRenderer.begin(ShapeRenderer.ShapeType.Filled)

        var angle = rotation

        segments.forEach { segment ->

            shapeRenderer.color = segment.color

            shapeRenderer.arc(
                centerX - radius,
                centerY - radius,
                radius * 2f,
                radius * 2f,
                angle,
                WheelConfig.SEGMENT_ANGLE
            )

            angle += WheelConfig.SEGMENT_ANGLE
        }

        shapeRenderer.end()
    }

    fun dispose() {
        // ShapeRenderer is owned by the screen/game.
    }
}
```

Isse 32 individual images ki requirement nahi padegi.

---

# 6. `SpinController.kt`

Ab sabse important part: wheel ko smoothly rotate karna.

```kotlin
package com.example.game.wheel

import com.example.game.config.WheelConfig
import kotlin.math.abs

class SpinController {

    var spinning = false
        private set

    private var elapsed = 0f
    private var duration = 0f

    private var startRotation = 0f
    private var targetRotation = 0f

    fun startSpin(
        currentRotation: Float,
        resultIndex: Int
    ) {

        if (spinning) return

        spinning = true

        elapsed = 0f
        duration = 4f

        startRotation = currentRotation

        val segmentAngle = WheelConfig.SEGMENT_ANGLE

        val targetSegmentAngle =
            resultIndex * segmentAngle

        val extraRotations = 360f * 5f

        targetRotation =
            currentRotation +
            extraRotations +
            (360f - targetSegmentAngle)
    }

    fun update(delta: Float): Float {

        if (!spinning) {
            return startRotation
        }

        elapsed += delta

        val progress =
            (elapsed / duration).coerceAtMost(1f)

        // Ease-out
        val eased =
            1f - (1f - progress) * (1f - progress)

        val rotation =
            startRotation +
            (targetRotation - startRotation) * eased

        if (progress >= 1f) {
            spinning = false
            startRotation = targetRotation
        }

        return rotation
    }

    fun isFinished(): Boolean {
        return !spinning
    }
}
```

Production version mein target angle ko pointer ki exact orientation ke according calculate karna chahiye; upar wala skeleton us calculation ka base hai.

---

# 7. `WheelGameScreen.kt`

Ye actual LibGDX screen hai.

```kotlin
package com.example.game.screen

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.ScreenAdapter
import com.badlogic.gdx.graphics.GL20
import com.badlogic.gdx.graphics.glutils.ShapeRenderer
import com.example.game.wheel.SpinController
import com.example.game.wheel.WheelRenderer

class WheelGameScreen : ScreenAdapter() {

    private val shapeRenderer = ShapeRenderer()

    private val wheelRenderer =
        WheelRenderer(shapeRenderer)

    private val spinController =
        SpinController()

    private var resultIndex = 0

    override fun render(delta: Float) {

        Gdx.gl.glClearColor(
            0.08f,
            0.08f,
            0.10f,
            1f
        )

        Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT)

        if (spinController.spinning) {

            wheelRenderer.rotation =
                spinController.update(delta)
        }

        val centerX =
            Gdx.graphics.width / 2f

        val centerY =
            Gdx.graphics.height / 2f

        val radius =
            minOf(centerX, centerY) * 0.65f

        wheelRenderer.render(
            centerX,
            centerY,
            radius
        )
    }

    fun spin(resultIndex: Int) {

        if (spinController.spinning) {
            return
        }

        this.resultIndex = resultIndex

        spinController.startSpin(
            wheelRenderer.rotation,
            resultIndex
        )
    }

    override fun dispose() {
        shapeRenderer.dispose()
    }
}
```

---

# 8. `WheelGame.kt`

LibGDX ka main entry point:

```kotlin
package com.example.game

import com.badlogic.gdx.Game
import com.example.game.screen.WheelGameScreen

class WheelGame : Game() {

    override fun create() {
        setScreen(WheelGameScreen())
    }
}
```

---

# 9. Android side — `GameLauncher.kt`

Android module se LibGDX launch karne ke liye:

```kotlin
package com.example.app.game

import android.content.Context
import com.badlogic.gdx.backends.android.AndroidApplicationConfiguration
import com.badlogic.gdx.backends.android.AndroidApplication
import com.example.game.WheelGame

class GameLauncher : AndroidApplication() {

    override fun onCreate(savedInstanceState: android.os.Bundle?) {
        super.onCreate(savedInstanceState)

        val config =
            AndroidApplicationConfiguration().apply {
                useImmersiveMode = true
            }

        initialize(
            WheelGame(),
            config
        )
    }
}
```

Tumhare existing Kotlin app se is activity ko open kiya ja sakta hai.

---

# 10. Actual game flow

Ab पूरा flow:

```text
Kotlin App
     │
     │ Open Game
     ▼
GameLauncher
     │
     ▼
WheelGame
     │
     ▼
WheelGameScreen
     │
     ├── WheelRenderer
     │
     └── SpinController
```

Spin ke time:

```text
SPIN
 ↓
resultIndex
 ↓
SpinController
 ↓
5+ rotations
 ↓
deceleration
 ↓
exact segment
 ↓
RESULT
```

---

## 11. Tumhare 32 segments ka layout

Code currently sequence banayega:

```text
0     GREEN
1-6   RED
7-16  PURPLE
17-31 GREY
```

Yaani:

```text
GREEN  = 1
RED    = 6
PURPLE = 10
GREY   = 15

TOTAL  = 32
```

Agar tum chahte ho ki colors **random order mein wheel par distributed hon**, to `createSegments()` mein configuration alag rakh sakte hain. Main production design mein colors ko hard-code karne ke bajay `WheelConfig` se load karunga.

### Ek aur important improvement

Actual production game mein main is structure ko aur clean karunga:

```text
GameResult
     ↓
GameController
     ↓
SpinController
     ↓
WheelRenderer
```

**`WheelRenderer` ko result decide nahi karna chahiye.** Renderer ka kaam sirf draw karna hai. Result/game logic alag hona chahiye.

Aur tumhare case mein, kyunki tumne server-connected wallet/bet system ka zikr kiya hai, **server result ko authoritative rakhna** architecture ka sabse important part hoga.
