# Ink & Bronze — Theme Spec

Drop-in token spec for the resume-builder app theme. Includes both modes, a derived bronze ramp, brand document tokens, and copy-ready CSS / Tailwind configs.

Serious dark navy paired with antique bronze. Mature, expensive, a touch literary — perfect for senior candidates and exec-coaching tools.

- **Primary accent:** `#C89968` (dark), `#7A4F1F` (light, AA-safe)
- **Dark chrome:** `#0D1320 → #1A2235`
- **Light chrome:** `#F5F1E8 → #ECE6D6`
- **Brand document tokens:** unchanged across themes

---

## Dark mode (`:root`)

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#0D1320` | Page background                         |
| `--surface`                       | `#131A2A` | Card / panel surface                |
| `--surface-raised` / `--surface-2`| `#1A2235` | Elevated surfaces                |
| `--foreground` / `--text`         | `#F3EEE2` | Primary text                          |
| `--muted` / `--text-muted`        | `#A3A397` | Secondary text                       |
| `--text-dim`                      | `#6A6A60` | Tertiary / hint text                   |
| `--border`                        | `#252D40` | Borders                             |
| `--accent`                        | `#C89968` | Primary accent · bronze base |
| `--accent-hover`                  | `#A87D4D` | Accent on hover                |
| `--accent-secondary` / `--accent-2` | `#9AA9BF` | Secondary accent · steel |

---

## Light mode (`[data-theme="light"]`)

Primary accent is anchored at the same hue but darkened for AA text contrast on white. Use the dark-mode value `#C89968` only for non-text decorative fills here.

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#F5F1E8` | Page background                       |
| `--surface`                       | `#FBF8F1` | Card / panel surface              |
| `--surface-raised` / `--surface-2`| `#ECE6D6` | Elevated surfaces              |
| `--foreground` / `--text`         | `#1A2235` | Primary text                        |
| `--muted` / `--text-muted`        | `#5A5C66` | Secondary text                     |
| `--text-dim`                      | `#8A8C93` | Tertiary / hint text                 |
| `--border`                        | `#DCD5C2` | Borders                           |
| `--accent`                        | `#7A4F1F` | Primary accent · AA-safe          |
| `--accent-hover`                  | `#5C3A12` | Accent on hover               |
| `--accent-secondary` / `--accent-2` | `#3D4A63` | Secondary accent              |

---

## Brand · resume document (unchanged across themes)

| Token           | Hex       | Role                          |
| --------------- | --------- | ----------------------------- |
| `--forte-ink`   | `#0A0A0A` | Resume document text          |
| `--forte-paper` | `#F7F6F3` | Resume document background    |
| `--forte-stone` | `#DBD9D2` | Resume rule / border          |

---

## Bronze ramp

Derived 7-stop scale anchored on `#C89968`. Optional but recommended — exposes hover/pressed/border bronze without ad-hoc rgba overlays.

| Step                | Hex       | Use                                    |
| ------------------- | --------- | -------------------------------------- |
| `bronze-100` | `#E2C49B` | Hover state on dark surfaces |
| `bronze-200` | `#D5AE82` | Active / focus rings |
| `bronze-300 (base)` | `#C89968` | Primary accent on dark |
| `bronze-400` | `#A87D4D` | Hover on dark |
| `bronze-500` | `#7A4F1F` | Primary accent on light (AA-safe) |
| `bronze-600` | `#5C3A12` | Hover on light |
| `bronze-700` | `#3A2308` | Pressed / icon-only borders |

---

## Complete reference table

