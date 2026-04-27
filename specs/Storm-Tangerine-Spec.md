# Storm & Tangerine — Theme Spec

Drop-in token spec for the resume-builder app theme. Includes both modes, a derived tangerine ramp, brand document tokens, and copy-ready CSS / Tailwind configs.

Cool neutral slate chrome with a tangerine accent. Professional first, energetic second — easier on the eyes for long editing sessions.

- **Primary accent:** `#F5894A` (dark), `#A0420D` (light, AA-safe)
- **Dark chrome:** `#11161C → #1F2630`
- **Light chrome:** `#F6F7F9 → #EBEDF1`
- **Brand document tokens:** unchanged across themes

---

## Dark mode (`:root`)

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#11161C` | Page background                         |
| `--surface`                       | `#181E26` | Card / panel surface                |
| `--surface-raised` / `--surface-2`| `#1F2630` | Elevated surfaces                |
| `--foreground` / `--text`         | `#F1F3F6` | Primary text                          |
| `--muted` / `--text-muted`        | `#9FA8B3` | Secondary text                       |
| `--text-dim`                      | `#677180` | Tertiary / hint text                   |
| `--border`                        | `#262D39` | Borders                             |
| `--accent`                        | `#F5894A` | Primary accent · tangerine base |
| `--accent-hover`                  | `#D96F30` | Accent on hover                |
| `--accent-secondary` / `--accent-2` | `#8EB6FF` | Secondary accent · cobalt |

---

## Light mode (`[data-theme="light"]`)

Primary accent is anchored at the same hue but darkened for AA text contrast on white. Use the dark-mode value `#F5894A` only for non-text decorative fills here.

| Token                             | Hex          | Role                                    |
| --------------------------------- | ------------ | --------------------------------------- |
| `--background` / `--bg`           | `#F6F7F9` | Page background                       |
| `--surface`                       | `#FFFFFF` | Card / panel surface              |
| `--surface-raised` / `--surface-2`| `#EBEDF1` | Elevated surfaces              |
| `--foreground` / `--text`         | `#11161C` | Primary text                        |
| `--muted` / `--text-muted`        | `#525B69` | Secondary text                     |
| `--text-dim`                      | `#8B94A3` | Tertiary / hint text                 |
| `--border`                        | `#DADEE5` | Borders                           |
| `--accent`                        | `#A0420D` | Primary accent · AA-safe          |
| `--accent-hover`                  | `#7E3308` | Accent on hover               |
| `--accent-secondary` / `--accent-2` | `#3B66C4` | Secondary accent              |

---

## Brand · resume document (unchanged across themes)

| Token           | Hex       | Role                          |
| --------------- | --------- | ----------------------------- |
| `--forte-ink`   | `#0A0A0A` | Resume document text          |
| `--forte-paper` | `#F7F6F3` | Resume document background    |
| `--forte-stone` | `#DBD9D2` | Resume rule / border          |

---

## Tangerine ramp

Derived 7-stop scale anchored on `#F5894A`. Optional but recommended — exposes hover/pressed/border tangerine without ad-hoc rgba overlays.

| Step                | Hex       | Use                                    |
| ------------------- | --------- | -------------------------------------- |
| `tangerine-100` | `#FBB28D` | Hover state on dark surfaces |
| `tangerine-200` | `#F89E6B` | Active / focus rings |
| `tangerine-300 (base)` | `#F5894A` | Primary accent on dark |
| `tangerine-400` | `#D96F30` | Hover on dark |
| `tangerine-500` | `#A0420D` | Primary accent on light (AA-safe) |
| `tangerine-600` | `#7E3308` | Hover on light |
| `tangerine-700` | `#511F03` | Pressed / icon-only borders |

---

## Complete reference table

| Token                             | Dark         | Light        | Role                         |
| --------------------------------- | ------------ | ------------ | ---------------------------- |
| `--background` / `--bg`           | `#11161C` | `#F6F7F9` | Page background           |
| `--surface`                       | `#181E26` | `#FFFFFF` | Card / panel        |
| `--surface-raised` / `--surface-2`| `#1F2630` | `#EBEDF1` | Elevated surfaces |
| `--foreground` / `--text`         | `#F1F3F6` | `#11161C` | Primary text             |
| `--muted` / `--text-muted`        | `#9FA8B3` | `#525B69` | Secondary text          |
| `--text-dim`                      | `#677180` | `#8B94A3` | Tertiary text              |
| `--border`                        | `#262D39` | `#DADEE5` | Borders                |
| `--accent`                        | `#F5894A` | `#A0420D` | Primary accent (tangerine) |
| `--accent-hover`                  | `#D96F30` | `#7E3308` | Accent hover    |
| `--accent-secondary` / `--accent-2` | `#8EB6FF` | `#3B66C4` | Secondary accent (cobalt) |
| `--forte-ink`                     | `#0A0A0A` | `#0A0A0A` | Resume text (constant)       |
| `--forte-paper`                   | `#F7F6F3` | `#F7F6F3` | Resume background (constant) |
| `--forte-stone`                   | `#DBD9D2` | `#DBD9D2` | Resume rule (constant)       |

---

## Drop-in CSS

```css
/* Storm & Tangerine — dark default */
:root {
  --background:        #11161C;
  --bg:                #11161C;
  --surface:           #181E26;
  --surface-raised:    #1F2630;
  --surface-2:         #1F2630;
  --foreground:        #F1F3F6;
  --text:              #F1F3F6;
  --muted:             #9FA8B3;
  --text-muted:        #9FA8B3;
  --text-dim:          #677180;
  --border:            #262D39;
  --accent:            #F5894A;
  --accent-hover:      #D96F30;
  --accent-secondary:  #8EB6FF;
  --accent-2:          #8EB6FF;

  /* Brand · resume document (unchanged across themes) */
  --forte-ink:         #0A0A0A;
  --forte-paper:       #F7F6F3;
  --forte-stone:       #DBD9D2;
}

[data-theme="light"] {
  --background:        #F6F7F9;
  --bg:                #F6F7F9;
  --surface:           #FFFFFF;
  --surface-raised:    #EBEDF1;
  --surface-2:         #EBEDF1;
  --foreground:        #11161C;
  --text:              #11161C;
  --muted:             #525B69;
  --text-muted:        #525B69;
  --text-dim:          #8B94A3;
  --border:            #DADEE5;
  --accent:            #A0420D;
  --accent-hover:      #7E3308;
  --accent-secondary:  #3B66C4;
  --accent-2:          #3B66C4;
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
  tangerine: {
    100: '#FBB28D',
    200: '#F89E6B',
    300: '#F5894A',
    400: '#D96F30',
    500: '#A0420D',
    600: '#7E3308',
    700: '#511F03',
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
- **Accent on text.** Never use `#F5894A` as text on white — fails AA. Use it as fill (button bg, icon, gradient stop). For text/icon-on-light, use `--accent` (already points at `#A0420D` in light mode).
- **Brand tokens are sacred.** The resume document (`--forte-*`) does not change between themes.
- **Focus rings.** Use `tangerine-200` at 35% opacity for focus outlines on both themes.
- **Gradients.** For AI/sparkle moments use `linear-gradient(135deg, var(--accent), var(--accent-secondary))` — works in both modes.
