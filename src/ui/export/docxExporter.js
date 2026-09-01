/**
 * docxExporter.js
 * Export zpracovaného dokumentu do DOCX formátu.
 * @module ui/export/docxExporter
 */

import { escapeXml } from "../../core/utils/escapeXml.js";

/**
 * Vytvoří XML pro odkaz na číslo
 * @private
 * @param {number} rId - ID relace
 * @returns {string} XML string
 */
function _createRelationshipRef(rId) {
  return `r:embed="rId${rId}"`;
}

/**
 * Generuje DOCX dokument s OMML rovnicemi
 * Implementace je zjednodušená MVP verze
 * @param {string} sourceText - Původní text dokumentu
 * @param {string[]} ommlFragments - Pole OMML fragmentů
 * @param {Object} options - Možnosti exportu
 * @returns {{
 *   ok: boolean,
 *   blob?: Blob,
 *   error?: string
 * }}
 */
export function buildDocx(sourceText, ommlFragments = [], options = {}) {
  const { filename = "export.docx" } = options;

  if (!sourceText) {
    return {
      ok: false,
      error: "Zdrojový text je povinný",
    };
  }

  if (typeof JSZip === "undefined") {
    return {
      ok: false,
      error: "JSZip není k dispozici",
    };
  }

  try {
    const zip = new JSZip();

    // Přidej [Content_Types].xml
    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    zip.file("[Content_Types].xml", contentTypes);

    // Přidej _rels/.rels
    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    zip.folder("_rels").file(".rels", rels);

    // Generuj document.xml s OMML rovnicemi
    const documentBody = generateDocumentBody(sourceText, ommlFragments);
    zip.folder("word").file("document.xml", documentBody);

    // Generuj Blob
    return zip.generateAsync({ type: "blob" }).then((blob) => ({
      ok: true,
      blob,
      filename,
    }));
  } catch (error) {
    return {
      ok: false,
      error: `Chyba při generování DOCX: ${error.message}`,
    };
  }
}

/**
 * Generuje obsah document.xml
 * @private
 * @param {string} text - Text dokumentu
 * @param {string[]} ommlFragments - OMML fragmenty
 * @returns {string} XML obsah
 */
function generateDocumentBody(text, ommlFragments = []) {
  const escapedText = escapeXml(text);

  let content = escapedText;
  if (ommlFragments.length > 0) {
    content += "\n<!-- OMML Fragments -->\n" + ommlFragments.join("\n");
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Normal"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rStyle w:val="DefaultParagraphFont"/>
        </w:rPr>
        <w:t>${content}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;
}

/**
 * Nabídne stažení DOCX souboru v prohlížeči
 * @param {Blob} blob - Blob s obsahem DOCX
 * @param {string} filename - Název souboru (default: export.docx)
 */
export function downloadDocx(blob, filename = "export.docx") {
  if (typeof document === "undefined" || typeof URL === "undefined") {
    return;
  }

  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Chyba při stahování DOCX:", error);
  }
}

/**
 * Validuje DOCX Blob strukturu (zjednodušená kontrola)
 * @param {Blob} blob - Blob k validaci
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function validateDocxBlob(blob) {
  if (!(blob instanceof Blob)) {
    return { ok: false, error: "Očekáván Blob objekt" };
  }

  if (blob.size === 0) {
    return { ok: false, error: "DOCX soubor je prázdný" };
  }

  // Ověř ZIP podpis (PK...)
  const buffer = await blob.slice(0, 4).arrayBuffer();
  const view = new Uint8Array(buffer);
  const signature = `${String.fromCharCode(view[0])}${String.fromCharCode(view[1])}`;

  if (signature !== "PK") {
    return { ok: false, error: "Neplatný DOCX formát (chybí ZIP podpis)" };
  }

  return { ok: true };
}