| Token                             | Dark         | Light        | Role                         |
| --------------------------------- | ------------ | ------------ | ---------------------------- |
| `--background` / `--bg`           | `#0D1320` | `#F5F1E8` | Page background           |
| `--surface`                       | `#131A2A` | `#FBF8F1` | Card / panel        |
| `--surface-raised` / `--surface-2`| `#1A2235` | `#ECE6D6` | Elevated surfaces |
| `--foreground` / `--text`         | `#F3EEE2` | `#1A2235` | Primary text             |
| `--muted` / `--text-muted`        | `#A3A397` | `#5A5C66` | Secondary text          |
| `--text-dim`                      | `#6A6A60` | `#8A8C93` | Tertiary text              |
| `--border`                        | `#252D40` | `#DCD5C2` | Borders                |
| `--accent`                        | `#C89968` | `#7A4F1F` | Primary accent (bronze) |
| `--accent-hover`                  | `#A87D4D` | `#5C3A12` | Accent hover    |
| `--accent-secondary` / `--accent-2` | `#9AA9BF` | `#3D4A63` | Secondary accent (steel) |
| `--forte-ink`                     | `#0A0A0A` | `#0A0A0A` | Resume text (constant)       |
| `--forte-paper`                   | `#F7F6F3` | `#F7F6F3` | Resume background (constant) |
| `--forte-stone`                   | `#DBD9D2` | `#DBD9D2` | Resume rule (constant)       |

---

## Drop-in CSS

```css
/* Ink & Bronze — dark default */
:root {
  --background:        #0D1320;
  --bg:                #0D1320;
  --surface:           #131A2A;
  --surface-raised:    #1A2235;
  --surface-2:         #1A2235;
  --foreground:        #F3EEE2;
  --text:              #F3EEE2;
  --muted:             #A3A397;
  --text-muted:        #A3A397;
  --text-dim:          #6A6A60;
  --border:            #252D40;
  --accent:            #C89968;
  --accent-hover:      #A87D4D;
  --accent-secondary:  #9AA9BF;
  --accent-2:          #9AA9BF;

  /* Brand · resume document (unchanged across themes) */
  --forte-ink:         #0A0A0A;
  --forte-paper:       #F7F6F3;
  --forte-stone:       #DBD9D2;
}

[data-theme="light"] {
  --background:        #F5F1E8;
  --bg:                #F5F1E8;
  --surface:           #FBF8F1;
  --surface-raised:    #ECE6D6;
  --surface-2:         #ECE6D6;
  --foreground:        #1A2235;
  --text:              #1A2235;
  --muted:             #5A5C66;
  --text-muted:        #5A5C66;
  --text-dim:          #8A8C93;
  --border:            #DCD5C2;
  --accent:            #7A4F1F;
  --accent-hover:      #5C3A12;
  --accent-secondary:  #3D4A63;
  --accent-2:          #3D4A63;
}
```

---

## Tailwind config

```js
// tailwind.config.js · theme.extend.colors
colors: {
  background:        'var(--background)',
  surface:           'var(--surface)',
  'surface-raised':  'var(--surface-raised)',
  foreground:        'var(--foreground)',
  muted:             'var(--muted)',
  'text-dim':        'var(--text-dim)',
  border:            'var(--border)',
  accent: {
    DEFAULT:         'var(--accent)',
    hover:           'var(--accent-hover)',
    secondary:       'var(--accent-secondary)',
  },
  bronze: {
    100: '#E2C49B',
    200: '#D5AE82',
    300: '#C89968',
    400: '#A87D4D',
    500: '#7A4F1F',
    600: '#5C3A12',
    700: '#3A2308',
  },
  forte: {
    ink:    '#0A0A0A',
    paper:  '#F7F6F3',
    stone:  '#DBD9D2',
  },
},
```

---

## Implementation notes

- **One change, two themes.** Replace the existing `:root` and `[data-theme="light"]` blocks with the CSS above. No JS changes needed.
- **Accent on text.** Never use `#C89968` as text on white — fails AA. Use it as fill (button bg, icon, gradient stop). For text/icon-on-light, use `--accent` (already points at `#7A4F1F` in light mode).
- **Brand tokens are sacred.** The resume document (`--forte-*`) does not change between themes.
- **Focus rings.** Use `bronze-200` at 35% opacity for focus outlines on both themes.
- **Gradients.** For AI/sparkle moments use `linear-gradient(135deg, var(--accent), var(--accent-secondary))` — works in both modes.
