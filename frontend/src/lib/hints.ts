// hints jsonb convention: { hints: string[], misconceptions: string[] }.
// Admins author each as one item per line; these helpers convert to/from that.

const linesToArray = (text: string): string[] =>
  text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export const arrayToLines = (hints: Record<string, unknown> | null, key: string): string => {
  const arr = hints && Array.isArray(hints[key]) ? (hints[key] as unknown[]) : [];
  return arr.filter((x): x is string => typeof x === "string").join("\n");
};

export const buildHints = (
  hintsText: string,
  misconceptionsText: string,
): Record<string, unknown> | null => {
  const hints = linesToArray(hintsText);
  const misconceptions = linesToArray(misconceptionsText);
  if (hints.length === 0 && misconceptions.length === 0) return null;
  const out: Record<string, unknown> = {};
  if (hints.length) out.hints = hints;
  if (misconceptions.length) out.misconceptions = misconceptions;
  return out;
};
