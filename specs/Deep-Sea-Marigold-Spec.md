# Deep Sea & Marigold — Theme Spec

Drop-in token spec for the resume-builder app theme. Includes both modes, a derived marigold ramp, brand document tokens, and copy-ready CSS / Tailwind configs.

Teal-ink chrome with a confident marigold accent. Distinctive, slightly editorial, warm-on-cool tension.

- **Primary accent:** `#F5B13E` (dark), `#A06808` (light, AA-safe)
- **Dark chrome:** `#0A1620 → #172836`
- **Light chrome:** `#F5F8F8 → #E9EFEF`
- **Brand document tokens:** unchanged across themes

---

## Dark mode (`:root`)

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#0A1620` | Page background                         |
| `--surface`                       | `#101E2A` | Card / panel surface                |
| `--surface-raised` / `--surface-2`| `#172836` | Elevated surfaces                |
| `--foreground` / `--text`         | `#F3F1EA` | Primary text                          |
| `--muted` / `--text-muted`        | `#9FAAB2` | Secondary text                       |
| `--text-dim`                      | `#677480` | Tertiary / hint text                   |
| `--border`                        | `#1E2E3D` | Borders                             |
| `--accent`                        | `#F5B13E` | Primary accent · marigold base |
| `--accent-hover`                  | `#D99425` | Accent on hover                |
| `--accent-secondary` / `--accent-2` | `#7EC5C0` | Secondary accent · teal |

---

## Light mode (`[data-theme="light"]`)

Primary accent is anchored at the same hue but darkened for AA text contrast on white. Use the dark-mode value `#F5B13E` only for non-text decorative fills here.

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#F5F8F8` | Page background                       |
| `--surface`                       | `#FFFFFF` | Card / panel surface              |
| `--surface-raised` / `--surface-2`| `#E9EFEF` | Elevated surfaces              |
| `--foreground` / `--text`         | `#0A1620` | Primary text                        |
| `--muted` / `--text-muted`        | `#516068` | Secondary text                     |
| `--text-dim`                      | `#8A949A` | Tertiary / hint text                 |
| `--border`                        | `#D8E0E0` | Borders                           |
| `--accent`                        | `#A06808` | Primary accent · AA-safe          |
| `--accent-hover`                  | `#7E5006` | Accent on hover               |
| `--accent-secondary` / `--accent-2` | `#2F7975` | Secondary accent              |

---

## Brand · resume document (unchanged across themes)

| Token           | Hex       | Role                          |
| --------------- | --------- | ----------------------------- |
| `--forte-ink`   | `#0A0A0A` | Resume document text          |
| `--forte-paper` | `#F7F6F3` | Resume document background    |
| `--forte-stone` | `#DBD9D2` | Resume rule / border          |

---

## Marigold ramp

Derived 7-stop scale anchored on `#F5B13E`. Optional but recommended — exposes hover/pressed/border marigold without ad-hoc rgba overlays.

| Step                | Hex       | Use                                    |
| ------------------- | --------- | -------------------------------------- |
| `marigold-100` | `#FACF86` | Hover state on dark surfaces |
| `marigold-200` | `#F8C062` | Active / focus rings |
| `marigold-300 (base)` | `#F5B13E` | Primary accent on dark |
| `marigold-400` | `#D99425` | Hover on dark |
| `marigold-500` | `#A06808` | Primary accent on light (AA-safe) |
| `marigold-600` | `#7E5006` | Hover on light |
| `marigold-700` | `#553604` | Pressed / icon-only borders |

---

## Complete reference table

| Token                             | Dark         | Light        | Role                         |
| --------------------------------- | ------------ | ------------ | ---------------------------- |
| `--background` / `--bg`           | `#0A1620` | `#F5F8F8` | Page background           |
| `--surface`                       | `#101E2A` | `#FFFFFF` | Card / panel        |
| `--surface-raised` / `--surface-2`| `#172836` | `#E9EFEF` | Elevated surfaces |
| `--foreground` / `--text`         | `#F3F1EA` | `#0A1620` | Primary text             |
| `--muted` / `--text-muted`        | `#9FAAB2` | `#516068` | Secondary text          |
| `--text-dim`                      | `#677480` | `#8A949A` | Tertiary text              |
| `--border`                        | `#1E2E3D` | `#D8E0E0` | Borders                |
| `--accent`                        | `#F5B13E` | `#A06808` | Primary accent (marigold) |
| `--accent-hover`                  | `#D99425` | `#7E5006` | Accent hover    |
| `--accent-secondary` / `--accent-2` | `#7EC5C0` | `#2F7975` | Secondary accent (teal) |
| `--forte-ink`                     | `#0A0A0A` | `#0A0A0A` | Resume text (constant)       |
| `--forte-paper`                   | `#F7F6F3` | `#F7F6F3` | Resume background (constant) |
| `--forte-stone`                   | `#DBD9D2` | `#DBD9D2` | Resume rule (constant)       |

---

## Drop-in CSS

```css
/* Deep Sea & Marigold — dark default */
:root {
  --background:        #0A1620;
  --bg:                #0A1620;
  --surface:           #101E2A;
  --surface-raised:    #172836;
  --surface-2:         #172836;
  --foreground:        #F3F1EA;
  --text:              #F3F1EA;
  --muted:             #9FAAB2;
  --text-muted:        #9FAAB2;
  --text-dim:          #677480;
  --border:            #1E2E3D;
  --accent:            #F5B13E;
  --accent-hover:      #D99425;
  --accent-secondary:  #7EC5C0;
  --accent-2:          #7EC5C0;

  /* Brand · resume document (unchanged across themes) */
  --forte-ink:         #0A0A0A;
  --forte-paper:       #F7F6F3;
  --forte-stone:       #DBD9D2;
}

[data-theme="light"] {
  --background:        #F5F8F8;
  --bg:                #F5F8F8;
  --surface:           #FFFFFF;
  --surface-raised:    #E9EFEF;
  --surface-2:         #E9EFEF;
  --foreground:        #0A1620;
  --text:              #0A1620;
  --muted:             #516068;
  --text-muted:        #516068;
  --text-dim:          #8A949A;
  --border:            #D8E0E0;
  --accent:            #A06808;
  --accent-hover:      #7E5006;
  --accent-secondary:  #2F7975;
  --accent-2:          #2F7975;
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
  marigold: {
    100: '#FACF86',
    200: '#F8C062',
    300: '#F5B13E',
    400: '#D99425',
    500: '#A06808',
    600: '#7E5006',
    700: '#553604',
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
- **Accent on text.** Never use `#F5B13E` as text on white — fails AA. Use it as fill (button bg, icon, gradient stop). For text/icon-on-light, use `--accent` (already points at `#A06808` in light mode).
- **Brand tokens are sacred.** The resume document (`--forte-*`) does not change between themes.
- **Focus rings.** Use `marigold-200` at 35% opacity for focus outlines on both themes.
- **Gradients.** For AI/sparkle moments use `linear-gradient(135deg, var(--accent), var(--accent-secondary))` — works in both modes.
