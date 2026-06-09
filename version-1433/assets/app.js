(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-menu]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length === 0) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      var scopeSelector = form.getAttribute("data-filter-scope") || "body";
      var scope = document.querySelector(scopeSelector) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var empty = scope.querySelector("[data-empty]");
      if (!input || cards.length === 0) {
        return;
      }
      function apply() {
        var value = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var match = text.indexOf(value) !== -1;
          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      input.addEventListener("input", apply);
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && !input.value) {
        input.value = query;
        apply();
      }
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var loaded = false;
      var hls = null;
      function attach() {
        if (loaded || !stream) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      function play() {
        attach();
        shell.classList.add("is-playing");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }
      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
