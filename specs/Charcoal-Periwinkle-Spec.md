# Charcoal & Periwinkle — Theme Spec

Drop-in token spec for the resume-builder app theme. Includes both modes, a derived periwinkle ramp, brand document tokens, and copy-ready CSS / Tailwind configs.

Soft charcoal with a periwinkle accent. Modern, friendly, less intimidating during the stressful job-search moment.

- **Primary accent:** `#9AA8FF` (dark), `#5161D2` (light, AA-safe)
- **Dark chrome:** `#15161B → #23262F`
- **Light chrome:** `#F8F7FB → #EEEDF4`
- **Brand document tokens:** unchanged across themes

---

## Dark mode (`:root`)

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#15161B` | Page background                         |
| `--surface`                       | `#1C1E25` | Card / panel surface                |
| `--surface-raised` / `--surface-2`| `#23262F` | Elevated surfaces                |
| `--foreground` / `--text`         | `#F1F1F4` | Primary text                          |
| `--muted` / `--text-muted`        | `#A0A3AD` | Secondary text                       |
| `--text-dim`                      | `#696C75` | Tertiary / hint text                   |
| `--border`                        | `#2C2F3A` | Borders                             |
| `--accent`                        | `#9AA8FF` | Primary accent · periwinkle base |
| `--accent-hover`                  | `#7D8CE8` | Accent on hover                |
| `--accent-secondary` / `--accent-2` | `#F5B8C8` | Secondary accent · rose |

---

## Light mode (`[data-theme="light"]`)

Primary accent is anchored at the same hue but darkened for AA text contrast on white. Use the dark-mode value `#9AA8FF` only for non-text decorative fills here.

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#F8F7FB` | Page background                       |
| `--surface`                       | `#FFFFFF` | Card / panel surface              |
| `--surface-raised` / `--surface-2`| `#EEEDF4` | Elevated surfaces              |
| `--foreground` / `--text`         | `#1A1B22` | Primary text                        |
| `--muted` / `--text-muted`        | `#585A66` | Secondary text                     |
| `--text-dim`                      | `#8B8D99` | Tertiary / hint text                 |
| `--border`                        | `#E2E1EA` | Borders                           |
| `--accent`                        | `#5161D2` | Primary accent · AA-safe          |
| `--accent-hover`                  | `#3947B3` | Accent on hover               |
| `--accent-secondary` / `--accent-2` | `#C46D85` | Secondary accent              |

---

## Brand · resume document (unchanged across themes)

| Token           | Hex       | Role                          |
| --------------- | --------- | ----------------------------- |
| `--forte-ink`   | `#0A0A0A` | Resume document text          |
| `--forte-paper` | `#F7F6F3` | Resume document background    |
| `--forte-stone` | `#DBD9D2` | Resume rule / border          |

---

## Periwinkle ramp

Derived 7-stop scale anchored on `#9AA8FF`. Optional but recommended — exposes hover/pressed/border periwinkle without ad-hoc rgba overlays.

| Step                | Hex       | Use                                    |
| ------------------- | --------- | -------------------------------------- |
| `periwinkle-100` | `#C7CEFF` | Hover state on dark surfaces |
| `periwinkle-200` | `#B0BAFF` | Active / focus rings |
| `periwinkle-300 (base)` | `#9AA8FF` | Primary accent on dark |
| `periwinkle-400` | `#7D8CE8` | Hover on dark |
| `periwinkle-500` | `#5161D2` | Primary accent on light (AA-safe) |
| `periwinkle-600` | `#3947B3` | Hover on light |
| `periwinkle-700` | `#252F88` | Pressed / icon-only borders |

---

## Complete reference table

| Token                             | Dark         | Light        | Role                         |
| --------------------------------- | ------------ | ------------ | ---------------------------- |
| `--background` / `--bg`           | `#15161B` | `#F8F7FB` | Page background           |
| `--surface`                       | `#1C1E25` | `#FFFFFF` | Card / panel        |
| `--surface-raised` / `--surface-2`| `#23262F` | `#EEEDF4` | Elevated surfaces |
| `--foreground` / `--text`         | `#F1F1F4` | `#1A1B22` | Primary text             |
| `--muted` / `--text-muted`        | `#A0A3AD` | `#585A66` | Secondary text          |
| `--text-dim`                      | `#696C75` | `#8B8D99` | Tertiary text              |
| `--border`                        | `#2C2F3A` | `#E2E1EA` | Borders                |
| `--accent`                        | `#9AA8FF` | `#5161D2` | Primary accent (periwinkle) |
| `--accent-hover`                  | `#7D8CE8` | `#3947B3` | Accent hover    |
| `--accent-secondary` / `--accent-2` | `#F5B8C8` | `#C46D85` | Secondary accent (rose) |
| `--forte-ink`                     | `#0A0A0A` | `#0A0A0A` | Resume text (constant)       |
| `--forte-paper`                   | `#F7F6F3` | `#F7F6F3` | Resume background (constant) |
| `--forte-stone`                   | `#DBD9D2` | `#DBD9D2` | Resume rule (constant)       |

---

## Drop-in CSS

```css
/* Charcoal & Periwinkle — dark default */
:root {
  --background:        #15161B;
  --bg:                #15161B;
  --surface:           #1C1E25;
  --surface-raised:    #23262F;
  --surface-2:         #23262F;
  --foreground:        #F1F1F4;
  --text:              #F1F1F4;
  --muted:             #A0A3AD;
  --text-muted:        #A0A3AD;
  --text-dim:          #696C75;
  --border:            #2C2F3A;
  --accent:            #9AA8FF;
  --accent-hover:      #7D8CE8;
  --accent-secondary:  #F5B8C8;
  --accent-2:          #F5B8C8;

  /* Brand · resume document (unchanged across themes) */
  --forte-ink:         #0A0A0A;
  --forte-paper:       #F7F6F3;
  --forte-stone:       #DBD9D2;
}

[data-theme="light"] {
  --background:        #F8F7FB;
  --bg:                #F8F7FB;
  --surface:           #FFFFFF;
  --surface-raised:    #EEEDF4;
  --surface-2:         #EEEDF4;
  --foreground:        #1A1B22;
  --text:              #1A1B22;
  --muted:             #585A66;
  --text-muted:        #585A66;
  --text-dim:          #8B8D99;
  --border:            #E2E1EA;
  --accent:            #5161D2;
  --accent-hover:      #3947B3;
  --accent-secondary:  #C46D85;
  --accent-2:          #C46D85;
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
  periwinkle: {
    100: '#C7CEFF',
    200: '#B0BAFF',
    300: '#9AA8FF',
    400: '#7D8CE8',
    500: '#5161D2',
    600: '#3947B3',
    700: '#252F88',
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
- **Accent on text.** Never use `#9AA8FF` as text on white — fails AA. Use it as fill (button bg, icon, gradient stop). For text/icon-on-light, use `--accent` (already points at `#5161D2` in light mode).
- **Brand tokens are sacred.** The resume document (`--forte-*`) does not change between themes.
- **Focus rings.** Use `periwinkle-200` at 35% opacity for focus outlines on both themes.
- **Gradients.** For AI/sparkle moments use `linear-gradient(135deg, var(--accent), var(--accent-secondary))` — works in both modes.
