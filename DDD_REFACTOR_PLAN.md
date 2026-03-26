# DDD Refactoring Plan — 3D Forest Scene Portfolio
**v3 — with splitting rules, file-level export mapping, and structural corrections**

---

## Splitting Rules

These rules decide how every large file is broken up and where each piece lands.

### Rule 1 — One reason to change per file
A file should only need to change when one specific thing changes. If editing "camera presets" could also accidentally affect "scene background config", they're in the wrong file together.

### Rule 2 — Type definitions live in the domain that owns them
Types that describe a domain concept belong inside that domain, not in a global `types/` folder. `CameraConfig` lives in `domains/camera/`, `ScreenConfig` lives in `domains/browser/`. The only exception is a type used by 3+ unrelated domains — that becomes a shared primitive.

### Rule 3 — Shared primitives go to `shared/types/`
`PositionThreeD` is used by `camera`, `scene`, and `butterfly`. It has no owner domain → `shared/types/primitives.ts`.

### Rule 4 — Config constants live in the domain that reads them
`SCENE_CONFIG` is only read by `ForestScene` → `domains/scene/`. `CAMERA_ANIMATION_PRESETS` is only read by `useCameraAnimation` → `domains/camera/`. They don't share a file just because they both came from `config/3d.ts`.

### Rule 5 — Utilities (functions) are separate from constant data
`detectDevice()` is a function. `DEVICE_CONFIG` is a constant. Even if they're related, a pure function that reads `navigator` belongs in its own file so it can be tested and replaced independently.

### Rule 6 — No cross-domain types in one file
`types/app.ts` mixes `WindowState` (browser), `Language` (i18n), `WhatsAppConfig` (contact), `AppContextType` (context), `SectionComponent` (sections). Each goes to its owner domain.

### Rule 7 — Internal hooks stay inside their component folder
A hook used by exactly one component lives next to that component, not in `domain/hooks/`. It only moves to `domain/hooks/` when 2+ components in the same domain use it.

### Rule 8 — Config that imports components is a browser concern
`SCREENS` in `config/app.ts` imports `Overview`, `AboutMe`, `Service`, `Contact` — section components. That dependency makes it a browser/UI config, not a global app config.

---

## Structural Corrections

| Item | Wrong place (old plan) | Correct place | Reason |
|---|---|---|---|
| `AppContext` + `ContextBridge` | `shared/contexts/` | `domains/context/` | Context is its own domain, not shared infrastructure |
| `Loader` | `shared/components/` | `domains/scene/components/Loader/` | Used only by `ForestScene` |
| `LanguageSwitcher` | `shared/components/` | `domains/navigation/components/LanguageSwitcher/` | Navigation UI concern |
| `Icon` | anywhere else | `shared/components/Icon/` | Truly cross-domain, used everywhere |
| contact link utils | `src/contact/utils/` | `domains/contact/utils/` | Must live inside the domain |
| `src/config/3d.ts` | kept as-is | **DELETE** — contents redistributed | Mixes scene + camera concerns |
| `src/config/app.ts` | kept as-is | **DELETE** — contents redistributed | Mixes browser + root concerns |
| `src/types/3d.ts` | kept as-is | **DELETE** — contents redistributed | All types have a domain owner |
| `src/types/app.ts` | kept as-is | **DELETE** — contents redistributed | All types have a domain owner |

---

## Export-by-Export Migration

### `src/types/3d.ts` → DELETE

| Export | New file | Reason |
|---|---|---|
| `PositionThreeD` | `shared/types/primitives.ts` | Used by scene + camera + butterfly — no single owner |
| `CameraConfig` | `domains/camera/types.ts` | Describes camera setup — camera domain owns it |
| `SceneConfig` | `domains/scene/types.ts` | Describes the 3D scene — scene domain owns it |
| `AnimationTiming` | `domains/camera/types.ts` | `introDuration`, `cameraMove`, `screenTransition` — all camera-driven |

---

