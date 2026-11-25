# S.A.I.A. Story Maker Design System

## Purpose

The Story Maker translates S.A.I.A.'s visual identity into a focused, phone-first creation tool. It should feel closer to an editorial art tool or Instagram Create Mode than a generic dashboard. The authored story remains the visual focus.

## Typography

- Primary family: **Aktiv Grotesk**, loaded through S.A.I.A.'s licensed Adobe Fonts kit (`aut1aeg`).
- UI fallback: Apple Color Emoji, Segoe UI Emoji, then sans-serif.
- Story text always uses `aktiv-grotesk` so the canvas and exported PNG agree.
- Available editor weights: Light 300, Regular 400, Medium 500, Semibold 600, Bold 700.
- Export waits for the web font before rasterizing. The user receives a clear connection/reload message if it cannot load.
- Interface labels use compact uppercase tracking; headings use regular or medium weight.

## Palette

| Token | Hex | Use |
|---|---|---|
| Lavender | `#E1DEE8` | Primary brand field, active controls |
| Light gray | `#F2F2F2` | App and story background |
| Gray | `#848484` | Secondary fields, metadata |
| White | `#FFFFFF` | High contrast fields, cards |
| Dark | `#2A2A2A` | Primary text and actions |

Version one intentionally excludes arbitrary color entry. Every background, text, and shape color remains in the brand palette.

## Canvas

- Logical output: **1080 × 1920 px**, 9:16.
- Recommended safe margin: 96 px, represented by a non-exported guide at roughly 5% from each edge.
- Browser display scales the logical canvas with CSS; object coordinates remain at output resolution.
- Export multiplier is 1, yielding the exact logical output without selection controls.
- Template geometry, images, text, and shapes remain editable Fabric objects.

## Spacing and shape

- UI spacing scale: 4, 8, 10, 14, 16, 18, 24, 36 px.
- Controls: minimum 40 px, usually 44–50 px.
- UI radii: 9–18 px; primary actions may be pill-shaped.
- Story templates are not constrained to UI radii and may use circles, hard rules, and full-bleed fields.
- Borders use dark at approximately 16% opacity to keep controls quiet.

## Templates

1. **Meeting announcement:** oversized meeting number and event information.
2. **Research / resource:** dark editorial field and lavender index rail.
3. **Opportunity:** deadline-led open-call composition.
4. **Discussion prompt:** large typographic question with restrained ornament.
5. **Blank create mode:** lavender field with starter text and wordmark.

Templates are starting points, not locked brand collateral. Applying one asks for confirmation when the current canvas contains objects.

## Interaction

- Tap selects; drag moves; corner controls resize and rotate.
- Double-tap or double-click enters text editing.
- Add, edit, arrange, template, and draft actions are reachable without hover.
- Selection controls are large enough for touch and use dark/white contrast.
- Undo/redo keeps up to 40 canvas snapshots.
- Current work autosaves after edits. Named drafts are explicitly managed in the Drafts panel.
- Photos are converted to a storage-safe embedded image before insertion; persistent feedback warns when browser storage is full.
- The Arrange panel mirrors canvas objects in a keyboard-accessible list with numeric position/size fields and nudge controls.
- Destructive template replacement and draft deletion require confirmation.

## Responsive behavior

- **Phone:** the canvas and bottom editor flex within the available viewport without fixed minimum heights; horizontally scrollable tool tabs lead into a scrollable editing panel. Safe-area insets protect controls.
- **Desktop (900 px+):** canvas workspace and a fixed-width right editor appear side by side.
- Canvas display scale accounts for both available width and height; the internal 1080 × 1920 coordinate system does not change.

## Accessibility

- Semantic buttons, labels, fieldsets-by-grouping, and live status messages are used.
- Keyboard focus is a visible 3 px dark outline.
- Hover styles only supplement tap/click and keyboard behavior.
- Controls maintain touch-friendly dimensions. Fabric handles compensate for the display scale so their touch regions remain at least 48 CSS pixels.
- Reduced-motion preferences collapse transition durations.
- Color names are available as accessible labels on swatches.
- Destructive and failure feedback does not rely on color alone.

## Content conventions

- Use `S.A.I.A.` with periods in visible brand copy.
- Keep event metadata concise and uppercase when helpful.
- Preserve space around the wordmark and keep high text/background contrast.
- Do not expose internal workflow notes or review instructions in published story copy.
