# CSS Butterfly — Full Anatomical Breakdown & WebGL Styling Delta

---

## 1. DOM Structure

```
.butterfly (30px wide, preserve-3d, flight-path animation)
 ├─ ::before                          ← BODY (pseudo-element)
 ├─ .wing:first-child                 ← LEFT WING (1×1px pivot point)
 │    ├─ .bit:first-child             ← Upper petal (large, 130×70px)
 │    │    └─ ::after                 ← Inner overlay (100×60px)
 │    └─ .bit:last-child              ← Lower petal (small, 100×55px)
 │         └─ ::after                 ← Inner overlay (60×45px)
 └─ .wing:last-child                  ← RIGHT WING
      ├─ .bit:first-child             ← Upper petal (large)
      │    └─ ::after                 ← Inner overlay
      └─ .bit:last-child              ← Lower petal (small)
           └─ ::after                 ← Inner overlay
```

Each wing has **two visible petals** (upper + lower), and each petal has **two layers** (outer `.bit` + inner `::after` overlay). Total: **8 visible wing surfaces** + 1 body.

---

## 2. Body (`::before`)

| Property | Value | Visual Effect |
|---|---|---|
| Size | `20px × 110px` | Tall, thin pill |
| border-radius | `50%` | Perfect ellipse |
| Position | `left:50%; margin-left:-10px; top:-15px` | Centered horizontally, shifted up 15px |
| Rotation | `rotateY(100deg)` | Rotated 10° past perpendicular — appears as a **hair-thin vertical sliver** |
| Gradient | `linear-gradient(249deg, #d6d5ce, #b4afa6)` | Warm beige → taupe, steep diagonal |
| Box-shadow | `inset 0 0 0 3px #cfcfce`, `inset 2px -1px 0 0 #cfcfce`, `inset -2px 1px 0 0 #cfcfce`, `inset 1px 2px 0 0 #cfcfce`, `inset -1px -2px 0 3px #cfcfce` | Multi-directional inset = soft **beveled border** giving 3D depth |
| z-index | `2` | Between left wing (3) and right wing (1) |

**Key insight:** The body is **not** visually a fat oval. `rotateY(100°)` foreshortens it to near-nothing — it reads as a thin dark line separating the wings. Its true 20×110px proportions matter for the foreshortening math.

---

## 3. Wing Containers

### Left Wing (`.wing:first-child`)

| Property | Value | Notes |
|---|---|---|
| Size | `1px × 1px` | Invisible pivot point |
| Position | `left: 0; top: 0` | Left side of `.butterfly` |
| transform-origin | `700% 50%` | = 7px from left edge → places hinge at body center |
| Initial rotateY | `-20deg` | Slightly angled toward viewer |
| z-index | `3` | In front of body and right wing |

### Right Wing (`.wing:last-child`)

| Property | Value | Notes |
|---|---|---|
| Size | auto (from children) | |
| Position | `right: 0; top: 0` | Right side of `.butterfly` |
| Initial rotateY | `200deg` | = equivalent to -160°, mirrors the left wing |
| z-index | `1` | Behind body and left wing |

### Shared

- `opacity: 0.85` — both wings are semi-translucent
- `outline: 1px solid transparent` — invisible border placeholder
- `display: block; position: absolute`

---

## 4. Wing Petals (`.bit`) — The Visible Wing Shapes

### 4.1 Shape — The Signature Asymmetric Petal

```css
border-radius: 0% 100% 50% 50% / 0% 50% 50% 100%;
```

Decomposed per corner:

| Corner | Horizontal | Vertical | Visual |
|---|---|---|---|
| **Top-left** | 0% | 0% | **Sharp point** — the wing tip |
| **Top-right** | 100% | 50% | **Fully rounded** — smooth curve at the body hinge |
| **Bottom-right** | 50% | 50% | **Moderate curve** |
| **Bottom-left** | 50% | 100% | **Wide sweeping curve** at bottom |

This produces an organic, leaf/petal shape — pointed at one end, smoothly curved everywhere else. Both the outer `.bit` and inner `::after` share this **identical border-radius**.

### 4.2 Upper Petal (`.bit:first-child`)

