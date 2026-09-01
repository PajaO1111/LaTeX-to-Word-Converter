/**
 * collector.js
 * Sběr kandidátů formulí z textu.
 * @module core/latex/collector
 */

/**
 * Ověří, zda je text samostatný LaTeX výraz
 * @param {string} text - text k ověření
 * @returns {boolean} true, pokud je to LaTeX
 */
function isStandaloneTex(text) {
  const trimmed = text.trim();

  if (
    /^\s*\[[\s\S]*\]\s*$/.test(trimmed) ||
    /^\\\[[\s\S]*\\\]$/.test(trimmed) ||
    /^\\\([\s\S]*\\\)$/.test(trimmed)
  )
    return false;

  if (/^\\end\{/.test(trimmed)) return false;

  return (
    /\\[A-Za-z]/.test(trimmed) &&
    /^[A-Za-z0-9_{}[\]^=+.,;|()&<>\\\-\s]+$/.test(trimmed) &&
    (/^[-+\\]/.test(trimmed) ||
      /[=_^+]/.test(trimmed) ||
      /\\begin\{|\\mathbf\b/.test(trimmed))
  );
}

/**
 * Vrátí vyvážené čtvercové závorky
 * @param {string} text - text k analýze
 * @returns {string|null} vnitřek zálomek nebo null
 */
function balancedSquareBlock(text) {
  const source = String(text || "").trim();

  if (!source.startsWith("[") || !source.endsWith("]")) return null;

  let depth = 0;
  for (let index = 0; index < source.length; index++) {
    if (source.startsWith("\\left[", index)) {
      depth++;
      index += 5;
      continue;
    }

    if (source.startsWith("\\right]", index)) {
      depth--;
      index += 6;
      continue;
    }

    if (source[index] === "[") depth++;
    else if (source[index] === "]") depth--;

    if (depth === 0 && index !== source.length - 1) return null;
  }

  return depth === 0 ? source.slice(1, -1) : null;
}

/**
 * Extrahuje bloky v čtvercových závorkách
 * @param {string} text - zdrojový text
 * @returns {string[]} seznam nalezených bloků
 */
function squareBlocks(text) {
  const source = String(text || "");
  const blocks = [];
  const maxBlockLength = 5000;

  for (let start = 0; start < source.length; start++) {
    if (
      source[start] !== "[" ||
      source[start - 1] === "\\" ||
      source.slice(Math.max(0, start - 5), start) === "\\left"
    )
      continue;

    let depth = 1;
    for (let index = start + 1; index < source.length; index++) {
      if (index - start > maxBlockLength) break;

      const lineStart = index === 0 || source[index - 1] === "\n";
      if (
        lineStart &&
        /(?:^#{1,6}\s|^={4,}|^[-_]{4,})/.test(
          source.slice(index).split("\n", 1)[0],
        )
      )
        break;

      if (source.startsWith("\\left[", index)) {
        depth++;
        index += 5;
        continue;
      }

      if (source.startsWith("\\right]", index)) {
        depth--;
        index += 6;
      } else if (source[index] === "[") depth++;
      else if (source[index] === "]") depth--;

      if (depth === 0) {
        const inner = source.slice(start + 1, index);
        if (inner.length <= maxBlockLength && !/={4,}/.test(inner))
          blocks.push(inner);
        start = index;
        break;
      }
    }
  }

  return blocks;
}

/**
 * Sbírá kandidáty formulí z textu
 * @param {string} text - zdrojový text
 * @param {Object} options - možnosti sbírání
 * @returns {Array} seznam kandidátů
 */
export function collectFormulas(text, options = {}) {
  const {
    collectInline = false,
    collectParentheses = false,
    fromDocx = false,
  } = options;

  const found = [];
  const seen = new Set();

  const add = (raw, kind) => {
    const candidate = String(raw || "");

    if (
      candidate.length > 5000 ||
      /(?:^|\n)\s*(?:#{1,6}\s|={4,}|[-_]{4,})/.test(candidate)
    ) {
      return;
    }

    if (candidate && !seen.has(candidate)) {
      seen.add(candidate);
      found.push({
        raw: candidate.trim(),
        kind,
      });
    }
  };

  // Hledání \\left[ … \\right]
  for (const match of text.matchAll(/\\left\[([\s\S]{1,5000}?)\\right\]/g))
    add(match[0], "blok \\left[ … \\right]");

  // Hledání \\[ … \\]
  for (const match of text.matchAll(/\\\[\s*([\s\S]{1,5000}?)\s*\\\]/g))
    add(match[1], "blok \\[ … \\]");

  // Hledání [ … ]
  for (const block of squareBlocks(text)) add(block, "blok [ … ]");

  // Hledání samostatného LaTeX
  for (const line of text.split(/\n+/))
    if (isStandaloneTex(line)) add(line, "samostatný LaTeX");

  // Inline výrazy (pokud povoleno)
  if (collectInline) {
    for (const match of text.matchAll(
      /\\\(([\s\S]{1,3000}?)\\\)|\$([^$\n]{1,3000})\$/g,
    ))
      add(match[1] || match[2], "inline");
  }

  // Výrazy v kulatých závorkách (pokud povoleno)
  if (collectParentheses) {
    for (const match of text.matchAll(
      /\(([^()\n]{0,1500}\\[A-Za-z]+[^()\n]{0,1500})\)/g,
    ))
      add(match[1], "kulaté závorky");
  }

  // Z DOCX
  if (fromDocx) {
    for (const match of text.matchAll(/\(([^()\n]*\\[A-Za-z]+[^()\n]*)\)/g))
      add(match[1], "inline z DOCX");

    for (const match of text.matchAll(
      /\(([A-Za-z](?:\s*[=<>]\s*[^()\n]+)?)\)/g,
    ))
      add(match[1], "inline z DOCX");
  }

  return found;
}
