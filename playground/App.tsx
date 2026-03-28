import { useState, useCallback, useRef } from "react";
import { SilkEditor } from "../src";

const STORAGE_KEY = "silk-playground-state";

export function App() {
  const [editable, setEditable] = useState(true);
  const stateRef = useRef<string | undefined>(undefined);

  const [initialState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? undefined;
    } catch {
      return undefined;
    }
  });

  const handleChange = useCallback((json: string) => {
    stateRef.current = json;
  }, []);

  const handleSave = useCallback(() => {
    if (stateRef.current) {
      try {
        localStorage.setItem(STORAGE_KEY, stateRef.current);
      } catch {
        // storage full
      }
    }
  }, []);

  const handleClear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }, []);

  const btnStyle = (bg: string) =>
    ({
      padding: "8px 16px",
      border: "none",
      borderRadius: 0,
      background: bg,
      color: "#fbf9f4",
      fontFamily: '"SF Mono", "Fira Code", "Fira Mono", monospace',
      fontSize: 12,
      letterSpacing: "0.04em",
      cursor: "pointer",
      textTransform: "uppercase" as const,
      transition: "background-color 0.15s",
    });

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily:
          '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px" }}>
        {/* Header */}
        <header style={{ marginBottom: 48 }}>
          <p
            style={{
              fontFamily: '"SF Mono", "Fira Code", "Fira Mono", monospace',
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#797c73",
              margin: "0 0 10px",
            }}
          >
            COMPONENT // SILK_EDITOR
          </p>
          <h1
            style={{
              fontFamily: '"Space Grotesk", "Inter", sans-serif',
              fontSize: "2.25rem",
              fontWeight: 600,
              color: "#31332c",
              margin: "0 0 10px",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Silk Editor
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#797c73",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            An opinionated, batteries-included rich text editor built on
            Lexical.
          </p>
        </header>

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <button
            onClick={() => setEditable((prev) => !prev)}
            style={btnStyle(editable ? "#31332c" : "#ac3521")}
          >
            {editable ? "MODE: EDITABLE" : "MODE: READ_ONLY"}
          </button>
          <button onClick={handleSave} style={btnStyle("#5a6340")}>
            SAVE
          </button>
          <button onClick={handleClear} style={btnStyle("#7e572e")}>
            CLEAR
          </button>
        </div>

        {/* Editor surface */}
        <div
          style={{
            backgroundColor: "#f5f4ed",
            transition: "background-color 0.2s",
          }}
        >
          <SilkEditor
            editable={editable}
            onChange={handleChange}
            initialEditorState={initialState}
          />
        </div>
      </div>
    </div>
  );
}
