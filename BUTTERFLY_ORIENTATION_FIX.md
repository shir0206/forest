# Decorative Butterflies — Orientation Fix (IMPLEMENTED)

## Root Cause: Triple Mirror + Aggressive Base Pose

The "backwards/mirrored" and "paper-thin" issues trace to **three layers of X-axis mirroring** stacking unpredictably, plus a base pose designed for CSS fixed-camera rendering:

| Layer | Where | What it does |
|-------|-------|-------------|
| `sx: -1` | `FLIGHT_PATH_KEYFRAMES` (constants.ts) | Every keyframe has negative sx → `rootRef.scale.x` is always negative → permanent X mirror |
| `flipPetals={true}` | DecorativeButterflies.tsx → ButterflyWebGL | Adds `Math.PI` Y rotation to each wing petal → second mirror |
| `BASE_POSE_RY = 55°` | ButterflyWebGL.tsx | 55° Y rotation partially flips the visible face → partial third mirror |

The "paper-thin from certain camera angles" issue: the billboard (`quaternion.copy(camera.quaternion)`) works on the **outer group**, but the inner base pose `(-80°, 55°, -10°)` then re-tilts geometry aggressively. From the camera's POV you see the billboard-corrected group, then a -80° X pitch rolls wings nearly edge-on.

---

## 3D Best Practice: Orbiting Camera + Independently Moving Background Objects

When you have an **orbiting camera** and **independently animated sprite-like objects in the background**, the standard pattern is:

### Spherical Billboard + Minimal Inner Rotation