### `src/types/app.ts` → DELETE

| Export | New file | Reason |
|---|---|---|
| `WindowState`, `WINDOW_STATE` | `domains/browser/types.ts` | The browser window has open/minimized/maximized/closed states |
| `Language`, `LANGUAGE` | `i18n/types.ts` | Already has a home — merge here |
| `DeviceType`, `DEVICE_TYPE` | `domains/context/types.ts` | Device is part of app context state (`AppContextType`) |
| `SCREEN_IDS`, `ScreenId` | `domains/browser/types.ts` | Identifies browser screens |
| `ScreenConfig` | `domains/browser/types.ts` | Describes the shape of a registered screen |
| `AppState` | `domains/context/types.ts` | The context provider manages this |
| `AppContextType` | `domains/context/types.ts` | The context value shape |
| `AnimationConfig` | `domains/browser/types.ts` | spring/ease config used for UI transitions |
| `MovingDirection` | `domains/camera/types.ts` | Left/right is camera-relative spatial awareness |
| `PositionThreeD` *(duplicate)* | **DELETE** | Already exists in `types/3d.ts` — remove |
| `WhatsAppConfig` | `domains/contact/types.ts` | Contact link generation type |
| `GoogleCalendarConfig` | `domains/contact/types.ts` | Contact link generation type |
| `EmailConfig` | `domains/contact/types.ts` | Contact link generation type |
| `SectionComponent` | `domains/sections/types.ts` | Describes the prop shape of a section component |

---

### `src/config/3d.ts` → DELETE

| Export | New file | Reason |
|---|---|---|
| `DEVICE_CONFIG` | `domains/scene/config/device.ts` | Butterfly counts and device strings — scene initialisation reads this |
| `detectDevice()` | `domains/scene/config/device.ts` | Pure utility, co-located with the config it supports |
| `SCENE_ANIMATION_POSITIONS` | `domains/camera/config/positions.ts` | These are camera waypoints — camera domain owns them |
| `SCENE_CONFIG` | `domains/scene/config/scene.ts` | Background file, init camera pos, butterfly pos — scene setup |
| `CAMERA_ANIMATION_PRESETS` | `domains/camera/config/presets.ts` | Each preset is a named camera movement style |

---

### `src/config/app.ts` → DELETE

| Export | New file | Reason |
|---|---|---|
| `APP_CONFIG` (basePath) | `config/base.ts` | `basePath` is a true root-level concern |
| `APP_CONFIG` (animationDuration, transitionDuration, debounceDelay) | `domains/browser/config/timing.ts` | UI transition timings — browser domain reads these |
| `SCREENS` | `domains/browser/config/screens.ts` | Imports section components → browser assembles the screen list |
| `ANIMATION_CONFIG` | `domains/browser/config/animation.ts` | spring/ease UI animation presets for browser transitions |

---

## New Folder Structure

