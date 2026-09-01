/**
 * app.js
 * Aplikační konfiguraci a inicializaci.
 * @module app/app
 */

const APP_VERSION = "2026.08.25.34";

export const config = {
  version: APP_VERSION,
  flags: {
    heuristics: true,
    fallback: true,
    debug: true,
  },
  limits: {
    maxFormulaLength: 5000,
    maxBatchSize: 20,
  },
};

/**
 * Inicializuje aplikaci
 * @returns {void}
 */
export function initializeApp() {
  console.log(`LaTeX to Word Converter v${APP_VERSION}`);
}

export { processDocument } from "./orchestrator.js";
