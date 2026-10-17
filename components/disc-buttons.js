/* The two yellow buttons that hug the bottom of the disc.
   Both are drawn in one SVG: their outlines are stage px, turned onto the stage by DCBTN. A copy of the outlines
   behind them is the back plate: it leans with the camera like a drop shadow, shows as a thin band under each
   button's lower curve, and the see-through top of each face shows its edge as a pale inner rim. Icons, labels and
   the small decals sit in a second SVG in stage px: the icons and decals are the game's artwork traced from a
   screenshot (button-art.js), the labels Noto Sans SC laid out where the game puts them. As in the game, the icons
   cast a soft dark shadow and the labels a pale one, and both lean with the camera too. */
(function () {
  "use strict";
  const EF = window.EF;

  EF.addStyle("disc-buttons", `
.ef-discbtns { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; z-index: 3; }
.ef-dcsh-move {
  --ef-h: 30;
  transform: translate(calc((var(--ef-shx0) + var(--ef-swx, 0) * var(--ef-h)) * 1px),
                       calc((var(--ef-shy0) + var(--ef-swy, 0) * var(--ef-h)) * 1px));
}
.ef-discbtn {
  pointer-events: auto; cursor: pointer; transition: filter 0.15s;
}
.ef-discbtn:hover { filter: brightness(1.07) drop-shadow(0 0 5px rgba(255,222,0,0.36)) drop-shadow(0 0 13px rgba(255,222,0,0.18)); }

.ef-disclabels { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; z-index: 3; }
.ef-disclabels text { font-family: var(--ef-font-cn); font-weight: 450; }
.ef-disclab { fill: #fff; }
.ef-disclab-sh, .ef-discicon-sh {
  --ef-h: 7.5;
  transform: translate(calc((var(--ef-shx0) + var(--ef-swx, 0) * var(--ef-h)) * 1px),
                       calc((var(--ef-shy0) + var(--ef-swy, 0) * var(--ef-h)) * 1px));
}
.ef-disclab-sh { fill: #BFB36D; }   /* the labels' pale shadow */
/* the icons' soft dark shadow: the icon grown a little and blurred (#dcIconBlur) */
.ef-discicon-sh { fill: #100E06; stroke: #100E06; stroke-width: 0.85; stroke-linejoin: round; opacity: 0.9; }
.ef-discdecor { fill: #322C07; }

/* Open and close, measured on the game's two tabs (times in this page's timeline, see index.html). Each button is one
   group in each svg (.ef-dctab, in stage px and unrotated), which drops into place on open and sinks on close; the
   fades are on the layers inside it. As in the game, the button's body is split into layers that fade in on the same
   beat: the back plate, the bottom layer (the see-through top), the bright band and the stroke layer (grid, strokes,
   decal, hit area). The game's bottom layer (50% yellow) covers the whole tab, so where the band lies two layers add up
   to b = a + (1 - a) a / 2. Here the top half and the band do not overlap, and under the band the bottom layer only
   has the back plate's 0.13 yellow, so the band follows beta = (b - 0.13 a) / (1 - 0.13 a) (each segment fitted with
   cubic-bezier(1/3, y1, 2/3, y2), within 0.001), which over the plate's fill gives exactly b. The labels' group (icon,
   label and their shadows) fades in as one.
   - plan (the left button): its body lights up first, its label 20 ms later, and both drop into place from above;
   - brief (the right one) lights up in place by steps, its label dipping back once on the way;
   - on close both go together: the bodies go out first, the labels a moment later, and both sink linearly.
   The drop and the sink are -7 px and 25 px on screen as in the game; 1 svg unit is about 1.21 px on screen here (in
   both svgs), hence -5.8 and 20.6. The first keyframes carry visibility: hidden, which the fill keeps during the delays
   (and the hit area, pointer-events="visible", takes no hover or click until it shows). */
@media (prefers-reduced-motion: no-preference) {
  /* plan's body: lights up from 346 ms, 0.36 at 400 ms, full at 454 ms; the band on the same beat by beta (0.4494 at
     400 ms, which adds up to 0.4752) */
  body.ef-in .ef-discbtns .ef-dctab--plan .ef-dclayer { animation: efBtnPlate1In 108ms 346ms linear both; }
  body.ef-in .ef-discbtns .ef-dctab--plan .ef-dcband { animation: efBtnBand1In 108ms 346ms linear both; }
  /* plan drops into place at 366-450 ms, body and label together (held above until then) */
  body.ef-in .ef-discbtns .ef-dctab--plan { animation: efBtnDrop 84ms 366ms linear both; }
  /* plan's label: lights up from 366 ms, 0.36 at 400 ms, full at 454 ms, and drops with the body */
  body.ef-in .ef-disclabels .ef-dctab--plan { animation: efBtnFace1In 88ms 366ms linear both, efBtnDrop 84ms 366ms linear both; }
  /* brief's body: from 345 ms, 0.25 at 400 ms, 0.35 at 450 ms, 0.5 at 500-560 ms, full at 595 ms (no drop); the band by
     beta 0.3217 / 0.4382 / 0.5989 (adding up to 0.3438 / 0.4638 / 0.625) */
  body.ef-in .ef-discbtns .ef-dctab--brief .ef-dclayer { animation: efBtnPlate2In 250ms 345ms linear both; }
  body.ef-in .ef-discbtns .ef-dctab--brief .ef-dcband { animation: efBtnBand2In 250ms 345ms linear both; }
  /* brief's label: from 470 ms, 0.42 at 500 ms, back to 0.3 at 550-560 ms, full at 595 ms */
  body.ef-in .ef-disclabels .ef-dctab--brief { animation: efBtnFace2In 125ms 470ms linear both; }
  /* close: the bodies' layers fade out at 98-145 ms (the band by beta), the labels at 98-158 ms; both sink at 75-201 ms */
  body.ef-out .ef-discbtns .ef-dclayer { animation: efBtnOut 47ms 98ms linear both; }
  body.ef-out .ef-discbtns .ef-dcband { animation: efBtnBandOut 47ms 98ms linear both; }
  body.ef-out .ef-discbtns .ef-dctab { animation: efBtnSink 126ms 75ms linear both; }
  body.ef-out .ef-disclabels .ef-dctab { animation: efBtnOut 60ms 98ms linear both, efBtnSink 126ms 75ms linear both; }
}
@keyframes efBtnPlate1In { 0% { opacity: 0; visibility: hidden; } 50.12% { opacity: 0.36; } 100% { opacity: 1; } }
@keyframes efBtnBand1In {
  0% { opacity: 0; visibility: hidden; animation-timing-function: cubic-bezier(0.3333, 0.3658, 0.6667, 0.7007); }
  50.12% { opacity: 0.4494; animation-timing-function: cubic-bezier(0.3333, 0.4341, 0.6667, 0.7771); }
  100% { opacity: 1; }
}
@keyframes efBtnFace1In { 0% { opacity: 0; visibility: hidden; } 38.76% { opacity: 0.36; } 100% { opacity: 1; } }
@keyframes efBtnPlate2In { 0% { opacity: 0; visibility: hidden; } 22.04% { opacity: 0.25; } 42% { opacity: 0.35; } 62.06%, 85.97% { opacity: 0.5; } 100% { opacity: 1; } }
@keyframes efBtnBand2In {
  0% { opacity: 0; visibility: hidden; animation-timing-function: cubic-bezier(0.3333, 0.3549, 0.6667, 0.6889); }
  22.04% { opacity: 0.3217; animation-timing-function: cubic-bezier(0.3333, 0.3436, 0.6667, 0.6771); }
  42% { opacity: 0.4382; animation-timing-function: cubic-bezier(0.3333, 0.351, 0.6667, 0.6847); }
  62.06%, 85.97% { opacity: 0.5989; animation-timing-function: cubic-bezier(0.3333, 0.4212, 0.6667, 0.7611); }
  100% { opacity: 1; }
}
@keyframes efBtnFace2In { 0% { opacity: 0; visibility: hidden; } 24.12% { opacity: 0.42; } 64.03%, 71.93% { opacity: 0.3; } 100% { opacity: 1; } }
@keyframes efBtnDrop { from { translate: 0 -5.8px; } to { translate: 0 0; } }
@keyframes efBtnOut { from { opacity: 1; } to { opacity: 0; visibility: hidden; } }
@keyframes efBtnBandOut { from { opacity: 1; animation-timing-function: cubic-bezier(0.3333, 0.1921, 0.6667, 0.5439); } to { opacity: 0; visibility: hidden; } }
@keyframes efBtnSink { from { translate: 0 0; } to { translate: 0 20.6px; } }
`);

  /** Button space → stage: the outlines are stage px turned by rot degrees about (cx, cy), the middle of the gap
      between the buttons, so their top edges climb to the right and their inner sides lean as in the game. */
  const DCBTN = { rot: -1.817, cx: 968.8, cy: 918 };

  /* Measured on the game: each button is a straight top edge (top), an arc of r 395.42 centred on the gap that
     drops to the inner side, a straight inner side and a curve back to the sharp tip, with corners of r 3.6 and 5.6.
     The right button nearly mirrors the left one about the gap and sits 1.5 px lower; side = its inner side,
     band = where the bright band starts.
     plate = the back plate, as a lower copy of the button looks from the game's camera: the outline narrowed towards
     the gap (sx about the inner side), its lower parts slid sideways (shear) and squashed towards the top edge (sy),
     then pushed down by at = [dx, dy]; it peeks out under the lower curve, hugging it, and hides under the right tip.
     shadow = offsets of the icon's dark and the label's pale shadow, which lean towards the gap as the plate does.
     tab = the button's group for the transitions (.ef-dctab--plan / --brief); decal = its small printed mark, the
     game's artwork in stage px, which comes and goes with the button's body. */
  const BUTTONS = [
    {
      tab: "plan", decal: "art-disc-square",
      action: "plan", label: "工业计划", art: "art-disc-plan", top: 857.93, side: 959.23, band: 927.83,
      plate: { at: [5.3, 5.74], sx: 0.9714, shear: 0, sy: 0.98875 }, shadow: { art: [0.31, 0.52], text: [0.38, 1.58] },
      text: { size: 24.03, matrix: [1.0099, -0.0141, 0.024, 0.9998], x: [812.04, 836.44, 860.76, 884.82], y: [924.66, 923.98, 924.08, 922.98] },
      path: "M 664.87 857.93 L 868.36 857.93 A 395.42 395.42 0 0 0 955.75 870.68 A 3.6 3.6 0 0 1 959.23 874.28 L 959.23 957.79 A 5.6 5.6 0 0 1 953.55 963.39 C 853.66 961.98 739.35 925.45 664.87 857.93 Z",
    },
    {
      tab: "brief", decal: "art-disc-decal",
      action: "brief", label: "工业简报", art: "art-disc-brief", top: 859.43, side: 978.37, band: 929.42,
      plate: { at: [1.48, 4.27], sx: 0.9681, shear: -0.0159, sy: 0.98775 }, shadow: { art: [-0.73, 0.63], text: [-1.13, 1.7] },
      text: { size: 23.65, matrix: [1.0198, -0.0196, 0.0322, 0.9996], x: [949.53, 973.67, 998.29, 1022.58], y: [927.15, 926.73, 926.26, 926.12] },
      path: "M 1273.78 859.43 L 1069.24 859.43 A 395.42 395.42 0 0 1 981.85 872.18 A 3.6 3.6 0 0 0 978.37 875.78 L 978.37 959.29 A 5.6 5.6 0 0 0 984.05 964.89 C 1087.69 963.43 1200.22 925.6 1273.78 859.43 Z",
    },
  ];

  const STROKE = ' stroke-linejoin="round" stroke-linecap="round"';

  /** Markup drawn in the plate's place: its static shift, narrowing, shear and squash; .ef-dcsh-move adds the lean
      with the camera. */
  function plateShape(b, body) {
    const p = b.plate;
    const m = [p.sx, 0, p.shear, p.sy, b.side * (1 - p.sx) - p.shear * b.top, b.top * (1 - p.sy)];
    return '<g class="ef-dcsh-move" data-ef-shadow="" style="--ef-shx0: ' + p.at[0] + "; --ef-shy0: " + p.at[1] + '">' +
      '<g transform="matrix(' + m.map(function (v) { return +v.toFixed(4); }).join(" ") + ')">' + body + "</g></g>";
  }

  function backPlate(b) {
    return plateShape(b, '<path d="' + b.path + '" fill="none" stroke="rgba(247,215,39,0.35)" stroke-width="2.1"' + STROKE + "></path>");
  }

  /** The dark top of the face is see-through in the game: where the plate lies behind it, the face is lighter and
      the plate's edge shows as a pale inner rim. Drawn inside the face so the plate stays faint outside it.
      The face is drawn in the game tab's layers (the transitions fade each one on its own; the drawing order is as
      before): the bottom layer (the top half and the plate's rim showing through it), the bright band and the stroke
      layer (grid, inner dark stroke, outer stroke and hit area), each clipped to the face. */
  function buttonFace(b, i) {
    const clip = ' clip-path="url(#dcClip' + i + ')" pointer-events="none"';
    return '<g class="ef-discbtn" data-action="' + b.action + '" role="button" aria-label="' + b.label + '">' +
      '<g class="ef-dclayer"' + clip + '>' +
        '<rect x="640" y="840" width="660" height="' + (b.band - 840).toFixed(2) + '" fill="url(#dcTopFill)"></rect>' +
        plateShape(b, '<path d="' + b.path + '" fill="rgba(255,211,26,0.13)"></path>' +
          '<path d="' + b.path + '" fill="none" stroke="rgba(26,23,8,0.13)" stroke-width="4.4" clip-path="url(#dcClip' + i + ')"></path>' +
          '<path d="' + b.path + '" fill="none" stroke="rgba(247,215,39,0.27)" stroke-width="1.7"></path>') +
      "</g>" +
      '<g class="ef-dcband"' + clip + '>' +
        '<rect x="640" y="' + b.band + '" width="660" height="' + (990 - b.band).toFixed(2) + '" fill="#FFE128"></rect>' +
      "</g>" +
      '<g class="ef-dclayer">' +
        '<g' + clip + '>' +
          '<rect x="640" y="840" width="660" height="150" fill="url(#dcGrid)"></rect>' +
          '<path d="' + b.path + '" fill="none" stroke="rgba(80,72,24,0.8)" stroke-width="4.6"></path>' +
        "</g>" +
        '<path d="' + b.path + '" fill="none" stroke="#FDDC28" stroke-width="2" pointer-events="none"></path>' +
        '<path d="' + b.path + '" fill="transparent" pointer-events="visible"></path>' +
      "</g>" +
    "</g>";
  }

  /** One button's group for the transitions (stage px, unrotated): they drop in and sink out by this group. The two
      buttons do not overlap, so grouping them does not change the resting picture. */
  function tabGroup(b, body) {
    return '<g class="ef-dctab ef-dctab--' + b.tab + '">' + body + "</g>";
  }

  function buttonsSVG() {
    const defs =
      // the top's colour drifts along the buttons as the game's see-through face does over its backdrop
      '<linearGradient id="dcTopFill" gradientUnits="userSpaceOnUse" x1="700" y1="0" x2="1260" y2="0">' +
        '<stop offset="0" stop-color="rgba(137,129,57,0.9)"></stop><stop offset="0.214" stop-color="rgba(159,145,54,0.9)"></stop>' +
        '<stop offset="0.464" stop-color="rgba(171,156,55,0.9)"></stop><stop offset="0.536" stop-color="rgba(165,150,51,0.9)"></stop>' +
        '<stop offset="0.75" stop-color="rgba(159,145,47,0.9)"></stop><stop offset="1" stop-color="rgba(143,136,51,0.9)"></stop></linearGradient>' +
      '<pattern id="dcGrid" width="2.48" height="2.48" patternUnits="userSpaceOnUse"><path d="M 0 0.25 H 2.48 M 0.25 0 V 2.48" stroke="#1a1707" stroke-width="0.5" opacity="0.035"></path></pattern>' +
      BUTTONS.map(function (b, i) { return '<clipPath id="dcClip' + i + '"><path d="' + b.path + '"></path></clipPath>'; }).join("");
    const rotate = ' transform="rotate(' + DCBTN.rot + " " + DCBTN.cx + " " + DCBTN.cy + ')"';
    // per button: its back plate below (a layer of its own, like the offset ghost in the game's bottom layer), the face
    // above it, then its decal (stage px) on top
    return "<defs>" + defs + "</defs>" +
      BUTTONS.map(function (b, i) {
        return tabGroup(b, "<g" + rotate + '><g class="ef-dclayer">' + backPlate(b) + "</g>" + buttonFace(b, i) + "</g>" +
          '<g class="ef-dclayer ef-discdecor"><use href="#' + b.decal + '"></use></g>');
      }).join("");
  }

  /** Shadow group at a button's offset (shadow.art or shadow.text); the class adds the lean with the camera. */
  function shadowGroup(cls, at, body) {
    return '<g class="' + cls + '" data-ef-shadow="" style="--ef-shx0: ' + at[0] + "; --ef-shy0: " + at[1] + '">' + body + "</g>";
  }

  /** Icons and labels (stage px), one group per button: its shadows first, then the white artwork and text on top. */
  function labelsMarkup() {
    return '<defs><filter id="dcIconBlur" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="1.15"></feGaussianBlur></filter></defs>' +
      BUTTONS.map(function (b) {
        return tabGroup(b, shadowGroup("ef-discicon-sh", b.shadow.art, '<use href="#' + b.art + '" filter="url(#dcIconBlur)"></use>') +
          shadowGroup("ef-disclab-sh", b.shadow.text, EF.labelSVG(b.label, b.text)) +
          '<g class="ef-disclab"><use href="#' + b.art + '"></use>' + EF.labelSVG(b.label, b.text) + "</g>");
      }).join("");
  }

  function mount(layer) {
    layer.insertAdjacentHTML("beforeend",
      '<svg class="ef-discbtns" viewBox="0 0 1920 1080">' + buttonsSVG() + "</svg>" +
      '<svg class="ef-disclabels" viewBox="0 0 1920 1080" aria-hidden="true">' + labelsMarkup() + "</svg>");
  }

  EF.discButtons = { mount };
})();
