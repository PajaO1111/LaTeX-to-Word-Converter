/**
 * editorInput.js
 * Extrakce textu z HTML editoru a sanitizace vstupu.
 * @module ui/editor/editorInput
 */

/**
 * Normalizuje řetězec odebráním nadměrných bílých znaků
 * @param {string} text - Text k normalizaci
 * @returns {string} Normalizovaný text
 */
function normalizeWhitespace(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

/**
 * Odebere HTML značky a vrátí čistý text
 * @param {string} html - HTML obsah
 * @returns {string} Čistý text bez HTML
 */
function stripHtmlTags(html) {
  if (typeof html !== "string") return "";

  const div = typeof document !== "undefined" ? document.createElement("div") : null;
  if (!div) return html;

  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

/**
 * Sanitizuje vstup z editoru
 * - odebere HTML značky
 * - normalizuje bílé znaky
 * - ověří délku
 * @param {string} rawInput - Surový vstup z editoru
 * @param {Object} options - Možnosti sanitizace
 * @param {number} options.maxLength - Maximální délka (default: 100000)
 * @returns {{
 *   text: string,
 *   length: number,
 *   warnings: string[]
 * }}
 */
export function sanitizeInput(rawInput, options = {}) {
  const { maxLength = 100000 } = options;
  const warnings = [];

  if (!rawInput) {
    return { text: "", length: 0, warnings };
  }

  // Odebir HTML
  let text = stripHtmlTags(String(rawInput));

  // Normalizuj bílé znaky
  text = normalizeWhitespace(text);

  // Ověř délku
  if (text.length > maxLength) {
    warnings.push(`Text má ${text.length} znaků, limit je ${maxLength}`);
    text = text.substring(0, maxLength);
  }

  return {
    text,
    length: text.length,
    warnings,
  };
}

/**
 * Získá text z HTML editoru element
 * @param {HTMLElement} editorElement - Element editoru
 * @param {Object} options - Možnosti
 * @returns {{
 *   text: string,
 *   length: number,
 *   warnings: string[]
 * }}
 */
export function getEditorText(editorElement, options = {}) {
  if (!editorElement) {
    return { text: "", length: 0, warnings: ["Editor element nenalezen"] };
  }

  const rawText = editorElement.innerHTML || editorElement.textContent || "";
  return sanitizeInput(rawText, options);
}

/**
 * Vloží text do editoru
 * @param {HTMLElement} editorElement - Element editoru
 * @param {string} text - Text k vložení
 */
export function setEditorText(editorElement, text) {
  if (!editorElement) return;

  if (editorElement.contentEditable === "true") {
    editorElement.textContent = String(text || "");
  } else {
    editorElement.textContent = String(text || "");
  }
}

/**
 * Kontroluje, zda je editor prázdný
 * @param {HTMLElement} editorElement - Element editoru
 * @returns {boolean} True, pokud je prázdný
 */
export function isEditorEmpty(editorElement) {
  if (!editorElement) return true;

  const text = editorElement.textContent || editorElement.innerHTML || "";
  return text.trim().length === 0;
}

/**
 * Vyprázdní editor
 * @param {HTMLElement} editorElement - Element editoru
 */
export function clearEditor(editorElement) {
  if (!editorElement) return;

  if (editorElement.contentEditable === "true") {
    editorElement.textContent = "";
  } else {
    editorElement.textContent = "";
  }
}

/**
 * Rozloží obsah contenteditable editoru na strukturované bloky (odstavce,
 * nadpisy, seznamy, tabulky) zachovávající pořadí a formátovací uzly.
 * @param {HTMLElement} editorElement - contenteditable element
 * @returns {{tag: string, node: Node, text: string}[]} seznam bloků
 */
export function getEditorBlocks(editorElement) {
  const blocks = [];
  if (!editorElement) return blocks;
  for (const child of editorElement.childNodes) {
    if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim()) {
      for (const text of child.nodeValue.split(/\n+/))
        if (text.trim()) blocks.push({ tag: "p", node: child, text });
    } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() !== "table") {
      blocks.push({
        tag: child.tagName.toLowerCase(),
        node: child,
        text: child.innerText,
      });
    } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === "table") {
      blocks.push({ tag: "table", node: child, text: "" });
    }
  }
  return blocks;
}
