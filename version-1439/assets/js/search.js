(function () {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getQuery() {
    return new URLSearchParams(window.location.search).get("q") || "";
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class=\"movie-card\" data-search=\"" + escapeHtml([movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ")) + "\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
        "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
        "<span class=\"poster-shade\"></span><span class=\"play-chip\">▶</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
        "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>" +
        "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
        "<p>" + escapeHtml(movie.oneLine) + "</p>" +
        "<div class=\"movie-tag-row\">" + tags + "</div>" +
      "</div>" +
    "</article>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var movies = window.SEARCH_MOVIES || [];
    var query = getQuery().trim();
    var input = document.querySelector(".page-search input[name='q']");
    var title = document.querySelector("[data-search-title]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");

    if (input) {
      input.value = query;
    }
    if (title) {
      title.textContent = query ? "搜索结果：" + query : "热门影片";
    }

    var normalized = query.toLowerCase();
    var matched = movies.filter(function (movie) {
      if (!normalized) {
        return true;
      }
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
      return text.indexOf(normalized) !== -1;
    }).slice(0, 120);

    if (results) {
      results.innerHTML = matched.map(card).join("");
    }
    if (empty) {
      empty.hidden = matched.length !== 0;
    }
  });
})();
