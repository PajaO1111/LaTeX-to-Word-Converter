/**
 * statsRenderer.js
 * Vykreslování statistik zpracování.
 * @module ui/renderer/statsRenderer
 */

/**
 * Vykresluje statistiky do DOM
 * @param {Object} stats - objekt statistik
 * @param {HTMLElement} container - DOM kontejner
 * @returns {void}
 */
export function renderStats(stats, container) {
  if (!container || !stats) {
    if (container) container.textContent = "Statistiky nejsou dostupné.";
    return;
  }

  const html = `
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Zpracovaných formulí:</span>
        <span class="stat-value">${stats.formulasAfter || 0}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Heuristických oprav:</span>
        <span class="stat-value">${stats.heuristicFixes || 0}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Celkem oprav:</span>
        <span class="stat-value">${stats.fixes || 0}</span>
      </div>
      ${
        stats.fallbackRenders
          ? `<div class="stat-item">
        <span class="stat-label">Fallback renderů:</span>
        <span class="stat-value">${stats.fallbackRenders}</span>
      </div>`
          : ""
      }
      ${
        stats.matrixFixes
          ? `<div class="stat-item">
        <span class="stat-label">Oprav matic:</span>
        <span class="stat-value">${stats.matrixFixes}</span>
      </div>`
          : ""
      }
      ${
        stats.delimiterFixes
          ? `<div class="stat-item">
        <span class="stat-label">Oprav delimitérů:</span>
        <span class="stat-value">${stats.delimiterFixes}</span>
      </div>`
          : ""
      }
      ${
        stats.vectorFixes
          ? `<div class="stat-item">
        <span class="stat-label">Oprav vektorů:</span>
        <span class="stat-value">${stats.vectorFixes}</span>
      </div>`
          : ""
      }
      ${
        stats.absoluteValueFixes
          ? `<div class="stat-item">
        <span class="stat-label">Oprav absolutních hodnot:</span>
        <span class="stat-value">${stats.absoluteValueFixes}</span>
      </div>`
          : ""
      }
      ${
        stats.addedBrackets
          ? `<div class="stat-item">
        <span class="stat-label">Přidaných závorek:</span>
        <span class="stat-value">${stats.addedBrackets}</span>
      </div>`
          : ""
      }
      ${
        stats.durationMs
          ? `<div class="stat-item">
        <span class="stat-label">Doba zpracování:</span>
        <span class="stat-value">${stats.durationMs}ms</span>
      </div>`
          : ""
      }
    </div>
  `;

  container.innerHTML = html;
}
