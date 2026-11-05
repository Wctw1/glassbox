/* ==========================================================
   Glassbox interactive labs
   Each lab only starts if its container is on the page.
   ========================================================== */
(function () {
  "use strict";
  var G = function () { return window.Glassbox; };
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ======================================================
     LAB 1 — Train a classifier (k-nearest neighbors)
     ====================================================== */
  function classifierLab() {
    var root = document.getElementById("lab-classifier");
    if (!root) return;
    var canvas = $("canvas", root);
    var ctx = canvas.getContext("2d");
    var status = $(".feedback", root);
    var classBtns = $$("[data-class]", root);
    var current = 0;
    var COLORS = ["#2f6b57", "#c4532d"];           /* 0 = not spam, 1 = spam */
    var SOFT = ["rgba(47,107,87,0.14)", "rgba(196,83,45,0.14)"];
    var trained = false;
    var added = 0;
    var seed = [
      { x: .18, y: .78, c: 0 }, { x: .28, y: .66, c: 0 },
      { x: .78, y: .22, c: 1 }, { x: .66, y: .34, c: 1 }
    ];
    var points = seed.slice();

    function size() {
      var r = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function predict(x, y, k) {
      var d = points.map(function (p) { return { c: p.c, d: (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y) }; });
      d.sort(function (a, b) { return a.d - b.d; });
      var votes = [0, 0];
      d.slice(0, k).forEach(function (n) { votes[n.c]++; });
      return votes[0] >= votes[1] ? 0 : 1;
    }

    function draw() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      if (trained) {
        var step = 10;
        for (var gx = 0; gx < w; gx += step) {
          for (var gy = 0; gy < h; gy += step) {
            ctx.fillStyle = SOFT[predict((gx + step / 2) / w, (gy + step / 2) / h, 3)];
            ctx.fillRect(gx, gy, step, step);
          }
        }
      }
      /* grid + axes */
      ctx.strokeStyle = "#eee8dc"; ctx.lineWidth = 1;
      for (var i = 1; i < 10; i++) {
        ctx.beginPath(); ctx.moveTo(i * w / 10, 0); ctx.lineTo(i * w / 10, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * h / 10); ctx.lineTo(w, i * h / 10); ctx.stroke();
      }
      ctx.fillStyle = "#7a7366"; ctx.font = "12px 'IBM Plex Mono', monospace";
      ctx.fillText("more links →", w - 96, h - 10);
      ctx.save(); ctx.translate(14, 104); ctx.rotate(-Math.PI / 2); ctx.fillText("more ALL-CAPS →", 0, 0); ctx.restore();
      /* points */
      points.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 7, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[p.c]; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
      });
    }

    function counts() {
      var c = [0, 0]; points.forEach(function (p) { c[p.c]++; }); return c;
    }

    canvas.addEventListener("pointerdown", function (e) {
      var r = canvas.getBoundingClientRect();
      points.push({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, c: current });
      added++;
      if (trained) draw(); else draw();
      var c = counts();
      status.className = "feedback";
      status.textContent = "Examples so far. Spam: " + c[1] + ", not spam: " + c[0] + "." + (added < 6 ? " Add " + (6 - added) + " more, then press Train." : " Ready to train.");
    });

    classBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        current = +b.getAttribute("data-class");
        classBtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });

    $("[data-train]", root).addEventListener("click", function () {
      if (added < 6) {
        status.className = "feedback no";
        status.textContent = "Add at least " + (6 - added) + " more examples first. A model can only learn from the data you give it.";
        return;
      }
      trained = true; draw();
      status.className = "feedback ok";
      status.innerHTML = "<b>Trained.</b> The shading shows how the model would label <em>any</em> new email based on its 3 nearest examples. Try adding a “wrong” point deep inside the other color and notice how one bad label bends the boundary. That is how noisy or biased data changes a model.";
      G().lab("lab-classifier", "Lab: trained a classifier", "pattern");
    });

    $("[data-reset]", root).addEventListener("click", function () {
      points = seed.slice(); trained = false; added = 0; draw();
      status.className = "feedback"; status.textContent = "Reset. Pick a label, then click on the chart to add examples.";
    });

    window.addEventListener("resize", size);
    size();
  }

  /* ======================================================
     LAB 2 — Next-word prediction (bigram model)
     ====================================================== */
  var CORPUS = [
    "the student opened the laptop and started the essay",
    "the student asked the teacher a question about the essay",
    "the teacher asked the class to read the next chapter",
    "the class read the chapter and wrote a summary",
    "the model predicts the next word in the sentence",
    "the model learns patterns from the training data",
    "the training data shapes what the model can do",
    "the student checked the answer with a second source",
    "the answer sounded right but the source was fake",
    "a good prompt gives the model clear context",
    "a good student checks every source before using it",
    "the teacher said the essay was due on friday",
    "the class started the project on monday",
    "the project was about how the model learns",
    "the student wrote the summary in their own words",
    "the model can sound confident and still be wrong",
    "the data can contain bias from the real world",
    "a careful student reads the policy before using ai",
    "the policy says to cite any ai tool you use",
    "the student used ai to make a study plan",
    "the study plan helped the student finish the project",
    "the teacher liked the project and the summary"
  ];

  function nextWordLab() {
    var root = document.getElementById("lab-nextword");
    if (!root) return;
    var table = {};
    CORPUS.forEach(function (s) {
      var w = s.split(" ");
      for (var i = 0; i < w.length - 1; i++) {
        table[w[i]] = table[w[i]] || {};
        table[w[i]][w[i + 1]] = (table[w[i]][w[i + 1]] || 0) + 1;
      }
    });
    var out = $("[data-sentence]", root);
    var preds = $(".predictions", root);
    var fb = $(".feedback", root);
    var words = ["the"];

    function show() {
      out.textContent = words.join(" ");
      var last = words[words.length - 1];
      var next = table[last];
      preds.innerHTML = "";
      if (!next) {
        preds.innerHTML = '<p class="hint">The model has never seen any word follow “' + esc(last) + '” in its training data, so it has nothing to predict. Real LLMs have the same problem with topics missing from their data, except they often guess anyway.</p>';
        return;
      }
      var total = 0; Object.keys(next).forEach(function (k) { total += next[k]; });
      Object.keys(next).sort(function (a, b) { return next[b] - next[a]; }).slice(0, 5).forEach(function (wd) {
        var p = next[wd] / total;
        var row = document.createElement("div");
        row.className = "pred";
        row.innerHTML = '<button type="button">' + esc(wd) + '</button><span class="track"><i style="width:' + Math.round(p * 100) + '%"></i></span><span class="pct">' + Math.round(p * 100) + '%</span>';
        row.querySelector("button").addEventListener("click", function () { words.push(wd); show(); check(); });
        preds.appendChild(row);
      });
    }

    function check() {
      if (words.length >= 8) {
        fb.className = "feedback ok";
        fb.innerHTML = "<b>Nice.</b> You just did what an LLM does: pick a likely next word, again and again. This toy model learned from " + CORPUS.length + " sentences; real models learn from trillions of words and look at much more than one previous word.";
        G().lab("lab-nextword", "Lab: generated text word by word", "predictor");
      }
    }

    $("[data-auto]", root).addEventListener("click", function () {
      var last = words[words.length - 1], next = table[last];
      if (!next) return;
      /* Sample in proportion to probability, like a real LLM, instead of
         always taking the top word (which gets stuck in loops). */
      var keys = Object.keys(next), total = 0;
      keys.forEach(function (k) { total += next[k]; });
      var r = Math.random() * total, pick = keys[0];
      for (var i = 0; i < keys.length; i++) { r -= next[keys[i]]; if (r <= 0) { pick = keys[i]; break; } }
      words.push(pick); show(); check();
    });
    $("[data-restart]", root).addEventListener("click", function () { words = ["the"]; fb.textContent = ""; show(); });
    var startSel = $("[data-start]", root);
    if (startSel) startSel.addEventListener("change", function () { words = [startSel.value]; fb.textContent = ""; show(); });
    show();
  }

  /* ======================================================
     LAB 3 — Prompt builder
     ====================================================== */
  function promptLab() {
    var root = document.getElementById("lab-prompt");
    if (!root) return;
    var fields = {
      task:    { el: $("#pb-task", root),    pts: 30, min: 5, label: "Clear task" },
      context: { el: $("#pb-context", root), pts: 20, min: 5, label: "Context about you" },
      role:    { el: $("#pb-role", root),    pts: 15, min: 2, label: "Role for the AI" },
      format:  { el: $("#pb-format", root),  pts: 20, min: 3, label: "Output format" },
      limits:  { el: $("#pb-limits", root),  pts: 15, min: 3, label: "Limits or rules" }
    };
    var out = $(".prompt-out", root);
    var bar = $(".meter .bar i", root);
    var num = $(".meter b", root);
    var list = $(".checklist", root);
    var fb = $(".feedback", root);

    function wc(s) { return s.trim() ? s.trim().split(/\s+/).length : 0; }

    function update() {
      var score = 0, parts = [], items = "";
      Object.keys(fields).forEach(function (k) {
        var f = fields[k], v = f.el.value.trim(), n = wc(v);
        var got = n >= f.min ? f.pts : n > 0 ? Math.round(f.pts / 2) : 0;
        score += got;
        items += '<li class="' + (got === f.pts ? "ok" : "") + '">' + f.label + " (" + f.pts + ")</li>";
      });
      var v = function (k) { return fields[k].el.value.trim(); };
      if (v("role")) parts.push("Act as " + v("role").replace(/^act as\s+/i, "") + ".");
      if (v("context")) parts.push(v("context"));
      if (v("task")) parts.push(v("task"));
      if (v("format")) parts.push("Format: " + v("format"));
      if (v("limits")) parts.push("Rules: " + v("limits"));
      out.textContent = parts.length ? parts.join("\n") : "Your prompt will appear here as you fill in the parts.";
      list.innerHTML = items;
      bar.style.width = score + "%";
      num.textContent = score + "/100";
      if (score >= 80) {
        fb.className = "feedback ok";
        fb.innerHTML = "<b>Strong prompt.</b> You gave the AI enough to work with. Copy it into a tool your school allows and compare the result with a one-line prompt.";
        G().lab("lab-prompt", "Lab: built a strong prompt", "prompt-crafter");
      } else {
        fb.className = "feedback";
        fb.textContent = score === 0 ? "" : "Keep going. Prompts that score 80+ usually include a task, context, and a format.";
      }
    }
    Object.keys(fields).forEach(function (k) { fields[k].el.addEventListener("input", update); });
    $("[data-example]", root).addEventListener("click", function () {
      fields.role.el.value = "a patient chemistry tutor";
      fields.context.el.value = "I'm in 10th grade and I keep mixing up ionic and covalent bonds before Friday's test.";
      fields.task.el.value = "Explain the difference between ionic and covalent bonds using one everyday example of each, then quiz me.";
      fields.format.el.value = "a short comparison table, then 3 multiple-choice questions";
      fields.limits.el.value = "Don't give me the quiz answers until I reply with mine.";
      update();
    });
    update();
  }

  /* ======================================================
     LAB 4 — Spot the hallucination
     ====================================================== */
  function hallucinationLab() {
    var root = document.getElementById("lab-hallucination");
    if (!root) return;
    var claims = $$(".claim", root);
    var fb = $(".feedback", root);
    claims.forEach(function (c) {
      c.addEventListener("click", function () {
        if (root.classList.contains("checked")) return;
        c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "false" : "true");
      });
    });
    $("[data-check]", root).addEventListener("click", function () {
      var found = 0, falsePos = 0, totalFalse = 0;
      claims.forEach(function (c) {
        var isFalse = c.getAttribute("data-false") === "true";
        var picked = c.getAttribute("aria-pressed") === "true";
        if (isFalse) totalFalse++;
        if (isFalse && picked) { found++; c.classList.add("correct-flag"); }
        if (isFalse && !picked) c.classList.add("missed");
        if (!isFalse && picked) falsePos++;
        var why = c.querySelector(".why");
        if (why) why.hidden = false;
      });
      root.classList.add("checked");
      if (found === totalFalse && falsePos === 0) {
        fb.className = "feedback ok";
        fb.innerHTML = "<b>All " + totalFalse + " found.</b> Notice that the false claims were written in exactly the same confident tone as the true ones. That's why you check facts, not tone.";
        G().lab("lab-hallucination", "Lab: caught every hallucination", "fact-checker");
      } else {
        fb.className = "feedback no";
        fb.innerHTML = "You found " + found + " of " + totalFalse + " false claims" + (falsePos ? " and flagged " + falsePos + " true one" + (falsePos > 1 ? "s" : "") + " by mistake" : "") + ". Read the notes under each sentence, then press Try again.";
      }
      $("[data-check]", root).hidden = true;
      $("[data-retry]", root).hidden = false;
    });
    $("[data-retry]", root).addEventListener("click", function () {
      root.classList.remove("checked");
      claims.forEach(function (c) {
        c.setAttribute("aria-pressed", "false"); c.classList.remove("correct-flag", "missed");
        var why = c.querySelector(".why"); if (why) why.hidden = true;
      });
      fb.textContent = ""; fb.className = "feedback";
      $("[data-check]", root).hidden = false;
      $("[data-retry]", root).hidden = true;
    });
  }

  /* ======================================================
     LAB 5 — AI citation builder (APA 7 & MLA 9 guidance)
     ====================================================== */
  function citationLab() {
    var root = document.getElementById("lab-cite");
    if (!root) return;
    var MLA_MONTHS = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
    var f = {
      tool: $("#c-tool", root), company: $("#c-company", root), version: $("#c-version", root),
      date: $("#c-date", root), prompt: $("#c-prompt", root), url: $("#c-url", root)
    };
    var apa = $("[data-apa]", root), mla = $("[data-mla]", root), fb = $(".feedback", root);
    try { f.date.valueAsDate = new Date(); } catch (e) { /* older browser */ }

    function build() {
      var tool = f.tool.value.trim(), co = f.company.value.trim(), ver = f.version.value.trim();
      var url = f.url.value.trim(), pr = f.prompt.value.trim();
      var d = f.date.value ? new Date(f.date.value + "T12:00:00") : new Date();
      var year = d.getFullYear();
      var mlaDate = d.getDate() + " " + MLA_MONTHS[d.getMonth()] + " " + year;
      var urlNoProto = url.replace(/^https?:\/\//, "");

      apa.innerHTML = esc(co || "Company") + ". (" + year + "). <em>" + esc(tool || "Tool name") + "</em>" +
        (ver ? " (" + esc(ver) + ")" : "") + " [Large language model]. " + esc(url || "URL");
      mla.innerHTML = "“" + esc(pr || "Describe your prompt here") + "” prompt. <em>" + esc(tool || "Tool name") + "</em>, " +
        (ver ? esc(ver) + ", " : "") + esc(co || "Company") + ", " + esc(mlaDate) + ", " + esc(urlNoProto || "URL") + ".";

      if (tool && co && pr && url) {
        fb.className = "feedback ok";
        fb.innerHTML = "<b>Citation ready.</b> Always check your teacher's preferred style, and keep a copy of the chat in case you're asked to show it.";
        G().lab("lab-cite", "Lab: built an AI citation", "citation");
      } else {
        fb.className = "feedback"; fb.textContent = "Fill in the tool, company, prompt and URL to finish.";
      }
    }
    Object.keys(f).forEach(function (k) { f[k].addEventListener("input", build); });
    build();
  }

  /* ======================================================
     LAB 6 — Ethics scenarios
     ====================================================== */
  var SCENARIOS = [
    { who: "English 10", q: "Maya finishes her essay, then asks an AI tool: “Point out where my argument is weakest, but don't rewrite anything.” She revises it herself.",
      a: 0, why: "Asking for feedback while doing the revising yourself keeps the thinking yours. Still check that your teacher allows AI feedback." },
    { who: "U.S. History", q: "Jordan asks an AI to write a 500-word response on the causes of the Civil War and submits it with no changes and no mention of AI.",
      a: 2, why: "Submitting AI-generated work as your own is academic dishonesty at nearly every school, and it skips the learning the assignment was for." },
    { who: "Biology", q: "Before a test, Priya pastes her own class notes into an AI and asks it to make 15 practice questions.",
      a: 0, why: "Using AI as a study partner to practice recall is one of its best uses. Just double-check any answers that seem off." },
    { who: "Spanish II", q: "The assignment is to translate a paragraph to practice grammar. Leo runs it through an AI translator and turns that in.",
      a: 2, why: "The whole point of the task is practicing translation. Using a tool to do it defeats the purpose and breaks the assignment rules." },
    { who: "English 11", q: "Sam runs out of time, asks an AI to summarize the assigned chapter, and joins the class discussion without mentioning it.",
      a: 1, why: "A summary can help you catch up, but it can miss tone, detail and meaning, and it isn't the same as reading. If you're short on time, ask your teacher how they'd like you to handle it." },
    { who: "Art I", q: "Ava uses an AI image generator to create the background of a class poster and doesn't mention it.",
      a: 1, why: "Some art teachers allow AI elements and others don't. Ask first, and disclose any AI-generated part of a creative project." },
    { who: "Outside class", q: "Chris uploads a screenshot of a group chat (with classmates' names and messages) to an AI and asks it who is mad at whom.",
      a: 2, why: "That shares other people's private information without their permission. Many AI services store conversations." },
    { who: "Computer Science", q: "Dev's code won't run. Dev asks an AI to explain the error, fixes it, writes a comment explaining the fix, and notes the AI help, which the teacher allows.",
      a: 0, why: "Using AI to understand a bug, then showing you understand it and disclosing the help, is responsible use." }
  ];
  var CHOICES = ["Responsible", "Gray area, ask first", "Not OK"];

  function scenarioLab() {
    var root = document.getElementById("lab-scenarios");
    if (!root) return;
    var i = 0, results = [];
    var card = $(".scenario-card", root), dots = $(".scenario-dots", root), fb = $(".feedback", root);
    dots.innerHTML = SCENARIOS.map(function () { return "<span></span>"; }).join("");

    function paint() {
      $$("span", dots).forEach(function (d, j) {
        d.className = results[j] === true ? "right" : results[j] === false ? "wrong" : j === i ? "on" : "";
      });
    }
    function show() {
      paint();
      if (i >= SCENARIOS.length) {
        var right = results.filter(Boolean).length;
        card.innerHTML = '<span class="who">Results</span><p class="q">You matched our reasoning on ' + right + " of " + SCENARIOS.length + " scenarios.</p>" +
          '<p>Real situations are messy. The most important habit is checking your class policy and being open about how you used AI.</p>' +
          '<button class="btn ghost small" type="button" data-again>Go through them again</button>';
        $("[data-again]", card).addEventListener("click", function () { i = 0; results = []; fb.textContent = ""; fb.className = "feedback"; show(); });
        G().lab("lab-scenarios", "Lab: worked through ethics scenarios", "judgment");
        return;
      }
      var s = SCENARIOS[i];
      card.innerHTML = '<span class="who">Scenario ' + (i + 1) + " of " + SCENARIOS.length + " · " + esc(s.who) + '</span><p class="q">' + esc(s.q) + '</p>' +
        '<div class="choice-row">' + CHOICES.map(function (c, j) { return '<button type="button" data-c="' + j + '">' + c + "</button>"; }).join("") + "</div>";
      $$("[data-c]", card).forEach(function (b) {
        b.addEventListener("click", function () {
          if (card.getAttribute("data-answered")) return;
          card.setAttribute("data-answered", "1");
          var pick = +b.getAttribute("data-c"), ok = pick === s.a;
          results[i] = ok;
          b.classList.add(ok ? "picked-right" : "picked-wrong");
          if (!ok) $$("[data-c]", card)[s.a].classList.add("picked-right");
          fb.className = "feedback " + (ok ? "ok" : "no");
          fb.innerHTML = "<b>" + (ok ? "Agreed." : "We'd call it: " + CHOICES[s.a] + ".") + "</b> " + esc(s.why) +
            ' <button class="btn small" type="button" data-next style="margin-left:6px">Next</button>';
          paint();
          $("[data-next]", fb).addEventListener("click", function () { i++; fb.textContent = ""; fb.className = "feedback"; card.removeAttribute("data-answered"); show(); });
        });
      });
    }
    show();
  }

  document.addEventListener("DOMContentLoaded", function () {
    classifierLab(); nextWordLab(); promptLab(); hallucinationLab(); citationLab(); scenarioLab();
  });
})();
