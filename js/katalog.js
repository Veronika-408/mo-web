/* MO.METODY: metódy riešenia úloh MO pre ZŠ (kód -> názov, ako spoznať, na čo dať pozor).
   Kódy používa data/tagy.json (pole "metody", 1–3 kódy na úlohu, prvý je hlavný).
   Texty písal Claude – treba skontrolovať. */
(function () {
  const P = (window.MO = window.MO || {});
  P.METODY = {
    vypis: { n: "Systematický výpis možností", s: "Možností je konečne veľa – vypíšem ich v poradí, nič nevynechám, nič nezopakujem.", p: "Zvoliť poradie (podľa prvej cifry, podľa veľkosti) a zdôvodniť, že výpis je úplný." },
    pripady: { n: "Rozbor prípadov", s: "Situácia sa rozpadne na niekoľko prípadov (kto kde sedí, ktorá cifra je párna…).", p: "Prípady musia pokryť všetko; každý dotiahnuť do konca alebo vylúčiť sporom." },
    od_konca: { n: "Riešenie od konca", s: "Poznám koncový stav a postupnosť krokov – idem späť.", p: "Každú operáciu obrátiť (+ ↔ −, · ↔ :), pozor na „zvyšok z toho, čo ostalo“." },
    dielky: { n: "Úsečkový model / dielky", s: "Časti celku (polovica, tretina zvyšku…) bez rovnice – kreslím úsečky a dielky.", p: "Zjednotiť veľkosť dielika; typické pre Z5–Z7." },
    rovnica: { n: "Rovnica s neznámou", s: "Vzťahy medzi veličinami sa dajú zapísať pomocou neznámej.", p: "Jasne povedať, čo je neznáma; skúška správnosti." },
    tabulka: { n: "Tabuľka / prehľadný zápis", s: "Veľa údajov o osobách, dňoch, farbách – usporiadam ich do tabuľky.", p: "Tabuľka nahrádza dlhé slovné úvahy, ale treba zdôvodniť, prečo tak." },
    vzor: { n: "Hľadanie pravidelnosti", s: "Opakuje sa vzor (cyklus, perióda, rast) – stačí nájsť pravidlo.", p: "Overiť pravidlo na prvých členoch; pozor na začiatok cyklu." },
    delitelnost: { n: "Deliteľnosť, zvyšky, NSD/NSN", s: "Delenie bezo zvyšku, spoločné násobky, prvočísla, rozklad.", p: "Rozložiť na prvočinitele; zvyšky po delení sa dajú sčítať a násobiť." },
    cifry: { n: "Zápis čísla po cifrách", s: "Algebrogramy, ciferné súčty, „číslo zapísané pomocou cifier“.", p: "Prenos pri sčítaní; prvá cifra nie je 0; ciferný súčet a deliteľnosť 3 a 9." },
    parita: { n: "Parita (párne / nepárne)", s: "Stačí vedieť, či je niečo párne – súčty, striedanie, šachovnica.", p: "Často ukáže, že niečo NEJDE." },
    invariant: { n: "Invariant (čo sa nemení)", s: "Opakované operácie – hľadám veličinu, ktorá sa pri nich nemení.", p: "Porovnať hodnotu invariantu na začiatku a v cieli." },
    extrem: { n: "Najmenší / najväčší možný", s: "Pýtajú sa na minimum či maximum – odhad + príklad, že sa dá dosiahnuť.", p: "Vždy dve časti: menej (viac) to nejde, a tu je príklad." },
    pocitanie: { n: "Počítanie možností", s: "Koľko je spôsobov – pravidlo súčinu, súčtu, dvojice, poradia.", p: "Nezarátať dvakrát (poradie áno/nie)." },
    logika: { n: "Logické úvahy", s: "Pravdovravní a klamári, výroky, kto čo povedal, turnaje.", p: "Predpokladať a hľadať spor; zhrnúť, čo platí určite." },
    pomer: { n: "Pomer, úmernosť, percentá", s: "Veličiny rastú spolu (alebo opačne), práca, zmesi, ceny.", p: "Prepočet na 1 kus / 1 hodinu; nepriama úmernosť pri spoločnej práci." },
    pohyb: { n: "Pohyb, čas, hodiny", s: "Rýchlosť, stretnutie, predbiehanie, ručičky hodín, kalendár.", p: "s = v · t; pri stretnutí sa rýchlosti sčítajú, pri dobiehaní odčítajú." },
    obsah: { n: "Obsah a obvod útvarov", s: "Rozdelenie alebo doplnenie útvaru na známe časti, štvorcová sieť.", p: "Rozstrihať na obdĺžniky a trojuholníky (polovica obdĺžnika); obvod sa pri presune strán nemení." },
    uhly: { n: "Uhly a vlastnosti trojuholníkov", s: "Výpočet uhlov, rovnoramenné a rovnostranné trojuholníky, rovnobežky.", p: "Súčet uhlov v trojuholníku 180°; rovnoramenný = rovnaké uhly pri základni." },
    priestor: { n: "Priestorová predstavivosť", s: "Kocky, stavby z kociek, siete, povrch a objem telies, pohľady.", p: "Počítať po vrstvách alebo po pohľadoch; nefarbené kocky sú vnútri." },
    konstrukcia: { n: "Konštrukcia, kreslenie", s: "Nakresli, zostroj, rozdeľ útvar, nájdi všetky útvary v sieti.", p: "Popis postupu konštrukcie; pri počítaní útvarov triediť podľa veľkosti." },
    skusanie: { n: "Skúšanie a overenie", s: "Odhadnem, vyskúšam, upravím – a ukážem, že iné riešenie nie je.", p: "Samotné skúšanie nestačí, treba zdôvodniť úplnosť." },
  };
})();
