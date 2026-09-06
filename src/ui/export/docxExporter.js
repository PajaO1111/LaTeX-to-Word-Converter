/**
 * docxExporter.js
 * Export zpracovaného dokumentu (editor nebo nahraný DOCX) do DOCX s OMML rovnicemi.
 * @module ui/export/docxExporter
 */

import { local } from "../../core/utils/escapeXml.js";
import { wordRun } from "../../core/omml/xmlBuilder.js";
import { texToOmml } from "../../core/omml/texToOmml.js";
import { cleanTex } from "../../core/latex/cleanTex.js";
import { heuristicFix } from "../../core/latex/heuristicFix.js";
import {
  blockFormula,
  blockStart,
  environmentStart,
  environmentEnd,
  isStandaloneTex,
} from "../../core/latex/blockDetector.js";
import { W, M, hasXmlError, paragraphText } from "../../core/utils/xmlNamespaces.js";
import { getEditorBlocks } from "../editor/editorInput.js";

/**
 * Vyčistí a opraví LaTeX na finální řetězec (spojuje cleanTex + heuristicFix).
 * @param {string} tex - LaTeX zápis
 * @returns {string} vyčištěný LaTeX
 */
function fullCleanTex(tex) {
  return heuristicFix(cleanTex(tex).cleaned).repaired;
}

/** Vytvoří runy Wordu z textu (alias pro sdílenou wordRun z xmlBuilder). */
function runXml(text, style = {}) {
  return wordRun(text, style);
}

/**
 * Rozdělí inline text na běžné runy a OMML rovnice (\( … \) nebo $ … $).
 * @param {string} text - text odstavce
 * @param {Object} style - formátovací příznaky (bold/italic/underline)
 * @param {Set<string>} invalidTexes - množina neplatných zápisů (text, ne rovnice)
 * @param {boolean} convertInline - zda vůbec hledat inline zápisy
 * @returns {string} Word XML runy
 */
function splitInline(text, style, invalidTexes = new Set(), convertInline = true) {
  if (!convertInline) return runXml(text, style);
  let out = "",
    cursor = 0;
  const rx = /\\\(([\s\S]*?)\\\)|\$([^$\n]+)\$/g;
  for (const match of text.matchAll(rx)) {
    const tex = fullCleanTex(match[1] || match[2]);
    if (invalidTexes.has(tex)) continue;
    out += runXml(text.slice(cursor, match.index), style);
    out += `<m:oMath>${texToOmml(tex)}</m:oMath>`;
    cursor = match.index + match[0].length;
  }
  return out + runXml(text.slice(cursor), style);
}

/** Rekurzivně převede DOM uzel editoru (b/i/u/br/text) na Word XML runy. */
function htmlRuns(node, style = {}, invalidTexes = new Set(), convertInline = true) {
  if (node.nodeType === Node.TEXT_NODE)
    return splitInline(node.nodeValue, style, invalidTexes, convertInline);
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const tag = node.tagName.toLowerCase();
  const next = {
    ...style,
    bold: style.bold || tag === "b" || tag === "strong",
    italic: style.italic || tag === "i" || tag === "em",
    underline: style.underline || tag === "u",
  };
  if (tag === "br") return "<w:r><w:br/></w:r>";
  return [...node.childNodes]
    .map((child) => htmlRuns(child, next, invalidTexes, convertInline))
    .join("");
}

/**
 * Vytvoří odstavec s Office Math rovnicí (m:oMathPara).
 * @param {string} tex - LaTeX zápis
 * @param {string} pPr - volitelné XML vlastností odstavce
 * @returns {string} Word XML odstavce
 */
export function equationPara(tex, pPr = "") {
  return `<w:p>${pPr || '<w:pPr><w:jc w:val="center"/></w:pPr>'}<m:oMathPara><m:oMath>${texToOmml(tex)}</m:oMath></m:oMathPara></w:p>`;
}

