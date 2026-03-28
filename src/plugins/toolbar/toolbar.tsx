import { useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useToolbarState } from "./use-toolbar-state";
import {
  COLORS,
  FONT_FAMILIES,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
} from "./constants";

export function SilkToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);

  const {
    formats,
    fontSize,
    currentColor,
    currentFontFamily,
    toggleFormat,
    changeFontSize,
    applyColor,
    applyFontFamily,
    openLinkDialog,
    insertQuote,
  } = useToolbarState();

  useEffect(() => {
    return editor.registerEditableListener(setIsEditable);
  }, [editor]);

  useEffect(() => {
    if (!showColorPicker && !showFontPicker) return;
    const handle = (e: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        setShowColorPicker(false);
        setShowFontPicker(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showColorPicker, showFontPicker]);

  return (
    <div
      ref={toolbarRef}
      className="silk-toolbar"
      style={isEditable ? undefined : { display: "none" }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Format buttons */}
      <button
        className={`silk-ft-btn${formats.has("bold") ? " silk-ft-btn--active" : ""}`}
        onClick={() => toggleFormat("bold")}
        type="button"
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        className={`silk-ft-btn${formats.has("italic") ? " silk-ft-btn--active" : ""}`}
        onClick={() => toggleFormat("italic")}
        type="button"
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        className={`silk-ft-btn${formats.has("underline") ? " silk-ft-btn--active" : ""}`}
        onClick={() => toggleFormat("underline")}
        type="button"
        title="Underline"
      >
        <span style={{ textDecoration: "underline" }}>U</span>
      </button>
      <button
        className={`silk-ft-btn silk-ft-btn--mono${formats.has("code") ? " silk-ft-btn--active" : ""}`}
        onClick={() => toggleFormat("code")}
        type="button"
        title="Inline code"
      >
        {"</>"}
      </button>

      <div className="silk-ft-sep" />

      {/* Link */}
      <button
        className="silk-ft-btn"
        onClick={openLinkDialog}
        type="button"
        title="Insert link"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      </button>

      {/* Quote */}
      <button
        className="silk-ft-btn"
        onClick={insertQuote}
        type="button"
        title="Block quote"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <line x1="3" y1="6" x2="3" y2="18" />
          <line x1="8" y1="8" x2="21" y2="8" />
          <line x1="8" y1="12" x2="18" y2="12" />
          <line x1="8" y1="16" x2="15" y2="16" />
        </svg>
      </button>

      <div className="silk-ft-sep" />

      {/* Font size */}
      <div className="silk-ft-font-size">
        <button
          className="silk-ft-btn silk-ft-btn--sm"
          onClick={() => changeFontSize(-1)}
          disabled={fontSize <= MIN_FONT_SIZE}
          type="button"
          title="Decrease font size"
        >
          −
        </button>
        <span className="silk-ft-font-size-value">{fontSize}</span>
        <button
          className="silk-ft-btn silk-ft-btn--sm"
          onClick={() => changeFontSize(1)}
          disabled={fontSize >= MAX_FONT_SIZE}
          type="button"
          title="Increase font size"
        >
          +
        </button>
      </div>

      <div className="silk-ft-sep" />

      {/* Color */}
      <div className="silk-ft-color-wrap">
        <button
          className={`silk-ft-btn silk-ft-btn--color${showColorPicker ? " silk-ft-btn--active" : ""}`}
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowFontPicker(false);
          }}
          type="button"
          title="Text color"
        >
          <span
            className="silk-ft-color-indicator"
            style={{ borderBottomColor: currentColor || "#1a1a1a" }}
          >
            A
          </span>
        </button>
        {showColorPicker && (
          <div className="silk-ft-color-grid">
            {COLORS.map((c) => (
              <button
                key={c.value ?? "default"}
                className={`silk-ft-color-swatch${currentColor === c.value || (!currentColor && c.value === null) ? " silk-ft-color-swatch--active" : ""}`}
                onClick={() => {
                  applyColor(c.value);
                  setShowColorPicker(false);
                }}
                type="button"
                title={c.label}
                style={c.value ? { backgroundColor: c.value } : undefined}
              >
                {c.value === null && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4" y1="4" x2="20" y2="20" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="silk-ft-sep" />

      {/* Font family */}
      <div className="silk-ft-font-wrap">
        <button
          className={`silk-ft-btn${showFontPicker ? " silk-ft-btn--active" : ""}`}
          onClick={() => {
            setShowFontPicker(!showFontPicker);
            setShowColorPicker(false);
          }}
          type="button"
          title="Font family"
          style={{
            fontFamily:
              FONT_FAMILIES.find((f) => f.value === currentFontFamily)?.css ??
              '"Inter", sans-serif',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Aa
        </button>
        {showFontPicker && (
          <div className="silk-ft-font-dropdown">
            {FONT_FAMILIES.map((f) => (
              <button
                key={f.label}
                className={`silk-ft-font-option${currentFontFamily === f.value ? " silk-ft-font-option--active" : ""}`}
                onClick={() => {
                  applyFontFamily(f.value);
                  setShowFontPicker(false);
                }}
                onMouseDown={(e) => e.preventDefault()}
                type="button"
                style={{ fontFamily: f.css }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
