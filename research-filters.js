/* Research filters enhance the complete, statically rendered publication list. */
(() => {
  const init = () => {
    const filters = document.getElementById("research-filters");
    if (!filters) return;
    const input = document.getElementById("research-query");
    const clear = document.getElementById("research-clear");
    const status = document.getElementById("research-results-count");
    const empty = document.getElementById("research-no-results");
    const normalize = text => text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    const controls = [...filters.querySelectorAll(".research-tag")];
    const knownTags = new Set(controls.map(button => button.dataset.researchTag));
    const entries = [...document.querySelectorAll(".publication")].map(element => {
      const panelId = element.querySelector(".abstract-toggle")?.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      const section = element.closest("section.level2");
      return {
        element, panel, section,
        tags: new Set(element.dataset.researchTags.split(/\s+/).filter(Boolean)),
        text: normalize(`${element.textContent} ${panel?.textContent || ""} ${section?.querySelector("h2")?.textContent || ""}`)
      };
    });
    const sections = [...new Set(entries.map(entry => entry.section))].filter(Boolean);
    const software = document.getElementById("software");
    let selected = new Set();

    function readURL() {
      const params = new URL(location.href).searchParams;
      selected = new Set((params.get("topics") || "").split(",").filter(tag => knownTags.has(tag)));
      input.value = params.get("research-query") || "";
    }

    function writeURL(push = false) {
      const url = new URL(location.href);
      if (selected.size) url.searchParams.set("topics", [...selected].join(","));
      else url.searchParams.delete("topics");
      if (input.value.trim()) url.searchParams.set("research-query", input.value.trim());
      else url.searchParams.delete("research-query");
      if (url.href !== location.href) history[push ? "pushState" : "replaceState"](null, "", url);
    }

    function update() {
      const words = normalize(input.value).split(/\s+/).filter(Boolean);
      const active = selected.size > 0 || words.length > 0;
      const textMatches = entry => words.every(word => entry.text.includes(word));
      const matches = entry => textMatches(entry) && [...selected].every(tag => entry.tags.has(tag));
      let count = 0;
      for (const entry of entries) {
        const visible = matches(entry);
        entry.element.hidden = !visible;
        if (entry.panel) entry.panel.hidden = !visible;
        if (visible) count++;
      }
      for (const section of sections) {
        section.hidden = !entries.some(entry => entry.section === section && !entry.element.hidden);
      }
      if (software) software.hidden = active;
      for (const link of document.querySelectorAll('#TOC a[data-scroll-target]')) {
        const section = document.querySelector(link.dataset.scrollTarget);
        if (section) link.closest("li").hidden = section.hidden;
      }
      for (const button of controls) {
        const tag = button.dataset.researchTag;
        const pressed = selected.has(tag);
        const matching = entries.filter(entry => matches(entry) && entry.tags.has(tag)).length;
        button.setAttribute("aria-pressed", String(pressed));
        button.disabled = !pressed && matching === 0;
        button.querySelector(".tag-count").textContent = matching;
        button.setAttribute("aria-label", `${button.querySelector("span").textContent}, ${matching} ${matching === 1 ? "paper" : "papers"}`);
      }
      for (const button of document.querySelectorAll(".paper-tag")) {
        button.setAttribute("aria-pressed", String(selected.has(button.dataset.researchTag)));
      }
      status.textContent = active ? `Showing ${count} of ${entries.length} papers` : `${entries.length} papers`;
      clear.hidden = !active;
      empty.hidden = count > 0;
    }

    function reset() {
      selected.clear();
      input.value = "";
      update();
    }

    function clearAnchor() {
      if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    }

    // Existing paper, year, and software anchors always reveal their destination.
    function revealHash() {
      if (!location.hash) return;
      let id;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target || !target.closest("[hidden]")) return;
      reset();
      writeURL();
      requestAnimationFrame(() => target.scrollIntoView());
    }

    filters.addEventListener("click", event => {
      const button = event.target.closest(".research-tag");
      if (!button) return;
      const tag = button.dataset.researchTag;
      if (selected.has(tag)) selected.delete(tag);
      else selected.add(tag);
      // A filter state describes a result list, rather than a single old anchor.
      clearAnchor();
      update();
      writeURL(true);
    });
    input.addEventListener("input", () => { clearAnchor(); update(); writeURL(); });
    input.addEventListener("keydown", event => {
      if (event.key === "Escape") { reset(); writeURL(); }
      if (event.key === "Enter") event.preventDefault();
    });
    clear.addEventListener("click", () => { reset(); writeURL(true); input.focus({preventScroll: true}); });
    for (const button of document.querySelectorAll(".paper-tag")) {
      button.addEventListener("click", () => {
        const tag = button.dataset.researchTag;
        selected = selected.size === 1 && selected.has(tag) ? new Set() : new Set([tag]);
        input.value = "";
        clearAnchor();
        update();
        writeURL(true);
        filters.querySelector(`[data-research-tag="${button.dataset.researchTag}"]`).focus({preventScroll: true});
        filters.scrollIntoView();
      });
    }
    window.addEventListener("popstate", () => { readURL(); update(); revealHash(); });
    window.addEventListener("hashchange", revealHash);
    readURL();
    update();
    filters.hidden = false;
    for (const tags of document.querySelectorAll(".publication-tags")) tags.hidden = false;
    revealHash();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
