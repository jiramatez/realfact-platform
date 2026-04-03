# UI Design System Specification

> **Purpose:** This document is the single source of truth for UI consistency.
> **Audience:** Any agent or developer building new screens, components, or features for this product.
> **Rule:** Always consult this document before making any visual decision. Never hardcode values that exist as tokens.

---

## How to Use This Document

When you receive a UI task, follow this order:

1. **Check tokens first** — use named tokens (`--primary`, `--surface`, etc.), never raw hex/rgba values.
2. **Find the matching component pattern** — reuse an existing component before creating a new one.
3. **Apply the decision rules** — each section has explicit "when to use / when not to use" guidance.
4. **Check theme compatibility** — every new element must work in both Dark and Light mode.

---

## 1. Token System

Tokens are CSS custom properties defined on `:root`. They are the only source for colors, fonts, and key measurements. **Never bypass a token by hardcoding the equivalent value.**

### 1.1 Color Tokens

#### Brand

| Token | Dark Value | Light Value | Meaning |
|---|---|---|---|
| `--primary` | `#f15b26` | `#f15b26` (unchanged) | The single brand accent color. Used for all interactive, active, and highlight states. |
| `--primary-dim` | `rgba(241,91,38, 0.15)` | `rgba(241,91,38, 0.10)` | Tinted background for selected/hovered states. Never use as a border. |
| `--primary-glow` | `rgba(241,91,38, 0.35)` | `rgba(241,91,38, 0.35)` (unchanged) | For glow/shadow effects only — box-shadow, drop-shadow. |

#### Surface (Background Layers)

The system uses **3 surface layers**. Use them in order from outermost (bg) to innermost (surface2):

| Token | Dark Value | Light Value | Layer |
|---|---|---|---|
| `--bg` | `#0a0b0d` | `#f0f2f7` | Page/body background. Nothing sits behind this. |
| `--surface` | `#111318` | `#ffffff` | Cards, sidebar, topbar. First elevation above bg. |
| `--surface2` | `#181b22` | `#e8ebf2` | Inputs, table headers, nested sections. Second elevation. |

> **Rule:** Never use `--bg` as a card background. Never use `--surface2` as a page background.
> **Rule:** Surface layers must always be darker than each other (dark mode) or lighter (light mode) — never equal.

#### Border

| Token | Dark Value | Light Value | When to Use |
|---|---|---|---|
| `--border` | `rgba(255,255,255, 0.07)` | `rgba(0,0,0, 0.10)` | Default border for all containers. |
| `--border-accent` | `rgba(241,91,38, 0.30)` | `rgba(241,91,38, 0.25)` | Highlighted containers only — modals, accent cards, active panels. |

> **Rule:** Use `--border-accent` sparingly. A screen should have at most 1–2 accent-bordered elements visible at once.

#### Text

| Token | Dark Value | Light Value | When to Use |
|---|---|---|---|
| `--text` | `#eef0f5` | `#1a1d23` | Primary readable content. Body text, values, headings. |
| `--text-muted` | `#9ca3af` | `#6b7280` | Labels, captions, placeholders, secondary info. |
| `--text-dim` | `#6b7280` | `#9ca3af` | Disabled states, faintest hints. Use sparingly. |

> **Rule:** Text contrast hierarchy is always: `--text` > `--text-muted` > `--text-dim`. Never use a dimmer token for more important information than a brighter one.

#### Semantic Colors

These tokens communicate state. **Do not use them decoratively.**

| Token | Value (both themes) | Correct Use | Incorrect Use |
|---|---|---|---|
| `--success` | `#22c55e` | Positive values, online status, completed actions | Decorative green backgrounds |
| `--warning` | `#f59e0b` | Caution alerts, low-balance warnings | General orange that doesn't mean caution |
| `--error` | `#ef4444` | Negative values, failures, destructive actions | Red that doesn't mean error/danger |

#### Derived Values (Not Tokenized — Use Consistently)

These are not CSS variables but must be used at the same values throughout the codebase:

| Purpose | Value | Usage |
|---|---|---|
| Primary hover/darken | `#d94f1e` | Hover state for primary buttons and triggers |
| Primary gradient end | `#ff8c5a` | Gradient pair with `--primary` for fills and decorative lines |
| Modal overlay | `rgba(0,0,0, 0.75)` | Full-screen modal backdrop (dark mode) |
| Modal overlay (light) | `rgba(0,0,0, 0.55)` | Full-screen modal backdrop (light mode) |

---