/** Sestaví odstavec z bloku editoru (rovnice, nebo běžný text/nadpis/seznam). */
function editorPara(block, invalidTexes, convertInline) {
  const tag = block.tag;
  const text = block.text || "";
  const formula = blockFormula(text);
  if (formula)
    return invalidTexes.has(fullCleanTex(formula[1]))
      ? `<w:p>${runXml(formula[1])}</w:p>`
      : equationPara(formula[1]);
  if (isStandaloneTex(text))
    return invalidTexes.has(fullCleanTex(text))
      ? `<w:p>${runXml(text)}</w:p>`
      : equationPara(text);
  const heading = /^h[1-3]$/.test(tag)
    ? `<w:pPr><w:pStyle w:val="Heading${tag[1]}"/></w:pPr>`
    : tag === "li"
      ? '<w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>'
      : "";
  const prefix = tag === "li" ? runXml("• ") : "";
  return `<w:p>${heading}${prefix}${
    block.node.nodeType === Node.TEXT_NODE
      ? splitInline(text, {}, invalidTexes, convertInline)
      : [...block.node.childNodes]
          .map((n) => htmlRuns(n, {}, invalidTexes, convertInline))
          .join("") || runXml(text)
  }</w:p>`;
}

/** Sestaví Word tabulku z DOM <table> elementu. */
function tableXml(table) {
  const rows = [...table.rows]
    .map(
      (row) =>
        `<w:tr>${[...row.cells]
          .map(
            (cell) =>
              `<w:tc><w:tcPr><w:tcW w:w="2800" w:type="dxa"/></w:tcPr><w:p>${
                [...cell.childNodes].map((n) => htmlRuns(n)).join("") || runXml(cell.innerText)
              }</w:p></w:tc>`
          )
          .join("")}</w:tr>`
    )
    .join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="B7C4D1"/><w:left w:val="single" w:sz="4" w:color="B7C4D1"/><w:bottom w:val="single" w:sz="4" w:color="B7C4D1"/><w:right w:val="single" w:sz="4" w:color="B7C4D1"/><w:insideH w:val="single" w:sz="4" w:color="D9E1E8"/><w:insideV w:val="single" w:sz="4" w:color="D9E1E8"/></w:tblBorders></w:tblPr>${rows}</w:tbl>`;
}

/**
 * Vytvoří nový ZIP (JSZip instanci) DOCX dokumentu z obsahu editoru.
 * @param {HTMLElement} editorElement - contenteditable element editoru
 * @param {Set<string>} invalidTexes - množina neplatných zápisů
 * @param {boolean} convertInline - zda převádět i inline \( … \) a $ … $
 * @returns {JSZip}
 */
export function createDocxFromEditor(editorElement, invalidTexes = new Set(), convertInline = true) {
  const blocks = getEditorBlocks(editorElement);
  let body = "";
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.tag === "table") {
      body += tableXml(b.node);
      continue;
    }
    const environment = environmentStart(b.text);
    if (environment) {
      let tex = b.text,
        end = -1;
      for (let k = i + 1; k < blocks.length && k < i + 50; k++) {
        tex += "\n" + blocks[k].text;
        if (environmentEnd(blocks[k].text, environment)) {
          end = k;
          break;
        }
      }
      if (end >= 0) {
        body += invalidTexes.has(fullCleanTex(tex)) ? `<w:p>${runXml(tex)}</w:p>` : equationPara(tex);
        i = end;
        continue;
      }
    }
    const escaped = blockStart(b.text);
    if (escaped !== null) {
      const ending = escaped ? /^\s*\\\]\s*$/ : /^\s*\]\s*$/;
      let tex = "",
        end = -1;
      for (let k = i + 1; k < blocks.length && k < i + 50; k++) {
        if (ending.test(blocks[k].text)) {
          end = k;
          break;
        }
        tex += (tex ? "\n" : "") + blocks[k].text;
      }
      if (end > i) {
        body += equationPara(tex);
        i = end;
        continue;
      }
    }
    body += editorPara(b, invalidTexes, convertInline);
  }
  if (!body) body = "<w:p><w:r><w:t></w:t></w:r></w:p>";
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${W}" xmlns:m="${M}"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`
  );
  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
  );
  zip.file("word/document.xml", documentXml);
  zip.file(
    "word/styles.xml",
    `<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="${W}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos" w:cs="Aptos"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style></w:styles>`
  );
  return zip;
}

