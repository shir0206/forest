## Forest Portfolio – Performance Review

This document summarizes the main performance bottlenecks in the Forest portfolio and provides concrete recommendations for improving smoothness and load time. It focuses on the 3D intro, decorative butterflies, and the HTML browser overlay – the heaviest parts of the experience.

---

## 1. Decorative Butterflies – High Per-Frame Cost and DOM Coupling

**File:** `src/components/3d/ForestScene/Decorativebutterflies.tsx`  
**Impact:** Very high (intro jank, dropped frames, especially on mobile/iOS)

### 1.1. Single `useFrame` Loop – Good, but Still Doing A Lot

You’ve already consolidated the butterflies into a **single `useFrame` loop**:

- `useFrame((_, delta) => { ... })` around the main phase switch.
- `ButterflyRuntime` objects in `allRuntimes.current`.
- `groupRefs` and `buttonRefs` arrays for each butterfly.

This is much better than N independent `useFrame` subscriptions, but each frame still:

- Iterates all butterflies.
- Mutates Three.js `group.position` / `group.scale`.
- Writes opacity and scale back into **DOM elements** via `btn.style.opacity` and `btn.style.scale` for each active butterfly.

On constrained devices (especially iOS Safari where canvas and DOM share the same main thread), this combined work easily exceeds the 16 ms/frame budget during the intro.

#### What’s wrong

- Every decorative butterfly is **both**:
  - A Three.js `group` updated every frame; and
  - A DOM subtree (via `<Butterfly>` inside `<Html>`) whose styles are driven from the 3D loop.
- Opacity/scale are synchronized into DOM via:
  - `applyOpacity` → `btn.style.opacity`
  - `applyScale` → `btn.style.scale`
- There are `console.log` calls inside every phase path (`SPAWN`, `WANDER`, `GATHER`, `SWARM`, `FLY_AWAY`), which run **every frame** and add JS and devtools overhead.

#### How to fix

**A. Remove per-frame `console.log`s (quick win)**

- In `Decorativebutterflies.tsx`, delete `console.log` statements inside the `switch (runtime.currentPhase)` block.
- This doesn’t fix the core problem, but it removes unnecessary work from the hottest loop and reduces noise.

**B. Stop driving decorative butterflies through DOM / `<Html>`**

Right now decorative butterflies use the same `Butterfly` UI component as the interactive one, with:

- A `buttonRef` wired into `buttonRefs.current[i]`.
- CSS-driven opacity and scale on that DOM element.

For non-interactive decorative butterflies, this is overkill.

Recommended architectural change:

- **Render decorative butterflies purely as 3D scene elements**, not as HTML.
- Options:
  - Use `THREE.Sprite` with a butterfly texture.
  - Or a plane mesh (`PlaneGeometry`) with a transparent butterfly texture and shader/vertex-based flapping.

Concrete steps:

1. **Create a sprite-based decorative butterfly component**, e.g. `SpriteButterfly.tsx` in your 3D components:
   - Load a butterfly texture once (PNG/WebP).
   - Render a `sprite` (or plane) with `THREE.SpriteMaterial` / `MeshBasicMaterial`:
     - `transparent = true`
     - `depthWrite = false`
     - `depthTest = true`
   - Expose a ref to the underlying mesh/sprite so `DecorativeButterflies` can set position/scale/opacity directly.
2. **In `Decorativebutterflies.tsx`, replace `<Butterfly decorative ... />` with the sprite-based component**, and:
   - Remove `buttonRefs` and the `buttonRef` prop.
   - Remove DOM-specific writes in `applyOpacity` and `applyScale`:
     - Keep `group.scale.setScalar(v)` to drive 3D scale.
     - For opacity, set `material.opacity = v` on the sprite/mesh material instead of `btn.style.opacity`.
3. Optionally simulate wing flapping on the GPU:
   - Either via a simple `sin`-based vertex offset in a custom shader.
   - Or by swapping between 2–3 pre-baked textures (open/closed) based on `totalElapsed` in the `useFrame` loop.

Result:

