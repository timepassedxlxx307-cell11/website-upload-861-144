function initMoviePlayer(config) {
  var video = document.getElementById("movie-player");
  var start = document.getElementById("player-start");
  var shell = video ? video.closest(".player-shell") : null;

  if (!video || !config || !config.src) {
    return;
  }

  function setPlayingState() {
    if (shell) {
      shell.classList.toggle("is-playing", !video.paused && !video.ended);
    }
  }

  function playVideo() {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (config.poster) {
    video.setAttribute("poster", config.poster);
  }

  if (window.Hls && window.Hls.isSupported()) {
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(config.src);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = config.src;
  } else {
    video.src = config.src;
  }

  if (start) {
    start.addEventListener("click", function () {
      playVideo();
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", setPlayingState);
  video.addEventListener("pause", setPlayingState);
  video.addEventListener("ended", setPlayingState);
}
