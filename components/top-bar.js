/* Top bar above the disc: two currencies and the stamina pill, each with a "+" button.
   It floats on its own layer above the dial rings. As in the game, the stamina pill lies on the floor plane
   (foreshortened with the rest of the menu) while the two currency counters face the camera like billboards:
   their group is tilted back by the camera's resting pitch, so the badge, the number and the round "+" are seen
   flat on. Badges are the game's artwork (button-art.js); positions, sizes and number widths were measured on
   the reference screenshot, each counter in its own frame. */
(function () {
  "use strict";
  const EF = window.EF;

  EF.addStyle("top-bar", `
/* The billboards need a real 3D context: this layer and the bar keep their children in the scene's 3D space. */
.ef-lyr:has(> .ef-topbar), .ef-topbar { transform-style: preserve-3d; }
.ef-topbar { position: absolute; inset: 0; }
.ef-topbar > * { position: absolute; width: 0; height: 0; transform-origin: 0 0; pointer-events: auto; }
.ef-topbar > * > * { position: absolute; }
.ef-cur { transform: rotateX(-20deg) rotate(-1.7deg); }   /* 20deg = the camera's resting pitch (shared-scene.js) */
.ef-topbar b { left: 0; top: 0; color: #fff; white-space: nowrap; transform-origin: 0 0; }
.ef-cur b { font: 600 33.6px/1 var(--ef-font-en); transform: scaleX(1.06); }
.ef-topbar__badge { overflow: visible; pointer-events: none; }
.ef-topbar__badge--a { left: -26px; top: -24px; width: 52px; height: 48px; filter: drop-shadow(0 0 1.6px rgba(255,190,20,1)) drop-shadow(0 0 4.5px rgba(240,150,0,0.9)); }
.ef-topbar__badge--b { left: -26px; top: -26px; width: 52px; height: 52px; filter: drop-shadow(0 0 1.4px rgba(255,140,60,0.95)) drop-shadow(0 0 3.5px rgba(225,100,30,0.8)); }
.ef-plus { border-radius: 50%; padding: 0; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: transform 0.15s, background 0.15s; }
.ef-plus svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.ef-plus:hover { transform: scale(1.06); }
.ef-cur .ef-plus { width: 43.8px; height: 43.8px; margin: -21.9px 0 0 -21.9px; }
.ef-cur .ef-plus path { fill: #151515; }

.ef-stamina { transform: rotate(-1.96deg); }
.ef-stamina__pill { left: -53px; top: -32.3px; width: 316px; height: 54.5px; border-radius: 27.25px; background: #343636; }
.ef-topbar__badge--stamina { left: -50px; top: -50px; width: 105px; height: 95px; }
.ef-stamina b { font: 600 36.6px/1 var(--ef-font-en); transform: scaleX(1.111); }
.ef-stamina i { left: 200.25px; top: -17.5px; width: 2.5px; height: 23.5px; background: #5f5e5e; }
.ef-stamina .ef-plus { width: 46.2px; height: 46.2px; margin: -23.1px 0 0 -23.1px; background: #efeded; }
.ef-stamina .ef-plus:hover { background: #f8f7f7; }
.ef-stamina .ef-plus path { fill: #3c3b3a; }

/* Open and close, measured on the game's top bar (times in this page's timeline, see index.html). From 390 ms every part
   flickers on by steps on a 50 ms grid, with the system buttons (hud.js), each on its own measured levels (step-end:
   each level holds until the next): the first currency's badge and number blink like the settings button, its "+" on
   its own beat, the second badge shows at once at 515 ms, its number and "+" climb to full, and the stamina pill blinks
   up from 465 ms. On close the currencies step down to 0.5 at 60 ms and are gone at 75 ms; the stamina pill drops to
   0.63 at 75 ms and is gone at 125 ms, drifting (-1.5, 7.5) px. Parts are named by class, one selector each (a new one
   needs a class here, or its own rule): a universal selector would make every body.ef-in and body.ef-out toggle
   restyle the whole page, and a class list inside :is() would be tested against every element the page restyles. */
@media (prefers-reduced-motion: no-preference) {
  body.ef-in .ef-cur--a > .ef-topbar__badge, body.ef-in .ef-cur--a > .ef-cur__num { animation: efTopGoldIn 350ms 390ms step-end both; }
  body.ef-in .ef-cur--a > .ef-plus { animation: efTopGoldPlusIn 350ms 390ms step-end both; }
  body.ef-in .ef-cur--b > .ef-topbar__badge { animation: efTopCoinIn 350ms 390ms step-end both; }
  body.ef-in .ef-cur--b > .ef-cur__num, body.ef-in .ef-cur--b > .ef-plus { animation: efTopOrangeIn 350ms 390ms step-end both; }
  body.ef-in .ef-stamina { animation: efTopPillIn 350ms 390ms step-end both; }
  body.ef-out .ef-cur { animation: efTopCurOut 200ms 0ms step-end both; }
  body.ef-out .ef-stamina { animation: efTopPillOut 200ms 0ms step-end both, efTopPillDrift 75ms 50ms linear both; }
}
@keyframes efTopGoldIn { 0% { opacity: 0; } 35.7% { opacity: 0.77; } 50% { opacity: 0.92; } 64.3% { opacity: 0; } 78.6% { opacity: 0.73; } 92.9% { opacity: 0.9; } 100% { opacity: 1; } }
@keyframes efTopGoldPlusIn { 0% { opacity: 0; } 35.7% { opacity: 0.95; } 50% { opacity: 0; } 64.3% { opacity: 0.55; } 78.6% { opacity: 0.97; } 92.9%, 100% { opacity: 1; } }
@keyframes efTopCoinIn { 0% { opacity: 0; } 35.7%, 100% { opacity: 1; } }
@keyframes efTopOrangeIn { 0% { opacity: 0; } 35.7% { opacity: 0.86; } 50% { opacity: 0.95; } 64.3% { opacity: 0.97; } 78.6% { opacity: 0.99; } 100% { opacity: 1; } }
@keyframes efTopPillIn { 0% { opacity: 0; } 21.4% { opacity: 0.26; } 35.7% { opacity: 0.71; } 50% { opacity: 0.08; } 64.3% { opacity: 0.45; } 78.6% { opacity: 0.9; } 92.9% { opacity: 0.97; } 100% { opacity: 1; } }
@keyframes efTopCurOut { 0% { opacity: 1; } 30% { opacity: 0.5; } 37.5%, 100% { opacity: 0; } }
@keyframes efTopPillOut { 0% { opacity: 1; } 37.5% { opacity: 0.63; } 62.5%, 100% { opacity: 0; } }
@keyframes efTopPillDrift { from { translate: 0px 0px; } to { translate: -1.5px 7.5px; } }
`);

  /** "+" glyphs: the currencies' cross leaves a small square open in the middle; the stamina one is solid. */
  const CROSS_GAP = "M-14.5 -2.1h11.9v4.2h-11.9zM2.6 -2.1h11.9v4.2h-11.9zM-2.1 -14.5h4.2v11.9h-4.2zM-2.1 2.6h4.2v11.9h-4.2z";
  const CROSS_SOLID = "M-11.85 -1h23v4.4h-23zM-2.55 -10.3h4.4v23h-4.4z";
  function plus(action, x, y, r, d) {
    return '<button class="ef-plus" data-action="' + action + '" title="获取" style="left:' + x + "px;top:" + y + 'px;">' +
      '<svg viewBox="' + -r + " " + -r + " " + 2 * r + " " + 2 * r + '" aria-hidden="true"><path d="' + d + '"></path></svg></button>';
  }
  function badge(kind, art, viewBox) {
    return '<svg class="ef-topbar__badge ef-topbar__badge--' + kind + '" viewBox="' + viewBox + '" aria-hidden="true"><use href="#art-' + art + '"></use></svg>';
  }

  /* Each counter sits at a stage point (left/top) and is laid out around it in its own frame: the currencies in
     CSS px as seen on screen, the stamina pill in stage px along the pill. */
  const HTML = `
<div class="ef-topbar">
  <div class="ef-cur ef-cur--a" style="left: 764.53px; top: 106.87px;">${badge("a", "counter-a", "-26 -24 52 48")}<b class="ef-cur__num" style="left: 32.45px; top: -15.63px;">355</b>${plus("topup-a", 121.63, 1.18, 21.9, CROSS_GAP)}</div>
  <div class="ef-cur ef-cur--b" style="left: 968.01px; top: 100.25px;">${badge("b", "counter-b", "-26 -26 52 52")}<b class="ef-cur__num" style="left: 32.47px; top: -15.95px;">123040</b>${plus("topup-b", 172.34, 1.22, 21.9, CROSS_GAP)}</div>
  <div class="ef-stamina" style="left: 599.2px; top: 211.31px;"><span class="ef-stamina__pill"></span>${badge("stamina", "stamina", "-50 -50 105 95")}<b style="left: 55.79px; top: -21.92px;">178/360</b><i></i>${plus("stamina", 236.2, -6.3, 23.1, CROSS_SOLID)}</div>
</div>`;

  function mount(layer) {
    layer.insertAdjacentHTML("beforeend", HTML);
  }

  EF.topBar = { mount };
})();
