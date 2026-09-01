# LaTeX to Word Converter - Modulární Architektura

Refaktorovaná architektura projektu LaTeX to Word s modulární strukturou podle SOLID principů.

## Struktura Projektu

```
/src
  /core           # Jádro - obchodní logika bez DOM
    /latex        # LaTeX zpracování
      cleanTex.js
      heuristicFix.js
      validator.js
      classifyFixes.js
      collector.js
    /omml         # Konverze do OMML
      texToOmml.js
      xmlBuilder.js
    /stats        # Statistiky zpracování
      statsCollector.js
    /utils        # Utilita
      debug.js
      escapeXml.js
      knownCommands.js
  /ui             # Uživatelské rozhraní
    /renderer
      previewRenderer.js
      statsRenderer.js
    /theme
      autoTheme.js
    /editor
      editorInput.js
    /export
      docxExporter.js
  /app            # Aplikační logika
    app.js
    orchestrator.js
    config.js

/tests
  /unit
    cleanTex.test.js
    validator.test.js
    heuristicFix.test.js

/.github/workflows
  ci.yml          # GitHub Actions workflow
```

## Klíčové Moduly

### Core - Obchodní Logika

#### `core/latex/cleanTex.js`
- Čištění LaTeX od Word artefaktů
- Normalizace vstupu
- **Funkce:** `cleanTex(tex) -> { cleaned, protectedBlocks }`, `fallbackTex(tex)`

#### `core/latex/heuristicFix.js`
- Heuristické opravy běžných chyb
- Vyvažování delimitérů
- **Funkce:** `heuristicFix(tex) -> { repaired, fixes }`

#### `core/latex/validator.js`
- Validace LaTeX struktury
- Ověřování párování závorek a prostředí
- **Funkce:** `validateLatexStructure(tex)`, `validateFormula(tex)`, `validateFormulaWithFallback(tex, fallbackFn)`

#### `core/latex/classifier.js`
- Kategorizace oprav LaTeX
- **Funkce:** `classifyFixes(original, cleaned)`

#### `core/latex/collector.js`
- Sběr kandidátů formulí z textu
- Rozpoznávání různých formátů ([ ], \\[ \\], \\( \\), atd.)
- **Funkce:** `collectFormulas(text, options) -> candidates[]`

#### `core/omml/texToOmml.js`
- Konverze LaTeX do Office Math Markup Language (OMML)
- **Funkce:** `texToOmml(tex)`, `formulasToOmml(formulas)`

#### `core/omml/xmlBuilder.js`
- Pomocné funkce pro generování OMML XML
- **Funkce:** `mathRun(text, variant)`, `wordRun(text, style)`, `fraction()`, `radical()`

#### `core/stats/statsCollector.js`
- Sběr a správa statistik zpracování
- **Funkce:** `createStats()`, `collectStats(stats, original, cleaned)`, `finalizeStats(stats, debugLog)`

#### `core/utils/debug.js`
- Centrální debug logging
- **Funkce:** `initDebug()`, `debug(event, data)`, `getDebugLog()`, `resetDebug()`

#### `core/utils/escapeXml.js`
- XML entity escaping pro OMML
- **Funkce:** `escapeXml(value)`

#### `core/utils/knownCommands.js`
- Registry LaTeX příkazů a symbolů
- **Export:** `knownCommands Set`, `symbols object`, `operators object`

### UI - Uživatelské Rozhraní

#### `ui/renderer/previewRenderer.js`
- Vykreslování formulí do DOM
- KaTeX rendering s fallback
- **Funkce:** `renderPreview(formulas, container, debugFn)`, `renderUnprocessed(problems, container)`

#### `ui/renderer/statsRenderer.js`
- Zobrazení statistik zpracování
- **Funkce:** `renderStats(stats, container)`

#### `ui/renderer/unprocessedRenderer.js`
- Vykreslení seznamu chyb a problémů
- **Funkce:** `renderUnprocessed(problems, container)`, `appendProblem()`, `clearProblems()`, `getProblemCount()`

#### `ui/theme/autoTheme.js`
- Detekce a správa systémového tématu (light/dark mode)
- **Funkce:** `detectSystemTheme()`, `loadTheme()`, `setTheme(theme)`, `initializeTheme()`, `onThemeChange(callback)`

#### `ui/editor/editorInput.js`
- Extrakce textu z HTML editoru
- Sanitizace vstupu
- **Funkce:** `getEditorText(element, options)`, `setEditorText()`, `sanitizeInput()`, `clearEditor()`

