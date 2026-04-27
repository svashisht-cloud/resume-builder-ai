# Midnight & Coral — Theme Spec

Drop-in token spec for the resume-builder app theme. Includes both modes, a derived coral ramp, brand document tokens, and copy-ready CSS / Tailwind configs.

Deep ink-blue chrome paired with a punchy coral. Energetic, recruiter-friendly, modern.

- **Primary accent:** `#FF7361` (dark), `#C24A39` (light, AA-safe)
- **Dark chrome:** `#0C1224 → #1A223E`
- **Light chrome:** `#F6F7FB → #EDEFF5`
- **Brand document tokens:** unchanged across themes

---

## Dark mode (`:root`)

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#0C1224` | Page background                         |
| `--surface`                       | `#121830` | Card / panel surface                |
| `--surface-raised` / `--surface-2`| `#1A223E` | Elevated surfaces                |
| `--foreground` / `--text`         | `#F4F6FB` | Primary text                          |
| `--muted` / `--text-muted`        | `#A4ADC4` | Secondary text                       |
| `--text-dim`                      | `#6A738C` | Tertiary / hint text                   |
| `--border`                        | `#222A48` | Borders                             |
| `--accent`                        | `#FF7361` | Primary accent · coral base |
| `--accent-hover`                  | `#E85A48` | Accent on hover                |
| `--accent-secondary` / `--accent-2` | `#7DA9FF` | Secondary accent · cobalt |

---

## Light mode (`[data-theme="light"]`)

Primary accent is anchored at the same hue but darkened for AA text contrast on white. Use the dark-mode value `#FF7361` only for non-text decorative fills here.

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#F6F7FB` | Page background                       |
| `--surface`                       | `#FFFFFF` | Card / panel surface              |
| `--surface-raised` / `--surface-2`| `#EDEFF5` | Elevated surfaces              |
| `--foreground` / `--text`         | `#0C1224` | Primary text                        |
| `--muted` / `--text-muted`        | `#525A73` | Secondary text                     |
| `--text-dim`                      | `#8B92A8` | Tertiary / hint text                 |
| `--border`                        | `#DCDFEB` | Borders                           |
| `--accent`                        | `#C24A39` | Primary accent · AA-safe          |
| `--accent-hover`                  | `#9E3829` | Accent on hover               |
| `--accent-secondary` / `--accent-2` | `#3B6CD0` | Secondary accent              |

---

## Brand · resume document (unchanged across themes)

| Token           | Hex       | Role                          |
| --------------- | --------- | ----------------------------- |
| `--forte-ink`   | `#0A0A0A` | Resume document text          |
| `--forte-paper` | `#F7F6F3` | Resume document background    |
| `--forte-stone` | `#DBD9D2` | Resume rule / border          |

---

## Coral ramp

Derived 7-stop scale anchored on `#FF7361`. Optional but recommended — exposes hover/pressed/border coral without ad-hoc rgba overlays.

| Step                | Hex       | Use                                    |
| ------------------- | --------- | -------------------------------------- |
| `coral-100` | `#FFA89A` | Hover state on dark surfaces |
| `coral-200` | `#FF8E7B` | Active / focus rings |
| `coral-300 (base)` | `#FF7361` | Primary accent on dark |
| `coral-400` | `#E85A48` | Hover on dark |
| `coral-500` | `#C24A39` | Primary accent on light (AA-safe) |
| `coral-600` | `#9E3829` | Hover on light |
| `coral-700` | `#6F2519` | Pressed / icon-only borders |

---

## Complete reference table

| Token                             | Dark         | Light        | Role                         |
| --------------------------------- | ------------ | ------------ | ---------------------------- |
| `--background` / `--bg`           | `#0C1224` | `#F6F7FB` | Page background           |
| `--surface`                       | `#121830` | `#FFFFFF` | Card / panel        |
| `--surface-raised` / `--surface-2`| `#1A223E` | `#EDEFF5` | Elevated surfaces |
| `--foreground` / `--text`         | `#F4F6FB` | `#0C1224` | Primary text             |
| `--muted` / `--text-muted`        | `#A4ADC4` | `#525A73` | Secondary text          |
| `--text-dim`                      | `#6A738C` | `#8B92A8` | Tertiary text              |
| `--border`                        | `#222A48` | `#DCDFEB` | Borders                |
| `--accent`                        | `#FF7361` | `#C24A39` | Primary accent (coral) |
| `--accent-hover`                  | `#E85A48` | `#9E3829` | Accent hover    |
| `--accent-secondary` / `--accent-2` | `#7DA9FF` | `#3B6CD0` | Secondary accent (cobalt) |
| `--forte-ink`                     | `#0A0A0A` | `#0A0A0A` | Resume text (constant)       |
| `--forte-paper`                   | `#F7F6F3` | `#F7F6F3` | Resume background (constant) |
| `--forte-stone`                   | `#DBD9D2` | `#DBD9D2` | Resume rule (constant)       |

---

## Drop-in CSS

```css
/* Midnight & Coral — dark default */
:root {
  --background:        #0C1224;
  --bg:                #0C1224;
  --surface:           #121830;
  --surface-raised:    #1A223E;
  --surface-2:         #1A223E;
  --foreground:        #F4F6FB;
  --text:              #F4F6FB;
  --muted:             #A4ADC4;
  --text-muted:        #A4ADC4;
  --text-dim:          #6A738C;
  --border:            #222A48;
  --accent:            #FF7361;
  --accent-hover:      #E85A48;
  --accent-secondary:  #7DA9FF;
  --accent-2:          #7DA9FF;

  /* Brand · resume document (unchanged across themes) */
  --forte-ink:         #0A0A0A;
  --forte-paper:       #F7F6F3;
  --forte-stone:       #DBD9D2;
}

[data-theme="light"] {
  --background:        #F6F7FB;
  --bg:                #F6F7FB;
  --surface:           #FFFFFF;
  --surface-raised:    #EDEFF5;
  --surface-2:         #EDEFF5;
  --foreground:        #0C1224;
  --text:              #0C1224;
  --muted:             #525A73;
  --text-muted:        #525A73;
  --text-dim:          #8B92A8;
  --border:            #DCDFEB;
  --accent:            #C24A39;
  --accent-hover:      #9E3829;
  --accent-secondary:  #3B6CD0;
  --accent-2:          #3B6CD0;
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
  coral: {
    100: '#FFA89A',
    200: '#FF8E7B',
    300: '#FF7361',
    400: '#E85A48',
    500: '#C24A39',
    600: '#9E3829',
    700: '#6F2519',
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
- **Accent on text.** Never use `#FF7361` as text on white — fails AA. Use it as fill (button bg, icon, gradient stop). For text/icon-on-light, use `--accent` (already points at `#C24A39` in light mode).
- **Brand tokens are sacred.** The resume document (`--forte-*`) does not change between themes.
- **Focus rings.** Use `coral-200` at 35% opacity for focus outlines on both themes.
- **Gradients.** For AI/sparkle moments use `linear-gradient(135deg, var(--accent), var(--accent-secondary))` — works in both modes.
