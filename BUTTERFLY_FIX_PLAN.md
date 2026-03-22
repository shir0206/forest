# Decorative Butterflies — Fix Handoff Document

## The Two Issues (UNSOLVED)

### Issue 1: Wrong orientation/direction in spawn phase and during camera movement
- During the spawn phase, butterflies appear **mirrored/backwards** — the "head" (bigger wing) faces left while the butterfly moves right
- When the camera rotates around the scene, butterflies viewed from the side appear **flat like paper** — their body becomes a thin line instead of a capsule
- The user wants butterflies to **always face right** (head/bigger wing leading) from the viewer's perspective, in ALL phases

### Issue 2: Body not capsule-shaped  
- The body (`SphereGeometry` scaled as ellipsoid) appears paper-thin from certain camera angles
- Originally `body.radius = 0.06` (very thin) + `BODY_ROTY = 100°` (rotated nearly edge-on — a CSS-era hack)

---

## What Was Tried (and failed)

### Attempt 1: `group.lookAt()` toward travel direction
**File**: `Decorativebutterflies.tsx` → `tickSpawning()`
```ts
scratchLerp.copy(group.position).add(dir);
group.lookAt(scratchLerp);
group.rotateY(Math.PI);
```
**Result**: HORRIBLE. The `lookAt` fights with the inner `ButterflyWebGL` base pose rotation (`-80°, 55°, -10°`), producing bizarre angles. The butterfly geometry has its own tilt baked in via `BASE_POSE_RX/RY/RZ` in `ButterflyWebGL.tsx`, so applying `lookAt` to the outer group compounds rotations in unexpected ways.

### Attempt 2: Yaw-only rotation (Y axis only)
**File**: `Decorativebutterflies.tsx` → `tickSpawning()`
```ts
const yaw = Math.atan2(dir.x, dir.z);
group.rotation.set(0, yaw + Math.PI, 0);
```
**Result**: Still bad. The butterflies appeared twisted because the inner base pose already has significant rotations. The yaw rotation conflicted with those. Also only applied during spawn, not other phases.

### Attempt 3: Billboard (copy camera quaternion)
**File**: `Decorativebutterflies.tsx` → `useFrame()` after switch block
```ts
group.quaternion.copy(camera.quaternion);
```
**Result**: The billboard approach keeps the butterfly always facing the camera, but **does not fix the "facing right" issue** — all butterflies face the same direction relative to the camera, but the underlying mesh orientation (base pose) still determines whether the head appears left or right. The user says it's still not looking correct.

### Body fix: Increased radius + removed BODY_ROTY
**File**: `butterfly/constants.ts`
```ts
body: { radius: 0.10, halfHeight: 0.4 },  // was 0.06
BODY_ROTY = 0 * DEG2RAD;                   // was 100°
```
**Result**: Uncertain if this alone was sufficient — hard to evaluate in isolation since the orientation issues dominate visual perception.

### Flap speed changes
- Originally `120 + Math.random() * 140` ms (120–260ms)
- Tried `400 + Math.random() * 300` ms → too slow
- Set to `150` ms (matching CSS `$duration-base: 0.15s`) → user says same as main butterfly, accepted

---

## Current State of Code

### Files modified from original:
1. **`butterfly/constants.ts`**: `body.radius` 0.06→0.10, `BODY_ROTY` 100°→0°  
2. **`Decorativebutterflies.tsx`**: 
   - `flapDuration` set to `{ left: 150, right: 150 }`
   - `useFrame` now destructures `{ camera }` 
   - After the phase switch block: `group.quaternion.copy(camera.quaternion)` (billboard)
   - All previous rotation attempts (lookAt, yaw) have been removed

### Key architecture to understand:

**Two levels of rotation**:
- **Outer group** (`groupRefs`): positioned by tick functions, now billboarded via quaternion copy
- **Inner ButterflyWebGL**: has its own `rootRef` with flight-path sway animation, and inside that a **static base-pose group** with `rotation={[BASE_POSE_RX, BASE_POSE_RY, BASE_POSE_RZ]}` = `(-80°, 55°, -10°)` in radians

**The base pose** (`ButterflyWebGL.tsx` lines ~62-64):
```ts
const BASE_POSE_RX = -80 * DEG2RAD;
const BASE_POSE_RY = 55 * DEG2RAD;
const BASE_POSE_RZ = -10 * DEG2RAD;
```
This was designed to replicate the CSS `rotateX(50) rotateY(20) rotateZ(-50)` from the CSS butterfly animation. In CSS 3D with flat perspective this looks like "facing right". In true WebGL 3D it may not produce the same visual.

**Wing geometry**: Shape is in XY plane, hinge at x=0, wing extends to -x. Upper wing is bigger (w=1.3, h=0.7), lower is smaller (w=1.0, h=0.55). The "head" is visually where the bigger wing is.

**`flipPetals` prop**: When `true`, adds `Math.PI` rotation to each wing petal's Y axis. Decorative butterflies use `flipPetals={true}`.

**Flight path animation** (`animation.ts`): The `interpolateFlightPath` function applies local body sway via `rootRef.current.rotation.set(fp.rx, fp.ry, fp.rz)` and slight position/scale changes. The `sx` values in keyframes are all negative (-1, -1.03, etc.) which flips the X scale.

---

## Root Cause Analysis (for next attempt)

The fundamental problem is that the butterfly geometry + base pose was designed to look correct when rendered as a **CSS 3D transform viewed head-on by a fixed camera**. In that context:
- CSS `rotateX(50deg) rotateY(20deg) rotateZ(-50deg) scaleX(-1)` makes the butterfly look like it's facing right with a nice 3D tilt
- The perspective is always from the front (the CSS viewer)

In the WebGL scene:
- The camera **orbits** around the scene on a sphere
- The butterfly is a true 3D object that gets viewed from all angles
- The base pose that looked good from one angle looks weird/mirrored/flat from others
- Simply billboarding (quaternion copy) keeps it facing the camera but doesn't address the internal orientation

### Possible approaches to explore:
1. **Adjust BASE_POSE rotation values** in `ButterflyWebGL.tsx` to work better with billboarding — the billboard keeps the group facing the camera, but the base pose tilt/yaw may need tweaking so the "head right" look works from the camera's POV
2. **Remove flipPetals** for decorative butterflies and test — the `flipPetals` + `scaleX(-1)` in flight path may be double-mirroring
3. **Make the flight path sx positive** (remove the negative scaleX) for decorative butterflies — the CSS animation uses `scaleX(-1)` which mirrors the butterfly, originally needed for CSS left-facing layout but may cause the backwards look in WebGL
4. **Use a simpler base pose** for decorative butterflies (less aggressive tilt) that looks good from all billboard angles, different from the interactive CSS butterfly

The `sx: -1` in `FLIGHT_PATH_KEYFRAMES` constants.ts is suspicious — it applies a negative X scale every frame via `rootRef.current.scale.set(fp.sx * BUTTERFLY_BASE_SCALE, ...)`, which effectively mirrors the butterfly. Combined with `flipPetals={true}`, this could be a double-mirror causing the backwards appearance.
