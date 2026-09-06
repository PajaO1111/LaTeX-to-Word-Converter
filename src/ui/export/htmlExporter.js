/**
 * htmlExporter.js
 * Export zpracovaného dokumentu (editor nebo nahraný DOCX) do samostatného HTML.
 * @module ui/export/htmlExporter
 */

import { cleanTex, fallbackTex } from "../../core/latex/cleanTex.js";
import { heuristicFix } from "../../core/latex/heuristicFix.js";
import {
  blockFormula,
  blockStart,
  environmentStart,
  environmentEnd,
  isStandaloneTex,
} from "../../core/latex/blockDetector.js";
import { xmlParagraphText } from "../../core/utils/xmlNamespaces.js";
import { getEditorBlocks } from "../editor/editorInput.js";

/** Vyčistí a opraví LaTeX na finální řetězec (spojuje cleanTex + heuristicFix). */
function fullCleanTex(tex) {
  return heuristicFix(cleanTex(tex).cleaned).repaired;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Vykreslí LaTeX zápis do MathML pomocí KaTeX; při selhání zkusí fallback
 * bez \left/\right a nakonec vrátí buď holý text (neplatný zápis), nebo chybu.
 * @param {string} tex - LaTeX zápis
 * @param {Set<string>} invalidTexes - množina zápisů, které se mají zobrazit jako text
 * @returns {string} HTML fragment
 */
export function renderHtmlFormula(tex, invalidTexes = new Set()) {
  const value = fullCleanTex(tex);
  if (invalidTexes.has(value)) return escapeHtml(tex);
  try {
    return katex.renderToString(value, {
      displayMode: true,
      output: "mathml",
      throwOnError: true,
      strict: "ignore",
    });
  } catch {
    const fallback = fallbackTex(value);
    try {
      return katex.renderToString(fallback, {
        displayMode: true,
        output: "mathml",
        throwOnError: true,
        strict: "ignore",
      });
    } catch (error) {
      return `<span class="formula-error">${escapeHtml(error.message)}</span>`;
    }
  }
}

/** Rozdělí inline text (\( … \), $ … $) na escapovaný text a MathML rovnice. */
function splitHtmlInline(text, style = {}, invalidTexes = new Set(), convertInline = true) {
  if (!convertInline) return escapeHtml(text);
  const rx = /\\\(([^\n]*?)\\\)|\$([^$\n]+)\$/g;
  let out = "";
  let cursor = 0;
  for (const match of text.matchAll(rx)) {
    out += escapeHtml(text.slice(cursor, match.index));
    const tex = fullCleanTex(match[1] || match[2]);
    if (invalidTexes.has(tex)) out += escapeHtml(match[0]);
    else out += renderHtmlFormula(tex, invalidTexes);
    cursor = match.index + match[0].length;
  }
  out += escapeHtml(text.slice(cursor));
  if (style.bold) out = `<strong>${out}</strong>`;
  if (style.italic) out = `<em>${out}</em>`;
  if (style.underline) out = `<u>${out}</u>`;
  return out;
}

/** Rekurzivně převede DOM uzel editoru na HTML (zachová b/i/u, převede text). */
function htmlTextRuns(node, style = {}, invalidTexes = new Set(), convertInline = true) {
  if (node.nodeType === Node.TEXT_NODE)
    return splitHtmlInline(node.nodeValue, style, invalidTexes, convertInline);
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const tag = node.tagName.toLowerCase();
  if (tag === "br") return "<br>";
  const next = {
    ...style,
    bold: style.bold || tag === "b" || tag === "strong",
    italic: style.italic || tag === "i" || tag === "em",
    underline: style.underline || tag === "u",
  };
  const content = [...node.childNodes]
    .map((child) => htmlTextRuns(child, next, invalidTexes, convertInline))
    .join("");
  if (tag === "strong" || tag === "b") return `<strong>${content}</strong>`;
  if (tag === "em" || tag === "i") return `<em>${content}</em>`;
  if (tag === "u") return `<u>${content}</u>`;
  return content;
}

/**
 * Sestaví <body> obsah HTML exportu z editoru nebo nahraného DOCX.
 * @param {HTMLElement|null} editorElement - contenteditable editor (pokud se nepoužívá DOCX)
 * @param {string|null} documentXml - obsah word/document.xml, pokud je nahraný DOCX
 * @param {Set<string>} invalidTexes - množina neplatných zápisů
 * @param {boolean} convertInline - zda převádět i inline \( … \) a $ … $
 * @returns {string} HTML fragment pro vložení do <main>
 */
export function createHtmlFromEditor(
  editorElement,
  documentXml,
  invalidTexes = new Set(),
  convertInline = true
) {
  const blocks = documentXml
    ? xmlParagraphText(documentXml)
        .split("\n")
        .map((text) => ({ tag: "p", node: document.createTextNode(text), text }))
    : getEditorBlocks(editorElement);
  let body = "";
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.tag === "table") {
      const rows = [...block.node.rows]
        .map(
          (row) =>
            `<tr>${[...row.cells]
              .map(
                (cell) =>
                  `<td>${[...cell.childNodes]
                    .map((node) => htmlTextRuns(node, {}, invalidTexes, convertInline))
                    .join("")}</td>`
              )
              .join("")}</tr>`
        )
        .join("");
      body += `<table>${rows}</table>`;
      continue;
    }
    const environment = environmentStart(block.text);
    if (environment) {
      let tex = block.text;
      let end = -1;
      for (let k = i + 1; k < blocks.length && k < i + 50; k++) {
        tex += "\n" + blocks[k].text;
        if (environmentEnd(blocks[k].text, environment)) {
          end = k;
          break;
        }
      }
      if (end >= 0) {
        body += `<div class="equation-render">${renderHtmlFormula(tex, invalidTexes)}</div>`;
        i = end;
        continue;
      }
    }
    const blockMatch = blockFormula(block.text);
    if (blockMatch) {
      body += `<div class="equation-render">${renderHtmlFormula(blockMatch[1], invalidTexes)}</div>`;
      continue;
    }
    const escaped = blockStart(block.text);
    if (escaped !== null) {
      const ending = escaped ? /^\s*\\\]\s*$/ : /^\s*\]\s*$/;
      let tex = "";
      let end = -1;
      for (let k = i + 1; k < blocks.length && k < i + 50; k++) {
        if (ending.test(blocks[k].text)) {
          end = k;
          break;
        }
        tex += (tex ? "\n" : "") + blocks[k].text;
      }
      if (end > i) {
        body += `<div class="equation-render">${renderHtmlFormula(tex, invalidTexes)}</div>`;
        i = end;
        continue;
      }
    }
    // Stejná detekce jako u DOCX exportu, jinak "holé" LaTeX řádky zůstanou nepřevedené.
    if (isStandaloneTex(block.text)) {
      body += `<div class="equation-render">${renderHtmlFormula(block.text, invalidTexes)}</div>`;
      continue;
    }
    const tag = /^h[1-3]$/.test(block.tag) ? block.tag : "p";
    const content =
      block.node.nodeType === Node.TEXT_NODE
        ? splitHtmlInline(block.text, {}, invalidTexes, convertInline)
        : [...block.node.childNodes]
            .map((node) => htmlTextRuns(node, {}, invalidTexes, convertInline))
            .join("");
    body += `<${tag}>${content || escapeHtml(block.text)}</${tag}>`;
  }
  return body || "<p></p>";
}

