/**
 * classifyFixes.js
 * Klasifikace provedeních oprav na LaTeX textu.
 * @module core/latex/classifyFixes
 */

/**
 * Klasifikuje rozdíly mezi originálním a opraveným LaTeX textem
 * @param {string} original - originální LaTeX
 * @param {string} cleaned - vyčištěný LaTeX
 * @returns {string[]} seznam kategorií oprav
 */
export function classifyFixes(original, cleaned) {
  const fixes = [];

  if (/\r/.test(original) && !/\r/.test(cleaned)) fixes.push("trim");

  if (/\\text\{/.test(original) && /\\text\{/.test(cleaned))
    fixes.push("text-protection");

  if (
    /\\(mathbb|mathbf|mathrm|mathcal|mathsf)[A-Za-z]/.test(original) &&
    !/\\(mathbb|mathbf|mathrm|mathcal|mathsf)[A-Za-z]/.test(cleaned)
  )
    fixes.push("command-separation");

  if (/\\(?:,|;|!|:)/.test(original) && !/\\(?:,|;|!|:)/.test(cleaned))
    fixes.push("spacing-command");

  if (
    /\\begin\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\}/.test(
      original,
    ) &&
    (original.match(/\\\\/g) || []).length !==
      (cleaned.match(/\\\\/g) || []).length
  )
    fixes.push("matrix-row-separator");

  if (/\\(?:0|1|2|3|4|5|6|7|8|9)/.test(original) && /\\begin\{/.test(original))
    fixes.push("matrix-row-separator");

  if (
    /\\[A-Za-z]_(?:\d+|\{)/.test(original) &&
    !/\\[A-Za-z]_(?:\d+|\{)/.test(cleaned)
  )
    fixes.push("vector");

  if (
    /\\[A-Za-z]/.test(original) &&
    original.replace(/\\[A-Za-z]+/g, "") !==
      cleaned.replace(/\\[A-Za-z]+/g, "") &&
    !/\r/.test(original)
  )
    fixes.push("backslash-artifact");

  if (
    /[A-Za-z]\s+[A-Za-z]/.test(original) &&
    !/[A-Za-z]\s+[A-Za-z]/.test(cleaned)
  )
    fixes.push("identifier-space");

  return [...new Set(fixes)];
}
