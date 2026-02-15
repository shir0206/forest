# Forest Portfolio Project - Complete Project Structure Documentation

## Overview

This document provides a comprehensive overview of the Forest portfolio project structure, including all files, their purposes, and their relationships within the codebase.

## Project Information

**Project Name**: Forest  
**Type**: 3D Interactive Portfolio Website  
**Technology Stack**: React, Three.js, Vite, TypeScript, SASS  
**Build System**: Vite with Rolldown  
**Language Support**: English (en) and Hebrew (he)

## Directory Structure

```
forest/
├── .gitignore                    # Git ignore configuration
├── CODE_REFACTORING_PLAN.md     # Code refactoring documentation
├── eslint.config.ts             # ESLint configuration
├── index.html                   # Main HTML entry point
├── package.json                 # Project dependencies and scripts
├── README.md                    # Basic project documentation
├── tsconfig.json                # TypeScript configuration
├── tsconfig.node.json           # Node-specific TypeScript config
├── vite.config.ts               # Vite build configuration
├── yarn.lock                    # Yarn lock file
├── public/                      # Static assets
│   ├── butterfly.svg           # Favicon and main icon
│   ├── vite.svg               # Vite logo
│   └── hdri/                  # HDR environment maps
│       ├── Gemini_Generated_Image_*.exr
│       └── ...
└── src/                       # Source code
    ├── App.jsx                 # Main application component
    ├── index.scss              # Global styles
    ├── main.jsx                # Application entry point
    ├── svg.d.ts               # SVG type declarations
    ├── vite-env.d.ts          # Vite environment types
    ├── assets/                # Project assets
    │   ├── icons/            # SVG icon components
    │   │   ├── browser/      # Window control icons
    │   │   │   ├── close.svg
    │   │   │   ├── maximize.svg
    │   │   │   └── minimize.svg
    │   │   ├── contact/      # Contact method icons
    │   │   │   ├── calendar.svg
    │   │   │   ├── linkedin.svg
    │   │   │   ├── mail.svg
    │   │   │   └── whatsapp.svg
    │   │   ├── language/     # Language switcher icons
    │   │   │   ├── check.svg
    │   │   │   ├── chevron.svg
    │   │   │   └── globe.svg
    │   │   └── service/      # Service category icons
    │   │       ├── checklist.svg
    │   │       ├── code.svg
    │   │       ├── dialog.svg
    │   │       ├── monitors.svg
    │   │       ├── structure.svg
    │   │       └── test.svg
    │   ├── images/           # PNG/SVG images
    │   │   ├── branch.svg    # Decorative branch element
    │   │   ├── circle.svg    # Profile image background
    │   │   ├── shirzabolotny.png  # Profile photo
    │   │   └── stain.svg     # Decorative stain element
    │   └── ...
    ├── components/           # React components
    │   ├── ContextBridge.tsx # Context provider for 3D components
    │   ├── 3d/              # 3D scene components
    │   │   ├── CameraControls/
    │   │   │   └── CameraControls.tsx
    │   │   ├── CinematicEffects/
    │   │   │   └── CinematicEffects.tsx
    │   │   └── ForestScene/
    │   │       └── ForestScene.tsx
    │   ├── sections/        # Main content sections
    │   │   ├── AboutMe/
    │   │   │   ├── aboutMe.scss
    │   │   │   └── AboutMe.tsx
    │   │   ├── Contact/     # Note: This directory exists but is empty
    │   │   ├── Overview/
    │   │   │   ├── overview.scss
    │   │   │   └── Overview.tsx
    │   │   └── Service/
    │   │       ├── service.css
    │   │       └── Service.tsx
    │   └── ui/             # User interface components
    │       ├── Browser/
    │       │   ├── browser.scss
    │       │   ├── Browser.tsx
    │       │   └── BrowserHeader.tsx
    │       ├── Butterfly/
    │       │   ├── butterfly.scss
    │       │   └── Butterfly.tsx
    │       ├── Contact/
    │       │   ├── contact.scss
    │       │   └── Contact.tsx
    │       ├── Icon/
    │       │   └── Icon.tsx
    │       ├── LanguageSwitcher/
    │       │   ├── languageSwitcher.scss
    │       │   └── LanguageSwitcher.tsx
    │       ├── Loader/
    │       │   ├── loader.scss
    │       │   └── Loader.tsx
    │       ├── Navigation/
    │       │   ├── navigation.scss
    │       │   └── Navigation.tsx
    │       ├── TestLanguage/
    │       │   └── TestLanguage.tsx
    │       └── WebsiteScreen/
    │           └── WebsiteScreen.tsx
    ├── config/             # Configuration files
    │   ├── 3d.ts          # 3D scene configuration
    │   ├── app.ts         # Application configuration
    │   └── links.ts       # Contact and external link configuration
    ├── contexts/         # React context providers
    │   └── AppContext.tsx
    ├── helper/           # Helper utilities and constants
    │   ├── calendarUtils.ts
    │   ├── const.ts       # Legacy constants (being refactored)
    │   └── types.ts       # Legacy type definitions
    ├── hooks/            # Custom React hooks
    │   ├── useCameraAnimation.ts
    │   ├── useDynamicFov.ts
    │   ├── useHtmlReady.ts
    │   ├── useLanguageSwitcher.ts
    │   ├── useScrollNavigation.ts
    │   ├── useScreenVisibility.ts
    │   ├── useText.ts
    │   └── useTranslation.ts
    ├── i18n/             # Internationalization
    │   ├── en.json       # English translations
    │   ├── he.json       # Hebrew translations
    │   ├── index.ts      # Translation utilities
    │   └── types.ts      # Translation type definitions
    ├── types/            # TypeScript type definitions
    │   ├── 3d.ts         # 3D-related types
    │   ├── app.ts        # Application types
    │   └── translations.ts
    └── utils/            # Utility functions
        ├── calendar.ts   # Calendar event utilities
        └── links.ts      # Link generation utilities
```

