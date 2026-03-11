# Butterfly Intro — iOS Performance Improvement Plan

## What's Actually Happening on iOS

Before fixes: the intro stacks **three concurrent heavy workloads** in the same 10-second window.

1. **Three.js canvas** — GSAP CatmullRom camera animation running every RAF frame, updating `camera.position`, `lookAt`, and `OrbitControls` each tick.
2. **9× `DecorativeButterflyInstance` via `useFrame`** — each butterfly runs its own phase logic + trig math per frame, and each one has a `<Html>` portal that bridges Three.js → DOM.
3. **CSS animations inside each `<Html>` portal** — per-wing `rotateY` keyframes (100–220ms cycle), `transform-style: preserve-3d` stacking, `flightPathLeft/Right` (10s, 10 keyframes each), and 6 sparkle animations on the interactive butterfly.

iOS Safari is a **single-threaded GPU-constrained environment**: Metal (the GPU) handles compositing, but the main JS thread drives both the canvas and the DOM. `preserve-3d` forces the browser to promote every animated wing to its own compositor layer, and with 9 decorative butterflies × 2 wings × 2 `.bit` divs that's potentially **36+ compositor layers** all flapping in sync with a Three.js canvas redraw happening in the same frame.

---

## Root Causes, Ranked by Impact

### 1. `<Html>` portals inside `useFrame` — the biggest culprit

`@react-three/drei`'s `<Html>` component injects a DOM subtree that is repositioned every frame by the Three.js render loop. Each of the 9 decorative butterfly instances updates `group.position` every frame via `useFrame`, which in turn forces Three.js to recalculate the CSS `transform` of the HTML portal every frame. That's **9 forced style recalculations per frame** in addition to the canvas draw. On desktop this is invisible; on iOS it's a 16ms budget killer.

### 2. CSS `transform-style: preserve-3d` on every wing

`preserve-3d` opts elements out of the browser's flat compositing path. Every element with `preserve-3d` gets its own GPU texture, uploaded every time the animation changes. The `flightPathLeft/Right` keyframes mutate six transform properties simultaneously (`rotateX`, `rotateY`, `rotateZ`, `translateX`, `translateY`, `scaleX`) — this cannot be reduced to a simple matrix upload and invalidates the layer each keyframe step.

### 3. `box-shadow` on animated elements

The `.bit` elements use multiple layered `box-shadow` values (up to 5 inset + 5 outer), and there's a `transition: box-shadow 0.3s ease` on them. `box-shadow` is **not GPU-composited** — it triggers a repaint on the CPU whenever it changes. On hover this is fine, but the shadow is present on all animated wings regardless.

### 4. 9× `useFrame` subscriptions during intro

Each `DecorativeButterflyInstance` subscribes to `useFrame` independently. Three.js fires all of these every render frame. During the spawning phase they also call `setOpacity` (a React state setter) whenever opacity changes by >0.04 — this triggers re-renders that cascade into the `<Html>` portal DOM tree.

### 5. GSAP + OrbitControls update on every frame

`useCameraAnimation` calls `controls.update()` inside the GSAP `onUpdate` callback. `OrbitControls.update()` recalculates the orbit matrix even when controls are disabled, adding unnecessary work during the intro when the user can't interact anyway.

---

## Improvement Plan

### A — Reduce DOM butterfly count on mobile (Product change, high impact, low risk)

**What:** Detect mobile/low-end devices and spawn fewer decorative butterflies — e.g., 4 on mobile vs 9 on desktop.

**How:**

```ts
// In DecorativeButterflies or ForestScene
const isMobile =
  /iPhone|iPad|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

<DecorativeButterflies count={isMobile ? 4 : 9} flyAwayAfterMs={6500} />;
```

This is the single highest-leverage change. Halving the butterflies cuts `useFrame` subscriptions, `<Html>` portals, CSS animation layers, and DOM repaint area roughly in half.

---

### B — Replace `<Html>` portals with Canvas-native sprites for decorative butterflies (Architectural change, high impact, medium effort)

**What:** Decorative butterflies are purely visual — they don't need to be clickable HTML. Replace them with `THREE.Sprite` or a simple instanced plane mesh using a pre-rendered butterfly texture (one canvas draw of the CSS butterfly, exported as a PNG or generated procedurally).

**Why it helps:** Eliminates all 9 `<Html>` DOM portals, all CSS animations, and all per-frame style recalculations for the decorative instances. Everything stays on the GPU.

