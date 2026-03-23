# Butterfly WebGL Migration — Implementation Plan

## 1. Current HTML + CSS Structure Analysis

### DOM Hierarchy

```
button.butterfly-button.looking-{left|right}
 └─ div.butterfly                         ← root 3D context
     ├─ ::before                          ← body (pseudo-element)
     ├─ div.wing (left)                   ← flapping group
     │   ├─ div.bit (upper large)         ← wing petal
     │   │   └─ ::after                   ← inner overlay
     │   └─ div.bit (lower small)         ← wing petal
     │       └─ ::after                   ← inner overlay
     └─ div.wing (right)                  ← flapping group
         ├─ div.bit (upper large)
         │   └─ ::after
         └─ div.bit (lower small)
             └─ ::after
```

### Transform Chain (looking-left default)

| Node                       | Transform                                                                                               | Origin                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `.butterfly`               | `rotateX(50deg) rotateY(20deg) rotateZ(-50deg) + translate + scaleX(-1)` via `flightPathLeft` keyframes | default                                           |
| `::before` (body)          | `rotateY(100deg)`                                                                                       | default; `left:50%; margin-left:-10px` centres it |
| `.wing:first-child` (left) | `rotateY(-20deg)` → `rotateY(90deg)` (flap)                                                             | `700% 50%` (hinge far right)                      |
| `.wing:last-child` (right) | `rotateY(200deg)` → `rotateY(90deg)` (flap)                                                             | default (left edge)                               |
| `.bit:first-child` (upper) | `rotateZ(40deg)`                                                                                        | `100% 50%` (right edge)                           |
| `.bit:last-child` (lower)  | `rotateZ(-40deg)`                                                                                       | `100% 50%`                                        |
| `.bit::after`              | none (positioned overlay)                                                                               | `100% 50%`                                        |

### Key Visual Properties

- **Body**: 20×110px ellipse, `linear-gradient(249deg, #d6d5ce, #b4afa6)`, `border-radius: 50%`, inner box-shadow lines
- **Wing petals**: organic shape via `border-radius: 0% 100% 50% 50% / 0% 50% 50% 100%`
- **Wing gradient**: 6-stop pastel gradient (`rgba(255,255,255,0.9)` → peach/lavender → white)
- **Wing border**: `1px solid #d3d3d3b5`
- **Wing inner glow**: `inset 0px 7px 20px 4px rgba(214,213,207,0.59)`, plus shadow lines
- **`::after` overlays**: same border-radius shape, offset inward, same box-shadow — creates depth/layering
- **Opacity**: wings at `0.85`

### Dimensions (CSS px, will be converted to Three.js world units)

| Part             | Width | Height |
| ---------------- | ----- | ------ |
| Upper wing petal | 130px | 70px   |
| Upper `::after`  | 100px | 60px   |
| Lower wing petal | 100px | 55px   |
| Lower `::after`  | 60px  | 45px   |
| Body             | 20px  | 110px  |

### Animations

| Animation        | Property                  | Range                 | Duration                      | Easing                              |
| ---------------- | ------------------------- | --------------------- | ----------------------------- | ----------------------------------- |
| `leftflap`       | wing `rotateY`            | -20deg → 90deg        | `var(--flap-duration, 0.15s)` | `cubic-bezier(0.48, 0.01, 0.54, 1)` |
| `rightflap`      | wing `rotateY`            | 200deg → 90deg        | same                          | same                                |
| `flightPathLeft` | root multi-axis transform | 10 keyframes over 10s | 10s                           | ease-in-out                         |

---

## 2. CSS Transform Hierarchy → Three.js Group Tree

The `transform-style: preserve-3d` chain maps directly to nested `<group>` nodes. Each CSS transform becomes a `.rotation` / `.position` on the group.

