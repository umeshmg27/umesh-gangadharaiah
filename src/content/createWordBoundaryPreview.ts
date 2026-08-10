function hardCutWithoutUnpairedSurrogate(text: string, limit: number): string {
  const preview = text.slice(0, limit);
  const finalCodeUnit = preview.charCodeAt(preview.length - 1);

  return finalCodeUnit >= 0xd800 && finalCodeUnit <= 0xdbff
    ? preview.slice(0, -1)
    : preview;
}

export function createWordBoundaryPreview(text: string, limit = 180): string {
  if (limit < 1) return "";

  const normalized = text.trim();
  if (normalized.length <= limit) return normalized;

  const candidate = normalized.slice(0, limit + 1);
  const boundary = Array.from(candidate.matchAll(/\s+/g)).at(-1)?.index ?? -1;

  return boundary > 0
    ? candidate.slice(0, boundary).trimEnd()
    : hardCutWithoutUnpairedSurrogate(normalized, limit);
}
