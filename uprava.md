### Prompt pro Copilot ve VS Code

Níže je kompletní, přesný a vykonatelný prompt pro Copilot, který má provést refaktoring projektu z jednoho monolitického `app.js` do modulární architektury podle návrhu. Prompt je napsaný tak, aby Copilot generoval soubory, upravil existující kód, přidal JSDoc komentáře, vytvořil orchestrátor a připravil základ pro testy a CI.

---

### Účel a cíle
**Účel**: Převést současný monolitický `app.js` na modulární, testovatelnou a udržitelnou strukturu podle SOLID a čisté architektury.  
**Hlavní cíle**:
- Rozdělit logiku do `core`, `ui`, `app` modulů.
- Zavést jasná API mezi moduly (immutable vstupy, čisté návratové objekty).
- Přidat JSDoc komentáře a hlavičky souborů.
- Vytvořit orchestrátor s deterministickým postupem zpracování.
- Připravit skeleton pro unit testy a GitHub Actions CI.

---

### Požadované výstupy
Copilot vygeneruje nebo upraví tyto položky v repozitáři:

**Adresářová struktura**
```
/src
  /core
    /latex
      cleanTex.js
      heuristicFix.js
      validator.js
      classifyFixes.js
    /omml
      texToOmml.js
      xmlBuilder.js
    /stats
      statsCollector.js
      statsModel.js
      statsFinalizer.js
    /test
      stressTest.js
      testCases.js
    /utils
      debug.js
      escapeXml.js
      knownCommands.js
  /ui
    /renderer
      previewRenderer.js
      unprocessedRenderer.js
      statsRenderer.js
    /theme
      autoTheme.js
    /editor
      editorInput.js
    /export
      docxExporter.js
    /events
      eventHandlers.js
  /app
    app.js
    config.js
index.html
style.css
README.md
```

**Nové soubory s obsahem**:
- `src/core/latex/cleanTex.js` — implementace `cleanTex` s JSDoc a unit-test friendly API.
- `src/core/latex/heuristicFix.js` — implementace heuristik vracející `{ repaired, fixes }`.
- `src/core/latex/validator.js` — `validateLatexStructure` a `validateFormula`.
- `src/core/stats/statsCollector.js` — `createStats`, `collectStats`, `finalizeStats`.
- `src/app/app.js` — orchestrátor, který řídí postup zpracování (viz níže).
- UI renderer soubory, které pouze přijímají data a vykreslí DOM.

---

### Krok za krokem úkoly pro Copilot
1. **Vytvořit moduly core/latex**
   - `cleanTex.js`: exportovat `cleanTex(raw: string): { cleaned: string, protectedBlocks: string[] }`.
   - `heuristicFix.js`: exportovat `heuristicFix(cleaned: string): { repaired: string, fixes: string[] }`.
   - `validator.js`: exportovat `validateLatexStructure(tex: string): { ok: boolean, reason?: string }` a `validateFormula(tex: string): { ok: boolean, mode?: string, reason?: string }`.
   - `classifyFixes.js`: pomocná funkce pro kategorizaci oprav.

2. **Vytvořit moduly core/omml**
   - `texToOmml.js`: export `texToOmml(tex: string): OmmlFragment` (čistý objekt, bez DOM).
   - `xmlBuilder.js`: pomocné funkce pro generování OMML XML fragmentů.

3. **Vytvořit moduly core/stats**
   - `statsCollector.js`: `createStats()`, `collectStats(original, cleaned, fixes)`.
   - `statsFinalizer.js`: `finalizeStats(stats, debugLog)`.

4. **Vytvořit utils**
   - `debug.js`: centralizovaný debug logger `log(event, details)`.
   - `escapeXml.js`, `knownCommands.js`.

5. **Vytvořit UI moduly**
   - `previewRenderer.js`: `renderPreview(formulas: FormulaResult[])` — pouze DOM rendering.
   - `unprocessedRenderer.js`, `statsRenderer.js`.
   - `autoTheme.js`: detekce OS theme a uložení volby.
   - `editorInput.js`: získání textu z editoru, sanitizace vstupu.
   - `docxExporter.js`: IO operace s JSZip, vrací Blob nebo nabídne download (UI volá).

6. **Vytvořit orchestrátor `src/app/app.js`**
   - Implementovat sekvenční postup zpracování podle strukturogramu níže.
   - Orchestrátor spravuje `state` lokálně a předává immutable objekty mezi moduly.
   - Orchestrátor loguje verzi `APP_VERSION` v debug záznamech.

7. **Přidat JSDoc a hlavičky**
   - Každý nový soubor začít JSDoc hlavičkou popisující účel, vstupy a výstupy.
   - Ve funkcích popsat předpoklady a návratové typy.

8. **Připravit skeleton testů**
   - `tests/unit/cleanTex.test.js`, `heuristicFix.test.js`, `validator.test.js` s několika základními případy.
   - Přidat `package.json` skripty `test`, `lint`.

9. **Přidat CI workflow**
   - GitHub Actions `ci.yml` spouštějící lint a testy.

10. **Refaktor existující `app.js`**
    - Rozdělit logiku z původního `app.js` do nových modulů.
    - Zachovat debug log a APP_VERSION.
    - Vytvořit commity s jasnými zprávami: `refactor: split app.js into core and ui modules`, `feat: add orchestrator and stats module`, `test: add unit tests for cleanTex`.

---

