
(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function debounce(fn, delay) {
    let timer = null;
    return function () {
      const args = arguments;
      const ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, delay);
    };
  }

  function initMobileMenu() {
    const btn = $('[data-menu-toggle]');
    const panel = $('[data-mobile-nav]');
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      btn.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    const slider = $('[data-hero-slider]');
    if (!slider) return;
    const slides = $all('[data-hero-slide]', slider);
    const dots = $all('[data-hero-dot]', slider);
    const prev = $('[data-hero-prev]', slider);
    const next = $('[data-hero-next]', slider);
    if (!slides.length) return;

    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
    if (next) next.addEventListener('click', function () { show(index + 1); start(); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function movieToCard(movie) {
    const article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = '\n      <a class="movie-link" href="movie-' + movie.id + '.html">\n        <div class="movie-poster" style="background-image:url(' + JSON.stringify(movie.cover) + ')">\n          <div class="poster-badge">' + escapeHtml(movie.year) + '</div>\n        </div>\n        <div class="movie-body">\n          <h3 class="movie-title">' + escapeHtml(movie.title) + '</h3>\n          <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>\n          <p class="movie-excerpt">' + escapeHtml(movie.one_line) + '</p>\n        </div>\n      </a>';
    return article;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    const form = $('[data-search-form]');
    const results = $('[data-search-results]');
    const pager = $('[data-search-pager]');
    const summary = $('[data-search-summary]');
    if (!form || !results || !window.MOVIE_DATA) return;

    const input = $('[data-search-input]', form);
    const category = $('[data-search-category]', form);
    const year = $('[data-search-year]', form);
    const params = new URLSearchParams(location.search);
    if (input && params.get('q')) input.value = params.get('q');
    if (category && params.get('category')) category.value = params.get('category');
    if (year && params.get('year')) year.value = params.get('year');

    let page = 1;
    const pageSize = 24;
    let filtered = window.MOVIE_DATA.slice();

    function applyFilters() {
      const q = (input && input.value || '').trim().toLowerCase();
      const c = category && category.value || '';
      const y = year && year.value || '';
      filtered = window.MOVIE_DATA.filter(function (movie) {
        const blob = [movie.title, movie.region, movie.type, movie.genre, movie.one_line, movie.summary, movie.category, movie.tags.join(' ')].join(' ').toLowerCase();
        const matchQ = !q || blob.indexOf(q) !== -1;
        const matchC = !c || movie.categorySlug === c || movie.category === c;
        const matchY = !y || movie.year === y;
        return matchQ && matchC && matchY;
      });
      page = 1;
      render();
    }

    function render() {
      results.innerHTML = '';
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      page = Math.min(page, totalPages);
      const slice = filtered.slice((page - 1) * pageSize, page * pageSize);
      slice.forEach(function (movie) {
        results.appendChild(movieToCard(movie));
      });
      summary.textContent = '共找到 ' + total + ' 部影片，当前第 ' + page + ' / ' + totalPages + ' 页';
      pager.innerHTML = '';
      const prev = document.createElement('button');
      prev.type = 'button';
      prev.textContent = '上一页';
      prev.disabled = page <= 1;
      prev.addEventListener('click', function () { page -= 1; render(); });
      const next = document.createElement('button');
      next.type = 'button';
      next.textContent = '下一页';
      next.disabled = page >= totalPages;
      next.addEventListener('click', function () { page += 1; render(); });
      const pageTag = document.createElement('span');
      pageTag.textContent = page + ' / ' + totalPages;
      pager.appendChild(prev);
      pager.appendChild(pageTag);
      pager.appendChild(next);
    }

    const debounced = debounce(applyFilters, 180);
    if (input) input.addEventListener('input', debounced);
    if (category) category.addEventListener('change', applyFilters);
    if (year) year.addEventListener('change', applyFilters);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      applyFilters();
      const params = new URLSearchParams();
      if (input && input.value.trim()) params.set('q', input.value.trim());
      if (category && category.value) params.set('category', category.value);
      if (year && year.value) params.set('year', year.value);
      const url = params.toString() ? ('search.html?' + params.toString()) : 'search.html';
      history.replaceState(null, '', url);
    });
    applyFilters();
  }

  function initPlayerShell(shell) {
    if (!shell) return;
    const video = $('.movie-video', shell);
    const playBtn = $('[data-player-play]', shell);
    const status = $('[data-player-status]', shell);
    const source = shell.getAttribute('data-source');
    const poster = shell.getAttribute('data-poster');
    if (!video || !source) return;
    if (poster) video.setAttribute('poster', poster);

    let hls = null;
    function setStatus(msg) {
      if (status) status.textContent = msg || '';
    }

    function playVideo() {
      const p = video.play();
      if (p && p.catch) {
        p.catch(function () {
          setStatus('请点击视频区域开始播放');
        });
      }
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('点击播放即可观看');
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('视频加载异常，正在尝试恢复');
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('点击播放即可观看');
    } else {
      setStatus('当前浏览器不支持 HLS 播放');
    }

    if (playBtn) playBtn.addEventListener('click', function () {
      playVideo();
    });
    video.addEventListener('click', function () {
      playVideo();
    });
    video.addEventListener('play', function () {
      setStatus('正在播放');
      if (playBtn) playBtn.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      setStatus('已暂停');
      if (playBtn) playBtn.classList.remove('is-hidden');
    });
  }

  function initPlayerPage() {
    const shell = $('[data-player]');
    if (shell) initPlayerShell(shell);
    window.initMoviePlayer = initPlayerShell;
  }

  function initBackToTop() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.textContent = '↑';
    btn.setAttribute('aria-label', '返回顶部');
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(btn);
    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-visible', window.scrollY > 480);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initSearchPage();
    initPlayerPage();
    initBackToTop();
  });
})();
