# Decorative Butterflies — Three-Quarter Leaning Perspective

## Reference Image Analysis

The reference butterfly has a very specific pose — viewed from an **above-right three-quarter angle**:

```
  Reference Image Breakdown:
  
       ╱‾‾‾‾‾‾‾‾╲          ← RIGHT WING: large, full surface visible
      ╱    upper    ╲           (near-wing, closest to viewer)
     ╱    right      ╲
    ╱                  ╲
   │      ╱ BODY ╲      │   ← BODY: diagonal axis, upper-right → lower-left
    ╲    ╱         ╲    ╱       visible between wings, slightly tilted
     ╲──╱    left   ╲─╱
         ╲  wing   ╱        ← LEFT WING: recedes behind body
          ╲       ╱            (far-wing, partially occluded)
           ╲─────╱
```

### Key Visual Properties

1. **Almost lying flat** — we see the **top surface** of the wings. The wing plane is nearly horizontal relative to the viewer. The butterfly leans forward so its back/top is facing us.

2. **Strong shoulder turn** — the right wing is prominently in the foreground (large, fully visible surface area). The left wing recedes behind the body, partially hidden. This is a deep yaw rotation.

3. **Diagonal body axis** — the body (capsule) runs from **upper-right to lower-left** on screen, creating a dynamic diagonal composition. Head is to the viewer's right, tail to the left.

4. **Left wing flaps behind** — due to the combined lean + turn, the left wing's flap motion goes away from us, creating a natural depth separation.

---

## Geometry Recap

The butterfly's local coordinate system (before any rotation):

```
         +Y (head)
          │
          │    body capsule
          │
  ─────── ● ───────  +X (left wing hinge)   -X (right wing hinge)
          │
          │
         -Y (tail)
          
  +Z = front face (what billboard points at camera)
```

- **Body**: Y-axis ellipsoid (head = +Y, tail = -Y)
- **Wings**: extend in XY plane. Left hinge at +X, right hinge at -X. Wing petals extend in -X from their hinge.
- **Front face**: +Z direction — this is what the billboard always orients toward the camera

---

## Rotation Derivation (Euler XYZ Order)

Three.js applies Euler rotations in XYZ order. Each rotation is applied sequentially:

### Step 1: RX (Pitch around X-axis) → "Almost lying"

- **Positive RX** tips the butterfly's head (+Y) away from the camera (into the screen) and brings the tail toward the viewer
- This makes the **top/back surface of the wings face the camera** — the "almost lying" view
- At 0° we see the butterfly face-on. At 90° we'd look straight down at the wings from above.
- **Target: ~50°** — deep lean showing wing top surface, but not so extreme that wings become fully horizontal and lose shape detail

### Step 2: RY (Yaw around Y-axis) → "Shoulder turn"

- **Positive RY** turns the butterfly's left side (+X wing) away from camera and brings the right side (-X wing) toward the camera
- This makes the **right wing prominent** (near-wing) and the **left wing recede** (far-wing behind body)
- **Target: ~55°** — strong enough that right wing clearly dominates and left wing is partially hidden behind the body

### Step 3: RZ (Roll around Z-axis) → "Head right, tail left"

- **Negative RZ** rotates clockwise in screen space — head (+Y, which after RX points partly into screen) moves screen-right, tail moves screen-left
- This creates the **diagonal body axis** visible in the reference image
- **Target: ~-30°** — enough diagonal to feel dynamic without making the body fully horizontal

### Combined Effect

```
After billboard (faces camera):
  +Z → camera ✓

After RX = 50°:
  Wings tilt back, showing top surface
  Head goes into screen, tail comes forward

After RY = 55°:
  Right wing (-X) swings toward camera → becomes prominent near-wing
  Left wing (+X) swings away → recedes behind body

After RZ = -30°:
  Body axis tilts clockwise on screen
  Head appears on viewer's right, tail on viewer's left
```

---

## Proposed Constants

**File:** `ButterflyWebGL.tsx`

```ts
// ─── Decorative base-pose — leaning three-quarter perspective ───
const DECORATIVE_POSE_RX = 50 * DEG2RAD;   // almost lying — lean forward, show wing tops
const DECORATIVE_POSE_RY = 55 * DEG2RAD;   // shoulder turn — right wing prominent, left recedes
const DECORATIVE_POSE_RZ = -30 * DEG2RAD;  // diagonal body — head right, tail left
```

| Axis | Value | What the Viewer Sees |
|------|-------|---------------------|
| **X** (pitch) | **+50°** | Looking down at wing top surfaces — "almost lying" |
| **Y** (yaw) | **+55°** | Right wing large/near, left wing small/behind body |
| **Z** (roll) | **-30°** | Body runs upper-right → lower-left, head on right |

---

## Why Billboard Makes This Camera-Independent

```
Any camera orbit angle
        │
        │  billboard quaternion (outer group)
        │  → always copies camera.quaternion
        ▼  → butterfly +Z always faces viewer
  ┌──────────────┐
  │  INNER POSE  │  ← RX=50° RY=55° RZ=-30°
  │  (base-pose  │     applied AFTER billboard
  │   group)     │     = purely screen-relative
  │              │     = same visual from any camera angle
  └──────────────┘
```

The inner pose operates in **screen space** (relative to the billboard plane). No matter where the camera orbits, the butterfly always presents:
- Wing tops visible (from the lean)
- Right wing prominent (from the yaw)
- Diagonal body (from the roll)

---

## Files Modified

| File | Change | Lines |
|------|--------|-------|
| `ButterflyWebGL.tsx` | Update 3 `DECORATIVE_POSE_*` constants | 3 lines |

### No other files affected
- `DecorativeButterflies.tsx` — already passes `useDecorativePose` ✓
- `constants.ts` — no changes needed
- Interactive CSS butterfly — uses `BASE_POSE_*`, completely unaffected

---

## Tuning Guide

If the pose needs adjustment after implementation:

| Want more... | Adjust |
|-------------|--------|
| Lying flat / more wing surface | Increase RX toward 65° |
| Standing up / more body visible | Decrease RX toward 35° |
| Stronger shoulder turn | Increase RY toward 65° |
| More symmetrical wings | Decrease RY toward 35° |
| More diagonal body | Increase RZ magnitude toward -45° |
| More vertical body | Decrease RZ magnitude toward -15° |
| Head on LEFT instead | Flip RZ sign to +30° |