### 1.2 Typography Tokens

#### Font Families

| Token | Value | Role | Rule |
|---|---|---|---|
| `--font-heading` | `'Bebas Neue', sans-serif` | Display titles only | Uppercase, wide letter-spacing. Never use for body text. |
| `--font-mono` | `'Space Mono', monospace` | All numeric data | IDs, amounts, counters, timestamps, quantities. Never use for prose. |
| `--font-body` | `'Noto Sans Thai', sans-serif` | All other text | Supports Thai and Latin. Default for UI labels, descriptions, buttons. |

> **Rule:** Numbers that carry data meaning (token counts, prices, session IDs, durations) **must** use `--font-mono`. Numbers in prose body text use `--font-body`.

#### Type Scale

| Role | Size | Weight | Font | Letter-spacing |
|---|---|---|---|---|
| Hero / page title | `32px` | 400 | Heading | `3px` |
| Screen title (lg) | `34px` | 400 | Heading | `3px` |
| Section title (md) | `26px` | 400 | Heading | `2px` |
| Topbar brand | `22px` | 400 | Heading | `2px` |
| Large display number | `72px` | 400 | Heading | `4px` |
| Data value (xl) | `60px` | 700 | Mono | `4px` |
| Data value (lg) | `36px` | 700 | Mono | — |
| Data value (md) | `28–30px` | 700 | Mono | — |
| Data value (sm) | `20px` | 700 | Mono | — |
| Body default | `14px` | 400 | Body | — |
| Body small | `13px` | 400 | Body | — |
| Label / badge | `12px` | 400–500 | Body | `1px` (if uppercase) |
| Micro / hint | `11px` | 400 | Body | — |

> **Rule:** Uppercase labels always pair with `letter-spacing: 1px` minimum.
> **Rule:** Do not invent font sizes outside this scale. Choose the nearest step.

---

### 1.3 Spacing & Radius Scale

#### Border Radius

| Context | Value | Notes |
|---|---|---|
| Full-screen overlay box (login) | `24px` | Largest radius — only for hero containers |
| Modal | `20px` | Dialog overlays |
| Card, panel (lg) | `16px` | Device cards, avatar cards, session panels |
| Card (default) | `14px` | Standard content cards |
| Alert banner, package card | `12–14px` | Medium containers |
| Button (lg) | `12px` | — |
| Button (default) | `10px` | — |
| Input, inline input | `10px` | — |
| Button (sm) | `8px` | Small action buttons |
| Avatar thumb inner | `8–10px` | Image/emoji containers inside cards |
| Chip / status badge | `20px` (pill) | Always pill shape |
| Circle avatar | `50%` | User avatar icon |

> **Rule:** Radius must decrease as element size decreases. A small button (8px) inside a large card (16px) is correct. The reverse is wrong.

#### Padding Reference

| Container | Padding |
|---|---|
| Page content area | `28px` |
| Standard card | `20px` |
| Accent panel (session, modal) | `24px` |
| Navigation item | `11px 16px` |
| Top bar | `0 28px` |
| Form input | `10px 14px` |
| Chip | `3px 10px` |
| Button (default) | `10px 20px` |
| Button lg | `14px 28px` |
| Button sm | `6px 14px` |

---

### 1.4 Animation Tokens

Animations should reinforce state — not decorate. Every animation has a specific reason.

| Name | Behavior | Duration | Easing | When to Use |
|---|---|---|---|---|
| `fadeIn` | opacity 0→1 + translateY(8px→0) | `0.3s` | `ease` | Page/view transitions, modal appear |
| `blink` | opacity 1→0.3→1 loop | `0.8–1.5s` | `ease-in-out` | Live dots, active indicators, notification dots |
| `pulse-border` | opacity + scale(1→1.05) loop | `2s` | `ease-in-out` | Brand logo ring — emphasizes "always on" |
| `scan` | translateY(100%→-100%) loop | `2.5s` | `ease-in-out` | Active device thumbnails — signals live state |

