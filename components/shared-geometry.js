/* Shared geometry of the central disc. Every component that hugs the disc (left cards, right tiles,
   dial rings, disc buttons) derives its layout from these numbers, in 1920×1080 stage pixels. */
(function () {
  "use strict";
  const EF = (window.EF = window.EF || {});

  const DISC = { cx: 960, cy: 540, bezelR: 492 * 0.96 };
  const GAP_BAND = 110;                    // empty band between the bezel and the button columns
  const R_EDGE = DISC.bezelR + GAP_BAND;   // radius the inner edge of both columns follows

  /** SVG path for a circular arc from a0 to a1 (degrees, clockwise from +x). */
  function arcD(cx, cy, r, a0, a1) {
    const s = a0 * Math.PI / 180, e = a1 * Math.PI / 180;
    const large = a1 - a0 > 180 ? 1 : 0;
    return "M" + (cx + Math.cos(s) * r).toFixed(1) + " " + (cy + Math.sin(s) * r).toFixed(1) +
      "A" + r + " " + r + " 0 " + large + " 1 " + (cx + Math.cos(e) * r).toFixed(1) + " " + (cy + Math.sin(e) * r).toFixed(1);
  }

  EF.geo = { DISC, R_EDGE, arcD };
})();
