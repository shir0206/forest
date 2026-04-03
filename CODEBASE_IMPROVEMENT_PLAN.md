# Codebase Improvement Plan - DDD Architecture & Cleanup

## Executive Summary

Based on analysis of the React codebase and the REACT_CODEBASE_ANALYSIS.md document, this plan outlines key improvements focusing on Domain-Driven Design (DDD) compliance, empty folder cleanup, and code quality enhancements.

---

## 🔍 Analysis Findings

### Empty Folders Identified (7 total)

These folders exist but contain no files and should be removed:

| #   | Folder Path                   | Status |
| --- | ----------------------------- | ------ |
| 1   | `src/utils/`                  | Empty  |
| 2   | `src/shared/contexts/`        | Empty  |
| 3   | `src/domains/browser/types/`  | Empty  |
| 4   | `src/domains/camera/types/`   | Empty  |
| 5   | `src/domains/sections/types/` | Empty  |
| 6   | `src/domains/scene/types/`    | Empty  |
| 7   | `src/domains/contact/types/`  | Empty  |

### DDD Architecture Issues

| Issue                       | Severity | Location                         | Impact                        |
| --------------------------- | -------- | -------------------------------- | ----------------------------- |
| Missing barrel exports      | Medium   | browser/, scene/, navigation/    | Inconsistent imports          |
| Placeholder index.ts files  | Low      | browser/index.ts, scene/index.ts | Incomplete domain boundaries  |
| Duplicate hook structure    | Medium   | camera/hooks/useCameraAnimation/ | Confusion, maintenance burden |
| Missing navigation index.ts | High     | navigation/                      | No clean domain exports       |

### Code Quality Issues (from Analysis)

| Category            | Priority  | Tasks                                      |
| ------------------- | --------- | ------------------------------------------ |
| Error Handling      | 🔴 High   | Add error boundaries, fallback UI, logging |
| Import Organization | 🟡 Medium | Barrel exports, path aliases               |
| Testing             | 🔴 High   | Vitest, React Testing Library, Playwright  |
| Documentation       | 🟡 Medium | JSDoc, Storybook                           |
| Performance         | 🟢 Low    | LOD, instanced rendering                   |
| Type Safety         | 🟡 Medium | Runtime validation, branded types          |

---

## 📋 Improvement Plan

### Phase 1: Cleanup & Foundation (Week 1)

#### 1.1 Remove Empty Folders

```bash
# Empty folders to delete
rm -rf src/utils/
rm -rf src/shared/contexts/
rm -rf src/domains/browser/types/
rm -rf src/domains/camera/types/
rm -rf src/domains/sections/types/
rm -rf src/domains/scene/types/
rm -rf src/domains/contact/types/
```

#### 1.2 Fix DDD Barrel Exports

Create/fix `index.ts` for all domains:

**Navigation domain (missing):**

```typescript
// src/domains/navigation/index.ts
export { Navigation } from "./components/Navigation/Navigation";
export { LanguageSwitcher } from "./components/LanguageSwitcher/LanguageSwitcher";
export { useScrollNavigation } from "./hooks/useScrollNavigation";
export { useScrollVisibility } from "./hooks/useScrollVisibility";
export { useScreenVisibility } from "./hooks/useScreenVisibility";
```

**Browser domain (placeholder → functional):**

```typescript
// src/domains/browser/index.ts
export { Browser } from "./components/Browser/Browser";
export { BrowserHeader } from "./components/Browser/BrowserHeader";
export { WebsiteSection } from "./components/WebsiteSection/WebsiteSection";
export { useHtmlReady } from "./hooks/useHtmlReady";
export * from "./config/screens";
export * from "./config/timing";
export * from "./config/animation";
export type { BrowserModeType, SectionIdType, SectionConfig } from "./types";
```

**Scene domain (placeholder → functional):**

```typescript
// src/domains/scene/index.ts
export { ForestScene } from "./components/ForestScene/ForestScene";
export { Background } from "./components/Background/Background";
export { CinematicEffects } from "./components/CinematicEffects/CinematicEffects";
export { Loader } from "./components/Loader/Loader";
export * from "./config/scene";
export type { PositionThreeD } from "./types";
```

#### 1.3 Consolidate Duplicate Camera Hooks

Remove duplicate structure at `camera/hooks/useCameraAnimation/`:

- Keep files in `camera/hooks/` (current location)
- Delete `camera/hooks/useCameraAnimation/` folder
- Update imports in `camera/index.ts`

---

### Phase 2: Error Handling & Stability (Week 2)

#### 2.1 Add React Error Boundaries

Create `src/shared/components/ErrorBoundary/ErrorBoundary.tsx`:

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

#### 2.2 Implement Fallback UI Components

Create `src/shared/components/Fallbacks/`:

- `SceneFallback.tsx` - 3D scene error state
- `BrowserFallback.tsx` - Browser UI error state
- `SectionFallback.tsx` - Section loading error

