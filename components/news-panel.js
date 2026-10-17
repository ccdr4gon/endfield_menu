/* "Breaking News" carousel in the top-right corner. Slides are placeholder gradients with a caption;
   they rotate every 8 s, and clicking the frame or a page bar switches slides. */
(function () {
  "use strict";
  const EF = window.EF;

  EF.addStyle("news", `
.ef-news {
  position: absolute; left: 1306.06px; top: 58.31px; z-index: 4; pointer-events: auto;
  /* turned and leaning like the game's panel, so its edges and the page bars run parallel to the column's divider */
  transform-origin: 0 0; transform: matrix(0.9995, -0.0306, 0.0739, 0.9972, 0, 0);
}
.ef-news__frame {
  width: 421px; height: 157.5px; position: relative; cursor: pointer;
  background: linear-gradient(90deg, #302e21 0%, #29292a 16%, #282929 100%); border-radius: 11px 22px 10px 11px;
  --ef-h: 20; --ef-shx0: 8; --ef-shy0: 12;
  box-shadow: calc((var(--ef-shx0) + var(--ef-swx, 0) * var(--ef-h)) * 1px)
              calc((var(--ef-shy0) + var(--ef-swy, 0) * var(--ef-h)) * 1px)
              0 rgba(0,0,0,0.28), 1px 2px 0 rgba(0,0,0,0.12);
  transition: transform 0.18s, box-shadow 0.18s;
}
.ef-news__frame::before {
  content: ""; position: absolute; inset: -2px; border-radius: 13px 24px 12px 13px; padding: 3.5px; pointer-events: none;
  background: linear-gradient(100deg, var(--ef-yellow) 0%, rgba(255,222,0,0.7) 36%, rgba(255,222,0,0.33) 60%, rgba(255,222,0,0) 85%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
}
.ef-news__frame:hover {
  transform: translateY(-2px);
  --ef-shx0: 10; --ef-shy0: 15; --ef-h: 24;
  box-shadow: calc((var(--ef-shx0) + var(--ef-swx, 0) * var(--ef-h)) * 1px)
              calc((var(--ef-shy0) + var(--ef-swy, 0) * var(--ef-h)) * 1px)
              0 rgba(0,0,0,0.34), 1px 2px 0 rgba(0,0,0,0.14);
}
.ef-news__head {
  position: absolute; top: -19.2px; left: -0.8px; width: 132.5px; height: 15.9px; padding: 0 3.5px 0 6px; box-sizing: border-box;
  background: #92080A; color: #e7eeee; display: flex; align-items: center; justify-content: space-between;
  font-family: var(--ef-font-en); font-weight: 700; font-size: 15.4px; line-height: 1; letter-spacing: 0.01em; text-transform: uppercase;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
}
.ef-news__head svg { flex: none; width: 7px; height: 8.75px; }
.ef-news__body { position: absolute; inset: 14.4px 12.2px 14.5px 13.2px; overflow: hidden; background: #0a0c0d; }
.ef-news__img {
  position: absolute; inset: 0; display: flex; align-items: flex-end; padding: 8px 12px;
  font-family: var(--ef-font-mono); font-size: 12px; letter-spacing: 0.32em; color: rgba(255,255,255,0.92);
  text-shadow: 0 1px 3px rgba(0,0,0,0.8); white-space: nowrap; overflow: hidden;
}
/* Page bars: one per slide, in a row under the image. */
.ef-news__bars { position: absolute; left: 34.2px; right: 12.8px; top: calc(100% + 8.3px); display: flex; gap: 8.7px; align-items: center; }
.ef-news__bar { height: 4px; flex: 1; background: rgba(255,255,255,0.55); cursor: pointer; transition: background 0.2s; }
.ef-news__bar.is-on { background: #FFF200; }

/* The orange belt: four strands on the floor that come out from under the frame and run down to the disc rim. */
.ef-news__belt { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.ef-news__belt path { fill: none; stroke: url(#efNewsBelt); stroke-width: 2.6; }

/* Open and close, measured on the game's banner (times in this page's timeline, see index.html).
   Open: the frame (with its header and page bars) flips up about its bottom edge from 62.5deg back, starting from
   (-92, 35.7) px at 0.85 times its size; every track settles exponentially (tilt and scale halve every 30 ms, the slide
   every 25 ms, the drop every 35 ms), sampled per frame of the game at 290-550 ms and interpolated linearly; it shows
   over the first 12 ms. Its layer is a flat plane without perspective, so the rotateX only squashes the frame
   vertically by cos(angle) about its bottom edge, as in the game.
   Close: it holds until 100 ms, then tips back about its bottom edge, shrinks, slides down to the left and fades to a
   ghost, gone at 270 ms.
   Only the own translate / rotate / scale properties move: .ef-news's transform is the fitted lean and
   .ef-news__frame's is its hover. The belt lies on the floor (deck layer) and does not flip; it only shows and hides
   with the frame. */
@media (prefers-reduced-motion: no-preference) {
  body.ef-in .ef-news__frame { transform-origin: 50% 100%; animation: efNewsFlipIn 260ms 290ms linear both; }
  body.ef-in .ef-news__belt { animation: efFade 110ms 290ms ease-out both; }   /* joins the page bars as the frame comes near */
  body.ef-out .ef-news__frame { transform-origin: 50% 100%; animation: efNewsFlipOut 220ms 50ms linear both; }
  body.ef-out .ef-news__belt { animation: efNewsBeltOut 220ms 50ms linear both; }
}
@keyframes efNewsFlipIn {
  0% { translate: -92px 35.7px; rotate: x 62.5deg; scale: 0.85; opacity: 0; }
  1.92% { translate: -80.09px 32.33px; rotate: x 55.68deg; scale: 0.8664; }
  3.85% { translate: -69.72px 29.29px; rotate: x 49.61deg; scale: 0.8809; }
  4.62% { opacity: 1; }
  5.77% { translate: -60.7px 26.52px; rotate: x 44.19deg; scale: 0.8939; }
  7.69% { translate: -52.84px 24.02px; rotate: x 39.37deg; scale: 0.9055; }
  11.54% { translate: -40.05px 19.71px; rotate: x 31.25deg; scale: 0.925; }
  15.38% { translate: -30.35px 16.17px; rotate: x 24.8deg; scale: 0.9405; }
  19.23% { translate: -23px 13.26px; rotate: x 19.69deg; scale: 0.9528; }
  23.08% { translate: -17.43px 10.88px; rotate: x 15.63deg; scale: 0.9625; }
  30.77% { translate: -10.01px 7.32px; rotate: x 9.84deg; scale: 0.9764; }
  38.46% { translate: -5.75px 4.93px; rotate: x 6.2deg; scale: 0.9851; }
  50% { translate: -2.5px 2.72px; rotate: x 3.1deg; scale: 0.9926; }
  61.54% { translate: -1.09px 1.5px; rotate: x 1.55deg; scale: 0.9963; }
  76.92% { translate: -0.36px 0.68px; rotate: x 0.62deg; scale: 0.9985; }
  100% { translate: 0px 0px; rotate: x 0deg; scale: 1; opacity: 1; }
}
/* keyframes at 100 / 150 / 200 / 250 / 270 ms */
@keyframes efNewsFlipOut {
  0%, 22.73% { translate: 0px 0px; rotate: x 0deg; scale: 1; opacity: 1; }
  45.45% { translate: -4.03px 8px; rotate: x 14.42deg; scale: 1; opacity: 0.9; }
  68.18% { translate: -43.82px 24px; rotate: x 25.39deg; scale: 0.9019; opacity: 0.12; }
  90.91% { translate: -93.96px 64px; rotate: x 45.1deg; scale: 0.8251; opacity: 0.05; }
  100% { translate: -115px 80px; rotate: x 53deg; scale: 0.79; opacity: 0; }
}
@keyframes efNewsBeltOut { 0%, 22.73% { opacity: 1; } 45.45% { opacity: 0.9; } 68.18% { opacity: 0.12; } 90.91% { opacity: 0.05; } 100% { opacity: 0; } }
`);

  const SLIDES = [
    { caption: "版本前瞻 // 敬请期待", c1: "#7e3d49", c2: "#23191f" },
    { caption: "限时活动 · 进行中", c1: "#3d4f63", c2: "#161c24" },
    { caption: "新功能上线预告", c1: "#4f5a3d", c2: "#1a2016" },
    { caption: "系统维护预告 · 02:00", c1: "#5a4a2f", c2: "#221c12" },
    { caption: "终末地补给 · 限时供应", c1: "#5c5420", c2: "#1d1a0b" },
  ];
  const INTERVAL_MS = 8000;

  const HTML = `
<div class="ef-news">
  <div class="ef-news__frame" data-action="news" data-ef-shadow="">
    <div class="ef-news__head">Breaking News
      <svg width="12" height="15" viewBox="0 0 12 15" aria-hidden="true"><path d="M1.5 2 6 5.6 10.5 2" fill="none" stroke="#fff" stroke-width="1.5"></path><path d="M2 8.4h8L6 13.6Z" fill="#fff"></path></svg>
    </div>
    <div class="ef-news__body"></div>
    <div class="ef-news__bars">${SLIDES.map(function () { return '<i class="ef-news__bar"></i>'; }).join("")}</div>
  </div>
</div>`;

  /* Strand paths in stage px on the floor (measured on the screenshot: a shared centreline, parallel strands 5.7 px
     apart); the gradient keeps them hidden under the frame and its page bars and dims them towards the rim. */
  const BELT = '<svg class="ef-news__belt" viewBox="0 0 1920 1080" aria-hidden="true"><defs>' +
    '<linearGradient id="efNewsBelt" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="293">' +
    '<stop offset="0.237" stop-color="#EBA118" stop-opacity="0"></stop><stop offset="0.366" stop-color="#EBA118"></stop>' +
    '<stop offset="0.538" stop-color="#EBA118" stop-opacity="0.97"></stop><stop offset="0.796" stop-color="#EBA118" stop-opacity="0.85"></stop>' +
    '<stop offset="1" stop-color="#EBA118" stop-opacity="0.55"></stop></linearGradient></defs>' +
    '<path d="M1488.64 193.04L1436.18 230.51A48.55 48.55 0 0 0 1429.75 236.01L1387.56 279"></path>' +
    '<path d="M1491.95 197.68L1439.5 235.15A42.85 42.85 0 0 0 1433.82 240L1389.65 285"></path>' +
    '<path d="M1495.27 202.32L1442.81 239.79A37.15 37.15 0 0 0 1437.89 244L1393.71 289"></path>' +
    '<path d="M1498.58 206.96L1446.12 244.43A31.45 31.45 0 0 0 1441.96 247.99L1397.77 293"></path>' +
    '</svg>';

  const PUSH_MS = 170;   // slide change, measured on the game: the new slide pushes the old one out sideways
  const reducedMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  let body = null, img = null, bars = [], index = 0, timer = 0;

  function slideBackground(s) {
    return "repeating-radial-gradient(circle at 30% 40%, rgba(255,255,255,0.06) 0 1px, rgba(255,255,255,0) 1px 4px)," +
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 6px, rgba(255,255,255,0) 6px 12px)," +
      "linear-gradient(115deg," + s.c1 + " 0%," + s.c2 + " 72%)";
  }

  function slideEl(s) {
    const el = document.createElement("div");
    el.className = "ef-news__img";
    el.style.background = slideBackground(s);
    el.textContent = s.caption;
    return el;
  }

  /** Shows slide i. Moving forward the new slide comes in from the right and pushes the old one out to the left
      (backwards the other way round), decelerating like the game's carousel. Autoplay and clicks on the frame
      always move forward, wrapping round; a page bar moves towards its slide. */
  function show(i, instant) {
    const next = (i + SLIDES.length) % SLIDES.length;
    const dir = i >= index ? 1 : -1;
    index = next;
    bars.forEach(function (bar, k) { bar.classList.toggle("is-on", k === index); });
    const incoming = slideEl(SLIDES[index]);
    Array.prototype.slice.call(body.children).forEach(function (el) { if (el !== img) el.remove(); });   // finish a push in flight
    body.appendChild(incoming);
    const outgoing = img;
    img = incoming;
    if (!outgoing) return;
    if (instant || (reducedMotion && reducedMotion.matches)) { outgoing.remove(); return; }
    const ease = { duration: PUSH_MS, easing: "cubic-bezier(.25,.7,.35,1)", fill: "forwards" };
    incoming.animate([{ transform: "translateX(" + 100 * dir + "%)" }, { transform: "translateX(0)" }], ease);
    outgoing.animate([{ transform: "translateX(0)" }, { transform: "translateX(" + -100 * dir + "%)" }], ease)
      .onfinish = function () { outgoing.remove(); };
  }

  function resume() {
    clearInterval(timer);
    timer = setInterval(function () { show(index + 1); }, INTERVAL_MS);
  }

  function pause() {
    clearInterval(timer);
  }

  /** layer: the frame's own layer; floor: the floor layer the belt lies on. */
  function mount(layer, floor) {
    floor.insertAdjacentHTML("beforeend", BELT);
    layer.insertAdjacentHTML("beforeend", HTML);
    const root = layer.lastElementChild;
    body = root.querySelector(".ef-news__body");
    bars = Array.prototype.slice.call(root.querySelectorAll(".ef-news__bar"));
    bars.forEach(function (bar, k) {
      bar.addEventListener("click", function (e) {
        e.stopPropagation();
        show(k);
        resume();
      });
    });
    root.querySelector(".ef-news__frame").addEventListener("click", function () {
      show(index + 1);
      resume();
    });
    show(0, true);
    resume();
  }

  EF.news = { mount, pause, resume };
})();
