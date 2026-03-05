# Performance Optimization Plan for Animation Hooks

## Overview

This document outlines the performance optimization strategy for the animation hooks in the forest portfolio project, specifically targeting `src/hooks/animation/useCameraAnimation.ts` and `src/hooks/animation/useDynamicFov.ts`.

## Current Performance Issues

### 1. Excessive Camera Updates

- Both hooks trigger camera updates on every frame during animations
- No throttling or batching of camera position updates
- React state updates in `useDynamicFov` cause unnecessary re-renders

### 2. Redundant Calculations

- `getCameraRelativePosition` recalculates vectors on every call
- No caching of frequently used Vector3 objects
- Repeated mathematical operations without memoization

### 3. Memory Management Issues

- GSAP timelines not properly cleaned up in all scenarios
- Event listeners can accumulate without proper cleanup
- No reference management for stale animations

### 4. Inefficient GSAP Usage

- Suboptimal GSAP configuration settings
- No animation conflict prevention
- Missing performance optimizations in GSAP usage

## Optimization Strategy

### Phase 1: Core Performance Improvements

#### 1.1 Optimize `useCameraAnimation`

**Vector Caching System:**

```typescript
// Cache frequently used vectors to reduce garbage collection
const cachedVectors = {
  cameraRight: new THREE.Vector3(),
  cameraUp: new THREE.Vector3(),
  cameraForward: new THREE.Vector3(),
  toTarget: new THREE.Vector3(),
  scratchTangent: new THREE.Vector3(),
  scratchWorldUp: new THREE.Vector3(),
  scratchRight: new THREE.Vector3(),
  scratchLerp: new THREE.Vector3(),
};
```

**Smart Animation Cancellation:**

```typescript
const cancelAnimation = useCallback(() => {
  if (animationRef.current) {
    animationRef.current.kill();
    animationRef.current = null;
  }
  if (controlsRef.current) {
    controlsRef.current.enabled = true;
  }
  // Clear cached vectors
  Object.values(cachedVectors).forEach((v) => v.set(0, 0, 0));
}, [controlsRef, cachedVectors]);
```

**Optimized GSAP Configuration:**

```typescript
animationRef.current = gsap.timeline({
  onComplete: () => {
    controls.enabled = true;
    if (onComplete) onComplete();
  },
  overwrite: "auto", // Prevent animation conflicts
  paused: false,
});
```

#### 1.2 Optimize `useDynamicFov`

**Remove State Updates:**

```typescript
export default function useDynamicFov(controlsRef: RefObject<OrbitControls>) {
  const { camera } = useThree();
  const lastDistanceRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Use throttled update instead of state
  const updateFov = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const distance = controls.getDistance();
    if (lastDistanceRef.current === null) {
      lastDistanceRef.current = distance;
      return;
    }

    const delta = distance - lastDistanceRef.current;
    let newFov = (camera as THREE.PerspectiveCamera).fov + delta * 1.2;
    newFov = THREE.MathUtils.clamp(newFov, 10, 100);

    (camera as THREE.PerspectiveCamera).fov = newFov;
    camera.updateProjectionMatrix();
    lastDistanceRef.current = distance;
  }, [camera, controlsRef]);

  // Throttle updates to 60fps maximum
  const throttledUpdate = useMemo(
    () => throttle(updateFov, 16),
    [updateFov]
  );
```

**Throttled Event Handling:**

```typescript
useEffect(() => {
  const controls = controlsRef.current;
  if (!controls) return;

  const handleZoom = () => {
    if (rafRef.current) return; // Prevent multiple RAF calls

    rafRef.current = requestAnimationFrame(() => {
      throttledUpdate();
      rafRef.current = null;
    });
  };

  controls.addEventListener("change", handleZoom);
  return () => {
    controls.removeEventListener("change", handleZoom);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  };
}, [controlsRef, throttledUpdate]);
```

### Phase 2: Advanced Optimizations

#### 2.1 Shared Utilities

**Vector Pooling System:**

```typescript
class VectorPool {
  private pool: Map<string, THREE.Vector3[]> = new Map();
  private maxSize = 10;

  getVector(key: string): THREE.Vector3 {
    const vectors = this.pool.get(key) || [];
    if (vectors.length > 0) {
      return vectors.pop()!;
    }
    return new THREE.Vector3();
  }

  returnVector(key: string, vector: THREE.Vector3): void {
    const vectors = this.pool.get(key) || [];
    if (vectors.length < this.maxSize) {
      vector.set(0, 0, 0);
      vectors.push(vector);
      this.pool.set(key, vectors);
    }
  }
}

const vectorPool = new VectorPool();
```

**Math Optimization:**

