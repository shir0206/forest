# Language Switcher Component Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for creating a new Language Switcher component that meets the specified requirements for a modern, clean dropdown interface with RTL/LTR support.

## Current State Analysis

### Existing Implementation

- **Location**: `src/components/ui/LanguageSwitcher/`
- **Current Component**: Simple toggle buttons (EN/HE)
- **Styling**: Basic active state styling with backdrop blur
- **Integration**: Uses existing AppContext and useTranslation hooks
- **RTL/LTR**: Handled through AppContext's setLanguage function

### Project Dependencies

- **State Management**: AppContext with language state
- **i18n**: Custom translation system with en.json and he.json
- **Styling**: SCSS modules
- **Navigation**: Integrated into Navigation component

## Implementation Requirements

### Visual Design Specifications

#### Resting State (Closed)

- **Layout**: Globe icon + language label + chevron icon (left to right)
- **Typography**: Dark grey text (#333), medium font weight (500)
- **Background**: Transparent with hover effect (light grey #f5f5f5)
- **Interaction**: Hover darkens text to pure black

#### Active State (Open Dropdown)

- **Trigger**: Chevron rotates 180° (points up)
- **Dropdown Position**: Bottom-aligned, right-aligned with trigger
- **Dropdown Styling**:
  - White background
  - Rounded corners (8px)
  - Soft diffused shadow
  - Thin subtle border
- **Animation**: Slide down + fade in

#### Menu Options

- **Display**: Languages in native scripts ("English" and "עברית")
- **Active Selection**: Light-blue background (#eef2ff) + medium blue text (#0052cc)
- **Hover State**: Light grey background similar to trigger

### Functional Behavior

#### Interaction & State

- Click trigger to toggle dropdown
- Click outside closes dropdown
- Press Escape closes dropdown
- Smooth animations for all state changes

#### Language Selection

- Click language option updates state
- Dropdown closes after selection
- Optional `onLanguageChange(langCode)` callback

#### RTL/LTR Support

- Automatic DOM update when language changes
- Sets `<html lang="en" dir="ltr">` for English
- Sets `<html lang="he" dir="rtl">` for Hebrew
- Site-wide layout flip through browser's dir attribute

#### Accessibility (A11y)

- Semantic HTML with proper roles
- ARIA attributes (aria-haspopup, aria-expanded, role="listbox")
- Keyboard navigation (Tab, Enter, Space, Escape)
- Screen reader compatibility
- Clear focus states

## Implementation Steps

### Step 1: Create SVG Icons

**Files to Create**:

- `src/assets/icons/globe.svg` - Minimalist globe icon
- `src/assets/icons/chevron-down.svg` - Downward pointing chevron

**Requirements**:

- Clean, minimalist design matching project aesthetic
- Proper viewBox and dimensions
- Compatible with dark grey color scheme

### Step 2: Update AppContext RTL/LTR Functionality

**File to Modify**: `src/contexts/AppContext.tsx`

**Implementation**:

```typescript
const setLanguage = useCallback((lang: Language) => {
  setLanguageState(lang);

  // Update HTML attributes for RTL/LTR support
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === "he" ? "rtl" : "ltr";
}, []);
```

**Verification**:

- Test that changing language updates HTML attributes
- Verify site layout flips correctly for Hebrew
- Ensure text direction changes appropriately

### Step 3: Create Enhanced Language Switcher Component

**File to Create/Replace**: `src/components/ui/LanguageSwitcher/LanguageSwitcher.tsx`

**Component Structure**:

```typescript
interface LanguageSwitcherProps {
  onLanguageChange?: (langCode: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  onLanguageChange,
}) => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Event handlers
  const toggleDropdown = () => setIsOpen(!isOpen);
  const selectLanguage = (lang: Language) => {
    // Update language
    // Close dropdown
    // Call callback if provided
  };

  // Click outside detection
  // Keyboard navigation
  // Focus management
};
```

**Key Features**:

- Local state for dropdown visibility
- Refs for DOM manipulation and event handling
- Click outside detection using useEffect
- Keyboard navigation support
- Proper focus management

### Step 4: Create Enhanced Styling

**File to Create/Replace**: `src/components/ui/LanguageSwitcher/languageSwitcher.scss`

**CSS Structure**:

```scss
.language-switcher {
  // Main container styles
  position: relative;

  .trigger-button {
    // Globe + text + chevron layout
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: none;
    cursor: pointer;

    &:hover {
      background: #f5f5f5;
      color: #000;
    }
  }

  .dropdown {
    // Hidden by default
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
    opacity: 0;
    transform: translateY(-10px);
    visibility: hidden;
    transition: all 0.3s ease;

    &.open {
      opacity: 1;
      transform: translateY(0);
      visibility: visible;
    }

    .language-option {
      // List item styles
      padding: 12px 16px;
      cursor: pointer;

      &.active {
        background: #eef2ff;
        color: #0052cc;
      }

      &:hover:not(.active) {
        background: #f5f5f5;
      }
    }
  }
}
```

**Animation Requirements**:

- Smooth dropdown open/close animations
- Chevron rotation animation
- Hover state transitions
- Focus state animations

### Step 5: Implement Accessibility Features

**ARIA Attributes**:

```typescript
// Trigger button
<button
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  aria-label="Language switcher"
>

// Dropdown list
<ul role="listbox" aria-label="Available languages">

// Language options
<li role="option" aria-selected={isActive}>
```

**Keyboard Navigation**:

- Tab: Navigate to trigger
- Enter/Space: Toggle dropdown
- Arrow keys: Navigate options (if needed)
- Escape: Close dropdown

### Step 6: Integration Testing

**Test Scenarios**:

1. **Language Switching**: Verify EN ↔ HE switching works
2. **RTL/LTR**: Confirm HTML attributes update and layout flips
3. **Dropdown**: Test open/close functionality
4. **Click Outside**: Verify dropdown closes when clicking elsewhere
5. **Keyboard**: Test all keyboard navigation
6. **Accessibility**: Verify screen reader compatibility
7. **Styling**: Confirm visual design matches specifications

**Integration Points**:

- Navigation component integration
- AppContext state management
- i18n system compatibility
- Existing CSS-in-SCSS styling system

## File Structure Summary

### New/Modified Files

```
src/
├── assets/
│   └── icons/
│       ├── globe.svg          # New: Globe icon
│       └── chevron-down.svg   # New: Chevron icon
├── components/
│   └── ui/
│       └── LanguageSwitcher/
│           ├── LanguageSwitcher.tsx    # Enhanced component
│           └── languageSwitcher.scss   # Enhanced styling
├── contexts/
│   └── AppContext.tsx        # Enhanced with RTL/LTR support
└── types/
    └── app.ts               # May need additional types
```

### Dependencies Maintained

- `useAppContext()` for state management
- `useTranslation()` for text content
- Existing navigation integration
- Current i18n infrastructure

## Success Criteria

### Functional Requirements

- [ ] Language switching works correctly
- [ ] RTL/LTR support functions properly
- [ ] Dropdown opens/closes smoothly
- [ ] Click outside closes dropdown
- [ ] Keyboard navigation works
- [ ] Accessibility standards met

### Visual Requirements

- [ ] Modern clean design implemented
- [ ] Proper color scheme (#333 text, #eef2ff active)
- [ ] Smooth animations and transitions
- [ ] Correct positioning and layout
- [ ] Native script display (English/עברית)

### Technical Requirements

- [ ] No breaking changes to existing code
- [ ] Proper TypeScript typing
- [ ] Performance optimized
- [ ] Cross-browser compatibility
- [ ] Mobile responsive design

## Next Steps

1. **Create SVG icons** for globe and chevron
2. **Enhance AppContext** with RTL/LTR functionality
3. **Build main component** with all required features
4. **Implement styling** with animations and transitions
5. **Add accessibility** features and ARIA attributes
6. **Test integration** with existing systems
7. **Verify RTL/LTR** functionality works correctly

This implementation plan ensures the new Language Switcher component meets all specified requirements while maintaining compatibility with the existing codebase and following best practices for accessibility and user experience.
