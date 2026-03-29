import type { JSX } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  $getNodeByKey,
  CLICK_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  type DOMConversionMap,
  type DOMExportOutput,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
  $applyNodeReplacement,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width?: number;
    height?: number;
    alignment?: string;
  },
  SerializedLexicalNode
>;

type HandlePosition = "nw" | "ne" | "sw" | "se";

const HANDLES: HandlePosition[] = ["nw", "ne", "sw", "se"];

function ImageComponent({
  src,
  altText,
  width,
  height,
  nodeKey,
}: {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  nodeKey: NodeKey;
}) {
  const [editor] = useLexicalComposerContext();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState(false);

  const onClick = useCallback(
    (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        wrapperRef.current.contains(e.target as Node)
      ) {
        clearSelection();
        setSelected(true);
        return true;
      }
      return false;
    },
    [clearSelection, setSelected],
  );

  const onDelete = useCallback(
    (e: KeyboardEvent) => {
      if (isSelected && !isResizing) {
        e.preventDefault();
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (node) node.remove();
        });
        return true;
      }
      return false;
    },
    [editor, isSelected, isResizing, nodeKey],
  );

  useEffect(() => {
    const unregClick = editor.registerCommand(
      CLICK_COMMAND,
      onClick,
      COMMAND_PRIORITY_LOW,
    );
    const unregBackspace = editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      onDelete,
      COMMAND_PRIORITY_LOW,
    );
    const unregDelete = editor.registerCommand(
      KEY_DELETE_COMMAND,
      onDelete,
      COMMAND_PRIORITY_LOW,
    );
    return () => {
      unregClick();
      unregBackspace();
      unregDelete();
    };
  }, [editor, onClick, onDelete]);

  const handleResize = useCallback(
    (handle: HandlePosition, startEvent: React.MouseEvent) => {
      startEvent.preventDefault();
      startEvent.stopPropagation();
      setIsResizing(true);

      const img = imgRef.current;
      if (!img) return;

      const startX = startEvent.clientX;
      const startY = startEvent.clientY;
      const startWidth = img.offsetWidth;
      const startHeight = img.offsetHeight;
      const aspectRatio = startWidth / startHeight;

      const onMouseMove = (e: MouseEvent) => {
        let dx = e.clientX - startX;
        const dy = e.clientY - startY;

        // Flip delta for left-side handles
        if (handle === "nw" || handle === "sw") {
          dx = -dx;
        }

        // Use whichever axis moved more, maintaining aspect ratio
        let newWidth: number;
        if (Math.abs(dx) > Math.abs(dy)) {
          newWidth = Math.max(100, startWidth + dx);
        } else {
          const effectiveDy = handle === "nw" || handle === "ne" ? -dy : dy;
          newWidth = Math.max(100, startWidth + effectiveDy * aspectRatio);
        }

        const newHeight = newWidth / aspectRatio;
        img.style.width = `${Math.round(newWidth)}px`;
        img.style.height = `${Math.round(newHeight)}px`;
      };

      const onMouseUp = (e: MouseEvent) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        setIsResizing(false);

        const finalWidth = img.offsetWidth;
        const finalHeight = img.offsetHeight;

        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (node && $isImageNode(node)) {
            const writable = node.getWritable();
            writable.__width = finalWidth;
            writable.__height = finalHeight;
          }
        });
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [editor, nodeKey],
  );

  const isEditable = editor.isEditable();

  return (
    <div
      ref={wrapperRef}
      className={`silk-image-container${isSelected ? " silk-image-container--selected" : ""}`}
    >
      <img
        ref={imgRef}
        src={src}
        alt={altText}
        width={width}
        height={height}
        className="silk-image"
        draggable={false}
      />
      {isSelected && isEditable && (
        <>
          {HANDLES.map((pos) => (
            <div
              key={pos}
              className={`silk-image-handle silk-image-handle--${pos}`}
              onMouseDown={(e) => handleResize(pos, e)}
            />
          ))}
        </>
      )}
    </div>
  );
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: number | undefined;
  __height: number | undefined;
  __alignment: string;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__alignment,
      node.__key,
    );
  }

  constructor(
    src: string,
    altText: string,
    width?: number,
    height?: number,
    alignment: string = "",
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
    this.__alignment = alignment;
  }

  getAlignment(): string {
    return this.getLatest().__alignment;
  }

  setAlignment(alignment: string): void {
    const writable = this.getWritable();
    writable.__alignment = alignment;
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "silk-image-wrapper";
    if (this.__alignment && this.__alignment !== "left") {
      div.style.textAlign = this.__alignment;
    }
    return div;
  }

  updateDOM(prevNode: ImageNode, dom: HTMLElement): boolean {
    if (prevNode.__alignment !== this.__alignment) {
      dom.style.textAlign =
        this.__alignment && this.__alignment !== "left"
          ? this.__alignment
          : "";
    }
    return false;
  }

  isInline(): boolean {
    return false;
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode(
      serializedNode.src,
      serializedNode.altText,
      serializedNode.width,
      serializedNode.height,
      serializedNode.alignment,
    );
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      alignment: this.__alignment || undefined,
    };
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement("img");
    img.src = this.__src;
    img.alt = this.__altText;
    if (this.__width) img.width = this.__width;
    if (this.__height) img.height = this.__height;
    return { element: img };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: (domNode: HTMLElement) => {
          const img = domNode as HTMLImageElement;
          return {
            node: $createImageNode(
              img.src,
              img.alt || "",
              img.naturalWidth || undefined,
              img.naturalHeight || undefined,
            ),
          };
        },
        priority: 0,
      }),
    };
  }

  decorate(_editor: LexicalEditor): JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        nodeKey={this.__key}
      />
    );
  }
}

export function $createImageNode(
  src: string,
  altText: string = "",
  width?: number,
  height?: number,
  alignment?: string,
): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(src, altText, width, height, alignment),
  );
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}
