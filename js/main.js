(function () {
  var config = window.LEP_CONFIG || {};

  var cta = document.getElementById("cta");
  if (cta && config.whatsappUrl) {
    cta.href = config.whatsappUrl;
  }

  function campaignParams() {
    var params = new URLSearchParams(window.location.search);
    var data = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (key) {
      var value = params.get(key);
      if (value) data[key] = value.slice(0, 120);
    });
    return data;
  }

  function loadPixel() {
    if (window.__lepPixelLoaded || !config.pixelId) return;
    window.__lepPixelLoaded = true;

    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", config.pixelId);
    window.fbq("track", "PageView", campaignParams());
  }

  loadPixel();

  if (cta) {
    cta.addEventListener("click", function () {
      if (typeof window.fbq !== "function") return;
      var data = campaignParams();
      data.content_name = "Quero receber ofertas";
      window.fbq("trackCustom", "WhatsAppClick", data);
    });
  }

  var reel = document.querySelector("[data-reel]");
  if (!reel || reel.children.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var first = reel.children[0];
  var clone = first.cloneNode(true);
  clone.removeAttribute("fetchpriority");
  clone.setAttribute("loading", "lazy");
  clone.alt = "";
  reel.appendChild(clone);

  var index = 0;
  var timer = 0;
  var reducedPause = false;

  function stepSize() {
    var slide = reel.children[0];
    var styles = window.getComputedStyle(reel);
    var gap = parseFloat(styles.rowGap || styles.gap) || 0;
    return slide.getBoundingClientRect().height + gap;
  }

  function move(next, animate) {
    index = next;
    reel.style.transition = animate ? "transform 420ms ease" : "none";
    reel.style.transform = "translate3d(0, " + -stepSize() * index + "px, 0)";
  }

  reel.addEventListener("transitionend", function (event) {
    if (event.target !== reel || event.propertyName !== "transform") return;
    if (index >= reel.children.length - 1) move(0, false);
  });

  function stop() {
    window.clearInterval(timer);
    timer = 0;
  }

  function start() {
    if (reducedPause || document.hidden) return;
    stop();
    timer = window.setInterval(function () {
      move(index + 1, true);
    }, 3500);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });

  window.addEventListener("resize", function () {
    move(index, false);
  });

  if (first.complete) start();
  else first.addEventListener("load", start, { once: true });
})();