| Property | Outer `.bit` | Inner `::after` |
|---|---|---|
| Size | `130px × 70px` | `100px × 60px` |
| Position | `top: 15px; right: 0` | `left: -30px; top: 5px` (relative to outer) |
| Rotation | `rotateZ(40deg)` | inherits |
| transform-origin | `100% 50%` | `100% 50%` |

### 4.3 Lower Petal (`.bit:last-child`)

| Property | Outer `.bit` | Inner `::after` |
|---|---|---|
| Size | `100px × 55px` | `60px × 45px` |
| Position | `right: 0` (no explicit top) | `left: -24px; top: 5px` (relative to outer) |
| Rotation | `rotateZ(-40deg)` | inherits |
| transform-origin | `100% 50%` | `100% 50%` |

**Angular relationship:** Upper = `+40°` and Lower = `−40°` → symmetric **80° fan spread** between petals, both hinging from the body side (`100% 50%`).

### 4.4 Gradient Fill

```css
background: linear-gradient(135deg,
  rgba(255,255,255, 0.9)   0%,    /* $wing-1: warm white */
  rgba(240,250,255, 0.85)  20%,   /* $wing-2: light blue tint */
  rgba(220,235,255, 0.8)   40%,   /* $wing-3: sky blue */
  rgba(235,220,255, 0.8)   60%,   /* $wing-4: lavender */
  rgba(255,235,250, 0.85)  80%,   /* $wing-5: soft pink */
  rgba(255,255,255, 0.9)   100%   /* back to white */
);
```

A **diagonal 135° iridescent shimmer** — white at corners, cycling through blue → lavender → pink across the wing surface. Each stop has its own alpha (0.8–0.9), combined with `.wing { opacity: 0.85 }` giving effective per-pixel opacity of 0.68–0.765.

### 4.5 Border & Shadow System

**Visible border:**
```css
border: 1px solid #d3d3d3b5;  /* light gray, 71% opacity */
```

**Inset shadow system (on both `.bit` AND `::after`):**
```css
box-shadow:
  inset 0 0 0 3px   #cfcfce,    /* uniform 3px inset border */
  inset 2px -1px 0 0 #cfcfce,   /* right-top highlight */
  inset -2px 1px 0 0 #cfcfce,   /* left-bottom highlight */
  inset 1px 2px 0 0  #cfcfce,   /* bottom-right highlight */
  inset -1px -2px 0 3px #cfcfce; /* top-left deep shadow */
```

This creates a **soft beveled outline** on every wing surface — a gentle 3D raised-edge effect that reads as a delicate structural border around each petal.

**Additional outer glow on `.bit` (normal state):**
```css
box-shadow:
  inset 0px 7px 20px 4px rgba(214,213,207,0.59),  /* top inner glow */
  inset 0 0 40px rgba(214,213,207,0.2),             /* diffuse inner light */
  0 2px 10px rgba(214,213,207,0.1);                  /* subtle outer shadow */
```

---

## 5. Wing Flap Animation

```
Left wing:   rotateY(-20°)  ↔  rotateY(90°)     range: 110°
Right wing:  rotateY(200°)  ↔  rotateY(90°)     range: 110°
```

| Property | Value |
|---|---|
| Duration | `var(--flap-duration, 0.15s)` — 150ms per half-cycle (very fast) |
| Easing | `cubic-bezier(0.48, 0.01, 0.54, 1)` — near-linear with soft ease-out |
| Direction | `alternate` with `fill-mode: reverse` — continuous ping-pong |

**Both wings converge to `90°` at the peak** — the "clap" moment where wings are flat/edge-on. Then they spread back to their resting angles. This creates the characteristic butterfly wing-beat.

---

## 6. 3D Flight-Path Dance

### Base Pose
```css
rotateX(50deg) rotateY(20deg) rotateZ(-50deg) scaleX(-1)
```

- `rotateX(50°)` — body tilted forward (top leaning away)
- `rotateY(20°)` — turned slightly to one side
- `rotateZ(-50°)` — body rotated counter-clockwise
- `scaleX(-1)` — horizontally flipped (facing left)

### Keyframe Variations (10s loop)

