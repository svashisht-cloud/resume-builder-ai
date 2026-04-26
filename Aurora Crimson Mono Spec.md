# Aurora · Crimson Mono — Theme Spec

Drop-in token spec for the resume-builder app theme. Includes both modes, a derived crimson ramp, brand document tokens, and copy-ready CSS / Tailwind configs.

- **Primary accent:** `#FF1F4E` (dark), `#D6133E` (light, AA-safe)
- **Dark chrome:** `#0D1226 → #1C2340`
- **Light chrome:** `#F8F7F9 → #F1EDEF`
- **Brand document tokens:** unchanged across themes

---

## Dark mode (`:root`)

Deep ink-blue chrome. Crimson stays at full strength because the surrounding navy absorbs it.

| Token                             | Hex       | Role                          |
| --------------------------------- | --------- | ----------------------------- |
| `--background` / `--bg`           | `#0D1226` | Page background               |
| `--surface`                       | `#141A32` | Card / panel surface          |
| `--surface-raised` / `--surface-2`| `#1C2340` | Elevated surfaces             |
| `--foreground` / `--text`         | `#F3F4FA` | Primary text                  |
| `--muted` / `--text-muted`        | `#A4ABC4` | Secondary text                |
| `--text-dim`                      | `#6C748D` | Tertiary / hint text          |
| `--border`                        | `#242C4A` | Borders                       |
| `--accent`                        | `#FF1F4E` | Primary accent · crimson base |
| `--accent-hover`                  | `#E6093A` | Accent on hover               |
| `--accent-secondary` / `--accent-2` | `#FFB0C2` | Secondary accent · soft pink |

---

## Light mode (`[data-theme="light"]`)

Crimson is anchored at the same hue but darkened to `#D6133E` for AA text contrast on white. Use the dark-mode crimson `#FF1F4E` only for non-text decorative fills here.

| Token                             | Hex       | Role                                  |
| --------------------------------- | --------- | ------------------------------------- |
| `--background` / `--bg`           | `#F8F7F9` | Page background                       |
| `--surface`                       | `#FFFFFF` | Card / panel surface                  |
| `--surface-raised` / `--surface-2`| `#F1EDEF` | Elevated surfaces                     |
| `--foreground` / `--text`         | `#0D1226` | Primary text                          |
| `--muted` / `--text-muted`        | `#5A5663` | Secondary text                        |
| `--text-dim`                      | `#8E8A93` | Tertiary / hint text                  |
| `--border`                        | `#E5DFE2` | Borders                               |
| `--accent`                        | `#D6133E` | Primary accent · crimson, AA-safe     |
| `--accent-hover`                  | `#B00A30` | Accent on hover                       |
| `--accent-secondary` / `--accent-2` | `#A85268` | Secondary accent · muted rose       |

---

## Brand · resume document (unchanged across themes)

The printed resume uses the same ink/paper/stone in both themes — its identity should not shift when the app toggles.

| Token           | Hex       | Role                          |
| --------------- | --------- | ----------------------------- |
| `--forte-ink`   | `#0A0A0A` | Resume document text          |
| `--forte-paper` | `#F7F6F3` | Resume document background    |
| `--forte-stone` | `#DBD9D2` | Resume rule / border          |

---

## Crimson ramp

Derived 7-stop scale anchored on `#FF1F4E`. Optional but recommended — exposes hover/pressed/border crimson without ad-hoc rgba overlays.

| Step                | Hex       | Use                                    |
| ------------------- | --------- | -------------------------------------- |
| `crimson-100`       | `#FF5979` | Hover state on dark surfaces           |
| `crimson-200`       | `#FF3A64` | Active / focus rings                   |
| `crimson-300` (base)| `#FF1F4E` | Primary accent on dark                 |
| `crimson-400`       | `#E6093A` | Hover on dark                          |
| `crimson-500`       | `#D6133E` | Primary accent on light (AA-safe)      |
| `crimson-600`       | `#B00A30` | Hover on light                         |
| `crimson-700`       | `#7A0921` | Pressed / icon-only borders            |

