import type { EditorThemeClasses } from "lexical";

export const baseTheme: EditorThemeClasses = {
  root: "silk-root",
  paragraph: "silk-paragraph",
  link: "silk-link",
  hr: "silk-hr",
  list: {
    ul: "silk-list-ul",
    ol: "silk-list-ol",
    listitem: "silk-list-item",
    nested: {
      listitem: "silk-list-item-nested",
    },
    listitemChecked: "silk-list-item-checked",
    listitemUnchecked: "silk-list-item-unchecked",
  },
  image: "silk-image-wrapper",
  text: {
    bold: "silk-text-bold",
    italic: "silk-text-italic",
    underline: "silk-text-underline",
    strikethrough: "silk-text-strikethrough",
    code: "silk-text-code",
  },
};
