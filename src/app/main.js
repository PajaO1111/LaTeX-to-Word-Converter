/**
 * main.js
 * Prohlížečový vstupní bod aplikace – propojuje DOM prvky index.html s core/ui moduly.
 * Nahrazuje původní monolitický kořenový app.js.
 * @module app/main
 */

import { cleanTex, fallbackTex } from "../core/latex/cleanTex.js";
import { heuristicFix } from "../core/latex/heuristicFix.js";
import { classifyFixes } from "../core/latex/classifyFixes.js";
import { collectFormulas } from "../core/latex/collector.js";
import { validateFormulaWithFallback } from "../core/latex/validator.js";
import { formulaProblems, invalidFormulaSet } from "../core/latex/formulaProblems.js";
import { texToOmml } from "../core/omml/texToOmml.js";
import { createStats, collectStats, finalizeStats } from "../core/stats/statsCollector.js";
import { debug, initDebug, getDebugLog, getAppVersion } from "../core/utils/debug.js";
import { documentMathCount, xmlParagraphText } from "../core/utils/xmlNamespaces.js";
import { renderPreview, renderUnprocessed } from "../ui/renderer/previewRenderer.js";
import { renderStats } from "../ui/renderer/statsRenderer.js";
import {
  createDocxFromEditor,
  transformDocumentXml,
  validateInputFormat,
  validateDocxPackage,
  downloadDocx,
} from "../ui/export/docxExporter.js";
import {
  createHtmlFromEditor,
  buildHtmlDocument,
  downloadHtml,
} from "../ui/export/htmlExporter.js";

const $ = (id) => document.getElementById(id);

const state = {
  file: null,
  zip: null,
  documentXml: null,
  sourceName: "rovnice",
  stats: null,
};

/** Vrátí zdrojový text: text nahraného DOCX, nebo obsah editoru. */
function sourceText() {
  if (state.documentXml) return xmlParagraphText(state.documentXml);
  return [...$("editor").childNodes]
    .map((node) => (node.nodeType === Node.TEXT_NODE ? node.nodeValue : node.innerText))
    .join("\n");
}

/** Zpracuje jeden kandidát formule: přímá validace, jinak cleanTex + heuristicFix. */
function prepareFormula(raw, kind) {
  const originalTex = String(raw || "").trim();
  const direct = validateFormulaWithFallback(originalTex, fallbackTex);
  if (direct.ok && direct.mode === "direct") {
    return { raw: originalTex, tex: originalTex, status: "valid", kind, fixes: [] };
  }
  const { cleaned } = cleanTex(originalTex);
  const { repaired } = heuristicFix(cleaned);
  const validation = validateFormulaWithFallback(repaired, fallbackTex);
  const fixes = classifyFixes(originalTex, repaired);
  return {
    raw: originalTex,
    tex: repaired,
    status: validation.ok ? "fixed" : "invalid",
    kind,
    fixes,
    reason: validation.ok ? "" : validation.reason || direct.reason,
  };
}

/** Spustí kontrolu zdroje: sběr kandidátů, zpracování, náhled a statistiky. */
function scan() {
  const started = performance.now();
  initDebug();
  state.stats = createStats();
  state.stats.startedAt = new Date().toISOString();
  const text = sourceText();
  const candidates = collectFormulas(text, {
    collectInline: $("convert-inline").checked,
    collectParentheses: $("convert-paren").checked,
    fromDocx: Boolean(state.documentXml),
  });
  const seen = new Set();
  const formulas = [];
  for (const candidate of candidates) {
    const prepared = prepareFormula(candidate.raw, candidate.kind);
    collectStats(state.stats, prepared.raw, prepared.tex, prepared.fixes);
    if (seen.has(prepared.tex)) continue;
    seen.add(prepared.tex);
    formulas.push(prepared);
  }
  const problems = formulaProblems(formulas, { warnVectorEquals: $("warn-vector-equals").checked });
  const unclosed = (text.match(/\[/g) || []).length > (text.match(/\]/g) || []).length;
  $("diagnostics").classList.toggle("error", unclosed);
  const existing = state.documentXml ? documentMathCount(state.documentXml) : 0;
  $("diagnostics").textContent = formulas.length
    ? `Nalezeno ${formulas.length} nových zápisů${existing ? `; ${existing} již převedených rovnic bude zachováno` : ""}. ${unclosed ? "Pozor: nejméně jeden blok [ … ], případně \\[ … \\], není uzavřen." : "Závorky vypadají uzavřeně."}`
    : unclosed
      ? "Nebyl nalezen uzavřený blok; alespoň jedna hranatá závorka chybí."
      : existing
        ? `Nebyl nalezen nový LaTeX; ${existing} již převedených rovnic bude zachováno.`
        : "Nebyl nalezen žádný blok [ … ], \\[ … \\] ani aktivní inline zápis.";
  renderPreview(formulas, $("preview"), debug);
  renderUnprocessed(problems, $("unprocessed"));
  state.stats.formulasBefore = candidates.length;
  state.stats.formulasAfter = formulas.length;
  finalizeStats(state.stats, getDebugLog());
  state.stats.endedAt = new Date().toISOString();
  state.stats.durationMs = Math.round(performance.now() - started);
  renderStats(state.stats, $("stats"));
  $("export-note").textContent = formulas.length
    ? `Při exportu bude zpracováno ${formulas.length} rozpoznaných zápisů.`
    : "Bez nalezeného vzorce bude stažen jen běžný text.";
  return formulas;
}