#### 2.3 Standardize Error Handling

Create `src/shared/utils/errorHandler.ts`:

```typescript
export const logError = (context: string, error: Error): void => {
  console.error(`[${context}]`, error);
  // Future: Send to error tracking service
};

export const handleAsyncError = async <T>(
  promise: Promise<T>,
  context: string
): Promise<T | null> => {
  try {
    return await promise;
  } catch (error) {
    logError(context, error as Error);
    return null;
  }
};
```

---

### Phase 3: Import Organization & Path Aliases (Week 3)

#### 3.1 Configure Path Aliases in tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@domains/*": ["src/domains/*"],
      "@shared/*": ["src/shared/*"],
      "@i18n/*": ["src/i18n/*"],
      "@assets/*": ["src/assets/*"],
      "@config/*": ["src/config/*"]
    }
  }
}
```

#### 3.2 Update Vite Config

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@domains": path.resolve(__dirname, "src/domains"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@i18n": path.resolve(__dirname, "src/i18n"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@config": path.resolve(__dirname, "src/config"),
    },
  },
});
```

#### 3.3 Refactor Deep Imports

Replace 69 deep imports with clean path aliases:

```typescript
// Before
import { ReactComponent as CloseIcon } from "../../../assets/icons/browser/close.svg";
import Browser from "../../../browser/components/Browser/Browser.tsx";

// After
import { CloseIcon } from "@assets/icons/browser/close.svg";
import { Browser } from "@domains/browser";
```

---

### Phase 4: Testing Infrastructure (Week 4-5)

#### 4.1 Install Testing Dependencies

```bash
yarn add -D vitest @testing-library/react @testing-library/jest-dom
yarn add -D @playwright/test
```

#### 4.2 Configure Vitest

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

#### 4.3 Create Test Structure

```
src/
├── domains/
│   ├── browser/
│   │   ├── __tests__/
│   │   │   ├── Browser.test.tsx
│   │   │   └── useHtmlReady.test.ts
│   ├── camera/
│   │   ├── __tests__/
│   │   │   └── useCameraAnimation.test.ts
│   └── ...
├── shared/
│   ├── __tests__/
│   │   └── ErrorBoundary.test.tsx
└── test/
    ├── setup.ts
    └── utils.tsx
```

#### 4.4 Priority Test Coverage

1. **Hooks**: `useCameraAnimation`, `useScrollNavigation`, `useTranslation`
2. **Components**: `Browser`, `ForestScene`, `Navigation`
3. **Utilities**: `generateContactLinks`, `detectDevice`

---

### Phase 5: Documentation & Type Safety (Week 6)

#### 5.1 Add JSDoc to Public APIs

```typescript
/**
 * Animates the camera to a specific position using GSAP
 * @param targetPosition - Target 3D position [x, y, z]
 * @param duration - Animation duration in seconds (default: 1.5)
 * @param ease - GSAP easing function (default: "power2.inOut")
 * @returns Promise that resolves when animation completes
 */
export const animateToPosition = (
  targetPosition: PositionThreeD,
  duration?: number,
  ease?: string
): Promise<void> => { ... }
```

#### 5.2 Implement Branded Types

```typescript
// src/shared/types/branded.ts
type Brand<T, B> = T & { __brand: B };

export type SectionId = Brand<string, "SectionId">;
export type LanguageCode = Brand<string, "LanguageCode">;

export const createSectionId = (id: string): SectionId => id as SectionId;
export const createLanguageCode = (code: string): LanguageCode =>
  code as LanguageCode;
```

#### 5.3 Add Runtime Validation

```typescript
// src/shared/utils/validation.ts
export const validateSectionId = (id: unknown): SectionId => {
  if (
    typeof id !== "string" ||
    !["overview", "about", "service", "contact"].includes(id)
  ) {
    throw new Error(`Invalid section ID: ${id}`);
  }
  return createSectionId(id);
};
```

---

## 🎯 Success Metrics

| Metric                   | Current | Target | How to Measure            |
| ------------------------ | ------- | ------ | ------------------------- |
| Empty Folders            | 7       | 0      | `find src -type d -empty` |
| Test Coverage            | 0%      | 60%+   | Vitest coverage report    |
| Deep Imports (>3 levels) | 69      | <10    | Manual count              |
| Error Boundaries         | 0       | 4+     | Component count           |
| Console Errors           | 11      | 0      | Grep for console.error    |

---

## 📅 Timeline

| Week | Phase                | Deliverables                                  |
| ---- | -------------------- | --------------------------------------------- |
| 1    | Cleanup & Foundation | Empty folders removed, barrel exports fixed   |
| 2    | Error Handling       | Error boundaries, fallback UI, error utils    |
| 3    | Import Organization  | Path aliases configured, imports refactored   |
| 4-5  | Testing              | Vitest setup, 50%+ coverage on critical paths |
| 6    | Documentation        | JSDoc, branded types, runtime validation      |

