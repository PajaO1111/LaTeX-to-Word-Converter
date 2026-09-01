/**
 * previewRenderer.js
 * Vykreslování náhledu formulí pomocí KaTeX.
 * @module ui/renderer/previewRenderer
 */

/**
 * Fallback funkce pro TeX - odstraní problematické příkazy
 * @param {string} tex - LaTeX string
 * @returns {string} zjednodušený LaTeX
 */
function fallbackTex(tex) {
  return String(tex || "")
    .replace(/\\left\s*/g, "")
    .replace(/\\right\s*/g, "");
}

/**
 * Vykresluje náhled formulí do DOM
 * @param {Object[]} formulas - seznam formulí k vykreslení
 * @param {HTMLElement} container - DOM kontejner pro vykreslení
 * @param {Function} debugFn - debug funkce
 * @returns {void}
 */
export function renderPreview(formulas, container, debugFn = () => {}) {
  if (!container) return;

  container.innerHTML = "";

  if (!formulas || formulas.length === 0) {
    container.classList.add("empty");
    container.textContent = "Nebyly nalezeny žádné rovnice.";
    return;
  }

  container.classList.remove("empty");

  const renderBatch = (start) => {
    const fragment = document.createDocumentFragment();

    formulas.slice(start, start + 50).forEach((item, offset) => {
      const index = start + offset;
      const card = document.createElement("article");
      card.className = "formula-card";

      const label = document.createElement("div");
      label.className = "formula-label";
      label.textContent = `${index + 1}. ${item.kind || "formule"}`;

      const formulaDiv = document.createElement("div");
      formulaDiv.className = "formula";

      const code = document.createElement("pre");
      code.textContent = item.tex || item.raw || "";

      try {
        if (typeof katex !== "undefined") {
          katex.render(item.tex || item.raw || "", formulaDiv, {
            displayMode: true,
            throwOnError: true,
            strict: "ignore",
          });
        } else {
          formulaDiv.textContent = item.tex || item.raw || "";
        }
      } catch (error) {
        const fallback = fallbackTex(item.tex || item.raw || "");
        debugFn("katex-fallback", {
          original: item.tex || item.raw,
          fallback,
          error: error.message,
        });

        try {
          if (typeof katex !== "undefined") {
            katex.render(fallback, formulaDiv, {
              displayMode: true,
              throwOnError: true,
              strict: "ignore",
            });
          } else {
            formulaDiv.textContent = fallback;
          }
        } catch {
          card.classList.add("error");
          formulaDiv.textContent = "KaTeX tento zápis nevyhodnotil: " + error.message;
        }
      }

      card.append(label, formulaDiv, code);
      fragment.append(card);
    });

    container.append(fragment);

    if (start + 50 < formulas.length) {
      requestAnimationFrame(() => renderBatch(start + 50));
    }
  };

  renderBatch(0);
}

/**
 * Vykresluje chybné nebo neúspěšně zpracované formule
 * @param {Object[]} problems - seznam problémů
 * @param {HTMLElement} container - DOM kontejner
 * @returns {void}
 */
export function renderUnprocessed(problems, container) {
  if (!container) return;

  container.innerHTML = "";

  if (!problems || problems.length === 0) {
    container.textContent = "Všechny formule byly úspěšně zpracovány.";
    return;
  }

  const fragment = document.createDocumentFragment();

  problems.forEach((problem, index) => {
    const item = document.createElement("div");
    item.className = `problem problem-${problem.severity || "error"}`;

    const title = document.createElement("strong");
    title.textContent = `${index + 1}. ${problem.reason || "Neznámá chyba"}`;

    const code = document.createElement("pre");
    code.textContent = problem.tex || problem.normalizedTex || "";

    item.append(title, code);
    fragment.append(item);
  });

  container.append(fragment);
}
