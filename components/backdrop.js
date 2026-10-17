/* Backdrop: the coloured haze behind the menu and the thin decorations floating in the 3D scene.
   The haze is a smooth colour field (backdrop-field.js) painted on the fixed wallpaper. The decorations live in
   the scene's world, each with its own 3D placement, so they move with the camera like the rest of the menu:
     - four large thin circles and a straight line lying flat on a plane ARC_Z px below the floor,
     - a small yellow ring tilted in space,
     - nine "+" marks standing upright at different heights (horizontal arm along the floor, vertical arm along
       "up"; the camera's perspective makes the vertical arms lean towards one vanishing point).
   Positions were measured from the reference screenshot and solved against this scene's projection. */
(function () {
  "use strict";
  const EF = window.EF;

  EF.addStyle("backdrop", `
.ef-decor, .ef-decor__item { position: absolute; left: 0; top: 0; pointer-events: none; transform-origin: 0 0; transform-style: preserve-3d; }
.ef-decor { width: 1920px; height: 1080px; }
.ef-decor__item { width: 0; height: 0; }
.ef-decor__art { position: absolute; overflow: visible; }

/* Open and close: the floor and the yellow ring ride in with the disc's outer ring, the "+" marks gather in (times in
   this page's timeline, see index.html). The items and their container are preserve-3d, where opacity would flatten
   the marks: an item only moves by its own translate and scale, about the disc centre (960, 540, 0), so
   translate = (1 - s) x centre; opacity, stroke opacity and an item's own squash go on the flat svg or paths inside.
   - The floor (first item) and the yellow ring (second): from 255 ms they spread from the disc rim out to their places
     (the scale is the game's ring-to-rim ratio, normalised to these arcs). The arcs' stroke opacity flashes up to 2.4
     times its resting value (a bright thin ring at 295 ms) and falls back to each path's own stroke-opacity (the last
     keyframe is left out). The yellow ring shows at 255-270 ms squashed to 0.58 x 0.30 and unfolds as the disc tilts
     up. On exit, at 150-300 ms, both shrink with the disc and fade, and the ring squashes again.
   - The "+" marks (third item on): fade in at 310-350 ms, starting 6% closer to the disc centre and easing back to
     their places by 400 ms. On exit, at 50-290 ms, they implode towards the centre faster and faster; their svg grows
     back against the item's scale to keep the glyph's size and fades out after 200 ms.
   The rules name the svgs and the floor's paths by class: a bare "svg" or "path" would make every body.ef-in and
   body.ef-out toggle restyle every svg or path of the page. */
@media (prefers-reduced-motion: no-preference) {
  body.ef-in .ef-decor__item:nth-child(-n+2) { animation: efDecorRideIn 295ms 255ms linear both; }
  body.ef-in .ef-decor__stroke { animation: efDecorFlash 195ms 255ms linear both; }
  body.ef-in .ef-decor__item:nth-child(2) > .ef-decor__art { animation: efDecorRingIn 195ms 255ms linear both; }
  body.ef-in .ef-decor__item:nth-child(n+3) { animation: efDecorMarkIn 90ms 310ms cubic-bezier(.333,0,.667,1) both; }
  body.ef-in .ef-decor__item:nth-child(n+3) > .ef-decor__art { animation: efFade 40ms 310ms cubic-bezier(.333,0,.667,1) both; }
  body.ef-out .ef-decor__item:nth-child(-n+2) { animation: efDecorRideOut 150ms 150ms linear both; }
  body.ef-out .ef-decor__item:first-child > .ef-decor__art { animation: efDecorFadeOut 150ms 150ms linear both; }
  body.ef-out .ef-decor__item:nth-child(2) > .ef-decor__art { animation: efDecorRingOut 150ms 150ms linear both; }
  body.ef-out .ef-decor__item:nth-child(n+3) { animation: efDecorMarkImplode 240ms 50ms linear both; }
  body.ef-out .ef-decor__item:nth-child(n+3) > .ef-decor__art { animation: efDecorMarkOut 240ms 50ms linear both; }
}
@keyframes efDecorRideIn {
  0% { translate: 355.2px 199.8px 0px; scale: 0.63 0.63 0.63; }
  13.56% { translate: 278.4px 156.6px 0px; scale: 0.71 0.71 0.71; }
  22.03% { translate: 206.4px 116.1px 0px; scale: 0.785 0.785 0.785; }
  32.2% { translate: 124.8px 70.2px 0px; scale: 0.87 0.87 0.87; }
  38.98% { translate: 91.2px 51.3px 0px; scale: 0.905 0.905 0.905; }
  49.15% { translate: 57.6px 32.4px 0px; scale: 0.94 0.94 0.94; }
  55.93% { translate: 40.32px 22.68px 0px; scale: 0.958 0.958 0.958; }
  66.1% { translate: 23.04px 12.96px 0px; scale: 0.976 0.976 0.976; }
  83.05% { translate: 7.68px 4.32px 0px; scale: 0.992 0.992 0.992; }
  100% { translate: 0px 0px 0px; scale: 1 1 1; }
}
/* no last keyframe: each path ends on its own stroke-opacity */
@keyframes efDecorFlash { 0% { stroke-opacity: 0; } 7.69% { stroke-opacity: 0.106; } 20.51% { stroke-opacity: 0.336; } 23.08% { stroke-opacity: 0.333; } 33.33% { stroke-opacity: 0.29; } 48.72% { stroke-opacity: 0.203; } 58.97% { stroke-opacity: 0.175; } 74.36% { stroke-opacity: 0.154; } 84.62% { stroke-opacity: 0.146; } }
@keyframes efDecorRingIn { 0% { opacity: 0; scale: 0.58 0.3; } 8.56% { opacity: 1; } 23.08% { scale: 0.65 0.4; } 48.72% { scale: 0.75 0.62; } 74.36% { scale: 0.93 0.86; } 100% { opacity: 1; scale: 1 1; } }
@keyframes efDecorMarkIn { 0%, 44.44% { translate: 57.6px 32.4px 0px; scale: 0.94 0.94 0.94; } 100% { translate: 0px 0px 0px; scale: 1 1 1; } }
@keyframes efDecorRideOut {
  0% { translate: 0px 0px 0px; scale: 1 1 1; }
  16.67% { translate: 67.2px 37.8px 0px; scale: 0.93 0.93 0.93; }
  33.33% { translate: 163.2px 91.8px 0px; scale: 0.83 0.83 0.83; }
  66.67% { translate: 249.6px 140.4px 0px; scale: 0.74 0.74 0.74; }
  100% { translate: 384px 216px 0px; scale: 0.6 0.6 0.6; }
}
@keyframes efDecorFadeOut { 0% { opacity: 1; } 33.33% { opacity: 0.85; } 66.67% { opacity: 0.55; } 80% { opacity: 0.3; } 93.33%, 100% { opacity: 0; } }
@keyframes efDecorRingOut { 0% { opacity: 1; scale: 1 1; } 33.33% { opacity: 0.85; scale: 0.93 0.76; } 66.67% { opacity: 0.55; scale: 0.8 0.52; } 80% { opacity: 0.3; } 93.33% { opacity: 0; } 100% { opacity: 0; scale: 0.62 0.36; } }
/* from where they rest (100%) in to 37% of their distance from the disc centre */
@keyframes efDecorMarkImplode {
  0% { translate: 0px 0px 0px; scale: 1 1 1; }
  20.83% { translate: 9.6px 5.4px 0px; scale: 0.99 0.99 0.99; }
  41.67% { translate: 86.4px 48.6px 0px; scale: 0.91 0.91 0.91; }
  62.5% { translate: 259.2px 145.8px 0px; scale: 0.73 0.73 0.73; }
  83.33% { translate: 451.2px 253.8px 0px; scale: 0.53 0.53 0.53; }
  100% { translate: 604.8px 340.2px 0px; scale: 0.37 0.37 0.37; }
}
@keyframes efDecorMarkOut { 0% { opacity: 1; scale: 1; } 20.83% { scale: 1.0101; } 41.67% { scale: 1.0989; } 62.5% { opacity: 1; scale: 1.3699; } 83.33% { opacity: 0.6; scale: 1.8868; } 95.83% { opacity: 0; } 100% { opacity: 0; scale: 2.7027; } }
`);

  const ARC_Z = -37.7;   // height of the plane the circles and the line lie on
  /** Flat strokes on that plane, in its own coordinates (= stage px): path, stroke width, opacity. */
  const FLOOR = [
    { d: "M1711.9 184.1A811.8 811.8 0 0 1 1561.1 1109.2", w: 2.5, a: 0.135 },   // right, around the disc
    { d: "M1470.9 -101.6A1323.8 1323.8 0 0 1 1889.6 517.4", w: 3.9, a: 0.148 },   // top right
    { d: "M226.2 175.6A798.5 798.5 0 0 1 490.9 -120.7", w: 2, a: 0.125 },   // top left
    { d: "M50 813.9A753.3 753.3 0 0 1 190.8 229", w: 2, a: 0.122 },   // left edge
    { d: "M1607.8 909.4L1755.7 1011.5", w: 3.6, a: 0.155 },   // straight line
  ];
  /** The upright "+" marks: placement (local x = horizontal arm, local y = down the vertical arm), arms
      [gap, bar length] horizontally then vertically (each arm leaves a gap at the centre), opacity, bar widths. */
  const MARKS = [
    { m: "matrix3d(0.9997,-0.0256,-0.0021,0,0.0025,0.1787,-0.9839,0,0.0256,0.9836,0.1787,0,552.58,321.64,400.18,1)", g: [2.21, 9.01, 2.46, 10.46], a: 1, wh: 1.74, wv: 1.46 },   // top left
    { m: "matrix3d(0.9997,-0.0256,-0.0021,0,0.0025,0.1787,-0.9839,0,0.0256,0.9836,0.1787,0,555.62,403.45,-2.28,1)", g: [2.35, 8.88, 2.59, 10.84], a: 0.5, wh: 1.68, wv: 1.41 },   // left of the dial
    { m: "matrix3d(0.9997,-0.0256,-0.0021,0,0.0025,0.1787,-0.9839,0,0.0256,0.9836,0.1787,0,567.41,752.3,75.35,1)", g: [2.55, 8.67, 2.87, 10.72], a: 0.47, wh: 1.49, wv: 1.29 },   // lower left of the dial
    { m: "matrix3d(0.9997,-0.0256,-0.0021,0,0.0025,0.1787,-0.9839,0,0.0256,0.9836,0.1787,0,1066.56,577.79,510,1)", g: [3.14, 10.76, 2.53, 9.75], a: 0.81, wh: 1.47, wv: 1.56 },   // over the disc
    { m: "matrix3d(0.9997,-0.0256,-0.0021,0,0.0025,0.1787,-0.9839,0,0.0256,0.9836,0.1787,0,1363.12,368.46,23.39,1)", g: [2.33, 8.89, 2.7, 10.09], a: 0.51, wh: 1.76, wv: 1.51 },   // upper right of the disc
    { m: "matrix3d(0.9997,-0.0256,-0.0021,0,0.0025,0.1787,-0.9839,0,0.0256,0.9836,0.1787,0,1359.33,638.07,507.77,1)", g: [2.31, 8.91, 2.51, 10.04], a: 1, wh: 1.53, wv: 1.16 },   // on the first tile
    { m: "matrix3d(0.9997,-0.0256,-0.0021,0,0.0025,0.1787,-0.9839,0,0.0256,0.9836,0.1787,0,1366.15,723.62,114.34,1)", g: [2.43, 8.79, 2.86, 10.56], a: 0.51, wh: 1.61, wv: 1.25 },   // right of the disc
    { m: "matrix3d(0.9997,-0.0256,-0.0021,0,0.0025,0.1787,-0.9839,0,0.0256,0.9836,0.1787,0,1362.66,950.41,580,1)", g: [2.91, 8.31, 3.42, 9], a: 1, wh: 1.61, wv: 1.41 },   // on a lower tile
    { m: "matrix3d(0.9997,-0.0256,-0.0021,0,0.0025,0.1787,-0.9839,0,0.0256,0.9836,0.1787,0,1383.69,1033.13,151.61,1)", g: [2.39, 8.84, 2.27, 11.51], a: 0.49, wh: 1.37, wv: 1.07 },   // bottom right
  ];
  const RING = { m: "matrix3d(-0.4919,-0.8564,-0.1568,0,0.3794,-0.373,0.8467,0,-0.7836,0.357,0.5084,0,1706.99,905.47,-37.7,1)", r: 7.4 };

  function markSVG(k) {
    const s = 16, g = k.g, bars =
      '<rect x="' + g[0] + '" y="' + (-k.wh / 2) + '" width="' + g[1] + '" height="' + k.wh + '"></rect>' +
      '<rect x="' + (-g[0] - g[1]) + '" y="' + (-k.wh / 2) + '" width="' + g[1] + '" height="' + k.wh + '"></rect>' +
      '<rect x="' + (-k.wv / 2) + '" y="' + g[2] + '" width="' + k.wv + '" height="' + g[3] + '"></rect>' +
      '<rect x="' + (-k.wv / 2) + '" y="' + (-g[2] - g[3]) + '" width="' + k.wv + '" height="' + g[3] + '"></rect>';
    return '<div class="ef-decor__item" style="transform:' + k.m + ';"><svg class="ef-decor__art" width="' + 2 * s + '" height="' + 2 * s +
      '" viewBox="' + (-s) + " " + (-s) + " " + 2 * s + " " + 2 * s + '" style="left:' + (-s) + "px;top:" + (-s) +
      'px;"><g fill="#fff" fill-opacity="' + k.a + '">' + bars + "</g></svg></div>";
  }

  function decorHTML() {
    const floor = '<div class="ef-decor__item" style="width:1920px;height:1080px;transform:translateZ(' + ARC_Z + 'px);">' +
      '<svg class="ef-decor__art" width="1920" height="1080" viewBox="0 0 1920 1080" style="left:0;top:0;"><g fill="none" stroke="#fff">' +
      FLOOR.map(function (l) { return '<path class="ef-decor__stroke" d="' + l.d + '" stroke-width="' + l.w + '" stroke-opacity="' + l.a + '"></path>'; }).join("") +
      "</g></svg></div>";
    const r = RING.r + 2;
    const ring = '<div class="ef-decor__item" style="transform:' + RING.m + ';"><svg class="ef-decor__art" width="' + 2 * r + '" height="' + 2 * r +
      '" viewBox="' + (-r) + " " + (-r) + " " + 2 * r + " " + 2 * r + '" style="left:' + (-r) + "px;top:" + (-r) + 'px;">' +
      '<circle r="' + RING.r + '" fill="none" stroke="#FFDE00" stroke-width="1.4" stroke-opacity="0.55"></circle></svg></div>';
    return '<div class="ef-decor" aria-hidden="true">' + floor + ring + MARKS.map(markSVG).join("") + "</div>";
  }

  /** The wallpaper haze: the colour field stretched over the stage plus a margin, following the stage scale. */
  function paintBackdrop() {
    const F = EF.BACKDROP_FIELD, wp = document.querySelector(".ef-wallpaper");
    if (!F || !wp) return;
    wp.style.backgroundColor = F.edge;
    wp.style.backgroundImage = "url(" + F.src + ")";
    wp.style.backgroundRepeat = "no-repeat";
    wp.style.backgroundPosition = "center";
    wp.style.backgroundSize = "calc(" + F.width + "px * var(--ef-stage-scale)) calc(" + F.height + "px * var(--ef-stage-scale))";
  }

  function mount(world) {
    paintBackdrop();
    world.insertAdjacentHTML("beforeend", decorHTML());
  }

  EF.backdrop = { mount };
})();
