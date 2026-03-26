# DDD Implementation Roadmap — 3D Forest Scene Portfolio

**Version:** 1.0  
**Date:** March 26, 2026  
**Reference:** [DDD_REFACTOR_PLAN.md](./DDD_REFACTOR_PLAN.md)

---

## Overview

This roadmap provides a detailed, phase-by-phase implementation plan for refactoring the 3D Forest Scene Portfolio according to Domain-Driven Design principles. The refactoring will transform the current monolithic structure into well-organized, domain-focused modules with clear boundaries and responsibilities.

## Implementation Phases

### Phase 0: Preparation & Setup

**Objective:** Establish foundation and ensure safe refactoring process

**Prerequisites:**

- Git repository with clean working state
- All tests passing
- Backup of current codebase

**Tasks:**

1. **Create feature branch:** `git checkout -b ddd-refactoring`
2. **Establish baseline:** Run all tests and ensure they pass
3. **Create directory structure:** Set up the new `domains/`, `shared/`, and `config/` folders
4. **Set up validation scripts:** Create scripts to verify imports and dependencies
5. **Document current state:** Capture current file structure and dependencies

**Validation Criteria:**

- ✅ All existing tests pass
- ✅ New directory structure created
- ✅ Feature branch established
- ✅ Baseline performance metrics recorded

**Estimated Duration:** 2-3 hours

---

### Phase 1: Shared Primitives & Foundation

**Objective:** Extract shared primitives and establish the foundation for domain separation

**Dependencies:** Phase 0 completion

**Tasks:**

1. **Create shared primitives:**
   ```bash
   mkdir -p src/shared/types
   touch src/shared/types/primitives.ts
   ```
2. **Extract PositionThreeD:**
   - Move `PositionThreeD` from `src/types/3d.ts` to `src/shared/types/primitives.ts`
   - Update all imports across the codebase
3. **Create shared Icon component:**
   ```bash
   mkdir -p src/shared/components/Icon
   mv src/shared/components/Icon/* src/shared/components/Icon/
   ```
4. **Create domain index files:**
   - Create `src/domains/context/index.ts`
   - Create `src/domains/scene/index.ts`
   - Create `src/domains/camera/index.ts`
   - Create `src/domains/browser/index.ts`

**Validation Criteria:**

- ✅ `PositionThreeD` accessible from `shared/types/primitives.ts`
- ✅ All imports updated and working
- ✅ Shared Icon component properly relocated
- ✅ Domain index files created

**Rollback Plan:**

- Revert PositionThreeD to original location
- Restore original import statements
- Remove new shared directory structure

**Estimated Duration:** 3-4 hours

---

### Phase 2: Domain Types Redistribution

**Objective:** Redistribute type definitions to their owning domains

**Dependencies:** Phase 1 completion

**Tasks:**

#### 2.1 Create Domain Type Files

```bash
# Create domain type directories
mkdir -p src/domains/context/types
mkdir -p src/domains/browser/types
mkdir -p src/domains/camera/types
mkdir -p src/domains/scene/types
mkdir -p src/domains/contact/types
mkdir -p src/domains/sections/types
```

#### 2.2 Move Context Types

- Move `AppState`, `AppContextType`, `DeviceType` to `src/domains/context/types.ts`
- Move `WINDOW_STATE`, `WindowState` to `src/domains/browser/types.ts`
- Move `SCREEN_IDS`, `ScreenId`, `ScreenConfig`, `AnimationConfig` to `src/domains/browser/types.ts`

#### 2.3 Move Camera Types

- Move `CameraConfig`, `AnimationTiming`, `MovingDirection` to `src/domains/camera/types.ts`
- Create `CameraAnimationConfig`, `CameraAnimationSequenceConfig` interfaces

#### 2.4 Move Scene Types

- Move `SceneConfig` to `src/domains/scene/types.ts`

#### 2.5 Move Contact Types

