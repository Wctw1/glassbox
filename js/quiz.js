/* ==========================================================
   Glassbox module quizzes
   Usage: <div class="quiz" data-quiz="foundations"></div>
   Pass mark: 70%. Students can retake as many times as they like.
   ========================================================== */
(function () {
  "use strict";

  var QUIZZES = {
    foundations: [
      { q: "Which of these is the best description of machine learning?",
        a: ["A computer following a long list of if-then rules a programmer wrote by hand",
            "A system that finds patterns in example data and uses them to make predictions",
            "A robot that thinks the same way a human brain does",
            "Software that searches the internet for the right answer"],
        c: 1, why: "Machine learning systems learn patterns from training data instead of being given every rule by a programmer." },
      { q: "A spam filter is trained on 50,000 emails that people labeled “spam” or “not spam.” What are those labels used for?",
        a: ["They are the answers the model learns to predict", "They make the emails load faster", "They are deleted before training", "They are only used to name the model"],
        c: 0, why: "In supervised learning, labels are the correct answers. The model adjusts itself until its predictions match them as closely as possible." },
      { q: "When a neural network is “trained,” what is actually changing?",
        a: ["The number of computers it runs on", "The words in its dictionary", "The numerical weights on the connections between its neurons", "The programming language it is written in"],
        c: 2, why: "Training nudges millions or billions of weights so the network's outputs get closer to the right answers." },
      { q: "At its core, what is a large language model (LLM) doing when it writes a response?",
        a: ["Looking up the answer in a database of facts", "Repeatedly predicting a likely next token based on the text so far", "Copying and pasting a full web page", "Asking a human worker to type the reply"],
        c: 1, why: "LLMs generate text one token at a time by predicting what is likely to come next. That is why they can sound fluent and still be wrong." },
      { q: "An AI chatbot gives you a confident answer with a book citation, but you can't find the book anywhere. What most likely happened?",
        a: ["The book was banned", "The AI hallucinated. It produced a plausible-looking but made-up source", "Your search engine is broken", "The AI has access to secret libraries"],
        c: 1, why: "A hallucination is output that sounds right but is not grounded in fact. Fabricated citations are one of the most common examples." }
    ],
    tools: [
      { q: "Which prompt is most likely to get a useful study response?",
        a: ["“photosynthesis”",
            "“Tell me everything.”",
            "“I'm a 10th grader studying for a biology test. Explain photosynthesis in 5 short steps, then quiz me with 3 questions.”",
            "“Do my homework.”"],
        c: 2, why: "It gives context (who you are), a clear task, a format (5 steps), and a next action (quiz me)." },
      { q: "In the SIFT method for checking information, what does the “T” stand for?",
        a: ["Type the question again", "Trace claims, quotes, and media back to the original context", "Trust the first result", "Translate it"],
        c: 1, why: "SIFT = Stop, Investigate the source, Find better coverage, Trace claims to the original context." },
      { q: "What is “lateral reading”?",
        a: ["Reading a page from left to right very quickly", "Leaving the page to see what other trusted sources say about the claim or the source", "Reading only the headings", "Reading the comments section"],
        c: 1, why: "Fact-checkers open new tabs and check what independent sources say, rather than judging a page only by how it looks." },
      { q: "Which use of AI best supports your own learning?",
        a: ["Asking it to write your essay and turning it in", "Asking it to quiz you on your notes and explain the questions you miss", "Asking it for answers to a take-home test", "Pasting its output without reading it"],
        c: 1, why: "Using AI as a tutor or practice partner keeps you doing the thinking, which is how learning happens." },
      { q: "An AI tool gives you a statistic for your research paper. What should you do before using it?",
        a: ["Use it, AI tools are always up to date", "Find the original source of the statistic and confirm it says the same thing", "Round the number so it looks cleaner", "Ask the same AI if it is sure"],
        c: 1, why: "Always verify facts against a primary or reputable source. Asking the same AI again is not independent verification." }
    ],
    ethics: [
      { q: "Your teacher says AI may be used for brainstorming only. Which action follows that rule?",
        a: ["Having AI write your thesis paragraph", "Asking AI for 10 possible topics, then choosing and researching one yourself", "Having AI rewrite your whole draft", "Using AI to answer the reflection questions"],
        c: 1, why: "Brainstorming means generating ideas. The writing, research, and decisions are still yours." },
      { q: "Why should you disclose or cite AI use in schoolwork?",
        a: ["It is never necessary", "So your teacher knows what is your work and what came from a tool. It is part of academic honesty", "To make the paper longer", "Because AI companies require payment"],
        c: 1, why: "Disclosure keeps your work honest and lets your teacher assess your learning fairly. Style guides like APA and MLA give formats for it." },
      { q: "A face-analysis system works well on some groups of people but makes far more errors on others. What is a likely cause?",
        a: ["The training data did not represent all groups fairly", "The camera was turned off", "AI systems are always perfectly fair", "Too many people used it at once"],
        c: 0, why: "If training data under-represents a group, the model often performs worse for that group. This is one form of algorithmic bias." },
      { q: "Which is the safest thing to type into a free public AI chatbot?",
        a: ["Your home address and phone number", "A classmate's private message", "A general question about how volcanoes form", "Your school login password"],
        c: 2, why: "Never share personal, private, or login information. Many services can store conversations and may use them to improve their models." },
      { q: "You see a shocking video of a celebrity that might be AI-generated. What is the most responsible first step?",
        a: ["Share it right away so friends see it first", "Pause and check trusted news sources before believing or sharing it", "Comment that it is fake without checking", "Download it and edit it further"],
        c: 1, why: "Deepfakes spread because people share before checking. Stopping and verifying is the responsible move." }
    ]
  };

  function render(el) {
    var id = el.getAttribute("data-quiz");
    var data = QUIZZES[id];
    if (!data) return;
    var html = '<div class="quiz-head"><h3>Check your understanding</h3>' +
      '<span class="eyebrow" style="margin:0">' + data.length + ' questions · pass at 70% · +50 XP</span></div>';
    html += '<form novalidate>';
    data.forEach(function (item, i) {
      html += '<fieldset><legend><span class="n">' + String(i + 1).padStart(2, "0") + '</span>' + item.q + '</legend>';
      item.a.forEach(function (ans, j) {
        var name = id + "-q" + i;
        html += '<label class="opt"><input type="radio" name="' + name + '" value="' + j + '"> <span>' + ans + '</span></label>';
      });
      html += '<p class="explain">' + item.why + '</p></fieldset>';
    });
    html += '<div class="quiz-foot"><button class="btn" type="submit">Check answers</button>' +
      '<button class="btn ghost" type="button" data-retry hidden>Try again</button>' +
      '<span class="quiz-result" aria-live="polite"></span></div></form>';
    el.innerHTML = html;

    var form = el.querySelector("form");
    var result = el.querySelector(".quiz-result");
    var retry = el.querySelector("[data-retry]");

    var best = window.Glassbox && window.Glassbox.state.quizzes[id];
    if (best) result.textContent = "Best so far: " + Math.round(best.best * 100) + "%";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var score = 0, unanswered = 0;
      data.forEach(function (item, i) {
        var picked = form.querySelector('input[name="' + id + '-q' + i + '"]:checked');
        if (!picked) unanswered++;
      });
      if (unanswered) {
        result.textContent = "Answer all " + data.length + " questions first (" + unanswered + " left).";
        return;
      }
      data.forEach(function (item, i) {
        var opts = form.querySelectorAll('input[name="' + id + '-q' + i + '"]');
        opts.forEach(function (o) {
          var lab = o.closest(".opt");
          lab.classList.remove("right", "wrong");
          if (+o.value === item.c) lab.classList.add("right");
          else if (o.checked) lab.classList.add("wrong");
          o.disabled = true;
        });
        var picked = form.querySelector('input[name="' + id + '-q' + i + '"]:checked');
        if (+picked.value === item.c) score++;
      });
      el.classList.add("graded");
      var passed = window.Glassbox ? window.Glassbox.recordQuiz(id, score, data.length) : score / data.length >= .7;
      result.textContent = score + " / " + data.length + " correct: " +
        (passed ? (score === data.length ? "perfect score!" : "passed.") : "review the explanations and try again (70% to pass).");
      form.querySelector('button[type="submit"]').hidden = true;
      retry.hidden = false;
    });

    retry.addEventListener("click", function () { el.classList.remove("graded"); render(el); el.scrollIntoView({ block: "start" }); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-quiz]").forEach(render);
  });
})();
