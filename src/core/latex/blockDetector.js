/**
 * blockDetector.js
 * Rozpoznávání LaTeX bloků (matice, prostředí, \[ \], samostatné zápisy) v textu.
 * @module core/latex/blockDetector
 */

/**
 * Vrátí vnitřek vyvážených hranatých závorek [ … ], nebo null pokud text nesedí.
 * @param {string} text - text k analýze
 * @returns {string|null} vnitřek závorek
 */
export function balancedSquareBlock(text) {
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
 * Najde bloky v hranatých závorkách [ … ] uvnitř libovolného textu.
 * @param {string} text - zdrojový text
 * @returns {{inner: string, start: number, end: number}[]} nalezené bloky s rozsahy
 */
export function squareBlocks(text) {
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
        /(?:^#{1,6}\s|^={4,}|^[-_]{4,})/.test(source.slice(index).split("\n", 1)[0])
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
          blocks.push({ inner, start, end: index + 1 });
        start = index;
        break;
      }
    }
  }
  return blocks;
}

/**
 * Rozpozná blokovou formuli: \[ … \], \left[ … \right] nebo vyvážené [ … ].
 * @param {string} text - jeden odstavec/blok textu
 * @returns {[string, string]|null} [celý zápis, vnitřní LaTeX] nebo null
 */
export function blockFormula(text) {
  const value = String(text || "");
  const display = value.match(/^\s*\\\[\s*([\s\S]*?)\s*\\\]\s*$/);
  if (display) return display;
  const leftRight = value.match(/^\s*\\left\[([\s\S]*?)\\right\]\s*$/);
  if (leftRight) return [value, value.trim()];
  const inner = balancedSquareBlock(value);
  return inner === null ? null : [value, inner];
}

/**
 * Rozpozná osamocený řádek "[" nebo "\[" jako začátek víceřádkového bloku.
 * @param {string} text - odstavec
 * @returns {boolean|null} true pro escapovaný "\[", false pro "[", null pokud nesedí
 */
export function blockStart(text) {
  const match = String(text || "").match(/^\s*(\\)?\[\s*$/);
  return match ? Boolean(match[1]) : null;
}

/**
 * Rozpozná začátek maticového/case prostředí na samostatném řádku.
 * @param {string} text - odstavec
 * @returns {string|null} název prostředí nebo null
 */
export function environmentStart(text) {
  const match = String(text || "").match(
    /^\s*\\begin\{(pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array|cases)\}\s*$/
  );
  return match ? match[1] : null;
}

/**
 * Ověří, zda odstavec ukončuje dané prostředí.
 * @param {string} text - odstavec
 * @param {string} environment - název prostředí
 * @returns {boolean}
 */
export function environmentEnd(text, environment) {
  return new RegExp(`^\\s*\\\\end\\{${environment}\\}\\s*[.,;]?\\s*$`).test(String(text || ""));
}

/**
 * Ověří, zda je odstavec "holý" LaTeX zápis bez \[ \], \( \) nebo $ $ obalení.
 * @param {string} text - odstavec
 * @returns {boolean}
 */
export function isStandaloneTex(text) {
  const trimmed = String(text || "").trim();
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
    (/^[-+\\]/.test(trimmed) || /[=_^+]/.test(trimmed) || /\\begin\{|\\mathbf\b/.test(trimmed))
  );
}
