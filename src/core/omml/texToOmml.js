/**
 * texToOmml.js
 * Konverze LaTeX do OMML (Office Math Markup Language).
 * @module core/omml/texToOmml
 */

import { mathRun, fraction, radical } from "./xmlBuilder.js";

/**
 * Konvertuje LaTeX string na OMML XML fragment
 * Toto je zjednodušená implementace - komplexnější konverze by vyžadovala
 * úplný parser LaTeX do OMML
 * @param {string} tex - LaTeX string
 * @returns {string} OMML XML fragment
 */
export function texToOmml(tex) {
  if (!tex) return "";

  // TODO: Toto je místo pro komplexní LaTeX -> OMML konverzi
  // Pro nyní vrátíme zjednodušenou verzi

  let result = tex;

  // Velmi základní konverze - jen pro demonstraci
  // V reálné aplikaci by zde byl komplexnější parser

  // Zlomky: \frac{a}{b}
  result = result.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, (match, num, denom) => {
    return fraction(mathRun(num), mathRun(denom));
  });

  // Odmocniny: \sqrt{x} nebo \sqrt[n]{x}
  result = result.replace(/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, (match, degree, content) => {
    return radical(mathRun(content), mathRun(degree));
  });

  result = result.replace(/\\sqrt\{([^}]*)\}/g, (match, content) => {
    return radical(mathRun(content));
  });

  // Pokud neobsahuje OMML značky, zabal do m:oMath
  if (!result.includes("<m:")) {
    // LaTeX string zabal jako text v rovnici
    result = `<m:oMath>${mathRun(result, "roman")}</m:oMath>`;
  } else if (!result.includes("<m:oMath>")) {
    // Už má značky, jen zabal do m:oMath
    result = `<m:oMath>${result}</m:oMath>`;
  }

  return result;
}

/**
 * Konvertuje seznam formulí na OMML fragmenty
 * @param {Object[]} formulas - seznam formulí
 * @returns {Object[]} seznam OMML fragmentů
 */
export function formulasToOmml(formulas) {
  return formulas.map((formula) => ({
    ...formula,
    omml: texToOmml(formula.tex || formula.cleanedTex || formula.raw),
  }));
}