1. **Outer group** copies `camera.quaternion` every frame (already done ✓) — this guarantees the object's "front face" always points at the viewer regardless of orbit position.
2. **Inner content** should have **only a slight aesthetic tilt** — NOT a pose designed for a fixed-perspective CSS viewer. The billboard handles "face the camera"; the inner pose only adds flavor (a subtle 3D lean so it's not perfectly flat).
3. **No mirroring tricks** — CSS `scaleX(-1)` and `rotateY(180°)` are hacks that simulate "facing right" when the viewer is fixed. In true 3D with billboarding, the geometry's natural orientation determines appearance. Mirrors just fight the billboard.

### Why `lookAt()` and yaw-only failed

- `group.lookAt(target)` sets the group's full orientation (pitch, yaw, roll) to face a point. When the inner child already has aggressive rotations `(-80°, 55°, -10°)`, the two compound → bizarre angles.
- Yaw-only (`rotation.y = atan2(dir.x, dir.z)`) only fixes horizontal direction, but the inner -80° X pitch still makes wings edge-on from most vertical angles.
- Both approaches try to orient the outer group **toward travel direction**, but the real need is to orient it **toward the camera**. Travel direction should only contribute a subtle lean at most.

---

## Proposed Fix: 3 Targeted Changes

### Change 1: Remove the sx mirror for decorative butterflies

**File:** `ButterflyWebGL.tsx`

The flight path applies `fp.sx * BUTTERFLY_BASE_SCALE` to `rootRef.scale.x`. The `sx: -1` in every keyframe is a CSS-era `scaleX(-1)` trick. For billboarded 3D butterflies this just mirrors them backwards.

**Add a `mirrorX` prop:**

```tsx
export interface ButterflyWebGLProps {
  // ... existing props
  /** Apply negative X scale from flight path (CSS compat). Default: true. */
  mirrorX?: boolean;
}

// In useFrame, flight-path scale line:
const effectiveSx = mirrorX ? fp.sx : Math.abs(fp.sx);
rootRef.current.scale.set(
  effectiveSx * BUTTERFLY_BASE_SCALE,
  BUTTERFLY_BASE_SCALE,
  BUTTERFLY_BASE_SCALE
);
```

Decorative butterflies pass `mirrorX={false}`. The interactive CSS butterfly keeps default `mirrorX={true}`.

### Change 2: Remove `flipPetals` for decorative butterflies

**File:** `DecorativeButterflies.tsx`

```tsx
<ButterflyWebGL
  flapDurationMs={...}
  opacityRef={...}
  timeOffset={...}
  flipPetals={false}    // was true — removes second mirror
  mirrorX={false}       // new prop — removes first mirror
/>
```

With `sx` positive and `flipPetals` removed, the wing geometry's natural orientation takes over: wings extend in -X from hinge at x=0, bigger wing (upper, w=1.3) is the "head." From the camera's POV after billboard, the head appears on the correct side.

### Change 3: Gentle base pose for decorative butterflies

**File:** `ButterflyWebGL.tsx`

The base pose `(-80°, 55°, -10°)` was designed to replicate `CSS rotateX(50) rotateY(20) rotateZ(-50)` from a fixed front camera. With billboarding, this fights the orientation — the -80° X pitch makes wings nearly horizontal (edge-on to the viewer).

**Add a `useDecorativePose` prop (or pass rotation directly):**

```tsx
export interface ButterflyWebGLProps {
  // ... existing props
  /** Use gentle tilt for billboard-oriented decorative butterflies. */
  useDecorativePose?: boolean;
}

// Replace static constants with:
const rx = useDecorativePose ? -12 * DEG2RAD : BASE_POSE_RX;  // slight forward lean
const ry = useDecorativePose ?   0 * DEG2RAD : BASE_POSE_RY;  // no Y rotation
const rz = useDecorativePose ?  -5 * DEG2RAD : BASE_POSE_RZ;  // tiny roll

// In JSX:
<group rotation={[rx, ry, rz]}>
```

The -12° X lean tilts wings slightly toward the viewer — more natural than perfectly flat, but nowhere near the -80° that causes edge-on problems. The 0° Y keeps the natural wing orientation intact (no partial mirror). The -5° Z adds a tiny roll for visual interest.

---

## Why This Works (3D reasoning)

```
Camera frustum
      │
      │  billboard quaternion
      ▼  (outer group faces camera)
  ┌─────────┐
  │  gentle  │  ← -12° X, 0° Y, -5° Z
  │   tilt   │     (inner base-pose group)
  │ ┌─────┐  │
  │ │wings│  │  ← natural geometry orientation
  │ │ ←──→│  │     no sx mirror, no flipPetals
  │ │body │  │     bigger wing = head = visually "right"
  │ └─────┘  │
  └─────────┘
```

1. **Billboard** (outer group) ensures the butterfly's front face always points at the camera, no matter where the camera orbits.
2. **No mirrors** means the geometry's authored orientation is what you see — bigger wing (head) on one side, smaller wing (tail) on the other.
3. **Gentle tilt** (inner group) gives 3D depth without fighting the billboard. At -12° the wings are tilted ~12° from face-on — visible depth, never edge-on.
4. **Flight path sway** still works (rx/ry/rz in `interpolateFlightPath`) but those are already scaled to gentle ~6-10° values, which add natural motion on top of the tilt.

---

## Optional Enhancement: Travel-Direction Lean

For extra polish during movement phases (spawn, fly-away), blend a slight lean toward travel direction:

```ts
// In useFrame, after phase tick, before setting quaternion:
const billboardQuat = camera.quaternion.clone();

if (runtime.currentPhase === PHASE.SPAWN || runtime.currentPhase === PHASE.FLY_AWAY) {
  // Compute a quaternion that faces travel direction
  const travelDir = scratchTangent.subVectors(target, origin).normalize();
  scratchLerp.copy(group.position).add(travelDir);
  const travelMatrix = new THREE.Matrix4().lookAt(group.position, scratchLerp, scratchWorldUp);
  const travelQuat = new THREE.Quaternion().setFromRotationMatrix(travelMatrix);

  // Blend: 88% camera-facing, 12% travel-leaning
  billboardQuat.slerp(travelQuat, 0.12);
}

group.quaternion.copy(billboardQuat);
```

This is a **nice-to-have** — the 3 core changes above fix both issues without it. The lean just adds a subtle "leaning into the wind" effect during flight.

---

## Files Modified

| File | Change | Issue Fixed |
|------|--------|------------|
| `ButterflyWebGL.tsx` | Add `mirrorX` prop, use `Math.abs(fp.sx)` when false | Head faces correct direction |
| `ButterflyWebGL.tsx` | Add `useDecorativePose` prop, gentle rotation `(-12°, 0°, -5°)` | No more paper-thin from any angle |
| `DecorativeButterflies.tsx` | `flipPetals={false}`, `mirrorX={false}`, `useDecorativePose` | Removes double-mirror, uses gentle pose |
| `constants.ts` | No changes needed | — |
| `animation.ts` | No changes needed | — |

## Implementation Summary (DONE)

All 3 changes have been implemented and TypeScript compiles clean (no new errors).

### ButterflyWebGL.tsx — 2 new props + decorative pose constants

1. **Added `mirrorX` prop** (default: `true`) — when `false`, flight-path scale uses `Math.abs(fp.sx)` instead of raw `fp.sx`, removing the CSS-era `scaleX(-1)` mirror.

2. **Added `useDecorativePose` prop** (default: `false`) — when `true`, the base-pose group uses gentle constants `(-12°, 0°, -5°)` instead of the aggressive CSS pose `(-80°, 55°, -10°)`.

3. **Added module-level constants:**
   ```ts
   const DECORATIVE_POSE_RX = -12 * DEG2RAD;
   const DECORATIVE_POSE_RY = 0;
   const DECORATIVE_POSE_RZ = -5 * DEG2RAD;
   ```

4. **JSX base-pose group** now uses computed `poseRX/RY/RZ` that switches between CSS and decorative poses based on the prop.

### DecorativeButterflies.tsx — prop changes

1. **`flipPetals={false}`** — was `true`, removes the second mirror (petal Y rotation).
2. **`mirrorX={false}`** — new prop, removes the first mirror (negative scaleX).
3. **`useDecorativePose`** — new prop, switches to gentle billboard-friendly tilt.
4. **Removed unnecessary wrapper** `<group rotation={[0, 0, 0]}>` around ButterflyWebGL.

### Backward Compatibility

All new props default to preserving existing behavior — the interactive CSS butterfly is completely unaffected.

---

## Risk Assessment

- **Interactive CSS butterfly**: Unaffected — all new props default to preserving current behavior (`mirrorX={true}`, `useDecorativePose={false}`, `flipPetals` unchanged).
- **Body capsule**: With `BODY_ROTY=0°` already set and the gentle pose at 0° Y, the body ellipsoid faces the camera squarely → always reads as capsule, never edge-on.
- **Flight path sway**: Still applies its gentle ±6-10° rotations on top of the base pose. Since `sx` is now positive, the scale breathing still works (`0.9–1.1` range) without mirroring.
