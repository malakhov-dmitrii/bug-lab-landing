(() => {
  "use strict";

  function init() {
    const root = document.documentElement;
    const languageButtons = document.querySelectorAll("button[data-set-lang]");
    const video = document.querySelector("#gameplay-video");
    const watchButton = document.querySelector("#watch-video");
    const videoError = document.querySelector("#video-error");
    const videoFallback = document.querySelector("#video-fallback");
    const labels = { ru: "Смотреть игру", en: "Watch gameplay" };

    function normalizeLanguage(value) {
      return value === "en" ? "en" : "ru";
    }

    function initialLanguage() {
      const query = new URLSearchParams(window.location.search);
      if (query.has("lang")) return normalizeLanguage(query.get("lang"));

      try {
        return normalizeLanguage(window.localStorage.getItem("buglab-lang"));
      } catch {
        return "ru";
      }
    }

    function applyLanguage(value) {
      const language = normalizeLanguage(value);
      root.lang = language;
      root.dataset.lang = language;
      languageButtons.forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.setLang === language),
        );
      });
      video?.setAttribute("aria-label", labels[language]);
      watchButton?.setAttribute("aria-label", labels[language]);
      return language;
    }

    languageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const language = applyLanguage(button.dataset.setLang);
        try {
          window.localStorage.setItem("buglab-lang", language);
        } catch {
          // The selected language still applies when storage is unavailable.
        }
      });
    });
    applyLanguage(initialLanguage());

    if (!video || !watchButton) return;
    video.controls = false;

    function showWatchButton() {
      watchButton.hidden = false;
      watchButton.disabled = false;
    }

    function showVideoError() {
      showWatchButton();
      video.controls = true;
      if (videoError) videoError.hidden = false;
      const source = video.currentSrc || video.getAttribute("src");
      if (videoFallback && source) videoFallback.setAttribute("href", source);
    }

    function showPlayback() {
      if (video.paused || video.ended) return;
      watchButton.hidden = true;
      watchButton.disabled = false;
      if (videoError) videoError.hidden = true;
    }

    watchButton.addEventListener("click", async () => {
      watchButton.disabled = true;
      video.controls = true;
      try {
        await video.play();
        showPlayback();
      } catch {
        showVideoError();
      }
    });

    video.addEventListener("play", () => {
      // A play request can precede loading; retain the button until frames exist.
      if (video.readyState >= 3) showPlayback();
    });
    video.addEventListener("playing", showPlayback);
    video.addEventListener("ended", () => {
      showWatchButton();
      video.controls = false;
    });
    video.addEventListener("error", showVideoError);
    if (video.error) showVideoError();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