## Key Files and Their Purposes

### Configuration Files

#### `package.json`

- **Purpose**: Project dependencies, scripts, and metadata
- **Key Dependencies**: React, Three.js, @react-three/fiber, GSAP, SASS
- **Scripts**: dev, build, lint, preview, deploy

#### `vite.config.ts`

- **Purpose**: Vite build configuration with Rolldown
- **Features**: SVG import support, base path configuration

#### `tsconfig.json`

- **Purpose**: TypeScript configuration with strict mode
- **Features**: Path aliases, JSX support, strict type checking

#### `eslint.config.ts`

- **Purpose**: ESLint configuration for code quality
- **Features**: React hooks rules, TypeScript support

### Main Application Files

#### `src/main.jsx`

- **Purpose**: Application entry point
- **Function**: Renders App component with StrictMode

#### `src/App.jsx`

- **Purpose**: Root application component
- **Function**: Provides AppContext and renders ForestScene

#### `src/index.scss`

- **Purpose**: Global styles and CSS-in-JS
- **Features**: CSS variables, responsive design, animations

### 3D Scene Components

#### `src/components/3d/ForestScene/ForestScene.tsx`

- **Purpose**: Main 3D scene container
- **Features**: Canvas setup, environment mapping, camera controls
- **Dependencies**: CameraControls, CinematicEffects, Butterfly, Browser

#### `src/components/3d/CameraControls/CameraControls.tsx`

- **Purpose**: Camera movement and interaction
- **Features**: Orbit controls, FOV adjustment, animation sequences
- **Dependencies**: useCameraAnimation, useDynamicFov

#### `src/components/3d/CinematicEffects/CinematicEffects.tsx`

- **Purpose**: Post-processing effects
- **Features**: Depth of field, bokeh effects
- **Dependencies**: @react-three/postprocessing

#### `src/components/3d/Butterfly/Butterfly.tsx`

- **Purpose**: Interactive butterfly element
- **Features**: Click interaction, camera animation trigger
- **Dependencies**: useCameraAnimation

### UI Components

#### `src/components/ui/Browser/Browser.tsx`

- **Purpose**: Main content browser window
- **Features**: Window controls, navigation, content display
- **Dependencies**: BrowserHeader, Navigation, WebsiteScreen

#### `src/components/ui/Navigation/Navigation.tsx`

- **Purpose**: Section navigation
- **Features**: Scroll-based active section highlighting
- **Dependencies**: useScrollNavigation

#### `src/components/ui/LanguageSwitcher/LanguageSwitcher.tsx`

- **Purpose**: Language switching interface
- **Features**: Dropdown menu, keyboard navigation
- **Dependencies**: useTranslation, AppContext

#### `src/components/ui/Contact/Contact.tsx`

- **Purpose**: Contact information display
- **Features**: Contact links, social media integration
- **Dependencies**: generateContactLinks, useTranslation

### Context and State Management

#### `src/contexts/AppContext.tsx`

