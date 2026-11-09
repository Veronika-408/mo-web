/* Záložky, vzhľad (svetlý/tmavý), spustenie. Ďalšie záložky cez MO.registerTab() (skripty načítané PO main.js). */
(function () {
  const P = window.MO, h = P.h;
  const TABS = [
    { id: "db", label: "Databáza", init: () => P.initDb() },
    { id: "sheet", label: "Pracovný list", init: () => P.initSheet(), badge: () => P.cart.ids.length },
    { id: "custom", label: "Moje úlohy", init: () => P.initCustom() },
    { id: "overview", label: "Prehľad dát", init: () => P.initOverview() },
  ];
  P.registerTab = (t) => TABS.push(t);

  P.showTab = function (id) {
    document.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === id));
    document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + id));
    const bar = document.getElementById("cartbar"); if (bar) bar.style.display = id === "db" ? "" : "none";
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
    window.scrollTo(0, 0);
  };

  function applyTheme(mode) {
    const r = document.documentElement;
    if (mode === "light" || mode === "dark") r.setAttribute("data-theme", mode); else r.removeAttribute("data-theme");
    P.store.savePrefs(Object.assign({}, P.store.getPrefs(), { theme: mode || "system" }));
  }

  function start() {
    const nav = document.getElementById("tabs"), panels = document.getElementById("panels");
    TABS.forEach((t) => {
      nav.append(h("button", { class: "tab", type: "button", role: "tab", "data-tab": t.id, "aria-selected": "false", onclick: () => P.showTab(t.id) },
        t.label, t.badge ? h("span", { class: "pill", "data-badge": t.id }, "0") : null));
      panels.append(h("section", { class: "panel", id: "panel-" + t.id, role: "tabpanel" }));
    });
    TABS.forEach((t) => t.init());
    const upd = () => TABS.forEach((t) => { if (t.badge) { const el = document.querySelector(`[data-badge="${t.id}"]`); const n = t.badge(); el.textContent = n; el.hidden = !n; } });
    P.on("cart", upd); upd();
    // predvolene svetlý vzhľad; tmavý len po kliknutí
    applyTheme(P.store.getPrefs().theme === "dark" ? "dark" : "light");
    document.getElementById("theme-btn").addEventListener("click", () => {
      applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
    const hash = location.hash.slice(1);
    P.showTab(TABS.some((t) => t.id === hash) ? hash : "db");
    document.getElementById("total-count").textContent = P.ULOHY.length + " úloh";
  }
  document.addEventListener("DOMContentLoaded", () => setTimeout(start, 0));
})();
