import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import type { SilkEditorProps, SilkEditorHandle, SilkFeatures } from "./SilkEditor.types";
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

/** Exposes getState() on the forwarded ref. */
function SilkHandlePlugin({
  handleRef,
}: {
  handleRef: React.Ref<SilkEditorHandle>;
}) {
  const [editor] = useLexicalComposerContext();
  useImperativeHandle(
    handleRef,
    () => ({
      getState: () => JSON.stringify(editor.getEditorState().toJSON()),
    }),
    [editor],
  );
  return null;
}

const DEFAULT_FEATURES: Required<SilkFeatures> = {
  history: true,
  richText: true,
  dragon: true,
  code: true,
  lists: true,
};

export const SilkEditor = forwardRef<SilkEditorHandle, SilkEditorProps>(
  function SilkEditor(
    {
      features: userFeatures,
      namespace = "silk-editor",
      className,
      theme: themeOverrides,
      editable = true,
      onError,
      initialEditorState,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const features: Required<SilkFeatures> = {
      ...DEFAULT_FEATURES,
      ...userFeatures,
    };

    const theme = buildSilkTheme(features, themeOverrides);
    const nodes = getNodes(features);

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
            <SilkHandlePlugin handleRef={ref} />
            <SilkSlashCommandPlugin />
            <SilkFloatingToolbarPlugin />
          </div>
        </SilkContainerContext.Provider>
      </LexicalComposer>
    );
  },
);
