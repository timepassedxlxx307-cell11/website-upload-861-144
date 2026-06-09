(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        event.preventDefault();
        if (value) {
          window.location.href = "./search.html?q=" + encodeURIComponent(value);
          return;
        }
        window.location.href = "./search.html";
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === active);
      });
    }
    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        play();
      });
    });
    show(0);
    play();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var keyword = panel.querySelector("[data-filter-keyword]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var reset = panel.querySelector("[data-filter-reset]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (keyword && initialQuery) {
      keyword.value = initialQuery;
    }
    function apply() {
      var q = normalize(keyword ? keyword.value : "");
      var t = normalize(type ? type.value : "");
      var y = normalize(year ? year.value : "");
      var shown = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;
        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (t && cardType !== t) {
          matched = false;
        }
        if (y && cardYear !== y) {
          matched = false;
        }
        card.hidden = !matched;
        if (matched) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }
    [keyword, type, year].forEach(function (item) {
      if (!item) {
        return;
      }
      item.addEventListener("input", apply);
      item.addEventListener("change", apply);
    });
    if (reset) {
      reset.addEventListener("click", function () {
        if (keyword) {
          keyword.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
    }
    apply();
  }

  function bindPlayer(options) {
    var video = document.getElementById(options.video);
    var overlay = document.getElementById(options.overlay);
    var src = options.src;
    if (!video || !src) {
      return;
    }
    var attached = false;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        return;
      }
      video.src = src;
    }
    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    attach();
  }

  window.MoviePlayer = {
    mount: bindPlayer
  };

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
  });
})();