The flight path gently oscillates around the base pose:
- **rotateX**: 44°–55° (±5° sway)
- **rotateY**: 10°–40° (±15° turning)
- **rotateZ**: -70° to -32° (±20° tilt)
- **translateX**: -10px to +22px (horizontal drift)
- **translateY**: 0 to -100px (vertical rise)
- **scaleX**: -0.9 to -1.1 (slight width pulse)

This produces an **organic floating/breathing motion** — the butterfly gently turns, tilts, and drifts as if riding air currents. The 3D rotation changes mean different wing surfaces catch light differently over time.

---

## 7. Gap Analysis: WebGL vs CSS

### ❌ Missing — Must Add

| Feature | CSS | WebGL Status |
|---|---|---|
| **Inner wing overlays** | Each petal has a smaller `::after` layer creating depth | Geometry exists (`upperInner`, `lowerInner` in constants) but **never rendered** |
| **Inner overlay offsets** | Upper: `left:-30px, top:5px`; Lower: `left:-24px, top:5px` | Not applied |
| **Inner overlay opacity** | Separate from outer (creates layered depth) | `WING_INNER_OPACITY=0.7` defined but unused |
| **Inner overlay borders** | Same `inset box-shadow` pattern as outer | Not rendered |

### ⚠️ Incorrect — Must Fix

| Feature | CSS Value | WebGL Value | Fix |
|---|---|---|---|
| **Flap convergence (left)** | `to: 90°` | `to: 75°` | Change to `90°` |
| **Flap convergence (right)** | `to: 90°` | `to: 105°` | Change to `90°` |
| **Body radius** | 20px → `0.10` world units | `0.06` | Change to `0.10` |
| **Body halfHeight** | 110px → `0.55` world units | `0.40` | Change to `0.55` |
| **Upper petal top offset** | `top: 15px` = `0.15` world units | `0` (at origin) | Add `y: 0.15` position |

### ✅ Already Correct

| Feature | Notes |
|---|---|
| Wing petal shape (border-radius) | Bézier approximation matches CSS corners |
| Outer petal dimensions | 130×70, 100×55 → 1.3×0.7, 1.0×0.55 |
| Petal Z-rotations | +40° / -40° |
| Wing gradient (5-stop 135°) | Shader matches CSS stops |
| Wing opacity (0.85) | Correct |
| Body gradient (249°) | Beige→taupe matches |
| Body rotateY (100°) | Correct |
| Border color (#d3d3d3, 71% opacity) | LineLoop matches |
| Base pose (50°, 20°, -50°) | Correct |
| Flight-path keyframe structure | 10s loop with smoothstep interpolation |

---

## 8. Implementation Plan (File Changes)

### `constants.ts`

```diff
- left:  { from: -20 * DEG2RAD, to: 75 * DEG2RAD },
- right: { from: 200 * DEG2RAD, to: 105 * DEG2RAD },
+ left:  { from: -20 * DEG2RAD, to: 90 * DEG2RAD },
+ right: { from: 200 * DEG2RAD, to: 90 * DEG2RAD },
```

```diff
- body: { radius: 0.06, halfHeight: 0.4 },
+ body: { radius: 0.10, halfHeight: 0.55 },
```

### `ButterflyWebGL.tsx`

1. Import `getUpperInnerGeometry`, `getLowerInnerGeometry` from geometry
2. Create inner border geometries (same shape builder, inner dimensions)
3. Clone `wingInnerMat` with `WING_INNER_OPACITY` (0.7)
4. In `WingPetals`, inside each upper/lower group, add:
   - Inner mesh with inner geometry + inner material
   - Inner lineLoop with inner border geometry
   - Position offsets: upper inner `[-0.30, 0.05, 0.001]`, lower inner `[-0.24, 0.05, 0.001]`
5. Add `position={[0, 0.15, 0]}` to the upper petal group (CSS `top: 15px`)
6. Update opacity logic to include `wingInnerMat`

### `materials.ts`

- No new materials needed — inner wing uses same shader, just a different `uOpacity` clone

### `geometry.ts`

- No changes — `getUpperInnerGeometry()` and `getLowerInnerGeometry()` already exist
