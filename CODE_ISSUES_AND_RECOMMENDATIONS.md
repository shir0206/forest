# Code Issues and Recommendations

## Critical Issues Found

### 1. Error Handling Inconsistency

**Severity**: Medium
**Found**: 11 console.error/warn statements across the codebase

**Locations**:

- `src/i18n/hooks/useTranslation.ts` - Context not found
- `src/shared/components/Icon/Icon.tsx` - Icon not found
- `src/domains/navigation/components/Navigation/Navigation.tsx` - Context not found
- `src/domains/context/useAppContext.ts` - Context not found
- `src/domains/context/bridge/ContextBridge.tsx` - Context not found
- `src/domains/browser/components/Browser/BrowserHeader.tsx` - Context not found
- `src/domains/navigation/components/LanguageSwitcher/LanguageSwitcher.tsx` - Context not found
- `src/domains/browser/components/Browser/Browser.tsx` - Context not found
- `src/domains/scene/components/ForestScene/ForestScene.tsx` - Context not found
- `src/domains/butterfly/components/ButterflyWebGL/ButterflyWebGL.tsx` - Invalid props
- `src/domains/butterfly/components/DecorativeButterflies/DecorativeButterflies.tsx` - Context not found

**Recommendation**:

- Implement a global error boundary system
- Create a centralized error logging service
- Replace console.error with proper error handling
- Add fallback UI components for error states

### 2. Deep Import Paths

**Severity**: Medium
**Found**: 69 imports with 3+ directory levels

**Pattern**: Many imports use `../../../` patterns indicating:

- Potential circular dependencies
- Poor module organization
- Tightly coupled domains

**Examples**:

```typescript
// From Icon.tsx
import { ReactComponent as CloseIcon } from "../../../assets/icons/browser/close.svg";

// From ForestScene.tsx
import Browser from "../../../browser/components/Browser/Browser.tsx";
import Butterfly from "../../../butterfly/components/ButterflyUI/Butterfly.tsx";
```

**Recommendations**:

1. **Create barrel exports** for each domain:

   ```typescript
   // src/domains/browser/index.ts
   export { default as Browser } from "./components/Browser/Browser";
   export { BROWSER_MODE, type BrowserModeType } from "./types";
   ```

2. **Use path aliases** in tsconfig.json:

   ```json
   {
     "compilerOptions": {
       "paths": {
         "@browser/*": ["src/domains/browser/*"],
         "@butterfly/*": ["src/domains/butterfly/*"],
         "@camera/*": ["src/domains/camera/*"]
       }
     }
   }
   ```

3. **Reorganize shared assets**:
   ```
   src/assets/
   ├── icons/
   │   ├── browser/
   │   ├── contact/
   │   └── shared/
   ```

### 3. TypeScript Configuration

**Severity**: Low
**Current**: Strict mode enabled with good practices

**Observations**:

- `strict: true` is properly configured
- Good use of `as const` for literal types
- Proper generic usage in hooks

**Minor Improvements**:

- Add more specific types for 3D math operations
- Consider branded types for IDs and keys
- Add runtime validation for critical props

## Code Smells Identified

### 1. Mixed Responsibilities

**Component**: `ForestScene.tsx` (~100 lines)

- **Issue**: Handles scene setup, camera config, click handling, and device detection
- **Recommendation**: Extract into smaller, focused components/hooks

**Component**: `DecorativeButterflies.tsx` (~200 lines)

- **Issue**: Manages animation phases, butterfly runtime, and configuration
- **Recommendation**: Create dedicated animation manager hook

### 2. Complex Props Interfaces

**Component**: `ButterflyWebGL`

```typescript
interface ButterflyWebGLProps {
  flapDurationMs: number;
  opacityRef: React.MutableRefObject<number>;
  timeOffset?: number;
  onAnimationCycle?: () => void;
  lowPerformanceMode?: boolean;
  flipPetals?: boolean;
  mirrorX?: boolean;
  useDecorativePose?: boolean;
}
```

**Issue**: 8 configuration props for a single component
**Recommendation**: Group related props into configuration objects

### 3. Magic Numbers

**Locations Found**:

- `src/domains/butterfly/core/animation.ts`: Hardcoded animation values
- `src/domains/scene/config/scene.ts`: Camera positions and thresholds
- `src/domains/camera/config/presets.ts`: Animation durations

**Example**:

```typescript
// In animation.ts
const speed = (2 * Math.PI) / (flapDurationMs / 1000);
```

**Recommendation**: Extract to named constants with documentation

### 4. Inconsistent Error Boundaries

**Issue**: No React error boundaries for 3D components
**Risk**: WebGL failures could crash entire application
**Recommendation**: Add error boundaries around:

- Canvas components
- 3D scene components
- Animation systems

## Performance Considerations

### 1. 3D Rendering

**Current Optimizations**:

- ✅ Low-performance mode for mobile
- ✅ Animation step reduction
- ✅ RequestAnimationFrame optimization

**Additional Opportunities**:

- Implement LOD (Level of Detail) for butterflies
- Use instanced rendering for decorative butterflies
- Add texture atlases for materials

### 2. Bundle Size

**Current Dependencies**: ~1MB+ (Three.js ecosystem)
**Optimization**:

- Enable tree-shaking for Three.js modules
- Implement code splitting for sections
- Use dynamic imports for non-critical 3D features

### 3. Memory Management

**Potential Issues**:

- No cleanup of Three.js resources in some components
- Animation frames not cancelled in all cases
- Event listeners not properly removed

**Recommendation**: Implement proper cleanup in useEffect returns

## Architectural Improvements

### 1. Extract Animation System

**Current**: Animation logic scattered across components
**Proposed**: Unified animation manager

```typescript
// New hook: useAnimationManager
{
  animateCamera: (config) => void,
  animateButterfly: (config) => void,
  cancelAllAnimations: () => void,
  getPerformanceMetrics: () => PerformanceMetrics
}
```

### 2. Enhance Type Safety

**Add**:

- Runtime prop validation for 3D components
- Branded types for IDs and keys
- More specific event handler types
- Zod schemas for configuration validation

### 3. Improve Error Handling

**Implement**:

- Global error boundary
- Fallback UI components
- Error logging service
- Performance monitoring

### 4. Testing Infrastructure

**Missing**:

- Unit tests for hooks
- Integration tests for components
- Visual regression tests for 3D scenes
- Performance benchmarks

## Refactoring Priorities

### High Priority

1. **Fix error handling** - Add proper error boundaries
2. **Extract animation system** - Unify animation logic
3. **Improve import organization** - Reduce deep imports

### Medium Priority

1. **Split large components** - ForestScene, DecorativeButterflies
2. **Add TypeScript improvements** - Stricter types, runtime validation
3. **Implement testing** - Unit and integration tests

### Low Priority

1. **Performance monitoring** - FPS tracking, memory usage
2. **Bundle optimization** - Code splitting, tree-shaking
3. **Documentation** - JSDoc for complex algorithms

## Conclusion

The codebase demonstrates **strong architectural patterns** and **good TypeScript usage**. The main issues are related to:

1. **Error handling consistency**
2. **Import organization**
3. **Component responsibility boundaries**

These are **fixable issues** that don't undermine the overall quality of the architecture. The domain-driven design is well-implemented and provides a solid foundation for future development.

**Overall Assessment**: Production-ready with recommended improvements for maintainability and error resilience.
