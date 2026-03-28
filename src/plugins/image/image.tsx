import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $isNodeSelection,
  $createParagraphNode,
  $getRoot,
  PASTE_COMMAND,
  DROP_COMMAND,
  DRAGOVER_COMMAND,
  COMMAND_PRIORITY_HIGH,
} from "lexical";
import { $createImageNode } from "../../nodes/image";

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function SilkImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const insertImages = (files: File[]) => {
      for (const file of files) {
        readFileAsDataURL(file).then((src) => {
          editor.update(() => {
            const imageNode = $createImageNode(src, file.name);
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              const focusNode = selection.focus.getNode();
              const topLevel = focusNode.getTopLevelElementOrThrow();
              topLevel.insertAfter(imageNode);
            } else if ($isNodeSelection(selection)) {
              const nodes = selection.getNodes();
              const last = nodes[nodes.length - 1];
              const topLevel = last.getTopLevelElement();
              if (topLevel) {
                topLevel.insertAfter(imageNode);
              } else {
                $getRoot().append(imageNode);
              }
            } else {
              $getRoot().append(imageNode);
            }
          });
        });
      }
    };

    const unregPaste = editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const files = event.clipboardData?.files;
        if (!files || files.length === 0) return false;

        const imageFiles = Array.from(files).filter(isImageFile);
        if (imageFiles.length === 0) return false;

        event.preventDefault();
        insertImages(imageFiles);
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );

    const unregDrop = editor.registerCommand(
      DROP_COMMAND,
      (event: DragEvent) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        const imageFiles = Array.from(files).filter(isImageFile);
        if (imageFiles.length === 0) return false;

        event.preventDefault();
        insertImages(imageFiles);
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );

    const unregDragOver = editor.registerCommand(
      DRAGOVER_COMMAND,
      (event: DragEvent) => {
        const types = event.dataTransfer?.types;
        if (types && types.includes("Files")) {
          event.preventDefault();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );

    return () => {
      unregPaste();
      unregDrop();
      unregDragOver();
    };
  }, [editor]);

  return null;
}
