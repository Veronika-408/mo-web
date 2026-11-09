/* Záložka „Metódy“: katalóg metód riešenia, ako ju spoznať, na čo dať pozor, v ktorých kategóriách sa vyskytuje. */
(function () {
  const P = window.MO, h = P.h;

  function init() {
    const U = P.ULOHY.filter((u) => u.metody);
    const el = document.getElementById("panel-metody");
    if (!U.length) { el.replaceChildren(h("div", { class: "page" }, h("h2", null, "Metódy riešenia"), h("p", { class: "lead" }, "Triedenie úloh sa ešte pripravuje."))); return; }
    const pocet = (m, k) => U.filter((u) => u.metody.includes(m) && (!k || u.kategoria === k)).length;
    const hlavna = (m) => U.filter((u) => u.metody[0] === m).length;
    const zoradene = Object.keys(P.METODY).sort((a, b) => pocet(b) - pocet(a));
    const max = Math.max(...zoradene.map((m) => pocet(m)));
    el.replaceChildren(h("div", { class: "page" },
      h("h2", null, "Metódy riešenia"),
      h("p", { class: "lead" }, `Ako sa riešia úlohy MO pre ZŠ. Pri každej z ${U.length} úloh sú určené 1–3 metódy podľa vzorového riešenia (prvá je hlavná). Klikni na metódu alebo na číslo pri kategórii – otvoria sa príslušné úlohy. Popisy metód a zaradenie úloh pripravil Claude – ber ich ako pomôcku, nie ako pravdu.`),
      h("div", { class: "table-wrap", style: "margin-bottom:1.4rem" }, h("table", { class: "cov share" },
        h("thead", null, h("tr", null, h("th", null, "metóda"), P.KATEGORIE.map((k) => h("th", null, k)), h("th", null, "spolu"), h("th", { title: "koľkokrát je to hlavná metóda" }, "hlavná"))),
        h("tbody", null, zoradene.map((m) => h("tr", null,
          h("td", { class: "lbl" }, h("button", { class: "link-btn", type: "button", style: "font-size:.85rem", onclick: () => P.dbSetFilter({ metoda: m }) }, P.METODY[m].n)),
          P.KATEGORIE.map((k) => { const n = pocet(m, k); return h("td", { class: n ? "shade" : "faint", style: `--p:${Math.round((60 * n) / Math.max(1, max / 3))}%;${n ? "cursor:pointer" : ""}`, onclick: n ? () => P.dbSetFilter({ metoda: m, kat: k }) : null }, n || "–"); }),
          h("td", { class: "strong" }, pocet(m)), h("td", null, hlavna(m))))))),
      h("div", { class: "catalog" }, zoradene.map((m) => h("details", { class: "cat-card" },
        h("summary", null, h("span", null, P.METODY[m].n), h("span", { class: "n" }, `${pocet(m)} úloh`)),
        h("div", { class: "cat-body" },
          h("div", null, h("b", null, "Ako ju spoznať: "), P.METODY[m].s),
          h("div", null, h("b", null, "Na čo dať pozor: "), P.METODY[m].p),
          h("div", { class: "row" }, h("button", { class: "btn sm", type: "button", onclick: () => P.dbSetFilter({ metoda: m }) }, "Zobraziť úlohy →"),
            P.KATEGORIE.map((k) => pocet(m, k) ? h("button", { class: "chip sm", type: "button", onclick: () => P.dbSetFilter({ metoda: m, kat: k }) }, `${k}: ${pocet(m, k)}`) : null))))))));
  }
  P.registerTab({ id: "metody", label: "Metódy", init });
})();
