/* Bootstrap: mounts every component into its scene layer, scales the 1920×1080 stage to the window,
   plays the entrance animation and handles closing / reopening the menu.
   Buttons report clicks as a DOM event: document.addEventListener("ef-action", e => e.detail.action). */
(function () {
  "use strict";
  const EF = window.EF;
  const ENTRANCE_MS = 900;   // every entrance animation finishes within this (the last, the slide of the cards and tiles, by ~890 ms)
  const EXIT_MS = 500;       // every exit animation finishes within this; the backdrop's cut back to the wallpaper is the last
  const EXIT_FALLBACK_MS = EXIT_MS + 250;   // closes anyway when that cut never reports its end (hidden page, cancelled animation)
  const reducedMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  function mountAll() {
    const layer = EF.scene.layer;
    EF.scene.init();
    EF.backdrop.mount(document.getElementById("efWorld"));
    EF.leftCards.mount(layer("cards"), layer("deck"));
    EF.badge.mount(layer("cards"));
    EF.rightTiles.mount(layer("tiles"));
    EF.news.mount(layer("news"), layer("deck"));
    const core = EF.disc.mount(layer("core"));
    EF.skeleton.mount(core);
    EF.dial.mount(core);
    EF.levelPill.mount(core);
    EF.energy.mount(layer("btns"));
    EF.discButtons.mount(layer("btns"));
    EF.topBar.mount(layer("top"));
    EF.hud.mount({ cards: layer("cards"), tiles: layer("tiles"), stage: document.querySelector(".ef-stage") });
  }

  /** Scales the stage to the window. The rounded scale goes to the stage and the wallpaper, the only readers of
      --ef-stage-scale (it does not inherit, see index.html), and to EF.stageScale for scripts (the tile column's
      drag), so both see the same 4-decimal value. */
  function fit() {
    const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
    if (!vw || !vh) return;
    const s = Math.min(vw / 1920, vh / 1080).toFixed(4);
    document.querySelector(".ef-stage").style.setProperty("--ef-stage-scale", s);
    document.querySelector(".ef-wallpaper").style.setProperty("--ef-stage-scale", s);
    EF.stageScale = Number(s);
  }

  let entranceTimer = 0;
  function playEntrance() {
    clearTimeout(entranceTimer);
    document.body.classList.remove("ef-in");
    void document.body.offsetWidth;   // restart the CSS animations
    document.body.classList.add("ef-in");
    entranceTimer = setTimeout(function () { document.body.classList.remove("ef-in"); }, ENTRANCE_MS);
  }

  /** Closing plays the exit (body.ef-out) and adds body.ef-closed once the backdrop has cut back to the wallpaper.
      That waits for the cut's animationend: CSS animations only start counting on the first frame after the class
      is added (7-42 ms after a timer would), so a 500 ms timer would chop off the end of the cut. body.ef-out stays
      until the menu reopens, holding every part on its last exit frame, so the closed state's own fade has nothing
      left to show. Reopening during the exit cancels it; with reduced motion the menu closes at once. */
  let exitTimer = 0;
  function setClosed(closed) {
    const body = document.body;
    if (closed) {
      if (body.classList.contains("ef-closed") || body.classList.contains("ef-out")) return;
      clearTimeout(entranceTimer);
      body.classList.remove("ef-in");
      EF.scene.pause();
      EF.news.pause();
      if (reducedMotion && reducedMotion.matches) { closeNow(); return; }
      void body.offsetWidth;   // restart the exit animations
      body.classList.add("ef-out");
      document.addEventListener("animationend", onExitEnd);
      exitTimer = setTimeout(closeNow, EXIT_FALLBACK_MS);
    } else {
      stopExitWait();   // reopening during the exit cancels it
      body.classList.remove("ef-out", "ef-closed");
      EF.scene.resume();
      EF.news.resume();
      playEntrance();
    }
  }
  /* only the backdrop's cut ends the exit: every other part has finished before it */
  function onExitEnd(e) { if (e.animationName === "efBackdropOut") closeNow(); }
  function stopExitWait() {
    clearTimeout(exitTimer);
    exitTimer = 0;
    document.removeEventListener("animationend", onExitEnd);
  }
  function closeNow() {
    stopExitWait();
    document.body.classList.add("ef-closed");
  }

  function bindEvents() {
    document.addEventListener("click", function (e) {
      const el = e.target.closest("[data-action]");
      if (!el) return;
      if (el.dataset.action === "close") setClosed(true);
      else document.dispatchEvent(new CustomEvent("ef-action", { detail: { action: el.dataset.action } }));
    });
    document.getElementById("efMenu").addEventListener("click", function (e) {
      if (e.target === e.currentTarget) setClosed(true);   // click on the letterbox around the stage
    });
    document.getElementById("efClosedHint").addEventListener("click", function () { setClosed(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setClosed(!document.body.classList.contains("ef-closed") && !document.body.classList.contains("ef-out"));
    });
    window.addEventListener("resize", fit);
  }

  mountAll();
  bindEvents();
  fit();
  setTimeout(playEntrance, 80);   // give fonts and layout a moment before the first entrance
})();
