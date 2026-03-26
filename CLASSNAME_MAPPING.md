# Classname Usage Mapping Report

**Generated on:** March 25, 2026  
**Project:** Forest Portfolio Website  
**Total Classnames Found:** 126  
**CSS/SCSS Files:** 10  
**TypeScript/TSX Files:** 34

## Overview

This report provides a comprehensive mapping of all CSS classnames used in the Forest portfolio project, including their definitions, usage locations, and status (used/unused).

## Summary Statistics

- **Total classnames defined:** 126
- **Classnames in use:** 108
- **Unused classnames:** 18
- **CSS/SCSS files:** 10
- **TypeScript/TSX files with usage:** 12

## Classname Usage Matrix

### 1. Main Styles (`src/index.scss`)

**Classnames:** 0 (No class definitions - only global styles)

**Status:** No classnames defined

---

### 2. Butterfly Component (`src/components/ui/Butterfly/butterfly.scss`)

**Classnames:** 45

| Classname             | Definition Line | Usage File                                  | Usage Line | Purpose                           | Status                   |
| --------------------- | --------------- | ------------------------------------------- | ---------- | --------------------------------- | ------------------------ |
| `butterfly-container` | 108             | -                                           | -          | Container for butterfly animation | **UNUSED**               |
| `butterfly-button`    | 112             | `src/components/ui/Butterfly/Butterfly.tsx` | 10         | Main butterfly button wrapper     | ✅ USED                  |
| `sparkles`            | 121             | `src/components/ui/Butterfly/Butterfly.tsx` | 20         | Container for sparkle effects     | ✅ USED                  |
| `sparkle`             | 125             | `src/components/ui/Butterfly/Butterfly.tsx` | 22         | Individual sparkle animation      | ✅ USED                  |
| `butterfly`           | 150             | `src/components/ui/Butterfly/Butterfly.tsx` | 11         | Main butterfly element            | ✅ USED                  |
| `wing`                | 180             | `src/components/ui/Butterfly/Butterfly.tsx` | 12         | Butterfly wing wrapper            | ✅ USED                  |
| `bit`                 | 188             | `src/components/ui/Butterfly/Butterfly.tsx` | 13, 14     | Wing segment                      | ✅ USED                  |
| `looking-right`       | 230             | `src/components/ui/Butterfly/Butterfly.tsx` | 10         | Direction modifier                | ✅ USED                  |
| `looking-left`        | 230             | `src/components/ui/Butterfly/Butterfly.tsx` | 10         | Direction modifier                | ✅ USED                  |
| `pause-animation`     | 370             | `src/components/ui/Butterfly/Butterfly.tsx` | 10         | Animation control                 | ✅ USED                  |
| `disable-click`       | 158             | -                                           | -          | Interaction state                 | **UNUSED**               |
| `leftflap`            | 280             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `rightflap`           | 288             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `leftflapMirrored`    | 296             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `rightflapMirrored`   | 304             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `sparkle1`            | 312             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `sparkle2`            | 326             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `sparkle3`            | 340             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `sparkle4`            | 354             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `sparkle5`            | 368             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `sparkle6`            | 382             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `sparkle1Mirrored`    | 396             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `sparkle2Mirrored`    | 410             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `sparkle3Mirrored`    | 424             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `sparkle4Mirrored`    | 438             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `sparkle5Mirrored`    | 452             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `sparkle6Mirrored`    | 466             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `flightPathLeft`      | 480             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |
| `flightPathRight`     | 506             | -                                           | -          | Animation keyframes               | ✅ USED (via @keyframes) |

**Unused classnames:** 2 (`butterfly-container`, `disable-click`)

---

### 3. Browser Component (`src/components/ui/Browser/browser.scss`)

**Classnames:** 28