```
<group>  ← "butterflyRoot" — applies flight-path rotation + translation
 │
 ├─ <mesh>  ← body
 │
 ├─ <group>  ← leftWingHinge (pivot offset to replicate transform-origin: 700% 50%)
 │   ├─ <group>  ← leftWingFlap (rotateY animated for flap)
 │   │   ├─ <group>  ← upperBitGroup (rotateZ 40deg)
 │   │   │   ├─ <mesh>  ← upperBitOuter (wing petal shape)
 │   │   │   └─ <mesh>  ← upperBitInner (::after overlay, slightly smaller + offset)
 │   │   └─ <group>  ← lowerBitGroup (rotateZ -40deg)
 │   │       ├─ <mesh>  ← lowerBitOuter
 │   │       └─ <mesh>  ← lowerBitInner
 │
 └─ <group>  ← rightWingHinge
     └─ <group>  ← rightWingFlap (rotateY animated)
         ├─ <group>  ← upperBitGroup (rotateZ 40deg, mirrored transform-origin)
         │   ├─ <mesh>  ← upperBitOuter
         │   └─ <mesh>  ← upperBitInner
         └─ <group>  ← lowerBitGroup (rotateZ -40deg)
             ├─ <mesh>  ← lowerBitOuter
             └─ <mesh>  ← lowerBitInner
```

### Pivot / Transform-Origin Conversion

CSS `transform-origin` offsets are converted by:

1. Positioning the child group so that the desired pivot point sits at `(0, 0, 0)` of its parent
2. Offsetting the child geometry in the opposite direction

Example — left wing `transform-origin: 700% 50%`:

- Wing width is 1px in CSS → `700%` = 7px offset. In world units this maps to the body's right edge.
- The `leftWingHinge` group is placed at the body's centre-right edge.
- The wing geometry is offset left by the same distance so it visually appears in the correct spot.

---

## 3. Wing & Body Geometry

### Wing Petal Shape

The CSS `border-radius: 0% 100% 50% 50% / 0% 50% 50% 100%` creates an organic petal. We replicate it with `THREE.Shape` + Bézier curves:

```ts
function createWingPetalShape(w: number, h: number): THREE.Shape {
	const shape = new THREE.Shape();
	// Approximate the CSS border-radius petal with 4 quadratic/cubic bezier segments

	// Start at top-left corner (sharp, 0% radius)
	shape.moveTo(0, h);

	// Top edge → top-right (100% border-radius = fully rounded)
	shape.quadraticCurveTo(w, h, w, h * 0.5);

	// Right edge → bottom-right (50% radius)
	shape.quadraticCurveTo(w, h * 0.15, w * 0.5, 0);

	// Bottom edge → bottom-left (50% radius)
	shape.quadraticCurveTo(0, h * 0.15, 0, h * 0.5);

	// Left edge back to start (0% top / 100% bottom)
	shape.lineTo(0, h);

	return shape;
}
```

Four shapes total (upper outer, upper inner, lower outer, lower inner) with dimensions from the CSS:

| Shape                   | CSS dims | World-unit scale factor | Approx world size |
| ----------------------- | -------- | ----------------------- | ----------------- |
| Upper outer             | 130×70   | 0.01                    | 1.3 × 0.7         |
| Upper inner (`::after`) | 100×60   | 0.01                    | 1.0 × 0.6         |
| Lower outer             | 100×55   | 0.01                    | 1.0 × 0.55        |
| Lower inner (`::after`) | 60×45    | 0.01                    | 0.6 × 0.45        |

> Scale factor is approximate — tune to match the existing visual size set by `<Html distanceFactor={2} scale={[0.005, 0.005, 0.005]}>`.

### Body Geometry

Elongated ellipsoid: `CapsuleGeometry(radiusX, halfHeight, capSegments, radialSegments)` or scaled `SphereGeometry`.

- CSS: 20×110px → world ~0.2 × 1.1
- Rotated `rotateY(100deg)` ≈ `rotation.y = 100 * DEG2RAD`

---

## 4. Material Strategy

### Wing Materials — Custom ShaderMaterial

CSS gradients can't be replicated with `MeshBasicMaterial`. Use a minimal `ShaderMaterial`:

```glsl
// Fragment shader
uniform vec3 uColor1;  // rgba(255,255,255,0.9)
uniform vec3 uColor2;  // rgba(240,250,255,0.85)
uniform vec3 uColor3;  // rgba(220,235,255,0.8)
uniform vec3 uColor4;  // rgba(235,220,255,0.8)
uniform vec3 uColor5;  // rgba(255,235,250,0.85)
uniform float uOpacity;

varying vec2 vUv;

void main() {
  // 135deg gradient = diagonal UV mapping
  float t = vUv.x * 0.7 + (1.0 - vUv.y) * 0.3;

  vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 0.2, t));
  color = mix(color, uColor3, smoothstep(0.2, 0.4, t));
  color = mix(color, uColor4, smoothstep(0.4, 0.6, t));
  color = mix(color, uColor5, smoothstep(0.6, 0.8, t));
  color = mix(color, uColor1, smoothstep(0.8, 1.0, t));

  gl_FragColor = vec4(color, uOpacity);
}
```