**Transition standards:**
- Sidebar width: `0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Hover color/border: `0.2s` (no easing specified = default ease)
- Page fade: `0.3s ease`

> **Rule:** `blink` is reserved for elements that indicate real-time live data (a session is running, a notification exists). Do not use it as general decoration.
> **Rule:** Interactive elements (buttons, cards, inputs) use `transition: all 0.2s`. Structural transitions (sidebars, panels) use `cubic-bezier(0.4, 0, 0.2, 1)`.

---

## 2. Theme System

This product supports two themes. **All new UI must be theme-compatible.**

### 2.1 How Themes Work

- Default theme is **Dark**.
- Light mode is activated by adding class `light-mode` to `<body>`.
- Light mode **overrides** specific CSS custom properties — it does not use a separate stylesheet.
- User preference is persisted in `localStorage` under key `rfaTheme`.
- On page load, the saved preference is applied automatically.

### 2.2 Token Diff: Dark vs Light

Tokens not listed here are **identical in both themes**.

| Token | Dark | Light |
|---|---|---|
| `--bg` | `#0a0b0d` | `#f0f2f7` |
| `--surface` | `#111318` | `#ffffff` |
| `--surface2` | `#181b22` | `#e8ebf2` |
| `--border` | `rgba(255,255,255, 0.07)` | `rgba(0,0,0, 0.10)` |
| `--border-accent` | `rgba(241,91,38, 0.30)` | `rgba(241,91,38, 0.25)` |
| `--text` | `#eef0f5` | `#1a1d23` |
| `--text-muted` | `#9ca3af` | `#6b7280` |
| `--text-dim` | `#6b7280` | `#9ca3af` |
| `--primary-dim` | `rgba(241,91,38, 0.15)` | `rgba(241,91,38, 0.10)` |

**Tokens unchanged across themes:** `--primary`, `--primary-glow`, `--success`, `--warning`, `--error`, all `--font-*` tokens.

### 2.3 Light Mode Component Adjustments

Some components need extra overrides beyond token changes:

| Component | Property | Light Mode Value | Reason |
|---|---|---|---|
| Body noise overlay (`::before`) | `opacity` | `0.08` | Grain too harsh on light bg |
| Body ambient glow (`::after`) | glow intensity | `rgba(241,91,38,.06)` | Reduce on white |
| Topbar | `background` | `rgba(255,255,255,.92)` | Explicit white glass |
| Table `td` | `background` | `var(--surface)` | Prevent transparent bleed |
| Table `th` | `background` | `var(--surface)` | Match td in light |
| `.table-wrap` | `background` | `var(--surface)` | Wrapper must match |
| `.inv-head`, `.inv-summary`, `.receipt-total` | `background` | `var(--surface)` | Dark surface2 looks wrong on light |
| Modal overlay | `background` | `rgba(0,0,0,.55)` | Less harsh than dark's 0.75 |
| Hover backgrounds | Use `rgba(0,0,0,…)` | `0.02–0.05` range | Never use white-alpha on light bg |

### 2.4 Theme Toggle Component

The toggle button that switches themes:

```
Size:   36×36px
Bg:     --surface2
Border: 1px solid --border
Radius: 10px
Icon:   🌙 when in Dark mode  /  ☀️ when in Light mode
Hover:  border-color → --primary
```

Placement options:
- **Topbar** — quick-access icon button (optional)
- **Settings / Appearance section** — primary location with labeled `🌙 Dark` and `☀️ Light` buttons

---

## 3. Component Patterns

### How to Choose a Component

```
New UI element needed?
│
├─ Is it a full-page overlay? → Login box / Modal
├─ Is it a summary of a single entity? → Card (pick variant below)
├─ Is it a key metric at a glance? → Stat Card
├─ Is it inline classification? → Chip
├─ Is it a real-time status indicator? → Status Badge
├─ Is it a user action? → Button
├─ Is it navigation between views? → Tab Bar
├─ Is it tabular data? → Table
└─ Is it a time-critical notice? → Banner
```

---

### 3.1 Button

Two variants only. Do not create new variants.

| Variant | Class | Use When |
|---|---|---|
| Filled | `.btn-primary` | Primary action on a screen. Only one per modal/form. |
| Ghost | `.btn-outline` | Secondary/cancel action. Can appear alongside primary. |

**Sizes** (apply in addition to variant class):

| Class | Padding | Font | Radius | Use When |
|---|---|---|---|---|
| `.btn-lg` | `14px 28px` | `15px` | `12px` | Hero action, prominent CTA |
| `.btn` | `10px 20px` | `14px` | `10px` | Default |
| `.btn-sm` | `6px 14px` | `12px` | `8px` | Inline action inside a card or table |

**States:**
- Default primary: bg `--primary`, shadow `0 4px 16px rgba(241,91,38,.3)`
- Hover primary: bg `#d94f1e`, translateY(-1px), shadow intensifies
- Disabled: opacity 0.5, `cursor: default`, no hover effect

