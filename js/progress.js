/* ==========================================================
   Glassbox progress engine
   Tracks XP, levels, badges and module completion.
   Data is stored in the browser (localStorage) only —
   nothing is sent to a server and no account is needed.
   ========================================================== */
(function () {
  "use strict";

  var KEY = "glassbox.progress.v1";

  /* ---------- Course map ---------- */
  var MODULES = {
    foundations: {
      title: "How AI Actually Works",
      url: "foundations.html",
      sections: ["f-what", "f-ml", "f-nn", "f-llm", "f-limits"],
      labs: ["lab-classifier", "lab-nextword"],
      quiz: "quiz-foundations"
    },
    tools: {
      title: "Tools & Techniques",
      url: "tools.html",
      sections: ["t-toolbox", "t-prompting", "t-study", "t-verify"],
      labs: ["lab-prompt", "lab-hallucination"],
      quiz: "quiz-tools"
    },
    ethics: {
      title: "Using AI Responsibly",
      url: "ethics.html",
      sections: ["e-integrity", "e-cite", "e-bias", "e-privacy", "e-impact"],
      labs: ["lab-cite", "lab-scenarios"],
      quiz: "quiz-ethics"
    }
  };

  var XP = { section: 10, lab: 25, quiz: 50, perfect: 25, glossary: 20 };

  var LEVELS = [
    { min: 0,   name: "Observer" },
    { min: 80,  name: "Apprentice" },
    { min: 200, name: "Practitioner" },
    { min: 340, name: "Analyst" },
    { min: 460, name: "Architect" }
  ];

  /* Badge glyphs are simple original SVG paths drawn for this site. */
  var BADGES = [
    { id: "first-steps",   name: "First Steps",      desc: "Finish your first lesson section.", color: "#2f6b57",
      glyph: '<path d="M22 40l6-14 6 14M24 35h8" /><path d="M20 20h16" />' },
    { id: "pattern",       name: "Pattern Spotter",  desc: "Train the classifier in Module 1.", color: "#c4532d",
      glyph: '<circle cx="22" cy="24" r="3"/><circle cx="34" cy="22" r="3"/><circle cx="24" cy="36" r="3"/><circle cx="36" cy="34" r="3"/><path d="M18 40L40 18" stroke-dasharray="3 3"/>' },
    { id: "predictor",     name: "Next-Word Wizard", desc: "Build a sentence with the language model.", color: "#a8431f",
      glyph: '<path d="M17 24h14M17 30h22M17 36h10" /><path d="M33 34l6 2-6 2" />' },
    { id: "foundations",   name: "Foundations",      desc: "Complete all of Module 1.", color: "#23211d",
      glyph: '<path d="M18 38h20M20 38V26M28 38V26M36 38V26M16 26l12-8 12 8z" />' },
    { id: "prompt-crafter",name: "Prompt Crafter",   desc: "Score 80+ in the Prompt Builder.", color: "#2f6b57",
      glyph: '<path d="M18 36l14-14 4 4-14 14h-4z" /><path d="M30 24l4 4" />' },
    { id: "fact-checker",  name: "Fact Checker",     desc: "Find every false claim in the AI answer.", color: "#c4532d",
      glyph: '<circle cx="26" cy="26" r="7"/><path d="M31 31l7 7" />' },
    { id: "tools",         name: "Toolsmith",        desc: "Complete all of Module 2.", color: "#23211d",
      glyph: '<path d="M20 36l10-10M30 20a5 5 0 1 0 6 6l-4-1-1-4z" /><path d="M18 38l3-3" />' },
    { id: "citation",      name: "Citation Pro",     desc: "Build an AI citation in APA or MLA.", color: "#a8431f",
      glyph: '<path d="M20 18h12l6 6v16H20z" /><path d="M24 28h10M24 33h10" />' },
    { id: "judgment",      name: "Judgment Call",    desc: "Work through every ethics scenario.", color: "#2f6b57",
      glyph: '<path d="M28 18v22M20 40h16M18 26h20" /><path d="M18 26l-3 7h6zM38 26l-3 7h6z" />' },
    { id: "ethics",        name: "Responsible User", desc: "Complete all of Module 3.", color: "#23211d",
      glyph: '<path d="M28 17l10 4v7c0 7-4 11-10 13-6-2-10-6-10-13v-7z" /><path d="M23 29l4 4 6-7" />' },
    { id: "perfect",       name: "Perfect Score",    desc: "Get 100% on any module quiz.", color: "#c4532d",
      glyph: '<path d="M28 17l3 7 7 .5-5.5 4.5 2 7L28 32l-6.5 4 2-7L18 24.5l7-.5z" />' },
    { id: "word-collector",name: "Word Collector",   desc: "Open 10 terms in the glossary.", color: "#a8431f",
      glyph: '<path d="M18 20h9a3 3 0 0 1 3 3v17a3 3 0 0 0-3-3h-9zM38 20h-8" /><path d="M38 20v17h-8" />' },
    { id: "graduate",      name: "Glassbox Graduate",desc: "Complete all three modules.", color: "#23211d",
      glyph: '<path d="M14 26l14-7 14 7-14 7z" /><path d="M20 29v6c4 3 12 3 16 0v-6M40 27v8" />' }
  ];

  /* ---------- Storage (safe) ---------- */
  function blank() {
    return { xp: 0, done: {}, quizzes: {}, badges: {}, glossary: {}, log: [] };
  }
  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return blank();
      var s = JSON.parse(raw);
      var b = blank();
      for (var k in b) if (!(k in s)) s[k] = b[k];
      return s;
    } catch (e) { return blank(); }
  }
  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked: keep in memory */ }
  }

  var state = load();

  /* ---------- Helpers ---------- */
  function levelFor(xp) {
    var cur = LEVELS[0], next = null;
    for (var i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].min) { cur = LEVELS[i]; next = LEVELS[i + 1] || null; }
    }
    return { index: LEVELS.indexOf(cur) + 1, name: cur.name, min: cur.min, next: next };
  }

  function moduleItems(id) {
    var m = MODULES[id];
    return m.sections.concat(m.labs).concat([m.quiz]);
  }
  function moduleProgress(id) {
    var items = moduleItems(id), n = 0;
    items.forEach(function (it) { if (state.done[it]) n++; });
    return { done: n, total: items.length, pct: Math.round((n / items.length) * 100) };
  }
  function moduleComplete(id) { var p = moduleProgress(id); return p.done === p.total; }

  function maxXP() {
    var t = 0;
    Object.keys(MODULES).forEach(function (id) {
      var m = MODULES[id];
      t += m.sections.length * XP.section + m.labs.length * XP.lab + XP.quiz + XP.perfect;
    });
    return t + XP.glossary;
  }

  function badgeSVG(b, size) {
    size = size || 64;
    return '<svg viewBox="0 0 56 56" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<circle cx="28" cy="28" r="26" fill="' + b.color + '"/>' +
      '<circle cx="28" cy="28" r="21.5" fill="none" stroke="#f4f1ea" stroke-width="1" stroke-dasharray="2 2.4"/>' +
      '<g fill="none" stroke="#f4f1ea" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + b.glyph + '</g>' +
      '</svg>';
  }

  /* ---------- Toasts ---------- */
  var stack;
  function toast(html, cls) {
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      stack.setAttribute("role", "status");
      stack.setAttribute("aria-live", "polite");
      document.body.appendChild(stack);
    }
    var t = document.createElement("div");
    t.className = "toast " + (cls || "");
    t.innerHTML = html;
    stack.appendChild(t);
    setTimeout(function () { t.style.transition = "opacity .3s"; t.style.opacity = "0"; }, 3600);
    setTimeout(function () { t.remove(); }, 4000);
  }

  /* ---------- Core actions ---------- */
  function addLog(label, xp) {
    state.log.unshift({ t: Date.now(), label: label, xp: xp });
    if (state.log.length > 40) state.log.length = 40;
  }

  function addXP(amount, label) {
    var before = levelFor(state.xp);
    state.xp += amount;
    addLog(label, amount);
    var after = levelFor(state.xp);
    toast('<div><b>' + label + '</b>Progress saved</div><span class="amt">+' + amount + ' XP</span>');
    if (after.index > before.index) {
      setTimeout(function () {
        toast('<div><b>Level ' + after.index + ': ' + after.name + '</b>You leveled up.</div>', "badge-toast");
      }, 450);
    }
  }

  /* Complete an item once. Returns true if it was new. */
  function complete(itemId, label, amount) {
    if (state.done[itemId]) return false;
    state.done[itemId] = Date.now();
    addXP(amount, label);
    checkBadges();
    save();
    refresh();
    return true;
  }

  function badge(id) {
    if (state.badges[id]) return;
    var b = BADGES.filter(function (x) { return x.id === id; })[0];
    if (!b) return;
    state.badges[id] = Date.now();
    addLog("Badge earned: " + b.name, 0);
    save();
    setTimeout(function () {
      toast(badgeSVG(b, 40) + '<div><b>Badge: ' + b.name + '</b>' + b.desc + '</div>', "badge-toast");
    }, 700);
  }

  function checkBadges() {
    var anySection = Object.keys(MODULES).some(function (id) {
      return MODULES[id].sections.some(function (s) { return state.done[s]; });
    });
    if (anySection) badge("first-steps");
    if (moduleComplete("foundations")) badge("foundations");
    if (moduleComplete("tools")) badge("tools");
    if (moduleComplete("ethics")) badge("ethics");
    if (moduleComplete("foundations") && moduleComplete("tools") && moduleComplete("ethics")) badge("graduate");
  }

  function recordQuiz(moduleId, score, total) {
    var m = MODULES[moduleId];
    var prev = state.quizzes[moduleId] || { best: 0, attempts: 0 };
    prev.attempts++;
    prev.best = Math.max(prev.best, score / total);
    prev.last = score / total;
    state.quizzes[moduleId] = prev;
    save();
    var passed = score / total >= 0.7;
    if (passed) complete(m.quiz, "Passed: " + m.title + " quiz", XP.quiz);
    if (score === total && !state.done[m.quiz + "-perfect"]) {
      complete(m.quiz + "-perfect", "Perfect score bonus", XP.perfect);
      badge("perfect");
    }
    return passed;
  }

  function markGlossary(term) {
    if (state.glossary[term]) return;
    state.glossary[term] = 1;
    save();
    var n = Object.keys(state.glossary).length;
    if (n >= 10 && !state.done["glossary-10"]) {
      complete("glossary-10", "Explored 10 glossary terms", XP.glossary);
      badge("word-collector");
    }
    refresh();
  }

  function reset() {
    state = blank();
    save();
    refresh();
  }

  /* ---------- UI wiring ---------- */
  function refresh() {
    var lv = levelFor(state.xp);
    document.querySelectorAll("[data-xp]").forEach(function (el) { el.textContent = state.xp; });
    document.querySelectorAll("[data-level]").forEach(function (el) { el.textContent = lv.index; });
    document.querySelectorAll("[data-level-name]").forEach(function (el) { el.textContent = lv.name; });

    document.querySelectorAll("[data-module-bar]").forEach(function (el) {
      var p = moduleProgress(el.getAttribute("data-module-bar"));
      var i = el.querySelector("i"); if (i) i.style.width = p.pct + "%";
      el.setAttribute("aria-valuenow", p.pct);
    });
    document.querySelectorAll("[data-module-pct]").forEach(function (el) {
      el.textContent = moduleProgress(el.getAttribute("data-module-pct")).pct + "%";
    });
    document.querySelectorAll("[data-module-count]").forEach(function (el) {
      var p = moduleProgress(el.getAttribute("data-module-count"));
      el.textContent = p.done + " of " + p.total + " steps";
    });

    /* "Mark section as read" buttons */
    document.querySelectorAll("[data-read]").forEach(function (btn) {
      var id = btn.getAttribute("data-read");
      if (state.done[id]) {
        btn.classList.add("done");
        btn.textContent = "Section complete ✓";
        btn.setAttribute("aria-pressed", "true");
      }
    });
    /* TOC ticks */
    document.querySelectorAll(".toc a[href^='#']").forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (state.done[id]) a.classList.add("done");
    });
    /* Lab XP chips */
    document.querySelectorAll("[data-lab-xp]").forEach(function (el) {
      if (state.done[el.getAttribute("data-lab-xp")]) { el.classList.add("got"); el.textContent = "Done ✓"; }
    });
  }

  function wireNav() {
    var t = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (t && nav) {
      t.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        t.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  }

  function wireReadButtons() {
    document.querySelectorAll("[data-read]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-read");
        var h = document.getElementById(id);
        var title = h ? (h.querySelector("h2") || {}).textContent : "Section";
        complete(id, "Read: " + (title || "Section"), XP.section);
      });
    });
  }

  function wireTOC() {
    var links = document.querySelectorAll(".toc a[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("active"); });
          var a = map[e.target.id]; if (a) a.classList.add("active");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  function wireCopy() {
    document.querySelectorAll(".prompt-chip").forEach(function (chip) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = "Copy";
      b.setAttribute("aria-label", "Copy this prompt");
      b.addEventListener("click", function () {
        var text = chip.getAttribute("data-text") || chip.firstChild.textContent.trim();
        var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1500); };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
      });
      chip.appendChild(b);
    });
  }

  /* Soft header shadow once the page scrolls */
  function wireHeader() {
    var h = document.querySelector(".site-header");
    if (!h) return;
    var on = function () { h.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", on, { passive: true });
    on();
  }

  /* Fade content in gently as it scrolls into view */
  function wireReveal() {
    if (!("IntersectionObserver" in window)) return;
    if (document.visibilityState === "hidden") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var sel = [".stat-row", ".section-head", ".chapter", ".split > div", ".callout", ".lab", ".quiz",
      ".lesson figure", ".table-wrap", ".compare", ".def-list", ".member", ".timeline li", ".wire figure",
      ".refs", ".doc-link", ".dash-top > div", ".mod-progress > a", ".badge", ".next-module a", ".gloss"].join(",");
    var els = document.querySelectorAll(sel);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        /* stagger siblings that appear together */
        var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains("reveal") && !c.classList.contains("in"); });
        var i = Math.max(0, sibs.indexOf(el));
        var delay = Math.min(i, 5) * 70;
        el.style.transitionDelay = delay + "ms";
        el.classList.add("in");
        io.unobserve(el);
        /* hand control back to the element's own hover transitions */
        setTimeout(function () { el.classList.remove("reveal", "in"); el.style.transitionDelay = ""; }, 850 + delay);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    els.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
    /* Safety net: if anything is still hidden when the tab goes into the
       background or printing starts, show everything. */
    var showAll = function () { document.querySelectorAll(".reveal").forEach(function (el) { el.classList.remove("reveal", "in"); }); };
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") showAll(); });
    window.addEventListener("beforeprint", showAll);
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireNav(); wireReadButtons(); wireTOC(); wireCopy(); wireHeader(); wireReveal(); refresh();
    var y = document.querySelectorAll("[data-year]");
    y.forEach(function (el) { el.textContent = new Date().getFullYear(); });
  });

  /* Public API used by the lab and quiz scripts */
  window.Glassbox = {
    MODULES: MODULES, BADGES: BADGES, LEVELS: LEVELS, XP: XP,
    get state() { return state; },
    complete: complete, badge: badge, recordQuiz: recordQuiz, markGlossary: markGlossary,
    levelFor: levelFor, moduleProgress: moduleProgress, moduleComplete: moduleComplete,
    maxXP: maxXP, badgeSVG: badgeSVG, reset: reset, refresh: refresh,
    lab: function (id, label, badgeId) { var n = complete(id, label, XP.lab); if (badgeId) badge(badgeId); checkBadges(); return n; }
  };
})();
