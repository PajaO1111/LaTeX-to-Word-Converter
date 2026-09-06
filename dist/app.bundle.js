(() => {
  // src/core/utils/knownCommands.js
  var symbols = {
    alpha: "\u03B1",
    beta: "\u03B2",
    gamma: "\u03B3",
    delta: "\u03B4",
    epsilon: "\u03B5",
    varepsilon: "\u03B5",
    theta: "\u03B8",
    lambda: "\u03BB",
    mu: "\u03BC",
    nu: "\u03BD",
    xi: "\u03BE",
    pi: "\u03C0",
    rho: "\u03C1",
    sigma: "\u03C3",
    tau: "\u03C4",
    phi: "\u03C6",
    psi: "\u03C8",
    omega: "\u03C9",
    eta: "\u03B7",
    zeta: "\u03B6",
    chi: "\u03C7",
    Gamma: "\u0393",
    Delta: "\u0394",
    Theta: "\u0398",
    Lambda: "\u039B",
    Xi: "\u039E",
    Pi: "\u03A0",
    Sigma: "\u03A3",
    Phi: "\u03A6",
    Psi: "\u03A8",
    Omega: "\u03A9",
    in: "\u2208",
    notin: "\u2209",
    leq: "\u2264",
    geq: "\u2265",
    neq: "\u2260",
    le: "\u2264",
    ge: "\u2265",
    ne: "\u2260",
    approx: "\u2248",
    sim: "\u223C",
    equiv: "\u2261",
    propto: "\u221D",
    times: "\xD7",
    cdot: "\xB7",
    pm: "\xB1",
    mp: "\u2213",
    to: "\u2192",
    rightarrow: "\u2192",
    Rightarrow: "\u21D2",
    leftarrow: "\u2190",
    Leftarrow: "\u21D0",
    iff: "\u21D4",
    implies: "\u21D2",
    ldots: "\u2026",
    ldquo: '"',
    rdquo: '"',
    vert: "|",
    mid: "|",
    parallel: "\u2225",
    infty: "\u221E",
    partial: "\u2202",
    nabla: "\u2207",
    forall: "\u2200",
    exists: "\u2203",
    emptyset: "\u2205",
    subset: "\u2282",
    supset: "\u2283",
    subseteq: "\u2286",
    supseteq: "\u2287",
    setminus: "\u2216",
    gg: "\u226B",
    ll: "\u226A",
    lesssim: "\u2272",
    gtrsim: "\u2273",
    downarrow: "\u2193",
    uparrow: "\u2191",
    Downarrow: "\u21D3",
    Uparrow: "\u21D1",
    leftrightarrow: "\u2194",
    longleftrightarrow: "\u27F7",
    Leftrightarrow: "\u21D4",
    Longrightarrow: "\u27F9",
    not: "\xAC",
    ell: "\u2113",
    iota: "\u03B9",
    mathbbR: "\u211D",
    mathbbZ: "\u2124",
    angle: "\u2220",
    langle: "\u27E8",
    rangle: "\u27E9",
    det: "det",
    Pr: "Pr",
    lbrack: "[",
    rbrack: "]",
    lbrace: "{",
    rbrace: "}",
    backslash: "\\",
    cdots: "\u2026",
    vdots: "\u22EE",
    ddots: "\u22EF",
    hat: "^",
    widehat: "^",
    circ: "\u2218",
    degree: "\xB0",
    odot: "\u2299",
    star: "\u22C6",
    ast: "\u22C6",
    tilde: "~",
    varphi: "\u03C6",
    nmid: "\u2224",
    cong: "\u2245",
    oplus: "\u2295",
    vdash: "\u22A2",
    checkmark: "\u2713",
    div: "\xF7"
  };
  var operators = {
    sum: "\u2211",
    prod: "\u220F",
    int: "\u222B",
    oint: "\u222E",
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
    varphi: "\u03C6",
    oplus: "\u2295",
    vdash: "\u22A2",
    cong: "\u2245",
    nmid: "\u2224"
  };
  var knownCommands = /* @__PURE__ */ new Set([
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
    "circ"
  ]);

  // src/core/latex/cleanTex.js
  function fallbackTex(tex) {
    return String(tex || "").replace(/\\left\s*/g, "").replace(/\\right\s*/g, "");
  }
  function cleanTex(tex) {
    const original = String(tex || "");
    try {
      if (typeof window !== "undefined" && typeof katex !== "undefined") {
        katex.renderToString(original.trim(), {
          throwOnError: true,
          strict: "ignore"
        });
        return { cleaned: original.trim(), protectedBlocks: [] };
      }
    } catch {
    }
    const protectedText = [];
    let value = String(tex || "").replace(/\r/g, "").replace(/^\s+|\s+$/g, "");
    value = value.replace(/\\text\{([^{}]*)\}/g, (match) => {
      const index = protectedText.push(match) - 1;
      return `@@TEXT_BLOCK_${index}@@`;
    });
    value = value.replace(/\n\s*/g, " ").replace(/\\(mathbb|mathbf|mathrm|mathcal|mathsf)\s+([A-Za-z])/g, "\\$1{$2}").replace(/\\left\s*\{/g, "\\left\\{").replace(/\\right\s*\}/g, "\\right\\}").replace(/\\left\\lfloor([\s\S]*?)\\right\\rceil/g, "\\left\\lfloor$1\\right\\rfloor").replace(/\\left\\lceil([\s\S]*?)\\right\\rfloor/g, "\\left\\lceil$1\\right\\rceil").replace(/\\left\\lfloor([\s\S]*?)\\right\\lceil/g, "\\left\\lfloor$1\\right\\rfloor").replace(/\\left\\lceil([\s\S]*?)\\right\\lfloor/g, "\\left\\lceil$1\\right\\rceil").replace(/;\|;/g, "\\;\\middle|\\;").replace(
      /\\(rightarrow|leftarrow|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|uparrow|downarrow|Uparrow|Downarrow|approx|sim|equiv|subset|supset|subseteq|supseteq|gg|ll|lesssim|gtrsim|not|det|implies|iff|to|in|notin|parallel|forall|exists|emptyset)([A-Za-z0-9])/g,
      "\\$1 $2"
    ).replace(
      /\\(longrightarrow|longleftarrow|longleftrightarrow|xrightarrow|xleftarrow|xleftrightarrow|rightarrow|leftarrow|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|approx|sim|equiv|subset|supset|subseteq|supseteq|gg|ll|lesssim|gtrsim|not|det|implies|iff|to|in|notin|parallel|forall|exists|emptyset|le|ge|ne|lfloor|rfloor|lceil|rceil|odot|star|circ|deg|gcd|zeta|chi)([A-Z][A-Za-z0-9_]+)/g,
      "\\$1 $2"
    ).replace(/\\([A-Za-z]+)([A-Z][A-Za-z0-9_]+)/g, (_, name, tail) => `\\${name} ${tail}`).replace(/\\pk\b/g, "\\mathrm{pk}").replace(
      /\(\s*([-+]?\d+(?:\.\d+)?)\s*\\\s*([-+]?\d+(?:\.\d+)?)\s*\)/g,
      (_, top, bottom) => `\\begin{pmatrix}${top}\\\\${bottom}\\end{pmatrix}`
    ).replace(/[""„]/g, '"').replace(/['']/g, "'").replace(/\*\*/g, "");
    value = value.replace(
      /(\\begin\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\}[\s\S]*?)(\\)([0-9])/g,
      "$1\\\\$3"
    );
    value = value.replace(/(?<!\\)\\([0-9])/g, "$1");
    value = value.replace(/\\([A-Za-z])(?=(_|\d|\{|\^))/g, (_, char) => char);
    value = value.replace(/\\([A-Za-z])(?=\s*&)/g, "$1");
    value = value.replace(
      /\\([A-Za-z])(?=\\|\s|[&+={])/g,
      (match, char) => knownCommands.has(char) ? match : char
    );
    value = value.replace(/\\(?=[/-])/g, "");
    value = value.replace(
      /\\([A-Za-z]+)(?=[A-Za-z0-9])/g,
      (match, name) => knownCommands.has(name) ? `\\${name} ` : match
    );
    value = value.replace(
      /\\([A-Za-z]+)(?=[A-Z])/g,
      (match, name) => knownCommands.has(name) ? `\\${name} ` : match
    );
    value = value.replace(
      /\\([A-Za-z]+)\s*([A-Z][A-Za-z0-9_]*)/g,
      (match, name, tail) => knownCommands.has(name) ? `\\${name} ${tail}` : match
    );
    value = value.replace(/#\s*\{([^{}]*)\}/g, "\\{$1\\}");
    value = value.replace(/([^\\])#([^=])/g, "$1\\#$2");
    value = value.replace(/\\right\b(?!\s*(?:[)\]}|]|\\(?:\}|rangle|rfloor|rceil)))/g, "");
    value = value.replace(/\\left\\\{([\s\S]*?)(?<!\\)\}/g, "\\left\\{$1\\right\\}");
    value = value.replace(/\\left\\lfloor([\s\S]*?)\\rfloor/g, "\\left\\lfloor$1\\right\\rfloor");
    value = value.replace(/\\left\\lceil([\s\S]*?)\\rceil/g, "\\left\\lceil$1\\right\\rceil");
    value = value.replace(/(?<!\\)([A-Za-z])\s+([A-Za-z])/g, "$1$2");
    value = value.replace(/(?<!\\)\\([A-Za-z])(?![A-Za-z])/g, "$1");
    value = value.replace(/\\-/g, "-");
    value = value.replace(/\\\\+/g, "\\\\");
    value = value.replace(
      /(\\begin\{(?:p|b|B|v|V)matrix\})(\d+)-(\d+)(\\end\{(?:p|b|B|v|V)matrix\})/g,
      "$1$2\\\\-$3$4"
    );
    value = value.replace(
      /(\\begin\{(?:p|b|B|v|V)matrix\})([A-Za-z])_(\d+)([A-Za-z])_(\d+)(\\end\{(?:p|b|B|v|V)matrix\})/g,
      "$1$2_$3\\\\$4_$5$6"
    );
    value = value.replace(/([^\\])\\{2}end\{((?:p|b|B|v|V)matrix)\}/g, "$1\\\\\\end{$2}");
    const commandNames = [...knownCommands].sort((left, right) => right.length - left.length);
    value = value.replace(/\\([A-Za-z]+)/g, (match, token) => {
      const command = commandNames.find((name) => token.startsWith(name));
      return command ? `\\${command}${token.slice(command.length) ? ` ${token.slice(command.length)}` : ""}` : match;
    });
    let cleaned = value.replace(/\s{2,}/g, " ").replace(/\s*([{}()=+\-*/^_|,;:<>])\s*/g, "$1").replace(/\s*\\\s*\*/g, "\\times");
    const squareBalance = (cleaned.match(/\[/g) || []).length - (cleaned.match(/\]/g) || []).length;
    if (squareBalance > 0) cleaned += "]".repeat(squareBalance);
    const braceBalance = (cleaned.match(/{/g) || []).length - (cleaned.match(/}/g) || []).length;
    if (braceBalance > 0) cleaned += "}".repeat(braceBalance);
    cleaned = cleaned.replace(
      /@@TEXT_BLOCK_(\d+)@@/g,
      (_, index) => protectedText[Number(index)] || ""
    );
    return { cleaned, protectedBlocks: protectedText };
  }

  // src/core/latex/heuristicFix.js
  function heuristicFix(tex) {
    let value = String(tex || "");
    const _original = value;
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
      "angle-brackets"
    );
    apply(/\\middle\s*\|/g, "\\middle|", "middle");
    apply(/\\left\|([^|\\]+)$/g, "\\left|$1\\right|", "absolute-value");
    apply(/\\left\{([^{}\\]+)$/g, "\\left\\{$1\\right\\}", "braces");
    apply(/\\left\[(^[\]\\]+)$/g, "\\left[$1\\right]", "brackets");
    apply(/\\left\(([^()]*)$/g, "\\left($1\\right)", "parentheses");
    const delimiterPairs = {
      "[": "]",
      "(": ")",
      "\\{": "\\}",
      "|": "|",
      "\\langle": "\\rangle",
      "\\lfloor": "\\rfloor",
      "\\lceil": "\\rceil"
    };
    const delimiterStack = [];
    for (const match of value.matchAll(
      /\\(left|right)\s*(\[|\]|\(|\)|\||\\(?:\{|\}|langle|rangle|lfloor|rfloor|lceil|rceil))/g
    )) {
      const side = match[1];
      const token = match[2];
      if (side === "left") delimiterStack.push(delimiterPairs[token]);
      else if (delimiterStack[delimiterStack.length - 1] === token) delimiterStack.pop();
      else fixes.push("delimiter-conflict");
    }
    if (delimiterStack.length) {
      value += delimiterStack.reverse().map((close) => `\\right${close}`).join("");
      fixes.push("delimiter-pair");
    }
    const matrixStart = /\\begin\{(pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\}/g;
    value = value.replace(matrixStart, (match, env, offset, source) => {
      const close = `\\end{${env}}`;
      if (source.indexOf(close, offset + match.length) >= 0) return match;
      fixes.push("matrix-end");
      return `${match}${source.slice(offset + match.length)}${close}`;
    });
    value = value.replace(
      /(\\begin\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\})([\s\S]*?)(\\end\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\})/g,
      (match, start, body, end) => {
        const repaired = body.replace(/([A-Za-z])_(\d+)(?=[A-Za-z]_(?:\d+|\{))/g, "$1_$2\\\\");
        if (repaired !== body) fixes.push("matrix-row-separator");
        return `${start}${repaired}${end}`;
      }
    );
    return { repaired: value, fixes: [...new Set(fixes)] };
  }

  // src/core/latex/classifyFixes.js
  function classifyFixes(original, cleaned) {
    const fixes = [];
    if (/\r/.test(original) && !/\r/.test(cleaned)) fixes.push("trim");
    if (/\\text\{/.test(original) && /\\text\{/.test(cleaned)) fixes.push("text-protection");
    if (/\\(mathbb|mathbf|mathrm|mathcal|mathsf)[A-Za-z]/.test(original) && !/\\(mathbb|mathbf|mathrm|mathcal|mathsf)[A-Za-z]/.test(cleaned))
      fixes.push("command-separation");
    if (/\\(?:,|;|!|:)/.test(original) && !/\\(?:,|;|!|:)/.test(cleaned))
      fixes.push("spacing-command");
    if (/\\begin\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\}/.test(original) && (original.match(/\\\\/g) || []).length !== (cleaned.match(/\\\\/g) || []).length)
      fixes.push("matrix-row-separator");
    if (/\\(?:0|1|2|3|4|5|6|7|8|9)/.test(original) && /\\begin\{/.test(original))
      fixes.push("matrix-row-separator");
    if (/\\[A-Za-z]_(?:\d+|\{)/.test(original) && !/\\[A-Za-z]_(?:\d+|\{)/.test(cleaned))
      fixes.push("vector");
    if (/\\[A-Za-z]/.test(original) && original.replace(/\\[A-Za-z]+/g, "") !== cleaned.replace(/\\[A-Za-z]+/g, "") && !/\r/.test(original))
      fixes.push("backslash-artifact");
    if (/[A-Za-z]\s+[A-Za-z]/.test(original) && !/[A-Za-z]\s+[A-Za-z]/.test(cleaned))
      fixes.push("identifier-space");
    return [...new Set(fixes)];
  }

  // src/core/latex/blockDetector.js
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
  function squareBlocks(text) {
    const source = String(text || "");
    const blocks = [];
    const maxBlockLength = 5e3;
    for (let start = 0; start < source.length; start++) {
      if (source[start] !== "[" || source[start - 1] === "\\" || source.slice(Math.max(0, start - 5), start) === "\\left")
        continue;
      let depth = 1;
      for (let index = start + 1; index < source.length; index++) {
        if (index - start > maxBlockLength) break;
        const lineStart = index === 0 || source[index - 1] === "\n";
        if (lineStart && /(?:^#{1,6}\s|^={4,}|^[-_]{4,})/.test(source.slice(index).split("\n", 1)[0]))
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
  function blockFormula(text) {
    const value = String(text || "");
    const display = value.match(/^\s*\\\[\s*([\s\S]*?)\s*\\\]\s*$/);
    if (display) return display;
    const leftRight = value.match(/^\s*\\left\[([\s\S]*?)\\right\]\s*$/);
    if (leftRight) return [value, value.trim()];
    const inner = balancedSquareBlock(value);
    return inner === null ? null : [value, inner];
  }
  function blockStart(text) {
    const match = String(text || "").match(/^\s*(\\)?\[\s*$/);
    return match ? Boolean(match[1]) : null;
  }
  function environmentStart(text) {
    const match = String(text || "").match(
      /^\s*\\begin\{(pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array|cases)\}\s*$/
    );
    return match ? match[1] : null;
  }
  function environmentEnd(text, environment) {
    return new RegExp(`^\\s*\\\\end\\{${environment}\\}\\s*[.,;]?\\s*$`).test(String(text || ""));
  }
  function isStandaloneTex(text) {
    const trimmed = String(text || "").trim();
    if (/^\s*\[[\s\S]*\]\s*$/.test(trimmed) || /^\\\[[\s\S]*\\\]$/.test(trimmed) || /^\\\([\s\S]*\\\)$/.test(trimmed))
      return false;
    if (/^\\end\{/.test(trimmed)) return false;
    return /\\[A-Za-z]/.test(trimmed) && /^[A-Za-z0-9_{}[\]^=+.,;|()&<>\\\-\s]+$/.test(trimmed) && (/^[-+\\]/.test(trimmed) || /[=_^+]/.test(trimmed) || /\\begin\{|\\mathbf\b/.test(trimmed));
  }

  // src/core/latex/collector.js
  function collectFormulas(text, options = {}) {
    const { collectInline = false, collectParentheses = false, fromDocx = false } = options;
    const found = [];
    const seen = /* @__PURE__ */ new Set();
    const claimedRanges = [];
    const claim = (range) => {
      if (range) claimedRanges.push(range);
    };
    const overlapsClaimed = (start, end) => claimedRanges.some(([s, e]) => start < e && end > s);
    const add = (raw, kind, range = null) => {
      const candidate = String(raw || "");
      if (candidate.length > 5e3 || /(?:^|\n)\s*(?:#{1,6}\s|={4,}|[-_]{4,})/.test(candidate)) {
        return;
      }
      if (candidate && !seen.has(candidate)) {
        seen.add(candidate);
        found.push({
          raw: candidate.trim(),
          kind
        });
      }
      claim(range);
    };
    for (const match of text.matchAll(/\\\[\s*([\s\S]{1,5000}?)\s*\\\]/g))
      add(match[1], "blok \\[ \u2026 \\]", [match.index, match.index + match[0].length]);
    for (const block of squareBlocks(text)) add(block.inner, "blok [ \u2026 ]", [block.start, block.end]);
    for (const match of text.matchAll(/\\left\[([\s\S]{1,5000}?)\\right\]/g)) {
      const range = [match.index, match.index + match[0].length];
      if (overlapsClaimed(range[0], range[1])) continue;
      add(match[0], "blok \\left[ \u2026 \\right]", range);
    }
    for (const match of text.matchAll(/[^\n]+/g)) {
      const line = match[0];
      if (!isStandaloneTex(line)) continue;
      const range = [match.index, match.index + line.length];
      if (overlapsClaimed(range[0], range[1])) continue;
      add(line, "samostatn\xFD LaTeX", range);
    }
    if (collectInline) {
      for (const match of text.matchAll(/\\\(([\s\S]{1,3000}?)\\\)|\$([^$\n]{1,3000})\$/g)) {
        const range = [match.index, match.index + match[0].length];
        if (overlapsClaimed(range[0], range[1])) continue;
        add(match[1] || match[2], "inline", range);
      }
    }
    if (collectParentheses) {
      for (const match of text.matchAll(/\(([^()\n]{0,1500}\\[A-Za-z]+[^()\n]{0,1500})\)/g)) {
        const range = [match.index, match.index + match[0].length];
        if (text[match.index - 1] === "\\" || text.slice(Math.max(0, match.index - 5), match.index) === "\\left")
          continue;
        if (overlapsClaimed(range[0], range[1])) continue;
        add(match[1], "kulat\xE9 z\xE1vorky", range);
      }
    }
    if (fromDocx) {
      for (const match of text.matchAll(/\(([^()\n]*\\[A-Za-z]+[^()\n]*)\)/g)) {
        const range = [match.index, match.index + match[0].length];
        if (text[match.index - 1] === "\\" || text.slice(Math.max(0, match.index - 5), match.index) === "\\left")
          continue;
        if (overlapsClaimed(range[0], range[1])) continue;
        add(match[1], "inline z DOCX", range);
      }
      for (const match of text.matchAll(/\(([A-Za-z](?:\s*[=<>]\s*[^()\n]+)?)\)/g)) {
        const range = [match.index, match.index + match[0].length];
        if (text[match.index - 1] === "\\" || text.slice(Math.max(0, match.index - 5), match.index) === "\\left")
          continue;
        if (overlapsClaimed(range[0], range[1])) continue;
        add(match[1], "inline z DOCX", range);
      }
    }
    return found;
  }

  // src/core/latex/validator.js
  function validateLatexStructure(tex) {
    const value = String(tex || "");
    if (value.length > 1e5) return { ok: false, reason: "Z\xE1pis je p\u0159\xEDli\u0161 dlouh\xFD." };
    const stack = [];
    const pairs = {
      "(": ")",
      "[": "]",
      "{": "}",
      "|": "|",
      "\\{": "\\}",
      "\\langle": "\\rangle",
      "\\lfloor": "\\rfloor",
      "\\lceil": "\\rceil"
    };
    const delimiter = (text) => text.match(/^\s*(\[|\]|\(|\)|\{|\}|\||\\(?:\{|\}|\||langle|rangle|lfloor|rfloor|lceil|rceil))/);
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
              if (name === "right") return { ok: false, reason: "P\u0159\xEDkaz \\right nem\xE1 delimit\xE9r." };
              continue;
            }
            const token = found[1].replace(/\s/g, "");
            index += found[0].length;
            if (name === "left") stack.push({ token, close: pairs[token] });
            else if (!stack.length) return { ok: false, reason: "Osamocen\xFD p\u0159\xEDkaz \\right." };
            else if (stack.pop().close !== token)
              return {
                ok: false,
                reason: "Nespr\xE1vn\u011B sp\xE1rovan\xE9 \\left/\\right delimitery."
              };
          }
          continue;
        }
      }
      if ("{[(".includes(value[index]))
        stack.push({
          token: value[index],
          close: { "{": "}", "[": "]", "(": ")" }[value[index]]
        });
      if ("}])".includes(value[index])) {
        const _expected = { "}": "{", "]": "[", ")": "(" }[value[index]];
        if (!stack.length || stack.pop().close !== value[index])
          return { ok: false, reason: "Nespr\xE1vn\u011B sp\xE1rovan\xE9 z\xE1vorky." };
      }
    }
    if (stack.length) return { ok: false, reason: "Neuzav\u0159en\xE1 z\xE1vorka nebo delimit\xE9r." };
    const environments = [...value.matchAll(/\\begin\{([^}]+)\}/g)].map((match) => match[1]);
    for (const env of environments)
      if (!new RegExp(`\\\\end\\{${env}\\}`).test(value))
        return { ok: false, reason: `Neuzav\u0159en\xE9 prost\u0159ed\xED \\begin{${env}}.` };
    const unknown = [...value.matchAll(/(?<!\\)\\([A-Za-z]+)/g)].map((match) => match[1]).filter((name) => !knownCommands.has(name));
    if (unknown.length)
      return {
        ok: false,
        reason: `Nezn\xE1m\xFD p\u0159\xEDkaz: ${[...new Set(unknown)].map((name) => "\\" + name).join(", ")}.`
      };
    return { ok: true };
  }
  function validateFormula(tex) {
    const structure = validateLatexStructure(tex);
    if (!structure.ok) return structure;
    try {
      if (typeof window !== "undefined" && typeof katex !== "undefined") {
        katex.renderToString(tex, { throwOnError: true, strict: "ignore" });
        return { ok: true, mode: "direct" };
      }
      return { ok: true, mode: "direct" };
    } catch (error) {
      return { ok: false, reason: "KaTeX: " + error.message };
    }
  }
  function validateFormulaWithFallback(tex, fallbackTex3) {
    const direct = validateFormula(tex);
    if (direct.ok) return direct;
    const fb = fallbackTex3(tex);
    if (fb !== tex) {
      const result = validateFormula(fb);
      if (result.ok)
        return {
          ok: true,
          mode: "fallback",
          fallbackTex: fb,
          reason: direct.reason
        };
    }
    return { ok: false, mode: "failed", reason: direct.reason };
  }

  // src/core/latex/formulaProblems.js
  function formulaProblems(formulas, options = {}) {
    const { warnVectorEquals = true } = options;
    const problems = [];
    for (const item of formulas) {
      const structure = validateLatexStructure(item.tex);
      if (!structure.ok) {
        problems.push({
          tex: item.raw || item.tex,
          normalizedTex: item.tex,
          reason: structure.reason,
          severity: "error"
        });
        continue;
      }
      try {
        if (typeof katex !== "undefined")
          katex.renderToString(item.tex, { throwOnError: true, strict: "ignore" });
      } catch (error) {
        const fallback = fallbackTex(item.tex);
        try {
          if (typeof katex !== "undefined")
            katex.renderToString(fallback, { throwOnError: true, strict: "ignore" });
        } catch {
          problems.push({
            tex: item.raw || item.tex,
            normalizedTex: item.tex,
            reason: "KaTeX: " + error.message,
            severity: "error"
          });
          continue;
        }
      }
      const unknown = [...item.tex.matchAll(/(?<!\\)\\([A-Za-z]+)/g)].map((match) => match[1]).filter((name) => !knownCommands.has(name));
      if (unknown.length) {
        problems.push({
          tex: item.raw || item.tex,
          normalizedTex: item.tex,
          reason: "P\u0159evod do Wordu zat\xEDm nezn\xE1 p\u0159\xEDkaz: " + [...new Set(unknown)].map((name) => "\\" + name).join(", "),
          severity: "error"
        });
      } else if (warnVectorEquals && /\\begin\{(?:p|b|B|v|V)matrix\}/.test(item.tex) && /\\mathbf\b/.test(item.tex) && !item.tex.includes("=")) {
        problems.push({
          tex: item.raw || item.tex,
          normalizedTex: item.tex,
          reason: "Z\xE1pis je technicky platn\xFD, ale p\u0159ed v\xFDsledn\xFDm vektorem pravd\u011Bpodobn\u011B chyb\xED znak =.",
          severity: "warning"
        });
      }
    }
    return problems;
  }
  function invalidFormulaSet(formulas, options = {}) {
    return new Set(
      formulaProblems(formulas, options).filter((problem) => problem.severity === "error").map((problem) => problem.normalizedTex)
    );
  }

  // src/core/utils/escapeXml.js
  function escapeXml(value) {
    return String(value).replace(
      /[<>&"']/g,
      (c) => ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;"
      })[c]
    );
  }
  function local(node) {
    return node && (node.localName || node.nodeName.split(":").pop());
  }

  // src/core/omml/xmlBuilder.js
  function mathRun(text, variant = "") {
    if (!text) return "";
    const val = variant === "roman" || variant === "text" ? '<m:rPr><m:sty m:val="p"/></m:rPr>' : variant === "bold" ? '<m:rPr><m:sty m:val="b"/></m:rPr>' : variant === "double" ? '<m:rPr><m:scr m:val="double-struck"/></m:rPr>' : variant === "script" ? '<m:rPr><m:scr m:val="script"/></m:rPr>' : "";
    return `<m:r>${val}<m:t xml:space="preserve">${escapeXml(text)}</m:t></m:r>`;
  }
  function wordRun(text, style = {}) {
    const _W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    const attrs = /^\s|\s$/.test(text) ? ' xml:space="preserve"' : "";
    const rPr = style.bold || style.italic || style.underline ? `<w:rPr>${style.bold ? "<w:b/>" : ""}${style.italic ? "<w:i/>" : ""}${style.underline ? '<w:u w:val="single"/>' : ""}</w:rPr>` : "";
    return String(text).split(/\n/).map((line, index) => `${index ? "<w:br/>" : ""}<w:t${attrs}>${escapeXml(line)}</w:t>`).join("").replace(/^/, `<w:r>${rPr}`).replace(/$/, "</w:r>");
  }

  // src/core/omml/texToOmml.js
  function texToOmml(input) {
    const { cleaned } = cleanTex(input);
    const { repaired } = heuristicFix(cleaned);
    const s = repaired;
    let i = 0;
    const maxSteps = Math.max(1e3, s.length * 50);
    let steps = 0;
    const skip = () => {
      while (/\s/.test(s[i] || "")) i++;
    };
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
      let sub = "", sup = "";
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
        const n = group(variant), d = group(variant);
        return `<m:f><m:num>${n}</m:num><m:den>${d}</m:den></m:f>`;
      }
      if (name === "binom") {
        const n = group(variant), k = group(variant);
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
        return `<m:acc><m:accPr><m:chr m:val="\u2192"/></m:accPr><m:e>${value}</m:e></m:acc>`;
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
          Vmatrix: ["\u2225", "\u2225"],
          array: ["[", "]"],
          cases: ["{", ""]
        }[env];
        if (!brackets) return mathRun("\\begin{" + env + "}", "roman");
        const rawRows = body.split(/\\\\/);
        const columnCount = Math.max(1, ...rawRows.map((row) => row.split("&").length));
        const columns = Array.from(
          { length: columnCount },
          () => '<m:mc><m:mcPr><m:count m:val="1"/></m:mcPr></m:mc>'
        ).join("");
        const rows = rawRows.map(
          (row) => `<m:mr>${row.split("&").map((cell) => `<m:e>${texToOmml(cell)}</m:e>`).join("")}</m:mr>`
        ).join("");
        return `<m:d><m:dPr><m:begChr m:val="${brackets[0]}"/><m:endChr m:val="${brackets[1]}"/></m:dPr><m:e><m:m><m:mPr><m:baseJc m:val="center"/><m:plcHide m:val="1"/><m:mcs>${columns}</m:mcs></m:mPr>${rows}</m:m></m:e></m:d>`;
      }
      if (["mathbf", "boldsymbol", "bm", "textbf"].includes(name)) return group("bold");
      if (["mathrm", "textrm", "operatorname", "texttt"].includes(name)) return group("roman");
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
        return base || label || mathRun("\u2192", variant);
      }
      if (["longrightarrow", "longleftarrow", "longleftrightarrow"].includes(name))
        return mathRun(
          { longrightarrow: "\u27F6", longleftarrow: "\u27F5", longleftrightarrow: "\u27F7" }[name],
          variant
        );
      if (["lfloor", "lceil"].includes(name))
        return mathRun({ lfloor: "\u230A", lceil: "\u2308" }[name], variant);
      if (["rfloor", "rceil"].includes(name))
        return mathRun({ rfloor: "\u230B", rceil: "\u2309" }[name], variant);
      if (name === "substack") return group(variant);
      if (["star", "ast"].includes(name)) return mathRun("\u22C6", variant);
      if (name === "circ") return mathRun("\u2218", variant);
      if (name === "pk") return mathRun("pk", "roman");
      if (name === "{" || name === "}") return mathRun(name, variant);
      if (name === "left" || name === "right" || name === "middle" || name === "big" || name === "Big" || name === "bigl" || name === "bigr")
        return "";
      if (name === "not") return mathRun("\xAC", variant) + item(variant);
      if (name === "pmod") return mathRun("mod ", "roman") + group("roman");
      if (name === "mod" || name === "bmod") return mathRun(" mod ", "roman");
      if (name === "quad") return mathRun("    ", variant);
      if (name === "qquad") return mathRun("        ", variant);
      if (["le", "ge", "ne"].includes(name))
        return mathRun({ le: "\u2264", ge: "\u2265", ne: "\u2260" }[name], variant);
      if (["sup", "cap", "cup"].includes(name))
        return mathRun({ sup: "sup", cap: "\u2229", cup: "\u222A" }[name], name === "sup" ? "roman" : variant);
      if (["perp", "bullet", "mapsto", "Longrightarrow", "longmapsto", "diagdown", "diagup"].includes(
        name
      ))
        return mathRun(
          {
            perp: "\u22A5",
            bullet: "\u2022",
            mapsto: "\u21A6",
            Longrightarrow: "\u27F9",
            longmapsto: "\u27FC",
            diagdown: "\u2572",
            diagup: "\u2571"
          }[name],
          variant
        );
      if (name === "cdots" || name === "dots" || name === "ldots") return mathRun("\u2026", variant);
      if (name === "vdots") return mathRun("\u22EE", variant);
      if (name === "ddots") return mathRun("\u22EF", variant);
      if (name === "ell") return mathRun("\u2113", variant);
      if (["det", "Pr", "vol", "ker", "dim", "deg", "gcd", "ord"].includes(name))
        return mathRun(name, "roman");
      if (symbols[name]) return mathRun(symbols[name], variant);
      if (operators[name])
        return mathRun(
          operators[name],
          name === "lim" || /^(log|ln|sin|cos|tan|max|min|arg|det|Pr|vol|ker|dim|deg|gcd|ord)$/.test(name) ? "roman" : variant
        );
      if (name === " " || name === "," || name === ";" || name === ":" || name === "!")
        return mathRun(" ", variant);
      return mathRun("\\" + name, "roman");
    };
    const item = (variant = "") => {
      if (++steps > maxSteps) {
        i = s.length;
        return mathRun("[neplatny nebo p\u0159\xEDli\u0161 slo\u017Eit\xFD z\xE1pis]", "roman");
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

  // src/core/stats/statsCollector.js
  function createStats() {
    return {
      version: "2026.08.25.34",
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
      okFormulas: []
    };
  }
  function collectStats(stats, originalTex, cleanedTex, fixesLog) {
    if (!stats) return;
    const source = String(originalTex || "");
    const cleaned = String(cleanedTex || "");
    stats.fixes += fixesLog.length;
    for (const fix of fixesLog) {
      stats.fixesByType[fix] = (stats.fixesByType[fix] || 0) + 1;
    }
    stats.addedBrackets += Math.max(
      0,
      (cleaned.match(/[{}[\]]/g) || []).length - (source.match(/[{}[\]]/g) || []).length
    );
  }
  function finalizeStats(stats, debugLog2 = []) {
    if (!stats) return;
    const entries = debugLog2;
    const fixes = entries.flatMap(
      (entry) => entry.event === "auto-fix" || entry.event === "heuristic-fix" ? entry.fixes || [] : []
    );
    const countFix = (type) => fixes.filter((fix) => fix === type).length;
    stats.fallbackRenders = entries.filter((entry) => entry.event === "katex-fallback").length;
    stats.heuristicFixes = entries.filter((entry) => entry.event === "heuristic-fix").length;
    stats.matrixFixes = countFix("matrix") + countFix("matrix-row-separator");
    stats.delimiterFixes = countFix("delimiters") + countFix("delimiter-conflict") + countFix("delimiter-pair");
    stats.absoluteValueFixes = countFix("absolute-value");
    stats.nestedFixes = entries.filter(
      (entry) => entry.event === "heuristic-fix" && (entry.original || "").match(/\\left[\s\S]*\\left/)
    ).length;
    stats.unclosedLeftRightFixes = countFix("delimiter-pair");
    stats.unterminatedEnvironmentFixes = countFix("matrix-end");
    stats.unterminatedBeginFixes = entries.filter(
      (entry) => entry.event === "parser-overflow"
    ).length;
    stats.vectorFixes = countFix("vector");
    stats.wordArtifactFixes = entries.filter(
      (entry) => entry.event === "auto-fix" || entry.event === "heuristic-fix"
    ).length;
  }

  // src/core/utils/debug.js
  var APP_VERSION = "2026.08.25.34";
  var debugLog = [];
  function initDebug() {
    debugLog = [];
  }
  function debug(event, data = {}) {
    debugLog.push({
      time: (/* @__PURE__ */ new Date()).toISOString(),
      version: APP_VERSION,
      event,
      ...data
    });
  }
  function getDebugLog() {
    return [...debugLog];
  }
  function getAppVersion() {
    return APP_VERSION;
  }

  // src/core/utils/xmlNamespaces.js
  var W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  var M = "http://schemas.openxmlformats.org/officeDocument/2006/math";
  function hasXmlError(doc) {
    const local2 = (node) => node && (node.localName || node.nodeName.split(":").pop());
    return !doc.documentElement || local2(doc.documentElement) === "parsererror" || doc.getElementsByTagName("parsererror").length > 0;
  }
  function paragraphText(paragraph) {
    let text = "";
    for (const item of paragraph.getElementsByTagNameNS(W, "t")) text += item.textContent;
    return text;
  }
  function xmlParagraphText(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");
    return [...doc.getElementsByTagNameNS(W, "p")].map(paragraphText).join("\n");
  }
  function documentMathCount(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");
    return hasXmlError(doc) ? 0 : doc.getElementsByTagNameNS(M, "oMath").length;
  }

  // src/ui/renderer/previewRenderer.js
  function fallbackTex2(tex) {
    return String(tex || "").replace(/\\left\s*/g, "").replace(/\\right\s*/g, "");
  }
  function renderPreview(formulas, container, debugFn = () => {
  }) {
    if (!container) return;
    container.innerHTML = "";
    if (!formulas || formulas.length === 0) {
      container.classList.add("empty");
      container.textContent = "Nebyly nalezeny \u017E\xE1dn\xE9 rovnice.";
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
              strict: "ignore"
            });
          } else {
            formulaDiv.textContent = item.tex || item.raw || "";
          }
        } catch (error) {
          const fallback = fallbackTex2(item.tex || item.raw || "");
          debugFn("katex-fallback", {
            original: item.tex || item.raw,
            fallback,
            error: error.message
          });
          try {
            if (typeof katex !== "undefined") {
              katex.render(fallback, formulaDiv, {
                displayMode: true,
                throwOnError: true,
                strict: "ignore"
              });
            } else {
              formulaDiv.textContent = fallback;
            }
          } catch {
            card.classList.add("error");
            formulaDiv.textContent = "KaTeX tento z\xE1pis nevyhodnotil: " + error.message;
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
  function renderUnprocessed(problems, container) {
    if (!container) return;
    container.innerHTML = "";
    if (!problems || problems.length === 0) {
      container.textContent = "V\u0161echny formule byly \xFAsp\u011B\u0161n\u011B zpracov\xE1ny.";
      return;
    }
    const fragment = document.createDocumentFragment();
    problems.forEach((problem, index) => {
      const item = document.createElement("div");
      item.className = `problem problem-${problem.severity || "error"}`;
      const title = document.createElement("strong");
      title.textContent = `${index + 1}. ${problem.reason || "Nezn\xE1m\xE1 chyba"}`;
      const code = document.createElement("pre");
      code.textContent = problem.tex || problem.normalizedTex || "";
      item.append(title, code);
      fragment.append(item);
    });
    container.append(fragment);
  }

  // src/ui/renderer/statsRenderer.js
  function renderStats(stats, container) {
    if (!container || !stats) {
      if (container) container.textContent = "Statistiky nejsou dostupn\xE9.";
      return;
    }
    const html = `
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">Zpracovan\xFDch formul\xED:</span>
        <span class="stat-value">${stats.formulasAfter || 0}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Heuristick\xFDch oprav:</span>
        <span class="stat-value">${stats.heuristicFixes || 0}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Celkem oprav:</span>
        <span class="stat-value">${stats.fixes || 0}</span>
      </div>
      ${stats.fallbackRenders ? `<div class="stat-item">
        <span class="stat-label">Fallback render\u016F:</span>
        <span class="stat-value">${stats.fallbackRenders}</span>
      </div>` : ""}
      ${stats.matrixFixes ? `<div class="stat-item">
        <span class="stat-label">Oprav matic:</span>
        <span class="stat-value">${stats.matrixFixes}</span>
      </div>` : ""}
      ${stats.delimiterFixes ? `<div class="stat-item">
        <span class="stat-label">Oprav delimit\xE9r\u016F:</span>
        <span class="stat-value">${stats.delimiterFixes}</span>
      </div>` : ""}
      ${stats.vectorFixes ? `<div class="stat-item">
        <span class="stat-label">Oprav vektor\u016F:</span>
        <span class="stat-value">${stats.vectorFixes}</span>
      </div>` : ""}
      ${stats.absoluteValueFixes ? `<div class="stat-item">
        <span class="stat-label">Oprav absolutn\xEDch hodnot:</span>
        <span class="stat-value">${stats.absoluteValueFixes}</span>
      </div>` : ""}
      ${stats.addedBrackets ? `<div class="stat-item">
        <span class="stat-label">P\u0159idan\xFDch z\xE1vorek:</span>
        <span class="stat-value">${stats.addedBrackets}</span>
      </div>` : ""}
      ${stats.durationMs ? `<div class="stat-item">
        <span class="stat-label">Doba zpracov\xE1n\xED:</span>
        <span class="stat-value">${stats.durationMs}ms</span>
      </div>` : ""}
    </div>
  `;
    container.innerHTML = html;
  }

  // src/ui/editor/editorInput.js
  function getEditorBlocks(editorElement) {
    const blocks = [];
    if (!editorElement) return blocks;
    for (const child of editorElement.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.nodeValue.trim()) {
        for (const text of child.nodeValue.split(/\n+/))
          if (text.trim()) blocks.push({ tag: "p", node: child, text });
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() !== "table") {
        blocks.push({
          tag: child.tagName.toLowerCase(),
          node: child,
          text: child.innerText
        });
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === "table") {
        blocks.push({ tag: "table", node: child, text: "" });
      }
    }
    return blocks;
  }

  // src/ui/export/docxExporter.js
  function fullCleanTex(tex) {
    return heuristicFix(cleanTex(tex).cleaned).repaired;
  }
  function runXml(text, style = {}) {
    return wordRun(text, style);
  }
  function splitInline(text, style, invalidTexes = /* @__PURE__ */ new Set(), convertInline = true) {
    if (!convertInline) return runXml(text, style);
    let out = "", cursor = 0;
    const rx = /\\\(([\s\S]*?)\\\)|\$([^$\n]+)\$/g;
    for (const match of text.matchAll(rx)) {
      const tex = fullCleanTex(match[1] || match[2]);
      if (invalidTexes.has(tex)) continue;
      out += runXml(text.slice(cursor, match.index), style);
      out += `<m:oMath>${texToOmml(tex)}</m:oMath>`;
      cursor = match.index + match[0].length;
    }
    return out + runXml(text.slice(cursor), style);
  }
  function htmlRuns(node, style = {}, invalidTexes = /* @__PURE__ */ new Set(), convertInline = true) {
    if (node.nodeType === Node.TEXT_NODE)
      return splitInline(node.nodeValue, style, invalidTexes, convertInline);
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName.toLowerCase();
    const next = {
      ...style,
      bold: style.bold || tag === "b" || tag === "strong",
      italic: style.italic || tag === "i" || tag === "em",
      underline: style.underline || tag === "u"
    };
    if (tag === "br") return "<w:r><w:br/></w:r>";
    return [...node.childNodes].map((child) => htmlRuns(child, next, invalidTexes, convertInline)).join("");
  }
  function equationPara(tex, pPr = "") {
    return `<w:p>${pPr || '<w:pPr><w:jc w:val="center"/></w:pPr>'}<m:oMathPara><m:oMath>${texToOmml(tex)}</m:oMath></m:oMathPara></w:p>`;
  }
  function editorPara(block, invalidTexes, convertInline) {
    const tag = block.tag;
    const text = block.text || "";
    const formula = blockFormula(text);
    if (formula)
      return invalidTexes.has(fullCleanTex(formula[1])) ? `<w:p>${runXml(formula[1])}</w:p>` : equationPara(formula[1]);
    if (isStandaloneTex(text))
      return invalidTexes.has(fullCleanTex(text)) ? `<w:p>${runXml(text)}</w:p>` : equationPara(text);
    const heading = /^h[1-3]$/.test(tag) ? `<w:pPr><w:pStyle w:val="Heading${tag[1]}"/></w:pPr>` : tag === "li" ? '<w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>' : "";
    const prefix = tag === "li" ? runXml("\u2022 ") : "";
    return `<w:p>${heading}${prefix}${block.node.nodeType === Node.TEXT_NODE ? splitInline(text, {}, invalidTexes, convertInline) : [...block.node.childNodes].map((n) => htmlRuns(n, {}, invalidTexes, convertInline)).join("") || runXml(text)}</w:p>`;
  }
  function tableXml(table) {
    const rows = [...table.rows].map(
      (row) => `<w:tr>${[...row.cells].map(
        (cell) => `<w:tc><w:tcPr><w:tcW w:w="2800" w:type="dxa"/></w:tcPr><w:p>${[...cell.childNodes].map((n) => htmlRuns(n)).join("") || runXml(cell.innerText)}</w:p></w:tc>`
      ).join("")}</w:tr>`
    ).join("");
    return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="B7C4D1"/><w:left w:val="single" w:sz="4" w:color="B7C4D1"/><w:bottom w:val="single" w:sz="4" w:color="B7C4D1"/><w:right w:val="single" w:sz="4" w:color="B7C4D1"/><w:insideH w:val="single" w:sz="4" w:color="D9E1E8"/><w:insideV w:val="single" w:sz="4" w:color="D9E1E8"/></w:tblBorders></w:tblPr>${rows}</w:tbl>`;
  }
  function createDocxFromEditor(editorElement, invalidTexes = /* @__PURE__ */ new Set(), convertInline = true) {
    const blocks = getEditorBlocks(editorElement);
    let body = "";
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.tag === "table") {
        body += tableXml(b.node);
        continue;
      }
      const environment = environmentStart(b.text);
      if (environment) {
        let tex = b.text, end = -1;
        for (let k = i + 1; k < blocks.length && k < i + 50; k++) {
          tex += "\n" + blocks[k].text;
          if (environmentEnd(blocks[k].text, environment)) {
            end = k;
            break;
          }
        }
        if (end >= 0) {
          body += invalidTexes.has(fullCleanTex(tex)) ? `<w:p>${runXml(tex)}</w:p>` : equationPara(tex);
          i = end;
          continue;
        }
      }
      const escaped = blockStart(b.text);
      if (escaped !== null) {
        const ending = escaped ? /^\s*\\\]\s*$/ : /^\s*\]\s*$/;
        let tex = "", end = -1;
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
      body += editorPara(b, invalidTexes, convertInline);
    }
    if (!body) body = "<w:p><w:r><w:t></w:t></w:r></w:p>";
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${W}" xmlns:m="${M}"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;
    const zip = new JSZip();
    zip.file(
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`
    );
    zip.file(
      "_rels/.rels",
      `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`
    );
    zip.file(
      "word/_rels/document.xml.rels",
      `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
    );
    zip.file("word/document.xml", documentXml);
    zip.file(
      "word/styles.xml",
      `<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="${W}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos" w:cs="Aptos"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style></w:styles>`
    );
    return zip;
  }
  function parseParagraphXml(xml) {
    const standalone = xml.replace("<w:p>", `<w:p xmlns:w="${W}" xmlns:m="${M}">`);
    const parsed = new DOMParser().parseFromString(standalone, "application/xml");
    if (hasXmlError(parsed)) throw new Error("Nelze vytvo\u0159it platn\xFD odstavec Office Math.");
    return parsed.documentElement;
  }
  function replaceWithEquation(p, tex) {
    const pPr = [...p.childNodes].find((n) => local(n) === "pPr");
    const preserved = pPr ? new XMLSerializer().serializeToString(pPr) : '<w:pPr><w:jc w:val="center"/></w:pPr>';
    p.parentNode.replaceChild(
      p.ownerDocument.importNode(parseParagraphXml(equationPara(tex, preserved)), true),
      p
    );
  }
  function replaceInlineInExistingMathParagraph(p) {
    const rx = /\(([^()\n]*\\[A-Za-z]+[^()\n]*)\)|\(([A-Za-z](?:\s*[=<>]\s*[^()\n]+)?)\)/g;
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
          p.ownerDocument.importNode(mathParagraph.getElementsByTagNameNS(M, "oMath")[0], true)
        );
        cursor = match.index + match[0].length;
      }
      appendRun(text.slice(cursor));
      owner.replaceChild(fragment, run);
      changed = true;
    }
    return changed;
  }
  function replaceInlineEquations(p, text, invalidTexes = /* @__PURE__ */ new Set()) {
    if (p.getElementsByTagNameNS(M, "oMath").length) return replaceInlineInExistingMathParagraph(p);
    const rx = /\(([^()\n]*\\[A-Za-z]+[^()\n]*)\)|\(([A-Za-z](?:\s*[=<>]\s*[^()\n]+)?)\)/g;
    if (!rx.test(text)) return false;
    rx.lastIndex = 0;
    const pPr = [...p.childNodes].find((n) => local(n) === "pPr");
    const preserved = pPr ? new XMLSerializer().serializeToString(pPr) : "";
    let cursor = 0;
    let body = "";
    for (const match of text.matchAll(rx)) {
      if (invalidTexes.has(fullCleanTex(match[1] || match[2]))) continue;
      body += runXml(text.slice(cursor, match.index));
      body += `<m:oMath>${texToOmml(match[1] || match[2])}</m:oMath>`;
      cursor = match.index + match[0].length;
    }
    body += runXml(text.slice(cursor));
    const xml = `<w:p xmlns:w="${W}" xmlns:m="${M}">${preserved}${body}</w:p>`;
    p.parentNode.replaceChild(p.ownerDocument.importNode(parseParagraphXml(xml), true), p);
    return true;
  }
  function transformDocumentXml(inputXml, invalidTexes = /* @__PURE__ */ new Set(), convertParen = false) {
    const doc = new DOMParser().parseFromString(inputXml, "application/xml");
    if (doc.querySelector("parsererror")) throw new Error("Dokument XML nelze p\u0159e\u010D\xEDst.");
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
          if (!invalidTexes.has(fullCleanTex(exact[1]))) replaceWithEquation(p, exact[1]);
          continue;
        }
        const environment = environmentStart(text);
        if (environment) {
          let combined = text, end = -1;
          for (let k = n + 1; k < children.length && k < n + 50; k++) {
            if (local(children[k]) !== "p") break;
            const next = paragraphText(children[k]);
            combined += "\n" + next;
            if (environmentEnd(next, environment)) {
              end = k;
              break;
            }
          }
          if (end >= 0 && !invalidTexes.has(fullCleanTex(combined))) {
            replaceWithEquation(p, combined);
            for (let k = n + 1; k <= end; k++) children[k].remove();
            n = end;
            continue;
          }
        }
        const escaped = blockStart(text);
        if (escaped !== null) {
          let combined = text, end = -1;
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
          if (!invalidTexes.has(fullCleanTex(text))) replaceWithEquation(p, text);
          continue;
        }
        if (convertParen && /^\s*\([^()]*\\[A-Za-z]+[^()]*\)\s*$/.test(text))
          replaceWithEquation(p, text.trim().slice(1, -1));
      }
    }
    visit(doc.documentElement);
    return new XMLSerializer().serializeToString(doc);
  }
  async function validateInputFormat(value, kind = "text") {
    if (value == null) throw new Error("Vstup je pr\xE1zdn\xFD.");
    if (kind === "docx") {
      if (typeof value === "string") {
        if (!/^\s*PK\x03\x04/.test(value) && !/^\s*PK\x05\x06/.test(value)) {
          throw new Error("Nahran\xFD soubor nen\xED validn\xED DOCX bal\xEDk.");
        }
        return;
      }
      if (value instanceof Blob) {
        const slice = value.slice ? value.slice(0, 4) : value;
        const buffer = await slice.arrayBuffer();
        const header = new Uint8Array(buffer);
        if (header.length < 4 || header[0] !== 80 || header[1] !== 75 || header[2] !== 3 || header[3] !== 4) {
          throw new Error("V\xFDstup nen\xED validn\xED DOCX bal\xEDk \u2013 chyb\xED ZIP hlavi\u010Dka PK.");
        }
        return;
      }
      if (value instanceof File) {
        if (!/\.docx$/i.test(value.name)) throw new Error("Nahran\xFD soubor nen\xED DOCX.");
        return;
      }
      throw new Error("V\xFDstup nen\xED validn\xED DOCX data.");
    }
    const text = String(value);
    const binary = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text);
    if (binary) throw new Error("Vstup obsahuje neplatn\xE9 bin\xE1rn\xED znaky.");
    const supported = [".docx", ".txt", ".tex", ".texi", ".md"];
    if (kind === "file" && !supported.some((ext) => text.toLowerCase().endsWith(ext))) {
      throw new Error("Nepodporovan\xFD form\xE1t souboru. Povolen\xE9 jsou DOCX, TXT a TeX/Markdown.");
    }
  }
  async function validateDocxPackage(blob, expectedMath = 0) {
    if (!(blob instanceof Blob) && typeof blob !== "object") {
      throw new Error("V\xFDstup nen\xED validn\xED bin\xE1rn\xED data DOCX.");
    }
    if (!blob.size || blob.size < 512) {
      throw new Error("V\xFDstup DOCX je p\u0159\xEDli\u0161 mal\xFD nebo po\u0161kozen\xFD.");
    }
    let reopened;
    try {
      reopened = await JSZip.loadAsync(blob, { checkCRC32: true });
    } catch (error) {
      throw new Error("V\xFDstup nen\xED platn\xFD ZIP/DOCX: " + error.message);
    }
    const required = [
      "[Content_Types].xml",
      "_rels/.rels",
      "word/document.xml",
      "word/styles.xml",
      "word/_rels/document.xml.rels"
    ];
    for (const name of required) if (!reopened.file(name)) throw new Error("Chyb\xED povinn\xE1 \u010D\xE1st DOCX: " + name);
    const readXml = async (name) => {
      const zipEntry = reopened.file(name);
      if (!zipEntry) throw new Error("Chyb\xED \u010D\xE1st: " + name);
      const text = await zipEntry.async("string");
      const xml = new DOMParser().parseFromString(text, "application/xml");
      if (hasXmlError(xml)) throw new Error("Neplatn\xE9 XML v \u010D\xE1sti: " + name);
      return xml;
    };
    const [contentTypes, rootRels, document2, styles, documentRels] = await Promise.all([
      readXml("[Content_Types].xml"),
      readXml("_rels/.rels"),
      readXml("word/document.xml"),
      readXml("word/styles.xml"),
      readXml("word/_rels/document.xml.rels")
    ]);
    if (local(document2.documentElement) !== "document" || document2.documentElement.namespaceURI !== W)
      throw new Error("word/document.xml nem\xE1 platn\xFD ko\u0159en dokumentu Word.");
    if (local(styles.documentElement) !== "styles" || styles.documentElement.namespaceURI !== W)
      throw new Error("word/styles.xml nem\xE1 platn\xFD ko\u0159en styl\u016F Wordu.");
    const ctNs = "http://schemas.openxmlformats.org/package/2006/content-types";
    const relNs = "http://schemas.openxmlformats.org/package/2006/relationships";
    const hasMainPart = [...contentTypes.getElementsByTagNameNS(ctNs, "Override")].some(
      (node) => node.getAttribute("PartName") === "/word/document.xml"
    );
    const hasStylesPart = [...contentTypes.getElementsByTagNameNS(ctNs, "Override")].some(
      (node) => node.getAttribute("PartName") === "/word/styles.xml"
    );
    const hasMainRelation = [...rootRels.getElementsByTagNameNS(relNs, "Relationship")].some(
      (node) => node.getAttribute("Type") === "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    );
    const hasStylesRelation = [...documentRels.getElementsByTagNameNS(relNs, "Relationship")].some(
      (node) => node.getAttribute("Type") === "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles"
    );
    if (!hasMainPart) throw new Error("Chyb\xED deklarace hlavn\xEDho dokumentu v [Content_Types].xml.");
    if (!hasStylesPart) throw new Error("Chyb\xED deklarace styl\u016F dokumentu v [Content_Types].xml.");
    if (!hasMainRelation) throw new Error("Chyb\xED vztah k hlavn\xEDmu dokumentu.");
    if (!hasStylesRelation) throw new Error("Chyb\xED vztah ke styl\u016Fm dokumentu.");
    const mathCount = document2.getElementsByTagNameNS(M, "oMath").length;
    if (expectedMath && mathCount < expectedMath)
      throw new Error(
        `Kontrola na\u0161la jen ${mathCount} objekt\u016F Office Math, o\u010Dek\xE1v\xE1no nejm\xE9n\u011B ${expectedMath}.`
      );
    return { mathCount, files: Object.keys(reopened.files).length };
  }
  function downloadDocx(blob, filename = "export.docx") {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1e3);
  }

  // src/ui/export/htmlExporter.js
  function fullCleanTex2(tex) {
    return heuristicFix(cleanTex(tex).cleaned).repaired;
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function renderHtmlFormula(tex, invalidTexes = /* @__PURE__ */ new Set()) {
    const value = fullCleanTex2(tex);
    if (invalidTexes.has(value)) return escapeHtml(tex);
    try {
      return katex.renderToString(value, {
        displayMode: true,
        output: "mathml",
        throwOnError: true,
        strict: "ignore"
      });
    } catch {
      const fallback = fallbackTex(value);
      try {
        return katex.renderToString(fallback, {
          displayMode: true,
          output: "mathml",
          throwOnError: true,
          strict: "ignore"
        });
      } catch (error) {
        return `<span class="formula-error">${escapeHtml(error.message)}</span>`;
      }
    }
  }
  function splitHtmlInline(text, style = {}, invalidTexes = /* @__PURE__ */ new Set(), convertInline = true) {
    if (!convertInline) return escapeHtml(text);
    const rx = /\\\(([^\n]*?)\\\)|\$([^$\n]+)\$/g;
    let out = "";
    let cursor = 0;
    for (const match of text.matchAll(rx)) {
      out += escapeHtml(text.slice(cursor, match.index));
      const tex = fullCleanTex2(match[1] || match[2]);
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
  function htmlTextRuns(node, style = {}, invalidTexes = /* @__PURE__ */ new Set(), convertInline = true) {
    if (node.nodeType === Node.TEXT_NODE)
      return splitHtmlInline(node.nodeValue, style, invalidTexes, convertInline);
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName.toLowerCase();
    if (tag === "br") return "<br>";
    const next = {
      ...style,
      bold: style.bold || tag === "b" || tag === "strong",
      italic: style.italic || tag === "i" || tag === "em",
      underline: style.underline || tag === "u"
    };
    const content = [...node.childNodes].map((child) => htmlTextRuns(child, next, invalidTexes, convertInline)).join("");
    if (tag === "strong" || tag === "b") return `<strong>${content}</strong>`;
    if (tag === "em" || tag === "i") return `<em>${content}</em>`;
    if (tag === "u") return `<u>${content}</u>`;
    return content;
  }
  function createHtmlFromEditor(editorElement, documentXml, invalidTexes = /* @__PURE__ */ new Set(), convertInline = true) {
    const blocks = documentXml ? xmlParagraphText(documentXml).split("\n").map((text) => ({ tag: "p", node: document.createTextNode(text), text })) : getEditorBlocks(editorElement);
    let body = "";
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (block.tag === "table") {
        const rows = [...block.node.rows].map(
          (row) => `<tr>${[...row.cells].map(
            (cell) => `<td>${[...cell.childNodes].map((node) => htmlTextRuns(node, {}, invalidTexes, convertInline)).join("")}</td>`
          ).join("")}</tr>`
        ).join("");
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
      if (isStandaloneTex(block.text)) {
        body += `<div class="equation-render">${renderHtmlFormula(block.text, invalidTexes)}</div>`;
        continue;
      }
      const tag = /^h[1-3]$/.test(block.tag) ? block.tag : "p";
      const content = block.node.nodeType === Node.TEXT_NODE ? splitHtmlInline(block.text, {}, invalidTexes, convertInline) : [...block.node.childNodes].map((node) => htmlTextRuns(node, {}, invalidTexes, convertInline)).join("");
      body += `<${tag}>${content || escapeHtml(block.text)}</${tag}>`;
    }
    return body || "<p></p>";
  }
  function getKatexCss() {
    for (const styleSheet of document.styleSheets) {
      if (!styleSheet.href || !/katex(?:\.min)?\.css(?:$|\?)/i.test(styleSheet.href)) continue;
      try {
        return Array.from(styleSheet.cssRules, (rule) => rule.cssText).join("\n");
      } catch {
        return "";
      }
    }
    return "";
  }
  function buildHtmlDocument(bodyHtml) {
    const katexCss = getKatexCss();
    return `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <title>LaTeX \u2192 HTML export</title>
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
  <main>${bodyHtml}</main>
</body>
</html>`;
  }
  function downloadHtml(htmlDocument, filename = "latex-rovnice.html") {
    const blob = new Blob(["\uFEFF", htmlDocument], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1e3);
  }

  // src/app/main.js
  var $ = (id) => document.getElementById(id);
  var state = {
    file: null,
    zip: null,
    documentXml: null,
    sourceName: "rovnice",
    stats: null
  };
  function sourceText() {
    if (state.documentXml) return xmlParagraphText(state.documentXml);
    return [...$("editor").childNodes].map((node) => node.nodeType === Node.TEXT_NODE ? node.nodeValue : node.innerText).join("\n");
  }
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
      reason: validation.ok ? "" : validation.reason || direct.reason
    };
  }
  function scan() {
    const started = performance.now();
    initDebug();
    state.stats = createStats();
    state.stats.startedAt = (/* @__PURE__ */ new Date()).toISOString();
    const text = sourceText();
    const candidates = collectFormulas(text, {
      collectInline: $("convert-inline").checked,
      collectParentheses: $("convert-paren").checked,
      fromDocx: Boolean(state.documentXml)
    });
    const seen = /* @__PURE__ */ new Set();
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
    $("diagnostics").textContent = formulas.length ? `Nalezeno ${formulas.length} nov\xFDch z\xE1pis\u016F${existing ? `; ${existing} ji\u017E p\u0159eveden\xFDch rovnic bude zachov\xE1no` : ""}. ${unclosed ? "Pozor: nejm\xE9n\u011B jeden blok [ \u2026 ], p\u0159\xEDpadn\u011B \\[ \u2026 \\], nen\xED uzav\u0159en." : "Z\xE1vorky vypadaj\xED uzav\u0159en\u011B."}` : unclosed ? "Nebyl nalezen uzav\u0159en\xFD blok; alespo\u0148 jedna hranat\xE1 z\xE1vorka chyb\xED." : existing ? `Nebyl nalezen nov\xFD LaTeX; ${existing} ji\u017E p\u0159eveden\xFDch rovnic bude zachov\xE1no.` : "Nebyl nalezen \u017E\xE1dn\xFD blok [ \u2026 ], \\[ \u2026 \\] ani aktivn\xED inline z\xE1pis.";
    renderPreview(formulas, $("preview"), debug);
    renderUnprocessed(problems, $("unprocessed"));
    state.stats.formulasBefore = candidates.length;
    state.stats.formulasAfter = formulas.length;
    finalizeStats(state.stats, getDebugLog());
    state.stats.endedAt = (/* @__PURE__ */ new Date()).toISOString();
    state.stats.durationMs = Math.round(performance.now() - started);
    renderStats(state.stats, $("stats"));
    $("export-note").textContent = formulas.length ? `P\u0159i exportu bude zpracov\xE1no ${formulas.length} rozpoznan\xFDch z\xE1pis\u016F.` : "Bez nalezen\xE9ho vzorce bude sta\u017Een jen b\u011B\u017En\xFD text.";
    return formulas;
  }
  async function exportDocx() {
    try {
      const formulas = scan();
      const invalidTexes = invalidFormulaSet(formulas, {
        warnVectorEquals: $("warn-vector-equals").checked
      });
      const existingMath = state.documentXml ? documentMathCount(state.documentXml) : 0;
      if (!formulas.length && !state.documentXml && $("editor").textContent.trim() === "") {
        throw new Error("Nejsou k dispozici \u017E\xE1dn\xE9 data k exportu. Vlo\u017Ete text nebo na\u010Dt\u011Bte DOCX.");
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
      $("export-note").textContent = "Prob\xEDh\xE1 validace v\xFDsledn\xE9ho DOCX\u2026";
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      await validateInputFormat(blob, "docx");
      const convertible = formulas.filter(
        (formula) => formula.status !== "invalid" && !invalidTexes.has(formula.tex)
      ).length;
      const report = await validateDocxPackage(blob, existingMath + convertible);
      downloadDocx(blob, name);
      const skipped = invalidTexes.size ? ` P\u0159esko\u010Deno jako text: ${invalidTexes.size} neplatn\xFDch z\xE1pis\u016F; podrobnosti jsou v p\u0159ehledu kontroly.` : "";
      $("export-note").textContent = `Hotovo: ${name}. Validace pro\u0161la (${report.files} \u010D\xE1st\xED ZIP, ${report.mathCount} objekt\u016F Office Math).${skipped}`;
    } catch (error) {
      debug("export-error", { error: error.message });
      $("export-note").textContent = "Export se nezda\u0159il: " + error.message;
    }
  }
  function exportHtml() {
    try {
      const formulas = scan();
      const invalidTexes = invalidFormulaSet(formulas, {
        warnVectorEquals: $("warn-vector-equals").checked
      });
      const bodyHtml = createHtmlFromEditor(
        $("editor"),
        state.documentXml,
        invalidTexes,
        $("convert-inline").checked
      );
      downloadHtml(buildHtmlDocument(bodyHtml), "latex-rovnice.html");
      $("export-note").textContent = formulas.length ? `Hotovo: export HTML obsahuje p\u016Fvodn\xED text a ${formulas.length} zpracovan\xFDch rovnic.` : "Hotovo: export HTML byl vytvo\u0159en s p\u016Fvodn\xEDm textem bez rozpoznan\xFDch rovnic.";
    } catch (error) {
      debug("export-html-error", { error: error.message });
      $("export-note").textContent = "Export HTML se nezda\u0159il: " + error.message;
    }
  }
  function downloadDebugLog() {
    const lines = getDebugLog().map((entry) => JSON.stringify(entry)).join("\n") || "\u017D\xE1dn\xFD debug log.";
    const content = `# LaTeX \u2192 Word debug log
# version: ${getAppVersion()}
# generated: ${(/* @__PURE__ */ new Date()).toISOString()}
${lines}
`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\uFEFF", content], { type: "text/plain;charset=utf-8" }));
    link.download = `latex-word-debug-${getAppVersion().replace(/\./g, "-")}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1e3);
  }
  function runStressTest() {
    const started = performance.now();
    const scenarios = [
      (index) => `\\left[\\vec{x}_{${index}}=\\begin{pmatrix}${index}\\\\${index + 1}\\end{pmatrix}\\right]`,
      (index) => `\\left[\\left\\{a_${index}+b_${index}\\right\\}\\right]`,
      () => `RAM_{req uired}\\leqRA M_{available}`,
      (index) => `x \\oplusValue_${index}=y`,
      (index) => `\\begin{pmatrix}x_1x_2\\\\${index}\\end{pmatrix}`
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
      }
    }
    const renderMs = Math.round(performance.now() - renderStarted);
    const convertStarted = performance.now();
    for (const tex of formulas) {
      try {
        texToOmml(tex);
        converted++;
      } catch {
      }
    }
    const convertMs = Math.round(performance.now() - convertStarted);
    const box = $("stress-results");
    if (box)
      box.textContent = `Otestov\xE1no ${formulas.length} rovnic: KaTeX ${rendered}/${formulas.length} za ${renderMs} ms, OMML ${converted}/${formulas.length} za ${convertMs} ms, celkem ${Math.round(performance.now() - started)} ms.`;
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
        if (!xmlFile) throw new Error("Soubor nem\xE1 standardn\xED strukturu DOCX.");
        state.zip = zip;
        state.documentXml = await xmlFile.async("string");
        $("file-name").textContent = file.name;
        $("editor").textContent = "Nahran\xFD DOCX je p\u0159ipraven k p\u0159evodu. Pro p\u0159epnut\xED na vlo\u017Een\xFD text soubor zru\u0161te v\xFDb\u011Brem jin\xE9ho zdroje.";
      } else {
        state.zip = null;
        state.documentXml = null;
        $("editor").textContent = await file.text();
        $("file-name").textContent = `${file.name} (prost\xFD text)`;
      }
      scan();
    } catch (error) {
      $("file-name").textContent = "Soubor se nepoda\u0159ilo na\u010D\xEDst: " + error.message;
    }
  });
  $("use-plain-text").addEventListener("click", () => {
    state.file = state.zip = state.documentXml = null;
    $("editor").textContent = $("plain-text").value;
    $("file-name").textContent = "Pou\u017Eit vlo\u017Een\xFD text";
    scan();
  });
  $("editor").addEventListener("input", () => {
    if (state.documentXml) {
      state.file = state.zip = state.documentXml = null;
      $("file-name").textContent = "Pou\u017Eit vlo\u017Een\xFD obsah";
    }
  });
  $("scan").addEventListener("click", scan);
  $("download").addEventListener("click", exportDocx);
  $("download-html").addEventListener("click", exportHtml);
  var debugButton = document.createElement("button");
  debugButton.type = "button";
  debugButton.className = "minor";
  debugButton.textContent = "St\xE1hnout debug log";
  debugButton.addEventListener("click", downloadDebugLog);
  $("export-note").after(debugButton);
  var themeToggle = $("theme-toggle");
  var applyTheme = (dark) => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    themeToggle.textContent = dark ? "Sv\u011Btl\xFD re\u017Eim" : "Tmav\xFD re\u017Eim";
    themeToggle.setAttribute("aria-pressed", String(dark));
  };
  var systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  var manualTheme = null;
  try {
    const storedTheme = localStorage.getItem("latex-word-theme");
    if (storedTheme === "dark" || storedTheme === "light") manualTheme = storedTheme;
  } catch {
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
    }
  });
  $("stress-test").addEventListener("click", runStressTest);
  window.latexWordApp = { scan, sourceText };
})();