> **Rule:** Never place two `.btn-primary` buttons next to each other. If you need two actions, one must be `.btn-outline`.

---

### 3.2 Chip

Used for **inline labels and classifications**. Not for actions.

| Variant | Color | Semantic Meaning |
|---|---|---|
| `.chip-orange` | Primary orange | Brand-related label, "active", "featured" |
| `.chip-green` | Success green | Completed, verified, available |
| `.chip-red` | Error red | Rejected, failed, unavailable |
| `.chip-yellow` | Warning amber | Pending, caution, limited |
| `.chip-gray` | Neutral | Neutral tag, role label, inactive |

Base style: `padding: 3px 10px` · `border-radius: 20px` · `font-size: 12px` · `font-weight: 500`

> **Rule:** Chips are read-only labels. If clicking the chip does something, use a button instead.
> **Rule:** One chip per concept. Don't stack two chips for the same entity unless they describe orthogonal dimensions (e.g., status + role).

---

### 3.3 Status Badge

Used for **live system states** only. Not for classifications.

| State | Class | Meaning |
|---|---|---|
| Online/Ready | `.status-badge.online` | System is connected, ready to act |
| Offline | `.status-badge.offline` | System is unreachable or inactive |
| Active/Running | `.status-badge.session` | A process is currently running |

Always includes a `.status-dot` (6×6px circle). Online and active dots use `blink` animation. Offline dot is static.

> **Rule:** Use Status Badge only for live/real-time states from a backend. For classification (e.g., "Popular", "New"), use Chip instead.

---

### 3.4 Card Variants

All cards share: `background: --surface` · `border: 1px solid --border` · `border-radius: 14–16px`

| Variant | When to Use | Special Property |
|---|---|---|
| `.card` | Standard content container | Plain |
| `.card-accent` | Container that needs visual emphasis | `border: --border-accent` + 2px top gradient line |
| `.stat-card` | A single key metric with icon + value + subtitle | Fixed inner structure |
| Device/Avatar/Package Card | Entity card with image area + body + footer | Hover: `translateY(-2px)` + border highlight |

**Card selection rules:**
- Use `.card-accent` for the "most important" card on a screen — not for every card.
- Use `.stat-card` only when the primary information is a single number.
- Entity cards (device, avatar, package) always have a `.selected` state with primary border + shadow ring.
- Inactive/offline entity cards use `opacity: 0.55` and have all hover effects removed.

**Top accent line pattern** (used on `.card-accent`, modals, session panels):
```css
::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary), #ff8c5a, transparent);
}
```
> **Rule:** The top accent line appears on containers that are "currently important" — active panel, modal, highlighted card. Do not apply it to every card on a screen.

---

### 3.5 Form Elements

#### Text Input
```
bg:           --surface2
border:       1px solid --border
border-radius: 10px
padding:      10px 14px
font-size:    14px
color:        --text
:focus →      border-color: --primary (no outline, no shadow)
```

#### Label (above any input)
```
font-size:       12px
color:           --text-muted
text-transform:  uppercase
letter-spacing:  0.5px
margin-bottom:   6px
display:         block
```

#### OTP Input (multi-box)
```
Each box: square (aspect-ratio: 1), --surface2 bg, --border border, 10px radius
Font: --font-mono, ~20px, centered
:focus → border-color: --primary
Auto-advance: on input, focus moves to next box
```

#### Toggle Switch
```
Track size:  42×24px, pill shape
Off state:   bg --border
On state:    bg --primary
Knob:        18×18px white circle, 3px from edge
Transition:  0.2s
```

> **Rule:** Input focus state is border-color change only. Do not add glow, shadow, or background change on focus.
> **Rule:** Labels are always uppercase. Never use sentence-case or title-case labels.

---

### 3.6 Tab Bar

For **switching between views within the same page context**. Not for page navigation.

```
Outer container: bg --surface2, padding 4px, border-radius 12px, width fit-content
Tab item:        padding 8px 18px, radius 9px, font 13px, color --text-muted
Active item:     bg --surface, color --text, box-shadow 0 1px 4px rgba(0,0,0,.4)
```

> **Rule:** Tab bar should contain 2–5 tabs. For page-level navigation (between major sections), use the sidebar instead.

---

### 3.7 Table

```
Wrapper:       .table-wrap — border --border, radius 14px, overflow hidden
Header row:    bg --surface2
th:            12px, uppercase, letter-spacing 1px, color --text-muted
td:            13px, padding 12px 14px
Row separator: border-bottom: 1px solid --border (last row has none)
Row hover:     bg rgba(255,255,255,.02) — dark / rgba(0,0,0,.03) — light
```