```
src/
├── main.tsx
├── App.tsx
├── index.scss
│
├── config/
│   └── base.ts                             ← only APP_CONFIG.basePath (truly global)
│
├── domains/
│   │
│   ├── context/                            ← own domain, not "shared"
│   │   ├── AppContext.tsx                  ← createContext only
│   │   ├── AppProvider.tsx                 ← provider + state logic
│   │   ├── useAppContext.ts                ← useAppContext + useEnhancedAppContext
│   │   ├── ContextBridge.tsx               ← bridges this context → lives here
│   │   ├── types.ts                        ← AppState, AppContextType, DeviceType
│   │   └── index.ts
│   │
│   ├── scene/
│   │   ├── components/
│   │   │   ├── ForestScene/ForestScene.tsx
│   │   │   ├── Background/Background.tsx
│   │   │   ├── CinematicEffects/CinematicEffects.tsx
│   │   │   └── Loader/
│   │   │       ├── Loader.tsx
│   │   │       └── loader.scss
│   │   ├── config/
│   │   │   ├── scene.ts                    ← SCENE_CONFIG (from config/3d.ts)
│   │   │   └── device.ts                   ← DEVICE_CONFIG + detectDevice() (from config/3d.ts)
│   │   ├── types.ts                        ← SceneConfig (from types/3d.ts)
│   │   └── index.ts
│   │
│   ├── camera/
│   │   ├── components/
│   │   │   └── CameraControls/CameraControls.tsx
│   │   ├── config/
│   │   │   ├── presets.ts                  ← CAMERA_ANIMATION_PRESETS (from config/3d.ts)
│   │   │   └── positions.ts                ← SCENE_ANIMATION_POSITIONS (from config/3d.ts)
│   │   ├── hooks/
│   │   │   ├── useCameraAnimation/         ← SPLIT (was 200+ lines)
│   │   │   │   ├── index.ts
│   │   │   │   ├── useCameraAnimation.ts
│   │   │   │   ├── usePositionAnimation.ts
│   │   │   │   ├── useSequenceAnimation.ts
│   │   │   │   └── cameraPositionAnalysis.ts
│   │   │   └── useDynamicFov.ts
│   │   ├── types.ts                        ← CameraConfig, AnimationTiming, MovingDirection
│   │   │                                      CameraAnimationConfig, CameraAnimationSequenceConfig
│   │   └── index.ts
│   │
│   ├── butterfly/
│   │   ├── components/
│   │   │   ├── DecorativeButterflies/      ← SPLIT (was 400+ lines)
│   │   │   │   ├── DecorativeButterflies.tsx
│   │   │   │   ├── ButterflyInstance.tsx
│   │   │   │   ├── useButterfliesPhase.ts  ← internal hook
│   │   │   │   ├── useButterflyRuntime.ts  ← internal hook
│   │   │   │   └── types.ts
│   │   │   ├── ButterflyWebGL/             ← SPLIT (was 150+ lines)
│   │   │   │   ├── ButterflyWebGL.tsx
│   │   │   │   ├── WingMesh.tsx
│   │   │   │   └── useWingAnimation.ts     ← internal hook
│   │   │   └── ButterflyUI/
│   │   │       ├── Butterfly.tsx
│   │   │       └── butterfly.scss
│   │   ├── core/
│   │   │   ├── animation.ts
│   │   │   ├── constants.ts
│   │   │   ├── geometry/
│   │   │   │   ├── index.ts
│   │   │   │   ├── wingGeometry.ts
│   │   │   │   ├── bodyGeometry.ts
│   │   │   │   └── geometryCache.ts
│   │   │   └── materials/
│   │   │       ├── index.ts
│   │   │       ├── wingMaterial.ts
│   │   │       ├── bodyMaterial.ts
│   │   │       └── shaders/
│   │   │           ├── wing.vert.ts
│   │   │           └── wing.frag.ts
│   │   └── index.ts
│   │
│   ├── browser/
│   │   ├── components/
│   │   │   ├── Browser/
│   │   │   │   ├── Browser.tsx
│   │   │   │   └── browser.scss
│   │   │   ├── BrowserHeader/BrowserHeader.tsx
│   │   │   └── WebsiteScreen/WebsiteScreen.tsx
│   │   ├── config/
│   │   │   ├── screens.ts                  ← SCREENS array (from config/app.ts)
│   │   │   ├── timing.ts                   ← animationDuration, transitionDuration, debounceDelay
│   │   │   └── animation.ts                ← ANIMATION_CONFIG spring/ease (from config/app.ts)
│   │   ├── hooks/
│   │   │   └── useHtmlReady.ts
│   │   ├── types.ts                        ← WindowState, WINDOW_STATE, SCREEN_IDS,
│   │   │                                      ScreenId, ScreenConfig, AnimationConfig
│   │   └── index.ts
│   │
│   ├── navigation/
│   │   ├── components/
│   │   │   ├── Navigation/
│   │   │   │   ├── Navigation.tsx
│   │   │   │   ├── NavLink.tsx
│   │   │   │   └── navigation.scss
│   │   │   └── LanguageSwitcher/
│   │   │       ├── LanguageSwitcher.tsx
│   │   │       ├── LanguageDropdown.tsx
│   │   │       ├── useLanguageDropdown.ts  ← internal hook
│   │   │       └── languageSwitcher.scss
│   │   ├── hooks/
│   │   │   ├── useScrollNavigation.ts
│   │   │   ├── useScreenVisibility.ts
│   │   │   └── useScrollVisibility.ts
│   │   └── index.ts
│   │
│   ├── sections/
│   │   ├── Overview/
│   │   │   ├── Overview.tsx
│   │   │   ├── OverviewIntro.tsx
│   │   │   ├── OverviewSkills.tsx
│   │   │   ├── OverviewCTA.tsx
│   │   │   └── overview.scss
│   │   ├── AboutMe/
│   │   │   ├── AboutMe.tsx
│   │   │   └── aboutMe.scss
│   │   ├── Service/
│   │   │   ├── Service.tsx
│   │   │   ├── ServiceCard.tsx
│   │   │   └── service.scss
│   │   ├── Contact/
│   │   │   ├── Contact.tsx
│   │   │   └── contact.scss
│   │   └── types.ts                        ← SectionComponent (from types/app.ts)
│   │
│   └── contact/
│       ├── utils/                          ← SPLIT (was 150+ lines utils/links.ts)
│       │   ├── index.ts
│       │   ├── generateWhatsAppLink.ts
│       │   ├── generateEmailLink.ts
│       │   ├── generateCalendarLink.ts
│       │   └── linkValidators.ts
│       └── types.ts                        ← WhatsAppConfig, GoogleCalendarConfig, EmailConfig
│
├── shared/
│   ├── types/
│   │   └── primitives.ts                   ← PositionThreeD (used by scene + camera + butterfly)
│   └── components/
│       └── Icon/
│           └── Icon.tsx                    ← truly cross-domain, stays in shared
│
└── i18n/
    ├── index.ts
    ├── types.ts                            ← Language, LANGUAGE (merged from types/app.ts)
    └── hooks/
        └── useTranslation.ts
```

