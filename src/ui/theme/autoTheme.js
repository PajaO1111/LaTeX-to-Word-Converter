/**
 * autoTheme.js
 * Detekce a správa systémového motivu (light/dark mode).
 * @module ui/theme/autoTheme
 */

const STORAGE_KEY = "app-theme";
const DARK_CLASS = "dark-mode";

/**
 * Detekuje preferovaný systémový motiv
 * @returns {"light" | "dark"} Detekovaný motiv
 */
export function detectSystemTheme() {
  if (typeof window === "undefined") return "light";

  const preference = window.matchMedia?.("(prefers-color-scheme: dark)");
  return preference?.matches ? "dark" : "light";
}

/**
 * Načte uložený motiv nebo systémový výchozí
 * @returns {"light" | "dark"} Motiv k aplikaci
 */
export function loadTheme() {
  if (typeof localStorage === "undefined") return detectSystemTheme();

  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "dark" || saved === "light" ? saved : detectSystemTheme();
}

/**
 * Uloží motiv do localStorage a aplikuje na dokument
 * @param {"light" | "dark"} theme - Motiv k uložení
 */
export function setTheme(theme) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, theme);
  }

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add(DARK_CLASS);
    } else {
      root.classList.remove(DARK_CLASS);
    }
  }
}

/**
 * Inicializuje motiv ze složeného zdroje
 * Nejdřív se pokusí načíst ze localStorage, pak detekuje systém
 * @returns {"light" | "dark"} Použitý motiv
 */
export function initializeTheme() {
  const theme = loadTheme();
  setTheme(theme);
  return theme;
}

/**
 * Přihlásí se na změny systémového motivu
 * @param {function} callback - Funkce volaná při změně (přijímá nový motiv)
 * @returns {function} Odhlašovací funkce
 */
export function onThemeChange(callback) {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
  if (!mediaQuery) return () => {};

  const handler = (e) => {
    const newTheme = e.matches ? "dark" : "light";
    callback(newTheme);
  };

  mediaQuery.addListener?.(handler);

  return () => {
    mediaQuery.removeListener?.(handler);
  };
}
