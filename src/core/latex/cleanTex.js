/**
 * cleanTex.js
 * Čištění LaTeX textu od Word artefaktů a normalizace vstupu.
 * @module core/latex/cleanTex
 */

import { knownCommands } from "../utils/knownCommands.js";
import { heuristicFix } from "./heuristicFix.js";

/**
 * Fallback funkce pro TeX - odstraní problematické příkazy
 * @param {string} tex - LaTeX string
 * @returns {string} zjednodušený LaTeX
 */
export function fallbackTex(tex) {
  return String(tex || "")
    .replace(/\\left\s*/g, "")
    .replace(/\\right\s*/g, "");
}

/**
 * Čistí LaTeX text od Word artefaktů a normalizuje vstup
 * Vrací čištěný text a seznam chráněných bloků
 * @param {string} tex - LaTeX string
 * @returns {{ cleaned: string, protectedBlocks: string[] }} čištěný text a chráněné bloky
 */
export function cleanTex(tex) {
  const original = String(tex || "");

  // Ověř, že se jedná o validní LaTeX - nikdy ho nepřepsat
  try {
    if (typeof window !== "undefined" && typeof katex !== "undefined") {
      katex.renderToString(original.trim(), {
        throwOnError: true,
        strict: "ignore",
      });
      return { cleaned: original.trim(), protectedBlocks: [] };
    }
  } catch (_) {
    /* Pokračuj s repair vrstvami pro nevalidní vstup */
  }

  const protectedText = [];
  let value = String(tex || "")
    .replace(/\r/g, "")
    .replace(/^\s+|\s+$/g, "");

  // Chraň \text{...} bloky
  value = value.replace(/\\text\{([^{}]*)\}/g, (match) => {
    const index = protectedText.push(match) - 1;
    return `@@TEXT_BLOCK_${index}@@`;
  });

  // Normalizace a základní opravy
  value = value
    .replace(/\n\s*/g, " ")
    .replace(
      /\\(mathbb|mathbf|mathrm|mathcal|mathsf)\s+([A-Za-z])/g,
      "\\$1{$2}",
    )
    .replace(/\\left\s*\{/g, "\\left\\{")
    .replace(/\\right\s*\}/g, "\\right\\}")
    .replace(
      /\\left\\lfloor([\s\S]*?)\\right\\rceil/g,
      "\\left\\lfloor$1\\right\\rfloor",
    )
    .replace(
      /\\left\\lceil([\s\S]*?)\\right\\rfloor/g,
      "\\left\\lceil$1\\right\\rceil",
    )
    .replace(
      /\\left\\lfloor([\s\S]*?)\\right\\lceil/g,
      "\\left\\lfloor$1\\right\\rfloor",
    )
    .replace(
      /\\left\\lceil([\s\S]*?)\\right\\lfloor/g,
      "\\left\\lceil$1\\right\\rceil",
    )
    .replace(/;\|;/g, "\\;\\middle|\\;")
    .replace(
      /\\(rightarrow|leftarrow|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|uparrow|downarrow|Uparrow|Downarrow|approx|sim|equiv|subset|supset|subseteq|supseteq|gg|ll|lesssim|gtrsim|not|det|implies|iff|to|in|notin|parallel|forall|exists|emptyset)([A-Za-z0-9])/g,
      "\\$1 $2",
    )
    .replace(
      /\\(longrightarrow|longleftarrow|longleftrightarrow|xrightarrow|xleftarrow|xleftrightarrow|rightarrow|leftarrow|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|approx|sim|equiv|subset|supset|subseteq|supseteq|gg|ll|lesssim|gtrsim|not|det|implies|iff|to|in|notin|parallel|forall|exists|emptyset|le|ge|ne|lfloor|rfloor|lceil|rceil|odot|star|circ|deg|gcd|zeta|chi)([A-Z][A-Za-z0-9_]+)/g,
      "\\$1 $2",
    )
    .replace(
      /\\([A-Za-z]+)([A-Z][A-Za-z0-9_]+)/g,
      (_, name, tail) => `\\${name} ${tail}`,
    )
    .replace(/\\pk\b/g, "\\mathrm{pk}")
    .replace(
      /\(\s*([-+]?\d+(?:\.\d+)?)\s*\\\s*([-+]?\d+(?:\.\d+)?)\s*\)/g,
      (_, top, bottom) => `\\begin{pmatrix}${top}\\\\${bottom}\\end{pmatrix}`,
    )
    .replace(/[""„]/g, '"')
    .replace(/['']/g, "'")
    .replace(/\*\*/g, "");

  // Opravy Word copy/paste šumu
  value = value.replace(
    /(\\begin\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\}[\s\S]*?)(\\)([0-9])/g,
    "$1\\\\$3",
  );
  value = value.replace(/(?<!\\)\\([0-9])/g, "$1");
  value = value.replace(/\\([A-Za-z])(?=(_|\d|\{|\^))/g, (_, char) => char);
  value = value.replace(/\\([A-Za-z])(?=\s*&)/g, "$1");

  value = value.replace(/\\([A-Za-z])(?=\\|\s|[&+={])/g, (match, char) =>
    knownCommands.has(char) ? match : char,
  );

  value = value.replace(/\\(?=[/-])/g, "");
  value = value.replace(/\\([A-Za-z]+)(?=[A-Za-z0-9])/g, (match, name) =>
    knownCommands.has(name) ? `\\${name} ` : match,
  );
  value = value.replace(/\\([A-Za-z]+)(?=[A-Z])/g, (match, name) =>
    knownCommands.has(name) ? `\\${name} ` : match,
  );
  value = value.replace(
    /\\([A-Za-z]+)\s*([A-Z][A-Za-z0-9_]*)/g,
    (match, name, tail) =>
      knownCommands.has(name) ? `\\${name} ${tail}` : match,
  );

  value = value.replace(/#\s*\{([^{}]*)\}/g, "\\{$1\\}");
  value = value.replace(/([^\\])#([^=])/g, "$1\\#$2");
  value = value.replace(
    /\\right\b(?!\s*(?:[)\]}|]|\\(?:\}|rangle|rfloor|rceil)))/g,
    "",
  );
  value = value.replace(
    /\\left\\\{([\s\S]*?)(?<!\\)\}/g,
    "\\left\\{$1\\right\\}",
  );
  value = value.replace(
    /\\left\\lfloor([\s\S]*?)\\rfloor/g,
    "\\left\\lfloor$1\\right\\rfloor",
  );
  value = value.replace(
    /\\left\\lceil([\s\S]*?)\\rceil/g,
    "\\left\\lceil$1\\right\\rceil",
  );

  value = value.replace(/(?<!\\)([A-Za-z])\s+([A-Za-z])/g, "$1$2");
  value = value.replace(/(?<!\\)\\([A-Za-z])(?![A-Za-z])/g, "$1");
  value = value.replace(/\\-/g, "-");
  value = value.replace(/\\\\+/g, "\\\\");
  value = value.replace(
    /(\\begin\{(?:p|b|B|v|V)matrix\})(\d+)-(\d+)(\\end\{(?:p|b|B|v|V)matrix\})/g,
    "$1$2\\\\-$3$4",
  );
  value = value.replace(
    /(\\begin\{(?:p|b|B|v|V)matrix\})([A-Za-z])_(\d+)([A-Za-z])_(\d+)(\\end\{(?:p|b|B|v|V)matrix\})/g,
    "$1$2_$3\\\\$4_$5$6",
  );
  value = value.replace(
    /([^\\])\\{2}end\{((?:p|b|B|v|V)matrix)\}/g,
    "$1\\\\\\end{$2}",
  );

  const commandNames = [...knownCommands].sort(
    (left, right) => right.length - left.length,
  );
  value = value.replace(/\\([A-Za-z]+)/g, (match, token) => {
    const command = commandNames.find((name) => token.startsWith(name));
    return command
      ? `\\${command}${token.slice(command.length) ? ` ${token.slice(command.length)}` : ""}`
      : match;
  });

  let cleaned = value
    .replace(/\s{2,}/g, " ")
    .replace(/\s*([{}()=+\-*/^_|,;:<>])\s*/g, "$1")
    .replace(/\s*\\\s*\*/g, "\\times");

  const squareBalance =
    (cleaned.match(/\[/g) || []).length - (cleaned.match(/\]/g) || []).length;
  if (squareBalance > 0) cleaned += "]".repeat(squareBalance);

  const braceBalance =
    (cleaned.match(/{/g) || []).length - (cleaned.match(/}/g) || []).length;
  if (braceBalance > 0) cleaned += "}".repeat(braceBalance);

  cleaned = cleaned.replace(
    /@@TEXT_BLOCK_(\d+)@@/g,
    (_, index) => protectedText[Number(index)] || "",
  );

  return { cleaned, protectedBlocks: protectedText };
}
