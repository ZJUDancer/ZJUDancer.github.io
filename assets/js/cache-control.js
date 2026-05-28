(function () {
  "use strict";

  var CACHE_PARAM = "_fresh";
  var httpProtocol = /^https?:$/i;
  var cacheControlScript = document.currentScript;

  if (!httpProtocol.test(window.location.protocol)) {
    return;
  }

  function nowToken() {
    return String(Date.now());
  }

  function isSameOrigin(url) {
    return url.origin === window.location.origin;
  }

  function freshUrl(rawUrl) {
    var url;

    try {
      url = new URL(rawUrl, window.location.href);
    } catch (error) {
      return rawUrl;
    }

    if (!isSameOrigin(url)) {
      return rawUrl;
    }

    url.searchParams.set(CACHE_PARAM, nowToken());
    return url.toString();
  }

  window.ZJUDancerCacheControl = {
    param: CACHE_PARAM,
    freshUrl: freshUrl
  };

  function cleanCurrentUrl() {
    var url = new URL(window.location.href);

    url.searchParams.delete(CACHE_PARAM);

    return url.pathname + (url.search ? url.search : "") + url.hash;
  }

  function refreshCurrentDocumentOnce() {
    var url = new URL(window.location.href);

    if (url.searchParams.has(CACHE_PARAM)) {
      window.history.replaceState(null, document.title, cleanCurrentUrl());
      return false;
    }

    url.searchParams.set(CACHE_PARAM, nowToken());
    window.location.replace(url.toString());
    return true;
  }

  if (refreshCurrentDocumentOnce()) {
    return;
  }

  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      window.location.reload();
    }
  });

  document.addEventListener("click", function (event) {
    var link = event.target.closest ? event.target.closest("a[href]") : null;
    var href;

    if (!link) {
      return;
    }

    href = link.getAttribute("href");

    if (!href || href.charAt(0) === "#" || /^(mailto|tel|javascript):/i.test(href)) {
      return;
    }

    link.href = freshUrl(href);
  }, true);

  function refreshElementUrl(element, attribute) {
    var value = element.getAttribute(attribute);
    var updated;

    if (!value || value.charAt(0) === "#" || /^(data|blob|mailto|tel|javascript):/i.test(value)) {
      return;
    }

    updated = freshUrl(value);

    if (updated !== value) {
      element.setAttribute(attribute, updated);
    }
  }

  function refreshPageResources() {
    var selector = [
      'link[rel~="stylesheet"][href]',
      "img[src]",
      "iframe[src]",
      "source[src]",
      "video[src]",
      "audio[src]"
    ].join(",");

    Array.prototype.forEach.call(document.querySelectorAll(selector), function (element) {
      refreshElementUrl(element, element.hasAttribute("href") ? "href" : "src");
    });
  }

  function registerFreshServiceWorker() {
    var swUrl;

    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      return;
    }

    swUrl = cacheControlScript && cacheControlScript.src
      ? new URL("../../sw.js", cacheControlScript.src).toString()
      : new URL("sw.js", window.location.href).toString();

    navigator.serviceWorker.register(swUrl)
      .then(function (registration) {
        if (registration && registration.update) {
          registration.update();
        }
      })
      .catch(function (error) {
        console.warn("Fresh service worker registration failed:", error);
      });
  }

  function onReady() {
    registerFreshServiceWorker();
    refreshPageResources();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
}());
