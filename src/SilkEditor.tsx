import { useRef, useEffect, useCallback } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import type { EditorState } from "lexical";
import type { SilkEditorProps, SilkFeatures } from "./SilkEditor.types";
import {
  SilkHistoryPlugin,
  SilkRichTextPlugin,
  SilkDragonPlugin,
  SilkCodePlugin,
  SilkSlashCommandPlugin,
  SilkNotePlugin,
  SilkLinkPlugin,
  SilkMarkdownPlugin,
  SilkFloatingToolbarPlugin,
  SilkToolbarPlugin,
  SilkClickableLinkPlugin,
  SilkListPlugin,
  SilkImagePlugin,
} from "./plugins";
import { SilkContainerContext } from "./SilkEditorContext";
import { buildSilkTheme } from "./themes";
import { getNodes } from "./nodes";
import "./styles/silk.css";

function SilkEditablePlugin({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);
  return null;
}

const DEFAULT_FEATURES: Required<SilkFeatures> = {
  history: true,
  richText: true,
  dragon: true,
  code: true,
  lists: true,
};

export function SilkEditor({
  features: userFeatures,
  namespace = "silk-editor",
  className,
  theme: themeOverrides,
  editable = true,
  onError,
  onChange,
  initialEditorState,
}: SilkEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const features: Required<SilkFeatures> = {
    ...DEFAULT_FEATURES,
    ...userFeatures,
  };

  const theme = buildSilkTheme(features, themeOverrides);
  const nodes = getNodes(features);

  const handleChange = useCallback(
    (editorState: EditorState) => {
      if (onChange) {
        onChange(JSON.stringify(editorState.toJSON()));
      }
    },
    [onChange],
  );

  const initialConfig = {
    namespace,
    theme,
    nodes,
    editable,
    editorState: initialEditorState ?? undefined,
    onError: onError ?? ((error: Error) => console.error(error)),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SilkContainerContext.Provider value={containerRef}>
        <div
          ref={containerRef}
          className={`silk-editor-container${className ? ` ${className}` : ""}`}
        >
          <SilkToolbarPlugin />
          {features.richText && <SilkRichTextPlugin />}
          {features.history && <SilkHistoryPlugin />}
          {features.dragon && <SilkDragonPlugin />}
          {features.code && <SilkCodePlugin />}
          {features.lists && <SilkListPlugin />}
          <TabIndentationPlugin />
          <HorizontalRulePlugin />
          <SilkNotePlugin />
          <SilkLinkPlugin />
          <SilkMarkdownPlugin />
          <SilkClickableLinkPlugin />
          <SilkImagePlugin />
          <SilkEditablePlugin editable={editable} />
          {onChange && (
            <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
          )}
          <SilkSlashCommandPlugin />
          <SilkFloatingToolbarPlugin />
        </div>
      </SilkContainerContext.Provider>
    </LexicalComposer>
  );
}