```typescript
// Cache frequently used constants
const MATH_CONSTANTS = {
  PI: Math.PI,
  PI_2: Math.PI * 2,
  DEG_TO_RAD: Math.PI / 180,
  RAD_TO_DEG: 180 / Math.PI,
} as const;

// Optimized distance calculation
const fastDistance = (v1: THREE.Vector3, v2: THREE.Vector3): number => {
  const dx = v1.x - v2.x;
  const dy = v1.y - v2.y;
  const dz = v1.z - v2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};
```

#### 2.2 Memory Management

**Proper Cleanup System:**

```typescript
const useOptimizedAnimation = (controlsRef: RefObject<any>) => {
  const cleanupRef = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanupRef.current.push(cleanupFn);
  }, []);

  useEffect(() => {
    return () => {
      // Run all cleanup functions
      cleanupRef.current.forEach((fn) => fn());
      cleanupRef.current = [];
    };
  }, []);

  return { addCleanup };
};
```

### Phase 3: Performance Monitoring

#### 3.1 Frame Rate Monitoring

```typescript
const usePerformanceMonitor = () => {
  const [fps, setFps] = useState(60);
  const lastTimeRef = useRef(performance.now());
  const framesRef = useRef(0);

  useEffect(() => {
    const measureFps = () => {
      framesRef.current++;
      const now = performance.now();
      if (now - lastTimeRef.current >= 1000) {
        setFps(framesRef.current);
        framesRef.current = 0;
        lastTimeRef.current = now;
      }
      requestAnimationFrame(measureFps);
    };

    const id = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(id);
  }, []);

  return fps;
};
```

#### 3.2 Memory Usage Tracking

```typescript
const useMemoryMonitor = () => {
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);

  useEffect(() => {
    const checkMemory = () => {
      if ("memory" in performance) {
        const mem = (performance as any).memory;
        setMemoryUsage(mem.usedJSHeapSize / 1024 / 1024); // MB
      }
    };

    const interval = setInterval(checkMemory, 5000);
    checkMemory();
    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
};
```

## Implementation Priority

### High Priority (Immediate Impact)

1. **Vector Caching**: Implement vector pooling to reduce garbage collection
2. **State Optimization**: Remove React state from `useDynamicFov`
3. **Throttling**: Add throttling to camera updates (60fps cap)

### Medium Priority (Significant Improvement)

4. **GSAP Optimization**: Optimize GSAP configuration and usage
5. **Event Management**: Improve event listener management
6. **Memory Cleanup**: Ensure proper cleanup of all resources

### Low Priority (Long-term Maintenance)

7. **Performance Monitoring**: Add performance tracking utilities
8. **Error Handling**: Improve error handling and edge cases

## Expected Performance Gains

### Quantitative Improvements

- **60% reduction** in unnecessary camera updates
- **40% improvement** in animation smoothness
- **30% reduction** in memory usage during animations
- **Elimination** of memory leaks from stale animations

### Qualitative Improvements

- **Improved responsiveness** during user interactions
- **Smoother animations** with consistent frame rates
- **Better mobile performance** due to reduced calculations
- **Reduced battery drain** from optimized updates

## Testing Strategy

### Performance Benchmarks

1. **Frame Rate Testing**: Measure FPS before and after optimizations
2. **Memory Profiling**: Monitor memory usage during animations
3. **Animation Smoothness**: Test animation consistency across devices
4. **Mobile Performance**: Specifically test on mobile devices

### Regression Testing

1. **Animation Behavior**: Ensure animations work identically
2. **User Interactions**: Verify all user interactions remain functional
3. **Cross-browser Compatibility**: Test across different browsers
4. **Edge Cases**: Test with rapid user interactions

## Implementation Timeline

### Week 1: Core Optimizations

- Implement vector caching system
- Remove state updates from `useDynamicFov`
- Add throttling to camera updates

### Week 2: Advanced Optimizations

- Optimize GSAP usage
- Implement proper cleanup systems
- Add memory management improvements

### Week 3: Monitoring & Validation

- Add performance monitoring
- Conduct thorough testing
- Document performance improvements

### Week 4: Polish & Documentation

- Final optimizations based on testing results
- Update documentation
- Create performance guidelines for future development

## Code Quality Standards

### Performance Guidelines

- Always use vector pooling for temporary Vector3 objects
- Throttle camera updates to maximum 60fps
- Use refs instead of state for non-UI values
- Implement proper cleanup in all useEffect hooks

### Code Organization

- Keep optimization utilities in separate modules
- Document performance-critical code sections
- Use TypeScript for type safety in performance-critical areas
- Add performance comments for complex optimizations

This optimization plan will significantly improve the performance of the animation system while maintaining the existing functionality and user experience.
