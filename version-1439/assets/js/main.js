(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });
    restart();
  }

  function initFilters() {
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var input = document.querySelector("[data-filter-input]");
    var region = document.querySelector("[data-filter-region]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var empty = document.querySelector("[data-filter-empty]");

    function valueOf(element) {
      return element ? element.value.trim() : "";
    }

    function apply() {
      var keyword = valueOf(input).toLowerCase();
      var regionValue = valueOf(region);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = (card.getAttribute("data-search") || "").toLowerCase();
        var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
        var matchRegion = !regionValue || card.getAttribute("data-region") === regionValue;
        var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
        var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var showCard = matchKeyword && matchRegion && matchType && matchYear;
        card.hidden = !showCard;
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