- Move `WhatsAppConfig`, `GoogleCalendarConfig`, `EmailConfig` to `src/domains/contact/types.ts`

#### 2.6 Move Section Types

- Move `SectionComponent` to `src/domains/sections/types.ts`

#### 2.7 Update i18n Types

- Merge `Language`, `LANGUAGE` from `types/app.ts` into `src/i18n/types.ts`

#### 2.8 Clean Up Original Files

- Remove `src/types/3d.ts`
- Remove `src/types/app.ts`
- Remove `src/types/translations.ts` (duplicate)

**Validation Criteria:**

- ✅ All types accessible from their new domain locations
- ✅ All imports updated across codebase
- ✅ No duplicate type definitions
- ✅ TypeScript compilation successful

**Rollback Plan:**

- Restore original type files
- Revert all import statements
- Remove domain type directories

**Estimated Duration:** 6-8 hours

---

### Phase 3: Config Redistribution

**Objective:** Split configuration files according to domain ownership

**Dependencies:** Phase 2 completion

**Tasks:**

#### 3.1 Create Root Config

```bash
mkdir -p src/config
touch src/config/base.ts
```

- Move `APP_CONFIG.basePath` to `src/config/base.ts`

#### 3.2 Create Scene Config

```bash
mkdir -p src/domains/scene/config
touch src/domains/scene/config/scene.ts
touch src/domains/scene/config/device.ts
```

- Move `SCENE_CONFIG` to `src/domains/scene/config/scene.ts`
- Move `DEVICE_CONFIG` and `detectDevice()` to `src/domains/scene/config/device.ts`

#### 3.3 Create Camera Config

```bash
mkdir -p src/domains/camera/config
touch src/domains/camera/config/presets.ts
touch src/domains/camera/config/positions.ts
```

- Move `CAMERA_ANIMATION_PRESETS` to `src/domains/camera/config/presets.ts`
- Move `SCENE_ANIMATION_POSITIONS` to `src/domains/camera/config/positions.ts`

#### 3.4 Create Browser Config

```bash
mkdir -p src/domains/browser/config
touch src/domains/browser/config/timing.ts
touch src/domains/browser/config/animation.ts
touch src/domains/browser/config/screens.ts
```

- Move UI timing configs to `src/domains/browser/config/timing.ts`
- Move `ANIMATION_CONFIG` to `src/domains/browser/config/animation.ts`
- Move `SCREENS` array to `src/domains/browser/config/screens.ts`

#### 3.5 Clean Up Original Configs

- Remove `src/config/3d.ts`
- Remove `src/config/app.ts`

**Validation Criteria:**

- ✅ All configs accessible from their new domain locations
- ✅ All imports updated
- ✅ No broken references
- ✅ Configuration values remain consistent

**Rollback Plan:**

- Restore original config files
- Revert all import statements
- Remove domain config directories

**Estimated Duration:** 4-6 hours

---

### Phase 4: Hook Extraction & Organization

**Objective:** Break down large hooks into focused, domain-specific sub-hooks

**Dependencies:** Phase 3 completion

**Tasks:**

#### 4.1 Camera Animation Hook Refactoring

```bash
mkdir -p src/domains/camera/hooks/useCameraAnimation
touch src/domains/camera/hooks/useCameraAnimation/index.ts
touch src/domains/camera/hooks/useCameraAnimation/useCameraAnimation.ts
touch src/domains/camera/hooks/useCameraAnimation/usePositionAnimation.ts
touch src/domains/camera/hooks/useCameraAnimation/useSequenceAnimation.ts
touch src/domains/camera/hooks/useCameraAnimation/cameraPositionAnalysis.ts
```

**Extract from `src/hooks/animation/useCameraAnimation.ts`:**

- Main hook logic → `useCameraAnimation.ts`
- Position animation logic → `usePositionAnimation.ts`
- Sequence animation logic → `useSequenceAnimation.ts`
- Position analysis utilities → `cameraPositionAnalysis.ts`
- Export wrapper → `index.ts`

