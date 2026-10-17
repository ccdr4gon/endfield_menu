/* 3D scene: one perspective camera looking down at a tilted "world" plane.
   Components mount into flat layers that float at different heights above that plane. Each layer is
   compensated (translateY + scale) so its content still lands on its 2D layout coordinates when seen
   from the default pitch. Moving the mouse sways the camera through a small spring, and every element
   tagged data-ef-shadow leans its drop shadow with the view angle. */
(function () {
  "use strict";
  const EF = (window.EF = window.EF || {});

  const CAM = {
    D: 1600,          // perspective distance in px (same as .ef-scene)
    pitch: 20,        // resting rotateX of the world plane, deg
    shift: [29, -40], // the world's resting offset and roll (same as .ef-world's transform)
    roll: -1,
    maxYaw: 4,        // mouse sway range, deg
    maxPitch: 2.5,
    springK: 8e-3,
    springDamp: 0.8,
  };
  /** Heights of the parts that live inside the disc cylinder (disc.js); level = where the level pill appears at rest. */
  const PARTS = { well: -130, level: 60 };
  /** Layers from back to front, with their height above the plane. The news frame sits just above the dial's
      white arcs (50) and the tips of its flags (about 70), which it covers in the game; the readouts on top
      (currencies, stamina, like the exploration level pill) are the highest parts and drift the most when the
      camera sways. */
  const LAYERS = { deck: 0, core: 0, btns: 26, tiles: 28, cards: 34, news: 72, top: 144 };
  const SHADOW_STEPS = 100;   // shadow lean is quantized, so a settled camera restyles nothing

  EF.addStyle("scene", `
@property --ef-cam-rx { syntax: '<angle>'; inherits: false; initial-value: 20deg; }
@property --ef-cam-ry { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
@property --ef-swx { syntax: '<number>'; inherits: false; initial-value: 0; }
@property --ef-swy { syntax: '<number>'; inherits: false; initial-value: 0; }

.ef-scene {
  position: absolute; inset: 0;
  transform: scale(var(--ef-zoom, 1));
  perspective: 1600px; perspective-origin: 50% 50%;
}
.ef-world {
  position: absolute; inset: 0; transform-style: preserve-3d; transform-origin: 50% 50%;
  transform: translate(29px, -40px) rotateZ(-1deg) rotateX(var(--ef-cam-rx)) rotateY(var(--ef-cam-ry));
}
.ef-lyr { position: absolute; inset: 0; pointer-events: none; }
.ef-lyr, [data-ef-z] {
  transform: translateZ(calc(var(--z, 0) * 1px)) translate(calc(var(--ctx, 0) * 1px), calc(var(--cty, 0) * 1px)) scale(var(--cs, 1));
}
/* The camera takes no part in opening and closing: the disc poses on its own layer (disc.js) and every other part
   comes and goes in place. */
`);

  let worldEl = null;
  const layers = {};
  const cam = { rx: CAM.pitch, ry: 0 };
  const vel = { rx: 0, ry: 0 };
  const target = { rx: CAM.pitch, ry: 0 };
  const writtenLean = { x: "", y: "" };
  let rafId = 0;
  let listening = false;
  const reducedMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  /** The camera in the world's own coordinates at the resting pitch: undo the world's offset, roll and pitch on
      the eye point (the scene's centre, CAM.D in front of it). */
  const EYE = (function () {
    const r = -CAM.roll * Math.PI / 180, p = -CAM.pitch * Math.PI / 180;
    const x0 = -CAM.shift[0], y0 = -CAM.shift[1];
    const x1 = x0 * Math.cos(r) - y0 * Math.sin(r), y1 = x0 * Math.sin(r) + y0 * Math.cos(r);
    return { x: 960 + x1, y: 540 + y1 * Math.cos(p) - CAM.D * Math.sin(p), z: y1 * Math.sin(p) + CAM.D * Math.cos(p) };
  })();

  /** Lifts an element to height z. Compensation keeps it on its 2D coordinates at the resting pitch: the lift is
      undone by scaling towards the camera, so every point of the element still lies on the same line of sight.
      Parts inside the disc cylinder opt out ({ comp: false }) so they stack like a real cylinder, and { rest: h }
      makes a part float at z while still looking at rest as if it stood at height h. */
  function attach(el, z, opts) {
    const rest = opts && opts.comp === false ? z : (opts && opts.rest != null ? opts.rest : 0);
    const k = (EYE.z - z) / (EYE.z - rest);
    let ox = el.offsetWidth / 2, oy = el.offsetHeight / 2;           // its transform origin, in world coordinates
    for (let n = el; n && n !== worldEl; n = n.offsetParent) { ox += n.offsetLeft; oy += n.offsetTop; }
    el.setAttribute("data-ef-z", "");
    el.style.setProperty("--z", String(z));
    el.style.setProperty("--ctx", ((1 - k) * (EYE.x - ox)).toFixed(2));
    el.style.setProperty("--cty", ((1 - k) * (EYE.y - oy)).toFixed(2));
    el.style.setProperty("--cs", k.toFixed(4));
  }

  function applyCamera() {
    worldEl.style.setProperty("--ef-cam-rx", cam.rx.toFixed(3) + "deg");
    worldEl.style.setProperty("--ef-cam-ry", cam.ry.toFixed(3) + "deg");
    const leanX = -Math.tan(cam.ry * Math.PI / 180) * 1.6;
    const leanY = Math.tan((cam.rx - CAM.pitch) * Math.PI / 180) * 1.6;
    const qx = (Math.round(leanX * SHADOW_STEPS) / SHADOW_STEPS).toFixed(3);
    const qy = (Math.round(leanY * SHADOW_STEPS) / SHADOW_STEPS).toFixed(3);
    if (qx === writtenLean.x && qy === writtenLean.y) return;
    writtenLean.x = qx;
    writtenLean.y = qy;
    worldEl.querySelectorAll("[data-ef-shadow]").forEach(function (el) {
      el.style.setProperty("--ef-swx", qx);
      el.style.setProperty("--ef-swy", qy);
    });
  }

  function tick() {
    const dx = target.rx - cam.rx, dy = target.ry - cam.ry;
    vel.rx = (vel.rx + dx * CAM.springK) * CAM.springDamp;
    vel.ry = (vel.ry + dy * CAM.springK) * CAM.springDamp;
    const settled = Math.abs(dx) < 2e-3 && Math.abs(dy) < 2e-3 && Math.abs(vel.rx) < 6e-4 && Math.abs(vel.ry) < 6e-4;
    if (settled) {
      cam.rx = target.rx;
      cam.ry = target.ry;
      vel.rx = 0;
      vel.ry = 0;
      applyCamera();
      rafId = 0;
      return;
    }
    cam.rx += vel.rx;
    cam.ry += vel.ry;
    applyCamera();
    rafId = requestAnimationFrame(tick);
  }

  function onMouseMove(e) {
    const mx = e.clientX / window.innerWidth * 2 - 1;
    const my = e.clientY / window.innerHeight * 2 - 1;
    target.rx = CAM.pitch + my * CAM.maxPitch;
    target.ry = -mx * CAM.maxYaw;
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function init() {
    worldEl = document.getElementById("efWorld");
    Object.keys(LAYERS).forEach(function (name) {
      const layer = document.createElement("div");
      layer.className = "ef-lyr";
      layer.dataset.lyr = name;
      worldEl.appendChild(layer);
      layers[name] = layer;
      attach(layer, LAYERS[name]);
    });
    applyCamera();
    resume();
  }

  function resume() {
    if (listening || (reducedMotion && reducedMotion.matches)) return;   // reduced motion: keep the camera still
    document.addEventListener("mousemove", onMouseMove);
    listening = true;
  }

  function pause() {
    document.removeEventListener("mousemove", onMouseMove);
    listening = false;
    cancelAnimationFrame(rafId);
    rafId = 0;
    vel.rx = 0;
    vel.ry = 0;
  }

  EF.scene = {
    CAM,
    PARTS,
    LAYERS,
    init,
    attach,
    pause,
    resume,
    layer: function (name) { return layers[name]; },
  };
})();