async function exportDocx() {
  try {
    const formulas = scan();
    const invalidTexes = invalidFormulaSet(formulas, {
      warnVectorEquals: $("warn-vector-equals").checked,
    });
    const existingMath = state.documentXml ? documentMathCount(state.documentXml) : 0;
    if (!formulas.length && !state.documentXml && $("editor").textContent.trim() === "") {
      throw new Error("Nejsou k dispozici žádné data k exportu. Vložte text nebo načtěte DOCX.");
    }
    let zip, name;
    if (state.zip && state.documentXml) {
      zip = state.zip;
      zip.file(
        "word/document.xml",
        transformDocumentXml(state.documentXml, invalidTexes, $("convert-paren").checked)
      );
      name = state.sourceName.replace(/\.docx$/i, "") + "_rovnice.docx";
    } else {
      zip = createDocxFromEditor($("editor"), invalidTexes, $("convert-inline").checked);
      name = "text_s_rovnicemi.docx";
    }
    $("export-note").textContent = "Probíhá validace výsledného DOCX…";
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    await validateInputFormat(blob, "docx");
    const convertible = formulas.filter(
      (formula) => formula.status !== "invalid" && !invalidTexes.has(formula.tex)
    ).length;
    const report = await validateDocxPackage(blob, existingMath + convertible);
    downloadDocx(blob, name);
    const skipped = invalidTexes.size
      ? ` Přeskočeno jako text: ${invalidTexes.size} neplatných zápisů; podrobnosti jsou v přehledu kontroly.`
      : "";
    $("export-note").textContent =
      `Hotovo: ${name}. Validace prošla (${report.files} částí ZIP, ${report.mathCount} objektů Office Math).${skipped}`;
  } catch (error) {
    debug("export-error", { error: error.message });
    $("export-note").textContent = "Export se nezdařil: " + error.message;
  }
}

function exportHtml() {
  try {
    const formulas = scan();
    const invalidTexes = invalidFormulaSet(formulas, {
      warnVectorEquals: $("warn-vector-equals").checked,
    });
    const bodyHtml = createHtmlFromEditor(
      $("editor"),
      state.documentXml,
      invalidTexes,
      $("convert-inline").checked
    );
    downloadHtml(buildHtmlDocument(bodyHtml), "latex-rovnice.html");
    $("export-note").textContent = formulas.length
      ? `Hotovo: export HTML obsahuje původní text a ${formulas.length} zpracovaných rovnic.`
      : "Hotovo: export HTML byl vytvořen s původním textem bez rozpoznaných rovnic.";
  } catch (error) {
    debug("export-html-error", { error: error.message });
    $("export-note").textContent = "Export HTML se nezdařil: " + error.message;
  }
}

