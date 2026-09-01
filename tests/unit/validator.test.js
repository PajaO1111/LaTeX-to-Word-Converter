/**
 * validator.test.js
 * Unit testy pro validator modul.
 */

import {
  validateLatexStructure,
  validateFormula,
  _validateFormulaWithFallback,
} from "../../src/core/latex/validator.js";

describe("validateLatexStructure", () => {
  test("should accept valid LaTeX", () => {
    const result = validateLatexStructure("x + y");
    expect(result.ok).toBe(true);
  });

  test("should reject unmatched braces", () => {
    const result = validateLatexStructure("{x + y");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("závorka");
  });

  test("should reject unmatched \\left/\\right", () => {
    const result = validateLatexStructure("\\left( x");
    expect(result.ok).toBe(false);
  });

  test("should reject unclosed environments", () => {
    const result = validateLatexStructure("\\begin{array} x");
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("Neuzavřené");
  });

  test("should reject very long input", () => {
    const longTex = "x".repeat(100001);
    const result = validateLatexStructure(longTex);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("dlouhý");
  });

  test("should validate basic matrix", () => {
    const tex = "\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}";
    const result = validateLatexStructure(tex);
    expect(result.ok).toBe(true);
  });
});

describe("validateFormula", () => {
  test("should return ok for valid input", () => {
    const result = validateFormula("x + y");
    expect(result.ok).toBe(true);
  });

  test("should report invalid structure", () => {
    const result = validateFormula("{x");
    expect(result.ok).toBe(false);
  });
});