---

## Hook Placement Summary

| Hook | Scope | Location |
|---|---|---|
| `useAppContext` / `useEnhancedAppContext` | cross-domain | `domains/context/useAppContext.ts` |
| `useTranslation` | cross-domain | `i18n/hooks/useTranslation.ts` |
| `useCameraAnimation` (+ sub-hooks) | domain-level | `domains/camera/hooks/useCameraAnimation/` |
| `useDynamicFov` | domain-level | `domains/camera/hooks/useDynamicFov.ts` |
| `useScrollNavigation` | domain-level | `domains/navigation/hooks/` |
| `useScreenVisibility` | domain-level | `domains/navigation/hooks/` |
| `useScrollVisibility` | domain-level | `domains/navigation/hooks/` |
| `useHtmlReady` | domain-level | `domains/browser/hooks/` |
| `useLanguageDropdown` | internal | `domains/navigation/components/LanguageSwitcher/` |
| `useButterfliesPhase` | internal | `domains/butterfly/components/DecorativeButterflies/` |
| `useButterflyRuntime` | internal | `domains/butterfly/components/DecorativeButterflies/` |
| `useWingAnimation` | internal | `domains/butterfly/components/ButterflyWebGL/` |

---

## Files Deleted

| File | Why |
|---|---|
| `src/types/3d.ts` | All exports redistributed to domain types |
| `src/types/app.ts` | All exports redistributed to domain types |
| `src/config/3d.ts` | All exports redistributed to scene + camera config |
| `src/config/app.ts` | All exports redistributed to browser config + root base.ts |
| `src/types/translations.ts` | Exact duplicate of `i18n/types.ts` |
| `src/types/app.ts` → `PositionThreeD` | Duplicate of `types/3d.ts` — removed |
