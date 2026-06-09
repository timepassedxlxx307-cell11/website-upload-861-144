(function () {
    function each(list, callback) {
        Array.prototype.forEach.call(list, callback);
    }

    function text(value) {
        return (value || "").toString().toLowerCase();
    }

    document.addEventListener("DOMContentLoaded", function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", mobileNav.classList.contains("is-open") ? "true" : "false");
            });
        }

        each(document.querySelectorAll("[data-hero-slider]"), function (slider) {
            var slides = slider.querySelectorAll("[data-hero-slide]");
            var dots = slider.querySelectorAll("[data-hero-dot]");
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }

                index = (nextIndex + slides.length) % slides.length;

                each(slides, function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });

                each(dots, function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                    dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
                });
            }

            function move(step) {
                show(index + step);
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    move(1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    move(-1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    move(1);
                    start();
                });
            }

            each(dots, function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });

            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);

            show(0);
            start();
        });

        each(document.querySelectorAll("[data-filter-input]"), function (input) {
            var targetSelector = input.getAttribute("data-filter-input");
            var cards = document.querySelectorAll(targetSelector);
            var empty = document.querySelector("[data-empty-state]");

            function update() {
                var keyword = text(input.value).trim();
                var visible = 0;

                each(cards, function (card) {
                    var haystack = text(card.getAttribute("data-search"));
                    var matched = !keyword || haystack.indexOf(keyword) !== -1;
                    card.classList.toggle("hidden-by-search", !matched);

                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            input.addEventListener("input", update);
            update();
        });
    });
})();
