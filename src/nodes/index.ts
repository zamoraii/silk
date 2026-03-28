import type { Klass, LexicalNode } from "lexical";
import type { SilkFeatures } from "../SilkEditor.types";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { ListNode, ListItemNode } from "@lexical/list";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { LinkNode } from "@lexical/link";
import { NoteNode } from "./note";
import { ImageNode } from "./image";

export function getNodes(features: SilkFeatures): Klass<LexicalNode>[] {
  const nodes: Klass<LexicalNode>[] = [];

  if (features.richText !== false) {
    nodes.push(HeadingNode, QuoteNode);
  }

  if (features.code !== false) {
    nodes.push(CodeNode, CodeHighlightNode);
  }

  if (features.lists !== false) {
    nodes.push(ListNode, ListItemNode);
  }

  nodes.push(NoteNode, HorizontalRuleNode, LinkNode, ImageNode);

  return nodes;
}
