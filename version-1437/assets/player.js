(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector("video[data-stream]");
    var button = shell.querySelector(".play-overlay");
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      var nativeType = video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
      if (nativeType) {
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

    function start() {
      prepare();
      button.classList.add("hidden");
      video.controls = true;
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          button.classList.remove("hidden");
        });
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });
})();
