/* Záložka „Databáza“: filtre + zoznam úloh + výber do pracovného listu. */
(function () {
  const P = window.MO, h = P.h;
  const PAGE = 30;
  const state = { kat: new Set(), kolo: new Set(), rok: new Set(), oblast: new Set(), metoda: new Set(), nar: new Set(),
    q: "", vRieseniach: false, lenVlastne: false, showRies: false, shown: PAGE };
  const toggle = (s, v) => (s.has(v) ? s.delete(v) : s.add(v));
  const otvorene = new Set();   // úlohy s rozbaleným riešením

  function matches(u, skip) {
    if (skip !== "kat" && state.kat.size && !state.kat.has(u.kategoria)) return false;
    if (skip !== "kolo" && state.kolo.size && !state.kolo.has(u.kolo)) return false;
    if (skip !== "rok" && state.rok.size && !state.rok.has(u.rok)) return false;
    if (skip !== "oblast" && state.oblast.size && !state.oblast.has(u.oblast)) return false;
    if (skip !== "metoda" && state.metoda.size && !(u.metody || []).some((m) => state.metoda.has(m))) return false;
    if (skip !== "nar" && state.nar.size && !state.nar.has(String(u.narocnost))) return false;
    if (state.lenVlastne && !u.vlastna) return false;
    if (state.q) {
      const hay = P.norm((u.text || u.zadanie || "") + " " + (u.zadanie_mat || "") + " " + (u.autor || "") + " " + (u.odpoved || "") + " " + (state.vRieseniach ? (u.rtext || u.riesenie || "") : ""));
      if (!state.q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  }

  let railEl, resultsEl, railOpen = false, current = [];

  const checkRow = (set, id, text, n) => h("label", { class: "check-row" + (set.has(id) ? " on" : "") },
    h("input", { type: "checkbox", checked: set.has(id), onchange: () => { toggle(set, id); render(); } }), h("span", null, text),
    n != null ? h("span", { class: "n" }, n) : null);
  const groupHead = (title, set) => h("h2", { class: set.size ? "on" : null }, h("span", null, title, set.size ? h("span", { class: "cnt" }, set.size) : null),
    set.size ? h("button", { class: "link-btn", type: "button", onclick: () => { set.clear(); render(); } }, "zrušiť") : null);
  const chipGroup = (vals, set, lbl, cls) => h("div", { class: "chips" }, vals.map((v) =>
    h("button", { class: "chip" + (cls ? " " + cls : ""), type: "button", "aria-pressed": set.has(v), onclick: () => { toggle(set, v); render(); } }, lbl ? lbl(v) : v)));

  function aktivne() {
    const out = [], add = (set, lbl) => set.forEach((v) => out.push({ t: lbl(v), x: () => { set.delete(v); render(); } }));
    add(state.kat, (v) => v); add(state.kolo, (v) => v + " kolo"); add(state.rok, (v) => v);
    add(state.oblast, (v) => P.OBLASTI[v]); add(state.metoda, (v) => (P.METODY[v] || {}).n || v); add(state.nar, (v) => P.NAROCNOST[v]);
    if (state.q) out.push({ t: `„${state.q}“`, x: () => { state.q = ""; render(); } });
    if (state.lenVlastne) out.push({ t: "moje úlohy", x: () => { state.lenVlastne = false; render(); } });
    return out;
  }
  function zrusitVsetko() { ["kat", "kolo", "rok", "oblast", "metoda", "nar"].forEach((k) => state[k].clear()); state.q = ""; state.lenVlastne = false; render(); }

  function pocty(skip, key) {
    const c = {};
    P.vsetky().filter((u) => matches(u, skip)).forEach((u) => [].concat(key(u) ?? []).forEach((k) => (c[k] = (c[k] || 0) + 1)));
    return c;
  }

  function renderRail() {
    railEl.classList.toggle("open", railOpen);
    const all = P.vsetky();
    const roky = [...new Set(all.map((u) => u.rok))].sort().reverse();
    const otagovane = all.some((u) => u.oblast);
    const cO = pocty("oblast", (u) => u.oblast), cM = pocty("metoda", (u) => u.metody), cN = pocty("nar", (u) => u.narocnost);
    const nAkt = aktivne().length;
    P.fill(railEl,
      h("button", { class: "btn rail-toggle", type: "button", "aria-expanded": railOpen, onclick: () => { railOpen = !railOpen; renderRail(); } },
        (railOpen ? "▴ Skryť filtre" : "▾ Filtre") + (nAkt ? ` (${nAkt})` : "")),
      h("section", null, h("h2", null, "Hľadať"),
        h("input", { class: "input", type: "search", placeholder: "napr. ciferný súčet, kocka, hodiny…", value: state.q, "aria-label": "Hľadať v úlohách",
          oninput: (e) => { state.q = P.norm(e.target.value.trim()); state.shown = PAGE; renderResults(); } }),
        h("label", { class: "check-row" + (state.vRieseniach ? " on" : ""), style: "margin-top:.3rem" },
          h("input", { type: "checkbox", checked: state.vRieseniach, onchange: (e) => { state.vRieseniach = e.target.checked; render(); } }), h("span", null, "hľadať aj v riešeniach"))),
      h("section", null, groupHead("Kategória", state.kat), chipGroup(P.KATEGORIE, state.kat),
        h("p", { class: "note small", style: "margin:.35rem 0 0" }, "Z5 = 5. ročník … Z9 = 9. ročník (prima = Z6, sekunda = Z7)")),
      h("section", null, groupHead("Kolo", state.kolo), chipGroup(P.KOLA, state.kolo)),
      otagovane ? h("section", null, groupHead("Oblasť", state.oblast), Object.entries(P.OBLASTI).map(([k, n]) => checkRow(state.oblast, k, n, cO[k] || 0))) : null,
      otagovane ? h("section", null, groupHead("Náročnosť", state.nar), Object.entries(P.NAROCNOST).map(([k, n]) => checkRow(state.nar, k, n, cN[k] || 0))) : null,
      otagovane ? h("section", null, groupHead("Metóda riešenia", state.metoda),
        Object.entries(P.METODY).map(([k, m]) => checkRow(state.metoda, k, m.n, cM[k] || 0))) : null,
      h("section", null, groupHead("Školský rok", state.rok), chipGroup(roky, state.rok, null, "sm")),
      h("section", null, h("h2", null, "Ďalšie"),
        h("label", { class: "check-row" + (state.lenVlastne ? " on" : "") }, h("input", { type: "checkbox", checked: state.lenVlastne, onchange: (e) => { state.lenVlastne = e.target.checked; render(); } }), h("span", null, "len moje vlastné úlohy"))),
      otagovane ? null : h("p", { class: "note" }, "Triedenie podľa oblasti, metódy a náročnosti sa ešte pripravuje."));
  }

  function card(u) {
    const sel = P.cart.has(u.id), open = state.showRies || otvorene.has(u.id);
    const meta = h("div", { class: "meta" },
      h("span", { class: "badge cat", title: P.ROCNIK[u.kategoria] || "" }, u.kategoria),
      h("span", { class: "badge" }, u.rok),
      h("span", { class: "badge" }, u.kolo + " kolo"),
      u.cislo != null ? h("span", { class: "badge" }, "úloha " + u.cislo) : null,
      u.vlastna ? h("span", { class: "badge own" }, "moja úloha") : null,
      u.narocnost ? h("span", { class: "badge nar nar" + u.narocnost, title: "náročnosť v rámci kategórie a kola" }, "●".repeat(u.narocnost) + "○".repeat(3 - u.narocnost) + " " + P.NAROCNOST[u.narocnost]) : null,
      u.autor ? h("span", { class: "badge autor" }, u.autor) : null);
    const foot = h("div", { class: "foot" },
      u.oblast ? h("span", { class: "tag" }, P.OBLASTI[u.oblast]) : null,
      (u.metody || []).map((m) => h("button", { class: "tag trik-tag", type: "button", title: ((P.METODY[m] || {}).s || "") + " – klikni pre všetky úlohy s touto metódou",
        onclick: () => P.dbSetFilter({ metoda: m }) }, (P.METODY[m] || {}).n || m)),
      h("span", { class: "src" }, P.pdfOdkazy(u).flatMap((o, i) => [i ? " · " : "", h("a", { href: o.href, target: "_blank", rel: "noopener" }, o.text + " ↗")])));
    const riesBtn = h("button", { class: "btn sm ries-btn", type: "button", "aria-expanded": open,
      onclick: () => { otvorene.has(u.id) ? otvorene.delete(u.id) : otvorene.add(u.id); const c = card(u); document.querySelector(`.card[data-id="${CSS.escape(u.id)}"]`).replaceWith(c); } },
      open ? "▴ Skryť riešenie" : "▾ Ukázať riešenie");
    const kids = [meta, P.zadanieNode(u), foot,
      u.odpoved && open ? h("div", { class: "answer" }, h("span", null, "Výsledok: ", h("b", null, u.odpoved))) : null,
      h("div", { class: "row", style: "margin-top:.5rem" }, riesBtn),
      open ? h("div", { class: "ries-box" }, P.riesenieNode(u)) : null];
    const cb = h("input", { type: "checkbox", checked: sel, "aria-label": "Pridať do pracovného listu",
      onchange: (e) => { P.cart.toggle(u.id); e.target.closest(".card").classList.toggle("selected", P.cart.has(u.id)); syncSelectAll(); } });
    return h("article", { class: "card" + (sel ? " selected" : ""), "data-id": u.id }, h("div", null, cb), h("div", { class: "card-body" }, kids));
  }

  function syncSelectAll() {
    const cb = document.getElementById("select-all"); if (!cb) return;
    const n = current.filter((u) => P.cart.has(u.id)).length;
    cb.checked = current.length > 0 && n === current.length; cb.indeterminate = n > 0 && n < current.length;
    const l = cb.parentElement.querySelector(".sel-n"); if (l) l.textContent = n ? `(v liste ${n})` : "";
  }

  function renderResults() {
    current = P.vsetky().filter((u) => matches(u)).sort(P.zoradit);
    const list = current.slice(0, state.shown), vyb = current.filter((u) => P.cart.has(u.id)).length;
    const all = h("input", { type: "checkbox", id: "select-all", checked: current.length > 0 && vyb === current.length, disabled: !current.length,
      onchange: (e) => { const ids = current.map((u) => u.id); e.target.checked ? P.cart.addMany(ids) : P.cart.removeMany(ids); renderResults(); } });
    all.indeterminate = vyb > 0 && vyb < current.length;
    const akt = aktivne();
    P.fill(resultsEl,
      h("div", { class: "active-filters" + (akt.length ? "" : " none") },
        h("span", { class: "af-lbl" }, akt.length ? "Aktívne filtre:" : "Bez filtra – zobrazené sú všetky úlohy."),
        akt.map((f) => h("button", { class: "af-chip", type: "button", title: "Zrušiť tento filter", onclick: f.x }, f.t, h("span", { class: "x", "aria-hidden": "true" }, "✕"))),
        akt.length > 1 ? h("button", { class: "link-btn", type: "button", onclick: zrusitVsetko }, "zrušiť všetky") : null),
      h("div", { class: "toolbar" },
        h("label", { class: "select-all", title: "Pridať (alebo odobrať) všetky zobrazené úlohy do pracovného listu" }, all,
          h("span", null, `vybrať všetkých ${current.length}`), h("span", { class: "sel-n" }, vyb ? `(v liste ${vyb})` : "")),
        h("span", { class: "total", id: "total" }, `${current.length} úloh`),
        h("label", null, h("input", { type: "checkbox", id: "show-ries", checked: state.showRies, onchange: (e) => { state.showRies = e.target.checked; otvorene.clear(); renderResults(); } }), "rozbaliť všetky riešenia"),
        h("span", { class: "sp" })),
      list.length ? list.map(card) : h("div", { class: "empty" }, "Žiadna úloha nezodpovedá filtrom."),
      current.length > list.length ? h("button", { class: "btn more", type: "button", id: "more", onclick: () => { state.shown += PAGE; renderResults(); } },
        `Zobraziť ďalších ${Math.min(PAGE, current.length - list.length)} (zostáva ${current.length - list.length})`) : null);
  }

  function renderCartBar() {
    const n = P.cart.ids.length;
    let bar = document.getElementById("cartbar");
    if (!bar) { bar = h("div", { class: "cartbar no-print", id: "cartbar" }); document.body.append(bar); }
    bar.hidden = n === 0;
    bar.replaceChildren(h("span", null, h("b", { id: "cart-count" }, n), " úloh v pracovnom liste"),
      h("button", { class: "btn ghost", type: "button", onclick: () => { P.cart.clear(); renderResults(); } }, "Vyprázdniť"),
      h("button", { class: "btn primary", type: "button", id: "open-sheet", onclick: () => P.showTab("sheet") }, "Pracovný list →"));
  }

  function render() { state.shown = PAGE; renderRail(); renderResults(); }

  P.dbSetFilter = function (f) {
    zrusitVsetko();
    if (f.metoda) state.metoda.add(f.metoda);
    if (f.oblast) state.oblast.add(f.oblast);
    if (f.kat) state.kat.add(f.kat);
    if (f.rok) state.rok.add(f.rok);
    if (f.kolo) state.kolo.add(f.kolo);
    render(); P.showTab("db");
  };

  P.initDb = function () {
    railEl = h("aside", { class: "rail no-print", "aria-label": "Filtre" });
    resultsEl = h("main", { class: "results" });
    document.getElementById("panel-db").replaceChildren(h("div", { class: "db-layout" }, railEl, resultsEl));
    render(); renderCartBar();
    P.on("cart", () => { renderCartBar(); document.querySelectorAll("#panel-db .card").forEach((c) => {
      const s = P.cart.has(c.dataset.id); c.classList.toggle("selected", s); const cb = c.querySelector("input[type=checkbox]"); if (cb) cb.checked = s; }); syncSelectAll(); });
    P.on("data", render);
  };
})();
