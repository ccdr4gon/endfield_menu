/* Transition skeleton: the dotted disc of the game's open and close transitions. It only shows while the menu opens
   (body.ef-in) or closes (body.ef-out); at rest it is hidden. One flat SVG in the disc cylinder, just under the amber
   ring (z -62, real projection), so it tilts and shrinks with the disc's pose. Its drawing is the game's disc, scaled
   so that the game's rim (R 512.73) lands on the amber ring (r 466): K = 466 / 512.73.
   - the dots: the game's staggered rows with the same seeded jitter; they spin in on open and flicker on close;
   - the dark ring: sweeps out from a small circle on the far side and settles into the rim's dark band (open);
   - the cyan reticle: rises from the front edge to the centre while it grows (open), and shows dim on close;
   - three guide lines through the reticle's centre, ten scattered crosses and a thin outer ring (end of the close).
   mount(core) mounts it into the disc. */
(function () {
  "use strict";
  const EF = window.EF;

  EF.addStyle("transition-skeleton", `
.ef-skel { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; visibility: hidden; }
/* transparent at rest: every group lights up only in the transition keyframes (all flat svg children, which may fade,
   change colour and move by their own transforms) */
.ef-skel__dark, .ef-skel__outer, .ef-skel__dots, .ef-skel__xh, .ef-skel__gd { opacity: 0; }
.ef-skel__ret { color: rgba(84,192,230,0); }
.ef-skel__xh { transform-origin: 0 -36.4px; }   /* the crosses spread from the game's (0, -40) */
.ef-skel__xm { scale: 1.75; }                   /* a cross's size once spread (the close flash uses it as it is) */

/* Times in this page's timeline, see index.html. */
@media (prefers-reduced-motion: no-preference) {
  /* inherit rather than visible: hidden with its ancestors, as with the disc before its pose starts */
  body.ef-in .ef-skel, body.ef-out .ef-skel { visibility: inherit; }
  /* dots: from 60 ms they brighten to 0.55 (power1 out) while spinning in from 20deg (power2 out, 60-210 ms); as the
     map shows they fade out (power1 in, 355-390 ms) */
  body.ef-in .ef-skel__dots { animation: efSkelDots 330ms 60ms linear both, efSkelSpin 150ms 60ms cubic-bezier(.333,1,.667,1) both; }
  /* dark ring: at 85 ms a small circle shows on the far side (disc y -0.343 R), sweeps over the rim and settles at the
     width of the rim's dark band by 350 ms; at 370-450 ms it fades out (power1 in), leaving the band itself */
  body.ef-in .ef-skel__dark { animation: efSkelDark 365ms 85ms linear both; }
  /* cyan reticle: shows on the front edge at 75 ms and rises to the centre (screen rows 684 to 561, disc y 730 to 80)
     while growing; it pales from 200 ms, here all the way out */
  body.ef-in .ef-skel__ret { animation: efSkelRet 315ms 75ms linear both; }
  body.ef-in .ef-skel__rs { animation: efSkelRetGrow 265ms 85ms linear both; }
  /* guides: three straight lines on the disc's plane (-8 / -55 / 40deg) through the reticle's centre; at 170-430 ms they
     lengthen as the disc rises, then fade */
  body.ef-in .ef-skel__gd { animation: efSkelGuides 260ms 170ms linear both; }
  /* crosses: 230-390 ms; they spread from near the game's (0, -40) (power1 out, 250-320 ms) and grow from 0.75 to 1.75 */
  body.ef-in .ef-skel__xh { animation: efSkelCrosses 160ms 230ms linear both, efSkelSpread 70ms 250ms cubic-bezier(.333,.667,.667,1) both; }
  body.ef-in .ef-skel__xm { animation: efSkelMark 70ms 250ms cubic-bezier(.333,.667,.667,1) both; }
  /* close: while the map is out (180-200 ms) the skeleton flashes (dots at 0.3, the crosses, the guides at 0.16 and
     turned -6deg, the reticle dim cyan) and goes out at 215-235 ms as the map lights up again; at 270-290 ms the dots
     show once more and leave with the stage. The reticle is held on screen row 561, so it slides off the front edge as
     the disc shrinks; the thin outer ring shows at 260-280 ms. */
  body.ef-out .ef-skel__dots { animation: efSkelDotsOut 110ms 180ms linear both; }
  body.ef-out .ef-skel__xh { animation: efSkelCrossesOut 55ms 180ms linear both; }
  body.ef-out .ef-skel__gd { animation: efSkelGuidesOut 55ms 180ms linear both; }
  body.ef-out .ef-skel__ret { animation: efSkelRetOut 195ms 150ms linear both; }
  body.ef-out .ef-skel__outer { animation: efSkelOuter 20ms 260ms linear both; }
}
@keyframes efSkelDots { 0% { opacity: 0; animation-timing-function: cubic-bezier(.333,.667,.667,1); } 15.15%, 89.39% { opacity: 0.55; animation-timing-function: cubic-bezier(.333,0,.667,.333); } 100% { opacity: 0; } }
@keyframes efSkelSpin { from { rotate: 20deg; } to { rotate: 0deg; } }
@keyframes efSkelDark {
  0% { opacity: 0; r: 14px; cy: -159.9px; stroke-width: 9.1px; }
  5.48% { opacity: 0.9; }
  17.81% { r: 51.3px; cy: -159.9px; stroke-width: 11.8px; }
  31.51% { r: 97.9px; cy: -154.2px; stroke-width: 19.1px; }
  45.21% { r: 200.4px; cy: -125.8px; stroke-width: 32.7px; }
  58.9% { r: 438px; cy: 0px; stroke-width: 58.2px; }
  72.6% { r: 623.5px; stroke-width: 107px; }
  78.08% { opacity: 0.9; animation-timing-function: cubic-bezier(.333,0,.667,.333); }
  100% { opacity: 0; r: 623.5px; cy: 0px; stroke-width: 107px; }
}
@keyframes efSkelRet {
  0% { translate: -3.3px 663.6px; color: rgba(84,192,230,0); }
  3.17% { translate: -3.3px 663.6px; }
  6.35% { translate: -3.3px 532.7px; color: rgba(84,192,230,0.92); }
  7.94% { translate: -3.3px 490.9px; }
  14.29% { translate: -3.3px 391.8px; }
  23.81% { translate: -3.3px 329px; }
  30.16% { translate: -3.3px 309.1px; }
  39.68% { translate: -3.3px 293.6px; color: rgba(84,192,230,0.92); }
  42.86% { translate: -3.3px 292.7px; }
  52.38% { translate: -3.3px 287.2px; }
  55.56% { translate: -3.3px 277.2px; color: rgba(84,190,227,0.88); }
  65.08% { translate: -3.3px 210.9px; }
  71.43% { translate: -3.3px 164.5px; color: rgba(81,168,195,0.38); }
  87.3% { translate: -3.3px 88.6px; color: rgba(80,160,183,0.21); }
  90.48% { translate: -3.3px 80px; }
  93.65% { translate: -3.3px 76.1px; }
  100% { translate: -3.3px 73.6px; color: rgba(80,156,178,0); }
}
@keyframes efSkelRetGrow { 0% { scale: 0.05; } 24.53% { scale: 0.24; } 43.4% { scale: 0.72; } 62.26% { scale: 0.8; } 81.13% { scale: 0.88; animation-timing-function: cubic-bezier(.333,.667,.667,1); } 100% { scale: 1; } }
@keyframes efSkelGuides { 0% { opacity: 0; scale: 0.18; } 11.54% { opacity: 0.11; scale: 0.26; } 30.77% { opacity: 0.145; scale: 0.51; } 50% { opacity: 0.153; scale: 0.58; } 69.23% { opacity: 0.17; scale: 1; } 88.46% { opacity: 0.051; } 100% { opacity: 0; scale: 1; } }
@keyframes efSkelCrosses { 0% { opacity: 0; } 12.5% { opacity: 0.25; } 43.75% { opacity: 0.75; } 68.75%, 81.25% { opacity: 1; } 100% { opacity: 0; } }
@keyframes efSkelSpread { from { scale: 0.4 0.85; } to { scale: 1 1; } }
@keyframes efSkelMark { from { scale: 1.875 0.882; } to { scale: 1.75 1.75; } }
@keyframes efSkelDotsOut { 0% { opacity: 0; } 18.18%, 31.82% { opacity: 0.3; } 50%, 81.82% { opacity: 0; } 100% { opacity: 0.3; } }
@keyframes efSkelCrossesOut { 0% { opacity: 0; } 36.36%, 63.64% { opacity: 1; } 100% { opacity: 0; } }
@keyframes efSkelGuidesOut { 0% { opacity: 0; rotate: -6deg; } 36.36%, 63.64% { opacity: 0.16; } 100% { opacity: 0; rotate: -6deg; } }
@keyframes efSkelRetOut {
  0% { translate: -3.3px 72.7px; color: rgba(81,167,194,0); }
  12.82% { translate: -3.3px 58.4px; }
  15.38% { color: rgba(81,167,194,0); }
  20.51% { translate: -3.3px 46.9px; }
  25.64% { translate: -3.3px 46.5px; color: rgba(81,167,194,0.37); }
  33.33% { translate: -3.3px 51.5px; }
  38.46% { translate: -3.3px 55.5px; }
  43.59% { translate: -3.3px 60.1px; }
  51.28% { translate: -3.3px 68.4px; }
  56.41% { translate: -3.3px 84.5px; }
  61.54% { translate: -3.3px 108.2px; }
  66.67% { translate: -3.3px 144.8px; }
  71.79% { translate: -3.3px 206.7px; }
  76.92% { translate: -3.3px 324.5px; }
  87.18% { translate: -3.3px 624px; }
  100% { translate: -3.3px 850.5px; color: rgba(81,167,194,0.37); }
}
@keyframes efSkelOuter { from { opacity: 0; } to { opacity: 0.5; } }
`);

  /* ---- Geometry, in viewBox units with the disc centre at the origin (the game's disc px x K) ---- */
  const R = 512.73, K = 466 / 512.73;
  const SKEL_Z = -62;   // just under the amber ring (-60): dots and dark ring lie on the game's disc plane like the ring
  const DOT = 5.9;      // the game's 6.5 px square dots x K

  /** Deterministic random numbers (mulberry32), so the dots are the same on every load. */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** The game's staggered dot rows (row step 96 x 0.87, column step 96, odd rows shifted half a step), jittered by
      +-9 / +-7 from seed 17, keeping only the dots within R - 30; all of them in one path (they only ever move and fade
      together, and one element instead of about a hundred keeps the page's restyles small). */
  function dotsPathD() {
    const rand = mulberry32(17);
    let d = "", row = 0;
    for (let y = -R + 96 * 0.4; y <= R; y += 96 * 0.87, row++) {
      for (let x = -R + (row % 2 ? 48 : 0); x <= R; x += 96) {
        const px = x + (rand() - 0.5) * 18, py = y + (rand() - 0.5) * 14;
        if (px * px + py * py > (R - 30) * (R - 30)) continue;
        d += "M" + (px * K - DOT / 2).toFixed(1) + " " + (py * K - DOT / 2).toFixed(1) + "h" + DOT + "v" + DOT + "h-" + DOT + "z";
      }
    }
    return d;
  }

  /* Crosses: where the game's spread out (disc px x K); each glyph is drawn at the game's screen size (arms 1.2-5.4,
     slashes 1.1-4.6, turned -14deg on even and 18deg on odd ones). */
  const CROSSES = [[-413, -254], [-310, -104], [-413, 33], [-305, 136], [-302, 361],
    [412, -311], [300, -128], [437, -12], [319, 117], [337, 351]].map(function (p) { return [(p[0] * K).toFixed(1), (p[1] * K).toFixed(1)]; });
  function crossD(i) {
    const a = (i % 2 ? 18 : -14) * Math.PI / 180, dx = Math.sin(a), dy = Math.cos(a);
    return "M-5.4 0.2L-1.2 0M1.2 0L5.4 -0.2" +
      "M" + (-dx * 4.6).toFixed(2) + " " + (-dy * 4.6).toFixed(2) + "L" + (-dx * 1.1).toFixed(2) + " " + (-dy * 1.1).toFixed(2) +
      "M" + (dx * 1.1).toFixed(2) + " " + (dy * 1.1).toFixed(2) + "L" + (dx * 4.6).toFixed(2) + " " + (dy * 4.6).toFixed(2);
  }
  /* Guides: straight lines on the disc's plane through the reticle's centre (the game's -8 / -55 / 40deg), half length
     2000 (any longer and their front ends pass behind the camera). */
  const GUIDES = [-8, -55, 40].map(function (deg) {
    const a = deg * Math.PI / 180, x = Math.cos(a) * 2000, y = Math.sin(a) * 2000;
    return "M" + (-x).toFixed(1) + " " + (-y).toFixed(1) + "L" + x.toFixed(1) + " " + y.toFixed(1);
  });
  /* The reticle (the game's radii 147 / 274 x K): a thick broken inner ring, a dashed outer ring, 36 ticks (long ones
     every 90deg) and two outer arcs. */
  const RET = { r1: 133.6, r2: 249, arcR: 255.4, tick0: 240.8, tickLong: 234.5, tick1: 247.2 };
  const RET_ARCS = [[-96, -72], [-62, 101], [117, 214], [-122, -110], [-143, -131]];
  function ticksD() {
    let d = "";
    for (let i = 0; i < 36; i++) {
      const a = i * 10 * Math.PI / 180, r0 = i % 9 === 0 ? RET.tickLong : RET.tick0;
      d += "M" + (Math.cos(a) * r0).toFixed(1) + " " + (Math.sin(a) * r0).toFixed(1) + "L" + (Math.cos(a) * RET.tick1).toFixed(1) + " " + (Math.sin(a) * RET.tick1).toFixed(1);
    }
    return d;
  }

  function skeletonSVG() {
    const arcD = EF.geo.arcD;
    let h = '<svg class="ef-skel" viewBox="-500 -500 1000 1000" aria-hidden="true">';
    h += '<circle class="ef-skel__dark" cx="0" cy="-159.9" r="14" fill="none" stroke="#000" stroke-width="9.1"></circle>';
    h += '<circle class="ef-skel__outer" cx="0" cy="-480" r="885.4" fill="none" stroke="rgba(205,205,195,0.7)" stroke-width="4.5"></circle>';
    h += '<g class="ef-skel__dots" fill="#686a62"><path d="' + dotsPathD() + '"></path></g>';
    h += '<g class="ef-skel__xh" fill="none" stroke="#e4e4de" stroke-width="1.2">';
    CROSSES.forEach(function (p, i) { h += '<g transform="translate(' + p[0] + " " + p[1] + ')"><path class="ef-skel__xm" d="' + crossD(i) + '"></path></g>'; });
    h += "</g>";
    h += '<g class="ef-skel__ret">';
    h += '<g class="ef-skel__gd" fill="none" stroke="#dcdfd8" stroke-width="1.1">';
    GUIDES.forEach(function (d) { h += '<path d="' + d + '"></path>'; });
    h += "</g>";
    h += '<g class="ef-skel__rs" fill="none" stroke="currentColor">';
    h += '<g stroke-width="6.4">';
    RET_ARCS.forEach(function (a) { h += '<path d="' + arcD(0, 0, RET.r1, a[0], a[1]) + '"></path>'; });
    h += "</g>";
    h += '<circle r="' + RET.r2 + '" stroke-width="1.6" stroke-dasharray="30.9 8.2 5.5 8.2" opacity="0.9"></circle>';
    h += '<path d="' + ticksD() + '" stroke-width="2.7"></path>';
    h += '<path d="' + arcD(0, 0, RET.arcR, 196, 232) + '" stroke-width="2.7"></path>';
    h += '<path d="' + arcD(0, 0, RET.arcR, 16, 52) + '" stroke-width="2.7"></path>';
    h += "</g></g></svg>";
    return h;
  }

  function mount(core) {
    core.insertAdjacentHTML("beforeend", skeletonSVG());
    EF.scene.attach(core.lastElementChild, SKEL_Z, { comp: false });
  }

  EF.skeleton = { mount };
})();
