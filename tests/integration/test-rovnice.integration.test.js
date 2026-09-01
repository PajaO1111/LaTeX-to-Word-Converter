/**
 * test-rovnice.integration.test.js
 * Integrační test zpracování test_rovnice.txt
 * Testuje úplný workflow: sbírání -> čištění -> validace -> OMML konverze
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { processDocument } from "../../src/app/orchestrator.js";
import { collectFormulas } from "../../src/core/latex/collector.js";
import { getAppVersion } from "../../src/core/utils/debug.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

describe("Integration: test_rovnice.txt", () => {
  let testContent;
  let formulas;

  beforeAll(() => {
    // Načti testovací soubor
    const testPath = resolve(__dirname, "../../docx/test_rovnice.txt");
    testContent = readFileSync(testPath, "utf-8");
    console.log(`✓ Testovací soubor načten: ${testPath}`);
    console.log(`  Velikost: ${testContent.length} znaků`);
  });

  test("should load test file successfully", () => {
    expect(testContent).toBeTruthy();
    expect(testContent.length).toBeGreaterThan(0);
  });

  test("should collect formulas from test file", () => {
    formulas = collectFormulas(testContent, {
      collectInline: true,
      collectParentheses: true,
      fromDocx: false,
    });

    expect(Array.isArray(formulas)).toBe(true);
    expect(formulas.length).toBeGreaterThan(0);

    console.log(`\n✓ Sbíráno ${formulas.length} formulí`);
    formulas.forEach((f, i) => {
      if (i < 5) {
        console.log(`  [${i}] ${f.kind}: ${f.raw.substring(0, 50)}`);
      }
    });
  });

  test("should process all formulas without crashing", async () => {
    const result = await processDocument(testContent, {
      collectInline: true,
      collectParentheses: true,
      fromDocx: false,
      batchSize: 10,
    });

    expect(result).toBeTruthy();
    expect(result.stats).toBeTruthy();
    expect(result.formulas).toBeTruthy();
    expect(result.debugLog).toBeTruthy();
  });

  test("should categorize formulas correctly", async () => {
    const result = await processDocument(testContent, {
      collectInline: true,
      collectParentheses: true,
      fromDocx: false,
    });

    const { formulas, stats } = result;

    // Kategorizace
    const valid = formulas.filter((f) => f.status === "valid");
    const fixed = formulas.filter((f) => f.status === "fixed");
    const invalid = formulas.filter((f) => f.status === "invalid");

    console.log(`\n✓ Zpracování dokumentu:`);
    console.log(`  Celkem: ${formulas.length} formulí`);
    console.log(`  Platné: ${valid.length} (bez oprav)`);
    console.log(`  Opravené: ${fixed.length} (s opravami)`);
    console.log(`  Neplatné: ${invalid.length} (chyby)`);
    console.log(`  Trvání: ${stats.durationMs}ms`);

    expect(valid.length + fixed.length + invalid.length).toBe(formulas.length);
  });

  test("should provide detailed debug information", async () => {
    const result = await processDocument(testContent, {
      collectInline: true,
      collectParentheses: true,
      fromDocx: false,
    });

    const { debugLog, stats } = result;

    expect(debugLog.length).toBeGreaterThan(0);

    // Ověř debug záznamy
    const hasStartEvent = debugLog.some((log) => log.event === "document-started");
    const hasCompletedEvent = debugLog.some((log) => log.event === "document-completed");

    expect(hasStartEvent).toBe(true);
    expect(hasCompletedEvent).toBe(true);

    // Výstup debug info
    console.log(`\n✓ Debug Log (${debugLog.length} záznamů):`);
    debugLog.forEach((log) => {
      console.log(`  [${log.event}] ${JSON.stringify(log).substring(0, 100)}`);
    });

    // Výstup statistik
    console.log(`\n✓ Statistiky:`);
    console.log(`  Verze: ${stats.version}`);
    console.log(`  Formulí na začátku: ${stats.formulasBefore}`);
    console.log(`  Formulí na konci: ${stats.formulasAfter}`);
    Object.keys(stats.fixesByType || {}).forEach((fixType) => {
      console.log(`    - ${fixType}: ${stats.fixesByType[fixType]}`);
    });
  });

  test("should generate valid OMML for OK formulas", async () => {
    const result = await processDocument(testContent, {
      collectInline: true,
      collectParentheses: true,
      fromDocx: false,
    });

    const { okFormulas } = result;

    expect(Array.isArray(okFormulas)).toBe(true);
    expect(okFormulas.length).toBeGreaterThan(0);

    // Ověř OMML generování
    okFormulas.forEach((formula, i) => {
      if (i < 3) {
        console.log(`\n✓ OMML[${i}]: ${formula.cleanedTex.substring(0, 40)}`);
        console.log(`  OMML: ${(formula.omml || "").substring(0, 80)}`);
      }

      expect(formula.omml).toBeTruthy();
      expect(formula.omml).toContain("<m:oMath");
    });
  });

  test("should report problems with invalid formulas", async () => {
    const result = await processDocument(testContent, {
      collectInline: true,
      collectParentheses: true,
      fromDocx: false,
    });

    const { problems } = result;

    if (problems.length > 0) {
      console.log(`\n⚠ Problémy (${problems.length}):`);
      problems.forEach((p, i) => {
        if (i < 5) {
          console.log(`  [${i}] ${p.reason}`);
          console.log(`    Original: ${p.originalTex.substring(0, 50)}`);
        }
      });
    }

    expect(Array.isArray(problems)).toBe(true);
  });

  test("should track statistics accurately", async () => {
    const result = await processDocument(testContent, {
      collectInline: true,
      collectParentheses: true,
      fromDocx: false,
    });

    const { stats } = result;

    expect(stats.version).toBe(getAppVersion());
    expect(stats.formulasBefore).toBeGreaterThan(0);
    expect(stats.formulasAfter).toBeLessThanOrEqual(stats.formulasBefore);
    expect(stats.durationMs).toBeGreaterThan(0);
    expect(typeof stats.startedAt).toBe("string");
    expect(typeof stats.endedAt).toBe("string");
  });
});
