import type { EditorThemeClasses } from "lexical";

export interface SilkFeatures {
  history?: boolean;
  richText?: boolean;
  dragon?: boolean;
  code?: boolean;
  lists?: boolean;
}

export interface SilkEditorProps {
  features?: SilkFeatures;
  namespace?: string;
  className?: string;
  theme?: EditorThemeClasses;
  editable?: boolean;
  onError?: (error: Error) => void;
  /** Called on every content change with the serialized editor state as a JSON string. */
  onChange?: (serializedEditorState: string) => void;
  /** JSON string from a previous `onChange` call to restore editor content. */
  initialEditorState?: string;
}
