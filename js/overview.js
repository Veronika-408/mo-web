/* Záložka „Prehľad“: koľko úloh je z ktorého roka, kategórie a kola; rozloženie oblastí a metód. */
(function () {
  const P = window.MO, h = P.h;
  const KS = { "domáce": "D", "okresné": "O", "krajské": "K" };

  function matica() {
    const U = P.ULOHY, roky = [...new Set(U.map((u) => u.rok))].sort().reverse();
    const stl = []; P.KATEGORIE.forEach((k) => P.KOLA.forEach((ko) => { if (U.some((u) => u.kategoria === k && u.kolo === ko)) stl.push([k, ko]); }));
    const n = (r, k, ko) => U.filter((u) => u.rok === r && u.kategoria === k && u.kolo === ko).length;
    return h("div", { class: "table-wrap" }, h("table", { class: "cov" },
      h("thead", null,
        h("tr", null, h("th", null, ""), P.KATEGORIE.map((k) => h("th", { class: "grp", colspan: stl.filter((s) => s[0] === k).length }, k))),
        h("tr", null, h("th", null, "školský rok"), stl.map(([k, ko], i) => h("th", { class: i && stl[i - 1][0] !== k ? "grp" : null, title: ko + " kolo" }, KS[ko])))),
      h("tbody", null, roky.map((r) => h("tr", null, h("td", null, r), stl.map(([k, ko], i) => {
        const c = n(r, k, ko);
        return h("td", { class: (c ? "ok" : "zero") + (i && stl[i - 1][0] !== k ? " sep" : ""), style: c ? "cursor:pointer" : null,
          title: c ? "Zobraziť v Databáze" : "chýba", onclick: c ? () => P.dbSetFilter({ rok: r, kat: k, kolo: ko }) : null }, c || "–");
      }))))));
  }

  function bars(pairs, onClick) {
    const max = Math.max(1, ...pairs.map((p) => p[2]));
    return h("div", { class: "bars" }, pairs.map(([k, label, v]) => h("div", { class: "bar-row", style: onClick ? "cursor:pointer" : null, onclick: onClick ? () => onClick(k) : null },
      h("span", null, label), h("div", { class: "bar-track" }, h("div", { class: "bar-fill", style: `width:${(100 * v) / max}%` })), h("span", { class: "v" }, v))));
  }

  P.initOverview = function () {
    const U = P.ULOHY, tag = U.filter((u) => u.oblast);
    const cnt = (f) => { const c = {}; U.forEach((u) => [].concat(f(u) ?? []).forEach((k) => (c[k] = (c[k] || 0) + 1))); return c; };
    const cO = cnt((u) => u.oblast), cM = cnt((u) => u.metody);
    document.getElementById("panel-overview").replaceChildren(h("div", { class: "page" },
      h("h2", null, "Prehľad dát"),
      h("p", { class: "lead" }, `${U.length} úloh MO kategórií Z5–Z9 zo skmo.sk (ročníky 2008/09 – 2026/27). D = domáce, O = okresné, K = krajské kolo (len Z9). Kliknutím na číslo otvoríš tieto úlohy v Databáze.`),
      matica(),
      h("ul", { class: "note", style: "margin-top:.8rem" },
        h("li", null, "2008/09 je na skmo.sk len kategória Z5."),
        h("li", null, "2019/20 (COVID): okresné kolo len Z5 a Z9, krajské kolo nebolo."),
        h("li", null, "2026/27: zatiaľ len zadania domáceho kola, riešenia ešte nie sú zverejnené."),
        h("li", null, "Kategórie Z5–Z8 majú domáce a okresné kolo, Z9 aj krajské.")),
      tag.length ? h("div", { class: "grid2", style: "margin-top:1.5rem" },
        h("div", { class: "box" }, h("h3", null, "Oblasti"), bars(Object.entries(P.OBLASTI).map(([k, n]) => [k, n, cO[k] || 0]), (k) => P.dbSetFilter({ oblast: k }))),
        h("div", { class: "box" }, h("h3", null, "Metódy riešenia (počet úloh)"),
          bars(Object.entries(P.METODY).map(([k, m]) => [k, m.n, cM[k] || 0]).sort((a, b) => b[2] - a[2]), (k) => P.dbSetFilter({ metoda: k }))))
        : h("p", { class: "note", style: "margin-top:1rem" }, "Triedenie úloh (oblasť, metóda, náročnosť) sa ešte pripravuje.")));
  };
})();