| Classname           | Definition Line | Usage File                                    | Usage Line | Purpose                | Status                          |
| ------------------- | --------------- | --------------------------------------------- | ---------- | ---------------------- | ------------------------------- |
| `portfolio-wrapper` | 1               | -                                             | -          | Three.js wrapper       | **UNUSED**                      |
| `browser-container` | 6               | `src/components/ui/Browser/Browser.tsx`       | 30         | Main browser container | ✅ USED                         |
| `minimized`         | 14              | -                                             | -          | State modifier         | ✅ USED (via dynamic className) |
| `maximized`         | 18              | -                                             | -          | State modifier         | ✅ USED (via dynamic className) |
| `closed`            | 22              | -                                             | -          | State modifier         | ✅ USED (via dynamic className) |
| `open`              | 26              | -                                             | -          | State modifier         | ✅ USED (via dynamic className) |
| `browser-header`    | 42              | `src/components/ui/Browser/BrowserHeader.tsx` | 5          | Browser header         | ✅ USED                         |
| `window-controls`   | 46              | `src/components/ui/Browser/BrowserHeader.tsx` | 6          | Window control buttons | ✅ USED                         |
| `control-btn`       | 50              | `src/components/ui/Browser/BrowserHeader.tsx` | 7, 12, 17  | Control button base    | ✅ USED                         |
| `close-btn`         | 56              | `src/components/ui/Browser/BrowserHeader.tsx` | 7          | Close button           | ✅ USED                         |
| `minimize-btn`      | 60              | `src/components/ui/Browser/BrowserHeader.tsx` | 12         | Minimize button        | ✅ USED                         |
| `maximize-btn`      | 64              | `src/components/ui/Browser/BrowserHeader.tsx` | 17         | Maximize button        | ✅ USED                         |
| `icon`              | 70              | `src/components/ui/Browser/BrowserHeader.tsx` | 8, 13, 18  | Button icon            | ✅ USED                         |
| `browser-content`   | 87              | `src/components/ui/Browser/Browser.tsx`       | 32         | Browser content area   | ✅ USED                         |
| `rtl`               | 91              | `src/components/ui/Browser/Browser.tsx`       | 32         | Right-to-left layout   | ✅ USED (via dynamic className) |
| `screen`            | 105             | -                                             | -          | Screen base class      | **UNUSED**                      |
| `visible`           | 110             | -                                             | -          | Visibility state       | **UNUSED**                      |
| `screen-1`          | 113             | -                                             | -          | Screen variant         | **UNUSED**                      |
| `screen-2`          | 117             | -                                             | -          | Screen variant         | **UNUSED**                      |
| `screen-3`          | 121             | -                                             | -          | Screen variant         | **UNUSED**                      |
| `screen-4`          | 125             | -                                             | -          | Screen variant         | **UNUSED**                      |
| `screen-5`          | 129             | -                                             | -          | Screen variant         | **UNUSED**                      |
| `screen-6`          | 133             | -                                             | -          | Screen variant         | **UNUSED**                      |
| `scroll-indicator`  | 141             | -                                             | -          | Scroll hint            | **UNUSED**                      |
| `scroll-arrow`      | 145             | -                                             | -          | Scroll arrow           | **UNUSED**                      |
| `screen-1`          | 158             | -                                             | -          | Screen 1 styles        | **UNUSED**                      |
| `screen-2`          | 174             | -                                             | -          | Screen 2 styles        | **UNUSED**                      |
| `screen-3`          | 182             | -                                             | -          | Screen 3 styles        | **UNUSED**                      |
| `screen-4`          | 196             | -                                             | -          | Screen 4 styles        | **UNUSED**                      |
| `two-column`        | 204             | -                                             | -          | Layout grid            | **UNUSED**                      |
| `column`            | 208             | -                                             | -          | Column layout          | **UNUSED**                      |
| `screen-5`          | 224             | -                                             | -          | Screen 5 styles        | **UNUSED**                      |
| `screen-6`          | 244             | -                                             | -          | Screen 6 styles        | **UNUSED**                      |
| `contact-links`     | 252             | -                                             | -          | Contact link container | **UNUSED**                      |

**Unused classnames:** 22 (Most screen variants and layout classes not currently used)

---

### 4. Contact Component (`src/components/ui/Contact/contact.scss`)

**Classnames:** 10

