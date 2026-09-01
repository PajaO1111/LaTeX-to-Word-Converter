/**
 * orchestrator.js
 * Orchestrátor pro sekvenční zpracování dokumentů s LaTeX formulemi.
 * @module app/orchestrator
 */

import { cleanTex, fallbackTex } from "../core/latex/cleanTex.js";
import { heuristicFix } from "../core/latex/heuristicFix.js";
import { validateFormulaWithFallback } from "../core/latex/validator.js";
import { classifyFixes } from "../core/latex/classifyFixes.js";
import { collectFormulas } from "../core/latex/collector.js";
import { createStats, collectStats, finalizeStats } from "../core/stats/statsCollector.js";
import { debug, getDebugLog, getAppVersion, initDebug } from "../core/utils/debug.js";
import { texToOmml } from "../core/omml/texToOmml.js";

/**
 * Zpracuje jednu formuli průběhem všech kroků
 * @param {Object} candidate - kandidát formule
 * @returns {Promise<Object>} zpracovaná formule
 */
async function processFormula(candidate) {
  const originalTex = String(candidate.raw || "").trim();

  // Krok 1: Přímá validace
  const direct = validateFormulaWithFallback(originalTex, fallbackTex);
  if (direct.ok && direct.mode === "direct") {
    return {
      id: candidate.id,
      originalTex,
      cleanedTex: originalTex,
      status: "valid",
      validation: "direct",
      fixes: [],
      reason: "",
      kind: candidate.kind,
    };
  }

  // Krok 2: Čištění
  const { cleaned } = cleanTex(originalTex);

  // Krok 3: Heuristické opravy
  const { repaired, fixes: heuristicFixes } = heuristicFix(cleaned);

  // Krok 4: Validace po opravách
  const afterFix = validateFormulaWithFallback(repaired, fallbackTex);

  // Krok 5: Kolekce statistik
  const allFixes = classifyFixes(originalTex, repaired);

  debug("formula-processed", {
    original: originalTex,
    cleaned: repaired,
    status: afterFix.ok ? "ok" : "error",
    fixes: allFixes,
  });

  return {
    id: candidate.id,
    originalTex,
    cleanedTex: repaired,
    status: afterFix.ok ? "fixed" : "invalid",
    validation: afterFix.mode || "failed",
    fixes: allFixes,
    reason: afterFix.ok ? "" : afterFix.reason || direct.reason,
    kind: candidate.kind,
    heuristicFixes,
  };
}

/**
 * Zpracuje batch formulí
 * @param {Object[]} batch - batch kandidátů
 * @param {Object} stats - objekt statistik
 * @returns {Promise<Object[]>} zpracované formule
 */
async function processBatch(batch, stats) {
  const results = await Promise.all(batch.map((candidate) => processFormula(candidate)));

  for (const result of results) {
    if (result.status === "fixed" || result.status === "valid") {
      stats.formulasAfter++;
      collectStats(stats, result.originalTex, result.cleanedTex, result.fixes);
    }
  }

  return results;
}

/**
 * Rozdělí formule do batchů
 * @param {Object[]} items - seznam položek
 * @param {number} batchSize - velikost batche
 * @returns {Object[][]} seznam batchů
 */
function chunk(items, batchSize) {
  const chunks = [];
  for (let i = 0; i < items.length; i += batchSize) {
    chunks.push(items.slice(i, i + batchSize));
  }
  return chunks;
}

/**
 * Hlavní orchestrátor - zpracuje dokument od začátku do konce
 * @param {string} sourceText - zdrojový text
 * @param {Object} options - možnosti zpracování
 * @returns {Promise<Object>} výsledek zpracování
 */
export async function processDocument(sourceText, options = {}) {
  const startTime = performance.now();

  // Inicializace
  initDebug();
  const stats = createStats();
  stats.startedAt = new Date().toISOString();

  debug("document-started", {
    version: getAppVersion(),
    textLength: sourceText.length,
  });

  // Sběr kandidátů
  const candidates = collectFormulas(sourceText, {
    collectInline: options.collectInline || false,
    collectParentheses: options.collectParentheses || false,
    fromDocx: options.fromDocx || false,
  });

  stats.formulasBefore = candidates.length;

  debug("candidates-collected", { count: candidates.length });

  // Zpracování v dávkách
  const batchSize = options.batchSize || 20;
  const batches = chunk(candidates, batchSize);
  const allResults = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const results = await processBatch(batch, stats);
    allResults.push(...results);

    // Volný prostor pro UI aktualizaci
    if (i < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  // Finalizace statistik
  const debugLog = getDebugLog();
  finalizeStats(stats, debugLog);

  // Oddělení OK a problematických formulí
  const okFormulas = allResults.filter((r) => r.status === "fixed" || r.status === "valid");
  const problems = allResults.filter((r) => r.status === "invalid");

  // Konverze na OMML
  const ommlFormulas = okFormulas.map((formula) => ({
    ...formula,
    omml: texToOmml(formula.cleanedTex),
  }));

  // Finalizace
  stats.endedAt = new Date().toISOString();
  stats.durationMs = Math.round(performance.now() - startTime);
  stats.okFormulas = ommlFormulas;

  debug("document-completed", {
    duration: stats.durationMs,
    okCount: okFormulas.length,
    errorCount: problems.length,
  });

  return {
    stats,
    formulas: allResults,
    okFormulas,
    problems,
    debugLog,
  };
}