#### 4.2 Butterfly Hook Extraction

```bash
mkdir -p src/domains/butterfly/components/DecorativeButterflies
touch src/domains/butterfly/components/DecorativeButterflies/useButterfliesPhase.ts
touch src/domains/butterfly/components/DecorativeButterflies/useButterflyRuntime.ts
touch src/domains/butterfly/components/DecorativeButterflies/types.ts
```

**Extract from `src/components/3d/ForestScene/Decorativebutterflies.tsx`:**

- Phase management logic → `useButterfliesPhase.ts`
- Runtime management logic → `useButterflyRuntime.ts`
- Butterfly-specific types → `types.ts`

#### 4.3 Butterfly WebGL Hook Extraction

```bash
mkdir -p src/domains/butterfly/components/ButterflyWebGL
touch src/domains/butterfly/components/ButterflyWebGL/useWingAnimation.ts
```

**Extract from `src/components/3d/ForestScene/butterfly/ButterflyWebGL.tsx`:**

- Wing animation logic → `useWingAnimation.ts`

#### 4.4 Navigation Hook Organization

- Move `useScrollNavigation.ts` to `src/domains/navigation/hooks/`
- Move `useScreenVisibility.ts` to `src/domains/navigation/hooks/`
- Move `useScrollVisibility.ts` to `src/domains/navigation/hooks/`

#### 4.5 Browser Hook Organization

- Move `useHtmlReady.ts` to `src/domains/browser/hooks/`

#### 4.6 Context Hook Organization

- Move `useAppContext.ts` to `src/domains/context/hooks/`

#### 4.7 Internal Hook Relocation

- Move `useLanguageDropdown.ts` to `src/domains/navigation/components/LanguageSwitcher/`
- Move `useButterfliesPhase.ts` to `src/domains/butterfly/components/DecorativeButterflies/`
- Move `useButterflyRuntime.ts` to `src/domains/butterfly/components/DecorativeButterflies/`
- Move `useWingAnimation.ts` to `src/domains/butterfly/components/ButterflyWebGL/`

**Validation Criteria:**

- ✅ All hooks accessible from new locations
- ✅ Hook functionality preserved
- ✅ No circular dependencies
- ✅ TypeScript compilation successful

**Rollback Plan:**

- Restore hooks to original locations
- Revert all import statements
- Remove new hook directories

**Estimated Duration:** 8-10 hours

---

### Phase 5: Component Splitting & Organization

**Objective:** Split large components into smaller, focused pieces

**Dependencies:** Phase 4 completion

**Tasks:**

#### 5.1 Decorative Butterflies Component Splitting

```bash
mkdir -p src/domains/butterfly/components/DecorativeButterflies
```

**Split from `src/components/3d/ForestScene/Decorativebutterflies.tsx`:**

- Main component → `DecorativeButterflies.tsx`
- Individual butterfly logic → `ButterflyInstance.tsx`
- Phase management → `useButterfliesPhase.ts` (already extracted)
- Runtime management → `useButterflyRuntime.ts` (already extracted)
- Butterfly types → `types.ts` (already extracted)

#### 5.2 Butterfly WebGL Component Splitting

```bash
mkdir -p src/domains/butterfly/components/ButterflyWebGL
```

**Split from `src/components/3d/ForestScene/butterfly/ButterflyWebGL.tsx`:**

- Main component → `ButterflyWebGL.tsx`
- Wing mesh component → `WingMesh.tsx`
- Wing animation → `useWingAnimation.ts` (already extracted)

#### 5.3 Butterfly Core Organization

```bash
mkdir -p src/domains/butterfly/core
mkdir -p src/domains/butterfly/core/geometry
mkdir -p src/domains/butterfly/core/materials
mkdir -p src/domains/butterfly/core/materials/shaders
```

**Move butterfly core files:**

