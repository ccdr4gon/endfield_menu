/* HUD controls: system buttons (top left), power button (bottom left), close button (top right)
   and the flat network/UID readout in the bottom-left corner of the screen. */
(function () {
  "use strict";
  const EF = window.EF;

  EF.addStyle("hud", `
.ef-sysbtns { position: absolute; top: 56px; left: 271px; display: flex; gap: 43px; z-index: 4; pointer-events: auto; }
.ef-sysbtn {
  width: 72px; height: 84px; display: grid; place-items: center; position: relative;
  color: rgba(255,255,255,0.92); transition: color 0.15s, transform 0.15s;
}
.ef-sysbtn:hover { color: #fff; transform: translateY(-1px); }
.ef-sysbtn .ef-icon { width: 69px; height: 69px; }
.ef-sysbtn::before {
  content: ""; position: absolute; left: 50%; bottom: 0; width: 52px; height: 4px;
  margin-left: -26px; background: rgba(255,255,255,0.3);
}
.ef-sysbtn .ef-dot { left: 66px; top: 15px; }

/* Power button, measured on the game's screenshot: a plate of salmon stripes that stays see-through between them,
   sheared a little like the game's (the matrix), a faint striped back plate that leans with the camera, and the glyph
   at 78% with a soft dark shadow around it (efPowerGlow). The box sits on whole device pixels at 2x, where Chromium
   snaps it anyway. */
.ef-power {
  position: absolute; left: 202px; top: 875.5px; z-index: 4; width: 53px; height: 53px;
  color: rgb(237,237,232); pointer-events: auto; cursor: pointer;
  transform: matrix(1, -0.029, -0.02, 1, 0, 0);
  transition: filter 0.15s;
}
.ef-power:hover { filter: brightness(1.45); }
.ef-power__plate, .ef-power__sh {
  position: absolute; inset: 0; border-radius: 4px; pointer-events: none;
  background: repeating-linear-gradient(134.5deg, transparent 0.3px 1.55px, var(--ef-pw-ink) 2.55px 3.84px, transparent 4.842px);
}
.ef-power__plate { --ef-pw-ink: #C34142; background-color: rgba(8,6,6,0.13); }
.ef-power__sh {
  --ef-pw-ink: rgba(60,0,0,0.12);
  --ef-h: 16; --ef-shx0: 8.45; --ef-shy0: 5.5;
  transform: translate(calc((var(--ef-shx0) + var(--ef-swx, 0) * var(--ef-h)) * 1px),
                       calc((var(--ef-shy0) + var(--ef-swy, 0) * var(--ef-h)) * 1px));
}
.ef-power .ef-icon { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }

.ef-close {
  position: absolute; left: var(--x); top: var(--y); width: 44px; height: 44px; margin: -22px 0 0 -22px;
  border-radius: 50%; padding: 3px; pointer-events: auto;
  border: 2.5px solid rgba(255,255,255,0.92); transition: transform 0.15s;
}
.ef-close span {
  display: grid; place-items: center; width: 100%; height: 100%; border-radius: 50%;
  background: #F4F5F6; color: #111315;
}
.ef-close .ef-icon { width: 21px; height: 21px; stroke-width: 4; }
.ef-close:hover { transform: scale(1.06); }

.ef-netinfo {
  position: absolute; left: 27px; top: 1046px; display: flex; align-items: center; gap: 6px;
  font: 500 15px/1 var(--ef-font-cn); color: rgba(255,255,255,0.9); pointer-events: none;
}
.ef-netinfo .ef-icon { width: 15px; height: 13px; }
.ef-netinfo span + span { margin-left: 22px; color: rgba(255,255,255,0.55); }

/* Open and close, measured on the game's menu (times in this page's timeline, see index.html). Moves use the own
   translate property only: the system buttons' transform is their hover, the power button's its shear.
   - System buttons (settings, mail, alerts): from 390 ms they flicker on by steps on a 50 ms grid (step-end: each level
     holds until the next). Mail comes first (0.3, full at 415 ms) and settles from (4, 1.3) px below right in 60 ms;
     alerts follow at 0.36 / 0.24 / 0.98; settings only shows at 515 ms and blinks off once at 615-665 ms with the badge.
     On close, mail and alerts drop to 0.67 at 75 ms and are gone at 125 ms, drifting (-3, 3) px; settings is at 0.93
     at 125 ms, gone at 175 ms, and flies towards the screen centre by (20, 15) px.
   - The power button blinks on and off with the badge (efBadgeBlink, player-badge.js) and on close fades out at 75-150
     ms while sinking (5.3, 9.3) px to the lower right.
   - The close button flickers on at 375 ms (0.76) while sliding in from (-8, 4.8) px, goes out at 425 ms and is back for
     good at 475 ms; on close it steps down to 0.64 at 75 ms and is gone at 125 ms, drifting (4.5, 1.5) px.
   - The network line is not animated: the game shows it all the time. */
@media (prefers-reduced-motion: no-preference) {
  body.ef-in .ef-sysbtn:nth-child(1) { animation: efSysGearIn 350ms 390ms step-end both; }
  body.ef-in .ef-sysbtn:nth-child(2) { animation: efSysMailIn 350ms 390ms step-end both, efSysMailNudge 59.5ms 390ms cubic-bezier(.3333,1,.6667,1) both; }
  body.ef-in .ef-sysbtn:nth-child(3) { animation: efSysNoticeIn 350ms 390ms step-end both; }
  body.ef-in .ef-power { animation: efBadgeBlink 145ms 565ms linear both; }
  body.ef-in .ef-close { animation: efCloseIn 260ms 290ms step-end both, efCloseSlide 75ms 375ms linear both; }
  body.ef-out .ef-sysbtn:nth-child(1) { animation: efSysGearOut 200ms 0ms step-end both, efSysGearFly 125ms 50ms linear both; }
  body.ef-out .ef-sysbtn:nth-child(n+2) { animation: efSysOut 200ms 0ms step-end both, efSysDrift 75ms 50ms linear both; }
  body.ef-out .ef-power { animation: efBadgeOut 75.6ms 74.6ms linear both, efBadgeDrop 100ms 50ms cubic-bezier(.3333,1,.6667,1) both; }
  body.ef-out .ef-close { animation: efCloseOut 160ms 50ms step-end both, efCloseDrift 75ms 50ms linear both; }
}
@keyframes efSysMailIn { 0% { opacity: 0; } 0.1% { opacity: 0.3; } 7.1%, 100% { opacity: 1; } }
@keyframes efSysMailNudge { from { translate: 4px 1.3px; } to { translate: 0px 0px; } }
@keyframes efSysNoticeIn { 0% { opacity: 0; } 21.4% { opacity: 0.36; } 35.7% { opacity: 0.24; } 50% { opacity: 0.98; } 100% { opacity: 1; } }
@keyframes efSysGearIn { 0% { opacity: 0; } 35.7% { opacity: 0.78; } 50% { opacity: 0.92; } 64.3% { opacity: 0; } 78.6% { opacity: 0.74; } 92.9% { opacity: 0.95; } 100% { opacity: 1; } }
@keyframes efSysOut { 0% { opacity: 1; } 37.5% { opacity: 0.67; } 62.5%, 100% { opacity: 0; } }
@keyframes efSysDrift { from { translate: 0px 0px; } to { translate: -3px 3px; } }
@keyframes efSysGearOut { 0% { opacity: 1; } 62.5% { opacity: 0.93; } 87.5%, 100% { opacity: 0; } }
@keyframes efSysGearFly { 0% { translate: 0px 0px; } 40% { translate: -2px 2px; } 80% { translate: 13px 10px; } 100% { translate: 20px 15px; } }
@keyframes efCloseIn { 0% { opacity: 0; visibility: hidden; } 32.7% { opacity: 0.76; visibility: visible; } 51.9% { opacity: 0; visibility: hidden; } 71.2%, 100% { opacity: 1; visibility: visible; } }
@keyframes efCloseSlide { from { translate: -8px 4.8px; } to { translate: 0px 0px; } }
@keyframes efCloseOut { 0% { opacity: 1; } 15.6% { opacity: 0.64; } 46.9%, 100% { opacity: 0; visibility: hidden; } }
@keyframes efCloseDrift { from { translate: 0px 0px; } to { translate: 4.5px 1.5px; } }
`);

  const SYS_HTML = `
<div class="ef-sysbtns">
  <button class="ef-sysbtn" data-action="settings" title="设置"><svg class="ef-icon"><use href="#ic-gear-f"></use></svg></button>
  <button class="ef-sysbtn" data-action="mail" title="邮件"><svg class="ef-icon"><use href="#ic-mail-f"></use></svg></button>
  <button class="ef-sysbtn" data-action="alerts" title="警报"><svg class="ef-icon"><use href="#ic-warn-f"></use></svg><i class="ef-dot"></i></button>
</div>`;
  /** The glyph's shadow: a soft dark halo dropped slightly downwards and kept outside the glyph, so the stripes still
      show through it; the glyph itself is drawn at 78%. */
  const POWER_GLOW = '<filter id="efPowerGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.2"></feGaussianBlur><feOffset dy="1.9"></feOffset><feComposite in2="SourceAlpha" operator="out"></feComposite><feComponentTransfer result="glow"><feFuncA type="linear" slope="0.62"></feFuncA></feComponentTransfer><feComponentTransfer in="SourceGraphic"><feFuncA type="linear" slope="0.78"></feFuncA></feComponentTransfer><feMerge><feMergeNode in="glow"></feMergeNode><feMergeNode></feMergeNode></feMerge></filter>';
  const POWER_HTML = `<button class="ef-power" data-action="close" title="关闭菜单"><i class="ef-power__sh" data-ef-shadow=""></i><i class="ef-power__plate"></i><svg class="ef-icon"><defs>${POWER_GLOW}</defs><use href="#ic-power" x="2.7" y="2.52" width="48" height="48" filter="url(#efPowerGlow)"></use></svg></button>`;
  const CLOSE_HTML = `<button class="ef-close" data-action="close" title="关闭" style="--x: 1803px; --y: 92px;"><span><svg class="ef-icon"><use href="#ic-x"></use></svg></span></button>`;
  const NET_HTML = `<div class="ef-netinfo"><svg class="ef-icon"><use href="#ic-signal"></use></svg><span>82ms</span><span>UID: xxxxx</span></div>`;

  /** hosts: { cards, tiles } scene layers and the flat stage for the screen-space readout. */
  function mount(hosts) {
    hosts.cards.insertAdjacentHTML("beforeend", SYS_HTML + POWER_HTML);
    hosts.tiles.insertAdjacentHTML("beforeend", CLOSE_HTML);
    hosts.stage.insertAdjacentHTML("beforeend", NET_HTML);
  }

  EF.hud = { mount };
})();
