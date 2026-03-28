import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isLinkNode } from "@lexical/link";
import { $getNearestNodeFromDOMNode } from "lexical";

/**
 * Makes LinkNodes clickable.
 * In editable mode: Cmd/Ctrl + click opens the link.
 * In read-only mode: regular click opens the link.
 */
export function SilkClickableLinkPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const handleClick = (e: MouseEvent) => {
      const isEditable = editor.isEditable();
      if (isEditable && !(e.metaKey || e.ctrlKey)) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor || !root.contains(anchor)) return;

      editor.getEditorState().read(() => {
        const node = $getNearestNodeFromDOMNode(anchor);
        if (!node) return;
        const parent = node.getParent();
        const linkNode = $isLinkNode(node) ? node : $isLinkNode(parent) ? parent : null;
        if (linkNode) {
          const url = linkNode.getURL();
          if (url) {
            e.preventDefault();
            window.open(url, "_blank", "noopener,noreferrer");
          }
        }
      });
    };

    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  }, [editor]);

  return null;
}