- **Purpose**: Global application state
- **State**: runIntro, windowState, visibleScreens, language
- **Actions**: setRunIntro, setWindowState, setVisibleScreens, setLanguage

### Internationalization

#### `src/i18n/en.json` & `src/i18n/he.json`

- **Purpose**: Translation content for English and Hebrew
- **Structure**: Nested objects for different UI sections
- **Content**: Navigation labels, section content, contact information

#### `src/hooks/useTranslation.ts`

- **Purpose**: Translation hook with context integration
- **Features**: Language switching, text retrieval

### Utility Functions

#### `src/utils/links.ts`

- **Purpose**: Contact link generation
- **Functions**: generateWhatsAppLink, generateGoogleCalendarLink, generateEmailLink
- **Features**: URL encoding, parameter handling

#### `src/utils/calendar.ts`

- **Purpose**: Calendar event utilities
- **Functions**: formatCalendarDate, getNextAvailableTime, createCalendarEvent

### Custom Hooks

#### `src/hooks/useCameraAnimation.ts`

- **Purpose**: Camera animation management
- **Features**: Parabolic motion, sequence animations, relative positioning

#### `src/hooks/useScrollNavigation.ts`

- **Purpose**: Scroll-based navigation
- **Features**: Active section detection, smooth scrolling

#### `src/hooks/useScreenVisibility.ts`

- **Purpose**: Screen visibility tracking
- **Features**: Intersection detection, visibility state management

## Configuration Constants

### 3D Configuration (`src/config/3d.ts`)

- **Background**: HDR environment map settings
- **Camera**: Initial position, FOV, animation presets
- **Animation**: Timing, presets for different movement styles

### Application Configuration (`src/config/app.ts`)

- **Paths**: Base URL, animation durations
- **Timing**: Transition and debounce delays
- **Animation**: Spring and ease configurations

### Contact Configuration (`src/config/links.ts`)

- **Email**: Default subject and body templates
- **WhatsApp**: Phone number and message templates
- **Calendar**: Event configuration for scheduling

## Build and Development

### Development Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run deploy`: Build and deploy to GitHub Pages

### Build Output

- **Directory**: `dist/`
- **Features**: Optimized for production, minified assets
- **Deployment**: GitHub Pages via `gh-pages` package

## Project Architecture

### Design Patterns

- **Component Composition**: Modular, reusable components
- **Context API**: Global state management
- **Custom Hooks**: Logic encapsulation and reusability
- **Configuration-Driven**: Centralized configuration files
- **Type Safety**: Comprehensive TypeScript usage

### State Management

- **Global State**: AppContext for application-wide state
- **Local State**: Component-specific state with useState
- **Derived State**: Computed values with useMemo

### Styling Approach

- **CSS-in-JS**: Styled components and CSS modules
- **SASS**: Preprocessor for advanced CSS features
- **Responsive Design**: Mobile-first approach
- **Animations**: CSS transitions and GSAP for complex animations

## File Relationships

### Component Hierarchy

```
App
└── ForestScene
    ├── CameraControls
    ├── CinematicEffects
    ├── Butterfly
    └── Browser
        ├── BrowserHeader
        ├── Navigation
        └── WebsiteScreen
            ├── Overview
            ├── AboutMe
            ├── Service
            └── Contact
```

### Data Flow

1. **AppContext** provides global state to all components
2. **Configuration files** supply constants and settings
3. **Hooks** encapsulate complex logic and state management
4. **Utility functions** handle data transformation and external integrations
5. **Translation system** provides localized content

## Development Guidelines

### Code Organization

- **Separation of Concerns**: Each file has a single, clear purpose
- **Modularity**: Components are self-contained and reusable
- **Type Safety**: Comprehensive TypeScript usage throughout
- **Configuration**: Centralized configuration for easy maintenance

### Best Practices

- **Component Naming**: PascalCase for components, camelCase for utilities
- **File Structure**: Logical grouping by feature and type
- **Documentation**: Inline comments for complex logic
- **Testing**: Manual testing strategy for interactive features

This documentation provides a complete overview of the Forest project structure, making it easier for developers to understand, maintain, and extend the codebase.

# -------------------------------

# | REFRACTOR PROJECT STRUCTURE: |

# -------------------------------

Looking at your project structure, here are my suggestions for improvements:

## Recommended Structural Changes

### 1. **Consolidate Component Organization**

Your current structure mixes related components across different directories. Consider:

