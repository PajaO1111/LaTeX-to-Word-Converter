Navrhuji změnit pipeline na **valid-first, repair-second**:

```text
původní text
  ↓
rychlá strukturální kontrola
  ↓
KaTeX kontrola původního zápisu
  ├─ platný → bez opravy
  └─ neplatný → vrstvené opravy podle typu poškození
                  ↓
                znovu validace
                  ├─ platný → převést
                  └─ neplatný → ponechat jako text
```

## 1. Rozdělit `cleanTex()` na validaci a opravu

Současný problém je, že `cleanTex()` opravuje každý vstup ještě předtím, než se zjistí, zda je platný. Proto se validní zápisy zbytečně mění.

Doporučená hlavní funkce:

```js
function prepareFormula(rawTex) {
  const originalTex = String(rawTex || "").trim();

  const originalValidation = validateFormula(originalTex);

  if (originalValidation.ok) {
    return {
      originalTex,
      cleanedTex: originalTex,
      status: "valid",
      fixes: [],
      reason: ""
    };
  }

  const repaired = repairByLayers(originalTex);
  const repairedValidation = validateFormula(repaired.cleanedTex);

  if (repairedValidation.ok) {
    return {
      originalTex,
      cleanedTex: repaired.cleanedTex,
      status: "fixed",
      fixes: repaired.fixes,
      reason: originalValidation.reason
    };
  }

  return {
    originalTex,
    cleanedTex: originalTex,
    status: "invalid",
    fixes: repaired.fixes,
    reason: repairedValidation.reason || originalValidation.reason
  };
}
```

Klíčová vlastnost:

```js
platný původní LaTeX → cleanedTex === originalTex
```

Tím se například:

```latex
\int_0^1 x\,dx
```

nebude vůbec měnit.

## 2. Samostatná validace

Doporučuji oddělit kontrolu struktury od kontroly KaTeX:

```js
function validateFormula(tex) {
  const structure = validateLatexStructure(tex);

  if (!structure.ok) {
    return structure;
  }

  try {
    katex.renderToString(tex, {
      throwOnError: true,
      strict: "ignore"
    });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: "KaTeX: " + error.message
    };
  }
}
```

Fallback bez `\left`/`\right` by měl být až druhý validační pokus:

```js
function validateFormulaWithFallback(tex) {
  const direct = validateFormula(tex);
  if (direct.ok) return { ...direct, mode: "direct" };

  const fallback = fallbackTex(tex);
  if (fallback !== tex) {
    const fallbackResult = validateFormula(fallback);
    if (fallbackResult.ok) {
      return {
        ok: true,
        mode: "fallback",
        fallbackTex: fallback,
        reason: direct.reason
      };
    }
  }

  return direct;
}
```

Fallback se tedy použije pouze tehdy, když původní zápis neprojde.

## 3. Vrstvené opravy podle poškození

Místo jednoho globálního `cleanTex()` bych použil jednotlivé opravy v pořadí od nejbezpečnějších:

```js
function repairByLayers(originalTex) {
  let current = originalTex;
  const fixes = [];

  const layers = [
    repairEncoding,
    protectTextBlocks,
    repairCommandSeparation,
    repairSpacingArtifacts,
    repairMatrixArtifacts,
    repairDelimiterPairs,
    repairUnclosedEnvironments
  ];

  for (const repair of layers) {
    const result = repair(current);

    if (result.value !== current) {
      current = result.value;
      fixes.push(...result.fixes);
    }

    const validation = validateFormulaWithFallback(current);
    if (validation.ok) {
      return {
        cleanedTex: current,
        fixes,
        validation
      };
    }
  }

  return {
    cleanedTex: current,
    fixes,
    validation: validateFormulaWithFallback(current)
  };
}
```

Každá vrstva by měla:

- měnit pouze svůj typ artefaktu,
- vracet seznam konkrétních oprav,
- být idempotentní,
- po provedení umožnit novou validaci.

## 4. Doporučené vrstvy

### Vrstva 1: Bezpečné opravy

Tyto opravy lze provést téměř vždy:

```js
function repairEncoding(value) {
  return {
    value: value.replace(/\r/g, ""),
    fixes: ["trim"]
  };
}
```

Pozor: odstranění `\r` logovat jako `trim`, ne jako `backslash-artifact`.

### Vrstva 2: Ochrana bloků

Před globálními regexy chránit:

- `\text{...}`,
- `\begin{...}...\end{...}`,
- spacing příkazy jako `\,`, `\:`, `\;`, `\!`,
- maticové prostředí.

Například:

```js
function protectTextBlocks(value) {
  const blocks = [];

  const protectedValue = value.replace(/\\text\{([^{}]*)\}/g, (match) => {
    const index = blocks.push(match) - 1;
    return `@@TEXT_${index}@@`;
  });

  return {
    value: protectedValue,
    restore(text) {
      return text.replace(/@@TEXT_(\d+)@@/g, (_, index) => blocks[index]);
    }
  };
}
```

Oprava musí zachovat:

```latex
\text{secret key}
```

bez změny.

### Vrstva 3: Oddělení příkazů

Pouze pokud validace původního zápisu selže:

```js
function repairCommandSeparation(value) {
  return {
    value: value
      .replace(/\\(mathbb|mathbf|mathrm|mathcal|mathsf)([A-Za-z])/g, "\\$1{$2")
      .replace(/\\(pmod|mod|nmid|oplus|vdash|cong)([A-Za-z])/g, "\\$1 $2"),
    fixes: ["command-separation"]
  };
}
```

