# Code Refactoring Plan: Forest Portfolio Project

## Overview

This document outlines a systematic approach to improve code readability, reduce coupling, and enhance maintainability of the Forest portfolio project.

## Current Issues Summary

### 1. Architecture Problems

- Mixed concerns in configuration files
- Tight coupling between components
- Prop drilling through multiple layers
- Inconsistent file organization

### 2. Code Quality Issues

- Hardcoded values and magic numbers
- Large functions with multiple responsibilities
- Inconsistent naming conventions
- Missing type safety in several areas

### 3. Maintainability Concerns

- Difficult to extend or modify components
- Configuration scattered across files
- No clear separation of concerns

## Refactoring Strategy

### Phase 1: Foundation Setup (High Priority)

**Goal**: Establish proper project structure and configuration organization

#### Step 1.1: Create Configuration Structure

```bash
# Create new directory structure
mkdir -p src/config
mkdir -p src/types
mkdir -p src/utils
```

**Files to create:**

- `src/config/app.ts` - Application-level constants
- `src/config/3d.ts` - 3D scene configurations
- `src/config/links.ts` - Contact and external link configurations
- `src/types/app.ts` - Application type definitions
- `src/types/3d.ts` - 3D-related type definitions
- `src/utils/links.ts` - Link generation utilities
- `src/utils/calendar.ts` - Calendar utilities

#### Step 1.2: Extract Constants from const.ts

**Current file**: `src/helper/const.ts`

**Actions:**

1. Move 3D-related constants to `src/config/3d.ts`
2. Move application constants to `src/config/app.ts`
3. Move link configurations to `src/config/links.ts`
4. Move utility functions to `src/utils/links.ts` and `src/utils/calendar.ts`
5. Update all imports across the project

**Expected outcome**: Clean separation of concerns with dedicated configuration files

#### Step 1.3: Create Type Definitions

**Files to create:**

- `src/types/app.ts` - Screen types, window states, etc.
- `src/types/3d.ts` - 3D position types, camera configs, etc.

**Actions:**

1. Define proper TypeScript interfaces
2. Replace any `any` types with specific interfaces
3. Create type-safe enums where appropriate
4. Update existing type files to use new structure

**Expected outcome**: Enhanced type safety and better IDE support

### Phase 2: State Management (High Priority)

**Goal**: Eliminate prop drilling and centralize state management without changing HTML/CSS structure

#### Step 2.1: Create App Context

**File to create**: `src/contexts/AppContext.tsx`

**Actions:**

1. Define context interface with all global state
2. Create context provider component
3. Implement state management with proper TypeScript types
4. Add context consumer hooks

**Context structure:**

```typescript
interface AppContextType {
  isAboutOpen: boolean;
  setIsAboutOpen: (open: boolean) => void;
  runIntro: boolean;
  setRunIntro: (run: boolean) => void;
  windowState: WindowState;
  setWindowState: (state: WindowState) => void;
  visibleScreens: Set<ScreenId>;
  setVisibleScreens: (screens: Set<ScreenId>) => void;
}
```

#### Step 2.2: Update Main App Component

**File to update**: `src/App.jsx`

**Actions:**

1. Wrap application with AppContext.Provider
2. Remove local state management
3. Pass initial state values

**Expected outcome**: Centralized state management without prop drilling

#### Step 2.3: Update Components to Use Context

**Files to update:**

- `src/components/forestScene/ForestScene.tsx`
- `src/components/browser/Browser.tsx`
- `src/components/cameraControls/CameraControls.tsx`
- `src/components/websiteScreen/WebsiteScreen.tsx`

**Actions:**

1. Replace props with context hooks
2. Remove prop passing between components
3. Update component interfaces to remove state props
4. Maintain existing HTML structure and CSS classes
5. Preserve all existing DOM elements and styling

**Expected outcome**: Decoupled components with clean interfaces while preserving HTML/CSS structure

### Phase 3: Component Refactoring (High Priority)

**Goal**: Improve component architecture and separation of concerns

**Current Status**: App Context and type definitions are already implemented. Browser component partially refactored.

