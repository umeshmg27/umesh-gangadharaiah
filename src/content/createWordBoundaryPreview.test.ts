import { projects } from "./projects";

import { createWordBoundaryPreview } from "./createWordBoundaryPreview";

function expectCompleteWordPrefix(
  source: string,
  preview: string,
  limit: number,
): void {
  const normalized = source.trim();

  expect(preview.length).toBeLessThanOrEqual(limit);
  expect(normalized.startsWith(preview)).toBe(true);
  expect(preview).not.toMatch(/(?:\.\.\.|…)$/);
  expect(normalized.charAt(preview.length)).toMatch(/\s/);
}

describe("createWordBoundaryPreview", () => {
  it("returns an empty preview for empty text, whitespace, and non-positive limits", () => {
    expect(createWordBoundaryPreview("")).toBe("");
    expect(createWordBoundaryPreview(" \n\t ")).toBe("");
    expect(createWordBoundaryPreview("content", 0)).toBe("");
    expect(createWordBoundaryPreview("content", -7)).toBe("");
  });

  it("trims outer whitespace and keeps short or exact-limit text intact", () => {
    expect(createWordBoundaryPreview("  concise project summary  ")).toBe(
      "concise project summary",
    );
    expect(createWordBoundaryPreview("  four  ", 4)).toBe("four");
  });

  it("creates complete-word prefixes for text over the default and 400-character limits", () => {
    const overDefaultLimit = Array.from(
      { length: 50 },
      (_, index) => `default${index}`,
    ).join(" ");
    const overFourHundred = Array.from(
      { length: 90 },
      (_, index) => `extended${index}`,
    ).join(" ");

    const defaultPreview = createWordBoundaryPreview(overDefaultLimit);
    const fourHundredPreview = createWordBoundaryPreview(overFourHundred, 400);

    expect(overDefaultLimit.length).toBeGreaterThan(180);
    expect(overFourHundred.length).toBeGreaterThan(400);
    expectCompleteWordPrefix(overDefaultLimit, defaultPreview, 180);
    expectCompleteWordPrefix(overFourHundred, fourHundredPreview, 400);
  });

  it("preserves internal whitespace while cutting at the last available boundary", () => {
    const source = "  alpha   beta   gamma delta  ";
    const preview = createWordBoundaryPreview(source, 15);

    expect(preview).toBe("alpha   beta");
    expectCompleteWordPrefix(source, preview, 15);
  });

  it("uses whitespace exactly at the limit to retain the complete preceding word", () => {
    const source = "alpha beta gamma";
    const preview = createWordBoundaryPreview(source, 10);

    expect(preview).toBe("alpha beta");
    expectCompleteWordPrefix(source, preview, 10);
  });

  it("drops a long final word instead of returning a partial word", () => {
    const source = `alpha beta ${"x".repeat(40)}`;
    const preview = createWordBoundaryPreview(source, 24);

    expect(preview).toBe("alpha beta");
    expectCompleteWordPrefix(source, preview, 24);
  });

  it("hard-cuts a single unbroken token when no word boundary exists", () => {
    const source = "x".repeat(220);
    const preview = createWordBoundaryPreview(source, 180);

    expect(preview).toBe("x".repeat(180));
    expect(preview.length).toBe(180);
    expect(source.startsWith(preview)).toBe(true);
    expect(preview).not.toContain("…");
  });

  it("never leaves an unpaired surrogate when a hard cut lands inside an emoji", () => {
    const cases = [
      { source: "🙂🙂", limit: 1, expected: "" },
      { source: "A🙂B", limit: 2, expected: "A" },
      { source: "A🙂B", limit: 3, expected: "A🙂" },
    ] as const;

    for (const { source, limit, expected } of cases) {
      const preview = createWordBoundaryPreview(source, limit);

      expect(preview).toBe(expected);
      expect(preview.length).toBeLessThanOrEqual(limit);
      expect(source.startsWith(preview)).toBe(true);
      expect(() => encodeURIComponent(preview)).not.toThrow();
    }
  });

  it("returns only source prefixes and never appends an ellipsis", () => {
    const sources = [
      "one two three four five",
      "one\ttwo\nthree four five",
      `short ${"terminal".repeat(20)}`,
    ];

    for (const source of sources) {
      const preview = createWordBoundaryPreview(source, 13);
      const normalized = source.trim();

      expect(preview.length).toBeLessThanOrEqual(13);
      expect(normalized.startsWith(preview)).toBe(true);
      expect(preview.endsWith("...")).toBe(false);
      expect(preview.endsWith("…")).toBe(false);
    }
  });

  it("does not alter active project descriptions while deriving previews", () => {
    const project = projects.find(({ id }) => id === "ndo-search-explore");
    expect(project).toBeDefined();
    if (!project) return;

    const description = project.description;
    const preview = createWordBoundaryPreview(project.description);

    expect(project.description).toBe(description);
    expectCompleteWordPrefix(description, preview, 180);
  });
});