**How:** Render one butterfly frame to an `OffscreenCanvas` at init time, create a `THREE.SpriteMaterial` from it, and drive flapping by lerping UV offsets or swapping between 2–3 pre-baked frames. Position and opacity updates stay entirely within the Three.js scene graph with no DOM involvement.

This is the most impactful architectural change if B is feasible.

### Why `<Html>` is the problem here specifically

`@react-three/drei`'s `<Html>` works by maintaining a real DOM node that it repositions every frame using a CSS `transform: matrix3d(...)` calculated from the Three.js camera. So every time `group.position` changes in `useFrame`, Three.js must:

1. Project the 3D world position through the camera matrix
2. Write a new CSS `transform` to the portal wrapper
3. The browser parses that transform and schedules a composite

For 9 butterflies that's 9 style mutations per frame **on top of** the canvas draw. On iOS Safari, style mutations are synchronous with the frame pipeline — they can't be deferred. The browser can't begin compositing the canvas until all pending style work is resolved. That's why the frame time blows past 16ms.

The fix is to remove DOM entirely from the decorative butterflies. Decorative butterflies have **no interactivity, no text, no accessibility role** — there is zero reason for them to be HTML. Everything they do (move, scale, fade, flap wings) can be done natively in the Three.js scene graph.

---

### How to Represent a Butterfly on Canvas

A butterfly in CSS is: two wings (each made of two `.bit` divs with `border-radius`, gradient, and `rotateY` animation) + a body pseudo-element. The entire visual is a CSS construction. To move it to canvas we need to bake it into a texture.

**The approach: pre-render two frames to a `CanvasTexture`.**

Frame 1 = wings open (rotateY ≈ 0°)  
Frame 2 = wings closed (rotateY ≈ 70°)

Then drive the flap by lerping a shader `mix` between the two textures, or more simply by swapping which texture is displayed based on a per-butterfly timer.

```
┌──────────────────────────────────────────────────┐
│  OffscreenCanvas (256×256 px)                    │
│  ┌──────────────┐   ┌──────────────┐             │
│  │  Frame 0:    │   │  Frame 1:    │             │
│  │  wings open  │   │ wings folded │             │
│  └──────────────┘   └──────────────┘             │
│  → exported as two CanvasTexture                 │
└──────────────────────────────────────────────────┘
         ↓
  THREE.SpriteMaterial
  (swap texture to fake flapping)
```

---

### Phase-by-Phase Breakdown of What Changes

Below is each phase of `DecorativeButterflyInstance` and exactly what work moves from DOM → canvas.

---

#### Phase 1: Spawning

**Current:**

- `group.position` lerps from `spawnOrigin` to `wanderTarget`
- `group.scale.setScalar(...)` animates from 0.005 → 1.0
- `setSmoothedOpacity(easedProgress)` triggers `setOpacity` → React re-render → `<Html>` portal gets `style.opacity` updated

**With sprites:**

- `sprite.position` lerps — same logic, no change
- `sprite.scale.setScalar(...)` — same logic, Three.js handles it, no DOM
- Opacity: `sprite.material.opacity = easedProgress` — one GPU uniform write. **Zero DOM involvement.** No React state, no re-render, no style recalc

The S-wave computation (`computeSWaveOffset`) is pure math — it stays completely unchanged.

---

#### Phase 2: Wandering

**Current:**

- `group.position.set(...)` updates every frame → forces `<Html>` to recalculate its `transform: matrix3d(...)` and push it to the DOM every frame

**With sprites:**

- `sprite.position.set(...)` — same math, but it's a Three.js scene graph mutation. No DOM. Batched with all other scene objects into a single WebGL drawcall.

The orbit math (cos/sin, breathing radius) is unchanged.

---

#### Phase 3: Gathering

**Current:**

- `group.position` lerps toward `SWARM_CENTER`
- `<Html>` recalculates position in world space each frame

**With sprites:**

- Same lerp, but again entirely within the scene graph
- The S-wave flourish during gathering stays the same

---

#### Phase 4: Swarming

**Current:**

- `group.position` updates every frame with orbit + bob + drift math
- The `<Html>` bridge fires 9 matrix3d recalculations per frame during the longest phase

**With sprites:**

- All position math is identical
- The visual flapping during swarming needs handling: swap between the open/closed textures at the per-butterfly `flapDuration` interval

