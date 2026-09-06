/**
 * xmlNamespaces.js
 * Sdílené XML namespace konstanty a pomocné funkce pro Word/OMML dokumenty.
 * @module core/utils/xmlNamespaces
 */

export const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
export const M = "http://schemas.openxmlformats.org/officeDocument/2006/math";

/**
 * Ověří, zda parsovaný XML dokument obsahuje chybu.
 * @param {Document} doc - výsledek DOMParser.parseFromString
 * @returns {boolean}
 */
export function hasXmlError(doc) {
  const local = (node) => node && (node.localName || node.nodeName.split(":").pop());
  return (
    !doc.documentElement ||
    local(doc.documentElement) === "parsererror" ||
    doc.getElementsByTagName("parsererror").length > 0
  );
}

/**
 * Vrátí text jednoho odstavce <w:p> (spojení všech <w:t>).
 * @param {Element} paragraph - element <w:p>
 * @returns {string}
 */
export function paragraphText(paragraph) {
  let text = "";
  for (const item of paragraph.getElementsByTagNameNS(W, "t")) text += item.textContent;
  return text;
}

/**
 * Vrátí spojený text všech odstavců z document.xml.
 * @param {string} xmlText - obsah word/document.xml
 * @returns {string}
 */
export function xmlParagraphText(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  return [...doc.getElementsByTagNameNS(W, "p")].map(paragraphText).join("\n");
}

/**
 * Spočítá počet existujících Office Math objektů v document.xml.
 * @param {string} xmlText - obsah word/document.xml
 * @returns {number}
 */
export function documentMathCount(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  return hasXmlError(doc) ? 0 : doc.getElementsByTagNameNS(M, "oMath").length;
}
