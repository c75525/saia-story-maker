# S.A.I.A. Story Maker

A mobile-first, browser-based Instagram Story creator for S.A.I.A. It combines a true 1080 × 1920 canvas, Aktiv Grotesk, the official brand palette, editable starter templates, local drafts, and PNG export.

## Features

- Five fully editable S.A.I.A. templates
- Multiple text blocks with weight, size, style, line-height, tracking, alignment, case, and brand colors
- Photo/artwork upload and S.A.I.A. logo insertion
- Rectangles, circles, and rules
- Meeting number/date/location helper
- Drag, resize, rotate, center, layer, duplicate, and delete
- Undo and redo
- Exact 1080 × 1920 PNG export without selection handles
- Browser-local autosave and named drafts with visible storage-failure warnings
- Uploaded PNG/JPEG/WebP images are resized and compressed before being embedded
- Editable project JSON import/export with supported-element validation
- Keyboard-accessible element list, geometry fields, and arrow-key movement
- Mobile and desktop layouts

No account, server, or uploaded user data is required. Drafts and uploaded images remain in the current browser's local storage unless the user exports a project.

## Typography

The app loads Aktiv Grotesk through S.A.I.A.'s licensed Adobe Fonts web kit:

```html
<link rel="stylesheet" href="https://use.typekit.net/aut1aeg.css">
```

Adobe desktop cache binaries are not included. An internet connection is required to load the font on a new device. PNG export waits for Aktiv Grotesk and displays a useful error if it is unavailable.

## Local development

Requires Node.js 22 or later.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Validation

```bash
npm test
npm run build
npm run preview
```

Unit tests cover project validation, serialization, autosave, draft lifecycle behavior, image sizing, and strict web-font verification. The production build is generated in `dist/`.

## Use on a phone

Open the deployed URL in Safari or Chrome. The app can be added to the home screen through the browser's share/install menu. Work autosaves only to that browser/device. Use **Export project** to move an editable story to another device.

Uploaded photos are resized and compressed before storage. A persistent warning appears if a photo-heavy design still exceeds the browser's local-storage quota; use **Export project** immediately if that warning appears.

## GitHub Pages

The Vite build uses relative asset paths (`base: "./"`) so it works from a repository subpath. The production contents of `dist/` are published to the repository's `gh-pages` branch.

To update the deployed app:

1. Run `npm test` and `npm run build`.
2. Publish the contents of `dist/` to the root of the `gh-pages` branch.
3. In **Settings → Pages**, keep the source set to the `gh-pages` branch and `/ (root)`.

## Project structure

```text
public/assets/                      Approved S.A.I.A. brand assets
src/app.js                          Fabric canvas and editor behavior
src/storage.js                      Versioned projects and local drafts
src/styles.css                      Responsive interface
src/templates.js                    Palette and starter compositions
test/                               Persistence, media, font, and template tests
DESIGN_SYSTEM.md                    Visual and interaction contract
```

## Privacy and limitations

- There is no backend or analytics.
- Designs are stored in browser local storage.
- Clearing site data removes drafts not exported as project files.
- Aktiv Grotesk comes from Adobe Fonts and therefore needs network access.
- CORS-protected external images are not accepted directly; user-uploaded local files and bundled brand assets are export-safe.
