# LaTeX do rovnic ve Wordu

Otevřete `index.html` v moderním prohlížeči. Aplikace je plně lokální – žádný soubor ani text se neodesílá na server.

## Jak se zapisují rovnice

Nejspolehlivější je samostatný blok v jedné z těchto forem:

```text
[
\boxed{B^m}
]
```

```text
\[ \boxed{B^m} \]
```

Fungují také bloky na jediné řádce (`[ \mathbf t=A\mathbf s+\mathbf e ]`), inline zápis `\( ... \)` a `$...$`. Volitelně lze zapnout rozpoznání zápisu s příkazy LaTeX v kulatých závorkách.

## Co výstup zachová

- Při načtení DOCX zůstávají beze změny všechny odstavce, styly, tabulky, obrázky a obsah mimo nahrazené bloky rovnic.
- Při vložení z Wordu zachová nově vytvořený dokument odstavce, nadpisy, tučné/kurzíva/podtržení, seznamy a jednoduché tabulky.
- Rovnice ve výstupu jsou Office Math (OMML), tedy dále upravitelné ve Wordu.
- Před stažením aplikace znovu otevře vytvořený ZIP, ověří kontrolní součty, povinné části DOCX, XML a počet objektů Office Math. Pokud kontrola neprojde, soubor se nestáhne.

## Důležité omezení

Převodník obsahuje praktickou podmnožinu LaTeXu: zlomky, odmocniny, indexy, mocniny, řecká písmena, `\mathbf`, `\mathrm`, `\text`, `\boxed`, součty/integrály a běžné operátory. KaTeX v náhledu umí větší množinu; složité matice a specializované balíčky se proto mohou ve Wordu zjednodušit. Před stažením vždy zkontrolujte náhled a otevřete výsledek ve Wordu.

Knihovny: KaTeX 0.18.1 (MIT) a JSZip 3.10.1 (MIT/GPL-3.0).

### Složené závorky u množin

Správný zápis pro množinu generovanou bázovými vektory je například:

```text
\boxed{L=\left\{\sum_{i=1}^{n} z_i\mathbf{b}_i\;\middle|\;z_i\in\mathbb{Z}\right\}.}
```

Aplikace automaticky opraví častý překlep `\left{` / `\right}` na tuto podobu.

## Diagnostika a testování

Při každé kontrole aplikace zobrazí statistiky vstupu v rozbalovací části:

- počet kandidátů před čištěním a počet unikátních vzorců po čištění,
- celkový počet oprav a jejich typy,
- počet doplněných závorek,
- počet neznámých příkazů,
- čas zpracování.

Tlačítko **Spustit test 500+ rovnic** provede lokální zátěžový test 520 rovnic. Test kombinuje matice, vektory, nested delimitery a běžné Word artefakty. Samostatně ověřuje také neuzavřené závorky, neznámé příkazy, příliš dlouhé vstupy, chybné delimiterové páry a neúplná maticová prostředí. Výsledek obsahuje čas KaTeX renderu, čas převodu do OMML, počet chybových scénářů, opakované běhy, počet DOM uzlů a velikost debug logu.

Podrobný log lze stáhnout tlačítkem **Stáhnout debug log**. Obsahuje původní a vyčištěný zápis, provedené heuristické opravy, použití KaTeX fallbacku, chyby a přeskočené zápisy.

## Téma aplikace

Aplikace automaticky respektuje tmavé nebo světlé téma operačního systému. Tlačítkem v hlavičce lze režim ručně přepsat; ruční volba se uloží pro další návštěvu.
