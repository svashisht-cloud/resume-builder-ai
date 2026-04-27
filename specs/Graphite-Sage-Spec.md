# Graphite & Sage — Theme Spec

Drop-in token spec for the resume-builder app theme. Includes both modes, a derived sage ramp, brand document tokens, and copy-ready CSS / Tailwind configs.

Restrained graphite with a sage-green pulse. Calm and grown-up — lets the resume be the loudest thing on screen.

- **Primary accent:** `#9BB88A` (dark), `#4D6B3D` (light, AA-safe)
- **Dark chrome:** `#10120F → #1C201B`
- **Light chrome:** `#F6F6F1 → #ECEADF`
- **Brand document tokens:** unchanged across themes

---

## Dark mode (`:root`)

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#10120F` | Page background                         |
| `--surface`                       | `#161914` | Card / panel surface                |
| `--surface-raised` / `--surface-2`| `#1C201B` | Elevated surfaces                |
| `--foreground` / `--text`         | `#EEF0EB` | Primary text                          |
| `--muted` / `--text-muted`        | `#9AA097` | Secondary text                       |
| `--text-dim`                      | `#65695F` | Tertiary / hint text                   |
| `--border`                        | `#262A24` | Borders                             |
| `--accent`                        | `#9BB88A` | Primary accent · sage base |
| `--accent-hover`                  | `#82A071` | Accent on hover                |
| `--accent-secondary` / `--accent-2` | `#CFB98F` | Secondary accent · wheat |

---

## Light mode (`[data-theme="light"]`)

Primary accent is anchored at the same hue but darkened for AA text contrast on white. Use the dark-mode value `#9BB88A` only for non-text decorative fills here.

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#F6F6F1` | Page background                       |
| `--surface`                       | `#FFFFFF` | Card / panel surface              |
| `--surface-raised` / `--surface-2`| `#ECEADF` | Elevated surfaces              |
| `--foreground` / `--text`         | `#1D201A` | Primary text                        |
| `--muted` / `--text-muted`        | `#5A5E54` | Secondary text                     |
| `--text-dim`                      | `#8A8E83` | Tertiary / hint text                 |
| `--border`                        | `#DEDACC` | Borders                           |
| `--accent`                        | `#4D6B3D` | Primary accent · AA-safe          |
| `--accent-hover`                  | `#36502A` | Accent on hover               |
| `--accent-secondary` / `--accent-2` | `#7A6638` | Secondary accent              |

---

## Brand · resume document (unchanged across themes)

| Token           | Hex       | Role                          |
| --------------- | --------- | ----------------------------- |
| `--forte-ink`   | `#0A0A0A` | Resume document text          |
| `--forte-paper` | `#F7F6F3` | Resume document background    |
| `--forte-stone` | `#DBD9D2` | Resume rule / border          |

---

## Sage ramp

Derived 7-stop scale anchored on `#9BB88A`. Optional but recommended — exposes hover/pressed/border sage without ad-hoc rgba overlays.

| Step                | Hex       | Use                                    |
| ------------------- | --------- | -------------------------------------- |
| `sage-100` | `#C5D6BA` | Hover state on dark surfaces |
| `sage-200` | `#B0C7A2` | Active / focus rings |
| `sage-300 (base)` | `#9BB88A` | Primary accent on dark |
| `sage-400` | `#82A071` | Hover on dark |
| `sage-500` | `#4D6B3D` | Primary accent on light (AA-safe) |
| `sage-600` | `#36502A` | Hover on light |
| `sage-700` | `#1F351A` | Pressed / icon-only borders |

---

## Complete reference table

| Token                             | Dark         | Light        | Role                         |
| --------------------------------- | ------------ | ------------ | ---------------------------- |
| `--background` / `--bg`           | `#10120F` | `#F6F6F1` | Page background           |
| `--surface`                       | `#161914` | `#FFFFFF` | Card / panel        |
| `--surface-raised` / `--surface-2`| `#1C201B` | `#ECEADF` | Elevated surfaces |
| `--foreground` / `--text`         | `#EEF0EB` | `#1D201A` | Primary text             |
| `--muted` / `--text-muted`        | `#9AA097` | `#5A5E54` | Secondary text          |
| `--text-dim`                      | `#65695F` | `#8A8E83` | Tertiary text              |
| `--border`                        | `#262A24` | `#DEDACC` | Borders                |
| `--accent`                        | `#9BB88A` | `#4D6B3D` | Primary accent (sage) |
| `--accent-hover`                  | `#82A071` | `#36502A` | Accent hover    |
| `--accent-secondary` / `--accent-2` | `#CFB98F` | `#7A6638` | Secondary accent (wheat) |
| `--forte-ink`                     | `#0A0A0A` | `#0A0A0A` | Resume text (constant)       |
| `--forte-paper`                   | `#F7F6F3` | `#F7F6F3` | Resume background (constant) |
| `--forte-stone`                   | `#DBD9D2` | `#DBD9D2` | Resume rule (constant)       |

---

## Drop-in CSS

```css
/* Graphite & Sage — dark default */
:root {
  --background:        #10120F;
  --bg:                #10120F;
  --surface:           #161914;
  --surface-raised:    #1C201B;
  --surface-2:         #1C201B;
  --foreground:        #EEF0EB;
  --text:              #EEF0EB;
  --muted:             #9AA097;
  --text-muted:        #9AA097;
  --text-dim:          #65695F;
  --border:            #262A24;
  --accent:            #9BB88A;
  --accent-hover:      #82A071;
  --accent-secondary:  #CFB98F;
  --accent-2:          #CFB98F;

  /* Brand · resume document (unchanged across themes) */
  --forte-ink:         #0A0A0A;
  --forte-paper:       #F7F6F3;
  --forte-stone:       #DBD9D2;
}

[data-theme="light"] {
  --background:        #F6F6F1;
  --bg:                #F6F6F1;
  --surface:           #FFFFFF;
  --surface-raised:    #ECEADF;
  --surface-2:         #ECEADF;
  --foreground:        #1D201A;
  --text:              #1D201A;
  --muted:             #5A5E54;
  --text-muted:        #5A5E54;
  --text-dim:          #8A8E83;
  --border:            #DEDACC;
  --accent:            #4D6B3D;
  --accent-hover:      #36502A;
  --accent-secondary:  #7A6638;
  --accent-2:          #7A6638;
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
  sage: {
    100: '#C5D6BA',
    200: '#B0C7A2',
    300: '#9BB88A',
    400: '#82A071',
    500: '#4D6B3D',
    600: '#36502A',
    700: '#1F351A',
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
- **Accent on text.** Never use `#9BB88A` as text on white — fails AA. Use it as fill (button bg, icon, gradient stop). For text/icon-on-light, use `--accent` (already points at `#4D6B3D` in light mode).
- **Brand tokens are sacred.** The resume document (`--forte-*`) does not change between themes.
- **Focus rings.** Use `sage-200` at 35% opacity for focus outlines on both themes.
- **Gradients.** For AI/sparkle moments use `linear-gradient(135deg, var(--accent), var(--accent-secondary))` — works in both modes.
