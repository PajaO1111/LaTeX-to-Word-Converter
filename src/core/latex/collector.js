/**
 * collector.js
 * Sběr kandidátů formulí z textu.
 * @module core/latex/collector
 */

import { isStandaloneTex, squareBlocks as findSquareBlocks } from "./blockDetector.js";

/**
 * Sbírá kandidáty formulí z textu
 * @param {string} text - zdrojový text
 * @param {Object} options - možnosti sbírání
 * @returns {Array} seznam kandidátů
 */
export function collectFormulas(text, options = {}) {
  const { collectInline = false, collectParentheses = false, fromDocx = false } = options;

  const found = [];
  const seen = new Set();
  // Rozsahy už zabrané větším blokem (např. \[ … \] nebo [ … ]), aby se
  // vnořené fragmenty (\left[ … \right] nebo (…) uvnitř nich) nesbíraly znovu.
  const claimedRanges = [];
  const claim = (range) => {
    if (range) claimedRanges.push(range);
  };
  const overlapsClaimed = (start, end) => claimedRanges.some(([s, e]) => start < e && end > s);

  const add = (raw, kind, range = null) => {
    const candidate = String(raw || "");

    if (candidate.length > 5000 || /(?:^|\n)\s*(?:#{1,6}\s|={4,}|[-_]{4,})/.test(candidate)) {
      return;
    }

    if (candidate && !seen.has(candidate)) {
      seen.add(candidate);
      found.push({
        raw: candidate.trim(),
        kind,
      });
    }
    claim(range);
  };

  // Nejprve větší kontejnery (\[ … \] a [ … ]), aby si zabraly svůj rozsah dřív
  // než menší vzory, které by jinak vytáhly jejich vnořený obsah jako duplicitu.
  for (const match of text.matchAll(/\\\[\s*([\s\S]{1,5000}?)\s*\\\]/g))
    add(match[1], "blok \\[ … \\]", [match.index, match.index + match[0].length]);

  for (const block of findSquareBlocks(text)) add(block.inner, "blok [ … ]", [block.start, block.end]);

  for (const match of text.matchAll(/\\left\[([\s\S]{1,5000}?)\\right\]/g)) {
    const range = [match.index, match.index + match[0].length];
    if (overlapsClaimed(range[0], range[1])) continue;
    add(match[0], "blok \\left[ … \\right]", range);
  }

  // Hledání samostatného LaTeX (jen mimo již zabrané rozsahy)
  for (const match of text.matchAll(/[^\n]+/g)) {
    const line = match[0];
    if (!isStandaloneTex(line)) continue;
    const range = [match.index, match.index + line.length];
    if (overlapsClaimed(range[0], range[1])) continue;
    add(line, "samostatný LaTeX", range);
  }

  // Inline výrazy (pokud povoleno)
  if (collectInline) {
    for (const match of text.matchAll(/\\\(([\s\S]{1,3000}?)\\\)|\$([^$\n]{1,3000})\$/g)) {
      const range = [match.index, match.index + match[0].length];
      if (overlapsClaimed(range[0], range[1])) continue;
      add(match[1] || match[2], "inline", range);
    }
  }

  // Výrazy v kulatých závorkách (pokud povoleno)
  if (collectParentheses) {
    for (const match of text.matchAll(/\(([^()\n]{0,1500}\\[A-Za-z]+[^()\n]{0,1500})\)/g)) {
      const range = [match.index, match.index + match[0].length];
      if (
        text[match.index - 1] === "\\" ||
        text.slice(Math.max(0, match.index - 5), match.index) === "\\left"
      )
        continue;
      if (overlapsClaimed(range[0], range[1])) continue;
      add(match[1], "kulaté závorky", range);
    }
  }

  // Z DOCX
  if (fromDocx) {
    for (const match of text.matchAll(/\(([^()\n]*\\[A-Za-z]+[^()\n]*)\)/g)) {
      const range = [match.index, match.index + match[0].length];
      if (
        text[match.index - 1] === "\\" ||
        text.slice(Math.max(0, match.index - 5), match.index) === "\\left"
      )
        continue;
      if (overlapsClaimed(range[0], range[1])) continue;
      add(match[1], "inline z DOCX", range);
    }

    for (const match of text.matchAll(/\(([A-Za-z](?:\s*[=<>]\s*[^()\n]+)?)\)/g)) {
      const range = [match.index, match.index + match[0].length];
      if (
        text[match.index - 1] === "\\" ||
        text.slice(Math.max(0, match.index - 5), match.index) === "\\left"
      )
        continue;
      if (overlapsClaimed(range[0], range[1])) continue;
      add(match[1], "inline z DOCX", range);
    }
  }

  return found;
}
