/* LaTeX -> Office Math. This app deliberately has no server component. */
const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const M = "http://schemas.openxmlformats.org/officeDocument/2006/math";
const APP_VERSION = "2026.08.25.34";
const state = {
  file: null,
  zip: null,
  documentXml: null,
  sourceName: "rovnice",
  debugLog: [],
  stats: null,
  stressTest: null,
};
const $ = (id) => document.getElementById(id);
const escapeXml = (value) =>
  String(value).replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
const local = (node) =>
  node && (node.localName || node.nodeName.split(":").pop());
// NEW: Centralized diagnostics and KaTeX fallback helpers.
const debug = (event, data = {}) =>
  state.debugLog.push({
    time: new Date().toISOString(),
    version: APP_VERSION,
    event,
    ...data,
  });
function fallbackTex(tex) {
  return String(tex || "")
    .replace(/\\left\s*/g, "")
    .replace(/\\right\s*/g, "");
}
function classifyFixes(original, cleaned) {
  const fixes = [];
  if (/\r/.test(original) && !/\r/.test(cleaned)) fixes.push("trim");
  if (/\\text\{/.test(original) && /\\text\{/.test(cleaned))
    fixes.push("text-protection");
  if (
    /\\(mathbb|mathbf|mathrm|mathcal|mathsf)[A-Za-z]/.test(original) &&
    !/\\(mathbb|mathbf|mathrm|mathcal|mathsf)[A-Za-z]/.test(cleaned)
  )
    fixes.push("command-separation");
  if (/\\(?:,|;|!|:)/.test(original) && !/\\(?:,|;|!|:)/.test(cleaned))
    fixes.push("spacing-command");
  if (
    /\\begin\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\}/.test(
      original,
    ) &&
    (original.match(/\\\\/g) || []).length !==
      (cleaned.match(/\\\\/g) || []).length
  )
    fixes.push("matrix-row-separator");
  if (/\\(?:0|1|2|3|4|5|6|7|8|9)/.test(original) && /\\begin\{/.test(original))
    fixes.push("matrix-row-separator");
  if (
    /\\[A-Za-z]_(?:\d+|\{)/.test(original) &&
    !/\\[A-Za-z]_(?:\d+|\{)/.test(cleaned)
  )
    fixes.push("vector");
  if (
    /\\[A-Za-z]/.test(original) &&
    original.replace(/\\[A-Za-z]+/g, "") !==
      cleaned.replace(/\\[A-Za-z]+/g, "") &&
    !/\r/.test(original)
  )
    fixes.push("backslash-artifact");
  if (
    /[A-Za-z]\s+[A-Za-z]/.test(original) &&
    !/[A-Za-z]\s+[A-Za-z]/.test(cleaned)
  )
    fixes.push("identifier-space");
  return [...new Set(fixes)];
}

function heuristicFix(tex) {
  let value = String(tex || "");
  const original = value;
  const fixes = [];
  const apply = (pattern, replacement, type) => {
    const next = value.replace(pattern, replacement);
    if (next !== value) fixes.push(type);
    value = next;
  };
  apply(/\\backslash\b/g, "\\\\", "backslash");
  apply(/\\left\\\{([^{}]*?)\\right\\}/g, "\\left\\{$1\\right\\}", "braces");
  apply(/\\left\|([^|]*?)\\right\|/g, "\\left|$1\\right|", "absolute-value");
  apply(
    /\\left\\langle([\s\S]*?)\\right\\rangle/g,
    "\\left\\langle$1\\right\\rangle",
    "angle-brackets",
  );
  apply(/\\middle\s*\|/g, "\\middle|", "middle");
  apply(/\\left\|([^|\\]+)$/g, "\\left|$1\\right|", "absolute-value");
  apply(/\\left\{([^{}\\]+)$/g, "\\left\\{$1\\right\\}", "braces");
  apply(/\\left\[([^\[\]]+)$/g, "\\left[$1\\right]", "brackets");
  apply(/\\left\(([^()]*)$/g, "\\left($1\\right)", "parentheses");
  const delimiterPairs = {
    "[": "]",
    "(": ")",
    "\\{": "\\}",
    "|": "|",
    "\\langle": "\\rangle",
    "\\lfloor": "\\rfloor",
    "\\lceil": "\\rceil",
  };
  const delimiterStack = [];
  for (const match of value.matchAll(
    /\\(left|right)\s*(\[|\]|\(|\)|\||\\(?:\{|\}|langle|rangle|lfloor|rfloor|lceil|rceil))/g,
  )) {
    const side = match[1];
    const token = match[2];
    if (side === "left") delimiterStack.push(delimiterPairs[token]);
    else if (delimiterStack[delimiterStack.length - 1] === token)
      delimiterStack.pop();
    else fixes.push("delimiter-conflict");
  }
  if (delimiterStack.length) {
    value += delimiterStack
      .reverse()
      .map((close) => `\\right${close}`)
      .join("");
    fixes.push("delimiter-pair");
  }
  const matrixStart =
    /\\begin\{(pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\}/g;
  value = value.replace(matrixStart, (match, env, offset, source) => {
    const close = `\\end{${env}}`;
    if (source.indexOf(close, offset + match.length) >= 0) return match;
    fixes.push("matrix-end");
    return `${match}${source.slice(offset + match.length)}${close}`;
  });
  value = value.replace(
    /(\\begin\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\})([\s\S]*?)(\\end\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\})/g,
    (match, start, body, end) => {
      const repaired = body.replace(
        /([A-Za-z])_(\d+)(?=[A-Za-z]_(?:\d+|\{))/g,
        "$1_$2\\\\",
      );
      if (repaired !== body) fixes.push("matrix-row-separator");
      return `${start}${repaired}${end}`;
    },
  );
  if (value !== original)
    debug("heuristic-fix", {
      original,
      cleaned: value,
      fixes: [...new Set(fixes)],
    });
  return value;
}

function collectStats(originalTex, cleanedTex, fixesLog) {
  const source = String(originalTex || "");
  const cleaned = String(cleanedTex || "");
  const stats = state.stats || createStats();
  stats.fixes += fixesLog.length;
  for (const fix of fixesLog)
    stats.fixesByType[fix] = (stats.fixesByType[fix] || 0) + 1;
  stats.addedBrackets += Math.max(
    0,
    (cleaned.match(/[{}\[\]]/g) || []).length -
      (source.match(/[{}\[\]]/g) || []).length,
  );
  stats.unknownCommands += [
    ...cleaned.matchAll(/(?<!\\)\\([A-Za-z]+)/g),
  ].filter((match) => !knownCommands.has(match[1])).length;
  debug("stats", { original: source, cleaned, fixes: fixesLog });
  return stats;
}

function createStats() {
  return {
    startedAt: null,
    endedAt: null,
    durationMs: 0,
    formulasBefore: 0,
    formulasAfter: 0,
    fixes: 0,
    fixesByType: {},
    addedBrackets: 0,
    unknownCommands: 0,
    fallbackRenders: 0,
    heuristicFixes: 0,
    wordArtifactFixes: 0,
    matrixFixes: 0,
    delimiterFixes: 0,
    vectorFixes: 0,
    absoluteValueFixes: 0,
    nestedFixes: 0,
    unterminatedEnvironmentFixes: 0,
    unterminatedBeginFixes: 0,
    unclosedLeftRightFixes: 0,
  };
}

function finalizeStats() {
  if (!state.stats) return;
  const entries = state.debugLog;
  const fixes = entries.flatMap((entry) =>
    entry.event === "auto-fix" || entry.event === "heuristic-fix"
      ? entry.fixes || []
      : [],
  );
  const countFix = (type) => fixes.filter((fix) => fix === type).length;
  state.stats.fallbackRenders = entries.filter(
    (entry) => entry.event === "katex-fallback",
  ).length;
  state.stats.heuristicFixes = entries.filter(
    (entry) => entry.event === "heuristic-fix",
  ).length;
  state.stats.matrixFixes =
    countFix("matrix") + countFix("matrix-row-separator");
  state.stats.delimiterFixes =
    countFix("delimiters") +
    countFix("delimiter-conflict") +
    countFix("delimiter-pair");
  state.stats.absoluteValueFixes = countFix("absolute-value");
  state.stats.nestedFixes = entries.filter(
    (entry) =>
      entry.event === "heuristic-fix" &&
      (entry.original || "").match(/\\left[\s\S]*\\left/),
  ).length;
  state.stats.unclosedLeftRightFixes = countFix("delimiter-pair");
  state.stats.unterminatedEnvironmentFixes = countFix("matrix-end");
  state.stats.unterminatedBeginFixes = entries.filter(
    (entry) => entry.event === "parser-overflow",
  ).length;
  state.stats.vectorFixes = countFix("vector");
  state.stats.wordArtifactFixes = entries.filter(
    (entry) => entry.event === "auto-fix" || entry.event === "heuristic-fix",
  ).length;
}

function validateLatexStructure(tex) {
  // NEW: Validate delimiters, environments, command names, and input size before conversion.
  const value = String(tex || "");
  if (value.length > 100000)
    return { ok: false, reason: "Zápis je příliš dlouhý." };
  const stack = [];
  const pairs = {
    "(": ")",
    "[": "]",
    "{": "}",
    "|": "|",
    "\\{": "\\}",
    "\\langle": "\\rangle",
    "\\lfloor": "\\rfloor",
    "\\lceil": "\\rceil",
  };
  const delimiter = (text) =>
    text.match(
      /^\s*(\[|\]|\(|\)|\{|\}|\||\\(?:\{|\}|\||langle|rangle|lfloor|rfloor|lceil|rceil))/,
    );
  for (let index = 0; index < value.length; index++) {
    if (value[index] === "\\" && value[index + 1] === "\\") {
      index++;
      continue;
    }
    if (value[index] === "\\") {
      const command = value.slice(index + 1).match(/^[A-Za-z]+/);
      if (command) {
        const name = command[0];
        index += name.length;
        if (["left", "right"].includes(name)) {
          const found = delimiter(value.slice(index + 1));
          if (!found) {
            if (name === "right")
              return { ok: false, reason: "Příkaz \\right nemá delimitér." };
            continue;
          }
          const token = found[1].replace(/\s/g, "");
          index += found[0].length;
          if (name === "left") stack.push({ token, close: pairs[token] });
          else if (!stack.length)
            return { ok: false, reason: "Osamocený příkaz \\right." };
          else if (stack.pop().close !== token)
            return {
              ok: false,
              reason: "Nesprávně spárované \\left/\\right delimitery.",
            };
        }
        continue;
      }
    }
    if ("{[(".includes(value[index]))
      stack.push({
        token: value[index],
        close: { "{": "}", "[": "]", "(": ")" }[value[index]],
      });
    if ("}])".includes(value[index])) {
      const expected = { "}": "{", "]": "[", ")": "(" }[value[index]];
      if (!stack.length || stack.pop().close !== value[index])
        return { ok: false, reason: "Nesprávně spárované závorky." };
    }
  }
  if (stack.length)
    return { ok: false, reason: "Neuzavřená závorka nebo delimitér." };
  const environments = [...value.matchAll(/\\begin\{([^}]+)\}/g)].map(
    (match) => match[1],
  );
  for (const env of environments)
    if (!new RegExp(`\\\\end\\{${env}\\}`).test(value))
      return { ok: false, reason: `Neuzavřené prostředí \\begin{${env}}.` };
  const unknown = [...value.matchAll(/(?<!\\)\\([A-Za-z]+)/g)]
    .map((match) => match[1])
    .filter((name) => !knownCommands.has(name));
  if (unknown.length)
    return {
      ok: false,
      reason: `Neznámý příkaz: ${[...new Set(unknown)].map((name) => "\\" + name).join(", ")}.`,
    };
  return { ok: true };
}

function cleanTex(tex) {
  const original = String(tex || "");
  // FIXED: Valid LaTeX is never normalized or rewritten.
  try {
    if (typeof katex !== "undefined") {
      katex.renderToString(original.trim(), {
        throwOnError: true,
        strict: "ignore",
      });
      return original.trim();
    }
  } catch (_) {
    /* Continue with repair layers for invalid input. */
  }
  const protectedText = [];
  let value = String(tex || "")
    .replace(/\r/g, "")
    .replace(/^\s+|\s+$/g, "");
  value = value.replace(/\\text\{([^{}]*)\}/g, (match) => {
    const index = protectedText.push(match) - 1;
    return `@@TEXT_BLOCK_${index}@@`;
  });
  value = value
    .replace(/\n\s*/g, " ")
    .replace(
      /\\(mathbb|mathbf|mathrm|mathcal|mathsf)\s+([A-Za-z])/g,
      "\\$1{$2}",
    )
    // Frequent Word-source typo: braces after \left/\right need escaping in TeX.
    .replace(/\\left\s*\{/g, "\\left\\{")
    .replace(/\\right\s*\}/g, "\\right\\}")
    // Word often writes mismatched floor/ceil delimiters; normalize them to a valid pair.
    .replace(
      /\\left\\lfloor([\s\S]*?)\\right\\rceil/g,
      "\\left\\lfloor$1\\right\\rfloor",
    )
    .replace(
      /\\left\\lceil([\s\S]*?)\\right\\rfloor/g,
      "\\left\\lceil$1\\right\\rceil",
    )
    .replace(
      /\\left\\lfloor([\s\S]*?)\\right\\lceil/g,
      "\\left\\lfloor$1\\right\\rfloor",
    )
    .replace(
      /\\left\\lceil([\s\S]*?)\\right\\lfloor/g,
      "\\left\\lceil$1\\right\\rceil",
    )
    .replace(/;\|;/g, "\\;\\middle|\\;")
    // Common copy-paste pattern: "\rightarrowL" or "\RightarrowC" is usually
    // meant to be the operator plus an adjacent variable. Split it to the valid form.
    .replace(
      /\\(rightarrow|leftarrow|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|uparrow|downarrow|Uparrow|Downarrow|approx|sim|equiv|subset|supset|subseteq|supseteq|gg|ll|lesssim|gtrsim|not|det|implies|iff|to|in|notin|parallel|forall|exists|emptyset)([A-Za-z0-9])/g,
      "\\$1 $2",
    )
    // Word-generated shorthand such as \longrightarrowD or \leE should still parse as
    // a valid operator plus its adjacent symbol/variable.
    .replace(
      /\\(longrightarrow|longleftarrow|longleftrightarrow|xrightarrow|xleftarrow|xleftrightarrow|rightarrow|leftarrow|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|approx|sim|equiv|subset|supset|subseteq|supseteq|gg|ll|lesssim|gtrsim|not|det|implies|iff|to|in|notin|parallel|forall|exists|emptyset|le|ge|ne|lfloor|rfloor|lceil|rceil|odot|star|circ|deg|gcd|zeta|chi)([A-Z][A-Za-z0-9_]+)/g,
      "\\$1 $2",
    )
    .replace(
      /\\([A-Za-z]+)([A-Z][A-Za-z0-9_]+)/g,
      (_, name, tail) => `\\${name} ${tail}`,
    )
    .replace(/\\pk\b/g, "\\mathrm{pk}")
    // A compact column vector sometimes arrives from Word as (2\0), not as
    // a proper matrix environment. Convert the two numeric rows to LaTeX.
    .replace(
      /\(\s*([-+]?\d+(?:\.\d+)?)\s*\\\s*([-+]?\d+(?:\.\d+)?)\s*\)/g,
      (_, top, bottom) => `\\begin{pmatrix}${top}\\\\${bottom}\\end{pmatrix}`,
    )
    // Word and copied text often contain smart quotes or unsupported text glyphs.
    // Normalize them to ASCII equivalents so KaTeX does not emit missing-metrics warnings.
    .replace(/[“”„]/g, '"')
    .replace(/[‘’]/g, "'")
    // Markdown emphasis can be copied together with a formula.
    .replace(/\*\*/g, "");

  // Common Word copy/paste noise: digits and single-letter variables are pasted
  // as escaped commands, e.g. \0, \1, \s_2, \e_2, \a_{21}. These are not valid
  // LaTeX and need to be converted to a normal symbol or row separator.
  value = value.replace(
    /(\\begin\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\}[\s\S]*?)(\\)([0-9])/g,
    "$1\\\\$3",
  );
  value = value.replace(/(?<!\\)\\([0-9])/g, "$1");
  value = value.replace(/\\([A-Za-z])(?=(_|\d|\{|\^))/g, (_, char) => char);
  // Word can leave a variable escaped before an aligned/array separator.
  value = value.replace(/\\([A-Za-z])(?=\s*&)/g, "$1");
  // Repair single escaped variables and slash/hyphen artifacts left by Word.
  value = value.replace(/\\([A-Za-z])(?=\\|\s|[&+={])/g, (match, char) =>
    knownCommands.has(char) ? match : char,
  );
  value = value.replace(/\\(?=[/-])/g, "");
  value = value.replace(/\\([A-Za-z]+)(?=[A-Za-z0-9])/g, (match, name) =>
    knownCommands.has(name) ? `\\${name} ` : match,
  );
  value = value.replace(/\\([A-Za-z]+)(?=[A-Z])/g, (match, name) =>
    knownCommands.has(name) ? `\\${name} ` : match,
  );
  value = value.replace(
    /\\([A-Za-z]+)\s*([A-Z][A-Za-z0-9_]*)/g,
    (match, name, tail) =>
      knownCommands.has(name) ? `\\${name} ${tail}` : match,
  );
  value = value.replace(/#\s*\{([^{}]*)\}/g, "\\{$1\\}");
  value = value.replace(/([^\\])#([^=])/g, "$1\\#$2");
  // FIXED: Keep paired delimiters and remove only an orphaned \right.
  value = value.replace(
    /\\right\b(?!\s*(?:[)\]}|]|\\(?:\}|rangle|rfloor|rceil)))/g,
    "",
  );
  value = value.replace(
    /\\left\\\{([\s\S]*?)(?<!\\)\}/g,
    "\\left\\{$1\\right\\}",
  );
  value = value.replace(
    /\\left\\lfloor([\s\S]*?)\\rfloor/g,
    "\\left\\lfloor$1\\right\\rfloor",
  );
  value = value.replace(
    /\\left\\lceil([\s\S]*?)\\rceil/g,
    "\\left\\lceil$1\\right\\rceil",
  );
  // Repair Word artifacts in identifiers, escapes, hyphens, and matrix rows.
  value = value.replace(/(?<!\\)([A-Za-z])\s+([A-Za-z])/g, "$1$2");
  value = value.replace(/(?<!\\)\\([A-Za-z])(?![A-Za-z])/g, "$1");
  value = value.replace(/\\-/g, "-");
  value = value.replace(/\\\\+/g, "\\\\");
  value = value.replace(
    /(\\begin\{(?:p|b|B|v|V)matrix\})(\d+)-(\d+)(\\end\{(?:p|b|B|v|V)matrix\})/g,
    "$1$2\\\\-$3$4",
  );
  value = value.replace(
    /(\\begin\{(?:p|b|B|v|V)matrix\})([A-Za-z])_(\d+)([A-Za-z])_(\d+)(\\end\{(?:p|b|B|v|V)matrix\})/g,
    "$1$2_$3\\\\$4_$5$6",
  );
  value = value.replace(
    /([^\\])\\{2}end\{((?:p|b|B|v|V)matrix)\}/g,
    "$1\\\\\\end{$2}",
  );
  const commandNames = [...knownCommands].sort(
    (left, right) => right.length - left.length,
  );
  value = value.replace(/\\([A-Za-z]+)/g, (match, token) => {
    const command = commandNames.find((name) => token.startsWith(name));
    return command
      ? `\\${command}${token.slice(command.length) ? ` ${token.slice(command.length)}` : ""}`
      : match;
  });
  let cleaned = value
    .replace(/\s{2,}/g, " ")
    .replace(/\s*([{}()=+\-*/^_|,;:<>])\s*/g, "$1")
    .replace(/\s*\\\s*\*/g, "\\times");
  // Word frequently truncates the closing bracket/brace of a formula.
  const squareBalance =
    (cleaned.match(/\[/g) || []).length - (cleaned.match(/\]/g) || []).length;
  if (squareBalance > 0) cleaned += "]".repeat(squareBalance);
  const braceBalance =
    (cleaned.match(/{/g) || []).length - (cleaned.match(/}/g) || []).length;
  if (braceBalance > 0) cleaned += "}".repeat(braceBalance);
  cleaned = cleaned.replace(
    /@@TEXT_BLOCK_(\d+)@@/g,
    (_, index) => protectedText[Number(index)] || "",
  );
  const repaired = heuristicFix(cleaned);
  if (repaired !== original)
    debug("repair-result", {
      original,
      cleaned: repaired,
      fixes: classifyFixes(original, repaired),
    });
  return repaired;
}

function balancedSquareBlock(text) {
  const source = String(text || "").trim();
  if (!source.startsWith("[") || !source.endsWith("]")) return null;
  let depth = 0;
  for (let index = 0; index < source.length; index++) {
    if (source.startsWith("\\left[", index)) {
      depth++;
      index += 5;
      continue;
    }
    if (source.startsWith("\\right]", index)) {
      depth--;
      index += 6;
      continue;
    }
    if (source[index] === "[") depth++;
    else if (source[index] === "]") depth--;
    if (depth === 0 && index !== source.length - 1) return null;
  }
  return depth === 0 ? source.slice(1, -1) : null;
}

function blockFormula(text) {
  const value = String(text || "");
  const display = value.match(/^\s*\\\[\s*([\s\S]*?)\s*\\\]\s*$/);
  if (display) return display;
  const leftRight = value.match(/^\s*\\left\[([\s\S]*?)\\right\]\s*$/);
  if (leftRight) return [value, value.trim()];
  const inner = balancedSquareBlock(value);
  return inner === null ? null : [value, inner];
}

function squareBlocks(text) {
  const source = String(text || "");
  const blocks = [];
  const maxBlockLength = 5000;
  for (let start = 0; start < source.length; start++) {
    if (
      source[start] !== "[" ||
      source[start - 1] === "\\" ||
      source.slice(Math.max(0, start - 5), start) === "\\left"
    )
      continue;
    let depth = 1;
    for (let index = start + 1; index < source.length; index++) {
      if (index - start > maxBlockLength) break;
      const lineStart = index === 0 || source[index - 1] === "\n";
      if (
        lineStart &&
        /(?:^#{1,6}\s|^={4,}|^[-_]{4,})/.test(
          source.slice(index).split("\n", 1)[0],
        )
      )
        break;
      if (source.startsWith("\\left[", index)) {
        depth++;
        index += 5;
        continue;
      }
      if (source.startsWith("\\right]", index)) {
        depth--;
        index += 6;
      } else if (source[index] === "[") depth++;
      else if (source[index] === "]") depth--;
      if (depth === 0) {
        const inner = source.slice(start + 1, index);
        if (inner.length <= maxBlockLength && !/={4,}/.test(inner))
          blocks.push({ inner, start, end: index + 1 });
        start = index;
        break;
      }
    }
  }
  return blocks;
}

function blockStart(text) {
  const match = text.match(/^\s*(\\)?\[\s*$/);
  return match ? Boolean(match[1]) : null;
}

function environmentStart(text) {
  const match = String(text || "").match(
    /^\s*\\begin\{(pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array|cases)\}\s*$/,
  );
  return match ? match[1] : null;
}

function environmentEnd(text, environment) {
  return new RegExp(`^\\s*\\\\end\\{${environment}\\}\\s*[.,;]?\\s*$`).test(
    String(text || ""),
  );
}

function isStandaloneTex(text) {
  const trimmed = text.trim();
  if (
    /^\s*\[[\s\S]*\]\s*$/.test(trimmed) ||
    /^\\\[[\s\S]*\\\]$/.test(trimmed) ||
    /^\\\([\s\S]*\\\)$/.test(trimmed)
  )
    return false;
  if (/^\\end\{/.test(trimmed)) return false;
  return (
    /\\[A-Za-z]/.test(trimmed) &&
    /^[A-Za-z0-9_{}[\]^=+.,;|()&<>\\\-\s]+$/.test(trimmed) &&
    (/^[-+\\]/.test(trimmed) ||
      /[=_^+]/.test(trimmed) ||
      /\\begin\{|\\mathbf\b/.test(trimmed))
  );
}

function collectFormulas(text) {
  const found = [];
  const seen = new Set();
  // Rozsahy už zabrané větším blokem (např. \[ … \] nebo [ … ]), aby se
  // vnořené fragmenty (\left[ … \right] nebo (…) uvnitř nich) nesbíraly znovu.
  const claimedRanges = [];
  const claim = (range) => {
    if (range) claimedRanges.push(range);
  };
  const overlapsClaimed = (start, end) =>
    claimedRanges.some(([s, e]) => start < e && end > s);
  const add = (raw, kind, range = null) => {
    const candidate = String(raw || "");
    if (
      candidate.length > 5000 ||
      /(?:^|\n)\s*(?:#{1,6}\s|={4,}|[-_]{4,})/.test(candidate)
    ) {
      debug("candidate-skipped", {
        kind,
        length: candidate.length,
        reason: "Kandidát překročil limit nebo obsahuje hranici sekce.",
      });
      return;
    }
    const logStart = state.debugLog.length;
    if (state.stats) state.stats.formulasBefore++;
    const prepared = prepareFormula(raw, found.length + 1);
    const tex = prepared.cleanedTex;
    collectStats(
      raw,
      tex,
      state.debugLog
        .slice(logStart)
        .filter(
          (entry) =>
            entry.event === "auto-fix" ||
            entry.event === "heuristic-fix" ||
            entry.event === "repair-result",
        )
        .flatMap((entry) => entry.fixes || ["normalization"]),
    );
    if (tex && !seen.has(tex)) {
      seen.add(tex);
      found.push({ ...prepared, tex, raw: String(raw).trim(), kind });
    }
    claim(range);
  };
  // Nejprve větší kontejnery (\[ … \] a [ … ]), aby si zabraly svůj rozsah dřív
  // než menší vzory, které by jinak vytáhly jejich vnořený obsah jako duplicitu.
  for (const match of text.matchAll(/\\\[\s*([\s\S]{1,5000}?)\s*\\\]/g))
    add(match[1], "blok \\[ … \\]", [match.index, match.index + match[0].length]);
  for (const block of squareBlocks(text))
    add(block.inner, "blok [ … ]", [block.start, block.end]);
  for (const match of text.matchAll(/\\left\[([\s\S]{1,5000}?)\\right\]/g)) {
    const range = [match.index, match.index + match[0].length];
    if (overlapsClaimed(range[0], range[1])) continue;
    add(match[0], "blok \\left[ … \\right]", range);
  }
  for (const match of text.matchAll(/[^\n]+/g)) {
    const line = match[0];
    if (!isStandaloneTex(line)) continue;
    const range = [match.index, match.index + line.length];
    if (overlapsClaimed(range[0], range[1])) continue;
    add(line, "samostatný LaTeX", range);
  }
  if ($("convert-inline").checked) {
    for (const match of text.matchAll(
      /\\\(([\s\S]{1,3000}?)\\\)|\$([^$\n]{1,3000})\$/g,
    )) {
      const range = [match.index, match.index + match[0].length];
      if (overlapsClaimed(range[0], range[1])) continue;
      add(match[1] || match[2], "inline", range);
    }
  }
  if ($("convert-paren").checked) {
    for (const match of text.matchAll(
      /\(([^()\n]{0,1500}\\[A-Za-z]+[^()\n]{0,1500})\)/g,
    )) {
      const range = [match.index, match.index + match[0].length];
      // Vynech (…) patřící do \( … \) nebo \left( … \right) – to jsou
      // uzávorkované oddělovače, ne samostatný zápis v kulatých závorkách.
      if (
        text[match.index - 1] === "\\" ||
        text.slice(Math.max(0, match.index - 5), match.index) === "\\left"
      )
        continue;
      if (overlapsClaimed(range[0], range[1])) continue;
      add(match[1], "kulaté závorky", range);
    }
  }
  if (state.documentXml) {
    for (const match of text.matchAll(/\(([^()\n]*\\[A-Za-z]+[^()\n]*)\)/g)) {
      const range = [match.index, match.index + match[0].length];
      if (
        text[match.index - 1] === "\\" ||
        text.slice(Math.max(0, match.index - 5), match.index) === "\\left"
      )
        continue;
      if (overlapsClaimed(range[0], range[1])) continue;
      add(match[1], "inline z DOCX", range);
    }
    for (const match of text.matchAll(
      /\(([A-Za-z](?:\s*[=<>]\s*[^()\n]+)?)\)/g,
    )) {
      const range = [match.index, match.index + match[0].length];
      if (
        text[match.index - 1] === "\\" ||
        text.slice(Math.max(0, match.index - 5), match.index) === "\\left"
      )
        continue;
      if (overlapsClaimed(range[0], range[1])) continue;
      add(match[1], "inline z DOCX", range);
    }
  }
  return found;
}

function sourceText() {
  if (state.documentXml) return xmlParagraphText(state.documentXml);
  return [...$("editor").childNodes]
    .map((node) =>
      node.nodeType === Node.TEXT_NODE ? node.nodeValue : node.innerText,
    )
    .join("\n");
}

function xmlParagraphText(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  return [...doc.getElementsByTagNameNS(W, "p")].map(paragraphText).join("\n");
}

function paragraphText(p) {
  let text = "";
  for (const item of p.getElementsByTagNameNS(W, "t")) text += item.textContent;
  return text;
}

function documentMathCount(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  return hasXmlError(doc) ? 0 : doc.getElementsByTagNameNS(M, "oMath").length;
}

function scan() {
  const started = performance.now();
  state.debugLog = [];
  state.stats = createStats();
  state.stats.startedAt = new Date().toISOString();
  const text = sourceText();
  const formulas = collectFormulas(text);
  const problems = formulaProblems(formulas);
  const unclosed =
    (text.match(/\[/g) || []).length > (text.match(/\]/g) || []).length;
  $("diagnostics").classList.toggle("error", unclosed);
  const existing = state.documentXml ? documentMathCount(state.documentXml) : 0;
  $("diagnostics").textContent = formulas.length
    ? `Nalezeno ${formulas.length} nových zápisů${existing ? `; ${existing} již převedených rovnic bude zachováno` : ""}. ${unclosed ? "Pozor: nejméně jeden blok [ … ], případně \\[ … \\], není uzavřen." : "Závorky vypadají uzavřeně."}`
    : unclosed
      ? "Nebyl nalezen uzavřený blok; alespoň jedna hranatá závorka chybí."
      : existing
        ? `Nebyl nalezen nový LaTeX; ${existing} již převedených rovnic bude zachováno.`
        : "Nebyl nalezen žádný blok [ … ], \\[ … \\] ani aktivní inline zápis.";
  renderPreview(formulas);
  renderUnprocessed(problems);
  state.stats.formulasAfter = formulas.length;
  finalizeStats();
  state.stats.endedAt = new Date().toISOString();
  state.stats.durationMs = Math.round(performance.now() - started);
  renderStats();
  $("export-note").textContent = formulas.length
    ? `Při exportu bude zpracováno ${formulas.length} rozpoznaných zápisů.`
    : "Bez nalezeného vzorce bude stažen jen běžný text.";
  return formulas;
}

function renderPreview(formulas) {
  const box = $("preview");
  const renderId = (state.previewRenderId || 0) + 1;
  state.previewRenderId = renderId;
  box.innerHTML = "";
  box.classList.remove("empty");
  if (!formulas.length) {
    box.classList.add("empty");
    box.textContent = "Nebyly nalezeny žádné rovnice.";
    return;
  }
  const renderBatch = (start) => {
    if (renderId !== state.previewRenderId) return;
    const fragment = document.createDocumentFragment();
    formulas.slice(start, start + 50).forEach((item, offset) => {
      const index = start + offset;
      const card = document.createElement("article");
      card.className = "formula-card";
      const label = document.createElement("div");
      label.className = "formula-label";
      label.textContent = `${index + 1}. ${item.kind}`;
      const formula = document.createElement("div");
      formula.className = "formula";
      const code = document.createElement("pre");
      code.textContent = item.tex;
      try {
        katex.render(item.tex, formula, {
          displayMode: true,
          throwOnError: true,
          strict: "ignore",
        });
      } catch (error) {
        const fallback = fallbackTex(item.tex);
        debug("katex-fallback", {
          original: item.tex,
          fallback,
          error: error.message,
        });
        try {
          katex.render(fallback, formula, {
            displayMode: true,
            throwOnError: true,
            strict: "ignore",
          });
        } catch (_) {
          card.classList.add("error");
          formula.textContent =
            "KaTeX tento zápis nevyhodnotil: " + error.message;
        }
      }
      card.append(label, formula, code);
      fragment.append(card);
    });
    box.append(fragment);
    if (start + 50 < formulas.length)
      requestAnimationFrame(() => renderBatch(start + 50));
  };
  renderBatch(0);
}

function runXml(text, style = {}) {
  const attrs = /^\s|\s$/.test(text) ? ' xml:space="preserve"' : "";
  const rPr =
    style.bold || style.italic || style.underline
      ? `<w:rPr>${style.bold ? "<w:b/>" : ""}${style.italic ? "<w:i/>" : ""}${style.underline ? '<w:u w:val="single"/>' : ""}</w:rPr>`
      : "";
  return String(text)
    .split(/\n/)
    .map(
      (line, index) =>
        `${index ? "<w:br/>" : ""}<w:t${attrs}>${escapeXml(line)}</w:t>`,
    )
    .join("")
    .replace(/^/, `<w:r>${rPr}`)
    .replace(/$/, "</w:r>");
}
function mathRun(text, variant = "") {
  if (!text) return "";
  const val =
    variant === "roman" || variant === "text"
      ? '<m:rPr><m:sty m:val="p"/></m:rPr>'
      : variant === "bold"
        ? '<m:rPr><m:sty m:val="b"/></m:rPr>'
        : variant === "double"
          ? '<m:rPr><m:scr m:val="double-struck"/></m:rPr>'
          : variant === "script"
            ? '<m:rPr><m:scr m:val="script"/></m:rPr>'
            : "";
  return `<m:r>${val}<m:t xml:space="preserve">${escapeXml(text)}</m:t></m:r>`;
}

const symbols = {
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  varepsilon: "ε",
  theta: "θ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  phi: "φ",
  psi: "ψ",
  omega: "ω",
  eta: "η",
  zeta: "ζ",
  chi: "χ",
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Sigma: "Σ",
  Phi: "Φ",
  Psi: "Ψ",
  Omega: "Ω",
  in: "∈",
  notin: "∉",
  leq: "≤",
  geq: "≥",
  neq: "≠",
  le: "≤",
  ge: "≥",
  ne: "≠",
  approx: "≈",
  sim: "∼",
  equiv: "≡",
  propto: "∝",
  times: "×",
  cdot: "·",
  pm: "±",
  mp: "∓",
  to: "→",
  rightarrow: "→",
  Rightarrow: "⇒",
  leftarrow: "←",
  Leftarrow: "⇐",
  iff: "⇔",
  implies: "⇒",
  ldots: "…",
  ldquo: "“",
  rdquo: "”",
  vert: "|",
  mid: "|",
  parallel: "∥",
  infty: "∞",
  partial: "∂",
  nabla: "∇",
  forall: "∀",
  exists: "∃",
  emptyset: "∅",
  subset: "⊂",
  supset: "⊃",
  subseteq: "⊆",
  supseteq: "⊇",
  setminus: "∖",
  gg: "≫",
  ll: "≪",
  lesssim: "≲",
  gtrsim: "≳",
  downarrow: "↓",
  uparrow: "↑",
  Downarrow: "⇓",
  Uparrow: "⇑",
  leftrightarrow: "↔",
  longleftrightarrow: "⟷",
  Leftrightarrow: "⇔",
  Longrightarrow: "⟹",
  not: "¬",
  ell: "ℓ",
  iota: "ι",
  mathbbR: "ℝ",
  mathbbZ: "ℤ",
  angle: "∠",
  langle: "⟨",
  rangle: "⟩",
  det: "det",
  Pr: "Pr",
  lbrack: "[",
  rbrack: "]",
  lbrace: "{",
  rbrace: "}",
  backslash: "\\",
  cdots: "…",
  vdots: "⋮",
  ddots: "⋯",
  hat: "^",
  widehat: "^",
  circ: "∘",
  degree: "°",
  odot: "⊙",
  star: "⋆",
  ast: "⋆",
  tilde: "~",
  varphi: "φ",
  nmid: "∤",
  cong: "≅",
  oplus: "⊕",
  vdash: "⊢",
  checkmark: "✓",
  div: "÷",
  alpha: "α",
  beta: "β",
};
const operators = {
  sum: "∑",
  prod: "∏",
  int: "∫",
  oint: "∮",
  lim: "lim",
  log: "log",
  ln: "ln",
  sin: "sin",
  cos: "cos",
  tan: "tan",
  max: "max",
  min: "min",
  arg: "arg",
  bmod: "mod",
  pmod: "mod",
  mod: "mod",
  det: "det",
  Pr: "Pr",
  vol: "vol",
  ker: "ker",
  dim: "dim",
  deg: "deg",
  gcd: "gcd",
  ord: "ord",
  varphi: "φ",
  oplus: "⊕",
  vdash: "⊢",
  cong: "≅",
  nmid: "∤",
};
const knownCommands = new Set([
  ...Object.keys(symbols),
  ...Object.keys(operators),
  "frac",
  "dfrac",
  "tfrac",
  "binom",
  "sqrt",
  "boxed",
  "mathbf",
  "boldsymbol",
  "textbf",
  "textit",
  "texttt",
  "bm",
  "mathrm",
  "textrm",
  "operatorname",
  "text",
  "mathbb",
  "mathcal",
  "mathsf",
  "vec",
  "left",
  "right",
  "middle",
  "big",
  "Big",
  "bigl",
  "bigr",
  "pmod",
  "mod",
  "bmod",
  "quad",
  "qquad",
  "begin",
  "end",
  "array",
  "aligned",
  "cases",
  "matrix",
  "pmatrix",
  "bmatrix",
  "Bmatrix",
  "vmatrix",
  "Vmatrix",
  "cdots",
  "dots",
  "ddots",
  "vdots",
  "hat",
  "widehat",
  "widetilde",
  "norm",
  "langle",
  "rangle",
  "det",
  "subset",
  "supset",
  "subseteq",
  "supseteq",
  "setminus",
  "gg",
  "ll",
  "lesssim",
  "gtrsim",
  "uparrow",
  "downarrow",
  "Uparrow",
  "Downarrow",
  "leftrightarrow",
  "longleftrightarrow",
  "Leftrightarrow",
  "Rightarrow",
  "Longrightarrow",
  "Leftarrow",
  "rightarrow",
  "leftarrow",
  "not",
  "equiv",
  "approx",
  "sim",
  "propto",
  "implies",
  "iff",
  "to",
  "in",
  "notin",
  "parallel",
  "forall",
  "exists",
  "emptyset",
  "subseteq",
  "subset",
  "supseteq",
  "supset",
  "angle",
  "ell",
  "eta",
  "varepsilon",
  "operatorname",
  "vol",
  "ker",
  "ldots",
  "cdots",
  "vdots",
  "ddots",
  "underbrace",
  "overbrace",
  "overset",
  "stackrel",
  "xrightarrow",
  "xleftarrow",
  "xleftrightarrow",
  "longrightarrow",
  "longleftarrow",
  "longleftrightarrow",
  "mapsto",
  "longmapsto",
  "substack",
  "lfloor",
  "rfloor",
  "lceil",
  "rceil",
  "odot",
  "star",
  "tilde",
  "zeta",
  "chi",
  "gcd",
  "deg",
  "dim",
  "sup",
  "cap",
  "cup",
  "perp",
  "bullet",
  "diagdown",
  "diagup",
  "ne",
  "le",
  "ge",
  "pk",
  "circ",
]);

function validateFormula(tex) {
  const structure = validateLatexStructure(tex);
  if (!structure.ok) return structure;
  try {
    katex.renderToString(tex, { throwOnError: true, strict: "ignore" });
    return { ok: true, mode: "direct" };
  } catch (error) {
    return { ok: false, reason: "KaTeX: " + error.message };
  }
}

function validateFormulaWithFallback(tex) {
  const direct = validateFormula(tex);
  if (direct.ok) return direct;
  const fallback = fallbackTex(tex);
  if (fallback !== tex) {
    const result = validateFormula(fallback);
    if (result.ok)
      return {
        ok: true,
        mode: "fallback",
        fallbackTex: fallback,
        reason: direct.reason,
      };
  }
  return { ok: false, mode: "failed", reason: direct.reason };
}

function prepareFormula(rawTex, id = 0) {
  const originalTex = String(rawTex || "").trim();
  const direct = validateFormulaWithFallback(originalTex);
  if (direct.ok && direct.mode === "direct")
    return {
      id,
      originalTex,
      cleanedTex: originalTex,
      status: "valid",
      validation: "direct",
      fixes: [],
      reason: "",
    };
  const cleanedTex = cleanTex(originalTex);
  const validation = validateFormulaWithFallback(cleanedTex);
  return {
    id,
    originalTex,
    cleanedTex: validation.ok ? cleanedTex : originalTex,
    status: validation.ok ? "fixed" : "invalid",
    validation: validation.mode || "failed",
    fixes: classifyFixes(originalTex, cleanedTex),
    reason: validation.ok ? "" : validation.reason || direct.reason,
  };
}

function formulaProblems(formulas) {
  const problems = [];
  for (const item of formulas) {
    debug("formula", { original: item.raw || item.tex, cleaned: item.tex });
    const structure = validateLatexStructure(item.tex);
    if (!structure.ok) {
      debug("skipped", { tex: item.raw || item.tex, reason: structure.reason });
      problems.push({
        tex: item.raw || item.tex,
        normalizedTex: item.tex,
        reason: structure.reason,
        severity: "error",
      });
      continue;
    }
    try {
      katex.renderToString(item.tex, { throwOnError: true, strict: "ignore" });
    } catch (error) {
      const fallback = fallbackTex(item.tex);
      debug("katex-error", { tex: item.tex, fallback, error: error.message });
      try {
        katex.renderToString(fallback, {
          throwOnError: true,
          strict: "ignore",
        });
      } catch (_) {
        problems.push({
          tex: item.raw || item.tex,
          normalizedTex: item.tex,
          reason: "KaTeX: " + error.message,
          severity: "error",
        });
        continue;
      }
    }
    const unknown = [...item.tex.matchAll(/(?<!\\)\\([A-Za-z]+)/g)]
      .map((match) => match[1])
      .filter((name) => !knownCommands.has(name));
    if (unknown.length)
      problems.push({
        tex: item.raw || item.tex,
        normalizedTex: item.tex,
        reason:
          "Převod do Wordu zatím nezná příkaz: " +
          [...new Set(unknown)].map((name) => "\\" + name).join(", "),
        severity: "error",
      });
    else if (
      $("warn-vector-equals").checked &&
      /\\begin\{(?:p|b|B|v|V)matrix\}/.test(item.tex) &&
      /\\mathbf\b/.test(item.tex) &&
      !item.tex.includes("=")
    )
      problems.push({
        tex: item.raw || item.tex,
        normalizedTex: item.tex,
        reason:
          "Zápis je technicky platný, ale před výsledným vektorem pravděpodobně chybí znak =.",
        severity: "warning",
      });
  }
  return problems;
}

function renderUnprocessed(problems) {
  const box = $("unprocessed");
  box.innerHTML = "";
  if (!problems.length) {
    box.className = "unprocessed ok";
    box.textContent = "Přehled nevyhodnocených zápisů: vše bylo rozpoznáno.";
    return;
  }
  box.className = "unprocessed";
  const title = document.createElement("strong");
  title.textContent = `Nevyhodnocené nebo nepodporované zápisy (${problems.length})`;
  const list = document.createElement("ol");
  problems.forEach((item) => {
    const row = document.createElement("li");
    const code = document.createElement("code");
    code.textContent = item.tex;
    const reason = document.createElement("span");
    reason.textContent = item.reason;
    row.append(code, reason);
    list.append(row);
  });
  box.append(title, list);
}

function renderStats() {
  const box = $("stats");
  if (!box || !state.stats) return;
  const stats = state.stats;
  const types =
    Object.entries(stats.fixesByType)
      .map(([type, count]) => `${type}: ${count}`)
      .join(", ") || "žádné";
  box.innerHTML = `<strong>Statistiky poslední kontroly</strong><ul><li>Vzorce před/po čištění: ${stats.formulasBefore} / ${stats.formulasAfter}</li><li>Opravy: ${stats.fixes}</li><li>Typy oprav: ${types}</li><li>Doplněné závorky: ${stats.addedBrackets}</li><li>Neznámé příkazy: ${stats.unknownCommands}</li><li>Fallback renderů KaTeXu: ${stats.fallbackRenders}</li><li>Heuristických oprav: ${stats.heuristicFixes}</li><li>Oprav Word artefaktů: ${stats.wordArtifactFixes}</li><li>Oprav matic: ${stats.matrixFixes}</li><li>Oprav delimiterů: ${stats.delimiterFixes}</li><li>Oprav vektorů: ${stats.vectorFixes}</li><li>Oprav absolutních hodnot: ${stats.absoluteValueFixes}</li><li>Oprav nested struktur: ${stats.nestedFixes}</li><li>Oprav neuzavřených prostředí: ${stats.unterminatedEnvironmentFixes}</li><li>Oprav neuzavřených begin bloků: ${stats.unterminatedBeginFixes}</li><li>Oprav neuzavřených left/right: ${stats.unclosedLeftRightFixes}</li><li>Čas zpracování: ${stats.durationMs} ms (${stats.startedAt} až ${stats.endedAt})</li></ul>`;
}

function runStressTest() {
  const started = performance.now();
  const baselineLog = state.debugLog.length;
  const baselineDom = document.querySelectorAll("*").length;
  const scenarios = [
    (index) =>
      `\\left[\\vec{x}_{${index}}=\\begin{pmatrix}${index}\\\\${index + 1}\\end{pmatrix}\\right]`,
    (index) => `\\left[\\left\\{a_${index}+b_${index}\\right\\}\\right]`,
    (index) => `RAM_{req uired}\\leqRA M_{available}`,
    (index) => `x \\oplusValue_${index}=y`,
    (index) => `\\begin{pmatrix}x_1x_2\\\\${index}\\end{pmatrix}`,
  ];
  const formulas = Array.from({ length: 520 }, (_, index) =>
    scenarios[index % scenarios.length](index),
  );
  let rendered = 0;
  let converted = 0;
  const renderStarted = performance.now();
  for (const tex of formulas) {
    try {
      katex.renderToString(tex, { throwOnError: false, strict: "ignore" });
      rendered++;
    } catch (_) {
      debug("stress-katex-error", { tex });
    }
  }
  const renderMs = Math.round(performance.now() - renderStarted);
  const convertStarted = performance.now();
  for (const tex of formulas) {
    try {
      texToOmml(tex);
      converted++;
    } catch (error) {
      debug("stress-omml-error", { tex, error: error.message });
    }
  }
  const convertMs = Math.round(performance.now() - convertStarted);
  const errorCases = [
    "\\left[ a",
    "\\unknown{x}",
    "x".repeat(100001),
    "\\left[x+1\\right)",
    "\\begin{pmatrix}1&2",
  ];
  const errorResults = errorCases.map((value) => ({
    value,
    result: validateLatexStructure(cleanTex(value)),
  }));
  for (const item of errorResults)
    debug("stress-error-case", {
      input: item.value.slice(0, 120),
      ok: item.result.ok,
      reason: item.result.reason || "",
    });
  const errors = errorResults.filter((item) => !item.result.ok).length;
  const repeatRuns = 3;
  const repeats = [];
  for (let run = 1; run <= repeatRuns; run++) {
    const repeatStarted = performance.now();
    for (const tex of formulas.slice(0, 20)) texToOmml(tex);
    repeats.push({
      run,
      durationMs: Math.round(performance.now() - repeatStarted),
      debugEntries: state.debugLog.length,
      domNodes: document.querySelectorAll("*").length,
    });
  }
  state.stressTest = {
    formulas: formulas.length,
    rendered,
    converted,
    renderMs,
    convertMs,
    debugEntries: state.debugLog.length,
    debugGrowth: state.debugLog.length - baselineLog,
    domNodes: document.querySelectorAll("*").length,
    domGrowth: document.querySelectorAll("*").length - baselineDom,
    errorCases: errors,
    repeatRuns,
    repeats,
    totalMs: Math.round(performance.now() - started),
  };
  const box = $("stress-results");
  if (box)
    box.textContent = `Otestováno ${formulas.length} rovnic: KaTeX ${rendered}/${formulas.length} za ${renderMs} ms, OMML ${converted}/${formulas.length} za ${convertMs} ms, chybové scénáře ${errors}/${errorCases.length}, opakování ${repeatRuns}, DOM uzlů ${state.stressTest.domNodes}, logů ${state.stressTest.debugEntries}.`;
  debug("stress-test", state.stressTest);
}

function exportProblems(formulas) {
  return formulaProblems(formulas).filter(
    (problem) => problem.severity === "error",
  );
}

function invalidFormulaSet(formulas) {
  return new Set(
    exportProblems(formulas).map((problem) => problem.normalizedTex),
  );
}

function texToOmml(input) {
  const s = cleanTex(input);
  let i = 0;
  // NEW: Hard-stop protects the parser from malformed or adversarial input.
  const maxSteps = Math.max(1000, s.length * 50);
  let steps = 0;
  const skip = () => {
    while (/\s/.test(s[i] || "")) i++;
  };
  // LaTeX permits both \mathbf{x} and \mathbf x.  Without braces, consume
  // exactly one atom, otherwise a following =… would incorrectly become bold.
  const group = (variant = "") => {
    skip();
    if (s[i] === "{") {
      i++;
      const value = sequence("}", variant);
      if (s[i] === "}") i++;
      return value;
    }
    if (s[i] === "\\") return item(variant);
    const char = s[i++] || "";
    return script(mathRun(char, variant), variant);
  };
  const script = (base, variant) => {
    skip();
    let sub = "",
      sup = "";
    while (s[i] === "^" || s[i] === "_") {
      const what = s[i++];
      const value = group(variant);
      if (what === "^") sup = value;
      else sub = value;
      skip();
    }
    if (sub && sup)
      return `<m:sSubSup><m:e>${base}</m:e><m:sub>${sub}</m:sub><m:sup>${sup}</m:sup></m:sSubSup>`;
    if (sub) return `<m:sSub><m:e>${base}</m:e><m:sub>${sub}</m:sub></m:sSub>`;
    if (sup) return `<m:sSup><m:e>${base}</m:e><m:sup>${sup}</m:sup></m:sSup>`;
    return base;
  };
  const command = (variant) => {
    i++;
    if (s[i] === "\\") {
      i++;
      return mathRun("; ", variant);
    }
    const match = s.slice(i).match(/^[A-Za-z]+/);
    const name = match ? match[0] : s[i++] || "";
    i += match ? name.length : 0;
    if (name === "frac" || name === "dfrac" || name === "tfrac") {
      const n = group(variant),
        d = group(variant);
      return `<m:f><m:num>${n}</m:num><m:den>${d}</m:den></m:f>`;
    }
    if (name === "binom") {
      const n = group(variant),
        k = group(variant);
      return `<m:d><m:dPr><m:begChr m:val="("/><m:endChr m:val=")"/></m:dPr><m:e><m:f><m:num>${n}</m:num><m:den>${k}</m:den></m:f></m:e></m:d>`;
    }
    if (name === "sqrt") {
      const value = group(variant);
      return `<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>${value}</m:e></m:rad>`;
    }
    if (name === "boxed") {
      const value = group(variant);
      return `<m:borderBox><m:borderBoxPr><m:hideTop m:val="0"/><m:hideBot m:val="0"/><m:hideLeft m:val="0"/><m:hideRight m:val="0"/></m:borderBoxPr><m:e>${value}</m:e></m:borderBox>`;
    }
    if (name === "vec") {
      const value = group(variant);
      return `<m:acc><m:accPr><m:chr m:val="→"/></m:accPr><m:e>${value}</m:e></m:acc>`;
    }
    if (name === "begin") {
      skip();
      if (s[i] !== "{") return mathRun("\\begin", "roman");
      i++;
      const envEnd = s.indexOf("}", i);
      if (envEnd < 0) {
        i = s.length;
        return mathRun("\\begin", "roman");
      }
      const env = s.slice(i, envEnd);
      i = envEnd + 1;
      const close = `\\end{${env}}`;
      const closeAt = s.indexOf(close, i);
      if (closeAt < 0) return mathRun("\\begin{" + env + "}", "roman");
      const body = s.slice(i, closeAt);
      i = closeAt + close.length;
      const brackets = {
        pmatrix: ["(", ")"],
        bmatrix: ["[", "]"],
        Bmatrix: ["{", "}"],
        vmatrix: ["|", "|"],
        Vmatrix: ["∥", "∥"],
        array: ["[", "]"],
        cases: ["{", ""],
      }[env];
      if (!brackets) return mathRun("\\begin{" + env + "}", "roman");
      const rawRows = body.split(/\\\\/);
      const columnCount = Math.max(
        1,
        ...rawRows.map((row) => row.split("&").length),
      );
      const columns = Array.from(
        { length: columnCount },
        () => '<m:mc><m:mcPr><m:count m:val="1"/></m:mcPr></m:mc>',
      ).join("");
      const rows = rawRows
        .map(
          (row) =>
            `<m:mr>${row
              .split("&")
              .map((cell) => `<m:e>${texToOmml(cell)}</m:e>`)
              .join("")}</m:mr>`,
        )
        .join("");
      return `<m:d><m:dPr><m:begChr m:val="${brackets[0]}"/><m:endChr m:val="${brackets[1]}"/></m:dPr><m:e><m:m><m:mPr><m:baseJc m:val="center"/><m:plcHide m:val="1"/><m:mcs>${columns}</m:mcs></m:mPr>${rows}</m:m></m:e></m:d>`;
    }
    if (["mathbf", "boldsymbol", "bm", "textbf"].includes(name))
      return group("bold");
    if (["mathrm", "textrm", "operatorname", "texttt"].includes(name))
      return group("roman");
    if (["text", "textit"].includes(name)) return group("text");
    if (name === "mathbb") return group("double");
    if (name === "mathcal") return group("script");
    if (name === "mathsf") return group("roman");
    if (name === "hat") {
      const value = group(variant);
      return `<m:acc><m:accPr><m:chr m:val="^"/></m:accPr><m:e>${value}</m:e></m:acc>`;
    }
    if (["widehat", "widetilde", "tilde"].includes(name)) {
      const value = group(variant);
      return `<m:acc><m:accPr><m:chr m:val="${name === "tilde" || name === "widetilde" ? "~" : "^"}"/></m:accPr><m:e>${value}</m:e></m:acc>`;
    }
    if (["overset", "stackrel"].includes(name)) {
      const base = group(variant);
      const top = group(variant);
      return (base || "") + (top || "");
    }
    if (["underbrace", "overbrace"].includes(name)) {
      const base = group(variant);
      const label = group(variant);
      return base + label;
    }
    if (["xrightarrow", "xleftarrow", "xleftrightarrow"].includes(name)) {
      const label = group(variant);
      const base = group(variant);
      return base || label || mathRun("→", variant);
    }
    if (
      ["longrightarrow", "longleftarrow", "longleftrightarrow"].includes(name)
    )
      return mathRun(
        { longrightarrow: "⟶", longleftarrow: "⟵", longleftrightarrow: "⟷" }[
          name
        ],
        variant,
      );
    if (["lfloor", "lceil"].includes(name))
      return mathRun({ lfloor: "⌊", lceil: "⌈" }[name], variant);
    if (["rfloor", "rceil"].includes(name))
      return mathRun({ rfloor: "⌋", rceil: "⌉" }[name], variant);
    if (name === "substack") return group(variant);
    if (["star", "ast"].includes(name)) return mathRun("⋆", variant);
    if (name === "circ") return mathRun("∘", variant);
    if (name === "pk") return mathRun("pk", "roman");
    if (name === "{" || name === "}") return mathRun(name, variant);
    if (
      name === "left" ||
      name === "right" ||
      name === "middle" ||
      name === "big" ||
      name === "Big" ||
      name === "bigl" ||
      name === "bigr"
    )
      return "";
    if (name === "not") return mathRun("¬", variant) + item(variant);
    if (name === "pmod") return mathRun("mod ", "roman") + group("roman");
    if (name === "mod" || name === "bmod") return mathRun(" mod ", "roman");
    if (name === "quad") return mathRun("    ", variant);
    if (name === "qquad") return mathRun("        ", variant);
    if (["le", "ge", "ne"].includes(name))
      return mathRun({ le: "≤", ge: "≥", ne: "≠" }[name], variant);
    if (["sup", "cap", "cup"].includes(name))
      return mathRun(
        { sup: "sup", cap: "∩", cup: "∪" }[name],
        name === "sup" ? "roman" : variant,
      );
    if (
      [
        "perp",
        "bullet",
        "mapsto",
        "Longrightarrow",
        "longmapsto",
        "diagdown",
        "diagup",
      ].includes(name)
    )
      return mathRun(
        {
          perp: "⊥",
          bullet: "•",
          mapsto: "↦",
          Longrightarrow: "⟹",
          longmapsto: "⟼",
          diagdown: "╲",
          diagup: "╱",
        }[name],
        variant,
      );
    if (name === "cdots" || name === "dots" || name === "ldots")
      return mathRun("…", variant);
    if (name === "vdots") return mathRun("⋮", variant);
    if (name === "ddots") return mathRun("⋯", variant);
    if (name === "ell") return mathRun("ℓ", variant);
    if (["det", "Pr", "vol", "ker", "dim", "deg", "gcd", "ord"].includes(name))
      return mathRun(name, "roman");
    if (symbols[name]) return mathRun(symbols[name], variant);
    if (operators[name])
      return mathRun(
        operators[name],
        name === "lim" ||
          /^(log|ln|sin|cos|tan|max|min|arg|det|Pr|vol|ker|dim|deg|gcd|ord)$/.test(
            name,
          )
          ? "roman"
          : variant,
      );
    if (
      name === " " ||
      name === "," ||
      name === ";" ||
      name === ":" ||
      name === "!"
    )
      return mathRun(" ", variant);
    return mathRun("\\" + name, "roman");
  };
  const item = (variant = "") => {
    if (++steps > maxSteps) {
      debug("parser-overflow", { tex: input, maxSteps });
      i = s.length;
      return mathRun("[neplatny nebo příliš složitý zápis]", "roman");
    }
    skip();
    if (i >= s.length || s[i] === "}") return "";
    let base;
    if (s[i] === "{") {
      i++;
      base = sequence("}", variant);
      if (s[i] === "}") i++;
    } else if (s[i] === "\\") base = command(variant);
    else {
      let text = "";
      while (i < s.length && !/[\\{}^_]/.test(s[i])) text += s[i++];
      base = mathRun(text, variant);
    }
    return script(base, variant);
  };
  const sequence = (end = "", variant = "") => {
    let out = "";
    while (i < s.length && (!end || s[i] !== end)) out += item(variant);
    return out;
  };
  return sequence();
}

function equationPara(tex, pPr = "") {
  return `<w:p>${pPr || '<w:pPr><w:jc w:val="center"/></w:pPr>'}<m:oMathPara><m:oMath>${texToOmml(tex)}</m:oMath></m:oMathPara></w:p>`;
}
function parseParagraphXml(xml) {
  // The paragraph is parsed as an independent XML document. Prefixes that are
  // inherited in word/document.xml must therefore be declared again here.
  const standalone = xml.replace(
    "<w:p>",
    `<w:p xmlns:w="${W}" xmlns:m="${M}">`,
  );
  const parsed = new DOMParser().parseFromString(standalone, "application/xml");
  if (hasXmlError(parsed))
    throw new Error("Nelze vytvořit platný odstavec Office Math.");
  return parsed.documentElement;
}
function replaceWithEquation(p, tex) {
  const pPr = [...p.childNodes].find((n) => local(n) === "pPr");
  const preserved = pPr
    ? new XMLSerializer().serializeToString(pPr)
    : '<w:pPr><w:jc w:val="center"/></w:pPr>';
  p.parentNode.replaceChild(
    p.ownerDocument.importNode(
      parseParagraphXml(equationPara(tex, preserved)),
      true,
    ),
    p,
  );
}
function replaceInlineInExistingMathParagraph(p) {
  const rx =
    /\(([^()\n]*\\[A-Za-z]+[^()\n]*)\)|\(([A-Za-z](?:\s*[=<>]\s*[^()\n]+)?)\)/g;
  const runs = [...p.getElementsByTagNameNS(W, "r")];
  let changed = false;
  for (const run of runs) {
    const textNode = [...run.getElementsByTagNameNS(W, "t")][0];
    if (!textNode) continue;
    const text = textNode.textContent;
    const matches = [...text.matchAll(rx)];
    if (!matches.length) continue;
    const owner = run.parentNode;
    const fragment = p.ownerDocument.createDocumentFragment();
    const appendRun = (value) => {
      if (!value) return;
      const clone = run.cloneNode(true);
      const cloneText = [...clone.getElementsByTagNameNS(W, "t")][0];
      cloneText.textContent = value;
      fragment.appendChild(clone);
    };
    let cursor = 0;
    for (const match of matches) {
      appendRun(text.slice(cursor, match.index));
      const mathXml = `<w:p xmlns:w="${W}" xmlns:m="${M}"><m:oMath>${texToOmml(match[1] || match[2])}</m:oMath></w:p>`;
      const mathParagraph = parseParagraphXml(mathXml);
      fragment.appendChild(
        p.ownerDocument.importNode(
          mathParagraph.getElementsByTagNameNS(M, "oMath")[0],
          true,
        ),
      );
      cursor = match.index + match[0].length;
    }
    appendRun(text.slice(cursor));
    owner.replaceChild(fragment, run);
    changed = true;
  }
  return changed;
}
function replaceInlineEquations(p, text, invalidTexes = new Set()) {
  if (p.getElementsByTagNameNS(M, "oMath").length)
    return replaceInlineInExistingMathParagraph(p);
  const rx =
    /\(([^()\n]*\\[A-Za-z]+[^()\n]*)\)|\(([A-Za-z](?:\s*[=<>]\s*[^()\n]+)?)\)/g;
  if (!rx.test(text)) return false;
  rx.lastIndex = 0;
  const pPr = [...p.childNodes].find((n) => local(n) === "pPr");
  const preserved = pPr ? new XMLSerializer().serializeToString(pPr) : "";
  let cursor = 0;
  let body = "";
  for (const match of text.matchAll(rx)) {
    if (invalidTexes.has(cleanTex(match[1] || match[2]))) continue;
    body += runXml(text.slice(cursor, match.index));
    body += `<m:oMath>${texToOmml(match[1] || match[2])}</m:oMath>`;
    cursor = match.index + match[0].length;
  }
  body += runXml(text.slice(cursor));
  const xml = `<w:p xmlns:w="${W}" xmlns:m="${M}">${preserved}${body}</w:p>`;
  p.parentNode.replaceChild(
    p.ownerDocument.importNode(parseParagraphXml(xml), true),
    p,
  );
  return true;
}

function hasXmlError(doc) {
  return (
    !doc.documentElement ||
    local(doc.documentElement) === "parsererror" ||
    doc.getElementsByTagName("parsererror").length > 0
  );
}

async function validateInputFormat(value, kind = "text") {
  if (value == null) throw new Error("Vstup je prázdný.");
  if (kind === "docx") {
    if (typeof value === "string") {
      if (!/^\s*PK\x03\x04/.test(value) && !/^\s*PK\x05\x06/.test(value)) {
        throw new Error("Nahraný soubor není validní DOCX balík.");
      }
      return;
    }
    if (value instanceof Blob) {
      const slice = value.slice ? value.slice(0, 4) : value;
      const buffer = await slice.arrayBuffer();
      const header = new Uint8Array(buffer);
      if (
        header.length < 4 ||
        header[0] !== 0x50 ||
        header[1] !== 0x4b ||
        header[2] !== 0x03 ||
        header[3] !== 0x04
      ) {
        throw new Error(
          "Výstup není validní DOCX balík – chybí ZIP hlavička PK\x03\x04.",
        );
      }
      return;
    }
    if (value instanceof File) {
      if (!/\.docx$/i.test(value.name))
        throw new Error("Nahraný soubor není DOCX.");
      return;
    }
    throw new Error("Výstup není validní DOCX data.");
  }

  const text = String(value);
  const binary = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text);
  if (binary) throw new Error("Vstup obsahuje neplatné binární znaky.");
  const supported = [".docx", ".txt", ".tex", ".texi", ".md"];
  if (
    kind === "file" &&
    !supported.some((ext) => text.toLowerCase().endsWith(ext))
  ) {
    throw new Error(
      "Nepodporovaný formát souboru. Povolené jsou DOCX, TXT a TeX/Markdown.",
    );
  }
}

async function validateDocxPackage(blob, expectedMath = 0) {
  if (!(blob instanceof Blob) && typeof blob !== "object") {
    throw new Error("Výstup není validní binární data DOCX.");
  }
  if (!blob.size || blob.size < 512) {
    throw new Error("Výstup DOCX je příliš malý nebo poškozený.");
  }
  let reopened;
  try {
    reopened = await JSZip.loadAsync(blob, { checkCRC32: true });
  } catch (error) {
    throw new Error("Výstup není platný ZIP/DOCX: " + error.message);
  }
  const required = [
    "[Content_Types].xml",
    "_rels/.rels",
    "word/document.xml",
    "word/styles.xml",
    "word/_rels/document.xml.rels",
  ];
  for (const name of required)
    if (!reopened.file(name))
      throw new Error("Chybí povinná část DOCX: " + name);
  const readXml = async (name) => {
    const zipEntry = reopened.file(name);
    if (!zipEntry) throw new Error("Chybí část: " + name);
    const text = await zipEntry.async("string");
    const xml = new DOMParser().parseFromString(text, "application/xml");
    if (hasXmlError(xml)) throw new Error("Neplatné XML v části: " + name);
    return xml;
  };
  const [contentTypes, rootRels, document, styles, documentRels] =
    await Promise.all([
      readXml("[Content_Types].xml"),
      readXml("_rels/.rels"),
      readXml("word/document.xml"),
      readXml("word/styles.xml"),
      readXml("word/_rels/document.xml.rels"),
    ]);
  if (
    local(document.documentElement) !== "document" ||
    document.documentElement.namespaceURI !== W
  )
    throw new Error("word/document.xml nemá platný kořen dokumentu Word.");
  if (
    local(styles.documentElement) !== "styles" ||
    styles.documentElement.namespaceURI !== W
  )
    throw new Error("word/styles.xml nemá platný kořen stylů Wordu.");
  const ctNs = "http://schemas.openxmlformats.org/package/2006/content-types";
  const relNs = "http://schemas.openxmlformats.org/package/2006/relationships";
  const hasMainPart = [
    ...contentTypes.getElementsByTagNameNS(ctNs, "Override"),
  ].some((node) => node.getAttribute("PartName") === "/word/document.xml");
  const hasStylesPart = [
    ...contentTypes.getElementsByTagNameNS(ctNs, "Override"),
  ].some((node) => node.getAttribute("PartName") === "/word/styles.xml");
  const hasMainRelation = [
    ...rootRels.getElementsByTagNameNS(relNs, "Relationship"),
  ].some(
    (node) =>
      node.getAttribute("Type") ===
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
  );
  const hasStylesRelation = [
    ...documentRels.getElementsByTagNameNS(relNs, "Relationship"),
  ].some(
    (node) =>
      node.getAttribute("Type") ===
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",
  );
  if (!hasMainPart)
    throw new Error(
      "Chybí deklarace hlavního dokumentu v [Content_Types].xml.",
    );
  if (!hasStylesPart)
    throw new Error("Chybí deklarace stylů dokumentu v [Content_Types].xml.");
  if (!hasMainRelation) throw new Error("Chybí vztah k hlavnímu dokumentu.");
  if (!hasStylesRelation) throw new Error("Chybí vztah ke stylům dokumentu.");
  const mathCount = document.getElementsByTagNameNS(M, "oMath").length;
  if (expectedMath && mathCount < expectedMath)
    throw new Error(
      `Kontrola našla jen ${mathCount} objektů Office Math, očekáváno nejméně ${expectedMath}.`,
    );
  return { mathCount, files: Object.keys(reopened.files).length };
}

function transformDocumentXml(inputXml, invalidTexes = new Set()) {
  const doc = new DOMParser().parseFromString(inputXml, "application/xml");
  if (doc.querySelector("parsererror"))
    throw new Error("Dokument XML nelze přečíst.");
  const convertParen = $("convert-paren").checked;
  function visit(parent) {
    const children = [...parent.childNodes];
    for (let n = 0; n < children.length; n++) {
      const p = children[n];
      if (local(p) !== "p") {
        if (p.nodeType === 1) visit(p);
        continue;
      }
      const text = paragraphText(p);
      const exact = blockFormula(text);
      if (exact) {
        if (!invalidTexes.has(cleanTex(exact[1])))
          replaceWithEquation(p, exact[1]);
        continue;
      }
      const environment = environmentStart(text);
      if (environment) {
        let combined = text,
          end = -1;
        for (let k = n + 1; k < children.length && k < n + 50; k++) {
          if (local(children[k]) !== "p") break;
          const next = paragraphText(children[k]);
          combined += "\n" + next;
          if (environmentEnd(next, environment)) {
            end = k;
            break;
          }
        }
        if (end >= 0 && !invalidTexes.has(cleanTex(combined))) {
          replaceWithEquation(p, combined);
          for (let k = n + 1; k <= end; k++) children[k].remove();
          n = end;
          continue;
        }
      }
      const escaped = blockStart(text);
      if (escaped !== null) {
        let combined = text,
          end = -1;
        const ending = escaped ? /^\s*\\\]\s*$/ : /^\s*\]\s*$/;
        for (let k = n + 1; k < children.length && k < n + 50; k++) {
          if (local(children[k]) !== "p") break;
          combined += "\n" + paragraphText(children[k]);
          if (ending.test(paragraphText(children[k]))) {
            end = k;
            break;
          }
        }
        const multi = blockFormula(combined);
        if (end >= 0 && multi) {
          replaceWithEquation(p, multi[1]);
          for (let k = n + 1; k <= end; k++) children[k].remove();
          n = end;
          continue;
        }
      }
      if (replaceInlineEquations(p, text, invalidTexes)) continue;
      if (isStandaloneTex(text)) {
        if (!invalidTexes.has(cleanTex(text))) replaceWithEquation(p, text);
        continue;
      }
      if (convertParen && /^\s*\([^()]*\\[A-Za-z]+[^()]*\)\s*$/.test(text))
        replaceWithEquation(p, text.trim().slice(1, -1));
    }
  }
  visit(doc.documentElement);
  return new XMLSerializer().serializeToString(doc);
}

function htmlRuns(node, style = {}, invalidTexes = new Set()) {
  if (node.nodeType === Node.TEXT_NODE)
    return splitInline(node.nodeValue, style, invalidTexes);
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const tag = node.tagName.toLowerCase();
  const next = {
    ...style,
    bold: style.bold || tag === "b" || tag === "strong",
    italic: style.italic || tag === "i" || tag === "em",
    underline: style.underline || tag === "u",
  };
  if (tag === "br") return "<w:r><w:br/></w:r>";
  return [...node.childNodes]
    .map((child) => htmlRuns(child, next, invalidTexes))
    .join("");
}

function htmlTextRuns(node, style = {}, invalidTexes = new Set()) {
  if (node.nodeType === Node.TEXT_NODE)
    return splitHtmlInline(node.nodeValue, style, invalidTexes);
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const tag = node.tagName.toLowerCase();
  if (tag === "br") return "<br>";
  const next = {
    ...style,
    bold: style.bold || tag === "b" || tag === "strong",
    italic: style.italic || tag === "i" || tag === "em",
    underline: style.underline || tag === "u",
  };
  const content = [...node.childNodes]
    .map((child) => htmlTextRuns(child, next, invalidTexes))
    .join("");
  if (tag === "strong" || tag === "b") return `<strong>${content}</strong>`;
  if (tag === "em" || tag === "i") return `<em>${content}</em>`;
  if (tag === "u") return `<u>${content}</u>`;
  return content;
}

function renderHtmlFormula(tex, invalidTexes = new Set()) {
  const value = cleanTex(tex);
  if (invalidTexes.has(value)) return escapeHtml(tex);
  try {
    return katex.renderToString(value, {
      displayMode: true,
      output: "mathml",
      throwOnError: true,
      strict: "ignore",
    });
  } catch (_) {
    const fallback = fallbackTex(value);
    try {
      return katex.renderToString(fallback, {
        displayMode: true,
        output: "mathml",
        throwOnError: true,
        strict: "ignore",
      });
    } catch (error) {
      return `<span class="formula-error">${escapeHtml(error.message)}</span>`;
    }
  }
}

function splitHtmlInline(text, style = {}, invalidTexes = new Set()) {
  if (!$("convert-inline").checked) return escapeHtml(text);
  const rx = /\\\(([^\n]*?)\\\)|\$([^$\n]+)\$/g;
  let out = "";
  let cursor = 0;
  for (const match of text.matchAll(rx)) {
    out += escapeHtml(text.slice(cursor, match.index));
    const tex = cleanTex(match[1] || match[2]);
    if (invalidTexes.has(tex)) out += escapeHtml(match[0]);
    else out += renderHtmlFormula(tex, invalidTexes);
    cursor = match.index + match[0].length;
  }
  out += escapeHtml(text.slice(cursor));
  if (style.bold) out = `<strong>${out}</strong>`;
  if (style.italic) out = `<em>${out}</em>`;
  if (style.underline) out = `<u>${out}</u>`;
  return out;
}

function createHtmlFromEditor(invalidTexes = new Set()) {
  const blocks = state.documentXml
    ? [...new DOMParser()
        .parseFromString(state.documentXml, "application/xml")
        .getElementsByTagNameNS(W, "p")]
        .map((paragraph) => {
          const text = paragraphText(paragraph);
          return { tag: "p", node: document.createTextNode(text), text };
        })
    : editorBlocks();
  let body = "";
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.tag === "table") {
      const rows = [...block.node.rows]
        .map(
          (row) =>
            `<tr>${[...row.cells].map((cell) => `<td>${[...cell.childNodes].map((node) => htmlTextRuns(node, {}, invalidTexes)).join("")}</td>`).join("")}</tr>`,
        )
        .join("");
      body += `<table>${rows}</table>`;
      continue;
    }
    const environment = environmentStart(block.text);
    if (environment) {
      let tex = block.text;
      let end = -1;
      for (let k = i + 1; k < blocks.length && k < i + 50; k++) {
        tex += "\n" + blocks[k].text;
        if (environmentEnd(blocks[k].text, environment)) {
          end = k;
          break;
        }
      }
      if (end >= 0) {
        body += `<div class="equation-render">${renderHtmlFormula(tex, invalidTexes)}</div>`;
        i = end;
        continue;
      }
    }
    const blockMatch = blockFormula(block.text);
    if (blockMatch) {
      body += `<div class="equation-render">${renderHtmlFormula(blockMatch[1], invalidTexes)}</div>`;
      continue;
    }
    const escaped = blockStart(block.text);
    if (escaped !== null) {
      const ending = escaped ? /^\s*\\\]\s*$/ : /^\s*\]\s*$/;
      let tex = "";
      let end = -1;
      for (let k = i + 1; k < blocks.length && k < i + 50; k++) {
        if (ending.test(blocks[k].text)) {
          end = k;
          break;
        }
        tex += (tex ? "\n" : "") + blocks[k].text;
      }
      if (end > i) {
        body += `<div class="equation-render">${renderHtmlFormula(tex, invalidTexes)}</div>`;
        i = end;
        continue;
      }
    }
    // Stejná detekce jako v editorPara() pro DOCX, jinak "holé" LaTeX řádky
    // (bez \[ \], \( \) nebo $ $) zůstanou v HTML nepřevedené.
    if (isStandaloneTex(block.text)) {
      body += `<div class="equation-render">${renderHtmlFormula(block.text, invalidTexes)}</div>`;
      continue;
    }
    const tag = /^h[1-3]$/.test(block.tag) ? block.tag : "p";
    const content = block.node.nodeType === Node.TEXT_NODE
      ? splitHtmlInline(block.text, {}, invalidTexes)
      : [...block.node.childNodes].map((node) => htmlTextRuns(node, {}, invalidTexes)).join("");
    body += `<${tag}>${content || escapeHtml(block.text)}</${tag}>`;
  }
  return body || "<p></p>";
}
function splitInline(text, style, invalidTexes = new Set()) {
  if (!$("convert-inline").checked) return runXml(text, style);
  let out = "",
    cursor = 0;
  const rx = /\\\(([\s\S]*?)\\\)|\$([^$\n]+)\$/g;
  for (const match of text.matchAll(rx)) {
    const tex = cleanTex(match[1] || match[2]);
    if (invalidTexes.has(tex)) continue;
    out += runXml(text.slice(cursor, match.index), style);
    out += `<m:oMath>${texToOmml(tex)}</m:oMath>`;
    cursor = match.index + match[0].length;
  }
  return out + runXml(text.slice(cursor), style);
}
function editorBlocks() {
  const blocks = [];
  for (const child of $("editor").childNodes) {
    if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim()) {
      for (const text of child.nodeValue.split(/\n+/))
        if (text.trim()) blocks.push({ tag: "p", node: child, text });
    } else if (
      child.nodeType === Node.ELEMENT_NODE &&
      child.tagName.toLowerCase() !== "table"
    )
      blocks.push({
        tag: child.tagName.toLowerCase(),
        node: child,
        text: child.innerText,
      });
    else if (
      child.nodeType === Node.ELEMENT_NODE &&
      child.tagName.toLowerCase() === "table"
    )
      blocks.push({ tag: "table", node: child, text: "" });
  }
  return blocks;
}
function editorPara(block, invalidTexes = new Set()) {
  const tag = block.tag;
  const text = block.text || "";
  const formula = blockFormula(text);
  if (formula)
    return invalidTexes.has(cleanTex(formula[1]))
      ? `<w:p>${runXml(formula[1])}</w:p>`
      : equationPara(formula[1]);
  if (isStandaloneTex(text))
    return invalidTexes.has(cleanTex(text))
      ? `<w:p>${runXml(text)}</w:p>`
      : equationPara(text);
  const heading = /^h[1-3]$/.test(tag)
    ? `<w:pPr><w:pStyle w:val="Heading${tag[1]}"/></w:pPr>`
    : tag === "li"
      ? '<w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>'
      : "";
  const prefix = tag === "li" ? runXml("• ") : "";
  return `<w:p>${heading}${prefix}${block.node.nodeType === Node.TEXT_NODE ? splitInline(text, {}, invalidTexes) : [...block.node.childNodes].map((n) => htmlRuns(n, {}, invalidTexes)).join("") || runXml(text)}</w:p>`;
}
function tableXml(table) {
  const rows = [...table.rows]
    .map(
      (row) =>
        `<w:tr>${[...row.cells].map((cell) => `<w:tc><w:tcPr><w:tcW w:w="2800" w:type="dxa"/></w:tcPr><w:p>${[...cell.childNodes].map((n) => htmlRuns(n)).join("") || runXml(cell.innerText)}</w:p></w:tc>`).join("")}</w:tr>`,
    )
    .join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="B7C4D1"/><w:left w:val="single" w:sz="4" w:color="B7C4D1"/><w:bottom w:val="single" w:sz="4" w:color="B7C4D1"/><w:right w:val="single" w:sz="4" w:color="B7C4D1"/><w:insideH w:val="single" w:sz="4" w:color="D9E1E8"/><w:insideV w:val="single" w:sz="4" w:color="D9E1E8"/></w:tblBorders></w:tblPr>${rows}</w:tbl>`;
}

function createDocxFromEditor(invalidTexes = new Set()) {
  const blocks = editorBlocks();
  let body = "";
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.tag === "table") {
      body += tableXml(b.node);
      continue;
    }
    const environment = environmentStart(b.text);
    if (environment) {
      let tex = b.text,
        end = -1;
      for (let k = i + 1; k < blocks.length && k < i + 50; k++) {
        tex += "\n" + blocks[k].text;
        if (environmentEnd(blocks[k].text, environment)) {
          end = k;
          break;
        }
      }
      if (end >= 0) {
        body += invalidTexes.has(cleanTex(tex))
          ? `<w:p>${runXml(tex)}</w:p>`
          : equationPara(tex);
        i = end;
        continue;
      }
    }
    const escaped = blockStart(b.text);
    if (escaped !== null) {
      const ending = escaped ? /^\s*\\\]\s*$/ : /^\s*\]\s*$/;
      let tex = "",
        end = -1;
      for (let k = i + 1; k < blocks.length && k < i + 50; k++) {
        if (ending.test(blocks[k].text)) {
          end = k;
          break;
        }
        tex += (tex ? "\n" : "") + blocks[k].text;
      }
      if (end > i) {
        body += equationPara(tex);
        i = end;
        continue;
      }
    }
    body += editorPara(b, invalidTexes);
  }
  if (!body) body = "<w:p><w:r><w:t></w:t></w:r></w:p>";
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${W}" xmlns:m="${M}"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
  );
  zip.file(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
  );
  zip.file("word/document.xml", documentXml);
  zip.file(
    "word/styles.xml",
    `<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="${W}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos" w:cs="Aptos"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style></w:styles>`,
  );
  return zip;
}

async function exportDocx() {
  try {
    const formulas = scan();
    const invalidTexes = invalidFormulaSet(formulas);
    const existingMath = state.documentXml
      ? documentMathCount(state.documentXml)
      : 0;
    if (
      !formulas.length &&
      !state.documentXml &&
      $("editor").textContent.trim() === ""
    ) {
      throw new Error(
        "Nejsou k dispozici žádné data k exportu. Vložte text nebo načtěte DOCX.",
      );
    }
    let zip, name;
    if (state.zip && state.documentXml) {
      zip = state.zip;
      zip.file(
        "word/document.xml",
        transformDocumentXml(state.documentXml, invalidTexes),
      );
      name = state.sourceName.replace(/\.docx$/i, "") + "_rovnice.docx";
    } else {
      zip = createDocxFromEditor(invalidTexes);
      name = "text_s_rovnicemi.docx";
    }
    $("export-note").textContent = "Probíhá validace výsledného DOCX…";
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
    });
    await validateInputFormat(blob, "docx");
    // Musí odpovídat kritériu, podle kterého se rovnice skutečně vynechávají (invalidTexes),
    // jinak status "fixed"/"valid" z KaTeX validace neodpovídá tomu, co je podporováno v OMML.
    const convertible = formulas.filter(
      (formula) => formula.status !== "invalid" && !invalidTexes.has(formula.tex),
    ).length;
    const report = await validateDocxPackage(blob, existingMath + convertible);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
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

function downloadDebugLog() {
  const lines =
    state.debugLog.map((entry) => JSON.stringify(entry)).join("\n") ||
    "Žádný debug log.";
  const content = `# LaTeX → Word debug log\n# version: ${APP_VERSION}\n# generated: ${new Date().toISOString()}\n${lines}\n`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob(["\uFEFF", content], { type: "text/plain;charset=utf-8" }),
  );
  link.download = `latex-word-debug-${APP_VERSION.replace(/\./g, "-")}.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getKatexCss() {
  for (const styleSheet of document.styleSheets) {
    if (!styleSheet.href || !/katex(?:\.min)?\.css(?:$|\?)/i.test(styleSheet.href)) continue;

    try {
      return Array.from(styleSheet.cssRules, (rule) => rule.cssText).join("\n");
    } catch (_) {
      return "";
    }
  }

  return "";
}

function exportHtml() {
  try {
    const formulas = scan();
    const invalidTexes = invalidFormulaSet(formulas);
    const documentHtml = createHtmlFromEditor(invalidTexes);
    const katexCss = getKatexCss();
    const html = `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <title>LaTeX → HTML export</title>
  <style>${katexCss}</style>
  <style>
    body { font-family: "Segoe UI", system-ui, sans-serif; margin: 2rem; color: #17202a; background: #f4f7fa; }
    p, h1, h2, h3, table, .equation-render { margin: 0 0 1rem; }
    table { border-collapse: collapse; }
    td { border: 1px solid #d9e1e8; padding: 0.5rem 0.75rem; }
    .equation-render { background: #fbfdff; border: 1px solid #d9e1e8; border-radius: 8px; padding: 1.25rem; overflow-x: auto; }
    .formula-error { color: #b42318; font-weight: 600; }
  </style>
</head>
<body>
  <h1>LaTeX do HTML</h1>
  <main>${documentHtml}</main>
</body>
</html>`;
    const blob = new Blob(["\uFEFF", html], {
      type: "text/html;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "latex-rovnice.html";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    const countText = formulas.length
      ? `Hotovo: export HTML obsahuje původní text a ${formulas.length} zpracovaných rovnic.`
      : "Hotovo: export HTML byl vytvořen s původním textem bez rozpoznaných rovnic.";
    $("export-note").textContent = countText;
  } catch (error) {
    debug("export-html-error", { error: error.message });
    $("export-note").textContent = "Export HTML se nezdařil: " + error.message;
  }
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
    $("file-name").textContent =
      "Soubor se nepodařilo načíst: " + error.message;
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
$("download-html").addEventListener("click", () => {
  if (window.latexWordHtmlExport && typeof window.latexWordHtmlExport.exportHtml === "function") {
    window.latexWordHtmlExport.exportHtml();
    return;
  }
  exportHtml();
});
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
  if (storedTheme === "dark" || storedTheme === "light")
    manualTheme = storedTheme;
} catch (_) {
  /* localStorage may be disabled */
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
  } catch (_) {
    /* keep the session-only override */
  }
});
$("stress-test").addEventListener("click", runStressTest);
window.latexWordApp = { scan, sourceText };
