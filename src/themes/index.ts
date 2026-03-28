import type { EditorThemeClasses } from "lexical";
import type { SilkFeatures } from "../SilkEditor.types";
import { baseTheme } from "./base";
import { richTextTheme } from "./slices/rich-text";
import { codeTheme } from "./slices/code";

function mergeTheme(
  ...themes: EditorThemeClasses[]
): EditorThemeClasses {
  const result: EditorThemeClasses = {};
  for (const theme of themes) {
    for (const [key, value] of Object.entries(theme)) {
      const existing = result[key];
      if (
        existing &&
        typeof existing === "object" &&
        typeof value === "object" &&
        !Array.isArray(existing) &&
        !Array.isArray(value)
      ) {
        result[key] = { ...existing, ...value };
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

export function buildSilkTheme(
  features: SilkFeatures,
  overrides?: EditorThemeClasses,
): EditorThemeClasses {
  const layers: EditorThemeClasses[] = [baseTheme];

  if (features.richText !== false) {
    layers.push(richTextTheme);
  }

  if (features.code !== false) {
    layers.push(codeTheme);
  }

  if (overrides) {
    layers.push(overrides);
  }

  return mergeTheme(...layers);
}
