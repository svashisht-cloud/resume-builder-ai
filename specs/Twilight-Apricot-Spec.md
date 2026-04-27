# Twilight & Apricot — Theme Spec

Drop-in token spec for the resume-builder app theme. Includes both modes, a derived apricot ramp, brand document tokens, and copy-ready CSS / Tailwind configs.

Softer take on Midnight — golden apricot accent over a slightly lifted ink-blue chrome. Friendlier, less aggressive than coral.

- **Primary accent:** `#FFB37A` (dark), `#B36013` (light, AA-safe)
- **Dark chrome:** `#0F1428 → #202745`
- **Light chrome:** `#F9F7F1 → #F0ECE1`
- **Brand document tokens:** unchanged across themes

---

## Dark mode (`:root`)

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#0F1428` | Page background                         |
| `--surface`                       | `#171D35` | Card / panel surface                |
| `--surface-raised` / `--surface-2`| `#202745` | Elevated surfaces                |
| `--foreground` / `--text`         | `#F6F3EC` | Primary text                          |
| `--muted` / `--text-muted`        | `#A8AEC4` | Secondary text                       |
| `--text-dim`                      | `#6F7590` | Tertiary / hint text                   |
| `--border`                        | `#272E4D` | Borders                             |
| `--accent`                        | `#FFB37A` | Primary accent · apricot base |
| `--accent-hover`                  | `#E6975E` | Accent on hover                |
| `--accent-secondary` / `--accent-2` | `#94B4FF` | Secondary accent · cobalt |

---

## Light mode (`[data-theme="light"]`)

Primary accent is anchored at the same hue but darkened for AA text contrast on white. Use the dark-mode value `#FFB37A` only for non-text decorative fills here.

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#F9F7F1` | Page background                       |
| `--surface`                       | `#FFFFFF` | Card / panel surface              |
| `--surface-raised` / `--surface-2`| `#F0ECE1` | Elevated surfaces              |
| `--foreground` / `--text`         | `#0F1428` | Primary text                        |
| `--muted` / `--text-muted`        | `#5A6079` | Secondary text                     |
| `--text-dim`                      | `#8D93A8` | Tertiary / hint text                 |
| `--border`                        | `#E4DFCE` | Borders                           |
| `--accent`                        | `#B36013` | Primary accent · AA-safe          |
| `--accent-hover`                  | `#8E4708` | Accent on hover               |
| `--accent-secondary` / `--accent-2` | `#3E63C8` | Secondary accent              |

---

## Brand · resume document (unchanged across themes)

| Token           | Hex       | Role                          |
| --------------- | --------- | ----------------------------- |
| `--forte-ink`   | `#0A0A0A` | Resume document text          |
| `--forte-paper` | `#F7F6F3` | Resume document background    |
| `--forte-stone` | `#DBD9D2` | Resume rule / border          |

---

## Apricot ramp

Derived 7-stop scale anchored on `#FFB37A`. Optional but recommended — exposes hover/pressed/border apricot without ad-hoc rgba overlays.

| Step                | Hex       | Use                                    |
| ------------------- | --------- | -------------------------------------- |
| `apricot-100` | `#FFD2AC` | Hover state on dark surfaces |
| `apricot-200` | `#FFC393` | Active / focus rings |
| `apricot-300 (base)` | `#FFB37A` | Primary accent on dark |
| `apricot-400` | `#E6975E` | Hover on dark |
| `apricot-500` | `#B36013` | Primary accent on light (AA-safe) |
| `apricot-600` | `#8E4708` | Hover on light |
| `apricot-700` | `#5C2D03` | Pressed / icon-only borders |

---

## Complete reference table

| Token                             | Dark         | Light        | Role                         |
| --------------------------------- | ------------ | ------------ | ---------------------------- |
| `--background` / `--bg`           | `#0F1428` | `#F9F7F1` | Page background           |
| `--surface`                       | `#171D35` | `#FFFFFF` | Card / panel        |
| `--surface-raised` / `--surface-2`| `#202745` | `#F0ECE1` | Elevated surfaces |
| `--foreground` / `--text`         | `#F6F3EC` | `#0F1428` | Primary text             |
| `--muted` / `--text-muted`        | `#A8AEC4` | `#5A6079` | Secondary text          |
| `--text-dim`                      | `#6F7590` | `#8D93A8` | Tertiary text              |
| `--border`                        | `#272E4D` | `#E4DFCE` | Borders                |
| `--accent`                        | `#FFB37A` | `#B36013` | Primary accent (apricot) |
| `--accent-hover`                  | `#E6975E` | `#8E4708` | Accent hover    |
| `--accent-secondary` / `--accent-2` | `#94B4FF` | `#3E63C8` | Secondary accent (cobalt) |
| `--forte-ink`                     | `#0A0A0A` | `#0A0A0A` | Resume text (constant)       |
| `--forte-paper`                   | `#F7F6F3` | `#F7F6F3` | Resume background (constant) |
| `--forte-stone`                   | `#DBD9D2` | `#DBD9D2` | Resume rule (constant)       |

---

## Drop-in CSS

```css
/* Twilight & Apricot — dark default */
:root {
  --background:        #0F1428;
  --bg:                #0F1428;
  --surface:           #171D35;
  --surface-raised:    #202745;
  --surface-2:         #202745;
  --foreground:        #F6F3EC;
  --text:              #F6F3EC;
  --muted:             #A8AEC4;
  --text-muted:        #A8AEC4;
  --text-dim:          #6F7590;
  --border:            #272E4D;
  --accent:            #FFB37A;
  --accent-hover:      #E6975E;
  --accent-secondary:  #94B4FF;
  --accent-2:          #94B4FF;

  /* Brand · resume document (unchanged across themes) */
  --forte-ink:         #0A0A0A;
  --forte-paper:       #F7F6F3;
  --forte-stone:       #DBD9D2;
}

[data-theme="light"] {
  --background:        #F9F7F1;
  --bg:                #F9F7F1;
  --surface:           #FFFFFF;
  --surface-raised:    #F0ECE1;
  --surface-2:         #F0ECE1;
  --foreground:        #0F1428;
  --text:              #0F1428;
  --muted:             #5A6079;
  --text-muted:        #5A6079;
  --text-dim:          #8D93A8;
  --border:            #E4DFCE;
  --accent:            #B36013;
  --accent-hover:      #8E4708;
  --accent-secondary:  #3E63C8;
  --accent-2:          #3E63C8;
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
  apricot: {
    100: '#FFD2AC',
    200: '#FFC393',
    300: '#FFB37A',
    400: '#E6975E',
    500: '#B36013',
    600: '#8E4708',
    700: '#5C2D03',
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
- **Accent on text.** Never use `#FFB37A` as text on white — fails AA. Use it as fill (button bg, icon, gradient stop). For text/icon-on-light, use `--accent` (already points at `#B36013` in light mode).
- **Brand tokens are sacred.** The resume document (`--forte-*`) does not change between themes.
- **Focus rings.** Use `apricot-200` at 35% opacity for focus outlines on both themes.
- **Gradients.** For AI/sparkle moments use `linear-gradient(135deg, var(--accent), var(--accent-secondary))` — works in both modes.
