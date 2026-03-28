import {
  useEffect,
  useCallback,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import { NoteNode, $isNoteNode, type NoteType } from "../../nodes/note";
import { useSilkContainer } from "../../SilkEditorContext";
import { IconNote, IconWarning, IconError } from "../../utils/icons";

const NOTE_TYPES: {
  value: NoteType;
  label: string;
  Icon: React.FC<{ size?: number; className?: string }>;
}[] = [
  { value: "info", label: "Info", Icon: IconNote },
  { value: "warning", label: "Question", Icon: IconWarning },
  { value: "error", label: "Error", Icon: IconError },
];

/** Small overlay positioned on top of the CSS ::before icon inside each note. */
function NoteIconOverlay({
  noteType,
  nodeKey,
  elem,
}: {
  noteType: NoteType;
  nodeKey: string;
  elem: HTMLElement;
}) {
  const [editor] = useLexicalComposerContext();
  const containerRef = useSilkContainer();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    return editor.registerEditableListener(setIsEditable);
  }, [editor]);

  const reposition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const elemRect = elem.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setPos({
      top: elemRect.top - containerRect.top + 13,
      left: elemRect.left - containerRect.left + 17,
    });
  }, [elem, containerRef]);

  useLayoutEffect(() => {
    reposition();
    const ro = new ResizeObserver(reposition);
    ro.observe(elem);
    return () => ro.disconnect();
  }, [elem, reposition]);

  useEffect(() => {
    return editor.registerUpdateListener(() => reposition());
  }, [editor, reposition]);

  const setNoteType = useCallback(
    (type: NoteType) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isNoteNode(node)) {
          node.setNoteType(type);
        }
      });
      setIsOpen(false);
    },
    [editor, nodeKey],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isEditable) return null;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        zIndex: 1,
      }}
    >
      <button
        className={`silk-note-icon-trigger silk-note-icon-trigger--${noteType}`}
        onClick={() => setIsOpen(!isOpen)}
        onMouseDown={(e) => e.preventDefault()}
        type="button"
        aria-label="Change note type"
      >
        {/* Transparent button — the CSS ::before on the note renders the visible icon */}
      </button>
      {isOpen && (
        <div className="silk-note-icon-dropdown">
          {NOTE_TYPES.map((type) => (
            <button
              key={type.value}
              className={`silk-note-type-option silk-note-type-option--${type.value}${noteType === type.value ? " silk-note-type-option--active" : ""}`}
              onClick={() => setNoteType(type.value)}
              onMouseDown={(e) => e.preventDefault()}
              type="button"
            >
              <type.Icon size={14} />
              {type.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface NoteEntry {
  noteType: NoteType;
  elem: HTMLElement;
}

export function SilkNotePlugin() {
  const [editor] = useLexicalComposerContext();
  const [noteNodes, setNoteNodes] = useState<Map<string, NoteEntry>>(
    new Map(),
  );

  useEffect(() => {
    const trackedKeys = new Set<string>();

    const refresh = () => {
      editor.getEditorState().read(() => {
        const next = new Map<string, NoteEntry>();
        for (const key of trackedKeys) {
          const node = $getNodeByKey(key);
          if ($isNoteNode(node)) {
            const elem = editor.getElementByKey(key);
            if (elem) {
              next.set(key, {
                noteType: node.getNoteType(),
                elem,
              });
            }
          }
        }
        setNoteNodes(next);
      });
    };

    const removeMutation = editor.registerMutationListener(
      NoteNode,
      (mutations) => {
        for (const [key, type] of mutations) {
          if (type === "destroyed") {
            trackedKeys.delete(key);
          } else {
            trackedKeys.add(key);
          }
        }
        refresh();
      },
      { skipInitialization: false },
    );

    const removeUpdate = editor.registerUpdateListener(({ dirtyElements }) => {
      let needsRefresh = false;
      for (const key of trackedKeys) {
        if (dirtyElements.has(key)) {
          needsRefresh = true;
          break;
        }
      }
      if (needsRefresh) refresh();
    });

    return () => {
      removeMutation();
      removeUpdate();
    };
  }, [editor]);

  return (
    <>
      {Array.from(noteNodes.entries()).map(([key, { noteType, elem }]) => (
        <NoteIconOverlay
          key={key}
          noteType={noteType}
          nodeKey={key}
          elem={elem}
        />
      ))}
    </>
  );
}