---

## 🚀 Quick Wins (Do First)

1. **Delete 7 empty folders** - Immediate cleanup, no risk
2. **Add navigation/index.ts** - Fixes missing domain exports
3. **Fix placeholder index.ts files** - Completes DDD boundaries
4. **Delete duplicate camera/hooks/useCameraAnimation/** - Removes confusion

---

## 📁 File Structure After Improvements

```
src/
├── domains/
│   ├── browser/
│   │   ├── index.ts ✅ (functional exports)
│   │   ├── types.ts ✅ (single file, no empty folder)
│   │   ├── components/
│   │   ├── config/
│   │   └── hooks/
│   ├── butterfly/
│   ├── camera/
│   │   ├── index.ts ✅
│   │   ├── types.ts ✅ (single file, no empty folder)
│   │   ├── components/
│   │   ├── config/
│   │   └── hooks/ ✅ (no duplicate folder)
│   ├── contact/
│   │   ├── config.ts
│   │   ├── types.ts ✅ (single file, no empty folder)
│   │   └── utils/
│   ├── context/
│   ├── device/
│   ├── navigation/
│   │   ├── index.ts ✅ (NEW)
│   │   ├── components/
│   │   └── hooks/
│   ├── scene/
│   │   ├── index.ts ✅ (functional exports)
│   │   ├── types.ts ✅ (single file, no empty folder)
│   │   ├── components/
│   │   └── config/
│   └── sections/
│       ├── types.ts ✅ (single file, no empty folder)
│       ├── About/
│       ├── Contact/
│       ├── Overview/
│       └── Service/
├── shared/
│   ├── components/
│   │   ├── Icon/
│   │   ├── ErrorBoundary/ ✅ (NEW)
│   │   └── Fallbacks/ ✅ (NEW)
│   ├── types/
│   │   ├── primitives.ts
│   │   └── branded.ts ✅ (NEW)
│   └── utils/ ✅ (NEW)
│       ├── errorHandler.ts
│       └── validation.ts
├── i18n/
├── assets/
├── config/
└── test/ ✅ (NEW)
    ├── setup.ts
    └── utils.tsx
```

---

## ✅ Checklist

### Phase 1: Cleanup

- [ ] Delete `src/utils/` (empty)
- [ ] Delete `src/shared/contexts/` (empty)
- [ ] Delete `src/domains/browser/types/` (empty)
- [ ] Delete `src/domains/camera/types/` (empty)
- [ ] Delete `src/domains/sections/types/` (empty)
- [ ] Delete `src/domains/scene/types/` (empty)
- [ ] Delete `src/domains/contact/types/` (empty)
- [ ] Create `src/domains/navigation/index.ts`
- [ ] Update `src/domains/browser/index.ts` with functional exports
- [ ] Update `src/domains/scene/index.ts` with functional exports
- [ ] Delete `src/domains/camera/hooks/useCameraAnimation/` (duplicate)
- [ ] Convert `browser/types/` folder to single `browser/types.ts` file
- [ ] Convert `camera/types/` folder to single `camera/types.ts` file
- [ ] Convert `sections/types/` folder to single `sections/types.ts` file
- [ ] Convert `scene/types/` folder to single `scene/types.ts` file
- [ ] Convert `contact/types/` folder to single `contact/types.ts` file

### Phase 2: Error Handling

- [ ] Create `ErrorBoundary` component
- [ ] Create `SceneFallback` component
- [ ] Create `BrowserFallback` component
- [ ] Create `SectionFallback` component
- [ ] Create `errorHandler.ts` utility
- [ ] Wrap `ForestScene` in ErrorBoundary
- [ ] Wrap `Browser` in ErrorBoundary

### Phase 3: Import Organization

- [ ] Add path aliases to `tsconfig.json`
- [ ] Update `vite.config.ts` with aliases
- [ ] Refactor deep imports to use aliases
- [ ] Create barrel exports for all domains

### Phase 4: Testing

- [ ] Install Vitest and testing libraries
- [ ] Configure Vitest
- [ ] Create test setup files
- [ ] Write tests for `useCameraAnimation`
- [ ] Write tests for `useScrollNavigation`
- [ ] Write tests for `useTranslation`
- [ ] Write tests for `Browser` component
- [ ] Write tests for `ErrorBoundary`

### Phase 5: Documentation & Types

- [ ] Add JSDoc to camera hooks
- [ ] Add JSDoc to navigation hooks
- [ ] Add JSDoc to context hooks
- [ ] Create branded types
- [ ] Add runtime validation utilities
- [ ] Update types to use branded types

---

_Plan created: 2026-03-31_
_Based on: REACT_CODEBASE_ANALYSIS.md_
_Estimated effort: 6 weeks_