- `animation.ts` → `src/domains/butterfly/core/animation.ts`
- `constants.ts` → `src/domains/butterfly/core/constants.ts`
- Geometry files → `src/domains/butterfly/core/geometry/`
- Material files → `src/domains/butterfly/core/materials/`
- Shader files → `src/domains/butterfly/core/materials/shaders/`

#### 5.4 Scene Component Organization

```bash
mkdir -p src/domains/scene/components/Loader
```

**Move Loader component:**

- `Loader.tsx` and `loader.scss` → `src/domains/scene/components/Loader/`

#### 5.5 Navigation Component Organization

```bash
mkdir -p src/domains/navigation/components/LanguageSwitcher
```

**Move LanguageSwitcher:**

- `LanguageSwitcher.tsx` and related files → `src/domains/navigation/components/LanguageSwitcher/`

#### 5.6 Section Component Organization

- Move all section components to `src/domains/sections/`
- Create subdirectories for each section: `Overview/`, `AboutMe/`, `Service/`, `Contact/`

**Validation Criteria:**

- ✅ All components accessible from new locations
- ✅ Component functionality preserved
- ✅ No broken imports
- ✅ Component structure follows DDD principles

**Rollback Plan:**

- Restore components to original locations
- Revert all import statements
- Remove new component directories

**Estimated Duration:** 6-8 hours

---

### Phase 6: Utility Refactoring & Contact Domain

**Objective:** Extract and organize utility functions, complete contact domain

**Dependencies:** Phase 5 completion

**Tasks:**

#### 6.1 Contact Utility Splitting

```bash
mkdir -p src/domains/contact/utils
touch src/domains/contact/utils/index.ts
touch src/domains/contact/utils/generateWhatsAppLink.ts
touch src/domains/contact/utils/generateEmailLink.ts
touch src/domains/contact/utils/generateCalendarLink.ts
touch src/domains/contact/utils/linkValidators.ts
```

**Split from `src/utils/links.ts`:**

- WhatsApp link generation → `generateWhatsAppLink.ts`
- Email link generation → `generateEmailLink.ts`
- Calendar link generation → `generateCalendarLink.ts`
- Link validation utilities → `linkValidators.ts`
- Main export logic → `index.ts`

#### 6.2 Contact Types

- Ensure `WhatsAppConfig`, `GoogleCalendarConfig`, `EmailConfig` are in `src/domains/contact/types.ts`

#### 6.3 Contact Component

- Move `Contact.tsx` and `contact.scss` to `src/domains/contact/`

#### 6.4 Utility Cleanup

- Remove `src/utils/links.ts`
- Remove `src/utils/calendar.ts` (if exists)

**Validation Criteria:**

- ✅ All utilities accessible from contact domain
- ✅ Contact functionality preserved
- ✅ No duplicate utility functions
- ✅ TypeScript compilation successful

**Rollback Plan:**

- Restore utilities to original locations
- Revert all import statements
- Remove contact domain utilities

**Estimated Duration:** 3-4 hours

---

### Phase 7: Context Domain & Final Cleanup

**Objective:** Complete context domain setup and perform final cleanup

**Dependencies:** Phase 6 completion

**Tasks:**

#### 7.1 Context Domain Completion

```bash
mkdir -p src/domains/context
```

**Move context files:**

- `AppContext.tsx` → `src/domains/context/AppContext.tsx`
- `AppProvider.tsx` → `src/domains/context/AppProvider.tsx`
- `useAppContext.ts` → `src/domains/context/useAppContext.ts`
- `ContextBridge.tsx` → `src/domains/context/ContextBridge.tsx`
- Context types → `src/domains/context/types.ts`

#### 7.2 Final Import Updates

- Update all remaining imports to use new domain paths
- Ensure all cross-domain imports use proper paths
- Update any remaining references to old paths

#### 7.3 Remove Old Directories

