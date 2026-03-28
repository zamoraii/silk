export const COLORS = [
  { value: null, label: "Default" },
  { value: "#9c9a94", label: "Muted" },
  { value: "#ac3521", label: "Alert" },
  { value: "#5a6340", label: "Emphasis" },
  { value: "#7e572e", label: "Accent" },
  { value: "#4a5568", label: "Secondary" },
];

export const FONT_FAMILIES: {
  value: string | null;
  label: string;
  css: string;
}[] = [
  { value: null, label: "Inter", css: '"Inter", sans-serif' },
  {
    value: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
    label: "SF Mono",
    css: '"SF Mono", monospace',
  },
  {
    value: '"Space Grotesk", "Inter", sans-serif',
    label: "Space Grotesk",
    css: '"Space Grotesk", sans-serif',
  },
];

export function detectFontFamily(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.includes("SF Mono") || raw.includes("Fira Code")) {
    return FONT_FAMILIES[1].value;
  }
  if (raw.includes("Space Grotesk")) {
    return FONT_FAMILIES[2].value;
  }
  return null;
}

export const MIN_FONT_SIZE = 10;
export const MAX_FONT_SIZE = 36;
export const DEFAULT_FONT_SIZE = 16;