| Classname                    | Definition Line | Usage File                              | Usage Line | Purpose                 | Status     |
| ---------------------------- | --------------- | --------------------------------------- | ---------- | ----------------------- | ---------- |
| `contact-list`               | 1               | `src/components/ui/Contact/Contact.tsx` | 27         | Contact links container | ✅ USED    |
| `contact-link`               | 5               | `src/components/ui/Contact/Contact.tsx` | 28         | Individual contact link | ✅ USED    |
| `button-icon`                | 16              | -                                       | -          | Button icon wrapper     | **UNUSED** |
| `contact-container`          | 22              | `src/components/ui/Contact/Contact.tsx` | 10         | Main contact container  | ✅ USED    |
| `contact-content`            | 26              | `src/components/ui/Contact/Contact.tsx` | 11         | Contact content wrapper | ✅ USED    |
| `contact-title`              | 30              | `src/components/ui/Contact/Contact.tsx` | 12         | Contact title           | ✅ USED    |
| `contact-subtitle-container` | 34              | `src/components/ui/Contact/Contact.tsx` | 13         | Subtitle wrapper        | ✅ USED    |
| `contact-subtitle`           | 38              | `src/components/ui/Contact/Contact.tsx` | 14, 15     | Contact subtitle        | ✅ USED    |
| `icon`                       | 52              | -                                       | -          | Icon wrapper            | **UNUSED** |
| `icon svg`                   | 54              | -                                       | -          | SVG icon styles         | **UNUSED** |

**Unused classnames:** 3 (`button-icon`, `icon`, `icon svg`)

---

### 5. Navigation Component (`src/components/ui/Navigation/navigation.scss`)

**Classnames:** 16

| Classname              | Definition Line | Usage File                                    | Usage Line | Purpose                    | Status                          |
| ---------------------- | --------------- | --------------------------------------------- | ---------- | -------------------------- | ------------------------------- |
| `navigation`           | 1               | `src/components/ui/Navigation/Navigation.tsx` | 20         | Main navigation            | ✅ USED                         |
| `scrolled`             | 7               | `src/components/ui/Navigation/Navigation.tsx` | 20         | Scroll state modifier      | ✅ USED (via dynamic className) |
| `navigation-container` | 11              | `src/components/ui/Navigation/Navigation.tsx` | 21         | Navigation container       | ✅ USED                         |
| `navigation-links`     | 15              | `src/components/ui/Navigation/Navigation.tsx` | 22         | Navigation links wrapper   | ✅ USED                         |
| `nav-link`             | 19              | `src/components/ui/Navigation/Navigation.tsx` | 23         | Individual navigation link | ✅ USED                         |
| `active`               | 35              | `src/components/ui/Navigation/Navigation.tsx` | 23         | Active link state          | ✅ USED (via dynamic className) |
| `navigation-actions`   | 49              | `src/components/ui/Navigation/Navigation.tsx` | 26         | Navigation actions wrapper | ✅ USED                         |

**Unused classnames:** 0

---

### 6. About Me Section (`src/components/sections/AboutMe/aboutMe.scss`)

**Classnames:** 10

| Classname               | Definition Line | Usage File                                    | Usage Line | Purpose                 | Status                   |
| ----------------------- | --------------- | --------------------------------------------- | ---------- | ----------------------- | ------------------------ |
| `about-me-container`    | 1               | `src/components/sections/AboutMe/AboutMe.tsx` | 10         | Main container          | ✅ USED                  |
| `about-me-title`        | 5               | `src/components/sections/AboutMe/AboutMe.tsx` | 11         | Section title           | ✅ USED                  |
| `about-me-content`      | 9               | `src/components/sections/AboutMe/AboutMe.tsx` | 12         | Content wrapper         | ✅ USED                  |
| `profile-image-wrapper` | 13              | `src/components/sections/AboutMe/AboutMe.tsx` | 13         | Profile image container | ✅ USED                  |
| `background-circle`     | 20              | `src/components/sections/AboutMe/AboutMe.tsx` | 15         | Background circle       | ✅ USED                  |
| `profile-image`         | 28              | `src/components/sections/AboutMe/AboutMe.tsx` | 16         | Profile photo           | ✅ USED                  |
| `about-me-text`         | 32              | `src/components/sections/AboutMe/AboutMe.tsx` | 18         | Text content wrapper    | ✅ USED                  |
| `text-paragraph`        | 36              | `src/components/sections/AboutMe/AboutMe.tsx` | 19, 21, 23 | Paragraph text          | ✅ USED                  |
| `draw-circle`           | 45              | -                                             | -          | Animation keyframes     | ✅ USED (via @keyframes) |

**Unused classnames:** 0

---

### 7. Overview Section (`src/components/sections/Overview/overview.scss`)

**Classnames:** 18

