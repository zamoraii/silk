import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  registerMarkdownShortcuts,
  TEXT_FORMAT_TRANSFORMERS,
  UNORDERED_LIST,
  ORDERED_LIST,
} from "@lexical/markdown";

const TRANSFORMERS = [
  ...TEXT_FORMAT_TRANSFORMERS,
  UNORDERED_LIST,
  ORDERED_LIST,
];

export function SilkMarkdownPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerMarkdownShortcuts(editor, TRANSFORMERS);
  }, [editor]);

  return null;
}
