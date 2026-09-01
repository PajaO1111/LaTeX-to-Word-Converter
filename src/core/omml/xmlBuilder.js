/**
 * xmlBuilder.js
 * Pomocné funkce pro generování OMML XML fragmentů.
 * @module core/omml/xmlBuilder
 */

import { escapeXml } from "../utils/escapeXml.js";

const M = "http://schemas.openxmlformats.org/officeDocument/2006/math";

/**
 * Vytvoří matematický běh (text v rovnici)
 * @param {string} text - text
 * @param {string} variant - varianta (roman, bold, double, script)
 * @returns {string} OMML XML pro běh
 */
export function mathRun(text, variant = "") {
  if (!text) return "";

  const val =
    variant === "roman" || variant === "text"
      ? '<m:rPr><m:sty m:val="p"/></m:rPr>'
      : variant === "bold"
        ? '<m:rPr><m:sty m:val="b"/></m:rPr>'
        : variant === "double"
          ? '<m:rPr><m:scr m:val="double-struck"/></m:rPr>'
          : variant === "script"
            ? '<m:rPr><m:scr m:val="script"/></m:rPr>'
            : "";

  return `<m:r>${val}<m:t xml:space="preserve">${escapeXml(text)}</m:t></m:r>`;
}

/**
 * Vytvoří běh v Wordu (text v odstavci)
 * @param {string} text - text
 * @param {Object} style - styl (bold, italic, underline)
 * @returns {string} Word XML pro běh
 */
export function wordRun(text, style = {}) {
  const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const attrs = /^\s|\s$/.test(text) ? ' xml:space="preserve"' : "";
  const rPr =
    style.bold || style.italic || style.underline
      ? `<w:rPr>${style.bold ? "<w:b/>" : ""}${style.italic ? "<w:i/>" : ""}${style.underline ? '<w:u w:val="single"/>' : ""}</w:rPr>`
      : "";

  return String(text)
    .split(/\n/)
    .map(
      (line, index) =>
        `${index ? "<w:br/>" : ""}<w:t${attrs}>${escapeXml(line)}</w:t>`,
    )
    .join("")
    .replace(/^/, `<w:r>${rPr}`)
    .replace(/$/, "</w:r>");
}

/**
 * Vytvoří OMML fragment pro binární operátor
 * @param {string} op - operátor
 * @returns {string} OMML XML
 */
export function binaryOp(op) {
  return `<m:opEmu m:val="0"/><m:r><m:t>${escapeXml(op)}</m:t></m:r>`;
}

/**
 * Vytvoří OMML fragment pro zlomek
 * @param {string} num - čitatel
 * @param {string} denom - jmenovatel
 * @returns {string} OMML XML
 */
export function fraction(num, denom) {
  return `<m:f><m:fPr><m:type m:val="bar"/></m:fPr><m:num>${num}</m:num><m:den>${denom}</m:den></m:f>`;
}

/**
 * Vytvoří OMML fragment pro odmocninu
 * @param {string} content - obsah pod odmocninou
 * @param {string} degree - stupeň odmocniny (volitelný)
 * @returns {string} OMML XML
 */
export function radical(content, degree = "") {
  return `<m:rad><m:radPr>${degree ? `<m:degHide m:val="0"/>` : `<m:degHide m:val="1"/>`}</m:radPr>${degree ? `<m:deg>${degree}</m:deg>` : ""}<m:e>${content}</m:e></m:rad>`;
}
