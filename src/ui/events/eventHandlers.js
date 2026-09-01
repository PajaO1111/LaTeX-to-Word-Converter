/**
 * eventHandlers.js
 * Správa event listenerů a uživatelských interakcí.
 * @module ui/events/eventHandlers
 */

/**
 * Zaregistruje event listener s možností odregistrace
 * @param {HTMLElement} element - Element ke kterému se listener připojuje
 * @param {string} eventType - Typ eventu (click, input, change, atd.)
 * @param {function} handler - Handler funkce
 * @returns {function} Odregistrační funkce
 */
export function on(element, eventType, handler) {
  if (!element || typeof handler !== "function") {
    return () => {};
  }

  element.addEventListener(eventType, handler);

  // Vrátí funkci na odregistraci
  return () => {
    element.removeEventListener(eventType, handler);
  };
}

/**
 * Zaregistruje click handler
 * @param {HTMLElement} element - Element
 * @param {function} handler - Handler funkce
 * @returns {function} Odregistrační funkce
 */
export function onClick(element, handler) {
  return on(element, "click", handler);
}

/**
 * Zaregistruje input handler
 * @param {HTMLElement} element - Element
 * @param {function} handler - Handler funkce (přijímá event)
 * @returns {function} Odregistrační funkce
 */
export function onInput(element, handler) {
  return on(element, "input", handler);
}

/**
 * Zaregistruje change handler
 * @param {HTMLElement} element - Element
 * @param {function} handler - Handler funkce
 * @returns {function} Odregistrační funkce
 */
export function onChange(element, handler) {
  return on(element, "change", handler);
}

/**
 * Zaregistruje submit handler na formulář
 * @param {HTMLFormElement} form - Formulář
 * @param {function} handler - Handler funkce (přijímá event)
 * @returns {function} Odregistrační funkce
 */
export function onSubmit(form, handler) {
  if (!form) return () => {};

  const wrappedHandler = (e) => {
    e.preventDefault();
    handler(e);
  };

  return on(form, "submit", wrappedHandler);
}

/**
 * Zaregistruje dragover a drop handlery
 * @param {HTMLElement} element - Element
 * @param {function} onDrop - Handler na drop (přijímá soubory)
 * @returns {function} Odregistrační funkce
 */
export function onDrop(element, onDrop) {
  if (!element || typeof onDrop !== "function") {
    return () => {};
  }

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    preventDefaults(e);
    const files = e.dataTransfer?.files || [];
    onDrop(Array.from(files));
  };

  element.addEventListener("dragover", preventDefaults);
  element.addEventListener("dragenter", preventDefaults);
  element.addEventListener("dragleave", preventDefaults);
  element.addEventListener("drop", handleDrop);

  return () => {
    element.removeEventListener("dragover", preventDefaults);
    element.removeEventListener("dragenter", preventDefaults);
    element.removeEventListener("dragleave", preventDefaults);
    element.removeEventListener("drop", handleDrop);
  };
}

/**
 * Zaregistruje keyboard handler
 * @param {HTMLElement} element - Element
 * @param {function} handler - Handler funkce (přijímá event)
 * @param {Object} options - Možnosti
 * @param {string} options.key - Filtr podle klávesy (např. "Enter")
 * @param {boolean} options.ctrlKey - Vyžaduje Ctrl
 * @param {boolean} options.shiftKey - Vyžaduje Shift
 * @returns {function} Odregistrační funkce
 */
export function onKeyDown(element, handler, options = {}) {
  if (!element || typeof handler !== "function") {
    return () => {};
  }

  const wrappedHandler = (e) => {
    if (options.key && e.key !== options.key) return;
    if (options.ctrlKey && !e.ctrlKey) return;
    if (options.shiftKey && !e.shiftKey) return;

    handler(e);
  };

  return on(element, "keydown", wrappedHandler);
}

/**
 * Deleguje event na potomky matchující selektor
 * @param {HTMLElement} container - Kontejner
 * @param {string} selector - CSS selektor
 * @param {string} eventType - Typ eventu
 * @param {function} handler - Handler funkce
 * @returns {function} Odregistrační funkce
 */
export function delegate(container, selector, eventType, handler) {
  if (!container || !selector || typeof handler !== "function") {
    return () => {};
  }

  const wrappedHandler = (e) => {
    const target = e.target.closest(selector);
    if (target) {
      handler.call(target, e);
    }
  };

  return on(container, eventType, wrappedHandler);
}

/**
 * Zaregistruje všechny handlery z objektu
 * Objekt: { "selector eventType": handler, ... }
 * @param {HTMLElement} container - Kontejner
 * @param {Object} handlers - Mapa handlerů
 * @returns {function} Odregistrační funkce pro všechny
 */
export function registerHandlers(container, handlers = {}) {
  const unregisterFns = [];

  Object.entries(handlers).forEach(([key, handler]) => {
    const [selector, eventType] = key.split(" ");
    if (selector && eventType && typeof handler === "function") {
      unregisterFns.push(delegate(container, selector, eventType, handler));
    }
  });

  // Vrátí funkci na odregistraci všech
  return () => {
    unregisterFns.forEach((fn) => fn?.());
  };
}

/**
 * Zablokuje výchozí chování eventu
 * @param {Event} event - Event
 */
export function preventDefault(event) {
  if (event?.preventDefault) {
    event.preventDefault();
  }
}

/**
 * Zastaví šíření eventu
 * @param {Event} event - Event
 */
export function stopPropagation(event) {
  if (event?.stopPropagation) {
    event.stopPropagation();
  }
}

/**
 * Zablokuje výchozí chování a zastaví šíření najednou
 * @param {Event} event - Event
 */
export function stopAll(event) {
  preventDefault(event);
  stopPropagation(event);
}
