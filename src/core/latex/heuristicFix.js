/**
 * heuristicFix.js
 * Heuristické opravy LaTeX textu pro běžné chyby a artefakty.
 * @module core/latex/heuristicFix
 */

/**
 * Aplikuje heuristické opravy na LaTeX text
 * Vrací oprávený text a seznam aplikovaných oprav
 * @param {string} tex - LaTeX string k opravě
 * @returns {{ repaired: string, fixes: string[] }} oprávený text a seznam oprav
 */
export function heuristicFix(tex) {
  let value = String(tex || "");
  const _original = value;
  const fixes = [];

  const apply = (pattern, replacement, type) => {
    const next = value.replace(pattern, replacement);
    if (next !== value) fixes.push(type);
    value = next;
  };

  apply(/\\backslash\b/g, "\\\\", "backslash");
  apply(/\\left\\\{([^{}]*?)\\right\\}/g, "\\left\\{$1\\right\\}", "braces");
  apply(/\\left\|([^|]*?)\\right\|/g, "\\left|$1\\right|", "absolute-value");
  apply(
    /\\left\\langle([\s\S]*?)\\right\\rangle/g,
    "\\left\\langle$1\\right\\rangle",
    "angle-brackets"
  );
  apply(/\\middle\s*\|/g, "\\middle|", "middle");
  apply(/\\left\|([^|\\]+)$/g, "\\left|$1\\right|", "absolute-value");
  apply(/\\left\{([^{}\\]+)$/g, "\\left\\{$1\\right\\}", "braces");
  apply(/\\left\[(^[\]\\]+)$/g, "\\left[$1\\right]", "brackets");
  apply(/\\left\(([^()]*)$/g, "\\left($1\\right)", "parentheses");

  const delimiterPairs = {
    "[": "]",
    "(": ")",
    "\\{": "\\}",
    "|": "|",
    "\\langle": "\\rangle",
    "\\lfloor": "\\rfloor",
    "\\lceil": "\\rceil",
  };

  const delimiterStack = [];
  for (const match of value.matchAll(
    /\\(left|right)\s*(\[|\]|\(|\)|\||\\(?:\{|\}|langle|rangle|lfloor|rfloor|lceil|rceil))/g
  )) {
    const side = match[1];
    const token = match[2];
    if (side === "left") delimiterStack.push(delimiterPairs[token]);
    else if (delimiterStack[delimiterStack.length - 1] === token) delimiterStack.pop();
    else fixes.push("delimiter-conflict");
  }

  if (delimiterStack.length) {
    value += delimiterStack
      .reverse()
      .map((close) => `\\right${close}`)
      .join("");
    fixes.push("delimiter-pair");
  }

  const matrixStart = /\\begin\{(pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\}/g;
  value = value.replace(matrixStart, (match, env, offset, source) => {
    const close = `\\end{${env}}`;
    if (source.indexOf(close, offset + match.length) >= 0) return match;
    fixes.push("matrix-end");
    return `${match}${source.slice(offset + match.length)}${close}`;
  });

  value = value.replace(
    /(\\begin\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\})([\s\S]*?)(\\end\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\})/g,
    (match, start, body, end) => {
      const repaired = body.replace(/([A-Za-z])_(\d+)(?=[A-Za-z]_(?:\d+|\{))/g, "$1_$2\\\\");
      if (repaired !== body) fixes.push("matrix-row-separator");
      return `${start}${repaired}${end}`;
    }
  );

  return { repaired: value, fixes: [...new Set(fixes)] };
}