#### `ui/export/docxExporter.js`
- Generování DOCX souboru s OMML rovnicemi
- Validace DOCX struktury
- **Funkce:** `buildDocx(sourceText, ommlFragments)`, `downloadDocx(blob, filename)`, `validateDocxBlob(blob)`

#### `ui/events/eventHandlers.js`
- Správa DOM event listenerů a delegace
- **Funkce:** `on()`, `onClick()`, `onInput()`, `onChange()`, `onSubmit()`, `onDrop()`, `onKeyDown()`, `delegate()`, `registerHandlers()`

### Aplikační Logika

#### `app/orchestrator.js`
- Centrální řídící logika
- Sekvenční zpracování: čištění → heuristika → validace → OMML
- Zpracování v dávkách (batches)
- **Funkce:** `processDocument(sourceText, options) -> Promise<result>`, `processFormula()`, `processBatch()`

#### `app/app.js`
- Konfigurační objekt a inicializace
- **Export:** `config object`, `initializeApp()`, `processDocument()`

## Vývojový Postup

### 1. Instalace Závislostí
```bash
npm install
```

### 2. Spuštění Testů
```bash
npm test
npm run test:watch
```

### 3. Linting a Formátování
```bash
npm run lint
npm run lint:fix
npm run format
```

### 4. Vývoj
```bash
npm run dev
```

## Design Principy

### Immutability
- Všechny moduly vracejí nové objekty
- Nemění globální state přímo

### Separation of Concerns
- `core/` - Čistá obchodní logika, bez DOM
- `ui/` - Vykreslování a DOM manipulace
- `app/` - Orchestrace a konfiguraci

### SOLID
- **S**: Jeden modul = jednu odpovědnost
- **O**: Otevřeno pro rozšíření, uzavřeno pro modifikaci
- **L**: Liskov substitution - kompatibilní interface
- **I**: Interface segregation - minimální interface
- **D**: Dependency inversion - injektáž závislostí

## Testování

Testy jsou v `/tests/unit/` a vytvořeny pomocí Vitest.

Každý modul by měl mít:
- Testy happy-path
- Testy chybových stavů
- Testy edge-cases

## CI/CD

GitHub Actions workflow v `.github/workflows/ci.yml` spouští:
- ESLint linting
- Unit testy
- npm audit (security check)

## Migration z Monolitu

Původní monolitický `app.js` byl rozdělen takto:

| Funkce | Nový Modul |
|--------|-----------|
| `cleanTex()` | `core/latex/cleanTex.js` |
| `heuristicFix()` | `core/latex/heuristicFix.js` |
| `validateLatexStructure()` | `core/latex/validator.js` |
| `validateFormula()` | `core/latex/validator.js` |
| `classifyFixes()` | `core/latex/classifyFixes.js` |
| `collectFormulas()` | `core/latex/collector.js` |
| `createStats()` | `core/stats/statsCollector.js` |
| `debug()` | `core/utils/debug.js` |
| `renderPreview()` | `ui/renderer/previewRenderer.js` |
| `renderStats()` | `ui/renderer/statsRenderer.js` |
| `renderUnprocessed()` | `ui/renderer/unprocessedRenderer.js` |
| Detekce tématu | `ui/theme/autoTheme.js` |
| Získání textu z editoru | `ui/editor/editorInput.js` |
| Generování DOCX | `ui/export/docxExporter.js` |
| Event management | `ui/events/eventHandlers.js` |
| Orchestrační logika | `app/orchestrator.js` |

## Implementační Status

### ✅ Dokončeno
- Všechny core moduly (latex, omml, stats, utils)
- Všechny UI moduly (renderer, theme, editor, export, events)
- Orchestrátor a aplikační logika
- Unit testy (22 passing)
- ESLint a Prettier konfigurace
- GitHub Actions CI workflow

### 📋 Připraveno pro Integration Testy
- Aplikace je připravena na integrační testy
- Všechny moduly splňují SOLID principy
- API je stabilní a testovatelné

## Příští Kroky

1. Integrační testy - ověřit komunikaci mezi moduly
2. Performance optimalizace pro větší dokumenty
3. Přidání podpory pro více LaTeX balíčků
4. Uživatelská dokumentace a tutoriály

## Poznámky k Vývoji

- Všechny core moduly jsou pure functions (bez side effectů)
- UI moduly mohou volat DOM API
- Orchestrátor řídí tok dat mezi moduly
- Debug informace se logují centrálně přes `debug.js`
- Statistiky se sbírají po každém kroku zpracování

---

Dokumentace: [README.md](../README.md)
