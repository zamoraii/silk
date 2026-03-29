import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $isNodeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  type TextFormatType,
  type ElementFormatType,
} from "lexical";
import {
  $patchStyleText,
  $getSelectionStyleValueForProperty,
  $setBlocksType,
} from "@lexical/selection";
import { $createQuoteNode } from "@lexical/rich-text";
import { $isImageNode } from "../../nodes/image";
import { SHOW_LINK_DIALOG_COMMAND } from "../link";
import {
  detectFontFamily,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
  DEFAULT_FONT_SIZE,
} from "./constants";

export function useToolbarState() {
  const [editor] = useLexicalComposerContext();
  const [formats, setFormats] = useState<Set<TextFormatType>>(new Set());
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [currentFontFamily, setCurrentFontFamily] = useState<string | null>(
    null,
  );
  const [alignment, setAlignment] = useState<ElementFormatType>("");

  const readSelection = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes();
        if (nodes.length > 0) {
          const node = nodes[0];
          if ($isImageNode(node)) {
            setAlignment((node.getAlignment() || "") as ElementFormatType);
          }
        }
        return;
      }

      if (!$isRangeSelection(selection)) return;

      const active = new Set<TextFormatType>();
      if (selection.hasFormat("bold")) active.add("bold");
      if (selection.hasFormat("italic")) active.add("italic");
      if (selection.hasFormat("underline")) active.add("underline");
      if (selection.hasFormat("code")) active.add("code");
      setFormats(active);

      const sizeStr = $getSelectionStyleValueForProperty(
        selection,
        "font-size",
        "",
      );
      setFontSize(sizeStr ? parseInt(sizeStr, 10) : DEFAULT_FONT_SIZE);

      const colorStr = $getSelectionStyleValueForProperty(
        selection,
        "color",
        "",
      );
      setCurrentColor(colorStr || null);

      const fontFamilyStr = $getSelectionStyleValueForProperty(
        selection,
        "font-family",
        "",
      );
      setCurrentFontFamily(detectFontFamily(fontFamilyStr || null));

      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getTopLevelElement();
      if (element) {
        setAlignment(element.getFormatType() || "");
      }
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        readSelection();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, readSelection]);

  useEffect(() => {
    return editor.registerUpdateListener(() => readSelection());
  }, [editor, readSelection]);

  const toggleFormat = useCallback(
    (format: TextFormatType) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor],
  );

  const changeFontSize = useCallback(
    (delta: number) => {
      const next = Math.max(
        MIN_FONT_SIZE,
        Math.min(MAX_FONT_SIZE, fontSize + delta),
      );
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { "font-size": `${next}px` });
        }
      });
    },
    [editor, fontSize],
  );

  const applyColor = useCallback(
    (color: string | null) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { color });
        }
      });
    },
    [editor],
  );

  const applyFontFamily = useCallback(
    (fontFamily: string | null) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { "font-family": fontFamily });
        }
      });
    },
    [editor],
  );

  const openLinkDialog = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const text = selection.getTextContent();
        editor.dispatchCommand(SHOW_LINK_DIALOG_COMMAND, { text });
      }
    });
  }, [editor]);

  const insertQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  }, [editor]);

  const applyAlignment = useCallback(
    (format: ElementFormatType) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isNodeSelection(selection)) {
          for (const node of selection.getNodes()) {
            if ($isImageNode(node)) {
              node.setAlignment(format);
            }
          }
          return;
        }
      });
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
    },
    [editor],
  );

  return {
    formats,
    fontSize,
    currentColor,
    currentFontFamily,
    alignment,
    toggleFormat,
    changeFontSize,
    applyColor,
    applyFontFamily,
    openLinkDialog,
    insertQuote,
    applyAlignment,
  };
}
