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
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent) 
  || window.innerWidth < 768;

<DecorativeButterflies count={isMobile ? 4 : 9} flyAwayAfterMs={6500} />
```

This is the single highest-leverage change. Halving the butterflies cuts `useFrame` subscriptions, `<Html>` portals, CSS animation layers, and DOM repaint area roughly in half.

---

### B — Replace `<Html>` portals with Canvas-native sprites for decorative butterflies (Architectural change, high impact, medium effort)

**What:** Decorative butterflies are purely visual — they don't need to be clickable HTML. Replace them with `THREE.Sprite` or a simple instanced plane mesh using a pre-rendered butterfly texture (one canvas draw of the CSS butterfly, exported as a PNG or generated procedurally).

**Why it helps:** Eliminates all 9 `<Html>` DOM portals, all CSS animations, and all per-frame style recalculations for the decorative instances. Everything stays on the GPU.

**How:** Render one butterfly frame to an `OffscreenCanvas` at init time, create a `THREE.SpriteMaterial` from it, and drive flapping by lerping UV offsets or swapping between 2–3 pre-baked frames. Position and opacity updates stay entirely within the Three.js scene graph with no DOM involvement.

This is the most impactful architectural change if B is feasible.

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
  0%   { opacity: 0; transform: translate(25%, 40%) scale(0); }
  15%  { opacity: 1; transform: translate(25%, 40%) scale(1.1) translateY(-8px); }
  100% { opacity: 0; transform: translate(75%, 95%) scale(0) translateY(-22px); }
}
```

---

## Recommended Implementation Order

| Priority | Change | Effort | Expected Gain |
|----------|--------|--------|---------------|
| 1 | **A** — Fewer butterflies on mobile | 30 min | High — immediate relief |
| 2 | **D** — Direct opacity style mutation | 1 hr | Medium — removes N re-renders/sec |
| 3 | **E** — Disable `preserve-3d` on mobile | 30 min | Medium — fewer compositor layers |
| 4 | **F + G** — Remove redundant `controls.update()` / `updateProjectionMatrix()` | 15 min | Low but free |
| 5 | **H** — Fix sparkle animations to use `transform` only | 1 hr | Low-medium |
| 6 | **C** — Single `useFrame` loop | 2–3 hr | Medium–high |
| 7 | **B** — Canvas-native sprites for decorative butterflies | 1–2 days | Very high, but requires design decision on visual fidelity |

Changes A through H are all safe and non-breaking. Change B changes the rendering approach for decorative butterflies and needs a visual sign-off, but it's the most complete fix if iOS smoothness is the goal.

---

## Quick Diagnostic: How to Confirm the Bottleneck

Before coding, spend 10 minutes confirming where the time goes:

1. Open Safari on Mac → Develop → your iPhone → Web Inspector
2. Record a Performance trace during the intro
3. Look at the **Frames** track — if frames are >16ms, check whether the long tasks are "Recalculate Style" (→ CSS/DOM issue, confirms A/D/E/H) or "Paint"/"Composite Layers" (→ confirms B/E), or JS (→ confirms C/F/G)

In practice you'll likely see a mix of all three, with "Recalculate Style" dominating — which makes A + D + E the fastest wins.
