import { H as Hls } from "./video-vendor-dru42stk.js";

export function initMoviePlayer(videoId, streamUrl) {
  var video = document.getElementById(videoId);
  var cover = document.querySelector("[data-player-cover]");
  var start = document.querySelector("[data-player-start]");
  var loaded = false;
  var hls = null;

  if (!video || !streamUrl) {
    return;
  }

  function attach() {
    if (loaded) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      loaded = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      loaded = true;
      return;
    }

    video.src = streamUrl;
    loaded = true;
  }

  function hideCover() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  }

  function play() {
    attach();
    hideCover();
    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (cover) {
    cover.addEventListener("click", play);
  }

  if (start) {
    start.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("play", hideCover);
  video.addEventListener("loadedmetadata", function () {
    video.controls = true;
  });

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