- Decorative butterflies no longer touch the DOM at all.
- All per-frame work is contained in the Three.js scene graph and WebGL draws.
- Large reduction in main-thread pressure and style recalculations → smoother intro, especially on mobile/iOS.

**C. Reduce decorative butterfly count on low-end devices**

In `ForestScene.tsx`, `butterflyCount` is derived from `DEVICE_CONFIG.butterflyCount[device]`. To improve robustness:

- Ensure **mobile/tablet counts are significantly lower** (e.g. 3–5 instead of 9).
- Consider a **`reducedMotion` / `lowPerfDevice`** flag in `AppContext` based on:
  - `prefers-reduced-motion` media query.
  - OR a simple “low power mode” toggle in UI.

Use that flag to:

- Further reduce `count`.
- Optionally skip certain phases (e.g. go from `SPAWN` → `WANDER` → `FLY_AWAY` without lengthy `SWARM`).

---

## 2. Browser `<Html>` Overlay – Heavy DOM Block Inside 3D Scene

**File:** `src/components/ui/Browser/Browser.tsx`  
**Impact:** High (large DOM subtree inside `<Html>`, potential layout/paint cost)

The `Browser` component renders a full “window” UI inside a Three.js `<Html>` portal:

- `BrowserHeader`
- `Navigation`
- A mapped list of `WebsiteSection` components for each entry in `SCREENS`
- Scroll/visibility tracking via `useScreenVisibility` and `IntersectionObserver`-style logic

This is a good architectural choice for integrating content with the 3D scene, but it has performance implications:

- The `<Html>` wrapper recalculates the DOM container transform relative to the camera on each Three.js frame.
- The subtree underneath can contain:
  - Layout-driven sections (`Overview`, `AboutMe`, `Service`, `Contact`).
  - Potentially heavy CSS (shadows, gradients, blur, etc.).
  - React re-renders driven by scroll and visibility state.

### 2.1. What’s wrong

- A large interactive HTML subtree is being **repositioned every frame** via `<Html>` while also handling scroll/navigation logic.
- If section content includes large images, complex shadows, or filters, layout/paint cost increases.
- This DOM work happens concurrently with canvas work on the same main thread.

### 2.2. How to fix / mitigate

**A. Defer heavy content until after the intro**

- While `runIntro` is `true` (camera animation + butterflies):
  - Render a **lightweight placeholder** for the browser (frame & header only).
  - Avoid mounting the full list of sections (`SCREENS.map`) and their heavy content.
- When the intro completes (`runIntro` becomes `false` in `AppContext`):
  - Mount the full content inside `Browser`.

Implementation sketch:

- Add an `introCompleted` or reuse `!runIntro` in `AppContext`.
- In `Browser`:
  - If `!runIntro` (or `introCompleted`), render full content.
  - Otherwise, only render a minimal shell (no navigation list, only header + static body).

**B. Audit and simplify CSS**

- Review `browser.scss` and section styles for:
  - `box-shadow` on large elements.
  - `filter` / `backdrop-filter` (`blur`, etc.).
  - Nested `position: fixed`/`sticky` inside the portal.
- Where possible:
  - Replace heavy shadows with simpler ones (or remove them on mobile).
  - Avoid `backdrop-filter` for large regions; it is notoriously expensive.
  - Avoid `background-attachment: fixed` inside the browser DOM.

**C. Tune `<Html>` options**

- You’re using:
  - `center`
  - `distanceFactor={2}`
  - `scale={[0.005, 0.005, 0.005]}`
- Ensure `distanceFactor` and `scale` are fixed and do not change every frame – which they currently do not (good).
- If you notice jitter or unnecessary layout, consider:
  - Using `transform`-only animations inside the portal (no top/left changes).
  - Avoiding per-frame style changes within the portal subtree during the intro.

---

## 3. Camera Controls and Intro Path – Smoothness and Logging

**File:** `src/components/3d/CameraControls/CameraControls.tsx`  
**Impact:** Medium (camera movement smoothness, extra logging)

The camera intro uses `useCameraAnimation` with `SCENE_ANIMATION_POSITIONS` and:

- `duration: 10` seconds for the whole journey.
- `ease: "power2.inOut"`.