Properties:

- `transparent: true`
- `side: THREE.DoubleSide` (wings visible from both angles)
- `depthWrite: false` (avoid z-fighting between overlapping transparent layers)

### Inner Overlay Materials (`::after` equivalents)

Same shader, slightly different opacity (layered effect). Positioned `0.001` units forward on local Z to prevent z-fighting.

### Body Material

`MeshBasicMaterial` or simple `ShaderMaterial` with 2-stop gradient:

- `#d6d5ce` → `#b4afa6` at 249deg
- Inner box-shadow effect: additional slightly-smaller mesh with darker color, or emissive edge glow

### Border Effect

The `1px solid #d3d3d3b5` border is replicated by rendering the wing shape as a `LineLoop` with `LineBasicMaterial({ color: 0xd3d3d3, transparent: true, opacity: 0.71 })` placed at the same position as the wing mesh.

---

## 5. Animation System (`useFrame`)

### Wing Flap

```ts
// Inside useFrame callback
const flapT = (Math.sin(elapsed * flapSpeed) + 1) / 2; // 0→1 ping-pong

// Left wing: -20deg → 90deg
leftWingRef.current.rotation.y = THREE.MathUtils.lerp(
	-20 * DEG2RAD,
	90 * DEG2RAD,
	easeFlap(flapT) // cubic-bezier(0.48, 0.01, 0.54, 1) approximation
);

// Right wing: 200deg → 90deg
rightWingRef.current.rotation.y = THREE.MathUtils.lerp(
	200 * DEG2RAD,
	90 * DEG2RAD,
	easeFlap(flapT)
);
```

Flap easing (`cubic-bezier(0.48, 0.01, 0.54, 1)`):

```ts
function easeFlap(t: number): number {
	// Attempt close approximation of the CSS cubic-bezier
	return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
```

Each butterfly has its own `flapDuration` (120–260ms from config) → `flapSpeed = (2 * Math.PI) / (flapDuration / 1000)`.

### Flight Path

The `flightPathLeft` keyframes define 10 stops over 10s with multi-axis rotations + translations. Encode as a lookup table:

```ts
const FLIGHT_PATH_KEYFRAMES = [
	{ t: 0.0, rx: 50, ry: 20, rz: -50, tx: 0, ty: 0, sx: -1 },
	{ t: 0.1, rx: 53, ry: 30, rz: -42, tx: 10, ty: -15, sx: -1.03 },
	{ t: 0.2, rx: 47, ry: 35, rz: -32, tx: 22, ty: -30, sx: -0.96 },
	// ... all 10 keyframes
	{ t: 1.0, rx: 50, ry: 20, rz: -50, tx: 0, ty: 0, sx: -1 },
];
```

In `useFrame`, compute `t = (elapsed % 10) / 10`, find the two surrounding keyframes, and lerp `rotation.x/y/z`, `position.x/y`, and `scale.x`.

### Orchestration (Existing Phase System)

The current `DecorativeButterflies.tsx` phase system (spawn → wander → gather → swarm → fly-away) remains **unchanged**. It already uses `useFrame` and refs. The only change:

- Replace `applyOpacity(v, runtime, btn)` with `materialRef.current.opacity = v`
- Replace `applyScale(v, runtime, group, btn)` with just `group.scale.setScalar(v)` (already done)
- Remove all `buttonRefs` / DOM style manipulation

---

## 6. Performance Strategy

### Geometry Reuse

- Create **one** `ShapeGeometry` per petal type (4 total) outside the component, store in a module-level cache or `useMemo` at the parent level.
- All butterflies share the same geometry instances (Three.js allows this natively).

### Material Reuse

- Create **one** `ShaderMaterial` per visual type (wing outer, wing inner, body, border) — shared across all butterfly instances.
- Per-butterfly opacity is applied via `group.traverse()` on material uniforms, or by cloning only the uniforms (not the full material) if needed.

### Instancing Consideration

Given the count is low (3 mobile, 6 desktop) and each butterfly has independent hierarchical transforms + per-wing animation, **InstancedMesh is not appropriate**. The overhead of 6 butterflies × ~10 meshes = 60 draw calls is negligible.

