/* ==========================================================
   Glassbox glossary — searchable, filterable by letter.
   Opening 10 terms earns the Word Collector badge.
   ========================================================== */
(function () {
  "use strict";
  var TERMS = [
    ["Academic integrity", "Module 3", "Doing your own work honestly and giving credit for ideas, words and help that came from others, including AI tools."],
    ["Algorithm", "Module 1", "A step-by-step set of instructions a computer follows to solve a problem or complete a task."],
    ["Algorithmic bias", "Module 3", "When an AI system produces unfair results for certain groups, often because its training data or design reflected existing inequalities."],
    ["Artificial intelligence (AI)", "Module 1", "Computer systems that perform tasks normally associated with human thinking, such as recognizing images, understanding language or making predictions."],
    ["Artificial general intelligence (AGI)", "Module 1", "A hypothetical AI that could learn and reason across any task as well as a person. It does not currently exist."],
    ["Chatbot", "Module 2", "A program you interact with through conversation. Modern chatbots are usually powered by large language models."],
    ["Classifier", "Module 1", "A model that sorts inputs into categories, such as “spam” or “not spam.”"],
    ["Context window", "Module 2", "The maximum amount of text (measured in tokens) a language model can consider at one time, including your prompt and its reply."],
    ["Deep learning", "Module 1", "Machine learning that uses neural networks with many layers. It powers image recognition, speech recognition and LLMs."],
    ["Deepfake", "Module 3", "Realistic fake images, audio or video created with AI, often showing a real person saying or doing something they never did."],
    ["Disclosure", "Module 3", "A short statement explaining how you used AI in your work, so your teacher knows what is yours and what came from a tool."],
    ["Feature", "Module 1", "A measurable property of the data a model uses to make predictions, like the number of links in an email."],
    ["Fine-tuning", "Module 1", "Additional training that adapts a pre-trained model for a specific job, such as following instructions in a conversation."],
    ["Generative AI", "Module 2", "AI that creates new content (text, images, audio, video or code) rather than only classifying or predicting."],
    ["Gradient descent", "Module 1", "The method used to train neural networks: repeatedly nudging weights in the direction that reduces error."],
    ["Hallucination", "Module 1", "When an AI produces information that sounds confident and plausible but is false or made up, such as fake citations."],
    ["Knowledge cutoff", "Module 1", "The date after which a model has no information in its training data."],
    ["Label", "Module 1", "The correct answer attached to a training example in supervised learning."],
    ["Large language model (LLM)", "Module 1", "A very large neural network trained on huge amounts of text to predict the next token. It is the technology behind modern chatbots."],
    ["Lateral reading", "Module 2", "Checking a claim or source by leaving it and seeing what other trustworthy sources say about it."],
    ["Machine learning (ML)", "Module 1", "A type of AI in which computers learn patterns from data instead of following only hand-written rules."],
    ["Model", "Module 1", "The result of training: a saved set of learned patterns (weights) that can make predictions on new data."],
    ["Neural network", "Module 1", "A model made of layers of connected units (“neurons”) with adjustable weights, loosely inspired by the brain."],
    ["Parameter", "Module 1", "A value inside a model, such as a weight, that is learned during training. Large models have billions."],
    ["Pre-training", "Module 1", "The first, largest stage of training an LLM, where it learns general language patterns from a massive text collection."],
    ["Prompt", "Module 2", "The instructions or question you give an AI tool."],
    ["Reinforcement learning", "Module 1", "Learning by trial and error, where a system receives rewards or penalties for its actions."],
    ["RLHF", "Module 1", "Reinforcement learning from human feedback: people rate model responses, and the model is adjusted toward responses rated as helpful and safe."],
    ["SIFT", "Module 2", "A fact-checking method: Stop, Investigate the source, Find better coverage, Trace claims to the original context."],
    ["Supervised learning", "Module 1", "Machine learning from examples that include the correct answers (labels)."],
    ["Token", "Module 1", "A chunk of text, often a word or part of a word, that a language model reads and generates."],
    ["Training data", "Module 1", "The collection of examples a machine learning model learns from."],
    ["Unsupervised learning", "Module 1", "Machine learning that finds patterns or groups in data without labels."],
    ["Weight", "Module 1", "A number on a connection in a neural network that controls how strongly one neuron affects the next."]
  ];

  document.addEventListener("DOMContentLoaded", function () {
    var list = document.getElementById("gloss");
    var input = document.getElementById("gloss-search");
    var lettersEl = document.getElementById("letters");
    var countEl = document.getElementById("gloss-count");
    var seenEl = document.getElementById("gloss-seen");
    if (!list) return;
    var letter = "";

    var present = {};
    TERMS.forEach(function (t) { present[t[0][0].toUpperCase()] = true; });
    var html = '<button type="button" aria-pressed="true" data-l="">All</button>';
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function (L) {
      html += '<button type="button" aria-pressed="false" data-l="' + L + '"' + (present[L] ? "" : " disabled") + ">" + L + "</button>";
    });
    lettersEl.innerHTML = html;
    lettersEl.querySelector("[data-l='']").style.width = "auto";
    lettersEl.querySelector("[data-l='']").style.padding = "0 10px";

    list.innerHTML = TERMS.map(function (t, i) {
      return '<details data-i="' + i + '"><summary><b>' + t[0] + "</b><span>" + t[1] + "</span></summary><div><p>" + t[2] + "</p></div></details>";
    }).join("");

    function seen() {
      var n = Object.keys(window.Glassbox.state.glossary).length;
      seenEl.textContent = n >= 10 ? "Word Collector badge earned ✓" : "Terms explored: " + n + " / 10 for the Word Collector badge";
    }

    list.querySelectorAll("details").forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (d.open) { window.Glassbox.markGlossary(TERMS[+d.getAttribute("data-i")][0]); seen(); }
      });
    });

    function filter() {
      var q = input.value.trim().toLowerCase(), shown = 0;
      list.querySelectorAll("details").forEach(function (d) {
        var t = TERMS[+d.getAttribute("data-i")];
        var ok = (!letter || t[0][0].toUpperCase() === letter) && (!q || (t[0] + " " + t[2]).toLowerCase().indexOf(q) > -1);
        d.hidden = !ok; if (ok) shown++;
      });
      countEl.textContent = shown + " of " + TERMS.length + " terms";
    }
    input.addEventListener("input", filter);
    lettersEl.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || b.disabled) return;
      letter = b.getAttribute("data-l");
      lettersEl.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      filter();
    });
    filter(); seen();
  });
})();
