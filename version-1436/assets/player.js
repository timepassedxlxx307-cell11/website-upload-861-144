(function () {
  function prepareVideo(video) {
    if (!video || video.dataset.ready === 'true') {
      return;
    }

    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.dataset.ready = 'true';
      video.hlsController = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
      video.src = stream;
      video.dataset.ready = 'true';
      return;
    }

    video.src = stream;
    video.dataset.ready = 'true';
  }

  function startPlayback(button) {
    var target = button.getAttribute('data-play-button');
    var video = document.getElementById(target);
    if (!video) {
      return;
    }

    prepareVideo(video);
    button.classList.add('is-hidden');

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  document.querySelectorAll('video[data-stream]').forEach(function (video) {
    video.addEventListener('click', function () {
      prepareVideo(video);
    });
  });

  document.querySelectorAll('[data-play-button]').forEach(function (button) {
    button.addEventListener('click', function () {
      startPlayback(button);
    });
  });
})();
