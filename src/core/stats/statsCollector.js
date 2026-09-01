/**
 * statsCollector.js
 * Sběr a správa statistik zpracování dokumentů.
 * @module core/stats/statsCollector
 */

/**
 * Vytvoří nový objekt statistik
 * @returns {Object} prázdný objekt statistik
 */
export function createStats() {
  return {
    version: "2026.08.25.34",
    startedAt: null,
    endedAt: null,
    durationMs: 0,
    formulasBefore: 0,
    formulasAfter: 0,
    fixes: 0,
    fixesByType: {},
    addedBrackets: 0,
    unknownCommands: 0,
    fallbackRenders: 0,
    heuristicFixes: 0,
    wordArtifactFixes: 0,
    matrixFixes: 0,
    delimiterFixes: 0,
    vectorFixes: 0,
    absoluteValueFixes: 0,
    nestedFixes: 0,
    unterminatedEnvironmentFixes: 0,
    unterminatedBeginFixes: 0,
    unclosedLeftRightFixes: 0,
    okFormulas: [],
  };
}

/**
 * Sbírá statistiky z jednotlivé formule
 * @param {Object} stats - objekt statistik
 * @param {string} originalTex - originální LaTeX
 * @param {string} cleanedTex - vyčištěný LaTeX
 * @param {string[]} fixesLog - seznam provedeních oprav
 * @returns {void}
 */
export function collectStats(stats, originalTex, cleanedTex, fixesLog) {
  if (!stats) return;

  const source = String(originalTex || "");
  const cleaned = String(cleanedTex || "");

  stats.fixes += fixesLog.length;

  for (const fix of fixesLog) {
    stats.fixesByType[fix] = (stats.fixesByType[fix] || 0) + 1;
  }

  stats.addedBrackets += Math.max(
    0,
    (cleaned.match(/[{}[\]]/g) || []).length - (source.match(/[{}[\]]/g) || []).length
  );
}

/**
 * Finalizuje statistiky na základě debug logu
 * @param {Object} stats - objekt statistik
 * @param {Object[]} debugLog - seznam debug záznamů
 * @returns {void}
 */
export function finalizeStats(stats, debugLog = []) {
  if (!stats) return;

  const entries = debugLog;
  const fixes = entries.flatMap((entry) =>
    entry.event === "auto-fix" || entry.event === "heuristic-fix" ? entry.fixes || [] : []
  );

  const countFix = (type) => fixes.filter((fix) => fix === type).length;

  stats.fallbackRenders = entries.filter((entry) => entry.event === "katex-fallback").length;

  stats.heuristicFixes = entries.filter((entry) => entry.event === "heuristic-fix").length;

  stats.matrixFixes = countFix("matrix") + countFix("matrix-row-separator");

  stats.delimiterFixes =
    countFix("delimiters") + countFix("delimiter-conflict") + countFix("delimiter-pair");

  stats.absoluteValueFixes = countFix("absolute-value");

  stats.nestedFixes = entries.filter(
    (entry) =>
      entry.event === "heuristic-fix" && (entry.original || "").match(/\\left[\s\S]*\\left/)
  ).length;

  stats.unclosedLeftRightFixes = countFix("delimiter-pair");

  stats.unterminatedEnvironmentFixes = countFix("matrix-end");

  stats.unterminatedBeginFixes = entries.filter(
    (entry) => entry.event === "parser-overflow"
  ).length;

  stats.vectorFixes = countFix("vector");

  stats.wordArtifactFixes = entries.filter(
    (entry) => entry.event === "auto-fix" || entry.event === "heuristic-fix"
  ).length;
}
