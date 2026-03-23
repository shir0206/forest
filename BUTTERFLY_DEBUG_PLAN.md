# Butterfly Debug Mode & Animation Time Scale

## Part 1: Debug Mode (temporary — remove after tuning)

### Design Principle

All debug code is guarded by a single `DEBUG_BUTTERFLIES` flag and marked with `// 🦋 DEBUG`.  
To clean up: search `🦋 DEBUG`, delete those blocks, remove the flag export. No structural changes to revert.

---

### Activation

```
http://localhost:5173?debugButterflies
```

Remove the query param → normal mode.

---

### File Changes

#### `constants.ts` — add flag

```ts
// 🦋 DEBUG — remove this block when done
export const DEBUG_BUTTERFLIES =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('debugButterflies');
```

#### `ButterflyWebGL.tsx` — freeze animation, expose pose ref

1. Import:
```ts
import { ..., DEBUG_BUTTERFLIES } from "./constants"; // 🦋 DEBUG
```

2. Before `useFrame`, add debug pose ref:
```ts
// 🦋 DEBUG — tweak from console: window.__butterflyPose.rx = 45
const debugPoseRef = useRef({ rx: 68, ry: 55, rz: -30 });
if (DEBUG_BUTTERFLIES && useDecorativePose) {
  (window as any).__butterflyPose = debugPoseRef.current;
}
```

3. At the top of `useFrame`, add early-return debug block:
```ts
if (DEBUG_BUTTERFLIES) {
  // Clear flight-path transform
  if (rootRef.current) {
    rootRef.current.rotation.set(0, 0, 0);
    rootRef.current.scale.setScalar(BUTTERFLY_BASE_SCALE);
  }
  // Drive pose from debugPoseRef (reads every frame → console changes apply live)
  const poseGroup = rootRef.current?.children[0];
  if (poseGroup) {
    poseGroup.rotation.set(
      debugPoseRef.current.rx * DEG2RAD,
      debugPoseRef.current.ry * DEG2RAD,
      debugPoseRef.current.rz * DEG2RAD
    );
  }
  // Wings at rest (mid-flap)
  if (leftFlapRef.current) leftFlapRef.current.rotation.y = FLAP.left.to;
  if (rightFlapRef.current) rightFlapRef.current.rotation.y = FLAP.right.to;
  // Opacity passthrough
  const op = opacityRef.current;
  if (op !== lastOpacity.current) {
    lastOpacity.current = op;
    wingMat.uniforms.uOpacity.value = op * 0.85;
    wingInnerMat.uniforms.uOpacity.value = op * WING_INNER_OPACITY;
    bodyMat.uniforms.uOpacity.value = op;
    borderMat.opacity = op * BORDER_OPACITY;
  }
  return; // skip all animation
}
```

#### `DecorativeButterflies.tsx` — freeze phase, place in visible row

1. Import:
```ts
import { DEBUG_BUTTERFLIES } from "./butterfly/constants"; // 🦋 DEBUG
```

2. At the top of `useFrame`, add early-return debug block:
```ts
if (DEBUG_BUTTERFLIES) {
  for (let i = 0; i < allRuntimes.current.length; i++) {
    const group = groupRefs.current[i];
    if (!group) continue;
    const spacing = 0.4;
    const totalWidth = (count - 1) * spacing;
    group.position.set(-totalWidth / 2 + i * spacing, 0, -2);
    group.scale.setScalar(allRuntimes.current[i].config.visualScale);
    opacityRefs.current[i].current = 1;
    // No billboard — see actual 3D pose
  }
  return;
}
```

3. Guard the fly-away timer:
```ts
useEffect(() => {
  if (DEBUG_BUTTERFLIES) return; // 🦋 DEBUG
  // ... existing timer code
}, [flyAwayAfterMs]);
```

---

### Console Usage

```js
__butterflyPose.rx = 45    // degrees, updates next frame
__butterflyPose.ry = 30
__butterflyPose.rz = -15
JSON.stringify(__butterflyPose)  // read current
```

---

### Cleanup Checklist

Search `🦋 DEBUG` and remove:

- [ ] `constants.ts` — `DEBUG_BUTTERFLIES` export
- [ ] `ButterflyWebGL.tsx` — import, `debugPoseRef`, debug block in `useFrame`
- [ ] `DecorativeButterflies.tsx` — import, debug block in `useFrame`, guard in `useEffect`

---

## Part 2: Animation Time Scale (permanent)

### Problem

Timing is spread across multiple constants/files:

| Value | File | Default |
|---|---|---|
| `FLIGHT_PATH_DURATION` | `constants.ts` | 10s |
| `PHASE_DURATION.spawn/wander/gather` | `DecorativeButterflies.tsx` | 4/4/1s |
| `flyAwayAfterMs` | prop | 9000ms |
| `flapDurationMs` | per-butterfly | 150ms |
| `flyAwayDuration` | runtime | 1.4–2.2s |

### Solution: Single `ANIMATION_TIME_SCALE` multiplier

```ts
// constants.ts (or config/animation.ts)
export const ANIMATION_TIME_SCALE = 1.0; // 0.5 = half speed, 2.0 = double speed
```

### Where to apply

#### A. `ButterflyWebGL.tsx` — flight path + flap

Scale the elapsed time clock:

```ts
const elapsed = (performance.now() / 1000 + timeOffset) * ANIMATION_TIME_SCALE % 1000;
```

One change → both `interpolateFlightPath(elapsed)` and `flapPingPong(elapsed, ...)` slow down together.

#### B. `DecorativeButterflies.tsx` — phase durations

```ts
const PHASE_DURATION = {
  spawn:  4 / ANIMATION_TIME_SCALE,
  wander: 4 / ANIMATION_TIME_SCALE,
  gather: 1 / ANIMATION_TIME_SCALE,
};
```

Also scale:
- `flyAwayAfterMs` prop default: `9000 / ANIMATION_TIME_SCALE`
- `flyAwayDuration` in `createButterflyRuntime`: `(1.4 + Math.random() * 0.8) / ANIMATION_TIME_SCALE`

#### C. `FLIGHT_PATH_DURATION` — already handled

Since elapsed time is scaled in (A), the flight path loop duration effectively changes without touching the constant.

### Usage

```ts
export const ANIMATION_TIME_SCALE = 0.3; // everything runs at 30% speed
```

Set back to `1.0` for production.
