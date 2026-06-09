(function () {
    function setMessage(box, message) {
        if (!box) {
            return;
        }

        box.textContent = message;
        box.classList.add("is-visible");
    }

    function bindPlayer(player) {
        var video = player.querySelector("video");
        var overlay = player.querySelector(".player-overlay");
        var playButton = player.querySelector("[data-action='play']");
        var errorBox = player.querySelector(".player-error");
        var hlsUrl = player.getAttribute("data-hls");

        if (!video || !hlsUrl) {
            return;
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function showOverlay() {
            if (overlay && video.paused) {
                overlay.classList.remove("is-hidden");
            }
        }

        function startVideo() {
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    setMessage(errorBox, "视频暂时无法播放，请稍后再试");
                });
            }
        }

        function toggleVideo() {
            if (video.paused) {
                startVideo();
            } else {
                video.pause();
            }
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(hlsUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    setMessage(errorBox, "视频暂时无法播放，请稍后再试");
                }
            });
        } else {
            video.src = hlsUrl;
        }

        if (playButton) {
            playButton.addEventListener("click", function (event) {
                event.preventDefault();
                startVideo();
            });
        }

        video.addEventListener("click", toggleVideo);
        video.addEventListener("play", hideOverlay);
        video.addEventListener("pause", showOverlay);
        video.addEventListener("ended", showOverlay);
        video.addEventListener("error", function () {
            setMessage(errorBox, "视频暂时无法播放，请稍后再试");
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        var players = document.querySelectorAll("[data-player]");
        Array.prototype.forEach.call(players, bindPlayer);
    });
})();
