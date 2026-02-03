# Multi-Language Implementation Guide

This document outlines the implementation of multi-language support for the browser components in the Forest portfolio project.

## Overview

All text content from the browser components has been extracted and organized into a centralized text management system to support multiple languages. The implementation includes English (en) and Hebrew (he) translations.

## File Structure

```
src/
├── texts/
│   ├── en.json     # English language file (default)
│   ├── he.json     # Hebrew language file
│   └── index.ts    # Text management utilities and types
├── hooks/
│   └── useText.ts  # Text retrieval hook
└── components/
    └── [updated components using the text system]
```

## Text Organization

### Semantic Key Structure

Text is organized using semantic keys that describe the content's purpose and location:

- **Browser Text**: `browser.windowControls.close`, `browser.title`
- **Overview Text**: `overview.name`, `overview.subtitle`, `overview.skills.architecture`
- **About Me Text**: `aboutMe.title`, `aboutMe.paragraph1`
- **Expertise Text**: `expertise.title`, `expertise.cards.architecture.title`
- **Contact Text**: `contact.title`, `contact.subtitle`, `contact.links.linkedin`

### Language Files

#### English (en.json)

- Complete translation of all text content
- Maintains original formatting and HTML where needed
- Includes semantic keys for easy maintenance

#### Hebrew (he.json)

- Full Hebrew translation
- Proper right-to-left text support
- Maintains semantic structure for consistency

## Implementation Details

### Text Management System

The `src/texts/index.ts` file provides:

- **Type Safety**: Full TypeScript support with `TextStructure` interface
- **Path-based Access**: Use dot notation to access nested text (e.g., `"overview.name"`)
- **Language Support**: Easy switching between available languages
- **Fallback Handling**: Graceful handling of missing translations

### Hook Usage

The `useText` hook provides easy access to translated text:

```typescript
import { useText } from "../../../hooks/useText";

const MyComponent = () => {
  const getText = useText;

  return (
    <div>
      <h1>{getText("overview.name")}</h1>
      <p>{getText("overview.subtitle")}</p>
    </div>
  );
};
```

### HTML Content

For text containing HTML (like the quote in Overview), use `dangerouslySetInnerHTML`:

```typescript
<blockquote
  className="overview-quote"
  dangerouslySetInnerHTML={{ __html: getText("overview.quote") }}
></blockquote>
```

## Updated Components

All browser components have been updated to use the text system:

1. **Browser.tsx**: Window controls and browser title
2. **Overview.tsx**: Name, subtitle, skills, quote, and CTA
3. **AboutMe.tsx**: Title and all three paragraphs
4. **ExpertiseCards.tsx**: Section title and all card content
5. **Contact.tsx**: Title, subtitle, and contact method names

## Adding New Languages

To add a new language:

1. Create a new JSON file in `src/texts/` (e.g., `fr.json`)
2. Copy the structure from `en.json`
3. Translate all text content
4. Update the `Language` type in `src/texts/index.ts`
5. Add the new language to the `resources` object

## Adding New Text

To add new text content:

1. Add the text to all language files using the semantic key structure
2. Update the `TextStructure` interface in `src/texts/index.ts` if needed
3. Use the text in components with `getText("path.to.text")`

## Best Practices

1. **Use Semantic Keys**: Choose descriptive keys that explain the text's purpose
2. **Maintain Consistency**: Keep the same key structure across all languages
3. **Handle HTML Carefully**: Use `dangerouslySetInnerHTML` for text containing HTML
4. **Test All Languages**: Verify that all translations display correctly
5. **Update All Languages**: When adding new text, add it to all language files

## Current Languages

- **English (en)**: Default language, complete implementation
- **Hebrew (he)**: Complete translation with RTL support

## Future Enhancements

Potential improvements for the multi-language system:

1. **Language Switcher**: Add UI component to switch languages dynamically
2. **Language Detection**: Automatically detect user's preferred language
3. **Translation Management**: Integrate with translation management tools
4. **Pluralization**: Add support for plural forms in different languages
5. **Date/Number Formatting**: Add locale-specific formatting utilities

## Testing

To test the multi-language implementation:

1. Verify all text appears correctly in both English and Hebrew
2. Check that HTML content renders properly
3. Test that the application functions normally with text extraction
4. Validate that all semantic keys are properly structured

## Maintenance

When updating text content:

1. Update the text in all language files
2. Ensure semantic keys remain consistent
3. Test the changes in the application
4. Verify that the text system continues to function correctly

This implementation provides a solid foundation for multi-language support that can be easily extended and maintained as the project grows.