Příklady:

```latex
\mathbbF       → \mathbb{F}
\pmodn         → \pmod n
\nmida         → \nmid a
\oplusValue    → \oplus Value
\vdashProof    → \vdash Proof
```

### Vrstva 4: Matice

Opravy číslic provádět výhradně uvnitř matice:

```js
function repairMatrixArtifacts(value) {
  const matrixPattern =
    /(\\begin\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\})([\s\S]*?)(\\end\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\})/g;

  const repaired = value.replace(matrixPattern, (match, start, body, end) => {
    const fixedBody = body.replace(/\\([0-9])/g, "\\\\$1");

    return `${start}${fixedBody}${end}`;
  });

  return {
    value: repaired,
    fixes: repaired !== value ? ["matrix-row-separator"] : []
  };
}
```

Například:

```latex
\begin{pmatrix}2\0\end{pmatrix}
```

se opraví na:

```latex
\begin{pmatrix}2\\0\end{pmatrix}
```

Bez ztráty číslice.

### Vrstva 5: Delimitery

Párování musí být tokenové a zásobníkové. Nejdříve je nutné zjistit, zda je pár správný:

```text
\left[ → \left\{ → \left\langle
\right\rangle → \right\} → \right]
```

Pokud je pár správný, nic neměnit.

Pokud chybí pouze poslední uzávěr, lze ho doplnit:

```latex
\left[ x+1
```

→

```latex
\left[ x+1 \right]
```

Pokud je typ v konfliktu:

```latex
\left[ x+1 \right)
```

neopravovat automaticky. Zápis ponechat jako text a uvést:

```text
Nesprávně spárované delimitery: očekáváno \right], nalezeno \right).
```

## 5. Zachovat původní, opravený i validační stav

Každý nalezený vzorec by měl mít jednotný objekt:

```js
{
  id: 42,
  originalTex: "\\mathbbF_{p^n}",
  cleanedTex: "\\mathbb{F}_{p^n}",
  status: "fixed",
  validation: "direct",
  fixes: [
    {
      type: "command-separation",
      count: 1
    }
  ],
  reason: ""
}
```

Pro nevalidní zápis:

```js
{
  id: 43,
  originalTex: "\\left[x+1\\right)",
  cleanedTex: "\\left[x+1\\right)",
  status: "invalid",
  validation: "failed",
  fixes: [],
  reason: "Nesprávně spárované delimitery."
}
```

Pro validní zápis:

```js
{
  id: 44,
  originalTex: "\\int_0^1 x\\,dx",
  cleanedTex: "\\int_0^1 x\\,dx",
  status: "valid",
  validation: "direct",
  fixes: []
}
```

## 6. Export

Export by měl používat pouze `cleanedTex` u stavů `valid` a `fixed`:

```js
if (formula.status === "invalid") {
  return runXml(formula.originalTex);
}

return equationPara(formula.cleanedTex);
```

Tím bude platit:

- validní zápisy se převedou,
- opravené zápisy se převedou,
- nevalidní zápisy zůstanou jako původní text,
- žádná chybná rovnice nezablokuje celý export.

## 7. Statistika

Statistiky by se měly počítat z objektů vzorců, ne z každého průchodu regexem:

```js
state.stats = {
  formulasBefore: formulas.length,
  formulasAfter: formulas.filter((item) => item.status !== "invalid").length,
  valid: formulas.filter((item) => item.status === "valid").length,
  fixed: formulas.filter((item) => item.status === "fixed").length,
  invalid: formulas.filter((item) => item.status === "invalid").length,
  fixes: {},
  fallbackRenders: formulas.filter((item) => item.validation === "fallback").length
};
```

Typy oprav:

```js
for (const formula of formulas) {
  for (const fix of formula.fixes) {
    state.stats.fixes[fix.type] =
      (state.stats.fixes[fix.type] || 0) + fix.count;
  }
}
```

Doporučené typy:

```text
text-protection
command-separation
spacing-command
matrix-row-separator
matrix-end
delimiter-pair
absolute-value
backslash-artifact
identifier-space
```

## Doporučený finální algoritmus

```js
function processFormula(rawTex, id) {
  const originalTex = String(rawTex || "").trim();

  const direct = validateFormulaWithFallback(originalTex);

  if (direct.ok && direct.mode === "direct") {
    return {
      id,
      originalTex,
      cleanedTex: originalTex,
      status: "valid",
      validation: "direct",
      fixes: []
    };
  }

  const repaired = repairByLayers(originalTex);
  const validation = validateFormulaWithFallback(repaired.cleanedTex);

  return {
    id,
    originalTex,
    cleanedTex: validation.ok ? repaired.cleanedTex : originalTex,
    status: validation.ok ? "fixed" : "invalid",
    validation: validation.ok ? validation.mode : "failed",
    fixes: repaired.fixes,
    reason: validation.ok ? "" : validation.reason
  };
}
```

Toto řešení splňuje hlavní požadavek:

> Pokud je původní LaTeX platný, aplikace ho vůbec nemění.

Zároveň umožní postupné opravy poškozených zápisů bez toho, aby jedna agresivní globální normalizace změnila význam celého dokumentu.