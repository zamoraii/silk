# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Silk — an opinionated Lexical rich text editor published as an npm package (`silk-editor`). The goal is a polished, batteries-included editor component that looks good out of the box with minimal configuration. It ships as a single React component with CSS, theme overrides, feature flags, and read-only support.

## Repository

- Remote: git@github.com:zamoraii/silk.git
- Branch: main

## Commands

- `npm run dev` — start the Vite dev server (playground at localhost:5173)
- `npm run build` — build the library to `dist/` (silk.js, silk.css, index.d.ts)
- `npm run typecheck` — run TypeScript type checking (no emit)
- `npm run preview` — preview the production build

## Architecture

### Entry points

- **src/index.ts** — public API, default + named export of `SilkEditor`
- **src/SilkEditor.tsx** — main component: wraps `LexicalComposer`, conditionally renders plugins based on `SilkFeatures`
- **src/SilkEditor.types.ts** — `SilkFeatures` (feature flags) and `SilkEditorProps`
- **src/SilkEditorContext.ts** — shared `containerRef` (`SilkContainerContext`) used by overlay plugins to position elements via `getBoundingClientRect`

### Plugins (`src/plugins/`)

Each plugin is a standalone React component rendered inside the `LexicalComposer` tree.

- **rich-text.tsx** — wraps `RichTextPlugin` + `ContentEditable`
- **history.tsx** — wraps `HistoryPlugin`
- **dragon.tsx** — speech dictation a11y via `registerDragonSupport`
- **code.tsx** — code blocks with Shiki syntax highlighting (`@lexical/code-shiki`) + language selector header overlay
- **slash-command/** — `/` triggered typeahead menu with node registry (`registry.tsx`). Uses `LexicalTypeaheadMenuPlugin`.
- **note/** — note callout blocks (info/warning/error) with icon-based type selector overlay
- **link/** — link insertion dialog + `TOGGLE_LINK_COMMAND` handler. Supports two modes: insert (new link from slash command) and wrap (wrap selected text from floating toolbar).
- **floating-toolbar/** — appears above non-collapsed text selections (outside code blocks). Offers bold, italic, underline, inline code, link, font size (±), and color picker.
- **list.tsx** — ordered and unordered lists via `@lexical/list`. Markdown shortcuts: `*`/`-` for bullet, `1.` for numbered.
- **markdown.tsx** — registers `TEXT_FORMAT_TRANSFORMERS`, `UNORDERED_LIST`, and `ORDERED_LIST` from `@lexical/markdown`
- **clickable-link.tsx** — makes links navigable. Read-only: click. Editable: Cmd/Ctrl+click.

### Nodes (`src/nodes/`)

- **index.ts** — `getNodes(features)` returns the node array based on enabled feature flags
- **note.ts** — `NoteNode` (ElementNode subclass) with `noteType` property (info/warning/error). Children are inline content (paragraphs with formatted text).

Always-registered nodes: `NoteNode`, `HorizontalRuleNode`, `LinkNode`.
Feature-gated: `HeadingNode`, `QuoteNode` (richText), `CodeNode`, `CodeHighlightNode` (code), `ListNode`, `ListItemNode` (lists).

### Themes (`src/themes/`)

- **base.ts** — root, paragraph, link, text format CSS classes
- **slices/rich-text.ts** — heading + quote classes
- **slices/code.ts** — code block container class (Shiki handles token colors via inline styles)
- **index.ts** — `buildSilkTheme(features, overrides?)` deep-merges base + enabled slices + user overrides

### Styles (`src/styles/silk.css`)

Single CSS file imported by `SilkEditor`. Uses Inter font (Google Fonts). All classes prefixed `silk-`. Dark theme for code blocks (VS Code style). Pastel variants for note blocks.

### Icons (`src/utils/icons.tsx`)

Simple SVG components (Lucide-style, `currentColor`). Designed for easy replacement with an icon library.

### Playground (`playground/`)

Dev-only app that renders `<SilkEditor />` for testing. Not included in the published package.

## Key architecture decisions

### Overlay pattern (no portals into Lexical DOM)

Plugins that render UI on top of Lexical-managed elements (code block headers, note type selectors) use **absolute-positioned React siblings** inside `silk-editor-container`, positioned via `getBoundingClientRect` relative to the shared `containerRef`. Never portal React content into Lexical-owned DOM nodes — Lexical may remove them at any time, causing React unmount crashes (`removeChild` errors).

### Commands for cross-plugin communication

Plugins communicate via Lexical commands (`createCommand` / `dispatchCommand` / `registerCommand`). Example: the floating toolbar and slash command both dispatch `SHOW_LINK_DIALOG_COMMAND` to open the link dialog, with the link plugin handling it.

### `execute(editor)` in slash command registry

Registry entries receive the `LexicalEditor` instance so they can dispatch commands (e.g., link dialog) in addition to performing direct node operations inside the update context.

### Font size and color via inline styles

Font size and text color are applied using `$patchStyleText` from `@lexical/selection`, not via Lexical's format system. This uses inline `style` attributes on text nodes, which is the standard Lexical approach for CSS properties that aren't part of `TextFormatType`.

## Adding a new plugin

1. Create `src/plugins/<name>.tsx` (or `src/plugins/<name>/` for multi-file plugins)
2. Re-export from `src/plugins/index.ts`
3. If feature-gated: add a flag to `SilkFeatures` in `SilkEditor.types.ts`
4. Render in `SilkEditor.tsx` (conditionally if feature-gated)
5. If the plugin introduces new nodes, register them in `src/nodes/index.ts`
6. If the plugin needs theme classes, add a slice in `src/themes/slices/`
7. Add CSS to `src/styles/silk.css` with `silk-` prefix

## Read-only mode

Pass `editable={false}` to `<SilkEditor>`. This sets `initialConfig.editable` on `LexicalComposer`, which makes `editor.isEditable()` return `false`. Plugins check this to adjust behavior: slash commands and floating toolbar are disabled, code language selector and note type selector are hidden, links become directly clickable.

## Slash command registry

To add a new entry to the `/` menu, add an object to the `nodeRegistry` array in `src/plugins/slash-command/registry.tsx`. Each entry has `name`, `icon` (JSX), `description`, and `execute(editor)`.

## Design system — Technical Brutalism

The editor and playground follow a **Technical Brutalism** aesthetic inspired by architectural blueprints. All UI should feel intentional, cerebral, and premium.

### Core rules

- **0px border-radius on everything.** No rounded corners — sharp edges are the signature of the architectural feel.
- **No 1px solid borders for sectioning.** Define boundaries through tonal shifts (surface color changes) and whitespace, not lines. Ghost borders (outline_variant at 15% opacity) only when accessibility requires it.
- **Tonal layering over shadows.** Create depth by stacking surface tiers, not with drop shadows. If a floating element absolutely needs a shadow, it must be near-invisible (`rgba(49,51,44,0.05)`).

### Color palette

| Token | Hex | Usage |
|---|---|---|
| `background` | `#fbf9f4` | Primary canvas — unbleached paper feel |
| `surface_container_low` | `#f5f4ed` | Subtle section zones, editor surface |
| `surface_container` | `#efeee6` | Stronger section differentiation |
| `on_surface` | `#31332c` | Primary text, primary button background |
| `outline` | `#797c73` | Input borders, muted text, metadata |
| `secondary` | `#7e572e` | Warm highlights, text metadata accents |
| `tertiary` | `#ac3521` | High-impact CTAs, error states, burnt-orange soul |
| `surface` | `#fbf9f4` | Button text on dark backgrounds |

### Typography

- **Headlines:** Space Grotesk — technical, wide-aperture geometric sans-serif. Tight letter-spacing (`-0.02em`).
- **Body & UI:** Inter — neutral, highly legible.
- **Labels & metadata:** Monospace (SF Mono / Fira Code), uppercase, increased letter-spacing (`0.08em`). Mimic blueprint annotations (e.g., `COMPONENT // SILK_EDITOR`).

### Component conventions

- **Buttons:** Sharp-edged (0px radius). Primary: bg `on_surface`, text `surface`. Accent/action: `tertiary` color.
- **Inputs:** Single bottom border, not a full box. Focus thickens to 2px.
- **Cards:** No divider lines. Use generous spacing (4rem+) to separate sections.
- **Icons:** Thin-stroke, technical icon set (Lucide-style). No rounded-corner icon shapes.

### Don'ts

- Don't use standard blue for links — use `tertiary` or `on_surface` with a custom underline.
- Don't use heavy drop shadows.
- Don't center-align long-form text — left-align or grid-lock.
- Don't use rounded-corner icons.
