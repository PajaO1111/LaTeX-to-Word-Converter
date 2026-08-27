Navrhuji upravit zpracování do několika bezpečných fází. Hlavní pravidlo: automatická oprava nesmí měnit význam platného textu.

## 1. Chránit obsah `\text{...}`

Současný problém vzniká tím, že se globální regex:

```js
/([A-Za-z])\s+([A-Za-z])/g
```

aplikuje i uvnitř `\text{...}`.

Například:

```latex
\text{secret key}
```

se změní na:

```latex
\text{secretkey}
```

Řešení: před globálními opravami dočasně nahradit obsah `\text{...}` tokeny:

```js
function protectTextBlocks(value) {
  const protectedBlocks = [];
  const protectedValue = value.replace(/\\text\{([^{}]*)\}/g, (match) => {
    const index = protectedBlocks.push(match) - 1;
    return `@@TEXT_BLOCK_${index}@@`;
  });

  return {
    value: protectedValue,
    restore(text) {
      return text.replace(/@@TEXT_BLOCK_(\d+)@@/g, (_, index) => protectedBlocks[index]);
    }
  };
}
```

Použití uvnitř `cleanTex()`:

```js
const protectedText = protectTextBlocks(value);
value = protectedText.value;

// zde mohou proběhnout opravy identifikátorů a mezer

value = protectedText.restore(value);
```

Tím zůstanou zachovány:

```latex
\text{secret key}
\text{mřížová kryptografie}
\text{dostatečnou bezpečnost s rozumnou cenou}
```

## 2. Zachovat nové řádky v `aligned`, `array` a `matrix`

Současné:

```js
.replace(/\n\s*/g, " ")
```

ničí strukturu víceřádkových rovnic.

Doporučuji nahradit ho funkcí, která zachová nové řádky uvnitř prostředí:

```js
function normalizeLineBreaks(value) {
  let depth = 0;
  let result = "";

  for (const char of value) {
    if (char === "{") depth++;
    if (char === "}") depth--;

    result += char;
  }

  return result.replace(/[ \t]+/g, " ");
}
```

Ještě bezpečnější je během čištění chránit celé prostředí:

```latex
\begin{aligned}
...
\end{aligned}
```

a po opravách ho vrátit zpět. Minimálně ale nesmí být `\\` ani skutečný nový řádek nahrazen obyčejnou mezerou uvnitř matice.

## 3. Opravit artefakty `\0`, `\1`, `\2` bez ztráty čísla

Současný kód:

```js
value = value.replace(/\\([0-9])/g, "\\\\");
```

zahodí číslici. Například:

```latex
\begin{pmatrix}2\0\end{pmatrix}
```

se může změnit na:

```latex
\begin{pmatrix}2\\\end{pmatrix}
```

Správná oprava pro maticový kontext je:

```js
value = value.replace(
  /(\\begin\{(?:pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|array)\}[\s\S]*?)\\([0-9])/g,
  "$1\\\\$2"
);
```

Výsledek:

```latex
\begin{pmatrix}2\\0\end{pmatrix}
```

Tuto opravu je nutné provádět pouze uvnitř matice. Mimo matici by `\2` nemuselo znamenat totéž.

## 4. Nezaměňovat `\mathbb F` za `\mathbbF`

Příkaz a jeho argument musí být odděleny před dalším čištěním:

```js
value = value.replace(
  /\\(mathbb|mathbf|mathrm|mathcal|mathsf)([A-Za-z])/g,
  "\\$1 $2"
);
```

Potom:

```latex
\mathbb F
```

zůstane jako:

```latex
\mathbb F
```

a lze ho případně normalizovat na:

```latex
\mathbb{F}
```

Stejnou logiku použít pro:

```latex
\mathbf x
\mathrm MLWE
\mathcal L
```

## 5. Přesunout obecné opravy až za ochranu speciálních bloků

Doporučené pořadí `cleanTex()`:

1. uložit původní vstup,
2. chránit `\text{...}`,
3. chránit maticová prostředí,
4. oddělit slepené známé příkazy,
5. opravit Word artefakty,
6. opravit matice uvnitř maticového kontextu,
7. obnovit `\text{...}` a matice,
8. provést syntaktickou validaci,
9. vrátit výsledek.

Tím se zabrání tomu, aby obecný regex upravil obsah, kterému nerozumí.

## 6. Změnit statistiky na skutečné typy oprav

Místo obecného:

```json
"fixes": ["normalization"]
```

logovat například:

```json
{
  "event": "auto-fix",
  "fixes": [
    {
      "type": "text-protection",
      "count": 1
    },
    {
      "type": "matrix-row-separator",
      "count": 2
    }
  ]
}
```

Doporučené typy:

- `text-protection`,
- `identifier-space`,
- `command-separation`,
- `matrix-row-separator`,
- `matrix-end`,
- `delimiter-pair`,
- `absolute-value`,
- `backslash-artifact`,
- `unknown-command`.

Statistika `addedBrackets` by se měla počítat pouze z oprav, které skutečně přidaly konkrétní znak, ne z rozdílu celkového počtu závorek.

## 7. Oddělit validaci od opravy

Doporučený postup:

```text
original
  ↓
heuristicFix()
  ↓
validateLatexStructure()
  ↓
KaTeX kontrola
  ↓
fallback bez left/right
  ↓
texToOmml()
  ↓
validace DOCX
```

Důležité je, aby validace porovnávala:

- původní zápis,
- opravený zápis,
- důvod případného přeskočení.

Například:

```js
{
  originalTex: "\\begin{pmatrix}2\\0\\end{pmatrix}",
  cleanedTex: "\\begin{pmatrix}2\\\\0\\end{pmatrix}",
  status: "fixed",
  fixes: ["matrix-row-separator"]
}
```

## 8. Rozšířit stress test

Stress test by měl obsahovat nejen 520 platných rovnic, ale také opakované scénáře:

```js
const stressCases = [
  "\\text{secret key}",
  "\\begin{pmatrix}2\\0\\end{pmatrix}",
  "\\begin{pmatrix}x_1\\x_2\\x_3\\end{pmatrix}",
  "\\mathbbF",
  "\\pmodn",
  "\\left[\\left(x+1\\right]",
  "\\unknown{x}",
  "\\begin{pmatrix}1&2",
  "x".repeat(100001)
];
```

Každý běh by měl uložit:

```js
{
  run: 1,
  durationMs: 42,
  rendered: 520,
  converted: 520,
  errors: 2,
  debugEntries: 120,
  domNodes: 250
}
```

## Priorita implementace

Nejdříve bych opravil:

1. ochranu `\text{...}`,
2. ztrátu čísel v maticích,
3. zachování řádků v `aligned`/`matrix`,
4. oddělení `\mathbb F` a podobných příkazů,
5. přesné statistiky,
6. stress test s těmito konkrétními regresními případy.

Debug log, který jste poskytl, ukazuje, že největší problém není KaTeX, ale příliš agresivní čištění vstupu. Dokud se neopraví ochrana textových bloků a matic, nelze garantovat zachování významu převedených rovnic.