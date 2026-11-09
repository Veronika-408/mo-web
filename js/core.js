/* Spoločné veci: úložisko, slovníky, pomocné funkcie, košík. */
(function () {
  const P = (window.MO = window.MO || {});

  // ---- úložisko (localStorage, kľúče mo.v1.*) – všetko v try/catch ----
  const PREFIX = "mo.v1.";
  let memoryOnly = false;
  const read = (k, f) => { try { const r = localStorage.getItem(PREFIX + k); return r == null ? f : JSON.parse(r); } catch (e) { memoryOnly = true; return f; } };
  const write = (k, v) => { try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); return true; } catch (e) { memoryOnly = true; return false; } };
  P.store = {
    read, write, isMemoryOnly: () => memoryOnly,
    getCustom: () => read("custom", []), saveCustom: (l) => write("custom", l),
    getCart: () => read("cart", []), saveCart: (ids) => write("cart", ids),
    getSheets: () => read("sheets", []), saveSheets: (l) => write("sheets", l),
    getPrefs: () => read("prefs", {}), savePrefs: (p) => write("prefs", p),
  };

  // ---- slovníky ----
  P.KATEGORIE = ["Z5", "Z6", "Z7", "Z8", "Z9"];
  P.KOLA = ["domáce", "okresné", "krajské"];
  P.ROCNIK = { Z5: "5. ročník", Z6: "6. ročník / prima", Z7: "7. ročník / sekunda", Z8: "8. ročník / tercia", Z9: "9. ročník / kvarta" };
  // oblasti ako v Krajčiho archíve MO
  P.OBLASTI = { A: "Algebra a čísla vo výpočtoch", N: "Teória čísel (deliteľnosť, cifry)", C: "Kombinatorika a logika", G: "Geometria" };
  P.NAROCNOST = { 1: "ľahká", 2: "stredná", 3: "náročná" };

  P.norm = (s) => (s || "").toLocaleLowerCase("sk").normalize("NFD").replace(/[̀-ͯ]/g, "");

  // DOM bez innerHTML
  P.h = function (tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (k.startsWith("aria-")) { el.setAttribute(k, String(v ?? false)); continue; }
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (k === "checked" || k === "disabled" || k === "selected" || k === "value") el[k] = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) { if (kid == null || kid === false) continue; el.append(kid.nodeType ? kid : document.createTextNode(String(kid))); }
    return el;
  };
  P.fill = (el, ...kids) => el.replaceChildren(...kids.flat().filter((k) => k != null && k !== false));
  P.rokKratko = (r) => (/^\d{4}\/\d{4}$/.test(r || "") ? r.slice(2, 4) + "/" + r.slice(7) : r || "");
  P.popis = (u) => u.vlastna ? `vlastná úloha${u.zdroj ? " · " + u.zdroj : ""}` : `MO ${u.kategoria} · ${u.rok} · ${u.kolo} kolo · úloha ${u.cislo}`;

  // obrázky: zadanie / riešenie ako výrezy z originálneho PDF
  P.obrNode = (srcs, cls, alt) => (srcs && srcs.length)
    ? P.h("div", { class: "vyrez " + (cls || "") }, srcs.map((src) => P.h("img", { src, alt, loading: "lazy" }))) : null;
  P.zadanieNode = (u) => u.vlastna
    ? P.h("div", { class: "zadanie" }, P.zadanieText(u))
    : (P.obrNode(u.zo, "z", "Zadanie úlohy " + u.id) || P.h("div", { class: "zadanie" }, u.text));
  P.riesenieNode = (u) => u.vlastna
    ? (u.riesenie ? P.h("div", { class: "zadanie" }, u.riesenie) : P.h("p", { class: "note" }, "Riešenie nie je zadané."))
    : (P.obrNode(u.ro, "r", "Riešenie úlohy " + u.id) || P.h("p", { class: "note warn" }, u.rchyba ? "Riešenie chýba: " + u.rchyba + "." : "Riešenie zatiaľ nie je zverejnené."));
  P.pdfOdkazy = (u) => u.vlastna ? [] : [
    { href: u.pdf, text: "PDF zadania (skmo.sk)" },
    u.rpdf ? { href: u.rpdf, text: "PDF riešenia (skmo.sk)" } : null,
    u.url ? { href: u.url, text: "skmo.sk" } : null,
  ].filter(Boolean);

  P.vlastne = () => P.store.getCustom().map((u) => Object.assign({}, u, { vlastna: true }));
  P.vsetky = () => P.ULOHY.concat(P.vlastne());

  const KP = { "domáce": 0, "okresné": 1, "krajské": 2 };
  P.zoradit = (a, b) => (a.rok < b.rok ? 1 : a.rok > b.rok ? -1 : 0) ||
    (a.kategoria < b.kategoria ? -1 : a.kategoria > b.kategoria ? 1 : 0) ||
    (KP[a.kolo] ?? 9) - (KP[b.kolo] ?? 9) || (a.cislo || 0) - (b.cislo || 0);

  const listeners = {};
  P.on = (ev, fn) => ((listeners[ev] = listeners[ev] || []).push(fn));
  P.emit = (ev, d) => (listeners[ev] || []).forEach((fn) => fn(d));

  P.cart = {
    ids: P.store.getCart(),
    has: (id) => P.cart.ids.includes(id),
    add(id) { if (!P.cart.has(id)) { P.cart.ids.push(id); P.cart._save(); } },
    remove(id) { P.cart.ids = P.cart.ids.filter((x) => x !== id); P.cart._save(); },
    addMany(ids) { const s = new Set(P.cart.ids); ids.forEach((id) => { if (!s.has(id)) { s.add(id); P.cart.ids.push(id); } }); P.cart._save(); },
    removeMany(ids) { const s = new Set(ids); P.cart.ids = P.cart.ids.filter((x) => !s.has(x)); P.cart._save(); },
    toggle(id) { P.cart.has(id) ? P.cart.remove(id) : P.cart.add(id); },
    clear() { P.cart.ids = []; P.cart._save(); },
    move(id, d) { const i = P.cart.ids.indexOf(id), j = i + d; if (i < 0 || j < 0 || j >= P.cart.ids.length) return; [P.cart.ids[i], P.cart.ids[j]] = [P.cart.ids[j], P.cart.ids[i]]; P.cart._save(); },
    _save() { P.store.saveCart(P.cart.ids); P.emit("cart"); },
    items() { const m = new Map(P.vsetky().map((u) => [u.id, u])); return P.cart.ids.map((id) => m.get(id)).filter(Boolean); },
  };
})();