```ts
// Fake flapping by toggling texture
const flapCycle =
  (totalElapsed % (flapDuration / 1000)) / (flapDuration / 1000);
sprite.material.map = flapCycle < 0.5 ? textureOpen : textureClosed;
sprite.material.needsUpdate = true;
```

This is one boolean + one texture pointer swap per butterfly per frame — far cheaper than CSS `rotateY` recalc on multiple DOM nodes.

---

#### Phase 5: Flying Away

**Current:**

- `group.position` lerps to `flyAwayTarget`
- `setSmoothedOpacity(1 - easedProgress)` → same React re-render chain as spawning
- `setVisible(false)` → unmounts `<Html>` portal

**With sprites:**

- `sprite.position` lerps — same math
- `sprite.material.opacity = 1 - easedProgress` — one GPU write
- On complete: `sprite.visible = false` or remove from scene — zero DOM unmount cost

---

### What Does the Sprite Actually Look Like?

The CSS butterfly is beautiful and detailed. A sprite baked from an `OffscreenCanvas` will look slightly simpler, but at the scale decorative butterflies appear at (`distanceFactor={2}`, often many units away from the camera), the detail difference is invisible in practice.

**Two options for baking:**

**Option 1 — Draw on `OffscreenCanvas`** using `canvas.arc`, gradient fills, and bezier curves to approximate the wing shapes. This keeps it code-only (no image assets).

**Option 2 — Render the CSS butterfly to an image once at app start.** Mount the butterfly CSS component into a hidden off-screen DOM node, use `html2canvas` or similar to rasterize it, extract the pixel data, upload to `CanvasTexture`. Then unmount the DOM node. This gives you the exact same visual as the CSS version.

Option 2 is simpler to maintain since the source of truth for the visual stays in the SCSS.

---

### What Stays as `<Html>`?

**Only the interactive butterfly** (`Butterfly.tsx` without `decorative` prop). It has an `aria-label`, handles clicks, opens the window state — it genuinely needs to be DOM. This one `<Html>` portal (vs the current 10) is fine.

---

### Summary of B

| Concern               | Before                                    | After                                 |
| --------------------- | ----------------------------------------- | ------------------------------------- |
| DOM portals per frame | 9 `matrix3d` style writes                 | 0                                     |
| Opacity changes       | React state → re-render → `style.opacity` | `material.opacity =` (GPU uniform)    |
| Wing flapping         | CSS `rotateY` keyframes on 36+ divs       | Texture swap, 1 pointer per butterfly |
| `visible = false`     | React unmount + DOM removal               | `sprite.visible = false`              |
| Scale animation       | `group.scale` → `<Html>` scaling          | `sprite.scale` directly               |
| Phase/movement math   | Unchanged                                 | Unchanged                             |

---

### C — Consolidate `useFrame` into a single parent loop (Architectural change, medium impact, medium effort)

**What:** Instead of 9 independent `useFrame` subscriptions, move all butterfly tick logic into a single `useFrame` in the `DecorativeButterflies` parent that iterates over all butterfly data stored in refs.

**How:**

```ts
// In DecorativeButterflies parent
const butterflyRefs = useRef<THREE.Group[]>([]);
const butterflyStates = useRef(/* array of phase/elapsed data */);

useFrame((_, delta) => {
  butterflyStates.current.forEach((state, i) => {
    const group = butterflyRefs.current[i];
    if (!group) return;
    tickButterfly(group, state, delta); // pure function, no setState
  });
});
```

This reduces the Three.js `useFrame` subscription list from N+1 to 2 (the parent + CameraControls) and avoids the per-instance React render cycle.

#### The Problem with N Independent Subscriptions

Each `DecorativeButterflyInstance` calls `useFrame()`. Under the hood, `@react-three/fiber` maintains a **subscriber set** — an array it iterates on every render frame calling each registered callback. With 9 instances:

```
Frame tick:
  → fiber iterates subscriber array
  → calls instance-0 useFrame callback
  → calls instance-1 useFrame callback
  → ... × 9
  → calls CameraControls useFrame (via useDynamicFov)
```

