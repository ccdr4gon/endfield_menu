/* Dial rings around the disc. Each ring is its own SVG plane at a different height inside the disc
   cylinder (rim band at the bottom, white arcs on top), so the camera sway separates them in depth.
   The five yellow flags stand upright on the bezel and slowly sway back and forth. */
(function () {
  "use strict";
  const EF = window.EF;
  const arcD = EF.geo.arcD;

  EF.addStyle("dial-rings", `
.ef-core__dial { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; }
/* each ring's drawing sits in one flat group (the transitions fade and scale it); the white arcs can be drawn out and
   back one segment at a time */
.ef-dial__ink, .ef-dial__seg { transform-origin: 500px 500px; }

.ef-core__flags { position: absolute; inset: 0; pointer-events: none; transform-style: preserve-3d; }
.ef-flags-rot { position: absolute; inset: 0; transform-style: preserve-3d; }
.ef-flag { position: absolute; width: 0; height: 0; transform-style: preserve-3d; }
.ef-flag svg {
  position: absolute; left: -32px; bottom: -2px; width: 64px; height: 64px; overflow: visible;
  transform-origin: 50% 100%; transform: rotateX(-90deg);
}
@media (prefers-reduced-motion: no-preference) {
  .ef-flags-rot { animation: efDialSway 45s linear infinite alternate; }
}
@keyframes efDialSway { from { transform: rotate(-30deg); } to { transform: rotate(30deg); } }

/* Open and close (times in this page's timeline, see index.html). The ring svgs and the flags take part in the
   cylinder's 3D, so they only animate visibility and their own translate / rotate / scale; opacity and stroke drawing
   go on the flat groups and paths inside. */
@media (prefers-reduced-motion: no-preference) {
  /* amber ring (the game's thin orange rim): comes with the disc, opacity 0 / .55 / .77 / .87 / 1 at 60 / 100 / 150 / 250 / 400 ms */
  body.ef-in [data-ring="amber-ring"] > .ef-dial__ink { animation: efDialAmberIn 340ms 60ms linear both; }
  /* grooves (the game's olive inner arcs): fade in at 160-200 ms while growing from 0.9 (power1 out, 160-300 ms); on close
     they flash with the skeleton, out at 215-235 ms and back at 270-290 ms */
  body.ef-in [data-ring="grooves"] > .ef-dial__ink { animation: efDialGroovesIn 140ms 160ms linear both; }
  body.ef-out [data-ring="grooves"] > .ef-dial__ink { animation: efDialGroovesOut 75ms 215ms linear both; }
  /* rim band (where the skeleton's dark ring settles): fades in as the ring sweeps by (300-350 ms); on close it falls
     behind the shrinking disc (radius x 1.268, centre up by 1.22 R) at 250-300 ms */
  body.ef-in [data-ring="rim-band"] > .ef-dial__ink { animation: efDialBandIn 50ms 300ms linear both; }
  body.ef-out .ef-core__dial[data-ring="rim-band"] { animation: efDialBandOut 50ms 250ms linear both; }
  /* white arcs (the game's white segment frame): the group shows at 325-335 ms. A (upper left) is drawn from its upper
     end and slides 6.3deg down the rim (330-490 ms), B (left) fades in, C (lower left) and R (right) grow from their
     lower ends and U (upper right) is drawn from its upper end (power1 out; all in place by 550 ms) */
  body.ef-in [data-ring="white-arcs"] > .ef-dial__ink { animation: efDialArcsIn 10ms 325ms linear both; }
  body.ef-in .ef-dial__seg[data-seg="A"] { animation: efDialSegFromEnd 20ms 325ms cubic-bezier(.333,.667,.667,1) both, efDialSegSlide 160ms 330ms linear both; }
  body.ef-in .ef-dial__seg[data-seg="B"] { animation: efDialSegFadeIn 180ms 370ms linear both; }
  body.ef-in .ef-dial__seg[data-seg="C"] { animation: efDialSegFromStart 80ms 470ms cubic-bezier(.333,.667,.667,1) both; }
  body.ef-in .ef-dial__seg[data-seg="R"] { animation: efDialSegFromEnd 150ms 400ms cubic-bezier(.333,.667,.667,1) both; }
  body.ef-in .ef-dial__seg[data-seg="U"] { animation: efDialSegFromStart 180ms 370ms cubic-bezier(.333,.667,.667,1) both; }
  /* close: A (50-150 ms) and B (100-170 ms) fade out; C draws back down (150-220 ms, power1 in), R draws back up
     (50-190 ms); U lasts until the map is back (150-235 ms) */
  body.ef-out .ef-dial__seg[data-seg="A"] { animation: efDialSegAOut 100ms 50ms linear both; }
  body.ef-out .ef-dial__seg[data-seg="B"] { animation: efDialSegBOut 70ms 100ms linear both; }
  body.ef-out .ef-dial__seg[data-seg="C"] { animation: efDialSegToStart 70ms 150ms cubic-bezier(.333,0,.667,.333) both; }
  body.ef-out .ef-dial__seg[data-seg="R"] { animation: efDialSegROut 140ms 50ms linear both; }
  body.ef-out .ef-dial__seg[data-seg="U"] { animation: efDialSegUOut 85ms 150ms linear both; }
  /* flags (the game's incoming triangles): show at 225 ms at 0.84 of their radius, fly out to the rim (power1 in-out,
     250-300 ms) and slide 10deg along it as the disc rises (250-350 ms); on close they flash with the skeleton (out at
     225-280 ms), then leave with the stage */
  body.ef-in .ef-core__flags { animation: efDialFlagsFly 75ms 225ms linear both, efDialFlagsSpread 100ms 250ms linear both; }
  body.ef-out .ef-core__flags { animation: efDialFlagsBlink 55ms 225ms linear; }
}
@keyframes efDialAmberIn { 0% { opacity: 0; } 11.76% { opacity: 0.55; } 26.47% { opacity: 0.77; } 55.88% { opacity: 0.87; } 100% { opacity: 1; } }
@keyframes efDialGroovesIn { 0% { opacity: 0; scale: 0.9; animation-timing-function: cubic-bezier(.333,.667,.667,1); } 28.57% { opacity: 1; } 100% { opacity: 1; scale: 1; } }
@keyframes efDialGroovesOut { 0% { opacity: 1; } 26.67%, 73.33% { opacity: 0; } 100% { opacity: 1; } }
@keyframes efDialBandIn { from { opacity: 0; } }
@keyframes efDialBandOut { to { translate: 0 -546px; scale: 1.268; } }
@keyframes efDialArcsIn { from { opacity: 0; } }
@keyframes efDialSegFromEnd { from { stroke-dasharray: 1 1; stroke-dashoffset: -1; } to { stroke-dasharray: 1 1; stroke-dashoffset: 0; } }
@keyframes efDialSegFromStart { from { stroke-dasharray: 1 1; stroke-dashoffset: 1; } to { stroke-dasharray: 1 1; stroke-dashoffset: 0; } }
@keyframes efDialSegToStart { from { stroke-dasharray: 1 1; stroke-dashoffset: 0; } to { stroke-dasharray: 1 1; stroke-dashoffset: 1; } }
@keyframes efDialSegSlide { from { rotate: 6.3deg; } to { rotate: 0deg; } }
@keyframes efDialSegFadeIn { 0% { opacity: 0; } 16.67% { opacity: 0.25; } 44.44% { opacity: 0.47; } 100% { opacity: 1; } }
@keyframes efDialSegAOut { 0% { opacity: 1; } 50% { opacity: 0.68; } 100% { opacity: 0; } }
@keyframes efDialSegBOut { 0% { opacity: 1; } 71.43% { opacity: 0.15; } 100% { opacity: 0; } }
@keyframes efDialSegROut { 0% { stroke-dasharray: 1 1; stroke-dashoffset: 0; } 35.71% { stroke-dashoffset: 0.4; } 71.43% { stroke-dashoffset: 0.75; } 100% { stroke-dasharray: 1 1; stroke-dashoffset: 1; } }
@keyframes efDialSegUOut { 0% { opacity: 1; } 58.82% { opacity: 0.6; } 100% { opacity: 0; } }
@keyframes efDialFlagsFly { 0% { visibility: hidden; scale: 0.84 0.84 0.84; } 33.33% { scale: 0.86 0.86 0.86; animation-timing-function: cubic-bezier(.45,0,.55,1); } 100% { scale: 1 1 1; } }
@keyframes efDialFlagsSpread { from { rotate: z 10deg; } to { rotate: z 0deg; } }
@keyframes efDialFlagsBlink { from, to { visibility: hidden; } }
`);

  function drawRimBand() {
    const annulus = "M500 -177 A677 677 0 1 0 500.01 -177 Z M500 -70 A570 570 0 1 1 499.99 -70 Z";
    return '<path d="' + annulus + '" fill-rule="evenodd" fill="#0e1012" opacity="0.97"></path>';
  }

  function drawAmberRing() {
    let h = "";
    h += '<path d="' + arcD(500, 500, 466, 44, 137) + '" fill="none" stroke="#F08D36" stroke-width="1.1"></path>';
    h += '<path d="' + arcD(500, 500, 466, 160, 380) + '" fill="none" stroke="#F08D36" stroke-width="1.1"></path>';
    [[20, 44], [137, 160]].forEach(function (seg) {
      h += '<path d="' + arcD(500, 500, 466, seg[0], seg[1]) + '" fill="none" stroke="#F59C48" stroke-width="1.6" stroke-dasharray="2 5" stroke-linecap="round"></path>';
    });
    return h;
  }

  function drawGrooves() {
    return [472, 476, 480, 484].map(function (r, i) {
      return '<circle cx="500" cy="500" r="' + r + '" fill="none" stroke="rgba(255,255,255,' + (i % 2 ? 0.05 : 0.08) + ')" stroke-width="0.75"></circle>';
    }).join("");
  }

  /** The white arcs, each named after the game's segment it plays (U upper right, R right, C lower left, B left,
      A upper left); pathLength 1 lets the transitions draw them out and back by fraction. */
  function drawWhiteArcs() {
    return [[-40.5, -10, "U"], [-4, 44, "R"], [138, 168, "C"], [174, 204, "B"], [210, 234, "A"]].map(function (seg) {
      return '<path class="ef-dial__seg" data-seg="' + seg[2] + '" pathLength="1" d="' + arcD(500, 500, 492.5, seg[0], seg[1]) +
        '" fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="9.8" stroke-linecap="butt"></path>';
    }).join("");
  }

  /** Ring planes from bottom to top; h is the height inside the disc cylinder. */
  const RINGS = [
    { id: "rim-band", h: -112, draw: drawRimBand },
    { id: "amber-ring", h: -60, draw: drawAmberRing },
    { id: "grooves", h: 10, draw: drawGrooves },
    { id: "white-arcs", h: 50, draw: drawWhiteArcs },
  ];
  const FLAG_ANGLES = [-101, -162, -37, 29, 141];
  const FLAG_R = 462;

  function flagsHTML() {
    const body = '<path d="M0 0 L22 -48 L-22 -48 Z" fill="none" stroke="#FFDE00" stroke-width="2.55" stroke-linejoin="round"></path>';
    return FLAG_ANGLES.map(function (deg) {
      const a = deg * Math.PI / 180;
      const x = 500 + Math.cos(a) * FLAG_R, y = 500 + Math.sin(a) * FLAG_R;
      return '<div class="ef-flag" style="left:' + (x / 10).toFixed(2) + "%;top:" + (y / 10).toFixed(2) +
        "%;transform:rotate(" + (deg + 90).toFixed(1) + 'deg);"><svg viewBox="-32 -64 64 64">' + body + "</svg></div>";
    }).join("");
  }

  function mount(core) {
    RINGS.forEach(function (ring) {
      core.insertAdjacentHTML("beforeend",
        '<svg class="ef-core__dial" data-ring="' + ring.id + '" viewBox="0 0 1000 1000"><g class="ef-dial__ink">' + ring.draw() + "</g></svg>");
      EF.scene.attach(core.lastElementChild, ring.h, { comp: false });
    });
    core.insertAdjacentHTML("beforeend", '<div class="ef-core__flags"><div class="ef-flags-rot">' + flagsHTML() + "</div></div>");
    EF.scene.attach(core.lastElementChild, 22, { comp: false });
  }

  EF.dial = { mount };
})();
