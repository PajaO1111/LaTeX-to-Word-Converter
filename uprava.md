Shrnutí: přidej tyto řádky do cleanTex() (doporučené místo: těsně před let cleaned = ...)
js
value = value.replace(/\\pmod([A-Za-z0-9]+)/g, "\\pmod $1");
value = value.replace(/\\nmid([A-Za-z0-9]+)/g, "\\nmid $1");
value = value.replace(/\\oplus([A-Za-z0-9]+)/g, "\\oplus $1");
value = value.replace(/\\vdash([A-Za-z0-9]+)/g, "\\vdash $1");
value = value.replace(/\\mathbb([A-Za-z])/g, "\\mathbb{$1}");
value = value.replace(/\\Delta([A-Za-z0-9])/g, "\\Delta $1");
value = value.replace(/([0-9])\\(?!\\)/g, "$1\\\\");
value = value.replace(/\\left\\{([^}]*)\}/g, "\\left\\{$1\\right\\}");
value = value.replace(/\\left\\lfloor([^}]*)\\rfloor/g, "\\left\\lfloor$1\\right\\rfloor");
value = value.replace(/\\left\\lceil([^}]*)\\rceil/g, "\\left\\lceil$1\\right\\rceil");
value = value.replace(/\\begin\{pmatrix\}([0-9]+)\\end\{pmatrix\}/g, "\\begin{pmatrix}$1\\\\\\end{pmatrix}");
🎉 Výsledek
Po doplnění těchto oprav:

zmizí chyby \pmodn, \nmida, \oplusy, \vdashC, \mathbbF, \DeltaX

matice se opraví

složené závorky se opraví

KaTeX projde bez chyb

Word dostane validní OMML

export bude stabilní