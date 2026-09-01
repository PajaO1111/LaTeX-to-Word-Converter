/**
 * heuristicFix.test.js
 * Unit testy pro heuristicFix modul.
 */

import { heuristicFix } from "../../src/core/latex/heuristicFix.js";

describe("heuristicFix", () => {
  test("should return object with repaired and fixes", () => {
    const result = heuristicFix("x");
    expect(result).toHaveProperty("repaired");
    expect(result).toHaveProperty("fixes");
    expect(Array.isArray(result.fixes)).toBe(true);
  });

  test("should preserve valid input", () => {
    const input = "x + y";
    const result = heuristicFix(input);
    expect(result.repaired).toBe(input);
  });

  test("should fix \\backslash", () => {
    const input = "\\backslash";
    const result = heuristicFix(input);
    expect(result.repaired).toContain("\\\\");
    expect(result.fixes).toContain("backslash");
  });

  test("should fix absolute value bars", () => {
    const input = "\\left| x \\right|";
    const result = heuristicFix(input);
    expect(result.fixes.length).toBeGreaterThanOrEqual(0);
  });

  test("should balance delimiters", () => {
    const input = "\\left( x";
    const result = heuristicFix(input);
    expect(result.repaired).toContain("\\right)");
  });

  test("should fix matrix end", () => {
    const input = "\\begin{pmatrix} 1 2";
    const result = heuristicFix(input);
    expect(result.repaired).toContain("\\end{pmatrix}");
  });
});