/** Parsuje samostatný odstavec Word XML a ověří jeho validitu. */
function parseParagraphXml(xml) {
  const standalone = xml.replace("<w:p>", `<w:p xmlns:w="${W}" xmlns:m="${M}">`);
  const parsed = new DOMParser().parseFromString(standalone, "application/xml");
  if (hasXmlError(parsed)) throw new Error("Nelze vytvořit platný odstavec Office Math.");
  return parsed.documentElement;
}

/** Nahradí odstavec <w:p> v existujícím DOCX rovnicí. */
function replaceWithEquation(p, tex) {
  const pPr = [...p.childNodes].find((n) => local(n) === "pPr");
  const preserved = pPr
    ? new XMLSerializer().serializeToString(pPr)
    : '<w:pPr><w:jc w:val="center"/></w:pPr>';
  p.parentNode.replaceChild(
    p.ownerDocument.importNode(parseParagraphXml(equationPara(tex, preserved)), true),
    p
  );
}

/** Nahradí inline (…) zápisy uvnitř odstavce, který už obsahuje Office Math. */
function replaceInlineInExistingMathParagraph(p) {
  const rx = /\(([^()\n]*\\[A-Za-z]+[^()\n]*)\)|\(([A-Za-z](?:\s*[=<>]\s*[^()\n]+)?)\)/g;
  const runs = [...p.getElementsByTagNameNS(W, "r")];
  let changed = false;
  for (const run of runs) {
    const textNode = [...run.getElementsByTagNameNS(W, "t")][0];
    if (!textNode) continue;
    const text = textNode.textContent;
    const matches = [...text.matchAll(rx)];
    if (!matches.length) continue;
    const owner = run.parentNode;
    const fragment = p.ownerDocument.createDocumentFragment();
    const appendRun = (value) => {
      if (!value) return;
      const clone = run.cloneNode(true);
      const cloneText = [...clone.getElementsByTagNameNS(W, "t")][0];
      cloneText.textContent = value;
      fragment.appendChild(clone);
    };
    let cursor = 0;
    for (const match of matches) {
      appendRun(text.slice(cursor, match.index));
      const mathXml = `<w:p xmlns:w="${W}" xmlns:m="${M}"><m:oMath>${texToOmml(match[1] || match[2])}</m:oMath></w:p>`;
      const mathParagraph = parseParagraphXml(mathXml);
      fragment.appendChild(
        p.ownerDocument.importNode(mathParagraph.getElementsByTagNameNS(M, "oMath")[0], true)
      );
      cursor = match.index + match[0].length;
    }
    appendRun(text.slice(cursor));
    owner.replaceChild(fragment, run);
    changed = true;
  }
  return changed;
}

/** Nahradí inline (…) LaTeX zápisy v odstavci Office Math rovnicemi. */
function replaceInlineEquations(p, text, invalidTexes = new Set()) {
  if (p.getElementsByTagNameNS(M, "oMath").length) return replaceInlineInExistingMathParagraph(p);
  const rx = /\(([^()\n]*\\[A-Za-z]+[^()\n]*)\)|\(([A-Za-z](?:\s*[=<>]\s*[^()\n]+)?)\)/g;
  if (!rx.test(text)) return false;
  rx.lastIndex = 0;
  const pPr = [...p.childNodes].find((n) => local(n) === "pPr");
  const preserved = pPr ? new XMLSerializer().serializeToString(pPr) : "";
  let cursor = 0;
  let body = "";
  for (const match of text.matchAll(rx)) {
    if (invalidTexes.has(fullCleanTex(match[1] || match[2]))) continue;
    body += runXml(text.slice(cursor, match.index));
    body += `<m:oMath>${texToOmml(match[1] || match[2])}</m:oMath>`;
    cursor = match.index + match[0].length;
  }
  body += runXml(text.slice(cursor));
  const xml = `<w:p xmlns:w="${W}" xmlns:m="${M}">${preserved}${body}</w:p>`;
  p.parentNode.replaceChild(p.ownerDocument.importNode(parseParagraphXml(xml), true), p);
  return true;
}

/**
 * Transformuje word/document.xml nahraného DOCX: nahradí rozpoznané LaTeX zápisy
 * rovnicemi Office Math a zachová vše ostatní beze změny.
 * @param {string} inputXml - obsah word/document.xml
 * @param {Set<string>} invalidTexes - množina neplatných zápisů
 * @param {boolean} convertParen - zda rozpoznat i "(\příkaz ...)" zápisy
 * @returns {string} nový obsah document.xml
 */
