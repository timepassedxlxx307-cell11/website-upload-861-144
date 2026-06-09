(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-search-input]").forEach(function (input) {
    var root = input.closest("section") || document;
    var clear = root.querySelector("[data-search-clear]");
    var cards = Array.from(root.querySelectorAll("[data-card]"));

    function apply() {
      var q = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-year") || "",
          card.textContent || "",
        ]
          .join(" ")
          .toLowerCase();

        card.classList.toggle("is-hidden", q && text.indexOf(q) === -1);
      });
    }

    input.addEventListener("input", apply);

    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        apply();
        input.focus();
      });
    }
  });
})();