---

## Complete reference table

All tokens in a single flat table.

| Token                             | Dark      | Light     | Role                         |
| --------------------------------- | --------- | --------- | ---------------------------- |
| `--background` / `--bg`           | `#0D1226` | `#F8F7F9` | Page background              |
| `--surface`                       | `#141A32` | `#FFFFFF` | Card / panel                 |
| `--surface-raised` / `--surface-2`| `#1C2340` | `#F1EDEF` | Elevated surfaces            |
| `--foreground` / `--text`         | `#F3F4FA` | `#0D1226` | Primary text                 |
| `--muted` / `--text-muted`        | `#A4ABC4` | `#5A5663` | Secondary text               |
| `--text-dim`                      | `#6C748D` | `#8E8A93` | Tertiary text                |
| `--border`                        | `#242C4A` | `#E5DFE2` | Borders                      |
| `--accent`                        | `#FF1F4E` | `#D6133E` | Primary accent (crimson)     |
| `--accent-hover`                  | `#E6093A` | `#B00A30` | Accent hover                 |
| `--accent-secondary` / `--accent-2` | `#FFB0C2` | `#A85268` | Secondary accent (rose)    |
| `--forte-ink`                     | `#0A0A0A` | `#0A0A0A` | Resume text (constant)       |
| `--forte-paper`                   | `#F7F6F3` | `#F7F6F3` | Resume background (constant) |
| `--forte-stone`                   | `#DBD9D2` | `#DBD9D2` | Resume rule (constant)       |

---

## Drop-in CSS

Replaces the existing `:root` + `[data-theme="light"]` blocks one-for-one. Token names match the current setup.

```css
/* Aurora · Crimson Mono — dark default */
:root {
  --background:        #0D1226;
  --bg:                #0D1226;
  --surface:           #141A32;
  --surface-raised:    #1C2340;
  --surface-2:         #1C2340;
  --foreground:        #F3F4FA;
  --text:              #F3F4FA;
  --muted:             #A4ABC4;
  --text-muted:        #A4ABC4;
  --text-dim:          #6C748D;
  --border:            #242C4A;
  --accent:            #FF1F4E;
  --accent-hover:      #E6093A;
  --accent-secondary:  #FFB0C2;
  --accent-2:          #FFB0C2;

  /* Brand · resume document (unchanged across themes) */
  --forte-ink:         #0A0A0A;
  --forte-paper:       #F7F6F3;
  --forte-stone:       #DBD9D2;
}

[data-theme="light"] {
  --background:        #F8F7F9;
  --bg:                #F8F7F9;
  --surface:           #FFFFFF;
  --surface-raised:    #F1EDEF;
  --surface-2:         #F1EDEF;
  --foreground:        #0D1226;
  --text:              #0D1226;
  --muted:             #5A5663;
  --text-muted:        #5A5663;
  --text-dim:          #8E8A93;
  --border:            #E5DFE2;
  --accent:            #D6133E;
  --accent-hover:      #B00A30;
  --accent-secondary:  #A85268;
  --accent-2:          #A85268;
}
```

---

## Tailwind config

Drop into `theme.extend.colors`. Each token references the CSS variable above so dark/light toggling stays in one place.

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
  crimson: {
    100: '#FF5979',
    200: '#FF3A64',
    300: '#FF1F4E',
    400: '#E6093A',
    500: '#D6133E',
    600: '#B00A30',
    700: '#7A0921',
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
- **Crimson on text.** Never use `#FF1F4E` as text on white — fails AA. Use it as fill (button bg, icon, gradient stop). For text/icon-on-light, use `--accent` (already points at `#D6133E` in light mode).
- **Brand tokens are sacred.** The resume document (`--forte-*`) does not change between themes — same ink/paper/stone in dark and light.
- **Focus rings.** Use `crimson-200 / #FF3A64` at 35% opacity for focus outlines on both themes.
- **Gradients.** For AI/sparkle moments use `linear-gradient(135deg, var(--accent), var(--accent-secondary))` — works in both modes.
