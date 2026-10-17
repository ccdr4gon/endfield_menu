/* Player badge in the bottom-left: avatar placeholder, name, level, UID and permission tier.
   All personal details are masked as "xxxxx". */
(function () {
  "use strict";
  const EF = window.EF;

  EF.addStyle("badge", `
.ef-badge {
  position: absolute; left: 289px; top: 850px; z-index: 4; width: 389px; height: 116px;
  --gold: #D5B983;
}
.ef-badge__plate {
  position: absolute; inset: 0; border-radius: 20px; overflow: hidden;
  background: linear-gradient(135deg, rgba(56,60,66,0.96) 0%, rgba(28,31,36,0.96) 48%, rgba(13,15,18,0.98) 100%);
  --ef-h: 16; --ef-shx0: 8; --ef-shy0: 9;
  box-shadow: inset 0 2px 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(255,255,255,0.05),
              inset 0 -10px 22px rgba(0,0,0,0.4),
              calc((var(--ef-shx0) + var(--ef-swx, 0) * var(--ef-h)) * 1px)
              calc((var(--ef-shy0) + var(--ef-swy, 0) * var(--ef-h)) * 1px)
              0 rgba(214,219,225,0.12);
}
/* Faint diagonal texture and a skyline silhouette fading in towards the right. */
.ef-badge__plate::before {
  content: ""; position: absolute; inset: 0; opacity: 0.6; pointer-events: none;
  background:
    repeating-linear-gradient(56deg, rgba(255,255,255,0.04) 0 2px, rgba(255,255,255,0) 2px 9px),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0 1px, rgba(0,0,0,0) 1px 14px);
  -webkit-mask: linear-gradient(90deg, rgba(0,0,0,0) 26%, #000 58%, #000 100%);
  mask: linear-gradient(90deg, rgba(0,0,0,0) 26%, #000 58%, #000 100%);
}
.ef-badge__plate::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 62%; pointer-events: none;
  background: rgba(255,255,255,0.045);
  clip-path: polygon(0 78%, 6% 78%, 6% 44%, 12% 44%, 12% 66%, 20% 66%, 20% 22%, 24% 22%, 24% 10%, 27% 10%, 27% 52%, 35% 52%, 35% 34%, 42% 34%, 42% 70%, 50% 70%, 50% 18%, 55% 18%, 55% 48%, 63% 48%, 63% 30%, 70% 30%, 70% 60%, 78% 60%, 78% 8%, 82% 8%, 82% 40%, 90% 40%, 90% 56%, 100% 56%, 100% 100%, 0 100%);
  -webkit-mask: linear-gradient(90deg, rgba(0,0,0,0) 30%, #000 60%, #000 100%);
  mask: linear-gradient(90deg, rgba(0,0,0,0) 30%, #000 60%, #000 100%);
}
.ef-badge__rim {
  position: absolute; inset: 0; border-radius: 20px; pointer-events: none; z-index: 3; padding: 2.5px;
  background: linear-gradient(90deg, rgba(213,185,131,0) 40%, rgba(213,185,131,0.5) 70%, var(--gold) 96%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
}
.ef-badge__streak {
  position: absolute; right: 0; top: 0; bottom: 0; width: 120px; pointer-events: none; z-index: 1;
  border-radius: 0 20px 20px 0;
  background: linear-gradient(90deg, rgba(213,185,131,0) 0%, rgba(213,185,131,0.08) 55%, rgba(213,185,131,0.16) 100%);
}
.ef-badge__inner {
  position: absolute; inset: 0; z-index: 2; display: grid; grid-template-columns: 88px 1fr auto; gap: 16px;
  align-items: center; padding: 0 0 0 16px; color: #fff;
}
.ef-badge__avatar {
  width: 84px; height: 84px; position: relative; display: grid; place-items: center;
  font: 10px var(--ef-font-mono); letter-spacing: 0.1em; color: rgba(255,255,255,0.55);
  background: repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 7px, rgba(255,255,255,0) 7px 14px), rgba(255,255,255,0.05);
  border: 1px dashed rgba(255,255,255,0.25);
  box-shadow: 0 0 12px rgba(140,235,195,0.22), 0 0 3px rgba(140,235,195,0.3);
}
.ef-badge__avatar::before {
  content: ""; position: absolute; left: -5px; top: -5px; width: 26px; height: 26px; z-index: 2;
  border-left: 2px solid rgba(140,235,195,0.85); border-top: 2px solid rgba(140,235,195,0.85);
}
.ef-badge__avatar::after {
  content: ""; position: absolute; right: -5px; bottom: -5px; width: 16px; height: 16px;
  border-right: 2px solid rgba(140,235,195,0.85); border-bottom: 2px solid rgba(140,235,195,0.85);
}
.ef-badge__chip { position: absolute; right: 4px; bottom: 4px; width: 6px; height: 6px; background: rgba(140,235,195,0.95); }
.ef-badge__scan {
  position: absolute; left: 6px; top: 14px; bottom: 14px; width: 8px; opacity: 0.65;
  background: repeating-linear-gradient(0deg, rgba(140,235,195,0.6) 0 2px, rgba(140,235,195,0) 2px 5px, rgba(140,235,195,0.35) 5px 6px, rgba(140,235,195,0) 6px 11px);
}
.ef-badge__mid { min-width: 0; }
.ef-badge__name { font-size: 24px; font-weight: 700; letter-spacing: 0.06em; line-height: 1.1; }
.ef-badge__sub { font-family: var(--ef-font-mono); font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.18em; margin-top: 1px; }
.ef-badge__lv { font-family: var(--ef-font-en); font-weight: 700; font-size: 40px; line-height: 1; margin-top: 2px; }
.ef-badge__bar { height: 4px; width: 140px; margin-top: 3px; border-radius: 2px; background: linear-gradient(90deg, var(--gold) 86%, rgba(213,185,131,0.15)); }
.ef-badge__uid { font-family: var(--ef-font-mono); font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 4px; }
/* Permission tier: the text, then the tier tab. As in the game, the row sits below the plate's middle and the tab
   stops short of the plate's right edge. */
.ef-badge__perm { position: relative; display: flex; align-items: center; align-self: start; height: 56px; margin: 43.5px 14.5px 0 0; }
.ef-badge__permtxt { text-align: right; line-height: 1.25; }
.ef-badge__permtxt small { display: block; font-size: 13px; color: rgba(255,255,255,0.85); letter-spacing: 0.08em; }
.ef-badge__permtxt b { display: block; font-size: 16px; color: var(--gold); letter-spacing: 0.08em; }
/* The tab: a dark pill with a round right end and a near-black edge, fading out to the left behind the text. */
.ef-badge__pill {
  position: absolute; z-index: -1; top: 0; right: 0; width: 94px; height: 56px;
  border: 1.5px solid #0A0A0A; border-left: 0; border-radius: 0 28px 28px 0; background: #191919;
  -webkit-mask: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 15%, rgba(0,0,0,0.62) 30%, rgba(0,0,0,0.8) 47%, #000 64%);
  mask: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 15%, rgba(0,0,0,0.62) 30%, rgba(0,0,0,0.8) 47%, #000 64%);
}
/* The tier emblem (button-art.js) and the arrow after it, in the 60 x 56 box at the tab's round end. */
.ef-badge__tier { display: block; width: 60px; height: 56px; margin-left: 9.5px; fill: var(--gold); }

/* Open and close, measured on the game's profile card (times in this page's timeline, see index.html; the power button
   in hud.js shares this beat). Open: last to come, on, off, on: up in 40 ms, held for 20 ms, cut off, dark for about
   45 ms, then up again in 40 ms (565-710 ms); each segment's easing is in the keyframes. Close: fades out at 75-150 ms
   while sinking (5.3, 9.3) px to the lower right (50-150 ms, power2 out). The badge's transform belongs to the scene
   (data-ef-z), so it only moves by its own translate. */
@media (prefers-reduced-motion: no-preference) {
  body.ef-in .ef-badge { animation: efBadgeBlink 145ms 565ms linear both; }
  body.ef-out .ef-badge { animation: efBadgeOut 75.6ms 74.6ms linear both, efBadgeDrop 100ms 50ms cubic-bezier(.3333,1,.6667,1) both; }
}
@keyframes efBadgeBlink {
  0% { opacity: 0; animation-timing-function: linear; }
  27.59% { opacity: 1; animation-timing-function: step-end; }
  41.38% { opacity: 0; animation-timing-function: step-end; }
  72.41% { opacity: 0; animation-timing-function: linear; }
  100% { opacity: 1; }
}
@keyframes efBadgeOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes efBadgeDrop { from { translate: 0px 0px; } to { translate: 5.3px 9.3px; } }
`);

  const HTML = `
<div class="ef-badge">
  <div class="ef-badge__plate" data-ef-shadow=""></div>
  <div class="ef-badge__streak"></div>
  <div class="ef-badge__rim"></div>
  <div class="ef-badge__inner">
    <div class="ef-badge__avatar">avatar<i class="ef-badge__scan"></i><i class="ef-badge__chip"></i></div>
    <div class="ef-badge__mid">
      <div class="ef-badge__name">xxxxx</div>
      <div class="ef-badge__sub">[ X · · · ]</div>
      <div class="ef-badge__lv">60</div>
      <div class="ef-badge__bar"></div>
      <div class="ef-badge__uid">UID:xxxxx</div>
    </div>
    <div class="ef-badge__perm">
      <i class="ef-badge__pill"></i>
      <div class="ef-badge__permtxt"><small>权限等阶</small><b>满级</b></div>
      <svg class="ef-badge__tier" viewBox="0 0 60 56" aria-hidden="true"><use href="#art-badge-tier"></use><path d="M39.15 22.55L49.35 28.45L39.15 34.35Z"></path></svg>
    </div>
  </div>
</div>`;

  function mount(layer) {
    layer.insertAdjacentHTML("beforeend", HTML);
    EF.scene.attach(layer.lastElementChild, 30);
  }

  EF.badge = { mount };
})();
