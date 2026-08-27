
---

# ✅ **PROMPT PRO COPILOTA VE VS CODE — VERZE PRO DOKUMENTACI PROJEKTU**

> **Účel:** Tento projekt je webová aplikace pro převod LaTeXu do Office Math (OMML).  
> Obsahuje pokročilé čištění LaTeXu, heuristické opravy, validaci struktury, statistické analýzy, stress‑testy a automatické UI funkce (dark/light theme).  
> Tvým úkolem je rozšiřovat, refaktorovat a udržovat kód tak, aby byl robustní, rychlý, čitelný a odolný vůči chybám.

---

## 🧠 **Globální instrukce pro Copilota**
Při práci na tomto projektu vždy dodržuj následující pravidla:

### 1) **Modul „Heuristický opravovač“**
Při každé úpravě kódu:
- zlepšuj heuristiky pro automatické opravy LaTeXu  
- přidávej nové vzory pro:
  - chybějící `\rightX`
  - nested delimiters
  - Word artefakty
  - rozbité matrix prostředí
  - rozbité absolutní hodnoty
  - rozbité vektory (`\vec`, arrow accents)
- udržuj funkci `heuristicFix()` jako centrální opravovací modul  
- nikdy neodstraňuj funkce, které opravují LaTeX — pouze je rozšiřuj

### 2) **Modul „Statistická analýza vstupu“**
Copilot má vždy:
- udržovat a rozšiřovat objekt `state.stats`
- přidávat nové metriky, pokud jsou užitečné
- udržovat funkci `collectStats()` jako hlavní sběrač statistik
- dbát na to, aby statistiky byly:
  - přesné
  - rychlé
  - nezatěžovaly UI

### 3) **Modul „Testovací režim“**
Copilot má:
- udržovat a rozšiřovat funkci `runStressTest()`
- generovat 500+ rovnic
- testovat:
  - výkon KaTeXu
  - výkon OMML parseru
  - memory leaks
  - chybové stavy
- přidávat nové testovací scénáře, pokud jsou užitečné

### 4) **Modul „Auto‑theme“**
Copilot má:
- udržovat automatické přepínání dark/light podle OS
- rozšiřovat CSS tak, aby všechny prvky měly dark‑mode variantu
- zachovat kompatibilitu s manuálním přepínačem

### 5) **Kvalita kódu**
Copilot má vždy:
- psát čistý, čitelný, modulární kód
- používat jasné názvy funkcí
- přidávat komentáře tam, kde je to užitečné
- nikdy nevytvářet zbytečné závislosti
- zachovat kompatibilitu se stávajícím kódem

### 6) **Bezpečnost a robustnost**
Copilot má:
- chránit parser před nekonečnými smyčkami
- chránit aplikaci před extrémně dlouhými vstupy
- validovat LaTeX před konverzí
- logovat všechny automatické opravy

### 7) **UI a UX**
Copilot má:
- zachovat současný vizuální styl
- rozšiřovat UI pouze tehdy, když je to užitečné
- udržovat rychlou odezvu i při stovkách rovnic
- optimalizovat renderování pomocí batch‑renderingu

### 8) **Dokumentace**
Copilot má:
- generovat dokumentaci k novým modulům
- psát stručné, jasné popisy funkcí
- udržovat README projektu aktuální

---

## 📌 **Jak má Copilot odpovídat**
Kdykoli požádám o úpravu kódu:
- Copilot má upravit pouze relevantní části
- nikdy nesmí přepsat celý soubor, pokud to není nutné
- má zachovat strukturu projektu
- má navrhnout optimalizace, pokud jsou vhodné
- má vždy respektovat výše uvedené moduly

---

## 🧩 **Kontext projektu**
Tento prompt se vztahuje k souborům:

- `app.js` — hlavní logika aplikace  
- `style.css` — UI a dark/light theme  
- HTML šablona — UI struktura  
- KaTeX — renderování LaTeXu  
- JSZip — export do DOCX  

Copilot má vždy pracovat s tímto kontextem.

---

## 🏁 **Závěrečná instrukce**
> **Copilote, od této chvíle se řiď tímto promptem při všech úpravách projektu.  
> Každý commit, každá úprava, každý návrh musí respektovat všechny moduly a pravidla.**

---