#### Step 3.1: Complete Browser Component Refactoring

**Current file**: `src/components/browser/Browser.tsx`

**Current State**: ✅ Already uses App Context, has TypeScript types, uses hooks

**Remaining Actions:**

1. **Create WindowControls component** (`src/components/browser/WindowControls.tsx`)

   - Extract window control buttons (close, minimize, maximize)
   - Make it reusable for other browser-like components
   - Add proper TypeScript props interface

2. **Create BrowserHeader component** (`src/components/browser/BrowserHeader.tsx`)

   - Extract header section with title and controls
   - Make it configurable with different titles
   - Maintain existing CSS classes

3. **Simplify BrowserContent**

   - Remove `src/components/websiteScreen/WebsiteScreen.tsx` (too simple to warrant separate file)
   - Inline screen rendering logic directly in Browser.tsx
   - Keep existing HTML structure and CSS classes

4. **Update main Browser component**
   - Compose the new sub-components
   - Reduce complexity by delegating to focused components
   - Maintain existing functionality

**Expected outcome**: Three focused components with single responsibilities:

- `WindowControls` - handles all window control logic
- `BrowserHeader` - handles header display and title
- `Browser` - orchestrates the composition

#### Step 3.2: Extract Contact Logic

**Current file**: `src/components/contact/Contact.tsx`

**Current State**: ✅ Link utilities and config already exist in `src/utils/links.ts` and `src/config/links.ts`

**Remaining Actions:**

1. **Create ContactLink component** (`src/components/contact/ContactLink.tsx`)

   - Reusable link component with consistent styling
   - Accept icon, label, and href props
   - Handle different link types (email, calendar, whatsapp, etc.)

2. **Simplify main Contact component**

   - Compose ContactLink components instead of inline links
   - Extract link data to configuration
   - Remove inline link generation logic

3. **Update link configuration** (`src/config/links.ts`)
   - Ensure all contact links are properly configured
   - Add type safety for link configurations
   - Centralize all contact-related constants

**Expected outcome**: Reusable contact components with centralized configuration and consistent styling

#### Step 3.3: Improve 3D Components

**Files to update:**

- `src/components/forestScene/ForestScene.tsx`
- `src/components/cameraControls/CameraControls.tsx`
- `src/components/cinematicEffects/CinematicEffects.tsx`

**Current State**: ✅ Basic 3D config structure exists in `src/config/3d.ts`

**Remaining Actions:**

1. **Complete camera configuration extraction** (`src/config/3d.ts`)

   - Move all camera positions, rotations, and animations
   - Extract FOV settings and transition parameters
   - Add type safety for 3D configurations

2. **Create reusable 3D utility hooks** (`src/hooks/`)

   - Extract camera animation logic to `useCameraAnimation.ts`
   - Create `use3DPosition` hook for position calculations
   - Extract effect configuration to dedicated hooks

3. **Simplify component interfaces**

   - Remove hardcoded values from components
   - Use configuration objects instead of individual props
   - Add proper TypeScript interfaces for 3D props

4. **Improve component separation**
   - Ensure each 3D component has single responsibility
   - Extract shared 3D utilities to common location
   - Remove cross-component dependencies

**Expected outcome**: Configurable 3D components with better separation, type safety, and reusability

### Phase 4: File Organization (Medium Priority)

**Goal**: Standardize file structure and naming conventions

#### Step 4.1: Reorganize Components Directory

**Current structure:**

```
src/components/
├── butterfly/
├── browser/
├── expertiseCards/
├── websiteScreen/
└── ...
```

**New structure:**

```
src/components/
├── 3d/
│   ├── Butterfly/
│   ├── CameraControls/
│   ├── CinematicEffects/
│   └── ForestScene/
├── ui/
│   ├── Browser/
│   ├── Icon/
│   ├── Loader/
│   └── Contact/
└── sections/
    ├── Overview/
    ├── AboutMe/
    ├── ExpertiseCards/
    └── Contact/
```

**Actions:**

1. Create new directory structure
2. Move components to appropriate directories
3. Update all import statements
4. Standardize component file naming

