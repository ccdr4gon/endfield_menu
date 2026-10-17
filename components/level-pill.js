/* Exploration level pill. It rides on the lower-left of the disc rim, inside the disc cylinder.
   Everything is laid out in the pill's own px, measured on the reference screenshot: one translucent capsule
   carrying the yellow tab, the radar (the game's artwork, button-art.js), the label, a band of dim stripes under
   the level number and the round "i" button at the right end. The game draws the pill slightly askew on the disc
   rim; the face's lean matrix reproduces that. */
(function () {
  "use strict";
  const EF = window.EF;

  EF.addStyle("level-pill", `
.ef-core__lvl { position: absolute; left: 5.42px; top: 735.76px; width: 279.2px; height: 40.9px; color: #fff; pointer-events: auto; }
/* lean matrix: the capsule's long edges climb 1.8deg to the right while its uprights stay nearly upright */
.ef-lvl__face {
  position: absolute; inset: 0; border-radius: 20.45px; background: rgba(72,72,72,0.72);
  transform: matrix(1, -0.0318, 0.008, 1, 0, 0); transform-origin: 0 0;
}
.ef-lvl__face > * { position: absolute; }
.ef-lvl__bar { left: 1.75px; top: 10.7px; width: 5.1px; height: 19.4px; background: #FFDC3C; }
.ef-lvl__icon { left: 10px; top: 6px; width: 46px; height: 30px; overflow: visible; fill: #fff; }
.ef-lvl__label { left: 58.05px; top: 8.05px; font: 400 21.3px/1 var(--ef-font-cn); white-space: nowrap; }
/* stripes at 51deg, 3.17px apart, phased as in the game; the band runs on under the "i" */
.ef-lvl__hatch {
  left: 157.6px; top: 12.9px; width: 92px; height: 14.25px;
  background: repeating-linear-gradient(129.2deg, rgba(255,255,255,0.33) -0.13px 1.07px, rgba(255,255,255,0) 1.07px 3.042px);
}
/* the game's digits are wider than Inter's: widened like the top bar's numbers */
.ef-core__lvl b {
  left: 174.72px; top: 0.98px; font: 500 39.2px/1 var(--ef-font-num); letter-spacing: -0.93px;
  transform: scaleX(1.095); transform-origin: 0 0;
}
.ef-lvl__info {
  left: 242.64px; top: 4.3px; width: 32.4px; height: 32.4px; border-radius: 50%; background: #F5F3F1; cursor: help;
  --ef-h: 4; --ef-shx0: 1; --ef-shy0: 1;
  box-shadow: calc((var(--ef-shx0) + var(--ef-swx, 0) * var(--ef-h)) * 1px)
              calc((var(--ef-shy0) + var(--ef-swy, 0) * var(--ef-h)) * 1px)
              8px rgba(0,0,0,0.8);
}
/* the "i": a rounded dot over a rounded stem */
.ef-lvl__info::before, .ef-lvl__info::after { content: ""; position: absolute; left: 13.9px; width: 5px; border-radius: 1.2px; background: #696766; }
.ef-lvl__info::before { top: 4.93px; height: 5.09px; }
.ef-lvl__info::after { top: 12.47px; height: 14.17px; }

/* Open and close, measured on the game's exploration level pill (times in this page's timeline, see index.html). The
   pill itself takes part in the cylinder's 3D, so it only switches visibility; the leaning face inside is flat and fades
   and moves as a whole (capsule and readouts). Open: shows at 460 ms and fades in over 45 ms. Close: the face fades out
   at 75-150 ms while sinking 9.3 px (50-150 ms, power2 out), and the pill is hidden from 150 ms. */
@media (prefers-reduced-motion: no-preference) {
  body.ef-in .ef-core__lvl { animation: efLvlHidden 460ms 0ms linear; }
  body.ef-in .ef-lvl__face { animation: efLvlIn 45ms 460ms linear both; }
  body.ef-out .ef-core__lvl { animation: efLvlOff 1ms 150ms linear both; }
  body.ef-out .ef-lvl__face { animation: efLvlOut 75ms 75ms linear both, efLvlDrop 100ms 50ms cubic-bezier(.333,1,.667,1) both; }
}
@keyframes efLvlHidden { from, to { visibility: hidden; } }
@keyframes efLvlIn { from { opacity: 0; } }
@keyframes efLvlOff { to { visibility: hidden; } }
@keyframes efLvlOut { to { opacity: 0; } }
@keyframes efLvlDrop { to { translate: 0 9.3px; } }
`);

  const HTML = `
<div class="ef-core__lvl"><div class="ef-lvl__face">
  <i class="ef-lvl__bar"></i><svg class="ef-lvl__icon" viewBox="10 6 46 30" aria-hidden="true"><use href="#art-level-radar"></use></svg>
  <span class="ef-lvl__label">探索等级</span><i class="ef-lvl__hatch"></i><b>07</b>
  <button class="ef-lvl__info" data-action="level-info" title="说明" aria-label="说明" data-ef-shadow=""></button>
</div></div>`;

  function mount(core) {
    core.insertAdjacentHTML("beforeend", HTML);
    // floats as high as the top bar's readouts, but stays where the disc rim puts it at rest
    EF.scene.attach(core.lastElementChild, EF.scene.LAYERS.top, { rest: EF.scene.PARTS.level });
  }

  EF.levelPill = { mount };
})();