Each callback is a closure with its own captured `refs`. That's fine. But each instance also has `phase`, `totalElapsed`, `phaseElapsed`, `currentOpacity`, `spawnOrigin`, `flyAwayStart`, `flyAwayTarget`, `flyAwayElapsed`, `flyAwayDuration` as **separate refs inside separate React component instances**. React renders each instance independently. When `setOpacity` fires in instance 3, only instance 3 re-renders — but that re-render causes fiber to re-check the `<Html>` portal for instance 3, even if nothing visible changed.

The goal of C is: **one `useFrame`, one place where all butterfly state lives, zero per-butterfly React component instances that re-render independently.**

---

### The Key Design Constraint You Raised

Each butterfly has its own phase, and within each phase its own params. They must stay independent. This is preserved in C — the difference is _where_ that state lives, not _that_ it exists.

Instead of per-component refs scattered across 9 React component instances, all mutable runtime state moves into a **single ref holding an array of state objects** in the parent.

---

### What the State Array Looks Like

```ts
// This is the mutable per-butterfly runtime state
// Lives in ONE ref in the parent component — never in React state
interface ButterflyRuntimeState {
  // Identity + static config (from ButterflyData, unchanged)
  id: number;
  data: ButterflyData;

  // Phase tracking — each butterfly advances independently
  phase: Phase;
  totalElapsed: number;
  phaseElapsed: number;

  // Opacity — mutated directly into the sprite material, no React state
  currentOpacity: number;

  // Spawning
  spawnOrigin: THREE.Vector3;

  // FlyAway
  flyAwayStart: THREE.Vector3 | null;
  flyAwayTarget: THREE.Vector3 | null;
  flyAwayElapsed: number;
  flyAwayDuration: number;

  // Whether to skip this butterfly (gone)
  alive: boolean;
}
```

This is **exactly** the same data that currently lives spread across N component refs. It's just collected into one array.

---

### The Groups and Sprites

Instead of each component owning a `groupRef`, the parent owns a `refs` array:

```ts
const groupRefs = useRef([]);
// or, if you implement B alongside C:
const spriteRefs = useRef([]);
```

These are populated via the `ref` callback on each rendered `<group>` (or `<sprite>`).

---

### The Single `useFrame`

```ts
useFrame((_, delta) => {
  const states = runtimeStates.current;

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    if (!state.alive) continue;

    const group = groupRefs.current[i];
    if (!group) continue;

    state.totalElapsed += delta;
    state.phaseElapsed += delta;

    switch (state.phase) {
      case "spawning": {
        const done = tickSpawning({
          group,
          phaseElapsed: state.phaseElapsed,
          spawnOrigin: state.spawnOrigin,
          wanderTarget: state.data.wanderTarget,   // ← per-butterfly param
          wave: state.data.wave,                    // ← per-butterfly param
          setSmoothedOpacity: (v) => {
            state.currentOpacity = Math.max(0, Math.min(1, v));
            // If using Html: direct DOM mutation (see option D)
            // If using Sprite: sprite.material.opacity = state.currentOpacity
          },
        });
        if (done) {
          state.phase = "wandering";
          state.phaseElapsed = 0;
        }
        break;
      }

      case "wandering": {
        const done = tickWandering({
          group,
          phaseElapsed: state.phaseElapsed,
          wanderTarget: state.data.wanderTarget,   // ← per-butterfly param
          wave: state.data.wave,                    // ← per-butterfly param
          setSmoothedOpacity: (v) => { state.currentOpacity = ...; },
        });
        if (done) {
          state.phase = "gathering";
          state.phaseElapsed = 0;
        }
        break;
      }

      case "gathering": {
        const done = tickGathering({
          group,
          phaseElapsed: state.phaseElapsed,
          wave: state.data.wave,                   // ← per-butterfly param
        });
        if (done) {
          state.phase = "swarming";
          state.phaseElapsed = 0;
        }
        break;
      }

      case "swarming": {
        tickSwarming({
          group,
          phaseElapsed: state.phaseElapsed,
          totalElapsed: state.totalElapsed,
          swarmSlot: state.data.swarmSlot,         // ← per-butterfly param
          wave: state.data.wave,                   // ← per-butterfly param
          bobFrequency: state.data.bobFrequency,   // ← per-butterfly param
          bobAmplitude: state.data.bobAmplitude,   // ← per-butterfly param
        });
        break;
      }

      case "flyingAway": {
        if (!state.flyAwayStart || !state.flyAwayTarget) break;
        state.flyAwayElapsed += delta;
        tickFlyingAway({
          group,
          flyAwayElapsed: state.flyAwayElapsed,
          flyAwayDuration: state.flyAwayDuration,  // ← per-butterfly param
          flyAwayStart: state.flyAwayStart,
          flyAwayTarget: state.flyAwayTarget,
          wave: state.data.wave,                   // ← per-butterfly param
          setSmoothedOpacity: (v) => { state.currentOpacity = ...; },
          onComplete: () => {
            state.alive = false;
            // Signal parent to remove from render — see below
            setGoneIds(prev => new Set(prev).add(state.id));
          },
        });
        break;
      }
    }
  }
});
```