#### Step 4.2: Standardize File Naming

**Actions:**

1. Ensure all component files use PascalCase
2. Standardize hook naming (usePascalCase)
3. Standardize utility file naming (camelCase)
4. Update TypeScript declaration files

**Expected outcome**: Consistent file naming across the project

### Phase 5: Function and Parameter Improvements (Medium Priority)

**Goal**: Improve function design and parameter patterns

#### Step 5.1: Break Down Large Functions

**Files to update:**

- `src/utils/links.ts` (generateGoogleCalendarLink)
- `src/hooks/useScreenVisibility.ts`
- `src/components/forestScene/ForestScene.tsx`

**Actions:**

1. Identify functions with multiple responsibilities
2. Extract helper functions for specific tasks
3. Use consistent parameter patterns (objects vs individual params)
4. Add proper TypeScript types for all parameters

#### Step 5.2: Standardize Parameter Patterns

**Actions:**

1. Use configuration objects for functions with multiple parameters
2. Create type definitions for configuration objects
3. Implement consistent parameter ordering
4. Add default values where appropriate

**Expected outcome**: More maintainable and predictable function interfaces

### Phase 6: Type Safety Enhancements (Low Priority)

**Goal**: Improve TypeScript usage and type safety

#### Step 6.1: Replace Any Types

**Actions:**

1. Search for and replace all `any` types
2. Create proper interfaces for complex objects
3. Use generic types where appropriate
4. Add type guards for runtime type checking

#### Step 6.2: Enhance Existing Types

**Files to update:**

- `src/types/app.ts`
- `src/types/3d.ts`
- `src/helper/types.ts`

**Actions:**

1. Add missing type definitions
2. Create union types for better type safety
3. Use readonly types for immutable data
4. Add proper null/undefined handling

**Expected outcome**: Better compile-time error detection and IDE support

## Implementation Timeline

### Week 1: Foundation (Phase 1)

- [ ] Day 1-2: Create configuration structure
- [ ] Day 3-4: Extract constants and create type definitions
- [ ] Day 5: Update imports and test basic functionality

### Week 2: State Management (Phase 2)

- [ ] Day 1-2: Create App Context and update main App component
- [ ] Day 3-4: Update components to use context
- [ ] Day 5: Test state management and fix any issues

### Week 3: Component Refactoring (Phase 3)

- [ ] Day 1-2: Split Browser component
- [ ] Day 3: Extract Contact logic
- [ ] Day 4-5: Improve 3D components

### Week 4: Organization and Polish (Phases 4-6)

- [ ] Day 1-2: Reorganize file structure
- [ ] Day 3-4: Improve function design
- [ ] Day 5: Enhance type safety

## Risk Mitigation

### Backup Strategy

1. Create git branch for each phase
2. Commit after each successful step
3. Test functionality before proceeding to next step

### Testing Strategy

1. Manual testing after each phase
2. Verify 3D scene functionality
3. Test browser window interactions
4. Validate contact link generation

### Rollback Plan

1. Each phase is atomic and can be rolled back independently
2. Keep original files until new implementation is fully tested
3. Use git tags to mark stable points

## Success Criteria

### Functional Requirements

- [ ] All existing functionality preserved
- [ ] No breaking changes to user interface
- [ ] All 3D animations work correctly
- [ ] Browser window interactions function properly
- [ ] Contact links generate correctly

### Code Quality Metrics

- [ ] No prop drilling between components
- [ ] All components have single responsibility
- [ ] Type coverage > 90%
- [ ] No hardcoded values in components
- [ ] Consistent naming conventions

### Maintainability Goals

- [ ] New features can be added without modifying existing components
- [ ] Configuration changes require updates in single location
- [ ] Components are easily testable in isolation
- [ ] Code is self-documenting through types and naming

## Next Steps

1. **Review and approve this plan**
2. **Start with Phase 1 implementation**
3. **Test each phase before proceeding**
4. **Adjust timeline based on complexity discovered**

This plan provides a systematic approach to improving your codebase while maintaining functionality and reducing technical debt.