- Remove `src/hooks/` directory
- Remove `src/components/` directory (except shared components)
- Remove `src/types/` directory
- Remove `src/config/` directory (except base.ts)
- Remove `src/utils/` directory

#### 7.4 Final Validation

- Run full test suite
- Verify TypeScript compilation
- Test application functionality
- Validate performance metrics

**Validation Criteria:**

- ✅ All tests pass
- ✅ TypeScript compilation successful
- ✅ Application functions correctly
- ✅ No broken imports or references
- ✅ Performance metrics within acceptable range

**Rollback Plan:**

- Restore all original directories and files
- Revert all import statements
- Remove domain structure

**Estimated Duration:** 4-6 hours

---

## Implementation Timeline

| Phase                     | Duration        | Start Date | End Date | Dependencies |
| ------------------------- | --------------- | ---------- | -------- | ------------ |
| 0 - Preparation           | 2-3 hours       | Day 1      | Day 1    | None         |
| 1 - Shared Primitives     | 3-4 hours       | Day 1      | Day 1    | Phase 0      |
| 2 - Domain Types          | 6-8 hours       | Day 2      | Day 2    | Phase 1      |
| 3 - Config Redistribution | 4-6 hours       | Day 3      | Day 3    | Phase 2      |
| 4 - Hook Extraction       | 8-10 hours      | Day 4-5    | Day 5    | Phase 3      |
| 5 - Component Splitting   | 6-8 hours       | Day 6-7    | Day 7    | Phase 4      |
| 6 - Utility Refactoring   | 3-4 hours       | Day 8      | Day 8    | Phase 5      |
| 7 - Final Cleanup         | 4-6 hours       | Day 9      | Day 9    | Phase 6      |
| **Total**                 | **36-49 hours** |            |          |              |

---

## Risk Mitigation & Rollback Strategy

### High-Risk Operations

1. **Type redistribution** - Risk of breaking imports
2. **Hook extraction** - Risk of losing functionality
3. **Component splitting** - Risk of breaking UI
4. **Directory restructuring** - Risk of broken paths

### Rollback Strategy

1. **Git-based rollback:** Each phase committed separately for easy rollback
2. **Feature branch:** All changes on `ddd-refactoring` branch
3. **Incremental validation:** Each phase validated before proceeding
4. **Backup strategy:** Full backup before major operations

### Validation Points

- **After each phase:** Run tests and verify functionality
- **After major operations:** Full application testing
- **Before merge:** Complete validation suite

---

## Success Criteria

### Functional Requirements

- ✅ All existing functionality preserved
- ✅ All tests pass
- ✅ TypeScript compilation successful
- ✅ No broken imports or references

### Architectural Requirements

- ✅ Clear domain boundaries established
- ✅ Single responsibility principle followed
- ✅ Dependency inversion implemented
- ✅ Shared primitives properly isolated

### Performance Requirements

- ✅ No performance degradation
- ✅ Bundle size optimization
- ✅ Import tree-shaking enabled
- ✅ Development build times acceptable

### Maintainability Requirements

- ✅ Clear file organization
- ✅ Consistent naming conventions
- ✅ Proper documentation
- ✅ Easy to extend and modify

---

## Post-Implementation Tasks

### Immediate (Week 1)

1. **Monitor application performance**
2. **Address any integration issues**
3. **Update documentation**
4. **Team training on new structure**

### Short-term (Month 1)

1. **Performance optimization**
2. **Code cleanup and refinement**
3. **Additional testing**
4. **Documentation updates**

### Long-term (Ongoing)

1. **Monitor maintainability metrics**
2. **Refine domain boundaries as needed**
3. **Update team practices**
4. **Plan future architectural improvements**

---

## Notes

- This roadmap assumes a single developer working on the refactoring
- Time estimates include validation and testing
- Some phases may overlap or be combined based on progress
- Regular commits are essential for rollback capability
- Communication with team members is crucial during implementation

**Last Updated:** March 26, 2026  
**Next Review:** After Phase 3 completion