Every `tick*` function receives the same params as before — they are unchanged pure functions. The per-butterfly `data` object (with its unique `wave`, `swarmSlot`, `wanderTarget`, `bobFrequency`, etc.) is still accessed per-iteration. Each butterfly still advances through phases at its own rate because `state.phaseElapsed` and `state.phase` are separate per entry in the array.

---

### How `flyAway` Is Triggered Without `useEffect`

Currently `flyAway` uses a `useEffect` with a `setTimeout` per instance. In the single-loop model, the parent owns one `setTimeout`:

```ts
useEffect(() => {
  const timer = setTimeout(() => {
    const states = runtimeStates.current;
    const now = performance.now() / 1000; // seconds

    states.forEach((state) => {
      if (!state.alive) return;
      // Stagger is preserved: each butterfly's flyAwayDelay is still individual
      setTimeout(() => {
        const group = groupRefs.current[state.id];
        if (!group) return;
        state.flyAwayStart = group.position.clone();
        state.flyAwayTarget = randomEscapeTarget(group.position);
        state.flyAwayElapsed = 0;
        state.phase = "flyingAway";
        state.phaseElapsed = 0;
      }, state.data.flyAwayDelay * 1000); // ← still per-butterfly
    });
  }, flyAwayAfterMs);

  return () => clearTimeout(timer);
}, [flyAwayAfterMs]);
```

Each butterfly's individual `flyAwayDelay` stagger is fully preserved. The only change is the outer trigger is one `useEffect` instead of 9.

---

### What the Render JSX Looks Like

The parent now renders simple `<group>` nodes with no logic — just ref collection. No `DecorativeButterflyInstance` component at all:

```tsx
return (
  <>
    {butterflies
      .filter((b) => !goneIds.has(b.id))
      .map((b, i) => (
        <group
          key={b.id}
          ref={(el) => { groupRefs.current[i] = el; }}
        >
          {/* If keeping Html: */}
          <Butterfly
            decorative
            flapDuration={b.flapDuration}
            // opacity handled via direct DOM ref, not prop
          />
          {/* If implementing B (sprites), this becomes a  instead */}

      ))}
  </>
);
```

---

### What Gets Eliminated

| Before                                                       | After                                                           |
| ------------------------------------------------------------ | --------------------------------------------------------------- |
| 9 `useFrame` subscriptions in fiber's subscriber set         | 1 subscription                                                  |
| 9 React component instances each with their own ref closures | 0 — state lives in one array ref                                |
| 9 independent `useEffect` for flyAway                        | 1 `useEffect` with per-butterfly stagger preserved              |
| `setOpacity` React state per instance (triggers re-render)   | Direct mutation of `state.currentOpacity` + DOM/material update |
| `setVisible` React state (triggers `<Html>` unmount)         | Flip `state.alive = false`, update `goneIds` once               |

---

### What Does NOT Change

- The `tickSpawning`, `tickWandering`, `tickGathering`, `tickSwarming`, `tickFlyingAway` functions — zero modification
- Each butterfly's unique `wave`, `wanderTarget`, `swarmSlot`, `bobFrequency`, `bobAmplitude`, `flyAwayDelay`, `flapDuration` — all still per-butterfly, accessed per loop iteration
- The phase progression logic — each butterfly moves through phases independently based on its own `phaseElapsed`
- The visual output — identical to current behavior

The change is purely structural: 9 isolated React component lifetimes → 1 loop iterating over 9 plain objects.

---

### D — Replace `setOpacity` React state with direct style mutation (Quick win, medium impact, low effort)

**What:** Currently, opacity changes trigger `setOpacity` → React re-render → `<Html>` portal update. Instead, hold a ref to the button DOM node and mutate `style.opacity` directly.

**How:**

