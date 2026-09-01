/**
 * escapeXml.js
 * Utilita pro escapování XML speciálních znaků.
 * @module core/utils/escapeXml
 */

/**
 * Escapuje XML speciální znaky v řetězci
 * @param {string} value - vstupní řetězec
 * @returns {string} escapovaný řetězec
 */
export function escapeXml(value) {
  return String(value).replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
}

/**
 * Vrací lokální jméno XML prvku (bez namespace)
 * @param {Node} node - XML uzel
 * @returns {string|null} lokální jméno prvku
 */
export function local(node) {
  return node && (node.localName || node.nodeName.split(":").pop());
}