/** Vrátí CSS pravidla KaTeX stylesheetu vloženého na stránce (pro offline export). */
export function getKatexCss() {
  for (const styleSheet of document.styleSheets) {
    if (!styleSheet.href || !/katex(?:\.min)?\.css(?:$|\?)/i.test(styleSheet.href)) continue;
    try {
      return Array.from(styleSheet.cssRules, (rule) => rule.cssText).join("\n");
    } catch {
      return "";
    }
  }
  return "";
}

/**
 * Sestaví kompletní HTML dokument (včetně KaTeX CSS) pro export.
 * @param {string} bodyHtml - obsah <main> vygenerovaný createHtmlFromEditor
 * @returns {string} celý HTML dokument
 */
export function buildHtmlDocument(bodyHtml) {
  const katexCss = getKatexCss();
  return `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <title>LaTeX → HTML export</title>
  <style>${katexCss}</style>
  <style>
    body { font-family: "Segoe UI", system-ui, sans-serif; margin: 2rem; color: #17202a; background: #f4f7fa; }
    p, h1, h2, h3, table, .equation-render { margin: 0 0 1rem; }
    table { border-collapse: collapse; }
    td { border: 1px solid #d9e1e8; padding: 0.5rem 0.75rem; }
    .equation-render { background: #fbfdff; border: 1px solid #d9e1e8; border-radius: 8px; padding: 1.25rem; overflow-x: auto; }
    .formula-error { color: #b42318; font-weight: 600; }
  </style>
</head>
<body>
  <h1>LaTeX do HTML</h1>
  <main>${bodyHtml}</main>
</body>
</html>`;
}

/**
 * Vygeneruje a stáhne HTML export.
 * @param {string} htmlDocument - kompletní HTML dokument
 * @param {string} filename - název souboru
 */
export function downloadHtml(htmlDocument, filename = "latex-rovnice.html") {
  const blob = new Blob(["\uFEFF", htmlDocument], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

