import { useCallback, useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  type TextFormatType,
} from "lexical";
import {
  $patchStyleText,
  $getSelectionStyleValueForProperty,
  $setBlocksType,
} from "@lexical/selection";
import { $createQuoteNode } from "@lexical/rich-text";
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

  const readSelection = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
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

  return {
    formats,
    fontSize,
    currentColor,
    currentFontFamily,
    toggleFormat,
    changeFontSize,
    applyColor,
    applyFontFamily,
    openLinkDialog,
    insertQuote,
  };
}
