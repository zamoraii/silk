import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  useBasicTypeaheadTriggerMatch,
  type MenuRenderFn,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { MenuOption } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import type { TextNode } from "lexical";
import { nodeRegistry, type SlashCommandEntry } from "./registry";

class SlashCommandOption extends MenuOption {
  entry: SlashCommandEntry;

  constructor(entry: SlashCommandEntry) {
    super(entry.name);
    this.entry = entry;
  }
}

function SlashCommandMenuItem({
  option,
  isSelected,
  onClick,
  onMouseEnter,
}: {
  option: SlashCommandOption;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <button
      className={`silk-slash-menu-item${isSelected ? " silk-slash-menu-item--active" : ""}`}
      ref={(el) => option.setRefElement(el)}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      onMouseEnter={onMouseEnter}
      type="button"
    >
      <span className="silk-slash-menu-icon">{option.entry.icon}</span>
      <div className="silk-slash-menu-text">
        <span className="silk-slash-menu-name">{option.entry.name}</span>
        <span className="silk-slash-menu-description">
          {option.entry.description}
        </span>
      </div>
    </button>
  );
}

export function SilkSlashCommandPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [queryString, setQueryString] = useState<string | null>(null);

  useEffect(() => {
    return editor.registerEditableListener(setIsEditable);
  }, [editor]);

  const triggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
    allowWhitespace: true,
  });

  const options = useMemo(() => {
    if (queryString === null) return [];
    const lower = queryString.toLowerCase();
    const filtered = nodeRegistry.filter(
      (entry) =>
        entry.name.toLowerCase().includes(lower) ||
        entry.description.toLowerCase().includes(lower),
    );
    return filtered.map((entry) => new SlashCommandOption(entry));
  }, [queryString]);

  const onSelectOption = useCallback(
    (
      option: SlashCommandOption,
      textNodeContainingQuery: TextNode | null,
      closeMenu: () => void,
    ) => {
      if (textNodeContainingQuery) {
        textNodeContainingQuery.remove();
      }
      option.entry.execute(editor);
      closeMenu();
    },
    [editor],
  );

  const menuRenderFn: MenuRenderFn<SlashCommandOption> = useCallback(
    (anchorElementRef, itemProps, matchingString) => {
      if (
        anchorElementRef.current == null ||
        itemProps.options.length === 0
      ) {
        return null;
      }

      return createPortal(
        <div className="silk-slash-menu">
          {itemProps.options.map((option, i) => (
            <SlashCommandMenuItem
              key={option.key}
              option={option}
              isSelected={itemProps.selectedIndex === i}
              onClick={() => itemProps.selectOptionAndCleanUp(option)}
              onMouseEnter={() => itemProps.setHighlightedIndex(i)}
            />
          ))}
        </div>,
        anchorElementRef.current,
      );
    },
    [],
  );

  if (!isEditable) return null;

  return (
    <LexicalTypeaheadMenuPlugin<SlashCommandOption>
      options={options}
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={triggerMatch}
      menuRenderFn={menuRenderFn}
      anchorClassName="silk-slash-anchor"
    />
  );
}