### Render Loop

- All animation in a **single `useFrame`** callback in `DecorativeButterflies` (already the pattern).
- Zero `useState` per frame — only refs.
- `setGoneIds` fires once per butterfly lifetime (on fly-away complete) — acceptable.

### Geometry Detail

- Wing shapes: `ShapeGeometry(shape, curveSegments=8)` — sufficient for smooth curves at small screen size.
- Body: `SphereGeometry` with 8×6 segments.

---

## 7. File Structure

```
src/components/3d/ForestScene/
├── DecorativeButterflies.tsx    ← refactored: renders <ButterflyWebGL> instead of <Butterfly>
├── ForestScene.tsx              ← unchanged (mounts <DecorativeButterflies />)
├── Background.tsx               ← unchanged
└── butterfly/
    ├── ButterflyWebGL.tsx       ← single-butterfly R3F component (groups + meshes + flap anim)
    ├── geometry.ts              ← createWingPetalShape(), shared geometry cache
    ├── materials.ts             ← ShaderMaterial factories, gradient uniforms, color tokens
    ├── constants.ts             ← design tokens (colors, dimensions, flight-path keyframes)
    └── animation.ts             ← easeFlap(), interpolateFlightPath(), animation helpers
```

### Responsibilities

| File                        | Role                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `ButterflyWebGL.tsx`        | Renders the group hierarchy, attaches refs, runs per-butterfly flap + flight-path in a local `useFrame`       |
| `geometry.ts`               | Exports memoised `ShapeGeometry` instances for each petal variant + body                                      |
| `materials.ts`              | Exports shared `ShaderMaterial` instances with gradient uniforms matching CSS tokens                          |
| `constants.ts`              | All color tokens, dimension tokens, keyframe arrays — single source of truth                                  |
| `animation.ts`              | Pure functions: `easeFlap(t)`, `interpolateFlightPath(elapsed)`, cubic-bezier approximation                   |
| `DecorativeButterflies.tsx` | Phase orchestration (spawn/wander/gather/swarm/fly-away) — logic stays, rendering swaps to `<ButterflyWebGL>` |

---

## 8. Integration Steps

### Step 1 — Create `butterfly/constants.ts`

Port all SCSS design tokens (colors, dimensions) and flight-path keyframe arrays.

### Step 2 — Create `butterfly/geometry.ts`

Implement `createWingPetalShape()` with Bézier curves matching the CSS border-radius. Export 4 cached `ShapeGeometry` instances + body geometry.

### Step 3 — Create `butterfly/materials.ts`

Write the GLSL gradient fragment shader. Export material factories for wing outer, wing inner, body, and border.

### Step 4 — Create `butterfly/animation.ts`

Implement `easeFlap()`, `interpolateFlightPath()`, and the cubic-bezier approximation.

### Step 5 — Create `butterfly/ButterflyWebGL.tsx`

Build the nested group hierarchy matching section 2. Wire up refs for flap groups. Add a local `useFrame` for flap + flight-path animation. Accept props: `flapDuration`, `opacityRef`, `scaleRef`.

### Step 6 — Refactor `DecorativeButterflies.tsx`

- Remove `import Butterfly` and `import "./butterfly.scss"`
- Import `ButterflyWebGL` instead
- Replace `<Butterfly decorative ...>` with `<ButterflyWebGL ...>`
- Replace all `buttonRefs` / DOM style manipulation with material uniform refs
- Keep all phase orchestration logic intact

### Step 7 — Verify `ForestScene.tsx`

Confirm it still mounts `<DecorativeButterflies />` with no changes. The main interactive `<Butterfly>` (non-decorative) stays as HTML overlay — only decorative butterflies move to WebGL.

### Step 8 — Visual QA

Launch the app, compare the WebGL butterflies side-by-side with the original CSS version (temporarily render both). Tune:

- Wing shape curves (Bézier control points)
- Gradient color stops and direction
- Wing opacity layering
- Flap angle range and speed
- Flight-path keyframe interpolation
- Scale factor to match apparent size

### Step 9 — Cleanup

- Remove unused CSS classes related to decorative butterflies
- Remove `<Html>` import if no longer needed in `DecorativeButterflies`
- Remove `buttonRefs` array and DOM opacity logic
