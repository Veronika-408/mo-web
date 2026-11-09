/* Záložka „Pracovný list“: poradie úloh, možnosti, náhľad, tlač, uložené listy. */
(function () {
  const P = window.MO, h = P.h;
  const SPACE = { none: 0, s: 3, m: 7, l: 14 }; // rem – MO úlohy potrebujú viac miesta na postup
  const defaults = { nazov: "Matematická olympiáda – príprava", podnazov: "", polia: true, zdroj: true, miesto: "m", riesenia: "none", novaStrana: true, vysledok: true };
  let opts = Object.assign({}, defaults, P.store.getPrefs().sheet || {});
  const saveOpts = () => P.store.savePrefs(Object.assign({}, P.store.getPrefs(), { sheet: opts }));
  let controlsEl, previewEl;

  function sheetNode(items) {
    const len = document.body.dataset.print === "solutions";
    const head = h("div", { class: "sheet-head" }, h("h1", null, opts.nazov || "Pracovný list"),
      opts.podnazov ? h("div", { class: "sub" }, opts.podnazov) : null,
      opts.polia && !len ? h("div", { class: "fields" }, h("div", null, "Meno"), h("div", null, "Trieda"), h("div", null, "Dátum")) : null);
    const wrap = h("div", { class: "sheet" });
    if (!len) wrap.append(h("div", { class: "sheet-tasks" }, head, items.map((u, i) =>
      h("div", { class: "problem" },
        h("div", { class: "ph" }, h("span", { class: "no" }, (i + 1) + "."), h("div", { class: "txt" }, P.zadanieNode(u))),
        opts.zdroj ? h("div", { class: "src-line" }, P.popis(u)) : null,
        opts.miesto === "none" ? null : h("div", { class: "space", style: `height:${SPACE[opts.miesto]}rem` })))));
    if (opts.riesenia !== "none" || len) {
      wrap.append(h("div", { class: "sol-sec" + (opts.novaStrana && !len ? " newpage" : "") },
        h("h2", null, "Riešenia – " + (opts.nazov || "pracovný list")),
        items.map((u, i) => h("div", { class: "sol-item" },
          h("div", { class: "sol-h" }, h("span", { class: "no" }, (i + 1) + "."), h("span", { class: "src-line" }, P.popis(u))),
          opts.vysledok && u.odpoved ? h("div", { class: "answer" }, "Výsledok: ", h("b", null, u.odpoved)) : null,
          (opts.riesenia === "cele" || len) ? P.riesenieNode(u) : (u.odpoved ? null : h("p", { class: "note" }, "výsledok pozri v celom riešení"))))));
    }
    return wrap;
  }

  function printMode(mode) {
    if (mode) document.body.dataset.print = mode; else delete document.body.dataset.print;
    renderPreview();
    // obrázky sa načítavajú „lazy“ – pred tlačou ich treba načítať všetky
    const imgs = [...previewEl.querySelectorAll("img")];
    imgs.forEach((i) => (i.loading = "eager"));
    Promise.all(imgs.map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))).then(() => window.print());
  }
  window.addEventListener("afterprint", () => { if (document.body.dataset.print) { delete document.body.dataset.print; renderPreview(); } });

  function renderPreview() {
    const items = P.cart.items();
    previewEl.replaceChildren(items.length ? sheetNode(items)
      : h("div", { class: "empty" }, "Zatiaľ nie sú vybraté žiadne úlohy. V záložke Databáza zaškrtni úlohy, ktoré chceš dať na list."));
  }
  const field = (l, i) => h("div", { class: "field" }, h("label", null, l), i);
  const checkbox = (l, k, id) => h("label", { class: "check-row" }, h("input", { type: "checkbox", id, checked: !!opts[k], onchange: (e) => { opts[k] = e.target.checked; saveOpts(); renderPreview(); renderControls(); } }), h("span", null, l));
  const radio = (name, val, l, k) => h("label", null, h("input", { type: "radio", name, value: val, checked: opts[k] === val, onchange: () => { opts[k] = val; saveOpts(); renderPreview(); renderControls(); } }), h("span", null, l));

  function renderControls() {
    const items = P.cart.items();
    controlsEl.replaceChildren(
      h("div", { class: "box" }, h("h3", null, `Úlohy na liste (${items.length})`),
        items.length ? h("ol", { class: "cart-list" }, items.map((u, i) => h("li", null,
          h("span", { class: "m" }, (i + 1) + "."),
          h("span", { class: "t", title: u.text || u.zadanie }, `${u.kategoria || ""} ${P.rokKratko(u.rok)} ${(u.kolo || "").slice(0, 3)}. ${u.cislo ?? ""} – ${(u.text || u.zadanie || "").replace(/^\d+\.?\s*/, "")}`),
          h("span", null,
            h("button", { class: "mini", type: "button", "aria-label": "Posunúť vyššie", onclick: () => P.cart.move(u.id, -1) }, "↑"),
            h("button", { class: "mini", type: "button", "aria-label": "Posunúť nižšie", onclick: () => P.cart.move(u.id, 1) }, "↓"),
            h("button", { class: "mini", type: "button", "aria-label": "Odstrániť z listu", onclick: () => P.cart.remove(u.id) }, "✕"))))) : h("p", { class: "note" }, "Prázdne."),
        h("div", { class: "row", style: "margin-top:.7rem" },
          h("button", { class: "btn", type: "button", disabled: items.length < 2, onclick: () => { P.cart.ids.sort(() => Math.random() - .5); P.cart._save(); } }, "Premiešať"),
          h("button", { class: "btn danger", type: "button", disabled: !items.length, onclick: () => P.cart.clear() }, "Vyprázdniť"))),
      h("div", { class: "box" }, h("h3", null, "Vzhľad listu"),
        field("Nadpis", h("input", { class: "input", id: "opt-nazov", value: opts.nazov, oninput: (e) => { opts.nazov = e.target.value; saveOpts(); renderPreview(); } })),
        field("Podnadpis (voliteľný)", h("input", { class: "input", value: opts.podnazov, placeholder: "napr. Sekunda · príprava na okresné kolo", oninput: (e) => { opts.podnazov = e.target.value; saveOpts(); renderPreview(); } })),
        checkbox("riadok Meno / Trieda / Dátum", "polia"),
        checkbox("pri úlohe uviesť zdroj (kategória, rok, kolo)", "zdroj"),
        h("div", { class: "field", style: "margin-top:.6rem" }, h("label", null, "Miesto na riešenie"),
          h("div", { class: "seg" }, radio("miesto", "none", "žiadne", "miesto"), radio("miesto", "s", "malé", "miesto"), radio("miesto", "m", "stredné", "miesto"), radio("miesto", "l", "veľké (pol strany)", "miesto"))),
        h("p", { class: "note" }, "Zadania sú výrezy z originálnych PDF (pôvodné písmo, obrázky aj vzorce); číslovanie je nové podľa listu.")),
      h("div", { class: "box" }, h("h3", null, "Riešenia"),
        h("div", { class: "seg" }, radio("riesenia", "none", "bez riešení na liste", "riesenia"),
          radio("riesenia", "vysledky", "na konci len výsledky", "riesenia"), radio("riesenia", "cele", "na konci celé riešenia", "riesenia")),
        opts.riesenia !== "none" ? checkbox("riešenia na novej strane (dá sa odtrhnúť)", "novaStrana") : null,
        h("p", { class: "note", style: "margin-top:.5rem" }, "„Tlačiť len riešenia“ vytlačí celé riešenia pre teba – žiakom dáš len list.")),
      h("div", { class: "box" }, h("div", { class: "row" },
        h("button", { class: "btn primary", type: "button", id: "print-sheet", disabled: !items.length, onclick: () => printMode(null) }, "Tlačiť list"),
        h("button", { class: "btn", type: "button", id: "print-sol", disabled: !items.length, onclick: () => printMode("solutions") }, "Tlačiť len riešenia")),
        h("p", { class: "note" }, "V tlačovom okne vyber „Uložiť ako PDF“, ak chceš súbor.")),
      savedBox(items));
  }

  function savedBox(items) {
    const saved = P.store.getSheets(); let inp;
    return h("div", { class: "box" }, h("h3", null, "Uložené listy"),
      h("div", { class: "row" }, inp = h("input", { class: "input", id: "save-name", style: "flex:1", placeholder: "názov uloženého listu", value: opts.nazov }),
        h("button", { class: "btn", type: "button", id: "save-sheet", disabled: !items.length, onclick: () => {
          const name = (inp.value || opts.nazov || "List").trim();
          const l = P.store.getSheets().filter((s) => s.nazov !== name);
          l.unshift({ id: "L-" + Date.now(), nazov: name, ids: P.cart.ids.slice(), opts: Object.assign({}, opts), ts: Date.now() });
          P.store.saveSheets(l); renderControls(); } }, "Uložiť")),
      saved.length ? h("ul", { class: "saved-list", style: "margin-top:.6rem" }, saved.map((s) => h("li", null,
        h("span", { class: "nm", title: s.nazov }, `${s.nazov} (${s.ids.length})`),
        h("button", { class: "btn", type: "button", onclick: () => { P.cart.ids = s.ids.slice(); opts = Object.assign({}, defaults, s.opts); saveOpts(); P.cart._save(); } }, "Otvoriť"),
        h("button", { class: "mini", type: "button", "aria-label": "Zmazať uložený list", onclick: () => { P.store.saveSheets(P.store.getSheets().filter((x) => x.id !== s.id)); renderControls(); } }, "✕"))))
        : h("p", { class: "note", style: "margin-top:.5rem" }, "Zatiaľ žiadne."));
  }

  P.initSheet = function () {
    controlsEl = h("div", { class: "controls no-print" });
    previewEl = h("div", { class: "sheet-wrap", id: "sheet-preview" });
    document.getElementById("panel-sheet").replaceChildren(h("div", { class: "sheet-layout" }, controlsEl, previewEl));
    renderControls(); renderPreview();
    P.on("cart", () => { renderControls(); renderPreview(); });
    P.on("data", () => { renderControls(); renderPreview(); });
  };
})();
