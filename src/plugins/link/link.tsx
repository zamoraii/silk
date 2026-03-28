import { useEffect, useState, useCallback, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  $createTextNode,
  createCommand,
  COMMAND_PRIORITY_LOW,
  type RangeSelection,
} from "lexical";
import {
  $createLinkNode,
  TOGGLE_LINK_COMMAND,
  $toggleLink,
} from "@lexical/link";

export type ShowLinkDialogPayload = { text?: string } | undefined;

export const SHOW_LINK_DIALOG_COMMAND =
  createCommand<ShowLinkDialogPayload>("SHOW_LINK_DIALOG");

export function SilkLinkPlugin() {
  const [editor] = useLexicalComposerContext();
  const [showDialog, setShowDialog] = useState(false);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [wrapMode, setWrapMode] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef<RangeSelection | null>(null);

  useEffect(() => {
    const removeToggle = editor.registerCommand(
      TOGGLE_LINK_COMMAND,
      (payload) => {
        $toggleLink(payload as string | null, {
          target: "_blank",
          rel: "noopener noreferrer",
        });
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    const removeShow = editor.registerCommand(
      SHOW_LINK_DIALOG_COMMAND,
      (payload) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selectionRef.current = selection.clone();
          const isCollapsed = selection.isCollapsed();
          setWrapMode(!isCollapsed);
          if (!isCollapsed) {
            setText(selection.getTextContent());
          }
        }
        if (payload?.text !== undefined) {
          setText(payload.text);
        }
        setShowDialog(true);
        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      removeToggle();
      removeShow();
    };
  }, [editor]);

  useEffect(() => {
    if (showDialog) {
      setTimeout(() => urlInputRef.current?.focus(), 0);
    }
  }, [showDialog]);

  const close = useCallback(() => {
    setShowDialog(false);
    setUrl("");
    setText("");
    setWrapMode(false);
    selectionRef.current = null;
    editor.focus();
  }, [editor]);

  const handleInsert = useCallback(() => {
    if (!url) return;

    editor.update(() => {
      if (selectionRef.current) {
        $setSelection(selectionRef.current.clone());
      }

      if (wrapMode) {
        // Wrap selected text in a link
        $toggleLink(url, {
          target: "_blank",
          rel: "noopener noreferrer",
        });
      } else {
        // Insert a new link node
        const linkNode = $createLinkNode(url, {
          target: "_blank",
          rel: "noopener noreferrer",
        });
        const textNode = $createTextNode(text || url);
        linkNode.append(textNode);

        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes([linkNode]);
        }
      }
    });

    close();
  }, [editor, url, text, wrapMode, close]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleInsert();
      }
      if (e.key === "Escape") {
        close();
      }
    },
    [handleInsert, close],
  );

  if (!showDialog) return null;

  return (
    <div
      className="silk-link-dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="silk-link-dialog" onKeyDown={handleKeyDown}>
        <div className="silk-link-dialog-field">
          <label className="silk-link-dialog-label">URL</label>
          <input
            ref={urlInputRef}
            className="silk-link-dialog-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div className="silk-link-dialog-field">
          <label className="silk-link-dialog-label">Display text</label>
          <input
            className={`silk-link-dialog-input${wrapMode ? " silk-link-dialog-input--readonly" : ""}`}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Link text"
            readOnly={wrapMode}
          />
        </div>
        <div className="silk-link-dialog-actions">
          <button
            className="silk-link-dialog-cancel"
            onClick={close}
            type="button"
          >
            Cancel
          </button>
          <button
            className="silk-link-dialog-insert"
            onClick={handleInsert}
            disabled={!url}
            type="button"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