export function transformDocumentXml(inputXml, invalidTexes = new Set(), convertParen = false) {
  const doc = new DOMParser().parseFromString(inputXml, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("Dokument XML nelze přečíst.");
  function visit(parent) {
    const children = [...parent.childNodes];
    for (let n = 0; n < children.length; n++) {
      const p = children[n];
      if (local(p) !== "p") {
        if (p.nodeType === 1) visit(p);
        continue;
      }
      const text = paragraphText(p);
      const exact = blockFormula(text);
      if (exact) {
        if (!invalidTexes.has(fullCleanTex(exact[1]))) replaceWithEquation(p, exact[1]);
        continue;
      }
      const environment = environmentStart(text);
      if (environment) {
        let combined = text,
          end = -1;
        for (let k = n + 1; k < children.length && k < n + 50; k++) {
          if (local(children[k]) !== "p") break;
          const next = paragraphText(children[k]);
          combined += "\n" + next;
          if (environmentEnd(next, environment)) {
            end = k;
            break;
          }
        }
        if (end >= 0 && !invalidTexes.has(fullCleanTex(combined))) {
          replaceWithEquation(p, combined);
          for (let k = n + 1; k <= end; k++) children[k].remove();
          n = end;
          continue;
        }
      }
      const escaped = blockStart(text);
      if (escaped !== null) {
        let combined = text,
          end = -1;
        const ending = escaped ? /^\s*\\\]\s*$/ : /^\s*\]\s*$/;
        for (let k = n + 1; k < children.length && k < n + 50; k++) {
          if (local(children[k]) !== "p") break;
          combined += "\n" + paragraphText(children[k]);
          if (ending.test(paragraphText(children[k]))) {
            end = k;
            break;
          }
        }
        const multi = blockFormula(combined);
        if (end >= 0 && multi) {
          replaceWithEquation(p, multi[1]);
          for (let k = n + 1; k <= end; k++) children[k].remove();
          n = end;
          continue;
        }
      }
      if (replaceInlineEquations(p, text, invalidTexes)) continue;
      if (isStandaloneTex(text)) {
        if (!invalidTexes.has(fullCleanTex(text))) replaceWithEquation(p, text);
        continue;
      }
      if (convertParen && /^\s*\([^()]*\\[A-Za-z]+[^()]*\)\s*$/.test(text))
        replaceWithEquation(p, text.trim().slice(1, -1));
    }
  }
  visit(doc.documentElement);
  return new XMLSerializer().serializeToString(doc);
}

/**
 * Ověří základní tvar vstupu (DOCX ZIP hlavička / textová data bez binárních znaků).
 * @param {string|Blob|File} value - vstupní hodnota
 * @param {"docx"|"file"|"text"} kind - druh kontroly
 * @returns {Promise<void>} vyhodí Error při neplatném vstupu
 */
export async function validateInputFormat(value, kind = "text") {
  if (value == null) throw new Error("Vstup je prázdný.");
  if (kind === "docx") {
    if (typeof value === "string") {
      if (!/^\s*PK\x03\x04/.test(value) && !/^\s*PK\x05\x06/.test(value)) {
        throw new Error("Nahraný soubor není validní DOCX balík.");
      }
      return;
    }
    if (value instanceof Blob) {
      const slice = value.slice ? value.slice(0, 4) : value;
      const buffer = await slice.arrayBuffer();
      const header = new Uint8Array(buffer);
      if (header.length < 4 || header[0] !== 0x50 || header[1] !== 0x4b || header[2] !== 0x03 || header[3] !== 0x04) {
        throw new Error("Výstup není validní DOCX balík – chybí ZIP hlavička PK\x03\x04.");
      }
      return;
    }
    if (value instanceof File) {
      if (!/\.docx$/i.test(value.name)) throw new Error("Nahraný soubor není DOCX.");
      return;
    }
    throw new Error("Výstup není validní DOCX data.");
  }

  const text = String(value);
  const binary = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text);
  if (binary) throw new Error("Vstup obsahuje neplatné binární znaky.");
  const supported = [".docx", ".txt", ".tex", ".texi", ".md"];
  if (kind === "file" && !supported.some((ext) => text.toLowerCase().endsWith(ext))) {
    throw new Error("Nepodporovaný formát souboru. Povolené jsou DOCX, TXT a TeX/Markdown.");
  }
}

