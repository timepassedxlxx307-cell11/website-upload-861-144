(function () {
  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupHeaderSearch() {
    var data = window.SITE_SEARCH_INDEX || [];
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var panel = form.querySelector("[data-search-results]");
      if (!input || !panel) {
        return;
      }

      function render() {
        var q = input.value.trim().toLowerCase();
        if (!q) {
          panel.classList.remove("open");
          panel.innerHTML = "";
          return;
        }
        var results = data.filter(function (item) {
          return [item.title, item.genre, item.year, item.region, item.oneLine].join(" ").toLowerCase().indexOf(q) !== -1;
        }).slice(0, 6);
        if (!results.length) {
          panel.classList.remove("open");
          panel.innerHTML = "";
          return;
        }
        panel.innerHTML = results.map(function (item) {
          return "<a class=\"search-suggestion-item\" href=\"" + escapeHtml(item.url) + "\">" +
            "<img src=\"" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\">" +
            "<span><strong>" + escapeHtml(item.title) + "</strong><small>" + escapeHtml(item.genre) + " · " + escapeHtml(item.year) + "</small></span>" +
            "</a>";
        }).join("");
        panel.classList.add("open");
      }

      input.addEventListener("input", render);
      input.addEventListener("focus", render);
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("open");
        }
      });
    });
  }

  function setupFilters() {
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search-card]"));
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-page-filter]"));
    var genreSelect = document.querySelector("[data-genre-select]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    var heroInput = document.getElementById("search-page-input");

    inputs.forEach(function (input) {
      if (initial) {
        input.value = initial;
      }
      input.addEventListener("input", apply);
    });
    if (heroInput) {
      heroInput.value = initial;
    }
    if (genreSelect) {
      genreSelect.addEventListener("change", apply);
    }

    function valueOfInputs() {
      return inputs.map(function (input) {
        return input.value.trim().toLowerCase();
      }).filter(Boolean).join(" ");
    }

    function apply() {
      var q = valueOfInputs();
      var genre = genreSelect ? genreSelect.value.trim() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.textContent
        ].join(" ").toLowerCase();
        var matchText = !q || haystack.indexOf(q) !== -1;
        var matchGenre = !genre || haystack.indexOf(genre.toLowerCase()) !== -1;
        var ok = matchText && matchGenre;
        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("open", visible === 0);
      }
    }

    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupHeaderSearch();
    setupFilters();
  });
})();