### Orchestrátor postup a strukturogram
**Pořadí kroků které orchestrátor provede pro jeden dokument**
1. **Inicializace**
   - Načíst `config`, nastavit `APP_VERSION`, inicializovat `debug` a `stats`.
2. **Načtení vstupu**
   - Pokud je DOCX → `IO.readDocx()` → extrahovat text a metadata.
   - Jinak použít `editorInput.getText()`.
3. **Analýza dokumentu**
   - Pokud DOCX obsahuje OMML rovnice a uživatel zvolí `ponechat` → ukončit bez změn.
   - Jinak pokračovat.
4. **Kolekce kandidátů**
   - `Collector.collectFormulas(text)` → vrátí `FormulaCandidate[]`.
5. **Zpracování kandidátů v dávkách**
   - Rozdělit do batchí (např. 20 položek).
   - Pro každý kandidát:
     - `validateFormula(raw)` → pokud ok: označit `mode: direct`.
     - Jinak `cleanTex(raw)` → `heuristicFix(cleaned)` → `validateFormula(repaired)`.
     - Pokud ok → `status: ok`, uložit `tex` a `fixes`.
     - Jinak → `status: error`, přidat do `unprocessed`.
     - Volat `stats.collectStats` po každém kroku.
6. **Render preview v dávkách**
   - `previewRenderer.renderPreview(okFormulas)` s omezením počtu současných KaTeX renderů.
7. **Převod do OMML**
   - `texToOmml` pro `okFormulas`.
8. **Sestavení DOCX**
   - `docxExporter.buildDocx(originalDoc, ommlFragments)` → validace ZIP a kontrolní součty.
9. **Zobrazení výsledků**
   - `statsRenderer.renderStats(stats)` a `unprocessedRenderer.renderUnprocessed(problems)`.
10. **Ukončení**
    - Uložit debug log, nabídnout stažení.

---

### Kódové ukázky a styl komentářů
**Hlavička souboru**
```js
/**
 * cleanTex.js
 * Modul pro čištění LaTeXu od Word artefaktů.
 * @module core/latex/cleanTex
 */
```

**Funkce s JSDoc**
```js
/**
 * cleanTex
 * Odstraní Word artefakty a normalizuje vstup.
 * @param {string} raw - původní LaTeX
 * @returns {{ cleaned: string, protectedBlocks: string[] }}
 */
export function cleanTex(raw) { ... }
```

**Orchestrátor pseudokód**
```js
import { collectFormulas } from '../core/latex/collector.js';
import { cleanTex } from '../core/latex/cleanTex.js';
import { heuristicFix } from '../core/latex/heuristicFix.js';
import { validateFormula } from '../core/latex/validator.js';
import { texToOmml } from '../core/omml/texToOmml.js';
import { createStats, collectStats, finalizeStats } from '../core/stats/statsCollector.js';
import { renderPreview } from '../ui/renderer/previewRenderer.js';
import { buildDocx } from '../ui/export/docxExporter.js';

export async function processDocument(input) {
  const text = await IO.readInput(input);
  const candidates = collectFormulas(text);
  const stats = createStats();
  for (const batch of chunk(candidates, 20)) {
    const results = await Promise.all(batch.map(async (c) => {
      const direct = validateFormula(c.raw);
      if (direct.ok) return { ...c, tex: c.raw, status: 'ok', mode: 'direct' };
      const { cleaned } = cleanTex(c.raw);
      const { repaired, fixes } = heuristicFix(cleaned);
      const validated = validateFormula(repaired);
      if (validated.ok) return { ...c, tex: repaired, status: 'ok', fixes };
      return { ...c, status: 'error', reason: validated.reason };
    }));
    collectStats(stats, results);
    renderPreview(results.filter(r => r.status === 'ok'));
  }
  const omml = resultsToOmml(stats.okFormulas);
  const docx = buildDocx(input.originalDoc, omml);
  offerDownload(docx);
  finalizeStats(stats);
}
```

---

### Vývojové praktiky a CI
**Lint a formátování**
- Přidat ESLint a Prettier konfiguraci.
- Pravidla: 2 mezery, max-len 120, prefer `const`/`let`, no implicit any (pokud TS).

**Testy**
- Použít Jest nebo Vitest.
- Každý core modul má unit testy.
- Testy spouštět v CI.

**CI**
- GitHub Actions workflow:
  - `on: [push, pull_request]`
  - kroky: checkout, node setup, install, lint, test.

**Commit messages**
- `feat(core): add heuristicFix module`
- `refactor(app): orchestrator and module wiring`
- `test(core): add unit tests for cleanTex`

---

### Dodatečné poznámky pro Copilot
- Všechny moduly musí vracet čisté JS objekty, **nikdy** neměnit globální `state` přímo.
- UI moduly mohou manipulovat s DOM, ale **neobsahují** business logiku.
- Použít immutable pattern pro průchod dat.
- Přidat feature flag `config.flags.heuristics` pro snadné zapnutí/vypnutí heuristik.
- Zajistit, že debug log obsahuje `time`, `version`, `module`, `event`, `details`.

---

Vygeneruj všechny soubory a úpravy podle výše uvedeného promptu. Každý vytvořený soubor začni JSDoc hlavičkou a přidej minimální implementaci, která je bezpečná pro unit testy (čisté funkce, žádné DOM volání v core). Uprav existující `index.html` a `style.css` jen pokud je to nezbytné pro nové UI moduly. Ulož změny do samostatných commitů s doporučenými zprávami.