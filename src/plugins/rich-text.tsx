import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

export function SilkRichTextPlugin() {
  return (
    <div style={{ position: "relative" }}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="silk-content-editable" />}
        placeholder={
          <div className="silk-placeholder">Start writing…</div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
    </div>
  );
}
