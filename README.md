# LaTeX do Wordu

Lokální aplikace pro převod LaTeX rovnic do formátu Office Math (OMML), který je plně kompatibilní s Microsoft Word. Aplikace běží přímo v prohlížeči, pracuje bez backendu a umožňuje export upraveného DOCX dokumentu s matematickými objekty.

<a href="help-redirect.html" target="_blank">Help</a>

## Co aplikace umí

- načítá text z editoru nebo DOCX souboru,
- identifikuje a izoluje LaTeX rovnice,
- odstraňuje běžné Word artefakty a rozbité sekvence,
- opravuje běžné chyby v zápisu závorek a příkazů,
- validuje rostoucí množství formulí,
- vykresluje náhled přes KaTeX,
- převádí validní rovnice do OMML,
- sestaví upravený DOCX dokument pro Word,
- poskytuje statistiku a debug log pro analýzu.

## Jak aplikace funguje

Celý postup je rozdělen do modulů a probíhá v logickém pořadí:

1. Načtení vstupu
2. Sběr kandidátů na rovnice
3. Čištění a normalizace textu
4. Heuristické opravy
5. Validace po opravě
6. Výpočet statistik a logů
7. Render náhledu
8. Převod do OMML
9. Export DOCX

## Struktura projektu

```text
latex-do-wordu/
├── app.js
├── index.html
├── style.css
├── help-redirect.html
├── README.md
├── uprava.md
├── docs/
│   └── README.md
├── docx/
│   ├── test_rovnice.txt
│   ├── test_700.txt
│   └── ...
├── src/
│   ├── app/
│   │   ├── app.js
│   │   └── orchestrator.js
│   ├── core/
│   │   ├── latex/
│   │   ├── omml/
│   │   ├── stats/
│   │   └── utils/
│   ├── ui/
│   │   ├── editor/
│   │   ├── events/
│   │   ├── export/
│   │   ├── renderer/
│   │   └── theme/
│   └── README.md
├── tests/
│   ├── unit/
│   └── integration/
├── vendor/
│   └── katex/
├── package.json
├── eslint.config.js
├── .github/
│   └── workflows/
└── README.md
```

## Popis hlavních částí

### Core layer
Zde se nachází čistá logika zpracování LaTeXu a OMML:

- `cleanTex` – odstraňuje Word artefakty a běžný šum,
- `heuristicFix` – opravuje časté překlepy a neúplné struktury,
- `validator` – kontroluje, zda je rovnice syntakticky validní,
- `collector` – hledá LaTeX formula candidates ve vstupním textu,
- `texToOmml` – převadí text do OMML,
- `statsCollector` – shromažďuje výstupní statistiky,
- `debug` – centralizuje diagnostiku.

### UI layer
UI vrstva pracuje s DOM a vlastní náhledem, exportem a eventy:

- editor a input sanitization,
- KaTeX preview rendering,
- seznam nevyřízených formulí,
- statistický panel,
- export do DOCX,
- registrace tlačítek a událostí.

### App orchestration
Hlavní workflow je v [src/app/orchestrator.js](src/app/orchestrator.js) a vrstvách v [src/app/app.js](src/app/app.js). Orchestrátor řídí tok dat od vstupu po export.

## Jak zapisovat rovnice

Nejpřesnější je samostatný blok v jedné z těchto forem:

```text
[
\boxed{B^m}
]
```

```text
\[ \boxed{B^m} \]
```

Fungují také zápisy na jedné řádce, inline formy `\( ... \)` a `$...$`.

## Výstup a kompatibilita

- výsledný dokument zachovává obsah mimo rovnice,
- úpravou se mění pouze zjištěné bloky rovnic,
- rovnice jsou exportovány ve formátu Office Math (OMML),
- po exportu je možné je v Wordu dále upravovat jako matematické objekty.

## Omezení

Aplikace podporuje praktickou podmnožinu LaTeXu: zlomky, odmocniny, indexy, mocniny, řecká písmena, `\mathbf`, `\mathrm`, `\text`, `\boxed`, jednoduché operátory, základní matice a vektory. Složitější balíčky nebo specializované konstrukce mohou být zjednodušeny.

## Diagnostika a testování

Aplikace umožňuje zobrazení statistiky zpracování a detailního debug logu. Testy ověřují:

- čištění textu,
- heuristické opravy,
- validaci rovnic,
- sběr formulí,
- OMML konverzi,
- robustnost na reálná data.

Pro spuštění testů:

```bash
npm install
npm test -- --run
npm run lint
```

## Dokumentace

Detailní technická dokumentace projektu je v [docs/README.md](docs/README.md).

## Technologie

- JavaScript / ES modules
- KaTeX
- JSZip
- Vitest
- ESLint / Prettier

## Poznámka

Projekt je plně lokální a nesendí data na server. Vše probíhá v prohlížeči uživatele.
