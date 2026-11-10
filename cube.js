(function () {
  const roots = [].slice.call(document.querySelectorAll("[data-cube]"));
  if (!roots.length) return;

  const FACE_CLASS = { px: "pos-x", nx: "neg-x", py: "pos-y", ny: "neg-y", pz: "pos-z", nz: "neg-z" };

  // y:-1 is the top layer — the one that twists. Faces carry the sprite name,
  // or [base, product] when the reaction swaps it out.
  const CUBIES = [
    { x: -1, y: -1, z: 1, pz: "na", ny: "fire", nx: "o" },
    { x: 1, y: -1, z: 1, pz: "h2", ny: "s", px: "flask" },
    { x: -1, y: -1, z: -1, ny: "c", nx: "fe", nz: "co2" },
    // a -90° twist lands this cubie at (1,-1,1), putting its px face out front,
    // directly above the H tile below it
    { x: 1, y: -1, z: -1, ny: "t", nz: "burst", px: { sprite: "cl", swap: "burst", pair: true } },
    { x: -1, y: 1, z: 1, pz: { sprite: "bug_alarm", swap: "bug_dead" }, nx: "rust" },
    { x: 1, y: 1, z: 1, pz: { sprite: "h", swap: "hcl", pair: true }, px: "o2" },
    { x: -1, y: 1, z: -1, nx: "na", nz: "h2o", py: "nacl" },
    { x: 1, y: 1, z: -1, px: "fire", nz: "er", py: "t" },
  ];

  function lcd(value) {
    if (!value) return '<div class="lcd empty"></div>';
    const cfg = typeof value === "string" ? { sprite: value } : value;
    const src = (n) => 'assets/sprites/' + n + '.png';
    let html = '<div class="lcd' + (cfg.pair ? " pair" : "") + '">';
    html += '<img class="base" src="' + src(cfg.sprite) + '" alt="">';
    if (cfg.swap) html += '<img class="swap" src="' + src(cfg.swap) + '" alt="">';
    return html + "</div>";
  }

  // the face pointing at the cube's core is never lit
  function innerKey(axis, sign) {
    if (axis === "x") return sign === -1 ? "px" : "nx";
    if (axis === "y") return sign === -1 ? "py" : "ny";
    return sign === -1 ? "pz" : "nz";
  }

  function cubieHtml(c) {
    const faces = [];
    Object.keys(FACE_CLASS).forEach(function (k) {
      if (Object.prototype.hasOwnProperty.call(c, k)) {
        faces.push('<div class="face ' + FACE_CLASS[k] + '">' + lcd(c[k]) + "</div>");
      }
    });
    ["x", "y", "z"].forEach(function (axis) {
      faces.push('<div class="face inner ' + FACE_CLASS[innerKey(axis, c[axis])] + '"></div>');
    });
    return '<div class="cubie" style="--x:' + c.x + ";--y:" + c.y + ";--z:" + c.z + '">' + faces.join("") + "</div>";
  }

  const layer = (name, y) =>
    '<div class="layer layer-' + name + '">' +
    CUBIES.filter((c) => c.y === y).map(cubieHtml).join("") +
    "</div>";

  const markup = layer("top", -1) + layer("bottom", 1);
  roots.forEach(function (r) { r.innerHTML = markup; });

  // --- scroll phases -------------------------------------------------------
  const mech = document.querySelector("[data-mech]");
  const hud = document.querySelector("[data-hud]");
  if (!mech) return;

  const steps = [].slice.call(mech.querySelectorAll(".mech-step"));
  if (!steps.length) return;

  function setPhase(step) {
    steps.forEach((s) => s.removeAttribute("data-active"));
    step.setAttribute("data-active", "");
    mech.setAttribute("data-phase", step.dataset.phase);
    if (hud) hud.textContent = step.dataset.hud || "";
  }

  setPhase(steps[0]);

  // fires on whichever step owns the middle band of the viewport
  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setPhase(e.target);
      });
    },
    { rootMargin: "-48% 0px -48% 0px" }
  );
  steps.forEach((s) => io.observe(s));
})();
