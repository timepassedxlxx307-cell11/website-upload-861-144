(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function root() {
    return document.body ? document.body.getAttribute('data-root') || '' : '';
  }

  function makeUrl(url) {
    if (!url) {
      return '#';
    }
    if (/^(https?:)?\/\//.test(url) || url.charAt(0) === '/') {
      return url;
    }
    return root() + url;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupImageFallback() {
    document.querySelectorAll('img[data-cover]').forEach(function (img) {
      img.addEventListener('error', function () {
        var wrap = img.closest('.poster-wrap, .hero-media, .hero-backdrop, .detail-bg, .detail-poster');
        if (wrap) {
          wrap.classList.add('poster-missing');
        }
        img.remove();
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var active = 0;
    var timer;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }
    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(active + 1);
      }, 6500);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupSuggest() {
    var index = window.MOVIE_INDEX || [];
    document.querySelectorAll('[data-search-input]').forEach(function (input) {
      var form = input.closest('form');
      var panel = form ? form.querySelector('[data-search-suggest]') : null;
      if (!panel) {
        return;
      }
      input.addEventListener('input', function () {
        var q = normalize(input.value);
        if (!q) {
          panel.classList.remove('is-open');
          panel.innerHTML = '';
          return;
        }
        var matches = index.filter(function (item) {
          return normalize(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.genre + ' ' + item.tags).indexOf(q) !== -1;
        }).slice(0, 6);
        if (!matches.length) {
          panel.classList.remove('is-open');
          panel.innerHTML = '';
          return;
        }
        panel.innerHTML = matches.map(function (item) {
          return '<a href="' + escapeHtml(makeUrl(item.url)) + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</span></a>';
        }).join('');
        panel.classList.add('is-open');
      });
      input.addEventListener('blur', function () {
        setTimeout(function () {
          panel.classList.remove('is-open');
        }, 180);
      });
    });
  }

  function setupLocalFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var text = scope.querySelector('[data-filter-text]');
      var year = scope.querySelector('[data-filter-year]');
      var type = scope.querySelector('[data-filter-type]');
      var count = scope.querySelector('[data-filter-count]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      function matchYear(card, value) {
        if (!value) {
          return true;
        }
        var cardYear = card.getAttribute('data-year') || '';
        if (value === '2018') {
          var numeric = parseInt(cardYear, 10);
          return !numeric || numeric <= 2018;
        }
        return cardYear === value;
      }
      function update() {
        var q = normalize(text ? text.value : '');
        var y = year ? year.value : '';
        var t = type ? type.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var typeText = card.getAttribute('data-type') || '';
          var ok = (!q || haystack.indexOf(q) !== -1) && matchYear(card, y) && (!t || typeText.indexOf(t) !== -1 || haystack.indexOf(normalize(t)) !== -1);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = '当前显示 ' + visible + ' 部';
        }
      }
      [text, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', update);
          control.addEventListener('change', update);
        }
      });
      update();
    });
  }

  function movieCard(item) {
    var image = root() + item.cover + '.jpg';
    return '<article class="movie-card" data-card>' +
      '<a class="poster-wrap" href="' + escapeHtml(makeUrl(item.url)) + '">' +
      '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" data-cover>' +
      '<span class="poster-fallback">' + escapeHtml(String(item.title).slice(0, 6)) + '</span>' +
      '<span class="play-chip">▶</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<a class="card-title" href="' + escapeHtml(makeUrl(item.url)) + '">' + escapeHtml(item.title) + '</a>' +
      '<p class="card-meta">' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</p>' +
      '<p class="card-desc">' + escapeHtml(item.oneLine || '') + '</p>' +
      '<div class="tag-row"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
      '</div>' +
      '</article>';
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.MOVIE_INDEX) {
      return;
    }
    var input = document.querySelector('[data-page-search]');
    var region = document.querySelector('[data-page-region]');
    var year = document.querySelector('[data-page-year]');
    var count = document.querySelector('[data-page-count]');
    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    function yearMatch(item, value) {
      if (!value) {
        return true;
      }
      if (value === '2018') {
        var n = parseInt(item.year, 10);
        return !n || n <= 2018;
      }
      return String(item.year) === value;
    }
    function update() {
      var q = normalize(input ? input.value : '');
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      var matched = window.MOVIE_INDEX.filter(function (item) {
        var haystack = normalize(item.title + ' ' + item.region + ' ' + item.year + ' ' + item.type + ' ' + item.genre + ' ' + item.tags + ' ' + item.oneLine);
        return (!q || haystack.indexOf(q) !== -1) && (!r || item.region.indexOf(r) !== -1) && yearMatch(item, y);
      });
      if (count) {
        count.textContent = '找到 ' + matched.length + ' 部';
      }
      results.innerHTML = matched.slice(0, 240).map(movieCard).join('');
      setupImageFallback();
    }
    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', update);
        control.addEventListener('change', update);
      }
    });
    update();
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video[data-hls-src]');
      var button = player.querySelector('[data-play-button]');
      var message = player.querySelector('[data-player-message]');
      if (!video || !button) {
        return;
      }
      var src = video.getAttribute('data-hls-src');
      var hls = null;
      var initialized = false;
      function showMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }
      function initialize() {
        if (initialized) {
          return Promise.resolve();
        }
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showMessage('视频加载失败，请稍后重试');
              if (hls) {
                hls.destroy();
              }
              initialized = false;
            }
          });
          return Promise.resolve();
        }
        showMessage('当前浏览器不支持视频播放');
        return Promise.reject(new Error('unsupported'));
      }
      function play() {
        initialize().then(function () {
          button.classList.add('is-hidden');
          video.play().catch(function () {
            button.classList.remove('is-hidden');
          });
        }).catch(function () {});
      }
      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
          button.classList.remove('is-hidden');
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        button.classList.remove('is-hidden');
      });
    });
  }

  ready(function () {
    setupMobileNav();
    setupImageFallback();
    setupHero();
    setupSuggest();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
