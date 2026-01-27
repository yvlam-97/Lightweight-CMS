# Plugin Internationalization (i18n)

Plugins can provide their own translations, which are automatically merged with the core CMS translations.

## Overview

- Translations are stored in your plugin's `i18n/` folder
- Use your plugin ID as the translation namespace
- Translations are only loaded when the plugin is enabled
- Supported locales: `en` (English), `nl` (Dutch)

---

## Setup

### 1. Create Translation Files

```
src/plugins/your-plugin/
  i18n/
    en.json
    nl.json
```

### 2. Define Translations

Use your plugin ID as the top-level key:

**en.json:**
```json
{
  "your-plugin": {
    "navName": "Your Feature",
    "title": "Your Feature",
    "description": "Description of your feature",
    "noItems": "No items found.",
    "addNew": "Add New Item",
    "form": {
      "name": "Name",
      "namePlaceholder": "Enter name...",
      "save": "Save",
      "cancel": "Cancel"
    },
    "messages": {
      "saved": "Item saved successfully",
      "deleted": "Item deleted"
    }
  }
}
```

**nl.json:**
```json
{
  "your-plugin": {
    "navName": "Jouw Functie",
    "title": "Jouw Functie",
    "description": "Beschrijving van jouw functie",
    "noItems": "Geen items gevonden.",
    "addNew": "Nieuw item toevoegen",
    "form": {
      "name": "Naam",
      "namePlaceholder": "Voer naam in...",
      "save": "Opslaan",
      "cancel": "Annuleren"
    },
    "messages": {
      "saved": "Item succesvol opgeslagen",
      "deleted": "Item verwijderd"
    }
  }
}
```

### 3. Register in Plugin Definition

```typescript
// src/plugins/your-plugin/index.tsx
import { PluginDefinition } from '@/lib/plugins/types'
import translationsEn from './i18n/en.json'
import translationsNl from './i18n/nl.json'

export const plugin: PluginDefinition = {
  id: 'your-plugin',
  name: 'Your Plugin',
  // ... other fields

  translations: {
    en: translationsEn,
    nl: translationsNl,
  },
}
```

---

## Usage

### Server Components

```tsx
import { getTranslations } from 'next-intl/server'

export async function YourServerComponent() {
  const t = await getTranslations('your-plugin')

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <p>{t('form.name')}</p>  {/* Nested keys */}
    </div>
  )
}
```

### Client Components

```tsx
'use client'

import { useTranslations } from 'next-intl'

export function YourClientComponent() {
  const t = useTranslations('your-plugin')

  return (
    <form>
      <label>{t('form.name')}</label>
      <input placeholder={t('form.namePlaceholder')} />
      <button type="submit">{t('form.save')}</button>
    </form>
  )
}
```

---

## Special Keys

### navName

The `navName` key is used for navigation menus (header, footer, admin sidebar):

```json
{
  "your-plugin": {
    "navName": "Your Feature"
  }
}
```

If `navName` is not provided, the plugin's `name` property will be used instead.

---

## Best Practices

1. **Use your plugin ID as the namespace** - Prevents conflicts with other plugins

2. **Provide all supported locales** - Currently `en` and `nl`

3. **Keep translations close to your plugin** - Makes the plugin self-contained

4. **Use nested keys for organization** - Group related translations:
   ```json
   {
     "your-plugin": {
       "form": { ... },
       "messages": { ... },
       "errors": { ... }
     }
   }
   ```

5. **Include placeholders for dynamic content**:
   ```json
   {
     "your-plugin": {
       "itemCount": "Showing {count} items"
     }
   }
   ```
   
   Usage:
   ```tsx
   t('itemCount', { count: items.length })
   ```

---

## Adding New Locales

To add support for a new locale:

1. Create the translation file in your plugin's `i18n/` folder
2. Add it to your plugin's `translations` object
3. Update the CMS locale configuration in `src/i18n/config.ts`

---

## Related Pages

- [Getting Started with Plugins](Getting-Started-with-Plugins.md)
- [Plugin Tutorial](Plugin-Tutorial.md)
- [Plugin API Reference](Plugin-API-Reference.md)
