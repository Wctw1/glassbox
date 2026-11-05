/* ==========================================================
   Glassbox dashboard rendering
   ========================================================== */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function render() {
    var G = window.Glassbox, s = G.state;
    var lv = G.levelFor(s.xp);

    /* Level bar */
    if (lv.next) {
      var span = lv.next.min - lv.min, into = s.xp - lv.min;
      $("lvl-bar").querySelector("i").style.width = Math.round((into / span) * 100) + "%";
      $("lvl-progress-label").textContent = (lv.next.min - s.xp) + " XP to next level";
      $("lvl-next").textContent = "Next: " + lv.next.name;
    } else {
      $("lvl-bar").querySelector("i").style.width = "100%";
      $("lvl-progress-label").textContent = "Top level reached";
      $("lvl-next").textContent = "Max";
    }
    $("levels").innerHTML = G.LEVELS.map(function (l, i) {
      return '<div class="' + (s.xp >= l.min ? "reached" : "") + '">L' + (i + 1) + "<br>" + l.name + "</div>";
    }).join("");
    $("xp-max").textContent = G.maxXP();

    /* Badges */
    var earned = 0;
    $("badges").innerHTML = G.BADGES.map(function (b) {
      var got = !!s.badges[b.id]; if (got) earned++;
      return '<div class="badge ' + (got ? "" : "locked") + '">' + G.badgeSVG(b, 64) +
        "<b>" + esc(b.name) + "</b><span>" + (got ? "Earned " + new Date(s.badges[b.id]).toLocaleDateString() : esc(b.desc)) + "</span>" +
        '<span class="sr-only">' + (got ? "Unlocked" : "Locked") + "</span></div>";
    }).join("");
    $("badge-count").textContent = earned;
    $("badge-total").textContent = G.BADGES.length;

    /* Modules */
    var complete = 0, nextStep = null;
    var nums = { foundations: "01", tools: "02", ethics: "03" };
    $("mod-progress").innerHTML = Object.keys(G.MODULES).map(function (id) {
      var m = G.MODULES[id], p = G.moduleProgress(id);
      if (p.done === p.total) complete++;
      else if (!nextStep) nextStep = m;
      var q = s.quizzes[id];
      return '<a href="' + m.url + '"><span class="eyebrow"><span class="num">Module ' + nums[id] + "</span></span><h3>" + esc(m.title) + "</h3>" +
        '<p class="small">' + p.done + " of " + p.total + " steps · Quiz best: " + (q ? Math.round(q.best * 100) + "%" : "—") + "</p>" +
        '<div class="bar" role="progressbar" aria-label="' + esc(m.title) + ' progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p.pct + '"><i style="width:' + p.pct + '%"></i></div></a>';
    }).join("");
    $("module-count").textContent = complete;
    $("next-step").innerHTML = nextStep
      ? '<a class="btn small" href="' + nextStep.url + '">Continue: ' + esc(nextStep.title) + " →</a>"
      : "<b>You've finished every module.</b> Nice work, Glassbox Graduate.";

    /* Activity */
    $("activity").innerHTML = s.log.length
      ? s.log.slice(0, 12).map(function (e) {
          var d = new Date(e.t);
          return "<li><span><time>" + d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + "</time>" + esc(e.label) + "</span><span>" + (e.xp ? "+" + e.xp + " XP" : "badge") + "</span></li>";
        }).join("")
      : '<li><span>No activity yet. <a href="foundations.html">Start Module 1</a> to earn your first XP.</span><span></span></li>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    $("reset").addEventListener("click", function () {
      if (window.confirm("Reset all Glassbox progress saved in this browser? This can't be undone.")) {
        window.Glassbox.reset(); render();
      }
    });
  });
})();