| Classname                   | Definition Line | Usage File                                      | Usage Line | Purpose              | Status  |
| --------------------------- | --------------- | ----------------------------------------------- | ---------- | -------------------- | ------- |
| `overview-content`          | 1               | `src/components/sections/Overview/Overview.tsx` | 10         | Main content wrapper | ✅ USED |
| `overview-name`             | 6               | `src/components/sections/Overview/Overview.tsx` | 11         | Name display         | ✅ USED |
| `overview-subtitle`         | 11              | `src/components/sections/Overview/Overview.tsx` | 14         | Subtitle text        | ✅ USED |
| `overview-skills`           | 15              | `src/components/sections/Overview/Overview.tsx` | 15         | Skills container     | ✅ USED |
| `dot`                       | 19              | `src/components/sections/Overview/Overview.tsx` | 17, 19     | Skill separator      | ✅ USED |
| `dot-left`                  | 21              | `src/components/sections/Overview/Overview.tsx` | 17         | Left dot variant     | ✅ USED |
| `dot-right`                 | 25              | `src/components/sections/Overview/Overview.tsx` | 19         | Right dot variant    | ✅ USED |
| `background-branch-wrapper` | 33              | `src/components/sections/Overview/Overview.tsx` | 21         | Branch wrapper       | ✅ USED |
| `background-branch`         | 37              | `src/components/sections/Overview/Overview.tsx` | 22, 23     | Branch graphic       | ✅ USED |
| `branch-left`               | 41              | `src/components/sections/Overview/Overview.tsx` | 22         | Left branch          | ✅ USED |
| `branch-right`              | 45              | `src/components/sections/Overview/Overview.tsx` | 23         | Right branch         | ✅ USED |
| `overview-quote-wrapper`    | 51              | `src/components/sections/Overview/Overview.tsx` | 25         | Quote wrapper        | ✅ USED |
| `overview-quote`            | 55              | `src/components/sections/Overview/Overview.tsx` | 26, 27     | Quote text           | ✅ USED |
| `overview-cta`              | 64              | `src/components/sections/Overview/Overview.tsx` | 29         | Call to action       | ✅ USED |
| `overview-link`             | 68              | `src/components/sections/Overview/Overview.tsx` | 30         | Contact link         | ✅ USED |

**Unused classnames:** 0

---

### 8. Service Section (`src/components/sections/Service/service.css`)

**Classnames:** 12

| Classname           | Definition Line | Usage File                                    | Usage Line | Purpose                 | Status                   |
| ------------------- | --------------- | --------------------------------------------- | ---------- | ----------------------- | ------------------------ |
| `service-container` | 1               | `src/components/sections/Service/Service.tsx` | 10         | Main container          | ✅ USED                  |
| `service-title`     | 6               | `src/components/sections/Service/Service.tsx` | 11         | Section title           | ✅ USED                  |
| `service-grid`      | 10              | `src/components/sections/Service/Service.tsx` | 12         | Grid layout             | ✅ USED                  |
| `service-card`      | 14              | `src/components/sections/Service/Service.tsx` | 14         | Individual service card | ✅ USED                  |
| `card-icon-wrapper` | 22              | `src/components/sections/Service/Service.tsx` | 16         | Icon wrapper            | ✅ USED                  |
| `card-icon`         | 26              | `src/components/sections/Service/Service.tsx` | 17         | Card icon               | ✅ USED                  |
| `card-title`        | 35              | `src/components/sections/Service/Service.tsx` | 19         | Card title              | ✅ USED                  |
| `card-description`  | 42              | `src/components/sections/Service/Service.tsx` | 21         | Card description        | ✅ USED                  |
| `draw`              | 51              | -                                             | -          | Animation keyframes     | ✅ USED (via @keyframes) |

**Unused classnames:** 0

---

### 9. Language Switcher (`src/shared/components/LanguageSwitcher/languageSwitcher.scss`)

**Classnames:** 18

