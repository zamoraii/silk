import { useEffect } from "react";
import { registerDragonSupport } from "@lexical/dragon";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export function SilkDragonPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerDragonSupport(editor);
  }, [editor]);

  return null;
}
