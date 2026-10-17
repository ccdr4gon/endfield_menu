/* Right column: two tiles per row, rows running along the right edge of the disc.
   The column scrolls by angle: wheel scrolling eases towards a target, dragging follows the pointer
   with rubber-band overscroll, a flick keeps coasting, and any overscroll springs back.
   Tile icons are the game's artwork traced from a screenshot (button-art.js) and labels are Noto Sans SC laid out
   where the game puts them, both in the 107 × 104 face's coordinates. */
(function () {
  "use strict";
  const EF = window.EF;
  const DISC = EF.geo.DISC, R_EDGE = EF.geo.R_EDGE;

  EF.addStyle("right-tiles", `
/* A row's position (set by layout()) is read by the row itself only: registered as non-inherited, so a scroll frame
   restyles the rows and their back plates (which get their offset written directly), not every element inside the
   rows. Nothing inside a row may read it. */
@property --ef-row-tx { syntax: '<length>'; inherits: false; initial-value: 0px; }
@property --ef-row-ty { syntax: '<length>'; inherits: false; initial-value: 0px; }
.ef-right { position: absolute; inset: 0; pointer-events: none; }
.ef-right__viewport {
  position: absolute; left: 1290px; top: 200px; width: 512px; height: 805px;
  overflow: hidden; touch-action: none; cursor: grab; pointer-events: auto;
  -webkit-mask-image: linear-gradient(177deg, transparent 58px, #000 78px, #000 calc(100% - 82px), transparent calc(100% - 38px));
  mask-image: linear-gradient(177deg, transparent 58px, #000 78px, #000 calc(100% - 82px), transparent calc(100% - 38px));
}
.ef-right__viewport.is-drag { cursor: grabbing; }
.ef-rrow {
  position: absolute; left: 0; top: 0; width: 235px; height: 104px; pointer-events: none;
  transform: translate(var(--ef-row-tx, 0px), var(--ef-row-ty, 0px)) rotate(-3deg); transform-origin: 0 50%; will-change: transform;
}
.ef-rrow::after {
  content: ""; position: absolute; inset: -52% -26%; border-radius: 50%; z-index: -2; pointer-events: none;
  background: radial-gradient(closest-side, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.13) 52%, rgba(255,255,255,0) 100%);
}
.ef-rtile {
  position: absolute; top: 0; width: 107px; height: 104px; padding: 0; border: 0; background: none;
  cursor: pointer; color: var(--ef-ink); pointer-events: auto;
}
.ef-rtile:first-of-type { left: 0; }
.ef-rtile:last-of-type { left: 128px; }
.ef-rtile__face {
  position: absolute; inset: 0; border-radius: 8px;
  background:
    repeating-linear-gradient(0deg, rgba(0,0,0,0.026) 0 1px, rgba(0,0,0,0) 1px 3.3px),
    linear-gradient(45deg, rgba(255,254,252,0.94) 0%, rgba(251,250,247,0.84) 45%, rgba(238,237,233,0.74) 100%);
}
/* Hover, focus and press, as in the game: the whole tile floats up along the floor's normal (0.1 s, power2 out; back in
   0.16 s), its face brightens 0.1 s later (0.14 s, ease out; at once when left) and pressing shrinks it to 0.955
   (0.06 s; back in 0.12 s). Lift and press are two progress values on the button, each with its own timing; they
   combine into the translate and scale of its layers, so the back plate (about its own, offset centre) and the frame
   lift and shrink with the face. The button itself stays put: its hit area is steady.
   The lift's offset depends on where the row is on screen (--ef-lift-x / y, written by script on the tile being
   lifted, see lift()). A press is marked by script (data-ef-press): the viewport captures the pointer on press, which
   ends :hover; dragging over 6 px (no click then), releasing or a cancelled pointer clears it, so dragging the column
   shows no press. Nothing reacts while the menu closes. The face's light is under the icon and label. */
.ef-rtile__face::before {
  content: ""; position: absolute; inset: 0; border-radius: 8px; background: #f6f6f4;
  opacity: 0; transition: opacity 0.14s ease-out; pointer-events: none;
}
body:not(.ef-out) .ef-rtile:is(:hover, :focus-visible, [data-ef-press]) .ef-rtile__face::before { opacity: 0.75; transition-delay: 0.1s; }
/* Everything that moves a tile's layers lives on the button: the lift and press progress, the lift's offset and the
   entrance slide's progress (see below). Registered as non-inherited, these reach the layers by explicit inheritance
   only, so a change on the button restyles the button and its layers, not the icon and label inside the face.
   The layers are the frame (::before), the back plate, the face and the notification marker, each named by class (a
   new layer needs its class in these rules and in the transitions below): a universal subject or a class list inside
   :is() would be tested against every element the page restyles. */
@property --ef-tile-lift { syntax: "<number>"; inherits: false; initial-value: 0; }
@property --ef-tile-press { syntax: "<number>"; inherits: false; initial-value: 0; }
@property --ef-lift-x { syntax: "<length>"; inherits: false; initial-value: 0px; }
@property --ef-lift-y { syntax: "<length>"; inherits: false; initial-value: 0px; }
@property --ef-row-px { syntax: "<number>"; inherits: false; initial-value: 0; }
@property --ef-row-py { syntax: "<number>"; inherits: false; initial-value: 0; }
.ef-rtile::before, .ef-rtile__shadow, .ef-rtile__face, .ef-rtile > .ef-dot {
  --ef-tile-lift: inherit; --ef-tile-press: inherit; --ef-lift-x: inherit; --ef-lift-y: inherit; --ef-row-px: inherit; --ef-row-py: inherit;
}
@media (prefers-reduced-motion: no-preference) {
  .ef-rtile { transition: --ef-tile-lift 0.16s cubic-bezier(.33,1,.68,1), --ef-tile-press 0.12s cubic-bezier(.33,1,.68,1); }
  body:not(.ef-out) .ef-rtile:is(:hover, :focus-visible, [data-ef-press]) { --ef-tile-lift: 1; transition-duration: 0.1s, 0.12s; }
  body:not(.ef-out) .ef-rtile[data-ef-press] { --ef-tile-press: 1; transition-duration: 0.1s, 0.06s; }
  /* the layers' offset = the hover lift + the entrance slide: the slot's start offset on screen (--ef-row-fx / fy, set
     only while the menu opens, see below) times the slide's progress, turned into the row's -3deg frame; at rest both
     are 0 and the scale is 1. The back plate adds its own offset (see .ef-rtile__shadow). */
  .ef-rtile::before, .ef-rtile__face, .ef-rtile > .ef-dot {
    translate: calc(var(--ef-lift-x) * var(--ef-tile-lift) + var(--ef-row-fx, 0px) * var(--ef-row-px) * 0.9986 - var(--ef-row-fy, 0px) * var(--ef-row-py) * 0.0523)
               calc(var(--ef-lift-y) * var(--ef-tile-lift) + var(--ef-row-fx, 0px) * var(--ef-row-px) * 0.0523 + var(--ef-row-fy, 0px) * var(--ef-row-py) * 0.9986);
  }
  .ef-rtile > .ef-rtile__shadow {
    translate: calc((var(--ef-shx0) + var(--ef-swx, 0) * var(--ef-h)) * 1px + var(--ef-lift-x) * var(--ef-tile-lift) + var(--ef-row-fx, 0px) * var(--ef-row-px) * 0.9986 - var(--ef-row-fy, 0px) * var(--ef-row-py) * 0.0523)
               calc((var(--ef-shy0) + var(--ef-swy, 0) * var(--ef-h)) * 1px + var(--ef-lift-y) * var(--ef-tile-lift) + var(--ef-row-fx, 0px) * var(--ef-row-px) * 0.0523 + var(--ef-row-fy, 0px) * var(--ef-row-py) * 0.9986);
  }
  .ef-rtile::before, .ef-rtile__shadow, .ef-rtile__face, .ef-rtile > .ef-dot {
    scale: calc((1 + 0.0063 * var(--ef-tile-lift)) * (1 - 0.045 * var(--ef-tile-press)));
  }
}
.ef-rtile::before {
  content: ""; position: absolute; inset: -5px; border: 2.5px solid rgba(238,241,245,0.62); border-radius: 13px;
  pointer-events: none;
}
/* The back plate's resting offset, leaning with the camera, is its translate rather than its transform: the hover and
   press scale then goes about the plate's own, offset centre, so its offset from the face stays the same (one
   expression per axis, which keeps the plate's restyle on each scroll frame cheap). */
.ef-rtile__shadow {
  position: absolute; inset: 0; pointer-events: none; z-index: -1;
  --ef-h: 36; --ef-shx0: var(--ef-row-shx, -17); --ef-shy0: var(--ef-row-shy, 12);   /* --ef-row-sh*: set on the plate by layout() */
  translate: calc((var(--ef-shx0) + var(--ef-swx, 0) * var(--ef-h)) * 1px) calc((var(--ef-shy0) + var(--ef-swy, 0) * var(--ef-h)) * 1px);
}
.ef-rtile__shadow::before { content: ""; position: absolute; inset: -5px; border: 2.5px solid rgba(255,255,250,0.32); border-radius: 13px; }
.ef-rtile__shadow::after { content: ""; position: absolute; inset: 0; border-radius: 8px; background: rgba(255,255,250,0.39); }
/* Icon and label in the face: traced artwork (filled with the game's ink) and Noto Sans SC. */
.ef-rtile__art { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; color: #313131; fill: #313131; }
.ef-rtile__art text { font-family: var(--ef-font-cn); font-weight: 550; }
.ef-rtile .ef-dot { right: 4px; top: -11px; }

.ef-right__nav { position: absolute; pointer-events: none; }
.ef-right__nav--up {
  top: 227.5px; left: 1459px; width: 287.5px; transform: rotate(-1.8deg);
  --ef-nav-shx: -9.3; --ef-nav-shy: 10.9;
}
/* The bottom divider lines up with the last row when the column is scrolled to the end: parallel to the row's outer
   border (-3deg) and, as seen on screen, starting right under the left tile's border and ending under the right
   tile's (the floor's perspective leans the tiles' sides, so the ends are placed by their projection). */
.ef-right__nav--dn {
  top: 982.26px; left: 1396.97px; width: 240.43px; transform-origin: 50% 6.5px; transform: rotate(-3deg);
  --ef-nav-shx: -5.5; --ef-nav-shy: 0.9;
}
/* The divider: a thin band in the middle of its 3px box that fades in and out at its ends (alpha only; the front group
   below sets the brightness). The top one lights up over the same stretch of screen as the game's. */
.ef-right__nav i {
  display: block; height: 3px; margin: 5px 0;
  background: linear-gradient(90deg, transparent 4%, rgba(255,255,255,0.25) 6%, rgba(255,255,255,0.7) 13%, #fff 20%, #fff 87%, rgba(255,255,255,0.75) 94%, rgba(255,255,255,0.3) 100%);
  clip-path: inset(0.73px 0);
}
.ef-right__nav--up i { margin-top: -4px; }
.ef-right__nav--dn i {
  margin-bottom: -4px; clip-path: inset(0.675px 0);
  background: linear-gradient(90deg, rgba(255,255,255,0.2) 0%, #fff 12%, #fff 88%, rgba(255,255,255,0.2) 100%);
}
/* The page arrow grows out of its divider as one piece, as in the game: a triangle hanging from the line and a
   chevron after it, drawn in the line's px around the middle of the line (y pointing away from it; the top arrow is
   the same shape flipped and a little smaller, as measured). Line and arrow are one translucent white piece (the front
   group's opacity, so they do not add up where they meet). Behind them, the back plate repeats the line and the
   arrow, faint, and leans with the camera like the tiles' plates (--ef-nav-shx / --ef-nav-shy are its resting offset,
   measured from the game). The front lets the plate through, which gives the game's two tones: the triangle and the
   chevron are a little brighter where the plate's line and arrow lie behind them. */
.ef-right__navfg { opacity: 0.815; }
.ef-right__navsh {
  position: absolute; inset: 0; z-index: -1; opacity: 0.23;
  --ef-h: 25; --ef-shx0: var(--ef-nav-shx); --ef-shy0: var(--ef-nav-shy);
  transform: translate(calc((var(--ef-shx0) + var(--ef-swx, 0) * var(--ef-h)) * 1px),
                       calc((var(--ef-shy0) + var(--ef-swy, 0) * var(--ef-h)) * 1px));
}
/* the bottom plate's line shows as a strip right under the line, as tall as the game's (the plate's offset is measured
   on the arrow, and our line slopes more than the game's) */
.ef-right__nav--dn .ef-right__navsh i { clip-path: inset(0.675px 0 0.2px); }
.ef-right__nav path { fill: #fff; }
.ef-right__nav span { display: block; height: 22px; opacity: 0.45; transition: opacity 0.2s; }
.ef-right__nav svg { position: absolute; left: calc(50% - 16px); width: 32px; height: 48px; overflow: visible; }
/* Both arrows stand on screen as the game's do: the bottom divider slopes 4.4deg more than the game's (it follows the
   last row), so its arrow is turned back against it. The top arrow sits where the game's does along the line, a
   little right of the middle of our shorter line. */
.ef-right__nav--up svg { top: -4.5px; left: calc(50% - 9.95px); transform: rotate(-1.45deg) scale(0.935, -0.905); }
.ef-right__nav--dn svg { top: -17.5px; transform: rotate(4deg); }
.ef-right__nav.is-active span { opacity: 1; }
@media (prefers-reduced-motion: no-preference) {
  .ef-right__nav.is-active span { animation: efNavBreath 1.8s ease-in-out infinite; }
}
@keyframes efNavBreath { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

/* Open and close, measured on the game's menu (times in this page's timeline, see index.html).
   Rows are timed by the screen slot they start in, not by their place in the list: a row's data-ef-slot (0 = the top
   row, 4 = the fifth, 5 = the half row at the bottom and any row below it) is set when a transition starts and held
   while it plays (see watchTransitions()), so a place on screen keeps its beat whichever row is there.
   Open: the glow behind the rows comes up first, in place. The tiles fade in by slot, the second row first, then the
   top row, then the rest in turn; back plate, frame and face each fade in on their own (they are not grouped: the
   translucent face shows the plate through it, a pale ghost as in the game). A tile stays hidden (and unclickable)
   until its slot starts, and slides back in from the lower left (the disc's side): x over 0.3 s and y over 0.5 s, both
   expo out, as two progress values on the button (--ef-row-px / py) that the layers' translate combines with the
   slot's start offset on screen (--ef-row-fx / fy, see the hover above). The row boxes stay in place. The y curve is cut
   before 890 ms and refitted, within 0.05 px.
   The bottom half row flashes to 0.45, falls back to 0.3, then settles. The page arrows and dividers show, go out and
   show again.
   Close: the faces fade out by slot from the bottom up (slots 3-5 at 68-133 ms, the second row 103-148 ms, the third
   144-189 ms, the top row last, 140-245 ms, power3 in); the plates start with their faces but take a little longer,
   leaving a dark empty plate for a moment. All rows slide 88 px to the left at 100-250 ms, faster and faster; the glow
   goes first (50-95 ms) and the page arrows fade at 136-181 ms. */
@media (prefers-reduced-motion: no-preference) {
  body.ef-in .ef-rrow::after { animation: efRowIn 270ms 335ms cubic-bezier(.33,1,.68,1) both; }
  body.ef-in .ef-rrow[data-ef-slot="0"] .ef-rtile { animation: efRowInX 300ms 385ms cubic-bezier(.154,1.054,.36,.985) both, efRowInY 500ms 385ms cubic-bezier(.154,1.054,.36,.985) both; --ef-row-fx: -25px; --ef-row-fy: 22px; }
  body.ef-in .ef-rrow[data-ef-slot="1"] .ef-rtile { animation: efRowInX 300ms 372ms cubic-bezier(.154,1.054,.36,.985) both, efRowInY 500ms 372ms cubic-bezier(.154,1.054,.36,.985) both; --ef-row-fx: -44px; --ef-row-fy: 29px; }
  body.ef-in .ef-rrow[data-ef-slot="2"] .ef-rtile { animation: efRowInX 300ms 450ms cubic-bezier(.154,1.054,.36,.985) both, efRowInY 440ms 450ms cubic-bezier(.166,1.006,.392,.984) both; --ef-row-fx: -15px; --ef-row-fy: 11px; }
  body.ef-in .ef-rrow[data-ef-slot="3"] .ef-rtile, body.ef-in .ef-rrow[data-ef-slot="4"] .ef-rtile { animation: efRowInX 300ms 479ms cubic-bezier(.154,1.054,.36,.985) both, efRowInY 411ms 479ms cubic-bezier(.173,.979,.409,.983) both; --ef-row-fx: -15px; --ef-row-fy: 11px; }
  body.ef-in .ef-rrow[data-ef-slot="5"] .ef-rtile { animation: efRowInX 300ms 475ms cubic-bezier(.154,1.054,.36,.985) both, efRowInY 415ms 475ms cubic-bezier(.172,.983,.407,.983) both; --ef-row-fx: -15px; --ef-row-fy: 11px; }
  /* the layers by class, as in the hover above (a universal subject would also make the body.ef-in toggle restyle the
     whole page) */
  body.ef-in .ef-rrow[data-ef-slot="0"] .ef-rtile::before, body.ef-in .ef-rrow[data-ef-slot="0"] .ef-rtile__shadow,
  body.ef-in .ef-rrow[data-ef-slot="0"] .ef-rtile__face, body.ef-in .ef-rrow[data-ef-slot="0"] .ef-dot { animation: efRowIn 60ms 385ms linear both; }
  body.ef-in .ef-rrow[data-ef-slot="1"] .ef-rtile::before, body.ef-in .ef-rrow[data-ef-slot="1"] .ef-rtile__shadow,
  body.ef-in .ef-rrow[data-ef-slot="1"] .ef-rtile__face, body.ef-in .ef-rrow[data-ef-slot="1"] .ef-dot { animation: efRowIn 40ms 372ms linear both; }
  body.ef-in .ef-rrow[data-ef-slot="2"] .ef-rtile::before, body.ef-in .ef-rrow[data-ef-slot="2"] .ef-rtile__shadow,
  body.ef-in .ef-rrow[data-ef-slot="2"] .ef-rtile__face, body.ef-in .ef-rrow[data-ef-slot="2"] .ef-dot { animation: efRowIn 48ms 450ms linear both; }
  body.ef-in .ef-rrow[data-ef-slot="3"] .ef-rtile::before, body.ef-in .ef-rrow[data-ef-slot="3"] .ef-rtile__shadow,
  body.ef-in .ef-rrow[data-ef-slot="3"] .ef-rtile__face, body.ef-in .ef-rrow[data-ef-slot="3"] .ef-dot,
  body.ef-in .ef-rrow[data-ef-slot="4"] .ef-rtile::before, body.ef-in .ef-rrow[data-ef-slot="4"] .ef-rtile__shadow,
  body.ef-in .ef-rrow[data-ef-slot="4"] .ef-rtile__face, body.ef-in .ef-rrow[data-ef-slot="4"] .ef-dot { animation: efRowIn 60ms 479ms linear both; }
  body.ef-in .ef-rrow[data-ef-slot="5"] .ef-rtile::before, body.ef-in .ef-rrow[data-ef-slot="5"] .ef-rtile__shadow,
  body.ef-in .ef-rrow[data-ef-slot="5"] .ef-rtile__face, body.ef-in .ef-rrow[data-ef-slot="5"] .ef-dot { animation: efRowFlicker 120ms 475ms linear both; }
  body.ef-in .ef-right__nav { animation: efNavIn 108ms 370ms linear both; }
  /* close; the faces' rules include the notification marker, which goes with its face */
  body.ef-out .ef-rrow { animation: efRowSlide 150ms 100ms cubic-bezier(.11,0,.5,0) both; }
  body.ef-out .ef-rrow::after { animation: efRowOut 45ms 50ms linear both; }
  body.ef-out .ef-rrow[data-ef-slot="0"] .ef-rtile__face, body.ef-out .ef-rrow[data-ef-slot="0"] .ef-dot,
  body.ef-out .ef-rrow[data-ef-slot="0"] .ef-rtile::before { animation: efRowOut 105ms 140ms cubic-bezier(.5,0,.75,0) both; }
  body.ef-out .ef-rrow[data-ef-slot="0"] .ef-rtile__shadow { animation: efRowOut 110ms 140ms cubic-bezier(.5,0,.75,0) both; }
  body.ef-out .ef-rrow[data-ef-slot="1"] .ef-rtile__face, body.ef-out .ef-rrow[data-ef-slot="1"] .ef-dot,
  body.ef-out .ef-rrow[data-ef-slot="1"] .ef-rtile::before { animation: efRowOut 45ms 103ms linear both; }
  body.ef-out .ef-rrow[data-ef-slot="1"] .ef-rtile__shadow { animation: efRowOut 55ms 103ms linear both; }
  body.ef-out .ef-rrow[data-ef-slot="2"] .ef-rtile__face, body.ef-out .ef-rrow[data-ef-slot="2"] .ef-dot,
  body.ef-out .ef-rrow[data-ef-slot="2"] .ef-rtile::before { animation: efRowOut 45ms 144ms linear both; }
  body.ef-out .ef-rrow[data-ef-slot="2"] .ef-rtile__shadow { animation: efRowOut 55ms 144ms linear both; }
  body.ef-out .ef-rrow[data-ef-slot="3"] .ef-rtile__face, body.ef-out .ef-rrow[data-ef-slot="3"] .ef-dot,
  body.ef-out .ef-rrow[data-ef-slot="3"] .ef-rtile::before { animation: efRowOut 48ms 68ms linear both; }
  body.ef-out .ef-rrow[data-ef-slot="3"] .ef-rtile__shadow { animation: efRowOut 53ms 68ms linear both; }
  body.ef-out .ef-rrow[data-ef-slot="4"] .ef-rtile__face, body.ef-out .ef-rrow[data-ef-slot="4"] .ef-dot,
  body.ef-out .ef-rrow[data-ef-slot="4"] .ef-rtile::before { animation: efRowOut 48ms 83ms linear both; }
  body.ef-out .ef-rrow[data-ef-slot="4"] .ef-rtile__shadow { animation: efRowOut 53ms 83ms linear both; }
  body.ef-out .ef-rrow[data-ef-slot="5"] .ef-rtile__face, body.ef-out .ef-rrow[data-ef-slot="5"] .ef-dot,
  body.ef-out .ef-rrow[data-ef-slot="5"] .ef-rtile::before { animation: efRowOut 48ms 85ms linear both; }
  body.ef-out .ef-rrow[data-ef-slot="5"] .ef-rtile__shadow { animation: efRowOut 53ms 85ms linear both; }
  body.ef-out .ef-right__nav { animation: efNavOut 45ms 136ms linear both; }
}
@keyframes efRowIn { from { opacity: 0; visibility: hidden; } }
@keyframes efRowFlicker { 0% { opacity: 0; visibility: hidden; } 21%, 33% { opacity: 0.45; } 62% { opacity: 0.3; } 95%, 100% { opacity: 1; } }
@keyframes efRowInX { from { --ef-row-px: 1; visibility: hidden; } to { --ef-row-px: 0; } }
@keyframes efRowInY { from { --ef-row-py: 1; } to { --ef-row-py: 0; } }
@keyframes efRowOut { to { opacity: 0; visibility: hidden; } }
@keyframes efRowSlide { to { translate: -88px 0; } }
@keyframes efNavIn { 0% { opacity: 0; visibility: hidden; } 13.889%, 38.889% { opacity: 1; visibility: visible; } 48.611%, 86.111% { opacity: 0; visibility: hidden; } 100% { opacity: 1; } }
@keyframes efNavOut { to { opacity: 0; visibility: hidden; } }
`);

  /** art = traced icon in button-art.js; text = the label as the game lays it out (see EF.labelSVG).
      Rows 5-7 (塔晶集换 … 任务) come from a second screenshot with the column scrolled down, rows 8-9 (地图 …
      游戏工具) from a recording of the game scrolled to the bottom. */
  const TILES = [
    { id: "handbook", label: "行动手册", art: "art-tile-handbook",
      text: { size: 22.1, matrix: [1.003, -0.0018, -0.0043, 1], x: [9.07, 31.66, 54.16, 76.9], y: [91.43, 91.41, 91.7, 91] } },
    { id: "pass", label: "通行证", art: "art-tile-pass",
      text: { size: 21.39, matrix: [1.05, 0.0055, -0.0152, 0.9999], x: [20.26, 41.56, 62.87], y: [90.33, 90.65, 90.1] } },
    { id: "region", label: "地区建设", art: "art-tile-region", dot: true,
      text: { size: 21.74, matrix: [1.0199, -0.016, 0.0057, 1], x: [7.79, 30.72, 52.49, 74.55], y: [91.43, 91.55, 92.07, 92.15] } },
    { id: "friends", label: "好友", art: "art-tile-friends",
      text: { size: 22.14, matrix: [1.0298, 0.018, -0.0105, 1], x: [31.45, 53.15], y: [90.31, 89.27] } },
    { id: "crafting", label: "装备加工", art: "art-tile-crafting",
      text: { size: 22.41, matrix: [0.9999, 0.0122, -0.0052, 1], x: [9.8, 31.56, 54.46, 76.52], y: [86.85, 86.99, 86.96, 86.63] } },
    { id: "squad", label: "编队", art: "art-tile-squad",
      text: { size: 21.64, matrix: [1.02, 0, -0.003, 1], x: [30.63, 52.91], y: [90.69, 90.88] } },
    { id: "wiki", label: "百科", art: "art-tile-wiki",
      text: { size: 21.61, matrix: [1.03, 0.0036, -0.0005, 1], x: [30.2, 52.17], y: [90.64, 90.81] } },
    { id: "vault", label: "贵重品库", art: "art-tile-vault",
      text: { size: 20.57, matrix: [1.05, 0.0055, -0.0052, 1], x: [10.27, 31.11, 51.64, 72.17], y: [90.97, 90.33, 89.97, 89.86] } },
    { id: "exchange", label: "塔晶集换", art: "art-tile-exchange",
      text: { size: 21.95, matrix: [1.0129, -0.0159, 0.0057, 1], x: [7.84, 30.54, 52.63, 74.72], y: [88.31, 88.5, 88.84, 89.79] } },
    { id: "archive", label: "档案库", art: "art-tile-archive",
      text: { size: 21.84, matrix: [1.023, 0.0054, 0.0018, 1], x: [19.7, 41.94, 63.99], y: [91.42, 91.77, 91.36] } },
    { id: "backpack", label: "背包", art: "art-tile-backpack",
      text: { size: 22.29, matrix: [1.02, -0.0053, -0.0148, 1.0001], x: [31.29, 53.18], y: [91.47, 91.12] } },
    { id: "glory", label: "光荣之路", art: "art-tile-glory",
      text: { size: 21.07, matrix: [1.04, -0.0073, 0, 1], x: [8.6, 30.35, 51.45, 73.14], y: [88, 88.51, 87.62, 87.92] } },
    { id: "etching", label: "基质蚀刻", art: "art-tile-etching",
      text: { size: 21.28, matrix: [1.03, 0.0054, 0.0048, 1], x: [8.26, 30.04, 51.47, 73.61], y: [90.51, 90.69, 89.84, 90.35] } },
    { id: "missions", label: "任务", art: "art-tile-missions",
      text: { size: 22.43, matrix: [0.992, 0.0035, -0.0075, 1], x: [31.9, 54.45], y: [90.89, 90.88] } },
    { id: "map", label: "地图", art: "art-tile-map",
      text: { size: 21.59, matrix: [1.0124, -0.0336, 0.0202, 0.9999], x: [29.15, 51.86], y: [92.42, 92.77] } },
    { id: "baker", label: "Baker", art: "art-tile-baker",
      text: { size: 20.95, matrix: [1.0368, -0.0181, 0.0045, 1.0001], x: [22.03, 36.68, 48.19, 60.19, 71.82], y: [92, 92.09, 92.1, 92.4, 92.42] } },
    { id: "survey", label: "问卷中心", art: "art-tile-survey",
      text: { size: 20.87, matrix: [1, 0.007, 0.006, 1.0001], x: [10.27, 31.76, 53.21, 74.72], y: [90.61, 90.75, 90.31, 89.73] } },
    { id: "tools", label: "游戏工具", art: "art-tile-tools",
      text: { size: 22.26, matrix: [1.01, -0.0071, -0.003, 1], x: [8.58, 30.87, 53.3, 75.65], y: [91.25, 91.28, 91.55, 91.65] } },
  ];

  /* Rows sit on the R_EDGE circle by polar angle; scrolling shifts every row's angle. */
  const ROWS = Math.ceil(TILES.length / 2);
  const VISIBLE_ROWS = 5;
  const ROW_STEP = 15.5;              // angle between rows, deg
  const FIRST_ROW_ANGLE = 22.52;      // angle of the first row at scroll 0, deg
  const ARC_Y = 490;                  // vertical travel per radian, px
  const LIFT = 50;
  const VIEWPORT = { x: 1290, y: 200 };
  const SHADOW_X = [-12.5, -0.024];   // back-plate offset as a linear function of the row position
  const SHADOW_Y = [16.17, -0.0207];
  const MAX_SCROLL = Math.max(0, ROWS - VISIBLE_ROWS) * ROW_STEP;
  const PX_PER_DEG = ARC_Y * Math.PI / 180;
  const MAX_OVERSCROLL = 354 / PX_PER_DEG;

  /** Page arrow pointing away from its divider, origin on the middle of the line (see .ef-right__nav svg): a triangle
      and a chevron. The top one's triangle is a little shorter and its chevron a little thicker, as measured. */
  const NAV_ARROW = {
    dn: ["M-11.55 0H11.55L0 9.92Z", "M-10.51 4.71L0 15.22 10.51 4.71 13.25 7.45 0 20.7-13.25 7.45Z"],
    up: ["M-11.55 0H11.55L0 9.42Z", "M-10.46 4.66L0 15.12 11.06 4.06 13.85 6.85 0 20.7-13.25 7.45Z"]
  };

  /** A divider with its arrow (dir "up" or "dn"); the back plate repeats the same flow, so it lines up. */
  function navMarkup(dir) {
    const arrow = '<svg aria-hidden="true" viewBox="-16 -24 32 48"><path d="' + NAV_ARROW[dir][0] + '"></path><path d="' +
      NAV_ARROW[dir][1] + '"></path></svg>';
    const inner = dir === "up" ? "<span>" + arrow + "</span><i></i>" : "<i></i><span>" + arrow + "</span>";
    return '<div class="ef-right__nav ef-right__nav--' + dir + '"><div class="ef-right__navsh" data-ef-shadow="">' + inner + "</div>" +
      '<div class="ef-right__navfg">' + inner + "</div></div>";
  }

  function tileMarkup(t) {
    return '<button class="ef-rtile" data-action="' + t.id + '" aria-label="' + t.label + '"><i class="ef-rtile__shadow" data-ef-shadow=""></i>' +
      '<span class="ef-rtile__face"><svg class="ef-rtile__art" viewBox="0 0 107 104" aria-hidden="true"><use href="#' + t.art + '"></use>' +
        EF.labelSVG(t.label, t.text) + "</svg></span>" +
      (t.dot ? '<i class="ef-dot"></i>' : "") + "</button>";
  }

  function rowsMarkup() {
    let h = "";
    for (let r = 0; r < ROWS; r += 1) {
      h += '<div class="ef-rrow" style="z-index:' + (40 + r) + ';">' + TILES.slice(r * 2, r * 2 + 2).map(tileMarkup).join("") + "</div>";
    }
    return h;
  }

  let rows = [], navUp = null, navDown = null;
  /* Built together with the rows in mount(), the only place rows are made (anything that rebuilds a row or its tiles
     must refresh all three the same way): each row's two back plates, which read the row's plate offset, the values
     layout() last wrote for each row, so unchanged ones are not written again, and each tile's row, column and last
     written lift. layout() and writeLift() are the only writers of these properties. */
  let rowPlates = [], written = [], tiles = new Map();
  let scroll = 0;   // current scroll angle, deg (0 … MAX_SCROLL, beyond while overscrolled)
  let lifted = null;   // the tile that is (or was last) lifted on hover, focus or press, see lift()

  function rowPosition(row) {
    const a = (FIRST_ROW_ANGLE - row * ROW_STEP + scroll) * Math.PI / 180;
    return {
      x: DISC.cx + R_EDGE * Math.cos(a) - VIEWPORT.x,
      y: DISC.cy - LIFT - ARC_Y * a - 22 - VIEWPORT.y,
    };
  }

  function setIfChanged(el, w, name, value) {
    if (w[name] === value) return;
    w[name] = value;
    el.style.setProperty(name, value);
  }

  /** The lift's offset for a tile, from its row's place: the game lifts a tile 11 px along the floor's normal, which
      the perspective turns into about (4.1, -6.1) px on screen at the top row and (4.4, -1.7) px at the bottom half row,
      about 1 px further right in the right column, fitted here as a linear function of the row position (within
      0.2 px of the game in every slot). Only the tile being lifted gets it, refreshed by layout() while the column
      scrolls, so a scroll frame does not restyle every tile; the last one keeps its values while it settles back. */
  function writeLift(tile) {
    const t = tiles.get(tile), p = rowPosition(t.row);
    const x = ((t.right ? 4.73 : 3.71) + p.x * 0.0067).toFixed(2) + "px";
    const y = (p.y * 0.0076 - 6.75).toFixed(2) + "px";
    if (x !== t.x) tile.style.setProperty("--ef-lift-x", (t.x = x));
    if (y !== t.y) tile.style.setProperty("--ef-lift-y", (t.y = y));
  }

  function lift(tile) {
    lifted = tile;
    writeLift(tile);
  }

  function layout() {
    rows.forEach(function (el, i) {
      const p = rowPosition(i), w = written[i];
      setIfChanged(el, w, "--ef-row-tx", p.x.toFixed(1) + "px");
      setIfChanged(el, w, "--ef-row-ty", p.y.toFixed(1) + "px");
      // the plate offset goes on the two plates themselves: set on the row, it would inherit to everything in it
      const shx = (SHADOW_X[0] + SHADOW_X[1] * p.x).toFixed(2), shy = (SHADOW_Y[0] + SHADOW_Y[1] * p.y).toFixed(2);
      if (shx !== w.shx || shy !== w.shy) {
        w.shx = shx;
        w.shy = shy;
        rowPlates[i].forEach(function (plate) {
          plate.style.setProperty("--ef-row-shx", shx);
          plate.style.setProperty("--ef-row-shy", shy);
        });
      }
    });
    if (lifted) writeLift(lifted);
    navUp.classList.toggle("is-active", scroll > 0.3);
    navDown.classList.toggle("is-active", scroll < MAX_SCROLL - 0.3);
  }

  /** Each row's screen slot for the transitions (see the CSS): its place minus the rows scrolled past, rounded and
      kept within 0-5. */
  function setSlots() {
    rows.forEach(function (el, i) {
      const slot = String(Math.max(0, Math.min(5, Math.round(i - scroll / ROW_STEP))));
      if (el.getAttribute("data-ef-slot") !== slot) el.setAttribute("data-ef-slot", slot);
    });
  }

  /** Sets the slots whenever a transition starts (body.ef-in or body.ef-out added) and holds them while it plays, as
      the game times every row by where it is when the transition starts: scrolling meanwhile only moves the rows, as a
      new slot would restart a row's animation or change its delay (a half-faded face would come back). Removing and
      adding the class within one task (a replayed entrance, a reopen during the exit) also starts a new one. Every
      entrance starts from the top row, as the game's menu does on every open. */
  function watchTransitions(toTop) {
    const phaseOf = function (cls) { return /(^|\s)ef-out(\s|$)/.test(cls || "") ? "out" : /(^|\s)ef-in(\s|$)/.test(cls || "") ? "in" : ""; };
    let phase = phaseOf(document.body.className);
    new MutationObserver(function (records) {
      const now = phaseOf(document.body.className);
      const fresh = now !== phase || records.some(function (r) { return phaseOf(r.oldValue) !== now; });
      phase = now;
      if (!fresh || !now) return;
      if (now === "in") toTop();
      setSlots();
      layout();
    }).observe(document.body, { attributes: true, attributeFilter: ["class"], attributeOldValue: true });
  }

  function overshoot() {
    return scroll < 0 ? scroll : scroll > MAX_SCROLL ? scroll - MAX_SCROLL : 0;
  }

  /** Wires wheel / drag / flick scrolling and the tiles' hover lift and press onto the viewport; returns toTop(), which
      stops any motion and puts the column back at its first row. */
  function bindScrolling(vp) {
    let target = 0;                                    // wheel target angle
    let easeRaf = 0, springRaf = 0, coastRaf = 0, springTimer = 0;
    let dragging = false, dragged = false, dragStartY = 0, dragStartScroll = 0;
    let lastY = 0, lastT = 0, velocity = 0, stageScale = 1;
    let pressed = null;                                // the tile marked data-ef-press, see the hover in the CSS

    function press(tile) {
      if (pressed === tile) return;
      if (pressed) pressed.removeAttribute("data-ef-press");
      pressed = tile;
      if (tile) {
        lift(tile);
        tile.setAttribute("data-ef-press", "");
      }
    }

    function stopMotion() {
      cancelAnimationFrame(easeRaf);
      cancelAnimationFrame(springRaf);
      cancelAnimationFrame(coastRaf);
      clearTimeout(springTimer);
    }

    function springBack() {
      cancelAnimationFrame(springRaf);
      (function step() {
        const rest = scroll < 0 ? 0 : MAX_SCROLL;
        const off = scroll - rest;
        if (Math.abs(off) < 0.02) {
          scroll = target = rest;
          layout();
          return;
        }
        scroll = rest + off * 0.8;
        layout();
        springRaf = requestAnimationFrame(step);
      })();
    }

    function easeToTarget() {
      cancelAnimationFrame(easeRaf);
      (function step() {
        const d = target - scroll;
        if (Math.abs(d) < 0.02) {
          scroll = target;
          layout();
          if (overshoot() !== 0) springTimer = setTimeout(springBack, 60);
          return;
        }
        scroll += d * 0.18;
        layout();
        easeRaf = requestAnimationFrame(step);
      })();
    }

    function coast(v) {
      (function step() {
        if (Math.abs(v) < 2e-3) {
          target = scroll;
          return;
        }
        scroll += v;
        if (scroll < 0 || scroll > MAX_SCROLL) {
          scroll = target = Math.max(-MAX_OVERSCROLL, Math.min(MAX_SCROLL + MAX_OVERSCROLL, scroll));
          springBack();
          return;
        }
        v *= 0.92;
        layout();
        coastRaf = requestAnimationFrame(step);
      })();
    }

    /** Rubber band: past either end, the column follows the pointer with diminishing returns. */
    function rubberBand(raw) {
      if (raw < 0) return -MAX_OVERSCROLL * (1 - Math.exp(0.5 * raw / MAX_OVERSCROLL));
      if (raw > MAX_SCROLL) return MAX_SCROLL + MAX_OVERSCROLL * (1 - Math.exp(-0.5 * (raw - MAX_SCROLL) / MAX_OVERSCROLL));
      return raw;
    }

    function endDrag(withInertia) {
      press(null);
      if (!dragging) return;
      dragging = false;
      vp.classList.remove("is-drag");
      setTimeout(function () { dragged = false; }, 0);   // let the click that ends this drag be swallowed first
      if (overshoot() !== 0) springBack();
      else if (withInertia) coast(-velocity * 16 / (PX_PER_DEG * stageScale));
      else target = scroll;
    }

    vp.addEventListener("wheel", function (e) {
      e.preventDefault();
      stopMotion();
      let d = e.deltaY * 0.062;
      const over = target < 0 ? target : target > MAX_SCROLL ? target - MAX_SCROLL : 0;
      if (over !== 0) d *= Math.max(0.04, Math.pow(1 - Math.abs(over) / MAX_OVERSCROLL, 2));
      target = Math.max(-MAX_OVERSCROLL, Math.min(MAX_SCROLL + MAX_OVERSCROLL, target + d));
      easeToTarget();
    }, { passive: false });

    vp.addEventListener("pointerdown", function (e) {
      press(e.button === 0 ? e.target.closest(".ef-rtile") : null);
      stopMotion();
      dragging = true;
      dragged = false;
      dragStartY = lastY = e.clientY;
      dragStartScroll = target = scroll;
      lastT = performance.now();
      velocity = 0;
      stageScale = EF.stageScale || 1;   // set by app.js fit(); 1 until the window has a size
      vp.classList.add("is-drag");
      vp.setPointerCapture(e.pointerId);
    });

    vp.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      const dy = e.clientY - dragStartY;
      if (Math.abs(dy) > 6) {
        dragged = true;
        press(null);
      }
      const now = performance.now();
      velocity = (e.clientY - lastY) / Math.max(1, now - lastT);
      lastY = e.clientY;
      lastT = now;
      scroll = target = rubberBand(dragStartScroll - dy / (PX_PER_DEG * stageScale));
      layout();
    });

    vp.addEventListener("pointerup", function () { endDrag(true); });
    vp.addEventListener("pointercancel", function () { endDrag(false); });
    vp.addEventListener("lostpointercapture", function () { endDrag(false); });

    // A drag must not also click the tile it started on.
    vp.addEventListener("click", function (e) {
      if (!dragged) return;
      e.stopPropagation();
      e.preventDefault();
    }, true);

    // the tile under the pointer or with the keyboard focus gets its lift's offset (see lift()); pointerover also comes
    // when the column scrolls under a resting pointer
    function liftTarget(e) {
      const tile = e.target.closest ? e.target.closest(".ef-rtile") : null;
      if (tile) lift(tile);
    }
    vp.addEventListener("pointerover", liftTarget);
    vp.addEventListener("focusin", liftTarget);

    return function toTop() {
      stopMotion();
      scroll = target = 0;
    };
  }

  function mount(layer) {
    layer.insertAdjacentHTML("beforeend",
      '<div class="ef-right">' +
        navMarkup("up") +
        '<div class="ef-right__viewport">' + rowsMarkup() + "</div>" +
        navMarkup("dn") +
      "</div>");
    const root = layer.lastElementChild;
    const vp = root.querySelector(".ef-right__viewport");
    rows = Array.prototype.slice.call(vp.children);
    rowPlates = rows.map(function (row) { return Array.prototype.slice.call(row.querySelectorAll(".ef-rtile__shadow")); });
    written = rows.map(function () { return {}; });   // a new mount writes every value again
    tiles = new Map();
    rows.forEach(function (row, i) {
      Array.prototype.forEach.call(row.querySelectorAll(".ef-rtile"), function (tile) {
        tiles.set(tile, { row: i, right: tile.matches(":last-of-type"), x: "", y: "" });
      });
    });
    lifted = null;
    navUp = root.querySelector(".ef-right__nav--up");
    navDown = root.querySelector(".ef-right__nav--dn");
    layout();
    watchTransitions(bindScrolling(vp));
  }

  EF.rightTiles = { mount };
})();