function downloadDebugLog() {
  const lines = getDebugLog().map((entry) => JSON.stringify(entry)).join("\n") || "Žádný debug log.";
  const content = `# LaTeX → Word debug log\n# version: ${getAppVersion()}\n# generated: ${new Date().toISOString()}\n${lines}\n`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["\uFEFF", content], { type: "text/plain;charset=utf-8" }));
  link.download = `latex-word-debug-${getAppVersion().replace(/\./g, "-")}.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function runStressTest() {
  const started = performance.now();
  const scenarios = [
    (index) => `\\left[\\vec{x}_{${index}}=\\begin{pmatrix}${index}\\\\${index + 1}\\end{pmatrix}\\right]`,
    (index) => `\\left[\\left\\{a_${index}+b_${index}\\right\\}\\right]`,
    () => `RAM_{req uired}\\leqRA M_{available}`,
    (index) => `x \\oplusValue_${index}=y`,
    (index) => `\\begin{pmatrix}x_1x_2\\\\${index}\\end{pmatrix}`,
  ];
  const formulas = Array.from({ length: 520 }, (_, index) => scenarios[index % scenarios.length](index));
  let rendered = 0;
  let converted = 0;
  const renderStarted = performance.now();
  for (const tex of formulas) {
    try {
      katex.renderToString(tex, { throwOnError: false, strict: "ignore" });
      rendered++;
    } catch {
      /* počítáno jako neúspěšný render */
    }
  }
  const renderMs = Math.round(performance.now() - renderStarted);
  const convertStarted = performance.now();
  for (const tex of formulas) {
    try {
      texToOmml(tex);
      converted++;
    } catch {
      /* počítáno jako neúspěšná konverze */
    }
  }
  const convertMs = Math.round(performance.now() - convertStarted);
  const box = $("stress-results");
  if (box)
    box.textContent = `Otestováno ${formulas.length} rovnic: KaTeX ${rendered}/${formulas.length} za ${renderMs} ms, OMML ${converted}/${formulas.length} za ${convertMs} ms, celkem ${Math.round(performance.now() - started)} ms.`;
}

$("docx-file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    await validateInputFormat(file.name, "file");
    state.file = file;
    state.sourceName = file.name;
    if (/\.docx$/i.test(file.name)) {
      const zip = await JSZip.loadAsync(file);
      const xmlFile = zip.file("word/document.xml");
      if (!xmlFile) throw new Error("Soubor nemá standardní strukturu DOCX.");
      state.zip = zip;
      state.documentXml = await xmlFile.async("string");
      $("file-name").textContent = file.name;
      $("editor").textContent =
        "Nahraný DOCX je připraven k převodu. Pro přepnutí na vložený text soubor zrušte výběrem jiného zdroje.";
    } else {
      state.zip = null;
      state.documentXml = null;
      $("editor").textContent = await file.text();
      $("file-name").textContent = `${file.name} (prostý text)`;
    }
    scan();
  } catch (error) {
    $("file-name").textContent = "Soubor se nepodařilo načíst: " + error.message;
  }
});

$("use-plain-text").addEventListener("click", () => {
  state.file = state.zip = state.documentXml = null;
  $("editor").textContent = $("plain-text").value;
  $("file-name").textContent = "Použit vložený text";
  scan();
});

$("editor").addEventListener("input", () => {
  if (state.documentXml) {
    state.file = state.zip = state.documentXml = null;
    $("file-name").textContent = "Použit vložený obsah";
  }
});

$("scan").addEventListener("click", scan);
$("download").addEventListener("click", exportDocx);
$("download-html").addEventListener("click", exportHtml);

const debugButton = document.createElement("button");
debugButton.type = "button";
debugButton.className = "minor";
debugButton.textContent = "Stáhnout debug log";
debugButton.addEventListener("click", downloadDebugLog);
$("export-note").after(debugButton);

const themeToggle = $("theme-toggle");
const applyTheme = (dark) => {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeToggle.textContent = dark ? "Světlý režim" : "Tmavý režim";
  themeToggle.setAttribute("aria-pressed", String(dark));
};
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
let manualTheme = null;
try {
  const storedTheme = localStorage.getItem("latex-word-theme");
  if (storedTheme === "dark" || storedTheme === "light") manualTheme = storedTheme;
} catch {
  /* localStorage může být zakázaný */
}
applyTheme(manualTheme ? manualTheme === "dark" : systemTheme.matches);
systemTheme.addEventListener("change", (event) => {
  if (!manualTheme) applyTheme(event.matches);
});
themeToggle.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  manualTheme = dark ? "dark" : "light";
  applyTheme(dark);
  try {
    localStorage.setItem("latex-word-theme", manualTheme);
  } catch {
    /* změna platí jen pro tuto relaci */
  }
});

$("stress-test").addEventListener("click", runStressTest);

window.latexWordApp = { scan, sourceText };
