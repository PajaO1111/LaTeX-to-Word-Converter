/**
 * formulaProblems.js
 * Detekce formulí, které KaTeX/OMML nedokáže bezpečně zpracovat.
 * @module core/latex/formulaProblems
 */

import { validateLatexStructure } from "./validator.js";
import { fallbackTex } from "./cleanTex.js";
import { knownCommands } from "../utils/knownCommands.js";

/**
 * Ověří formule a vrátí seznam problémů (chyby blokují převod, varování ne).
 * @param {{tex: string, raw?: string}[]} formulas - formule ke kontrole
 * @param {Object} [options]
 * @param {boolean} [options.warnVectorEquals=true] - varovat na vektor bez "="
 * @returns {{tex: string, normalizedTex: string, reason: string, severity: "error"|"warning"}[]}
 */
export function formulaProblems(formulas, options = {}) {
  const { warnVectorEquals = true } = options;
  const problems = [];
  for (const item of formulas) {
    const structure = validateLatexStructure(item.tex);
    if (!structure.ok) {
      problems.push({
        tex: item.raw || item.tex,
        normalizedTex: item.tex,
        reason: structure.reason,
        severity: "error",
      });
      continue;
    }
    try {
      if (typeof katex !== "undefined")
        katex.renderToString(item.tex, { throwOnError: true, strict: "ignore" });
    } catch (error) {
      const fallback = fallbackTex(item.tex);
      try {
        if (typeof katex !== "undefined")
          katex.renderToString(fallback, { throwOnError: true, strict: "ignore" });
      } catch {
        problems.push({
          tex: item.raw || item.tex,
          normalizedTex: item.tex,
          reason: "KaTeX: " + error.message,
          severity: "error",
        });
        continue;
      }
    }
    const unknown = [...item.tex.matchAll(/(?<!\\)\\([A-Za-z]+)/g)]
      .map((match) => match[1])
      .filter((name) => !knownCommands.has(name));
    if (unknown.length) {
      problems.push({
        tex: item.raw || item.tex,
        normalizedTex: item.tex,
        reason:
          "Převod do Wordu zatím nezná příkaz: " +
          [...new Set(unknown)].map((name) => "\\" + name).join(", "),
        severity: "error",
      });
    } else if (
      warnVectorEquals &&
      /\\begin\{(?:p|b|B|v|V)matrix\}/.test(item.tex) &&
      /\\mathbf\b/.test(item.tex) &&
      !item.tex.includes("=")
    ) {
      problems.push({
        tex: item.raw || item.tex,
        normalizedTex: item.tex,
        reason:
          "Zápis je technicky platný, ale před výsledným vektorem pravděpodobně chybí znak =.",
        severity: "warning",
      });
    }
  }
  return problems;
}

/**
 * Vrátí množinu normalizovaných zápisů formulí, které se musí exportovat jako
 * čistý text (nejsou bezpečně převoditelné na rovnici).
 * @param {{tex: string, raw?: string}[]} formulas
 * @param {Object} [options] - viz formulaProblems
 * @returns {Set<string>}
 */
export function invalidFormulaSet(formulas, options = {}) {
  return new Set(
    formulaProblems(formulas, options)
      .filter((problem) => problem.severity === "error")
      .map((problem) => problem.normalizedTex)
  );
}
