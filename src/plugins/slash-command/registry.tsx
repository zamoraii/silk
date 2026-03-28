import { $createCodeNode } from "@lexical/code";
import { $createHeadingNode } from "@lexical/rich-text";
import { $createHorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $isParagraphNode,
  type LexicalEditor,
  type LexicalNode,
} from "lexical";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { $createNoteNode } from "../../nodes/note";
import { SHOW_LINK_DIALOG_COMMAND } from "../link";
import {
  IconHeading1,
  IconHeading2,
  IconCode,
  IconNote,
  IconDivider,
  IconLink,
  IconListOrdered,
  IconListUnordered,
} from "../../utils/icons";
import type { JSX } from "react";

export interface SlashCommandEntry {
  name: string;
  icon: JSX.Element;
  description: string;
  /** Called inside an editor.update() — perform node operations directly. */
  execute: (editor: LexicalEditor) => void;
}

/** Helper: replace the current empty paragraph with a block node + trailing paragraph. */
function $insertBlock(createNode: () => LexicalNode) {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;

  const anchor = selection.anchor.getNode();
  const anchorParent = anchor.getTopLevelElementOrThrow();
  const node = createNode();
  const trailing = $createParagraphNode();

  anchorParent.insertAfter(node);
  node.insertAfter(trailing);

  if (
    $isParagraphNode(anchorParent) &&
    anchorParent.getTextContentSize() === 0
  ) {
    anchorParent.remove();
  }

  return { node, trailing };
}

export const nodeRegistry: SlashCommandEntry[] = [
  {
    name: "Heading 1",
    icon: <IconHeading1 />,
    description: "Large section heading",
    execute: () => {
      const result = $insertBlock(() => $createHeadingNode("h1"));
      result?.node.selectStart();
    },
  },
  {
    name: "Heading 2",
    icon: <IconHeading2 />,
    description: "Medium section heading",
    execute: () => {
      const result = $insertBlock(() => $createHeadingNode("h2"));
      result?.node.selectStart();
    },
  },
  {
    name: "Code Block",
    icon: <IconCode />,
    description: "Code with syntax highlighting",
    execute: () => {
      const result = $insertBlock(() => $createCodeNode("typescript"));
      result?.node.selectStart();
    },
  },
  {
    name: "Note",
    icon: <IconNote />,
    description: "Info, warning, or error callout",
    execute: () => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchor = selection.anchor.getNode();
      const anchorParent = anchor.getTopLevelElementOrThrow();

      const noteNode = $createNoteNode("info");
      const innerParagraph = $createParagraphNode();
      noteNode.append(innerParagraph);
      const trailing = $createParagraphNode();

      anchorParent.insertAfter(noteNode);
      noteNode.insertAfter(trailing);

      if (
        $isParagraphNode(anchorParent) &&
        anchorParent.getTextContentSize() === 0
      ) {
        anchorParent.remove();
      }

      innerParagraph.selectStart();
    },
  },
  {
    name: "Bulleted List",
    icon: <IconListUnordered />,
    description: "Unordered bulleted list",
    execute: (editor) => {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    },
  },
  {
    name: "Numbered List",
    icon: <IconListOrdered />,
    description: "Ordered numbered list",
    execute: (editor) => {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    },
  },
  {
    name: "Divider",
    icon: <IconDivider />,
    description: "Horizontal line separator",
    execute: () => {
      const result = $insertBlock(() => $createHorizontalRuleNode());
      result?.trailing.selectStart();
    },
  },
  {
    name: "Link",
    icon: <IconLink />,
    description: "Insert a masked link",
    execute: (editor) => {
      editor.dispatchCommand(SHOW_LINK_DIALOG_COMMAND, undefined);
    },
  },
];
