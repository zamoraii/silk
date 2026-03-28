import type { EditorThemeClasses } from "lexical";

export interface SilkFeatures {
  history?: boolean;
  richText?: boolean;
  dragon?: boolean;
  code?: boolean;
  lists?: boolean;
}

export interface SilkEditorHandle {
  /** Returns the current editor state as a JSON string. */
  getState: () => string;
}

export interface SilkEditorProps {
  features?: SilkFeatures;
  namespace?: string;
  className?: string;
  theme?: EditorThemeClasses;
  editable?: boolean;
  onError?: (error: Error) => void;
  /** JSON string from a previous `getState()` call to restore editor content. */
  initialEditorState?: string;
}
