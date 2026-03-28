import {
  ElementNode,
  $createParagraphNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type RangeSelection,
  type SerializedElementNode,
  type Spread,
} from "lexical";

export type NoteType = "info" | "warning" | "error";

export type SerializedNoteNode = Spread<
  { noteType: NoteType },
  SerializedElementNode
>;

export class NoteNode extends ElementNode {
  __noteType: NoteType;

  static getType(): string {
    return "note";
  }

  static clone(node: NoteNode): NoteNode {
    return new NoteNode(node.__noteType, node.__key);
  }

  constructor(noteType: NoteType = "info", key?: NodeKey) {
    super(key);
    this.__noteType = noteType;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div");
    div.className = `silk-note silk-note--${this.__noteType}`;
    return div;
  }

  updateDOM(prevNode: NoteNode, dom: HTMLElement): boolean {
    if (prevNode.__noteType !== this.__noteType) {
      dom.className = `silk-note silk-note--${this.__noteType}`;
    }
    return false;
  }

  setNoteType(noteType: NoteType): this {
    const self = this.getWritable();
    self.__noteType = noteType;
    return self;
  }

  getNoteType(): NoteType {
    return this.getLatest().__noteType;
  }

  insertNewAfter(
    selection: RangeSelection,
    restoreSelection?: boolean,
  ): LexicalNode | null {
    // If at end of last child, exit the note and create a paragraph after
    const anchorNode = selection.anchor.getNode();
    const lastDescendant = this.getLastDescendant();
    if (
      lastDescendant === null ||
      anchorNode === lastDescendant ||
      (anchorNode === this &&
        selection.anchor.offset === this.getChildrenSize())
    ) {
      const newParagraph = $createParagraphNode();
      this.insertAfter(newParagraph, restoreSelection);
      return newParagraph;
    }
    // Otherwise let default behavior handle (split paragraph inside note)
    return super.insertNewAfter(selection, restoreSelection);
  }

  collapseAtStart(): boolean {
    // If note is empty, replace with a paragraph
    const paragraph = $createParagraphNode();
    const children = this.getChildren();
    if (children.length > 0) {
      children.forEach((child) => paragraph.append(child));
    }
    this.replace(paragraph);
    return true;
  }

  static importJSON(serializedNode: SerializedNoteNode): NoteNode {
    return $createNoteNode(serializedNode.noteType);
  }

  exportJSON(): SerializedNoteNode {
    return {
      ...super.exportJSON(),
      noteType: this.__noteType,
    };
  }
}

export function $createNoteNode(noteType: NoteType = "info"): NoteNode {
  return new NoteNode(noteType);
}

export function $isNoteNode(
  node: LexicalNode | null | undefined,
): node is NoteNode {
  return node instanceof NoteNode;
}
