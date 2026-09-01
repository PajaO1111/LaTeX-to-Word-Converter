/**
 * debug.js
 * Centralizovaný debug logger pro sledování zpracování.
 * @module core/utils/debug
 */

const APP_VERSION = "2026.08.25.34";

/**
 * Debug log instance - měl by být inicializován orchestrátorem
 * @type {Object[]}
 */
let debugLog = [];

/**
 * Inicializuje debug logger
 * @returns {void}
 */
export function initDebug() {
  debugLog = [];
}

/**
 * Resetuje debug log
 * @returns {void}
 */
export function resetDebug() {
  debugLog = [];
}

/**
 * Přidá debug záznam do logu
 * @param {string} event - typ události
 * @param {Object} data - další data
 * @returns {void}
 */
export function debug(event, data = {}) {
  debugLog.push({
    time: new Date().toISOString(),
    version: APP_VERSION,
    event,
    ...data,
  });
}

/**
 * Vrátí aktuální debug log
 * @returns {Object[]} kopie logu
 */
export function getDebugLog() {
  return [...debugLog];
}

/**
 * Vrátí verzi aplikace
 * @returns {string}
 */
export function getAppVersion() {
  return APP_VERSION;
}
