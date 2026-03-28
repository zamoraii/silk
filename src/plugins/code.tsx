import {
  useEffect,
  useCallback,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isCodeNode, CodeNode } from "@lexical/code";
import {
  registerCodeHighlighting,
  getCodeLanguageOptions,
  ShikiTokenizer,
} from "@lexical/code-shiki";
import { $getNodeByKey } from "lexical";
import { useSilkContainer } from "../SilkEditorContext";

function getSupportedLanguages(): { value: string; label: string }[] {
  return getCodeLanguageOptions().map(([value, label]) => ({ value, label }));
}

const HEADER_HEIGHT = 32;

function CodeBlockHeader({
  language,
  codeNodeKey,
  codeElem,
}: {
  language: string;
  codeNodeKey: string;
  codeElem: HTMLElement;
}) {
  const [editor] = useLexicalComposerContext();
  const containerRef = useSilkContainer();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const headerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    return editor.registerEditableListener(setIsEditable);
  }, [editor]);

  const reposition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const codeRect = codeElem.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setPos({
      top: codeRect.top - containerRect.top - HEADER_HEIGHT,
      left: codeRect.left - containerRect.left,
      width: codeRect.width,
    });
  }, [codeElem, containerRef]);

  useLayoutEffect(() => {
    reposition();
    const ro = new ResizeObserver(reposition);
    ro.observe(codeElem);
    return () => ro.disconnect();
  }, [codeElem, reposition]);

  // Reposition when editor content changes (content above may shift the block)
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      reposition();
    });
  }, [editor, reposition]);

  const languages = getSupportedLanguages();
  const displayLang =
    languages.find((l) => l.value === language)?.label ??
    language ??
    "Plain Text";

  const setLanguage = useCallback(
    (lang: string) => {
      editor.update(() => {
        const node = $getNodeByKey(codeNodeKey);
        if ($isCodeNode(node)) {
          node.setLanguage(lang);
        }
      });
      setIsOpen(false);
    },
    [editor, codeNodeKey],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={headerRef}
      className="silk-code-header"
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        width: pos.width,
        pointerEvents: "auto",
      }}
    >
      <button
        className="silk-code-language-select"
        onClick={() => isEditable && setIsOpen(!isOpen)}
        style={{ cursor: isEditable ? "pointer" : "default" }}
        onMouseDown={(e) => e.preventDefault()}
        type="button"
      >
        {displayLang}
        {isEditable && (
          <span className="silk-code-language-chevron" aria-hidden>
            ▾
          </span>
        )}
      </button>
      {isOpen && isEditable && (
        <div className="silk-code-language-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.value}
              className={`silk-code-language-option${language === lang.value ? " silk-code-language-option--active" : ""}`}
              onClick={() => setLanguage(lang.value)}
              onMouseDown={(e) => e.preventDefault()}
              type="button"
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface CodeNodeEntry {
  language: string;
  elem: HTMLElement;
}

export function SilkCodePlugin() {
  const [editor] = useLexicalComposerContext();
  const [codeNodes, setCodeNodes] = useState<Map<string, CodeNodeEntry>>(
    new Map(),
  );

  useEffect(() => {
    return registerCodeHighlighting(editor, {
      ...ShikiTokenizer,
      defaultTheme: "dark-plus",
    });
  }, [editor]);

  useEffect(() => {
    const trackedKeys = new Set<string>();

    const refresh = () => {
      editor.getEditorState().read(() => {
        const next = new Map<string, CodeNodeEntry>();
        for (const key of trackedKeys) {
          const node = $getNodeByKey(key);
          if ($isCodeNode(node)) {
            const elem = editor.getElementByKey(key);
            if (elem) {
              next.set(key, {
                language: node.getLanguage() ?? "typescript",
                elem,
              });
            }
          }
        }
        setCodeNodes(next);
      });
    };

    const removeMutation = editor.registerMutationListener(
      CodeNode,
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
      {Array.from(codeNodes.entries()).map(([key, { language, elem }]) => (
        <CodeBlockHeader
          key={key}
          language={language}
          codeNodeKey={key}
          codeElem={elem}
        />
      ))}
    </>
  );
}
