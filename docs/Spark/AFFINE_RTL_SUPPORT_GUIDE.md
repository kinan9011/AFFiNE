# AFFiNE RTL (Right-to-Left) Support Guide

## Current Status
RTL support is **already implemented**. Three languages have RTL enabled:
- **Arabic** (ar) - العربية
- **Persian** (fa) - فارسی  
- **Urdu** (ur) - اردو

## How RTL Works in AFFiNE

### 1. Language Configuration
**File:** `packages/frontend/i18n/src/resources/index.ts` (lines 150-170)

Each language has a config:
```typescript
ar: {
  name: 'Arabic',
  originalName: 'العربية',
  flagEmoji: '🇸🇦',
  rtl: true,  // ← Enables RTL for this language
  resource: () => import('./ar.json'),
},
```

### 2. Automatic Direction Setting
**File:** `packages/frontend/core/src/modules/i18n/entities/i18n.ts` (lines 68-73)

When language changes:
```typescript
private applyDocumentLanguage(language: Language) {
  document.documentElement.lang = language;
  document.documentElement.dir = SUPPORTED_LANGUAGES[language]?.rtl
    ? 'rtl'
    : 'ltr';
}
```

This automatically:
- Sets HTML `lang` attribute
- Sets HTML `dir` attribute to 'rtl' or 'ltr'
- Browser CSS auto-mirrors all layouts

### 3. Editor RTL Support
**File:** `packages/frontend/core/src/blocksuite/block-suite-editor/blocksuite-editor.tsx`

Experimental feature flag: "Enable editor RTL"
- Editor content text direction matches document direction
- Canvas rendering adjusts for RTL text

---

## Using RTL in AFFiNE

### Enable RTL Automatically
1. Go to Settings → Language
2. Select Arabic, Persian, or Urdu
3. UI automatically flips to RTL

### No Additional Setup Needed
- CSS Grid/Flexbox auto-reverses
- Margins/padding flip correctly
- Icons stay correct orientation
- Text alignment reverses
- Browser handles everything via `dir="rtl"`

---

## Adding New RTL Language

### Step 1: Add Language Definition
Edit `packages/frontend/i18n/src/resources/index.ts`:

```typescript
// Add to Language type (line 3-27)
export type Language =
  | 'en'
  | 'ar'
  | 'fa'
  | 'ur'
  | 'he'  // ← Add Hebrew
  // ... etc

// Add to SUPPORTED_LANGUAGES (line 41+)
he: {
  name: 'Hebrew',
  originalName: 'עברית',
  flagEmoji: '🇮🇱',
  rtl: true,  // ← Enable RTL
  resource: () => import('./he.json'),
},
```

### Step 2: Create Translation File
Create `packages/frontend/i18n/src/resources/he.json`:

Option A: Start from English template
```bash
cp packages/frontend/i18n/src/resources/en.json packages/frontend/i18n/src/resources/he.json
# Then translate all values in he.json
```

Option B: Use existing RTL translation as base
```bash
cp packages/frontend/i18n/src/resources/ar.json packages/frontend/i18n/src/resources/he.json
# Then translate to Hebrew
```

### Step 3: Update Type Definitions
Type definitions auto-generate from the above. Run:
```bash
npm run build:i18n
```

### Step 4: Test
- Build and run: `npm run build && npm run dev`
- Change language to Hebrew
- Verify UI is RTL
- Check DevTools → HTML element has `dir="rtl" lang="he"`

---

## CSS Best Practices for RTL

### ✅ DO: Use Logical Properties
```css
/* Works in both LTR and RTL automatically */
.sidebar {
  margin-inline-start: 10px;  /* left in LTR, right in RTL */
  padding-inline-end: 20px;   /* right in LTR, left in RTL */
  text-align: start;          /* left in LTR, right in RTL */
}
```

### ❌ DON'T: Use Direction-Specific Properties
```css
/* Breaks in RTL */
.sidebar {
  margin-left: 10px;    /* Always left, wrong in RTL */
  padding-right: 20px;  /* Always right, wrong in RTL */
  float: left;          /* Always floats left */
}
```

### Logical CSS Properties Reference
| Logical | LTR | RTL |
|---------|-----|-----|
| `start` | left | right |
| `end` | right | left |
| `inline-start` | left | right |
| `inline-end` | right | left |
| `block-start` | top | top |
| `block-end` | bottom | bottom |

### Flexbox/Grid Auto-Reverses
```css
/* Automatically reverses in RTL */
.row {
  display: flex;
  flex-direction: row;  /* Becomes right-to-left in RTL */
}
```

---

## Testing RTL

### 1. Visual Testing
```bash
npm run dev
# Change language to Arabic/Persian/Urdu
# Verify:
# - Sidebar on right side
# - Text alignment reversed
# - Icons not mirrored (only layout)
```

### 2. DevTools Check
Open browser DevTools → Inspector:
```html
<html lang="ar" dir="rtl">
  <!-- Should show dir="rtl" for RTL languages -->
</html>
```

### 3. Network Check
In DevTools → Network → XHR:
- Telemetry requests should contain language preference
- Verify no hardcoded direction assumptions

### 4. Keyboard Navigation
- Tab order should flow right-to-left in RTL mode
- Focus indicators should position correctly

---

## Known RTL Support

### ✅ Fully Supported
- UI layout (sidebar, toolbar, menus)
- Text alignment
- Input fields
- Buttons
- Dialogs
- Settings panels

### ⚠️ Partial Support
- Editor content (experimental flag)
- Canvas shape text rendering
- Custom components

### ❌ Not Supported
- Third-party libraries (depends on library)
- Code blocks (monospace LTR-only by nature)

---

## Troubleshooting

### Issue: UI not flipping to RTL
**Solution:** Check browser console for errors. May need hard refresh (Ctrl+Shift+R).

### Issue: Some text still LTR
**Solution:** Verify translation file exists. Run `npm run build:i18n`.

### Issue: Icons mirrored incorrectly
**Solution:** Icons should use `<svg>` with `aria-hidden` or CSS background. Don't apply transform mirror.

### Issue: Third-party UI components not RTL
**Solution:** Add CSS wrapper with `direction: rtl !important` around component, or use component's RTL prop if available.

---

## Summary

- RTL languages already working: Arabic, Persian, Urdu
- Browser auto-handles layout reversal via `dir="rtl"`
- Add new RTL language: Update type + translation file + rebuild
- Use logical CSS properties for components
- Test with DevTools HTML inspector

