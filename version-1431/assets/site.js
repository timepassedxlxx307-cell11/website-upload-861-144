(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  function setupImageHandling() {
    document.addEventListener('error', function (event) {
      var target = event.target;
      if (target && target.tagName === 'IMG') {
        target.classList.add('image-hidden');
      }
    }, true);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    if (!cards.length || (!input && !selects.length)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (input && query) {
      input.value = query;
    }

    function apply() {
      var term = normalize(input ? input.value : '');
      var active = {};
      selects.forEach(function (select) {
        active[select.getAttribute('data-filter-select')] = normalize(select.value);
      });

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var visible = !term || haystack.indexOf(term) !== -1;
        Object.keys(active).forEach(function (key) {
          var selected = active[key];
          if (!selected) {
            return;
          }
          var value = normalize(card.getAttribute('data-' + key));
          if (value !== selected) {
            visible = false;
          }
        });
        card.style.display = visible ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  }

  window.setupPlayer = function (source) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var button = document.querySelector('[data-player-button]');
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (video.getAttribute('data-attached') === 'yes') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.setAttribute('data-attached', 'yes');
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.setAttribute('data-attached', 'yes');
        return;
      }
      video.src = source;
      video.setAttribute('data-attached', 'yes');
    }

    function playVideo() {
      attachSource();
      video.controls = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        playVideo();
      });
    }
    if (cover) {
      cover.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  };

  ready(function () {
    setupImageHandling();
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