**Amount formatting:**
- Positive numbers: class `.amount-pos` → `--success`, `--font-mono`, 13px
- Negative numbers: class `.amount-neg` → `--error`, `--font-mono`, 13px

> **Rule:** IDs, numbers, and timestamps in table cells always use `--font-mono`.
> **Rule:** Use `.table-wrap` as the outer element — never put `<table>` directly without it.

---

### 3.8 Modal

```
Overlay:  position fixed, inset 0, bg rgba(0,0,0,.75), backdrop-filter blur(10px)
Container: bg --surface, border --border-accent, radius 20px, padding 28px, max-width 440px
Title:    --font-heading, 26px, letter-spacing 2px
Subtitle: 13px, color --text-muted, margin-bottom 22px
Close btn: 32×32px, top-right corner, bg --surface2, radius 8px
           hover → border-color --error, color --error
```

> **Rule:** Modal max-width is 440px for standard dialogs. Wide modals (e.g., multi-step) may go to 560px.
> **Rule:** Always include a close button. Clicking outside the modal does not close it (unless explicitly designed to).

---

### 3.9 Banner / Alert

Two types:

**Warning alert** — time-sensitive notice requiring user attention:
```
bg:     rgba(245,158,11, 0.08)
border: 1px solid rgba(245,158,11, 0.2)
radius: 12px
padding: 13px 18px
Icon:   20px emoji or FA icon
Text:   13px, keyword highlighted with --warning
Action: optional .btn-sm at far right
```

**Info/promo banner** — contextual information, non-critical:
```
bg:     linear-gradient(135deg, rgba(241,91,38,.1), rgba(241,91,38,.04))
border: --border-accent
radius: 14px
padding: 16px 20px
Has: icon (28px), text block, optional value display (Mono 24px --primary)
```

> **Rule:** Warning banners appear at the top of a page section, above content. Max one warning banner per page view.
> **Rule:** Info banners sit above section headings. They are not alerts — do not style them with warning colors.

---

### 3.10 Live/Active Panel

Used for any real-time or time-sensitive process display:

```
bg:     --surface
border: --border-accent
radius: 16px
padding: 24px
position: relative, overflow: hidden
::before: top 1px gradient line (--primary → #ff8c5a → transparent)

Live indicator: flex row, gap 8px, font-mono 12px, --primary color
  - Dot: 8×8px, bg --primary, blink animation

Large timer display:
  - Font: --font-heading, 72px, letter-spacing 4px

Progress bar:
  - Track: height 4px, bg --border, radius 2px
  - Fill:  gradient --primary → #ff8c5a
  - End dot: 8×8px white circle, box-shadow glow

Primary action button (full width):
  - bg --primary, 15px 600, radius 12px
  - Destructive variant: bg rgba(239,68,68,.85)
```

> **Rule:** The top accent line + `--border-accent` signals "this is currently active/important". Do not apply this pattern to inactive or standby states.

---

### 3.11 Layout Shell

#### Sidebar

```
Collapsed width: --sw (68px) — icon only
Expanded width:  --sw-open (210px) — icon + label
Expand trigger:  :hover on unlocked sidebar
Lock toggle:     user can pin to expanded state
Transition:      width 0.3s cubic-bezier(0.4, 0, 0.2, 1)

bg: --surface
border-right: 1px solid --border

Nav item states:
  default  → color --text-muted, border-left 2px transparent
  hover    → color --text, bg rgba(255,255,255,.04)
  active   → color --primary, border-left 2px --primary, bg --primary-dim

Brand logo:
  36×36px, bg --primary, radius 8px
  ::after ring with pulse-border animation
```

Labels and lock button are hidden when collapsed (opacity: 0) and revealed on expand (opacity: 1, transition delay 0.08s).

#### Topbar

```
height: 60px
bg: rgba(17,19,24,.85)  /  rgba(255,255,255,.92) in light mode
backdrop-filter: blur(20px)
border-bottom: 1px solid --border
position: sticky, top: 0, z-index: 50

Contains (left to right):
  - Brand title (--font-heading, 22px, letter-spacing 2px)
  - Page name (12px, --text-muted)
  - [spacer: margin-left auto]
  - Balance chip (see below)
  - Notification bell (36×36px, --surface2, radius 10px)
  - User avatar (36×36px, circular, gradient bg)
```