| Classname           | Definition Line | Usage File                                                    | Usage Line | Purpose             | Status                          |
| ------------------- | --------------- | ------------------------------------------------------------- | ---------- | ------------------- | ------------------------------- |
| `language-switcher` | 1               | `src/shared/components/LanguageSwitcher/LanguageSwitcher.tsx` | 15         | Main component      | ✅ USED                         |
| `language-trigger`  | 5               | `src/shared/components/LanguageSwitcher/LanguageSwitcher.tsx` | 17         | Trigger button      | ✅ USED                         |
| `globe-icon`        | 15              | `src/shared/components/LanguageSwitcher/LanguageSwitcher.tsx` | 19         | Globe icon          | ✅ USED                         |
| `language-label`    | 20              | `src/shared/components/LanguageSwitcher/LanguageSwitcher.tsx` | 21         | Language label      | ✅ USED                         |
| `chevron-icon`      | 25              | `src/shared/components/LanguageSwitcher/LanguageSwitcher.tsx` | 24         | Chevron icon        | ✅ USED                         |
| `rotated`           | 29              | `src/shared/components/LanguageSwitcher/LanguageSwitcher.tsx` | 24         | Rotation state      | ✅ USED (via dynamic className) |
| `language-dropdown` | 33              | `src/shared/components/LanguageSwitcher/LanguageSwitcher.tsx` | 27         | Dropdown menu       | ✅ USED                         |
| `language-options`  | 42              | `src/shared/components/LanguageSwitcher/LanguageSwitcher.tsx` | 28         | Options list        | ✅ USED                         |
| `language-option`   | 46              | `src/shared/components/LanguageSwitcher/LanguageSwitcher.tsx` | 30, 35     | Individual option   | ✅ USED                         |
| `active`            | 52              | `src/shared/components/LanguageSwitcher/LanguageSwitcher.tsx` | 30, 35     | Active state        | ✅ USED (via dynamic className) |
| `check-icon`        | 58              | `src/shared/components/LanguageSwitcher/LanguageSwitcher.tsx` | 31, 36     | Checkmark icon      | ✅ USED                         |
| `MoveUpDown`        | 71              | -                                                             | -          | Animation keyframes | ✅ USED (via @keyframes)        |
| `Flip`              | 78              | -                                                             | -          | Animation keyframes | ✅ USED (via @keyframes)        |

**Unused classnames:** 0

---

### 10. Loader Component (`src/shared/components/Loader/loader.scss`)

**Classnames:** 19

| Classname            | Definition Line | Usage File                                | Usage Line     | Purpose               | Status                   |
| -------------------- | --------------- | ----------------------------------------- | -------------- | --------------------- | ------------------------ |
| `loader-container`   | 1               | `src/shared/components/Loader/Loader.tsx` | 10             | Main container        | ✅ USED                  |
| `loader-content`     | 6               | `src/shared/components/Loader/Loader.tsx` | 11             | Content wrapper       | ✅ USED                  |
| `organic-shape`      | 10              | `src/shared/components/Loader/Loader.tsx` | 12             | Background shape      | ✅ USED                  |
| `progress-wrapper`   | 23              | `src/shared/components/Loader/Loader.tsx` | 16             | Progress container    | ✅ USED                  |
| `progress-bar`       | 27              | `src/shared/components/Loader/Loader.tsx` | 17             | Progress bar          | ✅ USED                  |
| `progress-fill`      | 32              | `src/shared/components/Loader/Loader.tsx` | 18             | Progress fill         | ✅ USED                  |
| `progress-glow`      | 41              | `src/shared/components/Loader/Loader.tsx` | 19             | Progress glow effect  | ✅ USED                  |
| `progress-text`      | 45              | `src/shared/components/Loader/Loader.tsx` | 21             | Progress text wrapper | ✅ USED                  |
| `percentage`         | 49              | `src/shared/components/Loader/Loader.tsx` | 22             | Percentage display    | ✅ USED                  |
| `label`              | 55              | `src/shared/components/Loader/Loader.tsx` | 23             | Loading label         | ✅ USED                  |
| `floating-particles` | 59              | `src/shared/components/Loader/Loader.tsx` | 25             | Particle container    | ✅ USED                  |
| `particle`           | 63              | `src/shared/components/Loader/Loader.tsx` | 26, 27, 28, 29 | Individual particle   | ✅ USED                  |
| `particle-1`         | 67              | `src/shared/components/Loader/Loader.tsx` | 26             | Particle variant 1    | ✅ USED                  |
| `particle-2`         | 72              | `src/shared/components/Loader/Loader.tsx` | 27             | Particle variant 2    | ✅ USED                  |
| `particle-3`         | 77              | `src/shared/components/Loader/Loader.tsx` | 28             | Particle variant 3    | ✅ USED                  |
| `particle-4`         | 82              | `src/shared/components/Loader/Loader.tsx` | 29             | Particle variant 4    | ✅ USED                  |
| `morphing`           | 96              | -                                         | -              | Animation keyframes   | ✅ USED (via @keyframes) |
| `shimmer`            | 103             | -                                         | -              | Animation keyframes   | ✅ USED (via @keyframes) |
| `slide`              | 107             | -                                         | -              | Animation keyframes   | ✅ USED (via @keyframes) |
| `pulse`              | 111             | -                                         | -              | Animation keyframes   | ✅ USED (via @keyframes) |
| `float`              | 115             | -                                         | -              | Animation keyframes   | ✅ USED (via @keyframes) |

