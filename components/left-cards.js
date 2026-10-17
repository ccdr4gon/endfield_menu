/* Left column: four cards fanned along the left edge of the disc.
   Each card outline is a quad with curved sides (CARD_SHAPES) and is drawn in layers, back to front:
   a back plate that leans with the camera (shadow), a soft glow, the frosted face clipped to the
   outline (with a raised inner plate edged by a lip and a groove, and contour lines traced from the game),
   the icon and label, and a thin outer ring. On hover the card lifts and brightens. Thin cables run from every card
   to the disc bezel.
   Icons are the game's artwork traced from a screenshot (button-art.js); labels are Noto Sans SC laid
   out where the game puts them. Both share the card box's coordinates. */
(function () {
  "use strict";
  const EF = window.EF;
  const DISC = EF.geo.DISC;

  EF.addStyle("left-cards", `
.ef-links { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.ef-left, .ef-left__slide { position: absolute; inset: 0; pointer-events: none; }
/* The entrance light: a blurred, card-shaped glow that comes up where each card is about to appear (only shown while
   the menu opens). */
.ef-left__flash { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; display: none; }

/* The wrapper places the card (transform) and carries its entrance slide and exit jump (translate). Those are two
   registered lengths, as x and y move on different curves; --ef-card-kx / ky make up for this layer's perspective
   (1 px here is 1.04-1.15 px on screen, a little different per card), so the motion on screen matches the game's. */
@property --ef-card-x { syntax: '<length>'; inherits: false; initial-value: 0px; }
@property --ef-card-y { syntax: '<length>'; inherits: false; initial-value: 0px; }
.ef-card-shadow {
  position: absolute; left: 0; top: 0; width: 440px; height: 172px; pointer-events: none;
  transform: translate(var(--cx), var(--cy)); transform-origin: 350px 50%;
  translate: calc(var(--ef-card-x) * var(--ef-card-kx, 1)) calc(var(--ef-card-y) * var(--ef-card-ky, 1));
}
.ef-left__slide > .ef-card-shadow:nth-child(1) { --ef-card-kx: 0.93; --ef-card-ky: 1.07; }
.ef-left__slide > .ef-card-shadow:nth-child(2) { --ef-card-kx: 0.89; --ef-card-ky: 1; }
.ef-left__slide > .ef-card-shadow:nth-child(3) { --ef-card-kx: 0.86; --ef-card-ky: 0.93; }
.ef-left__slide > .ef-card-shadow:nth-child(4) { --ef-card-kx: 0.83; --ef-card-ky: 0.87; }
.ef-card__sh {
  position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none;
  --ef-h: 44; --ef-shx0: var(--ef-card-shx); --ef-shy0: var(--ef-card-shy);
  transform: translate(calc((var(--ef-shx0) + var(--ef-swx, 0) * var(--ef-h)) * 1px),
                       calc((var(--ef-shy0) + var(--ef-swy, 0) * var(--ef-h)) * 1px));
}
.ef-card__sh .sh-ring { fill: none; stroke: rgba(255,255,250,0.33); stroke-width: 2.5; }
.ef-card__sh .sh-fill { fill: rgba(255,255,250,0.27); }
.ef-card__glowsvg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }

.ef-card {
  position: absolute; inset: 0; padding: 0; border: 0; background: none; text-align: left;
  color: var(--ef-ink); pointer-events: none;
}
/* The hit area: a still layer on the button, shaped like the face (--ef-card-hit), that only takes the pointer. It
   does not lift on hover, so a pointer resting on a card's lower or right edge cannot make the lift flicker. */
.ef-card::before { content: ""; position: absolute; inset: 0; clip-path: var(--ef-card-hit, none); pointer-events: auto; cursor: pointer; }
.ef-card__face {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(45deg, rgba(222,220,215,0.86) 0%, rgba(189,187,182,0.82) 45%, rgba(144,142,137,0.78) 100%);
}
.ef-card__panel { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; z-index: -1; }
.ef-card__plate { fill: rgba(255,253,247,0.31); fill-rule: evenodd; }
.ef-card__contour path { fill: none; stroke: #23231f; stroke-linecap: round; stroke-linejoin: round; }
.ef-card__ring { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.ef-card__ringpath { fill: none; stroke: rgba(242,242,236,0.72); stroke-width: 2; }

/* Icon and label in the card box: traced artwork (filled with the game's ink) and Noto Sans SC. */
.ef-card__art { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; fill: #313131; }
.ef-card__art text { font-family: var(--ef-font-cn); font-weight: 550; }

/* Hover and press, as in the game: the card lifts by (-2, -3) and brightens to the game's hover white (#f4f4f2 at 0.82,
   over the plate and the contours, under the icon and label); pressing shrinks it to 0.97. The back plate and the glow
   lift and shrink with the face and the ring (the same box, so the same centre); the wrapper's translate belongs to
   the entrance and the exit. The four layers are named by class, one selector each: a universal selector here would
   make a hover restyle every element of the card, and a class list inside :is() would be tested against every element
   the page restyles. No hover is kept while the menu closes (the pointer may still rest on a card). */
.ef-card__sh, .ef-card__glowsvg, .ef-card__face, .ef-card__ring {
  transition: translate 0.2s cubic-bezier(.22,1,.36,1), scale 0.14s cubic-bezier(.22,1,.36,1);
}
.ef-card-shadow:hover .ef-card__sh, .ef-card-shadow:hover .ef-card__glowsvg, .ef-card-shadow:hover .ef-card__face,
.ef-card-shadow:hover .ef-card__ring { translate: -2px -3px; }
.ef-card-shadow:active .ef-card__sh, .ef-card-shadow:active .ef-card__glowsvg, .ef-card-shadow:active .ef-card__face,
.ef-card-shadow:active .ef-card__ring { scale: 0.97; }
.ef-card__hl { fill: #f4f4f2; opacity: 0; transition: opacity 0.2s cubic-bezier(.22,1,.36,1); }
.ef-card-shadow:hover .ef-card__hl { opacity: 0.82; }
body.ef-out .ef-card-shadow .ef-card__sh, body.ef-out .ef-card-shadow .ef-card__glowsvg, body.ef-out .ef-card-shadow .ef-card__face,
body.ef-out .ef-card-shadow .ef-card__ring { translate: none; scale: none; }
body.ef-out .ef-card::before { pointer-events: none; }
body.ef-out .ef-card-shadow .ef-card__hl { opacity: 0; }

/* Open and close, measured on the game's menu (times in this page's timeline, see index.html).
   Open: each card (back plate and face together) shows on the game's measured opacity curve (its keyframes'
   monotone Hermite spline, one cubic-bezier per segment), and its icon and label replay the same curve 10 ms later
   (the two multiply: first an empty plate, then the glyphs) while it slides the last few px in from the disc's side
   (power3 out, 180 ms); its glow fades in after it. Before each card appears, a blurred light comes up in its place and
   dies away. The cables fade in at 270-290 ms while swinging in, squashed and tilted (270-470 ms).
   Close: all four jump about 70 px to the left, then implode towards the disc while fading (the first card is gone at
   150 ms, the fourth at 200 ms, the middle two at 250 ms); the glows go first (50-100 ms); the cables sag 4 px and
   fade out at 120-190 ms. */
@media (prefers-reduced-motion: no-preference) {
  body.ef-in .ef-left__flash { display: block; }
  /* card 1: shows from 335 ms, slides from 340 ms; its light 310-440 ms */
  body.ef-in .ef-left__slide > .ef-card-shadow:nth-child(1) { animation: efCardIn1A 155ms 335ms linear both, efCardIn1S 180ms 340ms cubic-bezier(.25,1,.5,1) both; }
  body.ef-in .ef-left__slide > .ef-card-shadow:nth-child(1) .ef-card__art { animation: efCardIn1A 155ms 345ms linear both; }
  body.ef-in .ef-left__slide > .ef-card-shadow:nth-child(1) > .ef-card__glowsvg { animation: efCardGlowIn 120ms 340ms cubic-bezier(.5,1,.89,1) both; }
  body.ef-in .ef-left__flashb:nth-of-type(1) { animation: efCardFlash1 130ms 310ms linear both; }
  /* card 2: 348 / 355 ms; its light 310-455 ms */
  body.ef-in .ef-left__slide > .ef-card-shadow:nth-child(2) { animation: efCardIn2A 142ms 348ms linear both, efCardIn2S 180ms 355ms cubic-bezier(.25,1,.5,1) both; }
  body.ef-in .ef-left__slide > .ef-card-shadow:nth-child(2) .ef-card__art { animation: efCardIn2A 142ms 358ms linear both; }
  body.ef-in .ef-left__slide > .ef-card-shadow:nth-child(2) > .ef-card__glowsvg { animation: efCardGlowIn 120ms 355ms cubic-bezier(.5,1,.89,1) both; }
  body.ef-in .ef-left__flashb:nth-of-type(2) { animation: efCardFlash2 145ms 310ms linear both; }
  /* card 3: 457 / 457 ms; its light 310-557 ms */
  body.ef-in .ef-left__slide > .ef-card-shadow:nth-child(3) { animation: efCardIn3A 73ms 457ms linear both, efCardIn3S 180ms 457ms cubic-bezier(.25,1,.5,1) both; }
  body.ef-in .ef-left__slide > .ef-card-shadow:nth-child(3) .ef-card__art { animation: efCardIn3A 73ms 467ms linear both; }
  body.ef-in .ef-left__slide > .ef-card-shadow:nth-child(3) > .ef-card__glowsvg { animation: efCardGlowIn 120ms 457ms cubic-bezier(.5,1,.89,1) both; }
  body.ef-in .ef-left__flashb:nth-of-type(3) { animation: efCardFlash3 247ms 310ms linear both; }
  /* card 4: 502 / 505 ms; its light 310-605 ms */
  body.ef-in .ef-left__slide > .ef-card-shadow:nth-child(4) { animation: efCardIn4A 148ms 502ms linear both, efCardIn4S 180ms 505ms cubic-bezier(.25,1,.5,1) both; }
  body.ef-in .ef-left__slide > .ef-card-shadow:nth-child(4) .ef-card__art { animation: efCardIn4A 148ms 512ms linear both; }
  body.ef-in .ef-left__slide > .ef-card-shadow:nth-child(4) > .ef-card__glowsvg { animation: efCardGlowIn 120ms 505ms cubic-bezier(.5,1,.89,1) both; }
  body.ef-in .ef-left__flashb:nth-of-type(4) { animation: efCardFlash4 295ms 310ms linear both; }
  body.ef-in .ef-links__b { animation: efCardLinkIn 20ms 270ms linear both, efCardLinkSwing 200ms 270ms linear both; }
  /* close: x, y and opacity of a card start together at 50 ms and last 100 ms (card 1), 200 ms (cards 2 and 3) or
     150 ms (card 4) */
  body.ef-out .ef-left__slide > .ef-card-shadow:nth-child(1) { animation: efCardOut1X 100ms 50ms linear both, efCardOut1Y 100ms 50ms linear both, efCardOut1A 100ms 50ms linear both; }
  body.ef-out .ef-left__slide > .ef-card-shadow:nth-child(2) { animation: efCardOut2X 200ms 50ms linear both, efCardOut2Y 200ms 50ms linear both, efCardOut2A 200ms 50ms linear both; }
  body.ef-out .ef-left__slide > .ef-card-shadow:nth-child(3) { animation: efCardOut3X 200ms 50ms linear both, efCardOut3Y 200ms 50ms linear both, efCardOut3A 200ms 50ms linear both; }
  body.ef-out .ef-left__slide > .ef-card-shadow:nth-child(4) { animation: efCardOut4X 150ms 50ms linear both, efCardOut4Y 150ms 50ms linear both, efCardOut4A 150ms 50ms linear both; }
  body.ef-out .ef-card__glowsvg { animation: efCardGlowOut 50ms 50ms cubic-bezier(.11,0,.5,0) both; }
  body.ef-out .ef-links__b { animation: efCardLinkSag 50ms 50ms cubic-bezier(.33,1,.68,1) both, efCardLinkOut 70ms 120ms cubic-bezier(.11,0,.5,0) both; }
}
/* The opacity curves: the game's keyframes as a monotone Hermite spline, each segment an exact cubic-bezier(1/3, m0/3,
   2/3, 1 - m1/3) (an overshoot past [0, 1] is clipped by opacity itself). */
@keyframes efCardIn1A { 0% { opacity: 0; visibility: hidden; animation-timing-function: cubic-bezier(.3333, 0, .6667, .6462); } 9.677% { opacity: .2; animation-timing-function: cubic-bezier(.3333, .3276, .6667, .8183); } 41.935% { opacity: .92; animation-timing-function: cubic-bezier(.3333, 2.0128, .6667, .7721); } 74.194% { opacity: .985; animation-timing-function: cubic-bezier(.3333, .7901, .6667, 1); } 100% { opacity: 1; } }
@keyframes efCardIn2A { 0% { opacity: 0; visibility: hidden; animation-timing-function: cubic-bezier(.3333, 0, .6667, .7502); } 36.62% { opacity: .66; animation-timing-function: cubic-bezier(.3333, .5113, .6667, .7969); } 71.831% { opacity: .97; animation-timing-function: cubic-bezier(.3333, 1.679, .6667, 1); } 100% { opacity: 1; } }
@keyframes efCardIn3A { 0% { opacity: 0; visibility: hidden; animation-timing-function: cubic-bezier(.3333, 0, .6667, .8117); } 54.795% { opacity: .97; animation-timing-function: cubic-bezier(.3333, 5.0228, .6667, 1); } 100% { opacity: 1; } }
@keyframes efCardIn4A { 0% { opacity: 0; visibility: hidden; animation-timing-function: cubic-bezier(.3333, 0, .6667, .8154); } 32.432% { opacity: .84; animation-timing-function: cubic-bezier(.3333, 1.4688, .6667, .7576); } 66.216% { opacity: .95; animation-timing-function: cubic-bezier(.3333, .5333, .6667, 1); } 100% { opacity: 1; } }
/* the slide in from the disc's side (the game's offsets, turned into this layer's px by --ef-card-kx / ky) */
@keyframes efCardIn1S { from { --ef-card-x: 24px; --ef-card-y: 0px; } }
@keyframes efCardIn2S { from { --ef-card-x: 30px; --ef-card-y: -1px; } }
@keyframes efCardIn3S { from { --ef-card-x: 7px; --ef-card-y: 7px; } }
@keyframes efCardIn4S { from { --ef-card-x: 2px; --ef-card-y: 4px; } }
@keyframes efCardGlowIn { from { opacity: 0; visibility: hidden; } }
@keyframes efCardGlowOut { to { opacity: 0; visibility: hidden; } }
/* the lights: rise linearly from 310 ms to their peak when the card appears (peak = min(limit, rate x time)), then die
   away over 100 ms (power1 out) */
@keyframes efCardFlash1 { 0% { opacity: 0; } 23.08% { opacity: .09; animation-timing-function: cubic-bezier(.5,1,.89,1); } 100% { opacity: 0; } }
@keyframes efCardFlash2 { 0% { opacity: 0; } 31.03% { opacity: .135; animation-timing-function: cubic-bezier(.5,1,.89,1); } 100% { opacity: 0; } }
@keyframes efCardFlash3 { 0% { opacity: 0; } 59.51% { opacity: .42; animation-timing-function: cubic-bezier(.5,1,.89,1); } 100% { opacity: 0; } }
@keyframes efCardFlash4 { 0% { opacity: 0; } 66.1% { opacity: .45; animation-timing-function: cubic-bezier(.5,1,.89,1); } 100% { opacity: 0; } }
/* the cables swing in: all squashed vertically (y' = a + s y, about the stage's y = 0) and shifted by dx, each bundle
   tilted about its card end (--ef-lnk-x / y); linear in between */
@keyframes efCardLinkIn { from { opacity: 0; visibility: hidden; } }
@keyframes efCardLinkSwing {
  0% { transform: translate(30px, 95.9px) scale(1, 0.55) translate(var(--ef-lnk-x), var(--ef-lnk-y)) rotate(16deg) translate(calc(-1 * var(--ef-lnk-x)), calc(-1 * var(--ef-lnk-y))); }
  15% { transform: translate(18px, 25.5px) scale(1, 0.783) translate(var(--ef-lnk-x), var(--ef-lnk-y)) rotate(13deg) translate(calc(-1 * var(--ef-lnk-x)), calc(-1 * var(--ef-lnk-y))); }
  40% { transform: translate(0px, -1.4px) scale(1, 0.98) translate(var(--ef-lnk-x), var(--ef-lnk-y)) rotate(4deg) translate(calc(-1 * var(--ef-lnk-x)), calc(-1 * var(--ef-lnk-y))); }
  65% { transform: translate(0px, 0px) scale(1, 1) translate(var(--ef-lnk-x), var(--ef-lnk-y)) rotate(0.5deg) translate(calc(-1 * var(--ef-lnk-x)), calc(-1 * var(--ef-lnk-y))); }
  100% { transform: translate(0px, 0px) scale(1, 1) translate(var(--ef-lnk-x), var(--ef-lnk-y)) rotate(0deg) translate(calc(-1 * var(--ef-lnk-x)), calc(-1 * var(--ef-lnk-y))); }
}
@keyframes efCardLinkSag { to { transform: translateY(4px); } }
@keyframes efCardLinkOut { to { opacity: 0; visibility: hidden; } }
/* The implosion: the game's keys (plus a halfway key 15 ms in, which makes the jump a fast ease-out); x, y and opacity
   share the key times, each segment with its own curve. */
@keyframes efCardOut1X { 0% { --ef-card-x: 0px; animation-timing-function: cubic-bezier(.3333, 0, .6667, .8); } 15% { --ef-card-x: -39.5px; animation-timing-function: cubic-bezier(.3333, .4667, .6667, 1); } 50% { --ef-card-x: -79px; animation-timing-function: cubic-bezier(.3333, 0, .6667, 1); } 100% { --ef-card-x: -72px; } }
@keyframes efCardOut1Y { 0% { --ef-card-y: 0px; animation-timing-function: cubic-bezier(.3333, 0, .6667, .8); } 15% { --ef-card-y: 3.75px; animation-timing-function: cubic-bezier(.3333, .4667, .6667, 1); } 50% { --ef-card-y: 7.5px; animation-timing-function: cubic-bezier(.3333, 0, .6667, 1); } 100% { --ef-card-y: 0px; } }
@keyframes efCardOut1A { 0% { opacity: 1; animation-timing-function: cubic-bezier(.3333, 0, .6667, .72); } 15% { opacity: .95; animation-timing-function: cubic-bezier(.3333, .363, .6667, -.3878); } 50% { opacity: .86; animation-timing-function: cubic-bezier(.3333, .2176, .6667, 1); } 100% { opacity: .04; visibility: hidden; } }
@keyframes efCardOut2X { 0% { --ef-card-x: 0px; animation-timing-function: cubic-bezier(.3333, 0, .6667, .8); } 7.5% { --ef-card-x: -40.75px; animation-timing-function: cubic-bezier(.3333, .4667, .6667, 1); } 25% { --ef-card-x: -81.5px; animation-timing-function: cubic-bezier(.3333, 0, .6667, .3056); } 50% { --ef-card-x: -69.5px; animation-timing-function: cubic-bezier(.3333, .2193, .6667, .6689); } 75% { --ef-card-x: -31.5px; animation-timing-function: cubic-bezier(.3333, .3356, .6667, 1); } 100% { --ef-card-x: 6px; } }
@keyframes efCardOut2Y { 0% { --ef-card-y: 0px; animation-timing-function: cubic-bezier(.3333, 0, .6667, .8); } 7.5% { --ef-card-y: 4.75px; animation-timing-function: cubic-bezier(.3333, .4667, .6667, 1); } 25% { --ef-card-y: 9.5px; animation-timing-function: cubic-bezier(.3333, 0, .6667, .4259); } 50% { --ef-card-y: 5px; animation-timing-function: cubic-bezier(.3333, .2348, .6667, .6818); } 75% { --ef-card-y: -6px; animation-timing-function: cubic-bezier(.3333, .35, .6667, 1); } 100% { --ef-card-y: -16px; } }
@keyframes efCardOut2A { 0% { opacity: 1; animation-timing-function: cubic-bezier(.3333, 0, .6667, .68); } 7.5% { opacity: .95; animation-timing-function: cubic-bezier(.3333, .3394, .6667, .7504); } 25% { opacity: .84; animation-timing-function: cubic-bezier(.3333, .4357, .6667, .6667); } 50% { opacity: .75; animation-timing-function: cubic-bezier(.3333, .3333, .6667, -.3889); } 75% { opacity: .66; animation-timing-function: cubic-bezier(.3333, .1894, .6667, 1); } 100% { opacity: 0; visibility: hidden; } }
@keyframes efCardOut3X { 0% { --ef-card-x: 0px; animation-timing-function: cubic-bezier(.3333, 0, .6667, .8); } 7.5% { --ef-card-x: -34.75px; animation-timing-function: cubic-bezier(.3333, .4667, .6667, 1); } 25% { --ef-card-x: -69.5px; animation-timing-function: cubic-bezier(.3333, 0, .6667, .2121); } 50% { --ef-card-x: -58.5px; animation-timing-function: cubic-bezier(.3333, .2114, .6667, .6646); } 75% { --ef-card-x: -17.5px; animation-timing-function: cubic-bezier(.3333, .3313, .6667, 1); } 100% { --ef-card-x: 24px; } }
@keyframes efCardOut3Y { 0% { --ef-card-y: 0px; animation-timing-function: cubic-bezier(.3333, 0, .6667, .8); } 7.5% { --ef-card-y: 3.75px; animation-timing-function: cubic-bezier(.3333, .4667, .6667, 1); } 25% { --ef-card-y: 7.5px; animation-timing-function: cubic-bezier(.3333, 0, .6667, .3095); } 50% { --ef-card-y: -3px; animation-timing-function: cubic-bezier(.3333, .2197, .6667, .6667); } 75% { --ef-card-y: -36px; animation-timing-function: cubic-bezier(.3333, .3333, .6667, 1); } 100% { --ef-card-y: -69px; } }
@keyframes efCardOut3A { 0% { opacity: 1; animation-timing-function: cubic-bezier(.3333, 0, .6667, .76); } 7.5% { opacity: .95; animation-timing-function: cubic-bezier(.3333, .4, .6667, .7255); } 25% { opacity: .88; animation-timing-function: cubic-bezier(.3333, .3922, .6667, .6429); } 50% { opacity: .81; animation-timing-function: cubic-bezier(.3333, .3125, .6667, -.6875); } 75% { opacity: .73; animation-timing-function: cubic-bezier(.3333, .1849, .6667, 1); } 100% { opacity: 0; visibility: hidden; } }
@keyframes efCardOut4X { 0% { --ef-card-x: 0px; animation-timing-function: cubic-bezier(.3333, 0, .6667, .8); } 10% { --ef-card-x: -32px; animation-timing-function: cubic-bezier(.3333, .4667, .6667, .8585); } 33.333% { --ef-card-x: -64px; animation-timing-function: cubic-bezier(.3333, 6.4706, .6667, .6667); } 66.667% { --ef-card-x: -65px; animation-timing-function: cubic-bezier(.3333, .3333, .6667, 1); } 100% { --ef-card-x: -66px; } }
@keyframes efCardOut4Y { 0% { --ef-card-y: 0px; animation-timing-function: cubic-bezier(.3333, 0, .6667, .8); } 10% { --ef-card-y: 3.75px; animation-timing-function: cubic-bezier(.3333, .4667, .6667, 1); } 33.333% { --ef-card-y: 7.5px; animation-timing-function: cubic-bezier(.3333, 0, .6667, .6728); } 66.667% { --ef-card-y: -6px; animation-timing-function: cubic-bezier(.3333, .3397, .6667, 1); } 100% { --ef-card-y: -19px; } }
@keyframes efCardOut4A { 0% { opacity: 1; animation-timing-function: cubic-bezier(.3333, 0, .6667, .74); } 10% { opacity: .95; animation-timing-function: cubic-bezier(.3333, .3792, .6667, .7941); } 33.333% { opacity: .87; animation-timing-function: cubic-bezier(.3333, .5882, .6667, -2.625); } 66.667% { opacity: .83; animation-timing-function: cubic-bezier(.3333, .1747, .6667, 1); } 100% { opacity: 0; visibility: hidden; } }
`);

  /** art = traced icon in button-art.js (plus "-ring" when noted, "-sheen" for the blade's sheen);
      text = the label as the game lays it out (see EF.labelSVG). */
  const CARDS = [
    { action: "operators", label: "干员", art: "art-card-operators",
      text: { size: 22.62, matrix: [1.0392, -0.0417, -0.0168, 1.0015], x: [203.11, 226.39], y: [145.07, 145.3] } },
    { action: "events", label: "活动", art: "art-card-events",
      text: { size: 24.07, matrix: [0.9983, -0.0576, -0.0123, 1.0024], x: [216.09, 240.97], y: [148.8, 149.39] } },
    { action: "headhunt", label: "寻访", art: "art-card-headhunt", noted: true, sheen: true,
      text: { size: 24.2, matrix: [1.0678, -0.0186, 0.0015, 1.0001], x: [202.57, 224.93], y: [147.04, 146.12] } },
    { action: "shop", label: "采购中心", art: "art-card-shop",
      text: { size: 24.52, matrix: [0.9796, -0.0274, -0.0261, 1.0011], x: [193.01, 218.59, 243.56, 268.83], y: [132.78, 132.55, 133.08, 132.58] } },
  ];

  const CARD_W = 440, CARD_H = 172;
  const ANCHOR_X = 350;                          // card-local x that sits on the R_CARD circle
  const R_CARD = EF.geo.R_EDGE + 16;
  const ANGLES = [28.02, 10.52, -6.22, -21.56];  // polar angle of each card anchor, deg (0 = due left)

  /** Card outlines in card-local px: top/bottom edges y = a + b·x, left/right sides x = a + b·y + c·y².
      plate = outer edge of the raised inner plate (its top edge and left side; the right and bottom run off the
      face, so only a dark band shows along the top and left); shadow = resting offset of the back plate. */
  const CARD_SHAPES = [
    { top: [22.19, -0.03542], bottom: [168.99, -0.03362], left: [173.3, -0.54768, 6.5769e-4], right: [399.48, -0.61494, 3.6623e-4], plate: { top: [38.65, -0.0352], left: [196.74, -0.56595, 6.3797e-4] }, shadow: [14, 20.3] },
    { top: [17.81, -0.03285], bottom: [170.39, -0.03319], left: [156.26, -0.40245, 1.4242e-3], right: [362.1, -0.28868, 6.3431e-4], plate: { top: [31.58, -0.03529], left: [176.6, -0.41875, 1.2589e-3] }, shadow: [15.9, 16.2] },
    { top: [16.02, -0.03221], bottom: [175.66, -0.0329], left: [125.98, -0.15145, 1.4506e-3], right: [330.5, 0.01888, 1.0545e-3], plate: { top: [26.28, -0.0346], left: [143.06, -0.1786, 1.3852e-3] }, shadow: [16.5, 12] },
    { top: [34.97, -0.02944], bottom: [153.99, -0.03242], left: [99.86, 0.28886, 3.757e-4], right: [320.36, 0.33845, 8.8469e-4], plate: { top: [41.71, -0.03279], left: [113.23, 0.2459, 5.216e-4] }, shadow: [15, 8.6] },
  ];
  /** The plate's edge, measured on the game: a raised lip as bright as the plate, then a groove showing the dark band. */
  const PLATE_LIP = 2.35, PLATE_GROOVE = 2.9;

  /** Outline path of card `index`, grown outwards by `pad` px, with 12 px rounded corners. */
  function cardPathD(index, pad) {
    return shapePathD(CARD_SHAPES[index], pad, 12);
  }

  /** The inner plate as three nested outlines (lip outer edge, lip inner edge, groove inner edge) filled evenodd:
      lip + plate are filled, the groove between them stays open. */
  function platePathD(index) {
    const s = CARD_SHAPES[index];
    const plate = { top: s.plate.top, left: s.plate.left, right: [s.right[0] + 30, s.right[1], s.right[2]], bottom: [s.bottom[0] + 30, s.bottom[1]] };
    return [0, PLATE_LIP, PLATE_LIP + PLATE_GROOVE].map(function (inset) { return shapePathD(plate, -inset, 12 - inset); }).join(" ");
  }

  /** Outline of a shape (edges as in CARD_SHAPES) grown outwards by `pad` px, with corners rounded over `rc` px. */
  function shapePathD(s, pad, rc) {
    const lineY = function (c, x) { return c[0] + c[1] * x; };
    const sideX = function (q, y) { return q[0] + q[1] * y + q[2] * y * y; };
    const slope = function (q, y) { return q[1] + 2 * q[2] * y; };
    const ym = (lineY(s.top, 250) + lineY(s.bottom, 250)) / 2;
    const top = [s.top[0] - pad * Math.hypot(1, s.top[1]), s.top[1]];
    const bottom = [s.bottom[0] + pad * Math.hypot(1, s.bottom[1]), s.bottom[1]];
    const left = [s.left[0] - pad * Math.hypot(1, slope(s.left, ym)), s.left[1], s.left[2]];
    const right = [s.right[0] + pad * Math.hypot(1, slope(s.right, ym)), s.right[1], s.right[2]];

    function corner(edge, side) {         // intersection of an edge line with a side curve
      let y = lineY(edge, 250);
      for (let k = 0; k < 40; k += 1) y = lineY(edge, sideX(side, y));
      return [sideX(side, y), y];
    }
    function along(p, edge, dir) {        // rc px from a corner along an edge line
      const n = Math.hypot(1, edge[1]);
      return [p[0] + dir * rc / n, p[1] + dir * rc * edge[1] / n];
    }
    function down(p, side, dir) {         // rc px from a corner along a side curve
      const y = p[1] + dir * rc / Math.hypot(1, slope(side, p[1]));
      return [sideX(side, y), y];
    }
    function ctrl(side, y1, y2) {         // quadratic control point approximating a side curve
      return [sideX(side, y1) + slope(side, y1) * (y2 - y1) / 2, (y1 + y2) / 2];
    }
    const f = function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); };

    const TL = corner(top, left), TR = corner(top, right), BR = corner(bottom, right), BL = corner(bottom, left);
    const t1 = along(TL, top, 1), t2 = along(TR, top, -1), r1 = down(TR, right, 1), r2 = down(BR, right, -1);
    const b1 = along(BR, bottom, -1), b2 = along(BL, bottom, 1), l1 = down(BL, left, -1), l2 = down(TL, left, 1);
    return "M" + f(t1) + " L" + f(t2) + " Q" + f(TR) + " " + f(r1) + " Q" + f(ctrl(right, r1[1], r2[1])) + " " + f(r2) +
      " Q" + f(BR) + " " + f(b1) + " L" + f(b2) + " Q" + f(BL) + " " + f(l1) + " Q" + f(ctrl(left, l1[1], l2[1])) + " " + f(l2) +
      " Q" + f(TL) + " " + f(t1) + " Z";
  }

  function contoursMarkup(index) {
    return ((EF.CARD_CONTOURS || [])[index] || []).map(function (ln) {
      let d = "M" + ln[2] + " " + ln[3];
      for (let k = 4; k < ln.length; k += 2) d += " L" + ln[k] + " " + ln[k + 1];
      return '<path d="' + d + '" stroke-width="' + ln[0] + '" stroke-opacity="' + ln[1] + '"></path>';
    }).join("");
  }

  function cardMarkup(card, i) {
    const a = ANGLES[i] * Math.PI / 180;
    const ax = DISC.cx - R_CARD * Math.cos(a), ay = DISC.cy - R_CARD * Math.sin(a);
    const shape = CARD_SHAPES[i];
    const outline = cardPathD(i, 0), glow = cardPathD(i, 2), ring = cardPathD(i, 4);
    const box = 'viewBox="0 0 ' + CARD_W + " " + CARD_H + '"';
    const wrapStyle = "z-index:" + (5 + i) + "; --cx:" + (ax - ANCHOR_X).toFixed(1) + "px; --cy:" + (ay - CARD_H / 2).toFixed(1) +
      "px; --ef-card-shx:" + shape.shadow[0] + "; --ef-card-shy:" + shape.shadow[1] + ";";
    return '<div class="ef-card-shadow" style="' + wrapStyle + '">' +
      '<svg class="ef-card__sh" ' + box + ' data-ef-shadow=""><path class="sh-ring" d="' + ring + '"></path><path class="sh-fill" d="' + outline + '"></path></svg>' +
      '<svg class="ef-card__glowsvg" ' + box + '><defs><filter id="efCardGlow' + i + '" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="16"></feGaussianBlur></filter></defs>' +
        '<path fill="rgba(255,255,255,0.34)" filter="url(#efCardGlow' + i + ')" d="' + glow + '"></path></svg>' +
      '<button class="ef-card' + (card.noted ? " ef-card--noted" : "") + '" data-action="' + card.action + '" aria-label="' + card.label +
        "\" style=\"--ef-card-hit: path('" + outline + "');\">" +
        "<span class=\"ef-card__face\" style=\"clip-path: path('" + outline + "');\">" +
          '<svg class="ef-card__panel" ' + box + '><path class="ef-card__plate" d="' + platePathD(i) + '"></path>' +
            '<g class="ef-card__contour">' + contoursMarkup(i) + "</g>" +
            '<path class="ef-card__hl" d="' + outline + '"></path></svg>' +
          '<svg class="ef-card__art" ' + box + ' aria-hidden="true">' +
            (card.noted ? '<use href="#' + card.art + '-ring" fill="#FDEF00"></use>' : "") +
            '<use href="#' + card.art + '"></use>' +
            (card.sheen ? '<use href="#' + card.art + '-sheen" fill="#575757"></use>' : "") +
            EF.labelSVG(card.label, card.text) + "</svg>" +
        "</span>" +
        '<svg class="ef-card__ring" ' + box + '><path class="ef-card__ringpath" d="' + ring + '"></path></svg>' +
      "</button>" +
    "</div>";
  }

  /** Cables from each card to the bezel: four strands per card, in one group per card (.ef-links__b) that swings in
      about the card's end of the cables (--ef-lnk-x / y) on open. */
  function linksMarkup() {
    const DX = 3, DY = 13;   // where the cables drop onto the bezel, they kink down slightly
    const stops = '<stop offset="0" stop-color="rgba(255,255,255,0.06)"></stop><stop offset="0.22" stop-color="rgba(255,255,255,0.5)"></stop>' +
      '<stop offset="0.75" stop-color="rgba(255,255,255,0.5)"></stop><stop offset="1" stop-color="rgba(255,255,255,0.04)"></stop>';
    const pt = function (x, y) { return x.toFixed(1) + " " + y.toFixed(1); };
    let defs = "", groups = "";
    ANGLES.forEach(function (phi, i) {
      const a = phi * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), tx = -Math.sin(a), ty = Math.cos(a);
      const px = function (r, o) { return DISC.cx - r * ux + o * tx; };
      const py = function (r, o) { return DISC.cy - r * uy + o * ty; };
      const rOut = R_CARD - 20, rTop = DISC.bezelR + 80, rFoot = DISC.bezelR + 34, rEnd = DISC.bezelR + 10;
      defs += '<linearGradient id="lnkg' + i + '" gradientUnits="userSpaceOnUse" x1="' + px(rOut, 0).toFixed(1) + '" y1="' + py(rOut, 0).toFixed(1) +
        '" x2="' + (px(rEnd, 0) + DX).toFixed(1) + '" y2="' + (py(rEnd, 0) + DY).toFixed(1) + '">' + stops + "</linearGradient>";
      groups += '<g class="ef-links__b" style="--ef-lnk-x: ' + px(rOut, 0).toFixed(1) + "px; --ef-lnk-y: " + py(rOut, 0).toFixed(1) + 'px">';
      [-6.9, -2.3, 2.2, 6.8].forEach(function (o) {
        groups += '<path d="M' + pt(px(rOut, o), py(rOut, o)) + " L" + pt(px(rTop, o), py(rTop, o)) +
          " L" + pt(px(rFoot, o) + DX, py(rFoot, o) + DY) + " L" + pt(px(rEnd, o) + DX, py(rEnd, o) + DY) +
          '" fill="none" stroke="url(#lnkg' + i + ')" stroke-width="2.7" stroke-linejoin="miter" stroke-linecap="round"></path>';
      });
      groups += "</g>";
    });
    return "<defs>" + defs + "</defs>" + groups;
  }

  /* The entrance lights, one per card: the card's outline scaled about its centre by (sx, sy) and moved by (dx, dy)
     as measured, filled #f2f4ee and blurred by 40 (the filter sits on an untransformed group, so the scaling does not
     stretch the blur). [dx, dy, sx, sy] per card. */
  const FLASH_BLOBS = [[-28, 6, 0.74, 0.95], [-28, 6, 0.74, 0.95], [-6, 0, 0.76, 1.2], [-24, 4, 0.74, 1.12]];

  /** Centre of card `index`'s face in the card box: the middle of its top and bottom edges at x = 250, and of its sides
      at that height. */
  function cardCentre(index) {
    const s = CARD_SHAPES[index];
    const ym = (s.top[0] + s.top[1] * 250 + s.bottom[0] + s.bottom[1] * 250) / 2;
    const sideX = function (q) { return q[0] + q[1] * ym + q[2] * ym * ym; };
    return [(sideX(s.left) + sideX(s.right)) / 2, ym];
  }

  function flashMarkup() {
    let h = '<defs><filter id="efCardFlash" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="40"></feGaussianBlur></filter></defs>';
    ANGLES.forEach(function (phi, i) {
      const a = phi * Math.PI / 180, c = cardCentre(i), b = FLASH_BLOBS[i];
      const x = DISC.cx - R_CARD * Math.cos(a) - ANCHOR_X, y = DISC.cy - R_CARD * Math.sin(a) - CARD_H / 2;   // the card box's place (--cx / --cy)
      const tx = x + c[0] + b[0] - b[2] * c[0], ty = y + c[1] + b[1] - b[3] * c[1];
      h += '<g class="ef-left__flashb" filter="url(#efCardFlash)"><path fill="#f2f4ee" transform="matrix(' + b[2] + " 0 0 " + b[3] + " " +
        tx.toFixed(1) + " " + ty.toFixed(1) + ')" d="' + cardPathD(i, 0) + '"></path></g>';
    });
    return h;
  }

  /** layer: the cards layer; linksLayer: the floor layer the cables are drawn on. */
  function mount(layer, linksLayer) {
    linksLayer.insertAdjacentHTML("beforeend", '<svg class="ef-links" viewBox="0 0 1920 1080">' + linksMarkup() + "</svg>");
    layer.insertAdjacentHTML("beforeend", '<div class="ef-left"><svg class="ef-left__flash" viewBox="0 0 1920 1080" aria-hidden="true">' +
      flashMarkup() + '</svg><div class="ef-left__slide">' + CARDS.map(cardMarkup).join("") + "</div></div>");
  }

  EF.leftCards = { mount };
})();
