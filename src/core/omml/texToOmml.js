/**
 * texToOmml.js
 * Konverze LaTeX zápisu na OMML (Office Math Markup Language) pro Word.
 * Rekurzivní parser podporující zlomky, odmocniny, matice, indexy, symboly a operátory.
 * @module core/omml/texToOmml
 */

import { mathRun } from "./xmlBuilder.js";
import { cleanTex } from "../latex/cleanTex.js";
import { heuristicFix } from "../latex/heuristicFix.js";
import { symbols, operators } from "../utils/knownCommands.js";

/**
 * Konvertuje LaTeX string na OMML XML fragment (obsah <m:oMath>).
 * @param {string} input - LaTeX zápis
 * @returns {string} OMML XML fragment
 */
export function texToOmml(input) {
  const { cleaned } = cleanTex(input);
  const { repaired } = heuristicFix(cleaned);
  const s = repaired;
  let i = 0;
  // Ochrana parseru proti nevalidnímu nebo extrémně složitému vstupu.
  const maxSteps = Math.max(1000, s.length * 50);
  let steps = 0;
  const skip = () => {
    while (/\s/.test(s[i] || "")) i++;
  };
  // LaTeX povoluje \mathbf{x} i \mathbf x. Bez závorek je nutné spotřebovat
  // právě jeden atom, jinak by se následující =… nesprávně stalo tučným.
  const group = (variant = "") => {
    skip();
    if (s[i] === "{") {
      i++;
      const value = sequence("}", variant);
      if (s[i] === "}") i++;
      return value;
    }
    if (s[i] === "\\") return item(variant);
    const char = s[i++] || "";
    return script(mathRun(char, variant), variant);
  };
  const script = (base, variant) => {
    skip();
    let sub = "",
      sup = "";
    while (s[i] === "^" || s[i] === "_") {
      const what = s[i++];
      const value = group(variant);
      if (what === "^") sup = value;
      else sub = value;
      skip();
    }
    if (sub && sup)
      return `<m:sSubSup><m:e>${base}</m:e><m:sub>${sub}</m:sub><m:sup>${sup}</m:sup></m:sSubSup>`;
    if (sub) return `<m:sSub><m:e>${base}</m:e><m:sub>${sub}</m:sub></m:sSub>`;
    if (sup) return `<m:sSup><m:e>${base}</m:e><m:sup>${sup}</m:sup></m:sSup>`;
    return base;
  };
  const command = (variant) => {
    i++;
    if (s[i] === "\\") {
      i++;
      return mathRun("; ", variant);
    }
    const match = s.slice(i).match(/^[A-Za-z]+/);
    const name = match ? match[0] : s[i++] || "";
    i += match ? name.length : 0;
    if (name === "frac" || name === "dfrac" || name === "tfrac") {
      const n = group(variant),
        d = group(variant);
      return `<m:f><m:num>${n}</m:num><m:den>${d}</m:den></m:f>`;
    }
    if (name === "binom") {
      const n = group(variant),
        k = group(variant);
      return `<m:d><m:dPr><m:begChr m:val="("/><m:endChr m:val=")"/></m:dPr><m:e><m:f><m:num>${n}</m:num><m:den>${k}</m:den></m:f></m:e></m:d>`;
    }
    if (name === "sqrt") {
      const value = group(variant);
      return `<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>${value}</m:e></m:rad>`;
    }
    if (name === "boxed") {
      const value = group(variant);
      return `<m:borderBox><m:borderBoxPr><m:hideTop m:val="0"/><m:hideBot m:val="0"/><m:hideLeft m:val="0"/><m:hideRight m:val="0"/></m:borderBoxPr><m:e>${value}</m:e></m:borderBox>`;
    }
    if (name === "vec") {
      const value = group(variant);
      return `<m:acc><m:accPr><m:chr m:val="→"/></m:accPr><m:e>${value}</m:e></m:acc>`;
    }
    if (name === "begin") {
      skip();
      if (s[i] !== "{") return mathRun("\\begin", "roman");
      i++;
      const envEnd = s.indexOf("}", i);
      if (envEnd < 0) {
        i = s.length;
        return mathRun("\\begin", "roman");
      }
      const env = s.slice(i, envEnd);
      i = envEnd + 1;
      const close = `\\end{${env}}`;
      const closeAt = s.indexOf(close, i);
      if (closeAt < 0) return mathRun("\\begin{" + env + "}", "roman");
      const body = s.slice(i, closeAt);
      i = closeAt + close.length;
      const brackets = {
        pmatrix: ["(", ")"],
        bmatrix: ["[", "]"],
        Bmatrix: ["{", "}"],
        vmatrix: ["|", "|"],
        Vmatrix: ["∥", "∥"],
        array: ["[", "]"],
        cases: ["{", ""],
      }[env];
      if (!brackets) return mathRun("\\begin{" + env + "}", "roman");
      const rawRows = body.split(/\\\\/);
      const columnCount = Math.max(1, ...rawRows.map((row) => row.split("&").length));
      const columns = Array.from(
        { length: columnCount },
        () => '<m:mc><m:mcPr><m:count m:val="1"/></m:mcPr></m:mc>'
      ).join("");
      const rows = rawRows
        .map(
          (row) =>
            `<m:mr>${row
              .split("&")
              .map((cell) => `<m:e>${texToOmml(cell)}</m:e>`)
              .join("")}</m:mr>`
        )
        .join("");
      return `<m:d><m:dPr><m:begChr m:val="${brackets[0]}"/><m:endChr m:val="${brackets[1]}"/></m:dPr><m:e><m:m><m:mPr><m:baseJc m:val="center"/><m:plcHide m:val="1"/><m:mcs>${columns}</m:mcs></m:mPr>${rows}</m:m></m:e></m:d>`;
    }
    if (["mathbf", "boldsymbol", "bm", "textbf"].includes(name)) return group("bold");
    if (["mathrm", "textrm", "operatorname", "texttt"].includes(name)) return group("roman");
    if (["text", "textit"].includes(name)) return group("text");
    if (name === "mathbb") return group("double");
    if (name === "mathcal") return group("script");
    if (name === "mathsf") return group("roman");
    if (name === "hat") {
      const value = group(variant);
      return `<m:acc><m:accPr><m:chr m:val="^"/></m:accPr><m:e>${value}</m:e></m:acc>`;
    }
    if (["widehat", "widetilde", "tilde"].includes(name)) {
      const value = group(variant);
      return `<m:acc><m:accPr><m:chr m:val="${name === "tilde" || name === "widetilde" ? "~" : "^"}"/></m:accPr><m:e>${value}</m:e></m:acc>`;
    }
    if (["overset", "stackrel"].includes(name)) {
      const base = group(variant);
      const top = group(variant);
      return (base || "") + (top || "");
    }
    if (["underbrace", "overbrace"].includes(name)) {
      const base = group(variant);
      const label = group(variant);
      return base + label;
    }
    if (["xrightarrow", "xleftarrow", "xleftrightarrow"].includes(name)) {
      const label = group(variant);
      const base = group(variant);
      return base || label || mathRun("→", variant);
    }
    if (["longrightarrow", "longleftarrow", "longleftrightarrow"].includes(name))
      return mathRun(
        { longrightarrow: "⟶", longleftarrow: "⟵", longleftrightarrow: "⟷" }[name],
        variant
      );
    if (["lfloor", "lceil"].includes(name))
      return mathRun({ lfloor: "⌊", lceil: "⌈" }[name], variant);
    if (["rfloor", "rceil"].includes(name))
      return mathRun({ rfloor: "⌋", rceil: "⌉" }[name], variant);
    if (name === "substack") return group(variant);
    if (["star", "ast"].includes(name)) return mathRun("⋆", variant);
    if (name === "circ") return mathRun("∘", variant);
    if (name === "pk") return mathRun("pk", "roman");
    if (name === "{" || name === "}") return mathRun(name, variant);
    if (
      name === "left" ||
      name === "right" ||
      name === "middle" ||
      name === "big" ||
      name === "Big" ||
      name === "bigl" ||
      name === "bigr"
    )
      return "";
    if (name === "not") return mathRun("¬", variant) + item(variant);
    if (name === "pmod") return mathRun("mod ", "roman") + group("roman");
    if (name === "mod" || name === "bmod") return mathRun(" mod ", "roman");
    if (name === "quad") return mathRun("    ", variant);
    if (name === "qquad") return mathRun("        ", variant);
    if (["le", "ge", "ne"].includes(name))
      return mathRun({ le: "≤", ge: "≥", ne: "≠" }[name], variant);
    if (["sup", "cap", "cup"].includes(name))
      return mathRun({ sup: "sup", cap: "∩", cup: "∪" }[name], name === "sup" ? "roman" : variant);
    if (
      ["perp", "bullet", "mapsto", "Longrightarrow", "longmapsto", "diagdown", "diagup"].includes(
        name
      )
    )
      return mathRun(
        {
          perp: "⊥",
          bullet: "•",
          mapsto: "↦",
          Longrightarrow: "⟹",
          longmapsto: "⟼",
          diagdown: "╲",
          diagup: "╱",
        }[name],
        variant
      );
    if (name === "cdots" || name === "dots" || name === "ldots") return mathRun("…", variant);
    if (name === "vdots") return mathRun("⋮", variant);
    if (name === "ddots") return mathRun("⋯", variant);
    if (name === "ell") return mathRun("ℓ", variant);
    if (["det", "Pr", "vol", "ker", "dim", "deg", "gcd", "ord"].includes(name))
      return mathRun(name, "roman");
    if (symbols[name]) return mathRun(symbols[name], variant);
    if (operators[name])
      return mathRun(
        operators[name],
        name === "lim" ||
          /^(log|ln|sin|cos|tan|max|min|arg|det|Pr|vol|ker|dim|deg|gcd|ord)$/.test(name)
          ? "roman"
          : variant
      );
    if (name === " " || name === "," || name === ";" || name === ":" || name === "!")
      return mathRun(" ", variant);
    return mathRun("\\" + name, "roman");
  };
  const item = (variant = "") => {
    if (++steps > maxSteps) {
      i = s.length;
      return mathRun("[neplatny nebo příliš složitý zápis]", "roman");
    }
    skip();
    if (i >= s.length || s[i] === "}") return "";
    let base;
    if (s[i] === "{") {
      i++;
      base = sequence("}", variant);
      if (s[i] === "}") i++;
    } else if (s[i] === "\\") base = command(variant);
    else {
      let text = "";
      while (i < s.length && !/[\\{}^_]/.test(s[i])) text += s[i++];
      base = mathRun(text, variant);
    }
    return script(base, variant);
  };
  const sequence = (end = "", variant = "") => {
    let out = "";
    while (i < s.length && (!end || s[i] !== end)) out += item(variant);
    return out;
  };
  return sequence();
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
