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

#### `cleanTex.js`
- Čištění LaTeX od Word artefaktů
- Normalizace vstupu
- **Funce:** `cleanTex(tex) -> { cleaned, protectedBlocks }`

#### `heuristicFix.js`
- Heuristické opravy běžných chyb
- Vyvažování delimitérů
- **Funkce:** `heuristicFix(tex) -> { repaired, fixes }`

#### `validator.js`
- Validace LaTeX struktury
- Ověřování párování závorek a prostředí
- **Funkce:** `validateLatexStructure(tex)`, `validateFormula(tex)`

#### `collector.js`
- Sběr kandidátů formulí z textu
- Rozpoznávání různých formátů ([ ], \\[ \\], \\( \\), atd.)
- **Funkce:** `collectFormulas(text, options) -> candidates[]`

#### `statsCollector.js`
- Sběr a správa statistik zpracování
- **Funkce:** `createStats()`, `collectStats(...)`, `finalizeStats(...)`

### Orchestrátor

#### `orchestrator.js`
- Centrální řídící logika
- Sekvenční zpracování: čištění → heuristika → validace → OMML
- Zpracování v dávkách (batches)
- **Funkce:** `processDocument(sourceText, options) -> Promise<result>`

### UI Moduly

#### `previewRenderer.js`
- Vykreslování formulí do DOM
- KaTeX rendering s fallback
- **Funkce:** `renderPreview(formulas, container)`, `renderUnprocessed(problems, container)`

#### `statsRenderer.js`
- Zobrazení statistik zpracování
- **Funkce:** `renderStats(stats, container)`

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

## Příští Kroky

1. Implementovat `docxExporter.js` pro DOCX generování
2. Přidat UI modul `editorInput.js` pro získání textu z editoru
3. Implementovat `autoTheme.js` pro detekci tématu
4. Vytvořit integrační testy
5. Optimalizovat performance pro větší dokumenty

## Poznámky k Vývoji

- Všechny core moduly jsou pure functions (bez side effectů)
- UI moduly mohou volat DOM API
- Orchestrátor řídí tok dat mezi moduly
- Debug informace se logují centrálně přes `debug.js`
- Statistiky se sbírají po každém kroku zpracování

---

Dokumentace: [README.md](../README.md)
