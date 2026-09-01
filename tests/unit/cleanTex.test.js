/**
 * cleanTex.test.js
 * Unit testy pro cleanTex modul.
 */

import { cleanTex, fallbackTex } from "../../src/core/latex/cleanTex.js";

describe("cleanTex", () => {
  test("should return empty string for empty input", () => {
    const result = cleanTex("");
    expect(result.cleaned).toBe("");
    expect(result.protectedBlocks).toEqual([]);
  });

  test("should preserve valid LaTeX", () => {
    const tex = "x^2 + y^2 = z^2";
    const result = cleanTex(tex);
    expect(result.cleaned).toBeTruthy();
  });

  test("should protect \\text blocks", () => {
    const tex = "\\text{hello} + x";
    const result = cleanTex(tex);
    expect(result.protectedBlocks.length).toBeGreaterThan(0);
  });

  test("should fix mathbb spacing", () => {
    const tex = "\\mathbb R";
    const result = cleanTex(tex);
    expect(result.cleaned).toContain("\\mathbb{R}");
  });

  test("should trim whitespace", () => {
    const tex = "  x + y  ";
    const result = cleanTex(tex);
    expect(result.cleaned).not.toMatch(/^\s/);
    expect(result.cleaned).not.toMatch(/\s$/);
  });

  test("should handle carriage returns", () => {
    const tex = "x\r\ny";
    const result = cleanTex(tex);
    expect(result.cleaned).not.toContain("\r");
  });
});

describe("fallbackTex", () => {
  test("should remove \\left and \\right", () => {
    const tex = "\\left( x \\right)";
    const result = fallbackTex(tex);
    expect(result).not.toContain("\\left");
    expect(result).not.toContain("\\right");
  });

  test("should preserve other commands", () => {
    const tex = "\\sqrt{x}";
    const result = fallbackTex(tex);
    expect(result).toContain("\\sqrt");
  });
});
