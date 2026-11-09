/* Záložka „Moje úlohy“: pridávanie, úprava, mazanie, export/import. Ukladá sa do prehliadača (mo.v1.custom). */
(function () {
  const P = window.MO, h = P.h;
  let formEl, listEl, editing = null;
  const emptyDraft = () => ({ zadanie: "", riesenie: "", odpoved: "", kategoria: "Z6", kolo: "domáce", rok: "", oblast: "", zdroj: "" });
  let draft = emptyDraft();

  const sel = (key, values, label) => h("select", { class: "input", id: "f-" + key, onchange: (e) => (draft[key] = e.target.value) },
    values.map((v) => h("option", { value: v, selected: v === draft[key] }, label ? label(v) : v)));
  const inp = (key, ph) => h("input", { class: "input", id: "f-" + key, value: draft[key], placeholder: ph || "", oninput: (e) => (draft[key] = e.target.value) });
  const area = (key) => h("textarea", { class: "input", id: "f-" + key, oninput: (e) => (draft[key] = e.target.value) }, draft[key]);
  const field = (l, el) => h("div", { class: "field" }, h("label", null, l), el);

  function renderForm() {
    formEl.replaceChildren(h("div", { class: "box" },
      h("h3", null, editing ? "Upraviť úlohu" : "Pridať vlastnú úlohu"),
      field("Zadanie *", area("zadanie")),
      h("p", { class: "note small", style: "margin:-.4rem 0 .6rem" }, "Zlomok napíš ako $\\frac{1}{3}$, mocninu $x^{2}$ – zobrazí sa ako matematika."),
      field("Riešenie (postup)", area("riesenie")),
      field("Výsledok (krátko)", inp("odpoved", "napr. 84 strán")),
      h("div", { class: "row" },
        h("div", { class: "field", style: "flex:1" }, h("label", null, "Kategória"), sel("kategoria", P.KATEGORIE)),
        h("div", { class: "field", style: "flex:1" }, h("label", null, "Kolo"), sel("kolo", P.KOLA.concat(["iné"]))),
        h("div", { class: "field", style: "flex:1" }, h("label", null, "Oblasť"), sel("oblast", [""].concat(Object.keys(P.OBLASTI)), (k) => k ? P.OBLASTI[k] : "—"))),
      field("Školský rok (voliteľné)", inp("rok", "2025/2026")),
      field("Zdroj (voliteľné)", inp("zdroj", "napr. Náboj 2023, vlastná")),
      h("div", { class: "row" },
        h("button", { class: "btn primary", type: "button", id: "f-save", onclick: save }, editing ? "Uložiť zmeny" : "Pridať úlohu"),
        editing ? h("button", { class: "btn", type: "button", onclick: () => { editing = null; draft = emptyDraft(); renderForm(); } }, "Zrušiť úpravu") : null),
      h("p", { class: "note", id: "f-msg", role: "status" })));
  }
  function msg(t, bad) { const m = document.getElementById("f-msg"); if (m) { m.textContent = t; m.style.color = bad ? "var(--bad)" : "var(--good)"; } }

  function save() {
    if (!draft.zadanie.trim()) return msg("Zadanie nesmie byť prázdne.", true);
    const list = P.store.getCustom();
    const rec = { zadanie: draft.zadanie.trim(), riesenie: draft.riesenie.trim() || null, odpoved: draft.odpoved.trim() || null, kategoria: draft.kategoria, kolo: draft.kolo,
      oblast: draft.oblast || null, rok: draft.rok.trim() || "vlastné", zdroj: draft.zdroj.trim() || null };
    rec.zadanie_mat = /\$/.test(rec.zadanie) ? rec.zadanie : null;
    if (editing) { const i = list.findIndex((x) => x.id === editing); if (i >= 0) list[i] = Object.assign({}, list[i], rec); }
    else list.push(Object.assign({ id: "V-" + Date.now(), vlastna: true, pridane: new Date().toISOString().slice(0, 10) }, rec));
    if (!P.store.saveCustom(list)) return msg("Úložisko prehliadača je zablokované – úloha sa neuložila trvalo.", true);
    const bol = !!editing; editing = null; draft = emptyDraft(); renderForm(); renderList(); P.emit("data");
    msg(bol ? "Zmeny uložené." : "Úloha pridaná – nájdeš ju v Databáze (filter „len moje vlastné úlohy“).");
  }

  function renderList() {
    const list = P.store.getCustom();
    listEl.replaceChildren(h("div", { class: "box" }, h("h3", null, `Moje úlohy (${list.length})`),
      list.length ? list.map((u) => h("div", { class: "card", style: "box-shadow:none" }, h("span"), h("div", null,
        h("div", { class: "meta" }, h("span", { class: "badge cat" }, u.kategoria), h("span", { class: "badge" }, u.rok), h("span", { class: "badge" }, u.kolo)),
        h("div", { class: "zadanie" }, P.zadanieText(u)),
        u.odpoved ? h("div", { class: "answer" }, "Výsledok: ", h("b", null, u.odpoved)) : null,
        h("div", { class: "row", style: "margin-top:.5rem" },
          h("button", { class: "btn", type: "button", onclick: () => { editing = u.id; draft = Object.assign(emptyDraft(), u, { riesenie: u.riesenie || "", odpoved: u.odpoved || "", oblast: u.oblast || "", zdroj: u.zdroj || "" }); renderForm(); window.scrollTo(0, 0); } }, "Upraviť"),
          h("button", { class: "btn", type: "button", onclick: () => P.cart.add(u.id) }, "Do listu"),
          h("button", { class: "btn danger", type: "button", onclick: () => { if (confirm("Zmazať túto úlohu?")) { P.store.saveCustom(P.store.getCustom().filter((x) => x.id !== u.id)); P.cart.remove(u.id); renderList(); P.emit("data"); } } }, "Zmazať")))))
        : h("p", { class: "note" }, "Zatiaľ nemáš žiadne vlastné úlohy."),
      h("div", { class: "row", style: "margin-top:1rem" },
        h("button", { class: "btn", type: "button", disabled: !list.length, onclick: exportJson }, "Exportovať (záloha .json)"),
        h("label", { class: "btn", style: "cursor:pointer" }, "Importovať zálohu", h("input", { type: "file", accept: "application/json,.json", hidden: true, onchange: importJson }))),
      h("p", { class: "note", style: "margin-top:.5rem" }, "Úlohy sú uložené v tomto prehliadači na tomto počítači. Občas si stiahni zálohu.")));
  }
  function exportJson() {
    const a = h("a", { href: URL.createObjectURL(new Blob([JSON.stringify(P.store.getCustom(), null, 2)], { type: "application/json" })), download: `mo-moje-ulohy-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a); a.click(); a.remove();
  }
  function importJson(e) {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => {
      const data = JSON.parse(t); if (!Array.isArray(data)) throw new Error("očakávam zoznam úloh");
      const cur = P.store.getCustom(), ids = new Set(cur.map((x) => x.id));
      const add = data.filter((x) => x && x.zadanie && !ids.has(x.id));
      P.store.saveCustom(cur.concat(add)); renderList(); P.emit("data"); msg(`Importovaných ${add.length} úloh.`);
    }).catch((err) => msg("Import sa nepodaril: " + err.message, true)).finally(() => (e.target.value = ""));
  }

  P.initCustom = function () {
    formEl = h("div"); listEl = h("div");
    document.getElementById("panel-custom").replaceChildren(h("div", { class: "page" }, h("h2", null, "Moje úlohy"),
      h("p", { class: "lead" }, "Pridaj si vlastné úlohy. Ostanú uložené, objavia sa v Databáze a môžeš ich dať do pracovného listu."),
      h("div", { class: "grid2" }, formEl, listEl)));
    renderForm(); renderList();
  };
})();
