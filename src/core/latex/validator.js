/**
 * validator.js
 * Validace struktury a obsahu LaTeX formulí.
 * @module core/latex/validator
 */

import { knownCommands } from "../utils/knownCommands.js";

/**
 * Validuje strukturu LaTeX - párování závorek, prostředí, příkazy
 * @param {string} tex - LaTeX string k validaci
 * @returns {{ ok: boolean, reason?: string }} validační výsledek
 */
export function validateLatexStructure(tex) {
  const value = String(tex || "");
  if (value.length > 100000)
    return { ok: false, reason: "Zápis je příliš dlouhý." };

  const stack = [];
  const pairs = {
    "(": ")",
    "[": "]",
    "{": "}",
    "|": "|",
    "\\{": "\\}",
    "\\langle": "\\rangle",
    "\\lfloor": "\\rfloor",
    "\\lceil": "\\rceil",
  };

  const delimiter = (text) =>
    text.match(
      /^\s*(\[|\]|\(|\)|\{|\}|\||\\(?:\{|\}|\||langle|rangle|lfloor|rfloor|lceil|rceil))/,
    );

  for (let index = 0; index < value.length; index++) {
    if (value[index] === "\\" && value[index + 1] === "\\") {
      index++;
      continue;
    }

    if (value[index] === "\\") {
      const command = value.slice(index + 1).match(/^[A-Za-z]+/);
      if (command) {
        const name = command[0];
        index += name.length;
        if (["left", "right"].includes(name)) {
          const found = delimiter(value.slice(index + 1));
          if (!found) {
            if (name === "right")
              return { ok: false, reason: "Příkaz \\right nemá delimitér." };
            continue;
          }
          const token = found[1].replace(/\s/g, "");
          index += found[0].length;
          if (name === "left") stack.push({ token, close: pairs[token] });
          else if (!stack.length)
            return { ok: false, reason: "Osamocený příkaz \\right." };
          else if (stack.pop().close !== token)
            return {
              ok: false,
              reason: "Nesprávně spárované \\left/\\right delimitery.",
            };
        }
        continue;
      }
    }

    if ("{[(".includes(value[index]))
      stack.push({
        token: value[index],
        close: { "{": "}", "[": "]", "(": ")" }[value[index]],
      });

    if ("}])".includes(value[index])) {
      const expected = { "}": "{", "]": "[", ")": "(" }[value[index]];
      if (!stack.length || stack.pop().close !== value[index])
        return { ok: false, reason: "Nesprávně spárované závorky." };
    }
  }

  if (stack.length)
    return { ok: false, reason: "Neuzavřená závorka nebo delimitér." };

  const environments = [...value.matchAll(/\\begin\{([^}]+)\}/g)].map(
    (match) => match[1],
  );
  for (const env of environments)
    if (!new RegExp(`\\\\end\\{${env}\\}`).test(value))
      return { ok: false, reason: `Neuzavřené prostředí \\begin{${env}}.` };

  const unknown = [...value.matchAll(/(?<!\\)\\([A-Za-z]+)/g)]
    .map((match) => match[1])
    .filter((name) => !knownCommands.has(name));

  if (unknown.length)
    return {
      ok: false,
      reason: `Neznámý příkaz: ${[...new Set(unknown)].map((name) => "\\" + name).join(", ")}.`,
    };

  return { ok: true };
}

/**
 * Validuje formuli pomocí struktury a KaTeX
 * @param {string} tex - LaTeX string k validaci
 * @returns {{ ok: boolean, mode?: string, reason?: string }} validační výsledek
 */
export function validateFormula(tex) {
  const structure = validateLatexStructure(tex);
  if (!structure.ok) return structure;

  try {
    if (typeof window !== "undefined" && typeof katex !== "undefined") {
      katex.renderToString(tex, { throwOnError: true, strict: "ignore" });
      return { ok: true, mode: "direct" };
    }
    // V node.js prostředí předpokládáme platnost
    return { ok: true, mode: "direct" };
  } catch (error) {
    return { ok: false, reason: "KaTeX: " + error.message };
  }
}

/**
 * Validuje formuli s fallback mechanismem
 * @param {string} tex - LaTeX string
 * @param {Function} fallbackTex - funkce pro vytvoření fallback verze
 * @returns {{ ok: boolean, mode?: string, fallbackTex?: string, reason?: string }}
 */
export function validateFormulaWithFallback(tex, fallbackTex) {
  const direct = validateFormula(tex);
  if (direct.ok) return direct;

  const fb = fallbackTex(tex);
  if (fb !== tex) {
    const result = validateFormula(fb);
    if (result.ok)
      return {
        ok: true,
        mode: "fallback",
        fallbackTex: fb,
        reason: direct.reason,
      };
  }

  return { ok: false, mode: "failed", reason: direct.reason };
}
