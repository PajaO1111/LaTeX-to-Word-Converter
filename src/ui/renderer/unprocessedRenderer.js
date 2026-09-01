/**
 * unprocessedRenderer.js
 * Vykreslení seznamu zpracovaných chyb a problémů.
 * @module ui/renderer/unprocessedRenderer
 */

import { escapeXml } from "../../core/utils/escapeXml.js";

/**
 * Vykreslí seznam nezpracovaných/chybných formulí
 * @param {Array} problems - Seznam problémů
 * @param {Object} problems[].raw - Původní text
 * @param {string} problems[].reason - Důvod chyby
 * @param {HTMLElement} container - DOM kontejner
 * @returns {number} Počet vykreslených problémů
 */
export function renderUnprocessed(problems = [], container) {
  if (!container) {
    console.warn("renderUnprocessed: kontejner nebyl poskytnut");
    return 0;
  }

  if (!Array.isArray(problems) || problems.length === 0) {
    container.innerHTML = '<div class="no-problems">Žádné chyby ke zobrazení</div>';
    return 0;
  }

  const fragment = document.createDocumentFragment();
  const header = document.createElement("div");
  header.className = "problems-header";
  header.innerHTML = `<h3>Nezpracované formule (${problems.length})</h3>`;
  fragment.appendChild(header);

  const list = document.createElement("div");
  list.className = "problems-list";

  problems.forEach((problem, index) => {
    const card = document.createElement("div");
    card.className = "problem-card";

    const label = document.createElement("div");
    label.className = "problem-label";
    label.textContent = `${index + 1}`;

    const content = document.createElement("div");
    content.className = "problem-content";

    const raw = document.createElement("div");
    raw.className = "problem-raw";
    raw.innerHTML = `<strong>Original:</strong> <code>${escapeXml(problem.raw || "")}</code>`;

    const reason = document.createElement("div");
    reason.className = "problem-reason";
    reason.innerHTML = `<strong>Reason:</strong> ${escapeXml(problem.reason || "Unknown error")}`;

    content.appendChild(raw);
    content.appendChild(reason);

    card.appendChild(label);
    card.appendChild(content);
    list.appendChild(card);
  });

  fragment.appendChild(list);
  container.innerHTML = "";
  container.appendChild(fragment);

  return problems.length;
}

/**
 * Přidá problém do existujícího kontejneru
 * @param {HTMLElement} container - DOM kontejner
 * @param {Object} problem - Problém k přidání
 * @param {string} problem.raw - Původní text
 * @param {string} problem.reason - Důvod chyby
 * @returns {HTMLElement} Vytvořený element
 */
export function appendProblem(container, problem) {
  if (!container || !problem) return null;

  const card = document.createElement("div");
  card.className = "problem-card";

  const label = document.createElement("div");
  label.className = "problem-label";

  const problemsList = container.querySelectorAll(".problem-card");
  label.textContent = String(problemsList.length + 1);

  const content = document.createElement("div");
  content.className = "problem-content";

  const raw = document.createElement("div");
  raw.className = "problem-raw";
  raw.innerHTML = `<strong>Original:</strong> <code>${escapeXml(problem.raw || "")}</code>`;

  const reason = document.createElement("div");
  reason.className = "problem-reason";
  reason.innerHTML = `<strong>Reason:</strong> ${escapeXml(problem.reason || "Unknown error")}`;

  content.appendChild(raw);
  content.appendChild(reason);

  card.appendChild(label);
  card.appendChild(content);

  const problemsList2 = container.querySelector(".problems-list");
  if (problemsList2) {
    problemsList2.appendChild(card);
  } else {
    container.appendChild(card);
  }

  return card;
}

/**
 * Vyprázdní seznam problémů
 * @param {HTMLElement} container - DOM kontejner
 */
export function clearProblems(container) {
  if (!container) return;

  container.innerHTML = "";
}

/**
 * Vrátí počet zobrazených problémů
 * @param {HTMLElement} container - DOM kontejner
 * @returns {number} Počet problémů
 */
export function getProblemCount(container) {
  if (!container) return 0;

  return container.querySelectorAll(".problem-card").length;
}

/**
 * Vrátí seznam problémů ze kontejneru (extrahuje data z DOM)
 * @param {HTMLElement} container - DOM kontejner
 * @returns {Array} Seznam problémů
 */
export function extractProblems(container) {
  if (!container) return [];

  const problems = [];
  container.querySelectorAll(".problem-card").forEach((card) => {
    const rawEl = card.querySelector(".problem-raw code");
    const reasonEl = card.querySelector(".problem-reason");

    problems.push({
      raw: rawEl?.textContent || "",
      reason: reasonEl?.textContent?.replace("Reason: ", "") || "Unknown error",
    });
  });

  return problems;
}
