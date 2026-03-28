# Silk

An opinionated, batteries-included rich text editor for React, built on [Lexical](https://lexical.dev).

Silk ships as a single component with styles, sensible defaults, and a curated feature set — so you can drop it into a project and have a polished editing experience without wiring together a dozen plugins.

## Install

```bash
npm install silk-compose
```

All Lexical dependencies are included automatically.

## Quick start

```tsx
import { SilkEditor } from "silk-compose";
import "silk-compose/styles";

function App() {
  return <SilkEditor />;
}
```

That's it. You get a fully functional editor with formatting, code blocks, lists, links, images, and more.

## Saving and restoring content

Silk uses Lexical's native serialization. Pass a `ref` to get a handle with a `getState()` method that returns the editor content as a JSON string. Pass that string back as `initialEditorState` to restore it.

```tsx
import { useRef } from "react";
import { SilkEditor } from "silk-compose";
import type { SilkEditorHandle } from "silk-compose";
import "silk-compose/styles";

function App() {
  const editorRef = useRef<SilkEditorHandle>(null);

  const handleSave = () => {
    const json = editorRef.current?.getState();
    if (json) saveToDatabase(json);
  };

  return (
    <>
      <SilkEditor
        ref={editorRef}
        initialEditorState={loadFromDatabase()}
      />
      <button onClick={handleSave}>Save</button>
    </>
  );
}
```

The JSON string is a complete snapshot of the document — text, formatting, images, code blocks, everything. Store it however you like (database, local storage, file) and pass it back to restore the editor exactly as it was.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `ref` | `Ref<SilkEditorHandle>` | — | Exposes `getState()` to read the serialized editor content on demand. |
| `editable` | `boolean` | `true` | Toggle between edit and read-only mode at runtime. |
| `initialEditorState` | `string` | — | JSON string from a previous `getState()` call to restore content. |
| `features` | `SilkFeatures` | All enabled | Toggle feature groups on/off. |
| `namespace` | `string` | `"silk-editor"` | Lexical editor namespace. |
| `className` | `string` | — | Additional CSS class on the container. |
| `theme` | `EditorThemeClasses` | — | Lexical theme overrides (deep-merged with defaults). |
| `onError` | `(error: Error) => void` | `console.error` | Error handler for Lexical. |

## Features

Everything is enabled by default. Disable individual features via the `features` prop:

```tsx
<SilkEditor features={{ code: false, dragon: false }} />
```

| Feature | Key | What it includes |
|---|---|---|
| **Rich text** | `richText` | Bold, italic, underline, inline code, headings (H1/H2), block quotes |
| **Code blocks** | `code` | Syntax-highlighted code blocks powered by Shiki, with a language selector |
| **Lists** | `lists` | Ordered and unordered lists with Tab/Shift+Tab indentation. Nested ordered lists cycle through numbers, uppercase letters, and lowercase letters. |
| **History** | `history` | Undo/redo |
| **Dragon** | `dragon` | Speech dictation accessibility support |

### Always-on capabilities

These are not feature-gated and are always available:

- **Static toolbar** — formatting, font size, color, font family, links, quotes
- **Floating toolbar** — appears on text selection with the same controls
- **Links** — insert via toolbar or `/` menu; Cmd/Ctrl+click to open in edit mode, regular click in read-only mode; always opens in a new tab
- **Images** — paste or drag-and-drop any image into the editor; click to select, drag corners to resize; images are serialized as base64 in the document JSON
- **Note blocks** — info, question, and error callout blocks with colored left borders
- **Horizontal rules** — section dividers
- **Slash commands** — type `/` to insert headings, code blocks, lists, notes, links, dividers
- **Markdown shortcuts** — `*`/`-` for bullet lists, `1.` for numbered lists, common text format triggers
- **Font controls** — size (10-36), family (Inter, SF Mono, Space Grotesk), and a curated color palette
- **Read-only mode** — pass `editable={false}` to disable editing; toolbars hide, links become directly clickable

## Styling

Silk ships a single CSS file with all styles. Import it once:

```tsx
import "silk-compose/styles";
```

All CSS classes are prefixed with `silk-` to avoid collisions. The default theme uses a warm, neutral palette with Inter for body text, Space Grotesk for headings, and SF Mono for code and technical labels.

To customize the Lexical theme (class names applied to nodes), pass the `theme` prop — it's deep-merged with the defaults.

## Exports

```tsx
// Component
import { SilkEditor } from "silk-compose";
import type { SilkEditorProps, SilkEditorHandle, SilkFeatures } from "silk-compose";

// Nodes (for advanced Lexical integrations)
import { NoteNode, $createNoteNode, $isNoteNode } from "silk-compose";
import { ImageNode, $createImageNode, $isImageNode } from "silk-compose";
```

## Requirements

- React 18 or 19

## License

MIT