You also have a `useEffect` that logs position and FOV on every `OrbitControls` change.

### 3.1. What’s wrong

- `console.log` in the `change` handler:
  - Logs **every time the camera moves**, including during the entire intro and while the user moves the camera.
  - This can add non-trivial overhead in dev builds and clutters the console.

### 3.2. How to fix

**A. Remove or gate logging**

- Either remove the `useEffect` that attaches `handleChange`, or:
  - Wrap the logs in a development guard:
    - Only register `handleChange` when `import.meta.env.DEV` is `true`.
  - Or add a simple `DEBUG_CAMERA` flag in code and toggle it manually when needed.

**B. Verify intro duration vs. work**

- 10 seconds is reasonable, but combined with butterflies and the browser portal, this is still a busy period.
- After applying the butterfly and browser optimizations above, the camera path should feel noticeably smoother without further changes.

---

## 4. Background HDR – GPU Memory and Load Time

**File:** `src/components/3d/ForestScene/Background.tsx`  
**Impact:** Medium (initial load time, GPU memory)

You load an HDR background via:

- `useLoader(THREE.TextureLoader, SCENE_CONFIG.backgroundFile);`
- Apply it as `scene.background` with `EquirectangularReflectionMapping`.

### 4.1. Potential issues

- High-resolution HDR/EXR environments can be:
  - Large on disk → slower network load (if remote) or slower file decode.
  - Heavy on GPU memory.
- While you correctly:
  - Set `texture.colorSpace = THREE.SRGBColorSpace`.
  - Use `EquirectangularReflectionMapping`.
  - Clear the background on unmount.

### 4.2. How to improve

- Ensure `SCENE_CONFIG.backgroundFile` points to an **optimized HDR**:
  - Use tools like `hdrpng`, `LottieF`, or your 3D package’s export options to:
    - Reduce resolution to the minimum that still looks good.
    - Compress with an efficient format if applicable.
- If you only need the background (not reflection), consider:
  - Baking the environment into a lower-res texture.
- If mobile devices struggle:
  - Add a separate, lower-res background for small screens (`SCENE_CONFIG.mobileBackgroundFile`) and branch based on `device`.

---

## 5. General Recommendations and Priorities

### 5.1. Highest-Impact Changes (Do These First)

1. **Remove decorative butterfly DOM coupling**
   - Replace HTML-based `Butterfly` for decorative instances with sprite/mesh-based 3D butterflies.
   - Remove `buttonRefs` and DOM style writes (`btn.style.opacity`, `btn.style.scale`) from `Decorativebutterflies.tsx`.
2. **Reduce decorative butterfly count on mobile / low-power**
   - Lower `DEVICE_CONFIG.butterflyCount` for mobile/tablet.
   - Optionally add `reducedMotion` and skip heavy swarm behavior.
3. **Trim per-frame logging**
   - Remove `console.log` calls from `Decorativebutterflies` and `CameraControls` runtime paths.

### 5.2. Medium-Impact Improvements

4. **Defer heavy browser content during intro**
   - While `runIntro` is true, render only a simplified browser shell.
   - Mount full `SCREENS` content after intro completes.
5. **CSS simplification**
   - Reduce `box-shadow`, `filter`, `backdrop-filter`, and other expensive styles in `browser.scss` and section styles, especially for mobile.

### 5.3. Nice-to-Have Optimizations

6. **Background HDR optimization**
   - Use a smaller, optimized environment texture for mobile.
7. **Performance profiling hooks**
   - Integrate `stats.js` or React Profiler in dev to validate that frame times are stable after each change.

---

## 6. Expected Outcome

After implementing the high-impact changes (sprite-based decorative butterflies, fewer instances on mobile, and trimmed logging), you should see:

- Significantly smoother intro animation, especially on iOS Safari and lower-end devices.
- Lower CPU and GPU usage during the first 10 seconds.
- Reduced main-thread contention between Three.js and DOM work.

The medium-impact improvements around the browser overlay and CSS will further smooth interactions as the user scrolls and navigates through content, making the overall experience feel lighter and more responsive.

