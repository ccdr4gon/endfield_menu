/* Energy readout pill that sits just above the two yellow disc buttons. */
(function () {
  "use strict";
  const EF = window.EF;

  EF.addStyle("energy-pill", `
.ef-energy {
  position: absolute; left: 970px; top: 834px; z-index: 4; transform: translate(-50%, -50%);
  display: flex; align-items: center; gap: 7px; height: 32px; padding: 0 6px 0 10px;
  background: rgba(14,16,18,0.7); border-radius: 999px; color: #fff; white-space: nowrap;
}
.ef-energy__ic { width: 21px; height: 21px; border-radius: 4px; background: #F2F4F5; color: #101214; display: grid; place-items: center; }
.ef-energy__ic .ef-icon { width: 14px; height: 14px; }
.ef-energy b { font: 600 27px/1 var(--ef-font-en); margin-left: 8px; }
.ef-energy small { font: 500 14px/1 var(--ef-font-en); color: rgba(255,255,255,0.45); align-self: flex-end; margin-bottom: 7px; }
.ef-energy b.ef-energy__pct { margin-left: 34px; }
.ef-energy small.ef-energy__unit { margin-left: -2px; margin-bottom: 10px; font-size: 12px; }
.ef-energy__cell {
  width: 24px; height: 24px; border-radius: 50%; margin-left: 6px; display: grid; place-items: center;
  border: 2px solid #D4D23A; background: rgba(212,210,58,0.22); color: #E4E040;
}
.ef-energy__cell .ef-icon { width: 12px; height: 12px; }

/* Open and close, measured on the game's energy pill (times in this page's timeline, see index.html). Open: on, off, on
   with the player badge: up in 40 ms from 564 ms, held for 20 ms, cut off, dark for 48 ms, up again in 40 ms. Close:
   fades out at 96-156 ms while sinking 8 px (50-150 ms, power2 out). Its transform centres it, so the sink uses the
   own translate property. */
@media (prefers-reduced-motion: no-preference) {
  body.ef-in .ef-energy { animation: efEnergyBlink 148ms 564ms linear both; }
  body.ef-out .ef-energy { animation: efEnergyOut 60ms 96ms linear both, efEnergyDrop 100ms 50ms cubic-bezier(.333,1,.667,1) both; }
}
@keyframes efEnergyBlink { 0% { opacity: 0; } 27.03% { opacity: 1; animation-timing-function: step-end; } 40.54% { opacity: 0; animation-timing-function: step-end; } 72.97% { opacity: 0; } 100% { opacity: 1; } }
@keyframes efEnergyOut { to { opacity: 0; visibility: hidden; } }
@keyframes efEnergyDrop { to { translate: 0 8px; } }
`);

  const HTML = `
<div class="ef-energy">
  <span class="ef-energy__ic"><svg class="ef-icon"><use href="#ic-bolt"></use></svg></span>
  <b>7200</b><small>/9800</small>
  <b class="ef-energy__pct">100</b><small class="ef-energy__unit">%</small>
  <span class="ef-energy__cell"><svg class="ef-icon"><use href="#ic-bolt"></use></svg></span>
</div>`;

  function mount(layer) {
    layer.insertAdjacentHTML("beforeend", HTML);
  }

  EF.energy = { mount };
})();
