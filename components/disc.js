/* Central disc: the dark circular well that the dial rings, level pill and flags sit around.
   The game shows a map in here; this recreation leaves the map (.ef-core__map) empty but for a faint grid.
   Opening and closing pose the whole disc on its layer: it grows in flat and tilts up to face the camera, and on
   close it tips back and shrinks away.
   mount(layer) returns the disc element so the ring components can mount into the same cylinder. */
(function () {
  "use strict";
  const EF = window.EF;

  EF.addStyle("disc", `
.ef-lyr[data-lyr="core"], .ef-core { transform-style: preserve-3d; }
.ef-core {
  position: absolute; left: 50%; top: 540px; width: 960px; height: 960px; margin: -480px 0 0 -480px;
  pointer-events: none;
}
/* The well: a dark base, the map over it and scan lines over both. */
.ef-core__win { position: absolute; inset: 33px; border-radius: 50%; overflow: hidden; background: #090a0c; }
.ef-core__map {
  position: absolute; inset: 0;
  background:
    radial-gradient(closest-side, rgba(15,17,19,0) 82%, rgba(15,17,19,0.6) 100%),
    radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.035) 1.2px, transparent 1.4px) 0 0 / 56px 56px,
    linear-gradient(rgba(150,210,255,0.05) 1px, transparent 1px) -10px -10px / 116px 116px,
    linear-gradient(90deg, rgba(150,210,255,0.05) 1px, transparent 1px) -10px -10px / 116px 116px;
}
.ef-core__win::after {
  content: ""; position: absolute; inset: 0; border-radius: 50%;
  background: repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px);
}

/* Open and close (times in this page's timeline, see index.html). The disc's pose lives on the core layer, a
   preserve-3d plane whose transform origin is the stage centre, which is the disc centre. Parts that take part in the
   cylinder's 3D (the direct children of .ef-core) only animate visibility and their own translate / rotate / scale:
   opacity, filter or a mask would flatten the stack. The map sits in the well, which its overflow already flattens, so
   it may fade and be masked. The reveal radius and the exit vignette are interpolated in keyframes, hence registered. */
@property --ef-reveal { syntax: '<length>'; inherits: false; initial-value: 0px; }
@property --ef-vig { syntax: '<number>'; inherits: false; initial-value: 0; }
@media (prefers-reduced-motion: no-preference) {
  /* On top of the resting 20deg pitch: the disc grows from 0.02 (expo out, 58-558 ms; hidden before). It starts tilted
     back by another 35deg, reaches 40deg at 200 ms, holds, and turns up to face the camera at 234-382 ms. The game's
     disc rests at 21.52deg and this one looks a little flatter, so the tilt matches the flatness of the projected rim
     (ry / rx), which takes 3-4deg more. The lift keeps the projected centre of the amber ring on the game's path (below,
     then above, back in place at 400 ms): the rings sit about 60 px below the disc's plane and drop on screen as the
     disc tilts. The three scale components shrink together, so the heights of the parts shrink with the disc. */
  body.ef-in .ef-lyr[data-lyr="core"] { animation: efDiscScaleIn 500ms 58ms cubic-bezier(.15,1,.32,1) both, efDiscTiltIn 322ms 60ms linear both, efDiscLiftIn 340ms 60ms linear both; }
  /* Exit (150-340 ms): tipped back by 11, 24.7, 47.5, then 51.5deg (with the same 3deg for flatness) while it shrinks
     to 0.945, 0.74, 0.27, then 0.12 and drops on the game's path; the stage fades out meanwhile (index.html). */
  body.ef-out .ef-lyr[data-lyr="core"] { animation: efDiscPoseOut 190ms 150ms linear both, efDiscDropOut 190ms 150ms linear both; }
  /* The well stays empty until the map shows (the transition skeleton is drawn straight on the dimmed backdrop): the base
     is transparent for the whole entrance and the map carries a copy of it. At 355 ms the map cuts in under a round mask
     with a 192 px soft edge that opens from the top of the disc (radius 0 / 588 / 785 / 1090 px at 355 / 400 / 450 /
     510 ms). The scan lines come back when it is done. Content put in the map is revealed with it. */
  body.ef-in .ef-core__win { background-color: transparent; }
  body.ef-in .ef-core__map {
    background-color: #090a0c; animation: efDiscReveal 155ms 355ms linear both;
    -webkit-mask-image: radial-gradient(circle at 407.9px 218.9px, #000 max(0px, calc(var(--ef-reveal) - 192px)), transparent var(--ef-reveal));
    mask-image: radial-gradient(circle at 407.9px 218.9px, #000 max(0px, calc(var(--ef-reveal) - 192px)), transparent var(--ef-reveal));
  }
  body.ef-in .ef-core__win::after { animation: efDiscHidden 510ms 0ms linear; }
  /* Exit: the map goes out at 175-190 ms (the skeleton flashes), is back at 215-235 ms 1.2 times larger, moved up and
     under a vignette (it grows while it is out), and goes out for good at 260-285 ms. The scan lines leave with the
     first blink: they do not grow with the map. */
  body.ef-out .ef-core__map {
    animation: efDiscBlinkOut 110ms 175ms linear both, efDiscGrowOut 50ms 200ms linear both;
    -webkit-mask-image: radial-gradient(circle at 481.9px 394.7px, #000 calc(488px - 226.5px * var(--ef-vig)), rgba(0,0,0,calc(1 - 0.38 * var(--ef-vig))) calc(523px - 148px * var(--ef-vig)), transparent calc(558px - 44px * var(--ef-vig)));
    mask-image: radial-gradient(circle at 481.9px 394.7px, #000 calc(488px - 226.5px * var(--ef-vig)), rgba(0,0,0,calc(1 - 0.38 * var(--ef-vig))) calc(523px - 148px * var(--ef-vig)), transparent calc(558px - 44px * var(--ef-vig)));
  }
  body.ef-out .ef-core__win::after { animation: efDiscOff 1ms 182ms linear both; }
}
@keyframes efDiscScaleIn { from { visibility: hidden; scale: 0.02 0.02 0.02; } to { scale: 1 1 1; } }
@keyframes efDiscTiltIn {
  0% { rotate: x 35deg; animation-timing-function: cubic-bezier(.333,.667,.667,1); }
  43.48% { rotate: x 40deg; }
  54.04% { rotate: x 40deg; animation-timing-function: cubic-bezier(.45,0,.55,1); }
  100% { rotate: x 0deg; }
}
@keyframes efDiscLiftIn {
  0% { translate: 0 50px; }
  5.88% { translate: 0 43px; }
  11.76% { translate: 0 23px; }
  17.65% { translate: 0 6px; }
  26.47% { translate: 0 -14px; }
  32.35% { translate: 0 -25px; }
  41.18% { translate: 0 -37px; }
  47.06% { translate: 0 -43px; }
  55.88% { translate: 0 -51px; }
  61.76% { translate: 0 -48px; }
  70.59% { translate: 0 -39px; }
  76.47% { translate: 0 -29px; }
  85.29% { translate: 0 -9px; }
  91.18% { translate: 0 -3px; }
  100% { translate: 0 0px; }
}
@keyframes efDiscPoseOut {
  0% { rotate: x 0deg; scale: 1 1 1; animation-timing-function: cubic-bezier(.333,0,.667,.333); }
  26.32% { rotate: x 11deg; scale: 0.945 0.945 0.945; }
  52.63% { rotate: x 24.7deg; scale: 0.74 0.74 0.74; }
  78.95% { rotate: x 47.5deg; scale: 0.27 0.27 0.27; animation-timing-function: cubic-bezier(.333,.667,.667,1); }
  100% { rotate: x 51.5deg; scale: 0.12 0.12 0.12; }
}
@keyframes efDiscDropOut {
  0% { translate: 0 0px; animation-timing-function: cubic-bezier(.333,0,.667,.333); }
  13.16% { translate: 0 13.7px; }
  21.05% { translate: 0 23px; }
  26.32% { translate: 0 23px; }
  34.21% { translate: 0 19.5px; }
  44.74% { translate: 0 17px; }
  52.63% { translate: 0 15.2px; }
  57.89% { translate: 0 15.4px; }
  63.16% { translate: 0 16.5px; }
  68.42% { translate: 0 19.6px; }
  73.68% { translate: 0 22.2px; }
  78.95% { translate: 0 25.8px; }
  89.47% { translate: 0 33px; }
  100% { translate: 0 34.4px; }
}
@keyframes efDiscReveal { 0% { opacity: 0; --ef-reveal: 0px; } 3.23% { opacity: 1; } 29.03% { --ef-reveal: 588px; } 61.29% { --ef-reveal: 785px; } 100% { opacity: 1; --ef-reveal: 1090px; } }
@keyframes efDiscHidden { from, to { visibility: hidden; } }
@keyframes efDiscOff { to { visibility: hidden; } }
@keyframes efDiscBlinkOut { 0% { opacity: 1; } 13.64%, 36.36% { opacity: 0; } 54.55%, 77.27% { opacity: 1; animation-timing-function: cubic-bezier(.333,0,.667,.333); } 100% { opacity: 0; } }
@keyframes efDiscGrowOut { from { translate: 0 0; scale: 1; --ef-vig: 0; } to { translate: 0 -138px; scale: 1.2; --ef-vig: 1; } }
`);

  const HTML = `<div class="ef-core"><div class="ef-core__win"><div class="ef-core__map"></div></div></div>`;

  function mount(layer) {
    layer.insertAdjacentHTML("beforeend", HTML);
    const core = layer.lastElementChild;
    EF.scene.attach(core.querySelector(".ef-core__win"), EF.scene.PARTS.well, { comp: false });
    return core;
  }

  EF.disc = { mount };
})();