**Balance/wallet chip:**
```
bg: --surface2, border: --border-accent, radius: 20px, padding: 6px 14px
Amount: --font-mono, 700, --primary
Unit label: 12px, --text-muted
hover: border → --primary, bg → --primary-dim
```

---

## 4. Grid System

| Class | Columns | Gap | Use For |
|---|---|---|---|
| `.grid-2` | `1fr 1fr` | `16px` | Two balanced columns |
| `.grid-3` | `repeat(3, 1fr)` | `16px` | Three equal items (e.g., entity cards) |
| `.grid-4` | `repeat(4, 1fr)` | `16px` | Four stat cards or compact package cards |

> **Rule:** Grid layout collapses to single column on mobile. When adding grids, ensure content reads logically in single-column order.

---

## 5. Utility Classes

These classes exist in the stylesheet. Use them instead of inline styles where possible.

**Spacing (margin-bottom):**
`.mb-4` `.mb-8` `.mb-10` `.mb-12` `.mb-14` `.mb-16` `.mb-20` `.mb-24`

**Gap (flex/grid gap):**
`.gap-8` `.gap-12` `.gap-16`

**Flex helpers:**
`.flex` → `display: flex`
`.items-center` → `align-items: center`
`.justify-between` → `justify-content: space-between`

**Typography helpers:**

| Class | Effect | When to Use |
|---|---|---|
| `.text-mono` | Applies `--font-mono` | Numeric data outside of predefined components |
| `.text-muted` | `color: --text-muted` | Contextual secondary text |
| `.text-primary` | `color: --primary` | Accent text inline |
| `.text-success` | `color: --success` | Inline positive value |
| `.text-sm` | `font-size: 12px` | Fine print, captions |
| `.font-600` | `font-weight: 600` | Emphasis without heading font |

---

## 6. Environmental Details

### Texture & Atmosphere

The interface uses two body-level atmospheric effects:

1. **Noise grain** (`body::before`) — SVG fractalNoise filter, `opacity: 0.4` (dark) / `0.08` (light). Creates tactile depth. Do not remove.
2. **Radial ambient glow** (`body::after`) — top-center ellipse, `rgba(241,91,38,.12)`. Reinforces brand presence. Do not remove.

### Scrollbar

```
width:       5px
track:       --bg
thumb:       --border, radius 3px
thumb hover: --text-muted
```

### Print Mode

When printing, apply these overrides:
- Hide: sidebar, topbar, banners, modals, action buttons
- Reset: margin to 0, background to white
- Show: only the receipt/document view

---

## 7. Icon Usage

Two icon systems are used. Do not mix them for the same purpose.

| System | When to Use | Spec |
|---|---|---|
| **Font Awesome 6.5.1** | UI action icons, status icons, form decorators | Class-based (`fa-solid`, `fa-regular`) |
| **Inline SVG** | Navigation and structural icons | `viewBox="0 0 24 24"`, `stroke="currentColor"`, `stroke-width="2"`, no fill |

Navigation SVG icons:
- Size: `18×18px`
- Color: `currentColor` (inherits from nav-item state)
- Style: stroke only, no fill

---

## 8. Design Rules Summary

A concise checklist for any agent generating new UI:

**Colors**
- [ ] All colors use tokens, not hardcoded values
- [ ] Primary orange (`--primary`) is used only for interactive/active/brand states
- [ ] Semantic colors (success/warning/error) are used only for their semantic meaning
- [ ] New elements work in both dark and light mode

**Typography**
- [ ] Numeric data uses `--font-mono`
- [ ] All headings/titles use `--font-heading`
- [ ] Uppercase labels have `letter-spacing: 1px`
- [ ] Font size is from the defined scale

**Components**
- [ ] Reuses existing components instead of creating new ones
- [ ] Cards use the correct variant for the content type
- [ ] At most one `.btn-primary` per action group
- [ ] Chips are labels only, not buttons
- [ ] Status badges are for real-time states only

**Spacing & Layout**
- [ ] Border radius decreases as element size decreases
- [ ] Padding follows the reference table
- [ ] Grids use the predefined class system

**Animation**
- [ ] `blink` is used only for live/real-time indicators
- [ ] New transitions use `0.2s` for hover effects
- [ ] Structural transitions use `cubic-bezier(0.4, 0, 0.2, 1)`

**Theme**
- [ ] New component has been tested / considered in light mode
- [ ] Hover effects use `rgba(0,0,0,…)` not `rgba(255,255,255,…)` in light mode