```
src/
├── features/              # Feature-based organization
│   ├── scene/            # 3D scene feature
│   │   ├── components/
│   │   │   ├── ForestScene.tsx
│   │   │   ├── CameraControls.tsx
│   │   │   ├── CinematicEffects.tsx
│   │   │   └── Butterfly.tsx
│   │   ├── hooks/
│   │   │   ├── useCameraAnimation.ts
│   │   │   └── useDynamicFov.ts
│   │   ├── config/
│   │   │   └── scene.config.ts
│   │   └── types/
│   │       └── scene.types.ts
│   │
│   ├── browser/          # Browser window feature
│   │   ├── components/
│   │   │   ├── Browser.tsx
│   │   │   ├── BrowserHeader.tsx
│   │   │   └── WebsiteScreen.tsx
│   │   ├── hooks/
│   │   │   └── useScrollNavigation.ts
│   │   └── styles/
│   │       └── browser.scss
│   │
│   ├── navigation/       # Navigation feature
│   │   ├── components/
│   │   │   └── Navigation.tsx
│   │   └── styles/
│   │       └── navigation.scss
│   │
│   ├── sections/         # Content sections
│   │   ├── Overview/
│   │   ├── AboutMe/
│   │   ├── Service/
│   │   └── Contact/      # Actually implement this!
│   │
│   └── contact/          # Contact feature
│       ├── components/
│       │   ├── Contact.tsx
│       │   └── ContactLink.tsx
│       ├── utils/
│       │   ├── links.ts
│       │   └── calendar.ts
│       └── config/
│           └── contact.config.ts
```

### 2. **Unify Configuration**

Merge scattered config files into a cleaner structure:

```
src/
├── config/
│   ├── index.ts          # Main config export
│   ├── scene.config.ts   # 3D scene settings
│   ├── app.config.ts     # App-wide settings
│   ├── contact.config.ts # Contact info
│   └── animation.config.ts # Animation presets
```

### 3. **Consolidate Styles**

Create a unified styling system:

```
src/
├── styles/
│   ├── index.scss        # Main entry
│   ├── _variables.scss   # CSS variables
│   ├── _mixins.scss      # Reusable mixins
│   ├── _animations.scss  # Animation definitions
│   ├── _base.scss        # Reset & base styles
│   └── _typography.scss  # Typography system
```

### 4. **Eliminate Redundancy**

- **Remove**: `helper/const.ts` and `helper/types.ts` (marked as legacy)
- **Consolidate**: Merge `types/` files into feature-specific type definitions
- **Clean up**: Empty `Contact/` directory in sections

### 5. **Improve Asset Organization**

```
src/
├── assets/
│   ├── icons/
│   │   └── index.ts      # Export all icons from one place
│   ├── images/
│   │   └── index.ts      # Export all images from one place
│   └── hdri/             # Move from public/ if not truly static
```

### 6. **Better Hook Organization**

Group hooks by purpose:

```
src/
├── hooks/
│   ├── animation/
│   │   ├── useCameraAnimation.ts
│   │   └── useDynamicFov.ts
│   ├── navigation/
│   │   ├── useScrollNavigation.ts
│   │   └── useScreenVisibility.ts
│   ├── i18n/
│   │   ├── useTranslation.ts
│   │   └── useLanguageSwitcher.ts
│   └── ui/
│       ├── useHtmlReady.ts
│       └── useText.ts
```

### 7. **Create Shared/Common Directory**

For truly shared components and utilities:

```
src/
├── shared/
│   ├── components/
│   │   ├── Icon/
│   │   ├── Loader/
│   │   └── LanguageSwitcher/
│   ├── contexts/
│   │   └── AppContext.tsx
│   └── utils/
│       └── common.ts
```

### 8. **Type Definitions Structure**

```
src/
├── types/
│   ├── index.ts          # Re-export all types
│   ├── global.d.ts       # Global type declarations
│   ├── env.d.ts          # Environment types
│   └── modules.d.ts      # Module declarations (svg.d.ts, etc.)
```

## Key Benefits of This Structure

1. **Feature Cohesion**: Related code lives together
2. **Easier Navigation**: Clear feature boundaries
3. **Better Scalability**: Easy to add new features
4. **Reduced Imports**: Shorter relative paths
5. **Clearer Dependencies**: Feature relationships are explicit
6. **Easier Testing**: Test files can live next to components

## Migration Priority

1. **High Priority**: Remove empty Contact section, eliminate legacy helper files
2. **Medium Priority**: Consolidate configs, reorganize hooks
3. **Low Priority**: Feature-based restructuring (bigger refactor)

This structure follows modern React best practices and makes your codebase more maintainable as it grows.