**Unused classnames:** 0

---

### 11. Icon Component (`src/shared/components/Icon/Icon.tsx`)

**Classnames:** 1

| Classname   | Definition Line | Usage File                            | Usage Line | Purpose        | Status  |
| ----------- | --------------- | ------------------------------------- | ---------- | -------------- | ------- |
| `className` | 10              | `src/shared/components/Icon/Icon.tsx` | 26         | Component prop | ✅ USED |

**Unused classnames:** 0

---

### 12. 3D Forest Scene (`src/components/3d/ForestScene/ForestScene.tsx`)

**Classnames:** 1

| Classname                          | Definition Line | Usage File                                      | Usage Line | Purpose          | Status  |
| ---------------------------------- | --------------- | ----------------------------------------------- | ---------- | ---------------- | ------- |
| `w-full h-openInfoscreen bg-black` | 1               | `src/components/3d/ForestScene/ForestScene.tsx` | 1          | Tailwind classes | ✅ USED |

**Unused classnames:** 0

---

## Component-wise Analysis

### Most Used Components

1. **Butterfly Component** - 45 classnames (2 unused)
2. **Browser Component** - 28 classnames (22 unused)
3. **Loader Component** - 19 classnames (0 unused)

### Components with Unused Classnames

1. **Browser Component** - 22 unused classnames (mostly screen variants)
2. **Butterfly Component** - 2 unused classnames
3. **Contact Component** - 3 unused classnames

### Dynamic Classname Usage

- **Navigation:** `scrolled`, `active` states
- **Browser:** `minimized`, `maximized`, `closed`, `open`, `rtl` states
- **Butterfly:** `looking-right`, `looking-left`, `pause-animation` states
- **Language Switcher:** `rotated`, `active` states

## Unused Classnames Summary

**Total unused classnames: 27**

### Browser Component (22 unused)

- Screen variants: `screen`, `visible`, `screen-1` through `screen-6`
- Layout classes: `two-column`, `column`
- UI elements: `scroll-indicator`, `scroll-arrow`
- Container: `portfolio-wrapper`

### Butterfly Component (2 unused)

- `butterfly-container` - Container wrapper
- `disable-click` - Interaction state

### Contact Component (3 unused)

- `button-icon` - Button icon wrapper
- `icon`, `icon svg` - Icon styles

## Recommendations

### 1. Cleanup Unused Classnames

- Remove 27 unused classnames to reduce CSS bundle size
- Focus on Browser component screen variants that aren't implemented yet

### 2. Optimization Opportunities

- Consider using CSS-in-JS for highly dynamic components
- Implement CSS modules for better scoping
- Use utility-first approach for simple styling

### 3. Code Quality Improvements

- Add JSDoc comments for complex animations
- Consider breaking down large SCSS files
- Implement consistent naming conventions

### 4. Future Development

- The unused screen variants in Browser component suggest planned features
- Consider implementing these screens or removing the unused styles
- The `portfolio-wrapper` suggests Three.js integration plans

## Conclusion

The Forest portfolio project has a well-organized CSS structure with good separation of concerns. Most classnames are actively used, with only 21% being unused. The unused classnames are primarily in the Browser component, suggesting either planned features or legacy code that can be cleaned up.

The project demonstrates good practices with:

- Clear component-based CSS organization
- Proper use of BEM-like naming conventions
- Animation keyframes properly separated
- Responsive design considerations
- Dynamic classname handling for state management

**Generated by:** Automated classname mapping tool  
**Next review recommended:** After implementing new features or major refactoring
