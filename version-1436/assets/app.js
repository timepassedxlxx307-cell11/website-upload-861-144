(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = select('[data-menu-button]');
  var mobileNav = select('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function buildSuggestion(item) {
    return '<a href="./' + item.url + '">' +
      '<img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
      '<span><strong>' + item.title + '</strong><em>' + item.year + ' · ' + item.type + '</em></span>' +
      '</a>';
  }

  var searchInput = select('[data-search-input]');
  var suggestBox = select('[data-search-suggest]');

  if (searchInput && suggestBox && Array.isArray(window.SiteSearchData)) {
    searchInput.addEventListener('input', function () {
      var query = searchInput.value.trim().toLowerCase();
      if (!query) {
        suggestBox.classList.remove('is-open');
        suggestBox.innerHTML = '';
        return;
      }
      var results = window.SiteSearchData.filter(function (item) {
        return (item.title + ' ' + item.year + ' ' + item.type + ' ' + item.region + ' ' + item.genre + ' ' + item.oneLine).toLowerCase().indexOf(query) >= 0;
      }).slice(0, 6);
      suggestBox.innerHTML = results.map(buildSuggestion).join('');
      suggestBox.classList.toggle('is-open', results.length > 0);
    });

    document.addEventListener('click', function (event) {
      if (!suggestBox.contains(event.target) && event.target !== searchInput) {
        suggestBox.classList.remove('is-open');
      }
    });
  }

  var hero = select('[data-hero]');
  if (hero) {
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var background = select('[data-hero-background]', hero);
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
      if (background) {
        var image = slides[index].getAttribute('data-bg');
        hero.style.setProperty('--hero-bg', 'url("' + image + '")');
      }
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    var previous = select('[data-hero-prev]', hero);
    var next = select('[data-hero-next]', hero);

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var catalogTools = select('[data-catalog-tools]');
  var catalogGrid = select('[data-catalog-grid]');

  if (catalogTools && catalogGrid) {
    var queryInput = select('[data-catalog-query]', catalogTools);
    var typeSelect = select('[data-catalog-type]', catalogTools);
    var regionSelect = select('[data-catalog-region]', catalogTools);
    var genreSelect = select('[data-catalog-genre]', catalogTools);
    var cards = selectAll('.movie-card', catalogGrid);

    function applyFilters() {
      var query = queryInput.value.trim().toLowerCase();
      var type = typeSelect.value;
      var region = regionSelect.value;
      var genre = genreSelect.value;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre')).toLowerCase();
        var matchesQuery = !query || text.indexOf(query) >= 0;
        var matchesType = !type || card.getAttribute('data-type') === type;
        var matchesRegion = !region || card.getAttribute('data-region') === region;
        var matchesGenre = !genre || card.getAttribute('data-genre').indexOf(genre) >= 0;
        card.classList.toggle('is-hidden', !(matchesQuery && matchesType && matchesRegion && matchesGenre));
      });
    }

    [queryInput, typeSelect, regionSelect, genreSelect].forEach(function (field) {
      field.addEventListener('input', applyFilters);
      field.addEventListener('change', applyFilters);
    });
  }

  var searchPageInput = select('[data-search-page-input]');
  var searchResults = select('[data-search-results]');
  var searchTitle = select('[data-search-title]');

  if (searchPageInput && searchResults && Array.isArray(window.SiteSearchData)) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchPageInput.value = initialQuery;

    function renderSearch() {
      var query = searchPageInput.value.trim().toLowerCase();
      if (!query) {
        return;
      }
      var results = window.SiteSearchData.filter(function (item) {
        return (item.title + ' ' + item.year + ' ' + item.type + ' ' + item.region + ' ' + item.genre + ' ' + item.oneLine).toLowerCase().indexOf(query) >= 0;
      }).slice(0, 72);

      searchTitle.textContent = '“' + searchPageInput.value.trim() + '”相关影片';
      searchResults.innerHTML = results.map(function (item) {
        return '<a class="movie-card" href="./' + item.url + '">' +
          '<span class="poster-wrap"><img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy"><span class="card-badge">' + item.year + '</span><span class="card-type">' + item.type + '</span></span>' +
          '<span class="movie-card-body"><strong>' + item.title + '</strong><em>' + item.region + ' · ' + item.genre + '</em><span class="card-summary">' + item.oneLine + '</span></span>' +
          '</a>';
      }).join('');
    }

    renderSearch();
    searchPageInput.addEventListener('input', renderSearch);
  }
})();
