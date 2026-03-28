import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { registerList } from "@lexical/list";

export function SilkListPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerList(editor);
  }, [editor]);

  return <ListPlugin />;
}