```ts
const buttonRef = useRef<HTMLButtonElement>(null);

// In useFrame, instead of setOpacity:
if (buttonRef.current) {
  buttonRef.current.style.opacity = String(nextOpacity);
}
```

Zero React renders for opacity during the entire animation. The `>0.04` threshold trick was already trying to reduce this — direct mutation eliminates it entirely.

---

### E — Remove `transform-style: preserve-3d` from CSS flight animations on mobile (CSS change, medium impact, low effort)

**What:** The `flightPathLeft/Right` keyframes already use 3D transforms for visual effect, but `transform-style: preserve-3d` on the `.butterfly` container forces the browser to maintain a full 3D stacking context for all children. On mobile, this is expensive.

**How:** Add a mobile media query:

```scss
@media (max-width: 768px), (pointer: coarse) {
  .butterfly {
    transform-style: flat; // degrades gracefully — wings still animate
  }
}
```

The visual difference is minor (slight z-fighting between wing layers at extreme angles) but the performance gain can be significant on iOS.

---

### F — Eliminate `controls.update()` call during intro (Quick win, low impact, zero risk)

**What:** In `useCameraAnimation.animateToPosition` and `animateSequence`, `controls.update()` is called every GSAP frame even though controls are disabled during the animation.

**How:** Guard it:

```ts
if (controls.enabled) controls.update();
```

---

### G — Skip `camera.updateProjectionMatrix()` during position-only animation (Quick win, low impact, zero risk)

**What:** `updateProjectionMatrix()` is only needed when `fov`, `near`, `far`, or `aspect` changes — not when position changes. Both animation functions call it every frame unnecessarily.

**How:** Remove the call from `onUpdate` in both `animateToPosition` and `animateSequence`. Only call it when FOV actually changes (in `useDynamicFov`).

---

### H — Reduce sparkle count and disable sparkles on mobile (Product change, low impact, zero risk)

**What:** The 6 sparkle elements on the interactive butterfly each run their own `@keyframes` animation with `left`, `top`, `opacity`, `transform` mutations simultaneously. `left`/`top` are layout-triggering properties — they cause reflow on each animation step.

**How:** Replace `left`/`top` animation with `translate()` (GPU only), and reduce to 3 sparkles on mobile:

```scss
// Replace left/top with transform: translate()
@keyframes sparkle1 {
  0% {
    opacity: 0;
    transform: translate(25%, 40%) scale(0);
  }
  15% {
    opacity: 1;
    transform: translate(25%, 40%) scale(1.1) translateY(-8px);
  }
  100% {
    opacity: 0;
    transform: translate(75%, 95%) scale(0) translateY(-22px);
  }
}
```

---

## Recommended Implementation Order

| Priority | Change                                                                        | Effort   | Expected Gain                                              |
| -------- | ----------------------------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| 1        | **A** — Fewer butterflies on mobile                                           | 30 min   | High — immediate relief                                    |
| 2        | **D** — Direct opacity style mutation                                         | 1 hr     | Medium — removes N re-renders/sec                          |
| 3        | **E** — Disable `preserve-3d` on mobile                                       | 30 min   | Medium — fewer compositor layers                           |
| 4        | **F + G** — Remove redundant `controls.update()` / `updateProjectionMatrix()` | 15 min   | Low but free                                               |
| 5        | **H** — Fix sparkle animations to use `transform` only                        | 1 hr     | Low-medium                                                 |
| 6        | **C** — Single `useFrame` loop                                                | 2–3 hr   | Medium–high                                                |
| 7        | **B** — Canvas-native sprites for decorative butterflies                      | 1–2 days | Very high, but requires design decision on visual fidelity |

Changes A through H are all safe and non-breaking. Change B changes the rendering approach for decorative butterflies and needs a visual sign-off, but it's the most complete fix if iOS smoothness is the goal.

---

## Quick Diagnostic: How to Confirm the Bottleneck

Before coding, spend 10 minutes confirming where the time goes:

1. Open Safari on Mac → Develop → your iPhone → Web Inspector
2. Record a Performance trace during the intro
3. Look at the **Frames** track — if frames are >16ms, check whether the long tasks are "Recalculate Style" (→ CSS/DOM issue, confirms A/D/E/H) or "Paint"/"Composite Layers" (→ confirms B/E), or JS (→ confirms C/F/G)

In practice you'll likely see a mix of all three, with "Recalculate Style" dominating — which makes A + D + E the fastest wins.