/**
 * Znovu otevře vygenerovaný DOCX Blob a ověří jeho strukturu (ZIP části, XML kořeny,
 * relace a minimální počet Office Math objektů).
 * @param {Blob} blob - vygenerovaný DOCX
 * @param {number} expectedMath - očekávaný minimální počet rovnic
 * @returns {Promise<{mathCount: number, files: number}>}
 */
export async function validateDocxPackage(blob, expectedMath = 0) {
  if (!(blob instanceof Blob) && typeof blob !== "object") {
    throw new Error("Výstup není validní binární data DOCX.");
  }
  if (!blob.size || blob.size < 512) {
    throw new Error("Výstup DOCX je příliš malý nebo poškozený.");
  }
  let reopened;
  try {
    reopened = await JSZip.loadAsync(blob, { checkCRC32: true });
  } catch (error) {
    throw new Error("Výstup není platný ZIP/DOCX: " + error.message);
  }
  const required = [
    "[Content_Types].xml",
    "_rels/.rels",
    "word/document.xml",
    "word/styles.xml",
    "word/_rels/document.xml.rels",
  ];
  for (const name of required) if (!reopened.file(name)) throw new Error("Chybí povinná část DOCX: " + name);
  const readXml = async (name) => {
    const zipEntry = reopened.file(name);
    if (!zipEntry) throw new Error("Chybí část: " + name);
    const text = await zipEntry.async("string");
    const xml = new DOMParser().parseFromString(text, "application/xml");
    if (hasXmlError(xml)) throw new Error("Neplatné XML v části: " + name);
    return xml;
  };
  const [contentTypes, rootRels, document, styles, documentRels] = await Promise.all([
    readXml("[Content_Types].xml"),
    readXml("_rels/.rels"),
    readXml("word/document.xml"),
    readXml("word/styles.xml"),
    readXml("word/_rels/document.xml.rels"),
  ]);
  if (local(document.documentElement) !== "document" || document.documentElement.namespaceURI !== W)
    throw new Error("word/document.xml nemá platný kořen dokumentu Word.");
  if (local(styles.documentElement) !== "styles" || styles.documentElement.namespaceURI !== W)
    throw new Error("word/styles.xml nemá platný kořen stylů Wordu.");
  const ctNs = "http://schemas.openxmlformats.org/package/2006/content-types";
  const relNs = "http://schemas.openxmlformats.org/package/2006/relationships";
  const hasMainPart = [...contentTypes.getElementsByTagNameNS(ctNs, "Override")].some(
    (node) => node.getAttribute("PartName") === "/word/document.xml"
  );
  const hasStylesPart = [...contentTypes.getElementsByTagNameNS(ctNs, "Override")].some(
    (node) => node.getAttribute("PartName") === "/word/styles.xml"
  );
  const hasMainRelation = [...rootRels.getElementsByTagNameNS(relNs, "Relationship")].some(
    (node) =>
      node.getAttribute("Type") ===
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
  );
  const hasStylesRelation = [...documentRels.getElementsByTagNameNS(relNs, "Relationship")].some(
    (node) =>
      node.getAttribute("Type") ===
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"
  );
  if (!hasMainPart) throw new Error("Chybí deklarace hlavního dokumentu v [Content_Types].xml.");
  if (!hasStylesPart) throw new Error("Chybí deklarace stylů dokumentu v [Content_Types].xml.");
  if (!hasMainRelation) throw new Error("Chybí vztah k hlavnímu dokumentu.");
  if (!hasStylesRelation) throw new Error("Chybí vztah ke stylům dokumentu.");
  const mathCount = document.getElementsByTagNameNS(M, "oMath").length;
  if (expectedMath && mathCount < expectedMath)
    throw new Error(
      `Kontrola našla jen ${mathCount} objektů Office Math, očekáváno nejméně ${expectedMath}.`
    );
  return { mathCount, files: Object.keys(reopened.files).length };
}

/**
 * Nabídne stažení DOCX souboru v prohlížeči.
 * @param {Blob} blob - obsah DOCX
 * @param {string} filename - název souboru
 */
export function downloadDocx(blob, filename = "export.docx") {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
